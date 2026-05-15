import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { site } from "@/content/site";
import "./globals.css";

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

const jetbrainsMono = localFont({
  src: [
    {
      path: "../../public/fonts/JetBrainsMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default:
      "Azur Cover — Expert national en étanchéité et performance thermique",
    template: "%s — Azur Cover",
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
      "Azur Cover — Expert national en étanchéité et performance thermique",
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

const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
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
  sameAs: [site.social.linkedin, site.social.instagram, site.social.tiktok],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="overflow-x-hidden">
        <a href="#main" className="skip-link">
          Aller au contenu principal
        </a>
        {children}
        <Script
          id="ld-json-localbusiness"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {jsonLd}
        </Script>
      </body>
    </html>
  );
}
