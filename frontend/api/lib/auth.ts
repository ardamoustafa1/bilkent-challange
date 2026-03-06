import type { Session } from "./types";
import { getSession } from "./store";

export async function requireAuth(req: Request): Promise<{ session: Session } | Response> {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return new Response(JSON.stringify({ error: "Oturum gerekli. Lütfen giriş yapın." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const session = await getSession(token);
  if (!session) {
    return new Response(JSON.stringify({ error: "Oturum geçersiz veya süresi dolmuş." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return { session };
}
