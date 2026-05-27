import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { site } from "@/content/site";
import { expertises } from "@/content/expertises";
import { BotIdGuard } from "@/components/layout/BotIdGuard";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import "./globals.css";

// The nonce CSP (src/proxy.ts) requires server-side rendering on every
// request so each page gets a fresh nonce — static pages have none.
export const dynamic = "force-dynamic";

const inter = localFont({
  src: [
    {
      path: "../../public/fonts/InterVariable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../public/fonts/InterVariable-Italic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default:
      "Azur Cover. Expert national en étanchéité et performance thermique",
    template: "%s. Azur Cover",
  },
  description: site.description,
  keywords: [
    "étanchéité toiture",
    "cool roofing",
    "vernis anti-chaleur vitrage",
    "Azur Reflect",
    "performance thermique bâtiment",
    "Antibes",
    "désamiantage",
  ],
  authors: [{ name: "Azur Cover" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: site.url,
    siteName: site.name,
    title:
      "Azur Cover. Expert national en étanchéité et performance thermique",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Azur Cover",
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fbfbfd",
  width: "device-width",
  initialScale: 1,
};

// JSON-LD graph: LocalBusiness + Organization + 4 Service nodes (one per
// expertise) + WebSite. Rendered inline at SSR for crawler reliability.
const jsonLdGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${site.url}#localbusiness`,
      name: site.name,
      url: site.url,
      email: site.email,
      telephone: site.phones[0],
      description: site.description,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.street,
        postalCode: site.address.postal,
        addressLocality: site.address.city,
        addressCountry: "FR",
      },
      areaServed: { "@type": "Country", name: "France" },
      sameAs: [site.social.linkedin, site.social.instagram, site.social.facebook].filter(Boolean),
    },
    {
      "@type": "Organization",
      "@id": `${site.url}#organization`,
      name: site.name,
      url: site.url,
      logo: `${site.url}/images/brand/logo.png`,
      sameAs: [site.social.linkedin, site.social.instagram, site.social.facebook].filter(Boolean),
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}#website`,
      url: site.url,
      name: site.name,
      inLanguage: "fr-FR",
      publisher: { "@id": `${site.url}#organization` },
    },
    ...expertises.map((e) => ({
      "@type": "Service",
      "@id": `${site.url}/expertises/${e.slug}#service`,
      serviceType: e.title,
      name: e.title,
      description: e.short,
      provider: { "@id": `${site.url}#localbusiness` },
      areaServed: { "@type": "Country", name: "France" },
      url: `${site.url}/expertises/${e.slug}`,
    })),
  ],
};
const jsonLd = JSON.stringify(jsonLdGraph);

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={inter.variable}
    >
      <body className="overflow-x-clip">
        {/* Vercel BotID — patches fetch/XHR for protected routes (invisible) */}
        <BotIdGuard />
        <a href="#main" className="skip-link">
          Aller au contenu principal
        </a>
        <ScrollProgress />
        {children}
        <CommandPalette />
        {/* Static JSON-LD graph, rendered inline so crawlers see it on first
            byte. No nonce: a JSON-LD data block is not an executable script,
            so the CSP script-src never applies to it. */}
        <script type="application/ld+json">{jsonLd}</script>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
