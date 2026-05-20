# Architecture logicielle

## Vue d'ensemble

L'application suit une architecture proche MVC adaptée à Next.js :

- Modèle : schéma Prisma, base PostgreSQL, validations Zod.
- Vue : pages et composants React dans `src/app` et `src/components`.
- Contrôleur : routers tRPC dans `src/server/api/routers`.

## Modules principaux

- Authentification : Better Auth, rôles et middleware.
- Ressources : consultation, création, filtrage et partage.
- Référentiel : catégories, types de relations, types de ressources.
- Progression : favoris, mises de côté, ressources exploitées.
- Commentaires : publication citoyenne et modération.
- Sessions : démarrage d'activité, participants et messages.
- Statistiques : logs d'actions et exports.

## Diagramme de cas d'utilisation

```mermaid
flowchart LR
  Public[Citoyen non connecté] --> Catalogue[Consulter catalogue public]
  Citoyen[Citoyen connecté] --> Ressource[Créer ressource]
  Citoyen --> Progression[Gérer progression]
  Citoyen --> Commenter[Commenter une ressource]
  Citoyen --> Session[Démarrer session activité]
  Moderateur[Modérateur] --> ModererR[Modérer ressources]
  Moderateur --> ModererC[Modérer commentaires]
  Admin[Administrateur catalogue] --> Referentiel[Gérer référentiel]
  Admin --> Stats[Consulter statistiques]
  Super[Super-administrateur] --> Users[Gérer utilisateurs et rôles]
```

## Diagramme de classes simplifié

```mermaid
classDiagram
  User "1" --> "*" Ressource : crée
  User "1" --> "*" Commentaire : écrit
  User "1" --> "*" ProgressionUtilisateur : suit
  Ressource "*" --> "1" Categorie
  Ressource "*" --> "1" TypeRelation
  Ressource "*" --> "1" TypeRessource
  Ressource "1" --> "*" Commentaire
  Ressource "1" --> "*" SessionActivite
  SessionActivite "1" --> "*" ParticipantSession
  SessionActivite "1" --> "*" MessageSession
  Ressource "1" --> "*" StatistiqueLog
```

## Sécurité

Les droits critiques sont vérifiés côté serveur :

- Back-office : rôle staff requis.
- Gestion utilisateurs : super-administrateur uniquement.
- Gestion référentiel : administrateur catalogue ou super-administrateur.
- Modération : modérateur, administrateur catalogue ou super-administrateur.
- Sessions : seuls les participants ou le staff peuvent lire et écrire.
