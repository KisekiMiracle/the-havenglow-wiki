/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

type Env = {
  havenglow_wiki_db: D1Database;
  DISCORD_WEBHOOK_URL: string;
  RESEND_API_KEY: string;
  RESEND_TO_EMAIL: string;
  ADMIN_SECRET: string;
};

declare namespace App {
  interface Locals {
    runtime: {
      env: Env;
    };
  }
}
