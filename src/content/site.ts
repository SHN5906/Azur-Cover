export const site = {
  name: "Azur Cover",
  shortDescription:
    "Performance thermique et étanchéité, sans compromis.",
  description:
    "Cool roofing, vernis anti-chaleur pour vitrages, étanchéité. Jusqu'à −12 °C en intérieur sans climatisation. Ils nous font confiance : Thales Alenia Space, Métropole Nice, CH Grasse.",
  url: "https://www.azurcover.com",
  email: "contact@azur-cover.com",
  phones: ["+33 6 99 52 23 20", "+33 6 59 88 76 35"],
  address: {
    street: "2721 chemin de Saint-Claude",
    postal: "06600",
    city: "Antibes",
    country: "France",
    full: "2721 chemin de Saint-Claude, 06600 Antibes",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/azur-cover/",
    instagram: "https://www.instagram.com/azurcover/",
    tiktok: "https://www.tiktok.com/@azurcover",
  },
  mapEmbed:
    "https://www.google.com/maps?q=2721%20Chemin%20de%20Saint-Claude%2C%2006600%20Antibes&output=embed",
  mapDeepLink:
    "https://maps.apple.com/?q=2721+Chemin+de+Saint-Claude,+06600+Antibes",
  // Trust micro-credibility (placeholders if not confirmed publicly)
  trust: {
    qualibat: "QUALIBAT",
    siret: "SIRET 814 339 217 00027",
    since: "2015",
  },
  nav: [
    { label: "Accueil", href: "#top" },
    { label: "Expertises", href: "#solutions" },
    { label: "Réalisations", href: "#realisations" },
    { label: "Entreprise", href: "#methodologie" },
    { label: "Contact", href: "#contact" },
  ],
} as const;
