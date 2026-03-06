import { getTeams } from "./lib/store";

export default async function handler() {
  try {
    await getTeams();
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Vercel KV yapılandırılmamış. KV_REST_API_URL ve KV_REST_API_TOKEN ortam değişkenlerini ayarlayın.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}
