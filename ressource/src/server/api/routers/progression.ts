import { z } from "zod";

import { logStatistique } from "@/server/api/services/statistiques";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { PrismaClient } from "../../../../generated/prisma";

const progressionInput = z.object({
  ressourceId: z.string(),
  actif: z.boolean(),
});

async function upsertProgression(
  db: PrismaClient,
  utilisateurId: string,
  input: z.infer<typeof progressionInput>,
  data: {
    est_favori?: boolean;
    est_mise_de_cote?: boolean;
    est_exploitee?: boolean;
  },
) {
  return db.progressionUtilisateur.upsert({
    where: {
      utilisateur_id_ressource_id: {
        utilisateur_id: utilisateurId,
        ressource_id: input.ressourceId,
      },
    },
    create: {
      utilisateur_id: utilisateurId,
      ressource_id: input.ressourceId,
      ...data,
    },
    update: data,
  });
}

export const progressionRouter = createTRPCRouter({
  getByRessource: protectedProcedure
    .input(z.object({ ressourceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const progression = await ctx.db.progressionUtilisateur.findUnique({
        where: {
          utilisateur_id_ressource_id: {
            utilisateur_id: ctx.session.user.id,
            ressource_id: input.ressourceId,
          },
        },
      });

      return {
        est_favori: progression?.est_favori ?? false,
        est_mise_de_cote: progression?.est_mise_de_cote ?? false,
        est_exploitee: progression?.est_exploitee ?? false,
      };
    }),

  setFavori: protectedProcedure
    .input(progressionInput)
    .mutation(async ({ ctx, input }) => {
      return upsertProgression(ctx.db, ctx.session.user.id, input, {
        est_favori: input.actif,
      });
    }),

  setMiseDeCote: protectedProcedure
    .input(progressionInput)
    .mutation(async ({ ctx, input }) => {
      return upsertProgression(ctx.db, ctx.session.user.id, input, {
        est_mise_de_cote: input.actif,
      });
    }),

  setExploitee: protectedProcedure
    .input(progressionInput)
    .mutation(async ({ ctx, input }) => {
      const progression = await upsertProgression(
        ctx.db,
        ctx.session.user.id,
        input,
        {
          est_exploitee: input.actif,
        },
      );

      if (input.actif) {
        await logStatistique(ctx.db, {
          typeAction: "EXPLOITATION",
          utilisateurId: ctx.session.user.id,
          ressourceId: input.ressourceId,
        });
      }

      return progression;
    }),

  getMonTableauDeBord: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const progressions = await ctx.db.progressionUtilisateur.findMany({
      where: {
        utilisateur_id: userId,
      },
      include: {
        ressource: {
          include: {
            categorie: true,
            auteur: { select: { name: true } },
          },
        },
      },
      orderBy: { date_derniere_action: "desc" },
    });

    const mesCreations = await ctx.db.ressource.findMany({
      where: {
        auteur_id: userId,
      },
      include: {
        categorie: true,
        auteur: { select: { name: true } },
      },
      orderBy: { date_creation: "desc" },
    });

    return {
      favoris: progressions.filter((p) => p.est_favori),
      misesDeCote: progressions.filter((p) => p.est_mise_de_cote),
      exploitees: progressions.filter((p) => p.est_exploitee),
      mesCreations,
    };
  }),
});
