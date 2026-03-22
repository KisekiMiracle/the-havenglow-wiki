import { defineMiddleware } from "astro:middleware";
import { jwtVerify } from "jose";

const PROTECTED = ["/admin"];

export const onRequest = defineMiddleware(
  async ({ request, cookies, redirect }, next) => {
    const url = new URL(request.url);
    const isProtected = PROTECTED.some((path) => url.pathname.startsWith(path));

    if (!isProtected) return next();

    const session = cookies.get("session")?.value;
    if (!session) return redirect("/");

    try {
      const SECRET = new TextEncoder().encode(import.meta.env.JWT_SECRET);
      await jwtVerify(session, SECRET);
      return next();
    } catch {
      cookies.delete("session", { path: "/" });
      return redirect("/");
    }
  },
);
