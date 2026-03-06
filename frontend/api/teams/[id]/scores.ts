import type { Team } from "../../lib/types";
import { updateTeamScores } from "../../lib/store";
import { requireAuth } from "../../lib/auth";
import { handleApiError } from "../../lib/errors";

function getIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/api\/teams\/([^/]+)\/scores\/?$/);
  return match ? match[1] : null;
}

export default async function handler(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    if (req.method !== "PATCH") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
    }
    const url = new URL(req.url);
    const id = getIdFromPath(url.pathname);
    if (!id) {
      return new Response(JSON.stringify({ error: "id gerekli" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    let body: { scores?: Team["scores"]; badges?: Team["badges"]; judgeNote?: string; scoresEnteredByJudgeId?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Geçersiz body" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const updated = await updateTeamScores(id, body.scores ?? {} as Team["scores"], body.badges ?? [], body.judgeNote ?? "", body.scoresEnteredByJudgeId);
    if (!updated) {
      return new Response(JSON.stringify({ error: "Takım bulunamadı." }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const res = handleApiError(e);
    if (res) return res;
    throw e;
  }
}
