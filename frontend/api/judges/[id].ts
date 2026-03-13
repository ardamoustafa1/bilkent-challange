import type { Judge } from "../lib/types";
import { getJudgeById, updateJudge, deleteJudge } from "../lib/store";
import { requireAuth } from "../lib/auth";
import { handleApiError } from "../lib/errors";

function getIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/api\/judges\/([^/]+)\/?$/);
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
      const judge = await getJudgeById(id);
      if (!judge) {
        return new Response(JSON.stringify({ error: "Hakem bulunamadı." }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify(judge), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (req.method === "PUT") {
      let body: Partial<Judge>;
      try {
        body = await req.json();
      } catch {
        return new Response(JSON.stringify({ error: "Geçersiz body" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      const updated = await updateJudge(id, { name: body.name, email: body.email, school: body.school });
      if (!updated) {
        return new Response(JSON.stringify({ error: "Hakem bulunamadı." }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (req.method === "DELETE") {
      const ok = await deleteJudge(id);
      if (!ok) {
        return new Response(JSON.stringify({ error: "Hakem bulunamadı." }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const res = handleApiError(e);
    if (res) return res;
    throw e;
  }
}
