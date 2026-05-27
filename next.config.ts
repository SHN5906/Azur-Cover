import type { NextConfig } from "next";
import path from "node:path";
import { withBotId } from "botid/next/config";

// Note : la Content-Security-Policy n'est pas posée ici. Elle est générée
// par requête dans `src/proxy.ts` avec un nonce frais (script-src à nonce +
// strict-dynamic). Une CSP statique ici ferait double emploi et entrerait en
// conflit avec celle du proxy.
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
