import "server-only";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting, sliding window.
 *
 * Production: backed by Upstash Redis, so the limit is global across every
 * Fluid Compute instance. Provision a store and set UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN (Vercel Marketplace → Upstash).
 *
 * Local dev / unconfigured: falls back to a per-process in-memory map. This
 * is best-effort only (not shared across instances) — fine for local work,
 * but a production deploy should provision Upstash.
 */

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis =
  REDIS_URL && REDIS_TOKEN ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;

// One Ratelimit instance per (maxHits, windowMs) pair — reused across calls.
const limiters = new Map<string, Ratelimit>();

function getLimiter(maxHits: number, windowMs: number): Ratelimit {
  const cacheKey = `${maxHits}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(maxHits, `${windowMs} ms`),
      prefix: "rl",
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

// In-memory fallback — used only when Upstash is not configured.
type Entry = { hits: number[] };
const buckets = new Map<string, Entry>();
let warnedNoRedis = false;

function checkInMemory(key: string, maxHits: number, windowMs: number): RateLimitResult {
  if (!warnedNoRedis && process.env.NODE_ENV === "production") {
    warnedNoRedis = true;
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set — using per-instance " +
        "in-memory rate limiting. Provision Upstash Redis for a global limit.",
    );
  }
  const now = Date.now();
  const entry = buckets.get(key) ?? { hits: [] };
  entry.hits = entry.hits.filter((t) => now - t < windowMs);
  if (entry.hits.length >= maxHits) {
    const oldest = entry.hits[0];
    return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - oldest)) / 1000) };
  }
  entry.hits.push(now);
  buckets.set(key, entry);
  return { ok: true };
}

/**
 * Records a hit and reports whether the caller is under the limit.
 * Returns ok=false with retryAfterSec to surface to the user.
 */
export async function checkRateLimit(
  key: string,
  maxHits: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!redis) return checkInMemory(key, maxHits, windowMs);
  const { success, reset } = await getLimiter(maxHits, windowMs).limit(key);
  if (success) return { ok: true };
  return { ok: false, retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
}

/**
 * Clears the counters for a key (e.g. on a successful login that should
 * "absolve" the client). Use sparingly.
 */
export async function resetRateLimit(key: string): Promise<void> {
  if (!redis) {
    buckets.delete(key);
    return;
  }
  await Promise.all([...limiters.values()].map((l) => l.resetUsedTokens(key)));
}
