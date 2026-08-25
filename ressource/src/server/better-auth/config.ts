import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, APIError } from "better-auth/api";

import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  // Rate limiting is enabled in all environments (Better Auth only enables it
  // in production by default) to mitigate brute force / credential stuffing
  // on the authentication endpoints. Storage is in-memory: fine for a single
  // instance, but must move to "database" (or a shared secondary storage)
  // before a multi-instance/serverless production deployment, otherwise each
  // instance tracks its own counters.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
    },
  },

  user: {
    additionalFields: {
      role_id: {
        type: "string",
        required: true,
        defaultValue: "CITOYEN",
      },
      est_actif: {
        type: "boolean",
        required: true,
        defaultValue: true,
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email") {
        const body = ctx.body as { email?: string } | undefined;
        const email = body?.email;

        if (email) {
          const user = await db.user.findUnique({
            where: { email: email },
            select: { est_actif: true },
          });

          if (user?.est_actif === false) {
            throw new APIError("FORBIDDEN", {
              message: "Votre compte a été désactivé par un administrateur.",
            });
          }
        }
      }
    }),
  },
});

export type Session = typeof auth.$Infer.Session;
