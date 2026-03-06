import type { Team } from "../lib/types";
import { replaceTeamsWithMerge } from "../lib/store";
import { requireAuth } from "../lib/auth";
import { handleApiError } from "../lib/errors";

export default async function handler(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
    }
    let incoming: Team[];
    try {
      incoming = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Geçersiz body" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    if (!Array.isArray(incoming)) {
      return new Response(JSON.stringify({ error: "Geçerli takım listesi gerekli." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const result = await replaceTeamsWithMerge(incoming);
    return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const res = handleApiError(e);
    if (res) return res;
    throw e;
  }
}
