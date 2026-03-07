/**
 * Basit HTML sanitizer — XSS koruması.
 * Script taglarını, event handler'larını ve tehlikeli html öğelerini temizler.
 */
const DANGEROUS_TAGS = /<\s*\/?\s*(script|iframe|object|embed|form|link|style|meta|base)\b[^>]*>/gi;
const EVENT_HANDLERS = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const DATA_URLS = /(?:src|href|action)\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi;

export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return input;
  return input
    .replace(DANGEROUS_TAGS, "")
    .replace(EVENT_HANDLERS, "")
    .replace(DATA_URLS, "")
    .trim();
}
