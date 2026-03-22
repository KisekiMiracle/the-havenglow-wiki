// src/pages/search.json.ts
// Generates /search.json at build time — a flat array of all blog posts
// with just the fields Fuse.js needs. No body text, no heavy content.

import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const posts = await getCollection("wiki");

  const index = posts.map((post) => ({
    slug: `/wiki/${post.id}`,
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate.toISOString(),
    tags: post.data.tags,
  }));

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json" },
  });
};
