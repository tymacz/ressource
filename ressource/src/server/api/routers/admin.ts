import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  ROLE_VALUES,
  canManageCatalogue,
  canManageUsers,
  canModerate,
  isStaffRole,
} from "@/lib/auth/roles";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { Prisma } from "../../../../generated/prisma";

const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!isStaffRole(ctx.session.user.role_id)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès réservé au back-office.",
    });
  }

  return next({ ctx });
});

const moderationProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!canModerate(ctx.session.user.role_id)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès réservé à la modération.",
    });
  }

  return next({ ctx });
});

const catalogueAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!canManageCatalogue(ctx.session.user.role_id)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès réservé aux administrateurs du catalogue.",
    });
  }

  return next({ ctx });
});

const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!canManageUsers(ctx.session.user.role_id)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès réservé au super-administrateur.",
    });
  }

  return next({ ctx });
});

const ressourceUpdateInput = z.object({
  id: z.string(),
  titre: z.string().min(3),
  contenu: z.string().min(10),
  categorie_id: z.string().min(1),
  type_relation_id: z.string().min(1),
  type_ressource_id: z.string().min(1),
  visibilite: z.enum(["PUBLIQUE", "PARTAGEE", "PRIVEE"]),
  statut_publication: z.enum([
    "BROUILLON",
    "EN_ATTENTE",
    "VALIDEE",
    "SUSPENDUE",
  ]),
});

const statistiquesInput = z.object({
  periodeDu: z.string().optional(),
  periodeAu: z.string().optional(),
  categorieId: z.string().optional(),
  typeRelationId: z.string().optional(),
  typeRessourceId: z.string().optional(),
  zoneGeographique: z.string().optional(),
});

function buildStatistiquesWhere(
  input: z.infer<typeof statistiquesInput>,
): Prisma.StatistiqueLogWhereInput {
  const where: Prisma.StatistiqueLogWhereInput = {};

  if (input.periodeDu || input.periodeAu) {
    where.date_action = {
      gte: input.periodeDu ? new Date(input.periodeDu) : undefined,
      lte: input.periodeAu ? new Date(input.periodeAu) : undefined,
    };
  }

  if (input.zoneGeographique?.trim()) {
    where.zone_geographique = {
      contains: input.zoneGeographique.trim(),
      mode: "insensitive",
    };
  }

  const ressourceWhere: Prisma.RessourceWhereInput = {};
  if (input.categorieId) ressourceWhere.categorie_id = input.categorieId;
  if (input.typeRelationId)
    ressourceWhere.type_relation_id = input.typeRelationId;
  if (input.typeRessourceId)
    ressourceWhere.type_ressource_id = input.typeRessourceId;

  if (Object.keys(ressourceWhere).length > 0) {
    where.ressource = { is: ressourceWhere };
  }

  return where;
}

export const adminRouter = createTRPCRouter({
  ajouterCategorie: catalogueAdminProcedure
    .input(z.object({ libelle: z.string().min(2, "Le nom est trop court") }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.categorie.create({ data: { libelle: input.libelle } });
    }),

  ajouterTypeRelation: catalogueAdminProcedure
    .input(z.object({ libelle: z.string().min(2) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.typeRelation.create({ data: { libelle: input.libelle } });
    }),

  ajouterTypeRessource: catalogueAdminProcedure
    .input(z.object({ libelle: z.string().min(2) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.typeRessource.create({ data: { libelle: input.libelle } });
    }),

  supprimerCategorie: catalogueAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.categorie.delete({ where: { id: input.id } });
    }),

  supprimerTypeRelation: catalogueAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.typeRelation.delete({ where: { id: input.id } });
    }),

  supprimerTypeRessource: catalogueAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.typeRessource.delete({ where: { id: input.id } });
    }),

  getAllRessources: moderationProcedure.query(async ({ ctx }) => {
    return ctx.db.ressource.findMany({
      include: {
        categorie: true,
        auteur: {
          select: { name: true, email: true },
        },
      },
      orderBy: { date_creation: "desc" },
    });
  }),

  getRessourceById: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ressource = await ctx.db.ressource.findUnique({
        where: { id: input.id },
      });

      if (!ressource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ressource introuvable.",
        });
      }

      return ressource;
    }),

  modifierRessource: catalogueAdminProcedure
    .input(ressourceUpdateInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ressource.update({
        where: { id: input.id },
        data: {
          titre: input.titre,
          contenu: input.contenu,
          categorie_id: input.categorie_id,
          type_relation_id: input.type_relation_id,
          type_ressource_id: input.type_ressource_id,
          visibilite: input.visibilite,
          statut_publication: input.statut_publication,
        },
      });
    }),

  changerStatutRessource: moderationProcedure
    .input(
      z.object({
        id: z.string(),
        nouveauStatut: z.enum(["VALIDEE", "EN_ATTENTE", "SUSPENDUE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ressource.update({
        where: { id: input.id },
        data: { statut_publication: input.nouveauStatut },
      });
    }),

  supprimerRessource: catalogueAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ressource.delete({
        where: { id: input.id },
      });
    }),

  getAllUsers: superAdminProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      orderBy: { date_creation: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        est_actif: true,
        date_creation: true,
      },
    });
  }),

  changerStatutUtilisateur: superAdminProcedure
    .input(z.object({ id: z.string(), est_actif: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous ne pouvez pas désactiver votre propre compte.",
        });
      }

      return ctx.db.user.update({
        where: { id: input.id },
        data: { est_actif: input.est_actif },
      });
    }),

  changerRoleUtilisateur: superAdminProcedure
    .input(z.object({ id: z.string(), role: z.enum(ROLE_VALUES) }))
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous ne pouvez pas modifier votre propre rôle.",
        });
      }

      return ctx.db.user.update({
        where: { id: input.id },
        data: { role_id: input.role },
      });
    }),

  getCommentairesEnAttente: moderationProcedure.query(async ({ ctx }) => {
    return ctx.db.commentaire.findMany({
      where: { est_modere: false },
      include: {
        auteur: { select: { id: true, name: true, email: true } },
        ressource: { select: { id: true, titre: true } },
      },
      orderBy: { date_publication: "asc" },
    });
  }),

  validerCommentaire: moderationProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.commentaire.update({
        where: { id: input.id },
        data: { est_modere: true },
      });
    }),

  supprimerCommentaire: moderationProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.commentaire.delete({ where: { id: input.id } });
    }),

  getStatistiques: staffProcedure
    .input(statistiquesInput)
    .query(async ({ ctx, input }) => {
      const where = buildStatistiquesWhere(input);

      const statsGlobales = await ctx.db.statistiqueLog.groupBy({
        by: ["type_action"],
        where,
        _count: {
          id: true,
        },
      });

      const derniersLogs = await ctx.db.statistiqueLog.findMany({
        where,
        take: 100,
        orderBy: { date_action: "desc" },
        include: {
          user: { select: { name: true } },
          ressource: {
            select: {
              titre: true,
              categorie: { select: { libelle: true } },
              type_relation: { select: { libelle: true } },
              type_ressource: { select: { libelle: true } },
            },
          },
        },
      });

      const compteParType = {
        CONSULTATION:
          statsGlobales.find((s) => s.type_action === "CONSULTATION")?._count
            .id ?? 0,
        RECHERCHE:
          statsGlobales.find((s) => s.type_action === "RECHERCHE")?._count.id ??
          0,
        PARTAGE:
          statsGlobales.find((s) => s.type_action === "PARTAGE")?._count.id ??
          0,
        EXPLOITATION:
          statsGlobales.find((s) => s.type_action === "EXPLOITATION")?._count
            .id ?? 0,
        CREATION:
          statsGlobales.find((s) => s.type_action === "CREATION")?._count.id ??
          0,
      };

      return {
        compteParType,
        derniersLogs,
      };
    }),
});
