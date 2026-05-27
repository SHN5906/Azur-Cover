import { NextResponse } from "next/server";
import { auth } from "@/auth";

const isDev = process.env.NODE_ENV === "development";

/**
 * Per-request Content-Security-Policy.
 *
 * Production: script-src uses a fresh nonce + 'strict-dynamic' (no
 * 'unsafe-inline'). Next.js reads the nonce from this header and applies it
 * to every script it emits. This requires the production build to run on
 * Webpack (`next build --webpack`) — Turbopack currently emits one shared
 * chunk without the nonce, which 'strict-dynamic' would block.
 *
 * Development: the dev server runs on Turbopack (which has that same nonce
 * gap), so dev falls back to 'unsafe-inline'/'unsafe-eval'. The M1 finding
 * is about production only — dev posture does not affect it.
 *
 * style-src keeps 'unsafe-inline' in both: inline `style={}` attributes
 * cannot carry a nonce, and 'strict-dynamic' does not affect style-src.
 */
function buildCsp(nonce: string): string {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://maps.googleapis.com https://maps.gstatic.com https://*.googleusercontent.com https://i.ytimg.com https://i.vimeocdn.com",
    "font-src 'self' data:",
    "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
    "media-src 'self' https://*.public.blob.vercel-storage.com",
    "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/**
 * Runs on every page request: injects the nonce-based CSP, and gates /admin/*
 * by validating the JWT + admin email. Defense in depth — pages and server
 * actions still call requireAdmin().
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  // Authenticated gate for /admin/* (login page stays public).
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionEmail = req.auth?.user?.email?.toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

    if (!sessionEmail) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = `?from=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    if (!adminEmail || sessionEmail !== adminEmail) {
      // Connected but not admin: don't reveal /admin exists, send home.
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Forward the nonce to the renderer via a request header, and set the CSP
  // on the response.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
});

export const config = {
  // Run on all page requests except static assets and Next internals. Skip
  // prefetches — they don't render HTML and don't need the CSP header.
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
