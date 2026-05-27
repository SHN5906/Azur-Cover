import { site } from "@/content/site";

export type Crumb = { name: string; url: string };

/**
 * Renders a JSON-LD BreadcrumbList script tag for sub-pages. Output is inline
 * in the HTML so crawlers see it on first byte (no client-side script needed).
 */
export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const base = site.url.replace(/\/$/, "");
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${base}${item.url}`,
    })),
  };
  // No nonce: a JSON-LD data block is not an executable script, so the CSP
  // script-src never applies to it.
  return (
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  );
}
