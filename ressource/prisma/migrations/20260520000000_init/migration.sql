-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Visibilite" AS ENUM ('PUBLIQUE', 'PARTAGEE', 'PRIVEE');

-- CreateEnum
CREATE TYPE "StatutPublication" AS ENUM ('BROUILLON', 'EN_ATTENTE', 'VALIDEE', 'SUSPENDUE');

-- CreateEnum
CREATE TYPE "StatutSession" AS ENUM ('EN_COURS', 'TERMINEE');

-- CreateEnum
CREATE TYPE "TypeActionStats" AS ENUM ('CONSULTATION', 'RECHERCHE', 'PARTAGE', 'EXPLOITATION', 'CREATION');

-- CreateEnum
CREATE TYPE "RoleUser" AS ENUM ('CITOYEN', 'MODERATEUR', 'ADMIN_CATALOGUE', 'SUPER_ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_id" "RoleUser" NOT NULL DEFAULT 'CITOYEN',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categorie" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,

    CONSTRAINT "Categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeRelation" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,

    CONSTRAINT "TypeRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeRessource" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,

    CONSTRAINT "TypeRessource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ressource" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "visibilite" "Visibilite" NOT NULL DEFAULT 'PRIVEE',
    "statut_publication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_mise_a_jour" TIMESTAMP(3) NOT NULL,
    "auteur_id" TEXT NOT NULL,
    "categorie_id" TEXT NOT NULL,
    "type_relation_id" TEXT NOT NULL,
    "type_ressource_id" TEXT NOT NULL,

    CONSTRAINT "Ressource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressionUtilisateur" (
    "utilisateur_id" TEXT NOT NULL,
    "ressource_id" TEXT NOT NULL,
    "est_favori" BOOLEAN NOT NULL DEFAULT false,
    "est_mise_de_cote" BOOLEAN NOT NULL DEFAULT false,
    "est_exploitee" BOOLEAN NOT NULL DEFAULT false,
    "date_derniere_action" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressionUtilisateur_pkey" PRIMARY KEY ("utilisateur_id","ressource_id")
);

-- CreateTable
CREATE TABLE "Commentaire" (
    "id" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_publication" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "est_modere" BOOLEAN NOT NULL DEFAULT false,
    "auteur_id" TEXT NOT NULL,
    "ressource_id" TEXT NOT NULL,
    "parent_id" TEXT,

    CONSTRAINT "Commentaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionActivite" (
    "id" TEXT NOT NULL,
    "date_demarrage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutSession" NOT NULL DEFAULT 'EN_COURS',
    "ressource_id" TEXT NOT NULL,
    "initiateur_id" TEXT NOT NULL,

    CONSTRAINT "SessionActivite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantSession" (
    "session_id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "date_invitation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "a_accepte" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ParticipantSession_pkey" PRIMARY KEY ("session_id","utilisateur_id")
);

-- CreateTable
CREATE TABLE "MessageSession" (
    "id" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_envoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_id" TEXT NOT NULL,
    "auteur_id" TEXT NOT NULL,

    CONSTRAINT "MessageSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatistiqueLog" (
    "id" TEXT NOT NULL,
    "type_action" "TypeActionStats" NOT NULL,
    "date_action" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "zone_geographique" TEXT,
    "utilisateur_id" TEXT,
    "ressource_id" TEXT,

    CONSTRAINT "StatistiqueLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_id_idx" ON "User"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "Categorie_libelle_key" ON "Categorie"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "TypeRelation_libelle_key" ON "TypeRelation"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "TypeRessource_libelle_key" ON "TypeRessource"("libelle");

-- CreateIndex
CREATE INDEX "Ressource_auteur_id_idx" ON "Ressource"("auteur_id");

-- CreateIndex
CREATE INDEX "Ressource_categorie_id_idx" ON "Ressource"("categorie_id");

-- CreateIndex
CREATE INDEX "Ressource_type_relation_id_idx" ON "Ressource"("type_relation_id");

-- CreateIndex
CREATE INDEX "Ressource_type_ressource_id_idx" ON "Ressource"("type_ressource_id");

-- CreateIndex
CREATE INDEX "Ressource_statut_publication_visibilite_idx" ON "Ressource"("statut_publication", "visibilite");

-- CreateIndex
CREATE INDEX "Commentaire_auteur_id_idx" ON "Commentaire"("auteur_id");

-- CreateIndex
CREATE INDEX "Commentaire_ressource_id_idx" ON "Commentaire"("ressource_id");

-- CreateIndex
CREATE INDEX "Commentaire_est_modere_idx" ON "Commentaire"("est_modere");

-- CreateIndex
CREATE INDEX "SessionActivite_ressource_id_idx" ON "SessionActivite"("ressource_id");

-- CreateIndex
CREATE INDEX "SessionActivite_initiateur_id_idx" ON "SessionActivite"("initiateur_id");

-- CreateIndex
CREATE INDEX "MessageSession_session_id_idx" ON "MessageSession"("session_id");

-- CreateIndex
CREATE INDEX "MessageSession_auteur_id_idx" ON "MessageSession"("auteur_id");

-- CreateIndex
CREATE INDEX "StatistiqueLog_type_action_idx" ON "StatistiqueLog"("type_action");

-- CreateIndex
CREATE INDEX "StatistiqueLog_date_action_idx" ON "StatistiqueLog"("date_action");

-- CreateIndex
CREATE INDEX "StatistiqueLog_zone_geographique_idx" ON "StatistiqueLog"("zone_geographique");

-- CreateIndex
CREATE INDEX "StatistiqueLog_utilisateur_id_idx" ON "StatistiqueLog"("utilisateur_id");

-- CreateIndex
CREATE INDEX "StatistiqueLog_ressource_id_idx" ON "StatistiqueLog"("ressource_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "account_providerId_idx" ON "account"("providerId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey
ALTER TABLE "Ressource" ADD CONSTRAINT "Ressource_auteur_id_fkey" FOREIGN KEY ("auteur_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ressource" ADD CONSTRAINT "Ressource_categorie_id_fkey" FOREIGN KEY ("categorie_id") REFERENCES "Categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ressource" ADD CONSTRAINT "Ressource_type_relation_id_fkey" FOREIGN KEY ("type_relation_id") REFERENCES "TypeRelation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ressource" ADD CONSTRAINT "Ressource_type_ressource_id_fkey" FOREIGN KEY ("type_ressource_id") REFERENCES "TypeRessource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressionUtilisateur" ADD CONSTRAINT "ProgressionUtilisateur_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressionUtilisateur" ADD CONSTRAINT "ProgressionUtilisateur_ressource_id_fkey" FOREIGN KEY ("ressource_id") REFERENCES "Ressource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentaire" ADD CONSTRAINT "Commentaire_auteur_id_fkey" FOREIGN KEY ("auteur_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentaire" ADD CONSTRAINT "Commentaire_ressource_id_fkey" FOREIGN KEY ("ressource_id") REFERENCES "Ressource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentaire" ADD CONSTRAINT "Commentaire_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Commentaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionActivite" ADD CONSTRAINT "SessionActivite_ressource_id_fkey" FOREIGN KEY ("ressource_id") REFERENCES "Ressource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionActivite" ADD CONSTRAINT "SessionActivite_initiateur_id_fkey" FOREIGN KEY ("initiateur_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantSession" ADD CONSTRAINT "ParticipantSession_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "SessionActivite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantSession" ADD CONSTRAINT "ParticipantSession_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageSession" ADD CONSTRAINT "MessageSession_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "SessionActivite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageSession" ADD CONSTRAINT "MessageSession_auteur_id_fkey" FOREIGN KEY ("auteur_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistiqueLog" ADD CONSTRAINT "StatistiqueLog_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistiqueLog" ADD CONSTRAINT "StatistiqueLog_ressource_id_fkey" FOREIGN KEY ("ressource_id") REFERENCES "Ressource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

