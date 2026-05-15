export type Realisation = {
  id: string;
  title: string;
  client: string;
  solution: "Étanchéité" | "Cool Roofing" | "Azur Reflect";
  year: string;
  image: { src: string; alt: string };
};

export const realisations: Realisation[] = [
  {
    id: "promocash",
    title: "Toiture PromoCash",
    client: "Promocash",
    solution: "Cool Roofing",
    year: "2024",
    image: {
      src: "/images/realisations/promocash.jpg",
      alt: "Toiture industrielle Promocash après application Cool Roofing",
    },
  },
  {
    id: "ecole-cannes",
    title: "École primaire",
    client: "Ville de Cannes",
    solution: "Azur Reflect",
    year: "2024",
    image: {
      src: "/images/realisations/ecole-cannes.jpg",
      alt: "École primaire à Cannes traitée au vernis Azur Reflect",
    },
  },
  {
    id: "netto",
    title: "Toiture Netto",
    client: "Netto",
    solution: "Cool Roofing",
    year: "2023",
    image: {
      src: "/images/realisations/netto.jpg",
      alt: "Toiture du magasin Netto après notre solution Cool Roofing",
    },
  },
];
