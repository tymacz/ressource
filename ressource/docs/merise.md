# Modèle conceptuel de données

## Entités principales

- Utilisateur : identité, e-mail, rôle, statut actif.
- Ressource : titre, contenu, visibilité, statut de publication.
- Catégorie : classification thématique.
- TypeRelation : relation concernée.
- TypeRessource : format ou nature de la ressource.
- Commentaire : contenu modéré et réponses.
- ProgressionUtilisateur : favori, mise de côté, exploitée.
- SessionActivite : ressource démarrée en activité.
- ParticipantSession : invitation et acceptation.
- MessageSession : message dans une session.
- StatistiqueLog : action tracée pour les indicateurs.

## Cardinalités

- Un utilisateur crée 0..n ressources.
- Une ressource appartient à une catégorie, un type de relation et un type de ressource.
- Une ressource reçoit 0..n commentaires.
- Un utilisateur possède 0..n progressions.
- Une session concerne une ressource et possède 1..n participants.
- Une session possède 0..n messages.
- Une ressource peut être liée à 0..n logs statistiques.

## RGPD et données sensibles

- Les mots de passe sont gérés par Better Auth et stockés hachés.
- Les comptes peuvent être désactivés sans suppression immédiate.
- Les statistiques acceptent un utilisateur nullable afin de conserver des logs anonymes.
- Les exports statistiques restent fonctionnels avec utilisateur anonyme.
- Les données collectées sont limitées : nom, e-mail, rôle, contenus créés.

## Accessibilité RGAA

- Les formulaires utilisent des labels.
- Les actions iconographiques importantes ont un texte visible.
- Les zones dynamiques critiques utilisent des états de chargement.
- Les couleurs doivent être validées par audit visuel final avant soutenance.
