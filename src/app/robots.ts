import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin n'est volontairement pas listé : le rapport l'exposerait
        // dans un fichier public. La section admin est déjà en noindex via
        // les metadata de src/app/admin/layout.tsx.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
