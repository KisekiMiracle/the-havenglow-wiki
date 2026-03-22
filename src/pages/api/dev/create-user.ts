import type { APIRoute } from "astro";
import { execute, toObjects } from "@/lib/db";

export const GET: APIRoute = async () => {
  try {
    await execute(
      /* sql */ `
      INSERT INTO users (id, username, email)
        VALUES  (?, ?, ?);
    `,
      [crypto.randomUUID(), "KisekiMiracle", "kiseki.miracle247@gmail.com"],
    );

    return Response.json(
      {
        success: true,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );
  }
};
