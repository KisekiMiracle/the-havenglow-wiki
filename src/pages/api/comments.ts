import type { APIRoute } from "astro";
import { execute, toObjects } from "@/lib/db";

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return Response.json(
        { success: false, error: "Missing slug parameter" },
        { status: 400 },
      );
    }

    const data = await execute(
      /* sql */ `
      SELECT id, author_name, content, created_at FROM comments
        WHERE post_slug = ? AND status = 'approved'
        ORDER BY created_at DESC
        LIMIT 50
    `,
      [slug],
    );
    const history = toObjects(data);

    return Response.json(
      {
        success: true,
        history,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: `Something unexpected happened. Reason: ${error}.`,
      },
      {
        status: 500,
      },
    );
  }
};
