import { deleteSession } from "../lib/store";
import { handleApiError } from "../lib/errors";

export default async function handler(req: Request) {
  try {
    if (req.method !== "POST" && req.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
    }
    const auth = req.headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (token) await deleteSession(token);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const res = handleApiError(e);
    if (res) return res;
    throw e;
  }
}
