import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { expertises } from "@/content/expertises";
import { listRealisations } from "@/lib/realisations-repo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${base}/expertises`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/realisations`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/qui-sommes-nous`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/presse`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const expertiseRoutes: MetadataRoute.Sitemap = expertises.map((e) => ({
    url: `${base}/expertises/${e.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const realisations = await listRealisations();
  const realisationRoutes: MetadataRoute.Sitemap = realisations.map((r) => ({
    url: `${base}/realisations/${r.slug}`,
    lastModified: r.updatedAt ?? now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...expertiseRoutes, ...realisationRoutes];
}
