export type Solution = "Étanchéité" | "Cool Roofing" | "Azur Reflect" | "Multi-solutions";

export type Realisation = {
  slug: string;
  title: string;
  client: string;
  city: string;
  solution: Solution;
  surface?: string;
  duration: string;
  year: string;
  /** Carousel + card description (≤200 chars) */
  short: string;
  /** Long-form story for the dedicated page (markdown-friendly paragraphs) */
  story: string[];
  results?: { value: string; label: string }[];
  image: { src: string; alt: string };
  /** Path to the client logo PNG, when one exists in the client list. */
  logo?: string;
};

// Source : pages /realisations-tertiaire/* du site azurcover.com
// (scrapées via Googlebot UA). Quand la page n'avait pas de description
// détaillée, on se contente de la fiche technique pour ne pas inventer.
export const realisations: Realisation[] = [
  {
    slug: "promocash",
    title: "Promocash",
    client: "Promocash",
    city: "Grasse",
    solution: "Cool Roofing",
    surface: "2 700 m²",
    duration: "3 semaines",
    year: "2024",
    short: "Application Cool Roofing sur la toiture industrielle PromoCash de Grasse.",
    story: [
      "Application du revêtement Cool Roofing sur l'intégralité de la toiture industrielle de PromoCash à Grasse.",
    ],
    image: {
      src: "/images/realisations/promocash.jpg",
      alt: "Toiture industrielle Promocash après application Cool Roofing",
    },
    logo: "/images/clients/promocash.png",
  },
  {
    slug: "ecole-cannes",
    title: "École Jacqueline de Romilly",
    client: "Mairie de Cannes",
    city: "Cannes",
    solution: "Azur Reflect",
    duration: "2 semaines",
    year: "2024",
    short:
      "Application Azur Reflect sur les vitrages d'une école primaire. Mesures par sondes : 3 à 4 °C de moins dans les classes traitées par rapport aux classes témoins.",
    story: [
      "À l'école Jacqueline de Romilly de Cannes, les épisodes de forte chaleur rendaient les conditions d'enseignement quasiment impraticables. Face à l'urgence et à l'inconfort des élèves, les enseignants avaient dû improviser des solutions de fortune, allant jusqu'à installer des couvertures de survie sur les vitres.",
      "Pour valider l'efficacité de notre intervention, nous avons mis en place des sondes : comparaison en temps réel entre les classes traitées par Azur Reflect et des classes témoins non traitées (exposition identique).",
      "Les relevés ont été sans appel. Lors des pics de chaleur, nous avons enregistré une différence moyenne de 3 à 4 °C en faveur des classes équipées. Confort visuel : contrairement aux couvertures de survie, Azur Reflect préserve la lumière naturelle et la transparence du verre.",
    ],
    results: [
      { value: "3 à 4 °C", label: "vs classes témoins, en pic chaleur" },
    ],
    image: {
      src: "/images/realisations/ecole-cannes.jpg",
      alt: "École primaire à Cannes traitée au vernis Azur Reflect",
    },
    logo: "/images/clients/cannes.png",
  },
  {
    slug: "netto-grasse",
    title: "Netto",
    client: "Netto",
    city: "Grasse",
    solution: "Cool Roofing",
    surface: "1 800 m²",
    duration: "3 semaines",
    year: "2023",
    short: "Cool Roofing sur la toiture du magasin Netto à Grasse.",
    story: [
      "Application Cool Roofing sur la toiture du magasin Netto de Grasse.",
    ],
    image: {
      src: "/images/realisations/netto.jpg",
      alt: "Toiture du magasin Netto après application Cool Roofing",
    },
    logo: "/images/clients/netto.png",
  },
  {
    slug: "uexpress-saint-laurent",
    title: "U Express",
    client: "U Express",
    city: "Saint-Laurent-du-Var",
    solution: "Azur Reflect",
    duration: "2 jours",
    year: "2024",
    short:
      "Vitrines commerciales d'un U Express traitées Azur Reflect. Stop chaleur sans perte de transparence.",
    story: [
      "Situé près de Nice, U Express dispose d'une large devanture vitrée. Si cette visibilité est un atout commercial, elle exposait la zone d'entrée et les premiers rayons à un rayonnement solaire intense, augmentant la température intérieure et sollicitant l'installation de climatisation de manière excessive.",
      "Nos équipes ont procédé à l'application de la solution Azur Reflect sur l'intégralité de la façade vitrée. L'objectif : stopper la chaleur tout en conservant une transparence pour laisser voir l'intérieur du magasin aux passants.",
    ],
    image: {
      src: "/images/realisations/u-express.jpg",
      alt: "Vitrines U Express traitées au vernis Azur Reflect",
    },
    logo: "/images/clients/u-express.png",
  },
  {
    slug: "chu-grasse",
    title: "CHU de Grasse",
    client: "Centre Hospitalier de Grasse",
    city: "Grasse",
    solution: "Azur Reflect",
    duration: "3 jours",
    year: "2024",
    short: "Intervention Azur Reflect au Centre Hospitalier de Grasse.",
    story: [
      "Intervention au Centre Hospitalier de Grasse : application du vernis Azur Reflect sur les vitrages exposés au plein sud.",
    ],
    image: {
      src: "/images/realisations/chu-grasse.jpg",
      alt: "Vitrages du CHU de Grasse traités au vernis Azur Reflect",
    },
    logo: "/images/clients/ch-grasse.png",
  },
  {
    slug: "mairie-fayence",
    title: "Mairie de Fayence",
    client: "Mairie de Fayence",
    city: "Fayence",
    solution: "Cool Roofing",
    duration: "1 semaine",
    year: "2024",
    short: "Cool Roofing sur la mairie de Fayence (83440).",
    story: [
      "Application Cool Roofing sur la toiture de la mairie de Fayence.",
    ],
    image: {
      src: "/images/realisations/mairie-fayence.jpg",
      alt: "Toiture de la mairie de Fayence après Cool Roofing",
    },
    logo: "/images/clients/fayence.png",
  },
  {
    slug: "marcel-fils",
    title: "Marcel & Fils",
    client: "Marcel & Fils",
    city: "La Fare-les-Oliviers",
    solution: "Azur Reflect",
    duration: "1 jour",
    year: "2024",
    short: "Application Azur Reflect chez Marcel & Fils, La Fare-les-Oliviers.",
    story: ["Intervention Azur Reflect chez Marcel & Fils."],
    image: {
      src: "/images/realisations/marcel-fils.jpg",
      alt: "Vitrines Marcel & Fils traitées Azur Reflect",
    },
    logo: "/images/clients/marcel-fils.png",
  },
  {
    slug: "satoriz-antibes",
    title: "Satoriz",
    client: "Satoriz Magasins Bio",
    city: "Antibes",
    solution: "Azur Reflect",
    duration: "1 jour",
    year: "2024",
    short: "Application Azur Reflect chez Satoriz à Antibes.",
    story: ["Intervention Azur Reflect chez Satoriz à Antibes."],
    image: {
      src: "/images/realisations/satoriz.jpg",
      alt: "Équipe Azur Cover devant le magasin Satoriz Antibes",
    },
    logo: "/images/clients/satoriz.png",
  },
  {
    slug: "intermarche-nice",
    title: "Intermarché",
    client: "Intermarché",
    city: "Nice",
    solution: "Azur Reflect",
    duration: "2 jours",
    year: "2024",
    short: "Application Azur Reflect dans un Intermarché à Nice.",
    story: ["Intervention Azur Reflect chez Intermarché à Nice."],
    image: {
      src: "/images/realisations/intermarche.jpg",
      alt: "Vitrines Intermarché Nice traitées Azur Reflect",
    },
    logo: "/images/clients/intermarche.png",
  },
  {
    slug: "vitrolles",
    title: "Commune de Vitrolles",
    client: "Ville de Vitrolles",
    city: "Vitrolles",
    solution: "Cool Roofing",
    duration: "1 semaine",
    year: "2024",
    short: "Intervention Cool Roofing pour la commune de Vitrolles.",
    story: ["Intervention Cool Roofing pour la commune de Vitrolles."],
    image: {
      src: "/images/realisations/vitrolles.jpg",
      alt: "Équipement public à Vitrolles traité Cool Roofing",
    },
  },
  {
    slug: "laboratoire-braja",
    title: "Laboratoire Braja Vesigné",
    client: "Groupe Braja",
    city: "Gardanne",
    solution: "Cool Roofing",
    duration: "1 semaine",
    year: "2024",
    short:
      "Cool Roofing sur la toiture bac acier du Laboratoire Braja Vesigné, Gardanne.",
    story: [
      "Intervention Cool Roofing sur une toiture bac acier au Laboratoire Braja Vesigné à Gardanne.",
    ],
    image: {
      src: "/images/realisations/laboratoire-braja.jpg",
      alt: "Toiture bac acier du Laboratoire Braja Vesigné après Cool Roofing",
    },
    logo: "/images/clients/groupe-braja.png",
  },
  {
    slug: "ehpad-petit-paris",
    title: "EHPAD Le Petit Paris",
    client: "EHPAD Le Petit Paris",
    city: "Grasse",
    solution: "Azur Reflect",
    duration: "1 jour",
    year: "2024",
    short: "Application Azur Reflect à l'EHPAD Le Petit Paris à Grasse.",
    story: [
      "Application du vernis Azur Reflect à l'EHPAD Le Petit Paris à Grasse.",
    ],
    image: {
      src: "/images/realisations/ehpad-petit-paris.jpg",
      alt: "EHPAD Le Petit Paris à Grasse traité Azur Reflect",
    },
  },
];

export function getRealisation(slug: string) {
  return realisations.find((r) => r.slug === slug);
}
