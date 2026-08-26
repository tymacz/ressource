# Plan de sécurisation — (RE)Sources Relationnelles

Ce document couvre le run sécurité du projet (bloc AL3) : l'identification des vulnérabilités réellement présentes dans le dépôt au moment de l'audit, leur cotation, les choix de chiffrement, les bonnes pratiques de développement mises en place, et la méthodologie de continuité/reprise d'activité.

Date de l'audit : 2026-08-25. Commit de référence : branche `feature/durcissement-dependances`.

## 1. Identification des vulnérabilités

L'audit a combiné une analyse de dépendances (`pnpm audit`) et une revue manuelle ciblée du code (authentification, autorisation, gestion des secrets, hygiène du dépôt).

### 1.1 Dépendances

| # | Constat | Détail |
|---|---|---|
| V1 | 2 CVE **critiques** dans la chaîne d'authentification | `better-auth` < 1.6.11 (rejeu de refresh-token OAuth, [GHSA-pw9m-5jxm-xr6h](https://github.com/advisories/GHSA-pw9m-5jxm-xr6h)) et `@auth/core` < 0.41.3 via `@auth/prisma-adapter` (bypass homoglyphe de normalisation d'e-mail, [GHSA-7rqj-j65f-68wh](https://github.com/advisories/GHSA-7rqj-j65f-68wh)) |
| V2 | 5 paquets npm installés par erreur | `add`, `avatar`, `button`, `dropdown-menu`, `sheet` étaient déclarés comme vraies dépendances alors que les composants shadcn correspondants existent déjà localement dans `src/components/ui/`. Aucun import ne les référence. Ils tiraient des dépendances transitives vulnérables (`static-eval`, `jpeg-js` — High) |
| V3 | Outil CLI classé en dépendance de production | `shadcn` (scaffolding, jamais importé) était dans `dependencies` et embarquait toute une arborescence (`@modelcontextprotocol/sdk`, `express-rate-limit`, `ajv`, `hono`...) exposée en production sans raison |
| V4 | CVE High multiples sur `next` | DoS Server Components, bypass de middleware (paramètre de route dynamique, segment-prefetch, i18n Pages Router) — corrigées en 15.5.16+ |
| V5 | CVE High/Moderate sur dépendances transitives figées par `next`/`prisma`/`better-auth` | `postcss` (lecture arbitraire de fichier via sourceMappingURL, XSS), `sharp`/libvips, `nanoid`, `@babel/core`, `vite` (outillage de test embarqué par `better-auth`), `deepmerge-ts` |

**Correctifs appliqués** (voir commit `fix(deps): remove vulnerable/erroneous packages, patch critical CVEs`) :
- Suppression des 5 paquets erronés (V2).
- Déplacement de `shadcn` en `devDependencies` (V3).
- Mise à jour de `better-auth` → 1.7.1 et `@auth/prisma-adapter` → 2.11.3 (V1).
- Mise à jour de `next` → 15.5.24 (V4).
- `pnpm.overrides` pour forcer les versions patchées des dépendances transitives figées (V5), et ajout de `vite` en devDependency directe pour satisfaire le peer-range de `vitest`.

**Résultat mesuré** : `pnpm audit --prod` passe de **2 critiques + 21 high + 35 moderate + 4 low** à **0 vulnérabilité**, toutes sévérités confondues, sur le périmètre effectivement livré en production. Les vulnérabilités restantes en `devDependencies` (ESLint tooling, Vitest/Vite) ne sont jamais exécutées en production et restent sous surveillance via Dependabot (§4).

Vérification de non-régression après ces changements : `pnpm typecheck` ✅, `pnpm test` (8/8) ✅, `pnpm build` ✅.

### 1.2 Application

| # | Constat | Détail |
|---|---|---|
| V6 | Secret d'authentification par défaut utilisable en production | `src/env.js` définissait `BETTER_AUTH_SECRET` avec un `.default("local-development-secret-change-me")` **sans exclusion en production**, contrairement à `DATABASE_URL` qui exige déjà une vraie valeur en prod. Un déploiement oubliant de positionner la variable d'environnement aurait démarré silencieusement avec un secret connu, publiquement visible dans l'historique git — compromission totale des sessions et jetons signés |
| V7 | Absence de limitation de débit sur l'authentification | Aucune configuration `rateLimit` sur Better Auth : `/connexion` et `/inscription` étaient exposées au brute force et au credential stuffing sans limite applicative |
| V8 | Client Prisma généré (avec binaires compilés) versionné dans git | `generated/prisma/` était suivi par git, y compris des binaires `query_engine-*.node` pour Windows, macOS (arm64) et Linux (RHEL/OpenSSL) — artefact de build qui n'a rien à faire en contrôle de version (poids du dépôt, dérive possible entre le binaire committé et le schéma réel, mauvaise pratique de supply chain) |
| — | Contrôle d'accès serveur (RBAC tRPC) | **Point positif confirmé, pas une vulnérabilité** : chaque procédure du back-office (`src/server/api/routers/admin.ts`) est déjà protégée au bon niveau (`staffProcedure`, `moderationProcedure`, `catalogueAdminProcedure`, `superAdminProcedure`), avec vérification serveur systématique du rôle avant tout accès en base — conforme à `docs/architecture.md` |

**Correctifs appliqués** :
- `src/env.js` : `BETTER_AUTH_SECRET` exige désormais une vraie valeur (`min(32)` caractères) dès que `NODE_ENV=production`, sans repli silencieux sur la valeur de développement. Vérifié : un `pnpm build` en mode production sans la variable échoue explicitement (`Invalid environment variables`), et réussit dès qu'un secret réel est fourni.
- `src/server/better-auth/config.ts` : ajout d'une limitation de débit (`rateLimit`) — 30 requêtes/min par défaut sur l'ensemble des routes d'auth, règle spécifique à 5 tentatives/min sur `/sign-in/email` et `/sign-up/email`. Vérifié en conditions réelles : 5 tentatives de connexion acceptées (401 attendu pour un mauvais mot de passe), la 6ᵉ renvoie `429 Too Many Requests`.
- `.gitignore` + `git rm --cached` sur `generated/prisma/` : le client n'est plus versionné, il reste régénéré par le script `postinstall` (`prisma generate`), déjà en place.

### 1.3 Constats non corrigés dans cette itération (dette assumée, à traiter avant mise en production réelle)

- Le mot de passe compte utilisateur n'est pas encore vérifié par e-mail à l'inscription (hors périmètre fonctionnel actuel, déjà noté dans `docs/cahier-des-charges.md`).
- Une dépendance interne de `better-auth` (`better-call`) attend `zod@^4` alors que le projet utilise `zod@^3` : avertissement peer-dependency sans impact fonctionnel observé, à traiter dans une passe dédiée de montée de version de `zod` (changements d'API non triviaux sur l'ensemble des schémas Zod du projet).
- Le stockage du rate-limiting est en mémoire par instance (par défaut Better Auth) : suffisant pour un déploiement mono-instance, mais à faire évoluer vers un stockage partagé (`database` ou secondaire) avant un déploiement multi-instance/serverless (voir plan de déploiement).

## 2. Risques et criticité

```mermaid
quadrantChart
    title Matrice des risques identifiés (après correctifs de la section 1)
    x-axis Faible Probabilité --> Forte Probabilité
    y-axis Faible Impact --> Fort Impact
    quadrant-1 Critique
    quadrant-2 Surveiller
    quadrant-3 Acceptable
    quadrant-4 A traiter en priorité
    V7 - Brute force auth (residuel): [0.3, 0.55]
    V6 - Secret par defaut (residuel): [0.15, 0.5]
    V1 - CVE critiques auth (corrige): [0.1, 0.2]
    V2/V3 - Paquets errones (corrige): [0.1, 0.15]
    V8 - Binaires en git (corrige): [0.15, 0.1]
    Zod v3 vs v4 (dette): [0.2, 0.15]
    Stockage rate-limit memoire: [0.35, 0.3]
    Verification email absente: [0.4, 0.4]
```

| Risque | Probabilité (avant / après correctif) | Impact | Criticité résiduelle |
|---|---|---|---|
| V1 — CVE critiques better-auth/@auth-core | Élevée → Faible | Critique | **Résiduelle faible** (patché, sous Dependabot) |
| V2/V3 — Paquets npm erronés en production | Élevée → Nulle | Élevé | **Résiduelle nulle** (supprimés) |
| V4 — CVE High sur `next` | Moyenne → Faible | Élevé | **Résiduelle faible** (patché) |
| V5 — CVE transitives figées | Moyenne → Faible | Moyen | **Résiduelle faible** (overrides + Dependabot) |
| V6 — Secret par défaut exploitable en prod | Faible (nécessite un oubli de config) | Critique | **Résiduelle faible** (bloqué par validation au build) |
| V7 — Absence de rate limiting sur l'auth | Moyenne | Élevé | **Résiduelle faible** (5 req/min sur `/sign-in`, `/sign-up`) |
| V8 — Binaires compilés versionnés | Faible | Faible | **Résiduelle nulle** (retirés du suivi git) |
| Dette zod v3/v4 | Faible | Faible | À surveiller, sans urgence |
| Stockage rate-limit en mémoire | Moyenne (si scale multi-instance) | Moyen | À traiter avant déploiement multi-instance |
| Absence de vérification e-mail | Moyenne | Moyen | Acceptée pour le périmètre actuel, à activer avant l'ouverture publique réelle |

## 3. Solutions de chiffrement

| Donnée / flux | Solution retenue |
|---|---|
| Mots de passe utilisateurs | Hachage géré par Better Auth (jamais stocké en clair, jamais transmis au client) |
| Trafic HTTP | HTTPS forcé côté hébergeur + en-tête `Strict-Transport-Security` (HSTS, `max-age=63072000; includeSubDomains; preload`) ajouté dans `next.config.js` |
| Secrets applicatifs (`BETTER_AUTH_SECRET`, `DATABASE_URL`, identifiants OAuth) | Jamais commités (`.env` gitignoré, `.env.example` comme seule référence) ; en production, injectés via variables d'environnement chiffrées côté plateforme d'hébergement, jamais en clair dans le dépôt ou les logs |
| Données au repos (base PostgreSQL) | Chiffrement au repos délégué à l'hébergeur de base managée retenu pour la production (disque chiffré côté fournisseur) |
| En-têtes de défense en profondeur | `Content-Security-Policy` (production uniquement — voir §4), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictive — tous ajoutés dans `next.config.js` et vérifiés sans régression (voir §4) |

## 4. Structuration des développements et bonnes pratiques

Déjà en place et confirmé par la revue :
- TypeScript strict, validation Zod systématique côté serveur.
- Autorisation vérifiée côté serveur pour chaque procédure tRPC sensible (jamais uniquement côté client).
- Tests unitaires (Vitest) sur les règles de rôles et d'accès aux ressources (`src/lib/auth/roles.test.ts`, `src/lib/cesizen/ressource-access.test.ts`, `src/lib/validations/ressource.test.ts`).

Ajouté dans le cadre de ce plan :
- **En-têtes de sécurité HTTP** dans `next.config.js` (voir §3), avec CSP limitée à la production pour ne pas casser le hot-reload de développement (Turbopack/HMR ont besoin d'`unsafe-eval` et de connexions websocket que la CSP de prod n'autorise pas). Vérifié avec un build de production réel piloté par Playwright (navigation sur `/`, `/connexion`, `/catalogue`, interaction complète du formulaire de connexion) : **0 violation CSP**, 0 régression fonctionnelle.
- **`.github/dependabot.yml`** : mises à jour hebdomadaires automatisées des dépendances npm (groupées par dev/prod), des actions GitHub et de l'image Docker, pour ne plus laisser une CVE critique traîner silencieusement comme celles de la section 1.
- **Hygiène du dépôt** : arrêt du suivi git des artefacts de build (`generated/prisma/`).
- **Limitation de débit applicative** sur les endpoints d'authentification (voir §1.2/V7).
- **Revue de code obligatoire par Pull Request** avant fusion sur `main`/`staging`, avec CI verte comme prérequis (détaillé dans le plan de déploiement, ces mêmes correctifs de sécurité constituant la première Pull Request réelle du dépôt : `feature/durcissement-dependances`).

## 5. Méthodologie de continuité et de reprise d'activité (PCA/PRA)

| Aspect | Politique retenue |
|---|---|
| Sauvegardes base de données | Sauvegardes automatiques quotidiennes côté hébergeur de base managée, rétention 7 à 30 jours selon l'offre retenue, restauration point-in-time (PITR) si disponible |
| Objectif de délai de reprise (RTO) | < 1 heure pour un incident applicatif (rollback de déploiement) ; < 4 heures pour une restauration complète de base de données |
| Objectif de perte de données maximale (RPO) | < 24 heures (fréquence des sauvegardes automatiques), réductible avec le PITR de l'hébergeur |
| Rollback applicatif | Redéploiement instantané d'un commit/tag antérieur connu comme stable (le versioning Git faisant foi, voir plan de déploiement) — aucune reconstruction manuelle nécessaire |
| Procédure d'incident | 1) Constat et qualification (anomalie applicative vs incident de sécurité) → 2) Isolation (rollback ou coupure de la fonctionnalité concernée) → 3) Restauration (redéploiement ou restauration de sauvegarde) → 4) Post-mortem documenté en issue GitHub (label `incident`) → 5) Action corrective suivie dans le backlog d'évolutions |
| Continuité en cas d'indisponibilité de l'hébergeur | Le code et les migrations Prisma étant entièrement versionnés (hors artefacts générés, voir §1.2/V8), une réinstallation complète sur un nouvel hébergeur est possible à partir du seul dépôt Git et d'une sauvegarde de base de données |
