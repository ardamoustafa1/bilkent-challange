import { isKVError } from "./store";

export function kv503Response(): Response {
  return new Response(
    JSON.stringify({
      error: "Vercel KV yapılandırılmamış. Deploy için KV_REST_API_URL ve KV_REST_API_TOKEN ortam değişkenlerini ayarlayın.",
    }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
}

export function handleApiError(e: unknown): Response | null {
  if (isKVError(e)) return kv503Response();
  return null;
}
