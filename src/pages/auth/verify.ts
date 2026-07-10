import type { APIRoute } from "astro";
import { jwtVerify } from "jose";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) return redirect("/?error=missing_token");

  const secret = import.meta.env.JWT_SECRET;
  const SECRET = new TextEncoder().encode(secret);

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const email = payload.email as string;

    // 2. Check token exists in DB, hasn't been used, and isn't expired
    // const result = await execute(
    //   `SELECT * FROM users
    //    WHERE email = ?
    //    AND magic_token = ?
    //    AND magic_token_used = 0
    //    AND magic_token_expires_at > datetime('now')`,
    //   [email, token],
    // );

    // if (result.rows.length === 0) {
    //   return redirect("/?error=invalid_token");
    // }
    //
    // // 3. Invalidate the token — one time use only
    // await execute(`UPDATE users SET magic_token_used = 1 WHERE email = ?`, [
    //   email,
    // ]);

    // 4. Set session cookie
    cookies.set("session", token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return redirect("/");
  } catch {
    // JWT verification failed (expired, tampered, etc.)
    return redirect("/?error=invalid_token");
  }
};
