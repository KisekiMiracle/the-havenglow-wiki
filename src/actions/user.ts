import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { Resend } from "resend";
import { SignJWT } from "jose";
import { db } from "@/lib/db";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const user = {
  login: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email({ message: "Invalid email." }),
    }),
    handler: async (input) => {
      try {
        // SELECT — .get() returns first row or undefined
        const [user] = await db
          .select({ username: users.username, email: users.email })
          .from(users)
          .where(eq(users.email, input.email));

        if (!user) return { error: "Could not find that user." };

        const SECRET = new TextEncoder().encode(import.meta.env.JWT_SECRET);
        const magicToken = await new SignJWT({ email: input.email })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("15m")
          .setIssuedAt()
          .sign(SECRET);

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // UPDATE
        await db
          .update(users)
          .set({
            magicToken,
            magicTokenExpiresAt: expiresAt,
            magicTokenUsed: 0,
          })
          .where(eq(users.email, input.email));

        const baseUrl = import.meta.env.PROD
          ? import.meta.env.SITE_URL
          : "http://localhost:4321";

        const magicLink = `${baseUrl}/auth/verify?token=${magicToken}`;

        const { error } = await resend.emails.send({
          from: "no-reply@info.kiseki-miracle.dev",
          to: [import.meta.env.RESEND_TO_EMAIL!],
          subject: "Your magic link",
          html: `<a href="${magicLink}">Click here to sign in</a> — expires in 15 minutes.`,
        });

        if (error)
          throw new ActionError({
            code: "BAD_REQUEST",
            message: error.message,
          });

        return { success: true, message: "A magic link has been sent." };
      } catch (error) {
        console.error("Action error:", error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal error",
        });
      }
    },
  }),

  logout: defineAction({
    accept: "form",
    handler: async (_, context) => {
      context.cookies.delete("session", { path: "/" });
      return { success: true };
    },
  }),
};
