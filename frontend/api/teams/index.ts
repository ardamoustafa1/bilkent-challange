import type { Team } from "../lib/types";
import { getTeams, upsertTeam } from "../lib/store";
import { requireAuth } from "../lib/auth";
import { handleApiError } from "../lib/errors";

export default async function handler(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    if (req.method === "GET") {
      const teams = await getTeams();
      return new Response(JSON.stringify(teams), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      let team: Team;
      try {
        team = await req.json();
      } catch {
        return new Response(JSON.stringify({ error: "Geçersiz body" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (!team?.id) {
        return new Response(JSON.stringify({ error: "Takım id gerekli." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const created = await upsertTeam(team);
      return new Response(JSON.stringify(created), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const res = handleApiError(e);
    if (res) return res;
    throw e;
  }
}
