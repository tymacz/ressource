# Cahier des charges - (RE)Sources Relationnelles

## Reformulation du besoin

Le projet (RE)Sources Relationnelles consiste à proposer une plateforme citoyenne destinée à améliorer la qualité des relations humaines. Elle met à disposition des ressources classées, permet aux citoyens connectés de créer leurs propres contenus, favorise l'échange encadré autour des ressources publiques et fournit au back-office des indicateurs d'usage.

## Objectifs

- Donner accès à un catalogue dynamique de ressources relationnelles.
- Structurer les ressources par catégories, types de relations et types de ressources.
- Permettre la création de ressources privées, partagées ou publiques.
- Soumettre les ressources publiques et les commentaires à modération.
- Permettre le suivi de progression : favoris, mises de côté, ressources exploitées.
- Permettre le démarrage de sessions d'activité avec invitation et messagerie.
- Produire des statistiques sur consultations, recherches, partages, créations et exploitations.

## Acteurs

- Citoyen non connecté : consulte les ressources publiques.
- Citoyen connecté : consulte aussi les ressources partagées, crée des ressources, commente, suit sa progression et démarre des sessions.
- Modérateur : valide ou refuse les publications et commentaires.
- Administrateur catalogue : gère le référentiel et les ressources.
- Super-administrateur : gère les comptes, les rôles et les accès.

## Périmètre fonctionnel

Le front-office couvre la page d'accueil, le catalogue filtrable, le détail d'une ressource, la création de compte, la connexion, le tableau de bord citoyen, la création de ressource, l'aide et les sessions d'activité.

Le back-office couvre la modération des ressources, la modération des commentaires, la gestion des utilisateurs par le super-administrateur, la gestion du référentiel et les statistiques filtrables/exportables.

## Contraintes qualité

- TypeScript strict et validation Zod côté API.
- Contrôles d'accès serveur via tRPC.
- Journalisation statistique des actions significatives.
- Données sensibles limitées au strict nécessaire.
- Préparation RGPD : minimisation, désactivation de compte, séparation des rôles.
- Accessibilité : labels de formulaire, textes alternatifs et états de chargement.

## Hors périmètre actuel

- Application mobile native.
- Service d'e-mail de vérification réellement branché.
- Anonymisation avancée par lot.
- Chiffrement applicatif champ par champ hors chiffrement standard de l'infrastructure.
