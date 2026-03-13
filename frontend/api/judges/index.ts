import type { Judge } from "../lib/types";
import { getJudges, createJudge } from "../lib/store";
import { requireAuth } from "../lib/auth";
import { handleApiError } from "../lib/errors";

function safeId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "j-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default async function handler(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    if (req.method === "GET") {
      const list = await getJudges();
      return new Response(JSON.stringify(list), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      let body: { name?: string; email?: string; school?: string };
      try {
        body = await req.json();
      } catch {
        return new Response(JSON.stringify({ error: "Geçersiz body" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const name = String(body.name ?? "").trim();
      const email = String(body.email ?? "").trim().toLowerCase();
      const school = body.school ? String(body.school).trim() : undefined;
      if (!name) {
        return new Response(JSON.stringify({ error: "Hakem adı gerekli." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const judge: Judge = {
        id: safeId(),
        name,
        email,
        school,
        createdAtISO: new Date().toISOString(),
      };
      const created = await createJudge(judge);
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
