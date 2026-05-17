import "server-only";

/**
 * Typed access to required env vars. Throws clear errors at first
 * access if missing — so a misconfigured deploy fails fast at the
 * point of use rather than producing mysterious runtime errors.
 *
 * Don't throw at module load — build-time eval would crash CI before
 * env vars are injected.
 */
type EnvKey =
  | "DATABASE_URL"
  | "AUTH_SECRET"
  | "ADMIN_EMAIL"
  | "ADMIN_PASSWORD"
  | "BLOB_READ_WRITE_TOKEN"
  | "RESEND_API_KEY";

const REQUIRED: EnvKey[] = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "BLOB_READ_WRITE_TOKEN",
];

/**
 * Lazy-validated env var access. Throws with a clear message if the
 * variable is missing or empty. Use this everywhere instead of
 * `process.env.X!` to get a useful error instead of a cryptic
 * "undefined is not a function" downstream.
 */
export function requireEnv(name: EnvKey): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(
      `[env] Missing required environment variable: ${name}. ` +
        `Set it via 'vercel env add ${name}' or in .env.local for local dev.`,
    );
  }
  return v;
}

/**
 * Optional env var. Returns undefined if not set.
 */
export function optionalEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v : undefined;
}

/**
 * Audit all required env vars. Returns the list of missing ones.
 * Use at boot / health check to surface config problems early
 * without crashing the whole app.
 */
export function auditRequiredEnv(): { ok: boolean; missing: EnvKey[] } {
  const missing = REQUIRED.filter((k) => {
    const v = process.env[k];
    return !v || v.trim() === "";
  });
  return { ok: missing.length === 0, missing };
}
