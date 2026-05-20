import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { canModerate } from "@/lib/auth/roles";
import { logStatistique } from "@/server/api/services/statistiques";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import type { Prisma } from "../../../../generated/prisma";

const catalogueInput = z.object({
  recherche: z.string().trim().optional(),
  categorieId: z.string().optional(),
  typeRelationId: z.string().optional(),
  typeRessourceId: z.string().optional(),
  tri: z.enum(["recent", "ancien", "titre"]).default("recent"),
});

function getOrderBy(
  tri: z.infer<typeof catalogueInput>["tri"],
): Prisma.RessourceOrderByWithRelationInput {
  if (tri === "ancien") return { date_creation: "asc" };
  if (tri === "titre") return { titre: "asc" };
  return { date_creation: "desc" };
}

export const ressourceRouter = createTRPCRouter({
  getAllPublic: publicProcedure
    .input(catalogueInput)
    .query(async ({ ctx, input }) => {
      const isConnected = Boolean(ctx.session?.user);
      const recherche = input.recherche?.trim();

      const where: Prisma.RessourceWhereInput = {
        visibilite: {
          in: isConnected ? ["PUBLIQUE", "PARTAGEE"] : ["PUBLIQUE"],
        },
        statut_publication: "VALIDEE",
        categorie_id: input.categorieId,
        type_relation_id: input.typeRelationId,
        type_ressource_id: input.typeRessourceId,
      };

      if (recherche) {
        where.OR = [
          { titre: { contains: recherche, mode: "insensitive" } },
          { contenu: { contains: recherche, mode: "insensitive" } },
        ];

        await logStatistique(ctx.db, {
          typeAction: "RECHERCHE",
          utilisateurId: ctx.session?.user.id,
        });
      }

      return ctx.db.ressource.findMany({
        where,
        include: {
          categorie: true,
          type_relation: true,
          type_ressource: true,
          auteur: {
            select: { name: true },
          },
        },
        orderBy: getOrderBy(input.tri),
      });
    }),

  getCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.categorie.findMany({
      orderBy: { libelle: "asc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ressource = await ctx.db.ressource.findUnique({
        where: { id: input.id },
        include: {
          categorie: true,
          type_relation: true,
          type_ressource: true,
          auteur: {
            select: { id: true, name: true },
          },
        },
      });

      if (!ressource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cette ressource n'existe pas.",
        });
      }

      const userId = ctx.session?.user?.id;
      const isModerator = canModerate(ctx.session?.user?.role_id);
      const isAuthor = userId === ressource.auteur.id;
      const isPublic =
        ressource.visibilite === "PUBLIQUE" &&
        ressource.statut_publication === "VALIDEE";
      const isSharedAndConnected =
        ressource.visibilite === "PARTAGEE" &&
        ressource.statut_publication === "VALIDEE" &&
        Boolean(userId);

      if (!isAuthor && !isModerator && !isPublic && !isSharedAndConnected) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous n'avez pas l'autorisation de voir cette ressource.",
        });
      }

      await logStatistique(ctx.db, {
        typeAction: "CONSULTATION",
        utilisateurId: userId,
        ressourceId: ressource.id,
      });

      return ressource;
    }),

  getTypesRelation: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.typeRelation.findMany({ orderBy: { libelle: "asc" } });
  }),

  getTypesRessource: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.typeRessource.findMany({ orderBy: { libelle: "asc" } });
  }),

  create: protectedProcedure
    .input(
      z.object({
        titre: z.string().min(3, "Le titre est trop court"),
        contenu: z.string().min(10, "Le contenu est trop court"),
        categorie_id: z.string().min(1, "Veuillez choisir une catégorie"),
        type_relation_id: z
          .string()
          .min(1, "Veuillez choisir un type de relation"),
        type_ressource_id: z
          .string()
          .min(1, "Veuillez choisir un type de ressource"),
        visibilite: z
          .enum(["PUBLIQUE", "PARTAGEE", "PRIVEE"])
          .default("PRIVEE"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const statut = input.visibilite === "PUBLIQUE" ? "EN_ATTENTE" : "VALIDEE";

      const nouvelleRessource = await ctx.db.ressource.create({
        data: {
          titre: input.titre,
          contenu: input.contenu,
          categorie_id: input.categorie_id,
          type_relation_id: input.type_relation_id,
          type_ressource_id: input.type_ressource_id,
          visibilite: input.visibilite,
          statut_publication: statut,
          auteur_id: ctx.session.user.id,
        },
      });

      await logStatistique(ctx.db, {
        typeAction: "CREATION",
        utilisateurId: ctx.session.user.id,
        ressourceId: nouvelleRessource.id,
      });

      return nouvelleRessource;
    }),

  logPartage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ressource = await ctx.db.ressource.findUnique({
        where: { id: input.id },
        select: { id: true },
      });

      if (!ressource) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await logStatistique(ctx.db, {
        typeAction: "PARTAGE",
        utilisateurId: ctx.session.user.id,
        ressourceId: ressource.id,
      });

      return { ok: true };
    }),
});
