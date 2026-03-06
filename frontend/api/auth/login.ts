import type { Session } from "../lib/types";
import { getDemoUsers, setSession } from "../lib/store";
import { handleApiError } from "../lib/errors";

function normalizeEmail(s: string) {
  return (s || "").trim().toLowerCase();
}

function randomToken(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "tk-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default async function handler(req: Request) {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
    }
    let body: { email?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Geçersiz body" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const e = normalizeEmail(body.email ?? "");
    const users = await getDemoUsers();
    const u = users.find((x) => x.email === e && x.pass === body.password);
    if (!u) {
      return new Response(JSON.stringify({ error: "Email veya şifre hatalı." }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const session: Session = { email: u.email, role: u.role, name: u.name };
    const token = randomToken();
    await setSession(token, session);
    return new Response(
      JSON.stringify({ session, token }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    const res = handleApiError(e);
    if (res) return res;
    throw e;
  }
}
