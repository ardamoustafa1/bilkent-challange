import type { Team } from "../lib/types";
import { getTeamById, upsertTeam } from "../lib/store";
import { requireAuth } from "../lib/auth";
import { handleApiError } from "../lib/errors";

function getIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/api\/teams\/([^/]+)\/?$/);
  return match ? match[1] : null;
}

export default async function handler(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    const url = new URL(req.url);
    const id = getIdFromPath(url.pathname);
    if (!id) {
      return new Response(JSON.stringify({ error: "id gerekli" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    if (req.method === "GET") {
      const t = await getTeamById(id);
      if (!t) {
        return new Response(JSON.stringify({ error: "Takım bulunamadı." }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify(t), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (req.method === "PUT") {
      let team: Team;
      try {
        team = await req.json();
      } catch {
        return new Response(JSON.stringify({ error: "Geçersiz body" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      if (id !== team?.id) {
        return new Response(JSON.stringify({ error: "URL id ile body id uyuşmuyor." }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      const updated = await upsertTeam(team);
      return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const res = handleApiError(e);
    if (res) return res;
    throw e;
  }
}
