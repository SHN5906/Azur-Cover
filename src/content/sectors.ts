export type Sector = {
  id: string;
  title: string;
  description: string;
  image: { src: string; alt: string };
};

export const sectors: Sector[] = [
  {
    id: "industrie",
    title: "Industrie",
    description:
      "Usines, sites de production, entrepôts logistiques. Toitures grande surface, isolation des process.",
    image: {
      src: "/images/sectors/industrie.jpg",
      alt: "Site industriel équipé par Azur Cover",
    },
  },
  {
    id: "tertiaire",
    title: "Tertiaire",
    description:
      "Bureaux, commerces, hôtels. Confort thermique des espaces recevant du public.",
    image: {
      src: "/images/sectors/tertiaire.jpg",
      alt: "Bâtiment tertiaire équipé par Azur Cover",
    },
  },
  {
    id: "collectivites",
    title: "Collectivités",
    description:
      "Mairies, écoles, hôpitaux, équipements publics. Marchés publics maîtrisés.",
    image: {
      src: "/images/sectors/collectivites.jpg",
      alt: "Établissement public équipé par Azur Cover",
    },
  },
];
