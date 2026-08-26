# (RE)Sources Relationnelles

Application web Next.js pour le projet collaboratif INFCDAAL1. La plateforme permet aux citoyens de consulter, créer, partager et commenter des ressources autour de la qualité des relations, avec un back-office de modération, de gestion du référentiel et de statistiques.

## Stack

- Next.js 15, React 19, TypeScript strict
- tRPC pour l'API applicative
- Prisma et PostgreSQL
- Better Auth pour l'authentification
- Tailwind CSS et composants UI
- Vitest pour les tests unitaires

## Démarrage local

1. Copier `.env.example` vers `.env`.
2. Démarrer PostgreSQL : `docker compose up -d`.
3. Installer les dépendances : `pnpm install`.
4. Appliquer le schéma : `pnpm db:push` ou `pnpm db:migrate`.
5. Lancer l'application : `pnpm dev`.

## Scripts qualité

- `pnpm typecheck` : vérification TypeScript.
- `pnpm lint` : lint Next/ESLint.
- `pnpm format:check` : vérification Prettier.
- `pnpm test` : tests unitaires Vitest.
- `pnpm build` : build de production.

## Rôles

- `CITOYEN` : consultation, création, progression, commentaires et sessions.
- `MODERATEUR` : validation des ressources et commentaires.
- `ADMIN_CATALOGUE` : gestion du référentiel et des ressources.
- `SUPER_ADMIN` : gestion complète, dont comptes et rôles.

## Livrables

Les livrables de conception et de soutenance sont dans le dossier `docs/` :

- `docs/cahier-des-charges.md`
- `docs/architecture.md`
- `docs/merise.md`
- `docs/soutenance.md`

Les livrables du bloc AL3 (run : sécurité et déploiement) sont dans le même dossier :

- `docs/securite/plan-securisation.md`
- `docs/deploiement/plan-deploiement.md`
