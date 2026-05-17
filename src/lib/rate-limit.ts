import "server-only";
import { headers } from "next/headers";

/**
 * Rate limit en mémoire process — best-effort sur Vercel Fluid Compute
 * (partagé entre requêtes concurrentes du même instance, pas global).
 * Pour un usage admin solo c'est suffisant ; pour une charge élevée
 * passer sur Upstash Redis + @upstash/ratelimit.
 *
 * Fenêtre glissante simple : on garde le timestamp de chaque hit et
 * on filtre ceux hors fenêtre à chaque check.
 */
type Entry = { hits: number[] };
const buckets = new Map<string, Entry>();

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export type RateLimitResult =
  | { ok: true; remaining: number; resetMs: number }
  | { ok: false; retryAfterSec: number };

/**
 * Sliding-window rate limit. Returns ok=true if under limit, false
 * otherwise with retryAfterSec to display to the user.
 */
export function checkRateLimit(
  key: string,
  maxHits: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key) ?? { hits: [] };
  // Drop hits outside the window
  entry.hits = entry.hits.filter((t) => now - t < windowMs);
  if (entry.hits.length >= maxHits) {
    const oldest = entry.hits[0];
    return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - oldest)) / 1000) };
  }
  entry.hits.push(now);
  buckets.set(key, entry);
  return { ok: true, remaining: maxHits - entry.hits.length, resetMs: windowMs };
}

/**
 * Manual reset (e.g. on successful action that should "absolve" the
 * client). Use sparingly.
 */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}
