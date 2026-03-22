// src/pages/api/dev/migrate.ts
// GET /api/dev/migrate — creates the comments and reviews tables if they
// don't already exist. Safe to run multiple times (IF NOT EXISTS).
//
// ⚠️  IMPORTANT: Delete or protect this endpoint before going to production.

import type { APIRoute } from "astro";
import { execute } from "@/lib/db";

export const GET: APIRoute = async () => {
  if (!import.meta.env.ENABLE_DEV_ROUTES) {
    return Response.json(
      { error: "This endpoint is disabled in production." },
      { status: 403 },
    );
  }

  const statements = [
    /* sql */ `
    CREATE TABLE IF NOT EXISTS comments (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      post_slug    TEXT    NOT NULL,
      author_name  TEXT    NOT NULL,
      author_email TEXT    NOT NULL,
      content      TEXT    NOT NULL,
      status       TEXT    NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE TABLE IF NOT EXISTS users (
      id                      TEXT        PRIMARY KEY,
      username                TEXT        NOT NULL,
      email                   TEXT        NOT NULL,
      magic_token             TEXT,
      magic_token_expires_at  DATETIME,
      magic_token_used        BOOLEAN     DEFAULT 0
     )`,

    `CREATE INDEX IF NOT EXISTS idx_comments_slug   ON comments (post_slug)`,
    `CREATE INDEX IF NOT EXISTS idx_comments_status ON comments (status)`,
    `CREATE INDEX IF NOT EXISTS idx_reviews_status  ON reviews  (status)`,
    `CREATE INDEX IF NOT EXISTS idx_users           ON users    (id)`,
  ];

  const executed: string[] = [];

  for (const sql of statements) {
    await execute(sql);
    const label = sql.trim().split("\n")[0].trim();
    executed.push(`✓ ${label}`);
  }

  return Response.json({
    message: "Migration complete.",
    executed,
  });
};
