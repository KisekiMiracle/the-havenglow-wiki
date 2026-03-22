import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";
import { execute } from "@/lib/db";
import { Resend } from "resend";
import { SignJWT, jwtVerify } from "jose";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const user = {
  login: defineAction({
    accept: "form",
    input: z.object({
      email: z.email({
        message: "Invalid Email.",
      }),
    }),
    handler: async (input) => {
      try {
        const user = (
          await execute(
            /* sql */ `
          SELECT username, email FROM users
            WHERE email = ?;
        `,
            [input.email],
          )
        ).rows[0];

        if (!user) return { error: "Could not find that user." };

        const SECRET = new TextEncoder().encode(import.meta.env.JWT_SECRET);
        // Generate token — expires in 15 minutes
        const magicToken = await new SignJWT({ email: input.email })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("15m")
          .setIssuedAt()
          .sign(SECRET);

        await execute(
          /* sql */ `UPDATE users SET magic_token = ?, magic_token_expires_at = datetime('now', '+15 minutes'), magic_token_used = 0
                    WHERE email = ?`,
          [magicToken, input.email],
        );

        const URL =
          import.meta.env.PROD === true
            ? import.meta.env.SITE_URL
            : "http://localhost:4321";

        const magicLink = `${URL}/auth/verify?token=${magicToken}`;

        const { error } = await resend.emails.send({
          from: "no-reply@info.kiseki-miracle.dev",
          to: [import.meta.env.RESEND_TO_EMAIL],
          subject: "Hello world",
          html: `<a href="${magicLink}">Click here to sign in</a> — expires in 15 minutes.`,
        });

        if (error) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }

        return { success: true, message: "A magic link has been sent. " };
      } catch (error) {
        console.error("Action error:", error); // this will print in the terminal
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
