// src/pages/api/dev/seed.ts
// GET /api/dev/seed — wipes and re-seeds comments and reviews with dummy data.
//
// ⚠️  IMPORTANT: Delete or protect this endpoint before going to production.
//    This endpoint DELETES ALL EXISTING DATA before inserting seed rows.

import type { APIRoute } from "astro";
import { execute } from "@/lib/db";

const SEED_COMMENTS = [
  {
    post_slug: "markdown-style-guide",
    author_name: "Lena Hartmann",
    author_email: "lena@example.com",
    content: "This is exactly the reference I needed, bookmarked immediately!",
    status: "approved",
  },
  {
    post_slug: "markdown-style-guide",
    author_name: "Tomás Rivera",
    author_email: "tomas@example.com",
    content: "Would love to see a section on footnotes in the future.",
    status: "approved",
  },
  {
    post_slug: "markdown-style-guide",
    author_name: "Spambot 3000",
    author_email: "spam@example.com",
    content: "Buy cheap watches at www.definitely-not-spam.biz",
    status: "rejected",
  },
  {
    post_slug: "using-mdx",
    author_name: "Priya Nair",
    author_email: "priya@example.com",
    content: "MDX changed how I write docs completely. Great writeup.",
    status: "approved",
  },
  {
    post_slug: "using-mdx",
    author_name: "Jonas Becker",
    author_email: "jonas@example.com",
    content: "Does this work with custom components from a design system?",
    status: "pending",
  },
  {
    post_slug: "first-post",
    author_name: "Aiko Tanaka",
    author_email: "aiko@example.com",
    content: "Welcome to the blogosphere! Looking forward to more posts.",
    status: "approved",
  },
  {
    post_slug: "third-post",
    author_name: "Marcus Webb",
    author_email: "marcus@example.com",
    content: "Really enjoyed this one, the examples are super clear.",
    status: "pending",
  },
];

const SEED_REVIEWS = [
  {
    author_name: "Lena Hartmann",
    author_email: "lena@example.com",
    rating: 5,
    content:
      "Beautiful site and consistently great writing. One of my favourites.",
    status: "approved",
  },
  {
    author_name: "Tomás Rivera",
    author_email: "tomas@example.com",
    rating: 4,
    content: "Love the aesthetic. Would appreciate an RSS feed!",
    status: "approved",
  },
  {
    author_name: "Priya Nair",
    author_email: "priya@example.com",
    rating: 5,
    content: "The attention to typography here is really something else.",
    status: "approved",
  },
  {
    author_name: "Jonas Becker",
    author_email: "jonas@example.com",
    rating: 3,
    content: "Good content but the mobile layout feels a bit tight.",
    status: "pending",
  },
];

export const GET: APIRoute = async () => {
  if (!import.meta.env.ENABLE_DEV_ROUTES) {
    return Response.json(
      { error: "This endpoint is disabled in production." },
      { status: 403 },
    );
  }

  // Wipe existing data so the endpoint is idempotent
  await execute("DELETE FROM comments");
  await execute("DELETE FROM reviews");

  for (const c of SEED_COMMENTS) {
    await execute(
      `INSERT INTO comments (post_slug, author_name, author_email, content, status)
       VALUES (?, ?, ?, ?, ?)`,
      [c.post_slug, c.author_name, c.author_email, c.content, c.status],
    );
  }

  for (const r of SEED_REVIEWS) {
    await execute(
      `INSERT INTO reviews (author_name, author_email, rating, content, status)
       VALUES (?, ?, ?, ?, ?)`,
      [r.author_name, r.author_email, r.rating, r.content, r.status],
    );
  }

  return Response.json({
    message: "Database seeded.",
    comments: SEED_COMMENTS.length,
    reviews: SEED_REVIEWS.length,
  });
};
