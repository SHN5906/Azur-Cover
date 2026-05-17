import type { NextConfig } from "next";
import path from "node:path";
import { withBotId } from "botid/next/config";

// CSP — autorise les ressources qu'on utilise réellement :
// - inline scripts (Next.js hydration + JSON-LD)
// - inline styles (Tailwind + style props)
// - images Blob + maps
// - Vercel Analytics + Speed Insights
// - iframe Google Maps
//
// En dev, Next.js a besoin de 'unsafe-eval' pour reconstruire les callstacks
// (DevTools, error overlay). React ne l'utilise jamais en prod. On l'autorise
// donc uniquement quand NODE_ENV=development.
const isDev = process.env.NODE_ENV === "development";
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vitals.vercel-insights.com"
  : "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vitals.vercel-insights.com";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://maps.googleapis.com https://maps.gstatic.com https://*.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Force HTTPS pendant 2 ans (subdomains inclus)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Bloque MIME-sniffing (force Content-Type)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Bloque clickjacking (frame-ancestors 'none' fait double emploi mais X-Frame est encore lu par certains navigateurs)
  { key: "X-Frame-Options", value: "DENY" },
  // Politique de referrer : envoie l'origin mais pas le path en cross-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restreint les API navigateur sensibles
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  },
  // CSP — protection XSS principale
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  // Retire le header X-Powered-By: Next.js (info disclosure)
  poweredByHeader: false,
  experimental: {
    authInterrupts: true,
  },
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

// withBotId injects same-origin rewrites that proxy the Kasada challenge to
// api.vercel.com. No CSP changes needed — all client fetches stay on 'self'.
export default withBotId(nextConfig);
