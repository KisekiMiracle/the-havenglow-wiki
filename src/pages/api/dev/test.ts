import type { APIRoute } from "astro";
import { execute, toObjects } from "@/lib/db";

export const GET: APIRoute = async () => {
  const data = await execute(/* sql */ `
    SELECT * FROM comments
  `);

  console.log("data", toObjects(data));
  return Response.json({
    success: true,
  });
};
