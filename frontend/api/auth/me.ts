import { getSession } from "../lib/store";
import { handleApiError } from "../lib/errors";

export default async function handler(req: Request) {
  try {
    if (req.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
    }
    const auth = req.headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!token) {
      return new Response(JSON.stringify({ error: "Token gerekli" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const session = await getSession(token);
    if (!session) {
      return new Response(JSON.stringify({ error: "Oturum geçersiz veya süresi dolmuş" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(session), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const res = handleApiError(e);
    if (res) return res;
    throw e;
  }
}
