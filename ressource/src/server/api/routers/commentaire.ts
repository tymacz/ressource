import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { canModerate } from "@/lib/auth/roles";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const commentaireRouter = createTRPCRouter({
  getByRessource: publicProcedure
    .input(z.object({ ressourceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.commentaire.findMany({
        where: {
          ressource_id: input.ressourceId,
          parent_id: null,
          est_modere: true,
        },
        include: {
          auteur: { select: { id: true, name: true } },
          reponses: {
            where: { est_modere: true },
            include: { auteur: { select: { id: true, name: true } } },
            orderBy: { date_publication: "asc" },
          },
        },
        orderBy: { date_publication: "desc" },
      });
    }),

  ajouter: protectedProcedure
    .input(
      z.object({
        ressourceId: z.string(),
        contenu: z.string().min(1, "Le commentaire ne peut pas être vide"),
        parentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const autoValide = canModerate(ctx.session.user.role_id);

      return ctx.db.commentaire.create({
        data: {
          contenu: input.contenu,
          ressource_id: input.ressourceId,
          auteur_id: ctx.session.user.id,
          parent_id: input.parentId ?? null,
          est_modere: autoValide,
        },
      });
    }),

  supprimer: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const commentaire = await ctx.db.commentaire.findUnique({
        where: { id: input.id },
      });

      if (!commentaire) throw new TRPCError({ code: "NOT_FOUND" });

      const isAuthor = commentaire.auteur_id === ctx.session.user.id;
      const isModerator = canModerate(ctx.session.user.role_id);

      if (!isAuthor && !isModerator) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Non autorisé" });
      }

      return ctx.db.commentaire.delete({ where: { id: input.id } });
    }),
});
