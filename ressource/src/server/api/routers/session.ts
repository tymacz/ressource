import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { canModerate } from "@/lib/auth/roles";
import { logStatistique } from "@/server/api/services/statistiques";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { PrismaClient } from "../../../../generated/prisma";

type SessionContext = {
  db: PrismaClient;
  session: { user: { id: string; role_id: string } };
};

async function verifierParticipation(ctx: SessionContext, sessionId: string) {
  const session = await ctx.db.sessionActivite.findUnique({
    where: { id: sessionId },
    select: { initiateur_id: true },
  });

  if (!session) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Session introuvable." });
  }

  if (canModerate(ctx.session.user.role_id)) return session;

  const participant = await ctx.db.participantSession.findUnique({
    where: {
      session_id_utilisateur_id: {
        session_id: sessionId,
        utilisateur_id: ctx.session.user.id,
      },
    },
  });

  if (!participant) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Vous ne participez pas à cette session.",
    });
  }

  return session;
}

export const sessionRouter = createTRPCRouter({
  creer: protectedProcedure
    .input(z.object({ ressourceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ressource = await ctx.db.ressource.findUnique({
        where: { id: input.ressourceId },
        select: { id: true },
      });

      if (!ressource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ressource introuvable.",
        });
      }

      const nouvelleSession = await ctx.db.sessionActivite.create({
        data: {
          ressource_id: input.ressourceId,
          initiateur_id: ctx.session.user.id,
        },
      });

      await ctx.db.participantSession.create({
        data: {
          session_id: nouvelleSession.id,
          utilisateur_id: ctx.session.user.id,
          a_accepte: true,
        },
      });

      await logStatistique(ctx.db, {
        typeAction: "EXPLOITATION",
        utilisateurId: ctx.session.user.id,
        ressourceId: input.ressourceId,
      });

      return nouvelleSession;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.sessionActivite.findUnique({
        where: { id: input.id },
        include: {
          ressource: { select: { id: true, titre: true } },
          initiateur: { select: { id: true, name: true } },
          participants: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          messages: {
            include: { auteur: { select: { id: true, name: true } } },
            orderBy: { date_envoi: "asc" },
          },
        },
      });

      if (!session) throw new TRPCError({ code: "NOT_FOUND" });

      const estParticipant = session.participants.some(
        (p) => p.utilisateur_id === ctx.session.user.id,
      );
      const estModerateur = canModerate(ctx.session.user.role_id);

      if (!estParticipant && !estModerateur) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous ne participez pas à cette session.",
        });
      }

      return session;
    }),

  envoyerMessage: protectedProcedure
    .input(z.object({ sessionId: z.string(), contenu: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifierParticipation(ctx, input.sessionId);

      return ctx.db.messageSession.create({
        data: {
          contenu: input.contenu,
          session_id: input.sessionId,
          auteur_id: ctx.session.user.id,
        },
      });
    }),

  inviter: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        email: z.string().email("Email invalide"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await verifierParticipation(ctx, input.sessionId);

      if (
        session.initiateur_id !== ctx.session.user.id &&
        !canModerate(ctx.session.user.role_id)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Seul l'initiateur peut inviter des participants.",
        });
      }

      const invite = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (invite?.est_actif !== true) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aucun citoyen actif trouvé avec cet email.",
        });
      }

      const dejaParticipant = await ctx.db.participantSession.findUnique({
        where: {
          session_id_utilisateur_id: {
            session_id: input.sessionId,
            utilisateur_id: invite.id,
          },
        },
      });

      if (dejaParticipant) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cet utilisateur est déjà invité.",
        });
      }

      return ctx.db.participantSession.create({
        data: {
          session_id: input.sessionId,
          utilisateur_id: invite.id,
        },
      });
    }),
});
