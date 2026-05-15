export type Solution = {
  id: string;
  index: string;
  title: string;
  body: string;
  bullets: string[];
  image: { src: string; alt: string };
};

export const solutions: Solution[] = [
  {
    id: "etancheite",
    index: "01",
    title: "Étanchéité.",
    body:
      "Diagnostic, reprise, garantie. Azur Cover intervient sur tous types de toitures — bac acier, étanchéité multicouche, membranes synthétiques, terrasses accessibles. Avec, en option, l'étanchéité réflective : un revêtement blanc qui combine étanchéité et performance thermique en une seule intervention.",
    bullets: [
      "Toitures industrielles et tertiaires",
      "Garantie décennale",
      "Reprise des points faibles existants",
      "Contrats d'entretien long terme",
    ],
    image: {
      src: "/images/solutions/etancheite.png",
      alt: "Ouvrier Azur Cover sur chantier d'étanchéité",
    },
  },
  {
    id: "cool-roofing",
    index: "02",
    title: "Cool Roofing.",
    body:
      "70 % des apports de chaleur passent par la toiture. En été, une toiture classique atteint 70 à 80 °C. Notre revêtement haute performance, enrichi à l'aérogel de silice, en réfléchit 80 à 90 %. Résultat : −30 à −50 °C en surface de toiture, −4 à −8 °C à l'intérieur, jusqu'à 40 % d'économies sur la climatisation.",
    bullets: [
      "Aérogel de silice (issu du domaine spatial)",
      "Application sans travaux lourds",
      "Prolonge la durée de vie de l'étanchéité",
      "ROI typique sous 3 ans",
    ],
    image: {
      src: "/images/solutions/cool-roofing.jpg",
      alt: "Application du revêtement Cool Roofing sur toiture",
    },
  },
  {
    id: "azur-reflect",
    index: "03",
    title: "Azur Reflect.",
    body:
      "Un vernis transparent appliqué directement sur l'extérieur des vitrages. Bloque la chaleur sans réduire la luminosité, sans se décoller comme les films traditionnels. Renvoie 99 % des UV et 90 % des IR. Jusqu'à −12 °C en intérieur mesurés chez nos clients.",
    bullets: [
      "3× plus résistant que les films solaires",
      "Aucune perte de luminosité",
      "Solution permanente, pas d'entretien",
      "30 % d'économie d'énergie",
    ],
    image: {
      src: "/images/solutions/azur-reflect.jpg",
      alt: "Application du vernis anti-chaleur Azur Reflect sur vitrage",
    },
  },
  {
    id: "autres",
    index: "04",
    title: "Autres expertises.",
    body:
      "Contrats d'entretien annuels, Laque Solaire de protection, désamiantage agréé. Pour les sujets connexes à la performance thermique de votre bâtiment, Azur Cover reste votre interlocuteur unique.",
    bullets: [
      "Contrats d'entretien toiture annuels",
      "Laque Solaire de protection",
      "Désamiantage agréé",
      "Solutions sur-mesure",
    ],
    image: {
      src: "/images/solutions/autres.png",
      alt: "Équipe Azur Cover sur chantier",
    },
  },
];
