export type FAQItem = {
  question: string;
  answer: string[];
  category: "Cool Roofing" | "Azur Reflect" | "Étanchéité" | "Général";
};

export const faqItems: FAQItem[] = [
  {
    category: "Cool Roofing",
    question: "Votre solution a-t-elle un impact en hiver ?",
    answer: [
      "En hiver, l’inclinaison du soleil change, et l’apport thermique provient principalement des murs plutôt que du toit. Notre solution est donc conçue pour maximiser le confort thermique sans impacter négativement les bénéfices solaires hivernaux.",
      "Pour estimer vos économies sur une année complète, contactez-nous pour un diagnostic personnalisé.",
    ],
  },
  {
    category: "Cool Roofing",
    question: "Faut-il une autorisation d’urbanisme pour installer le Cool Roofing ?",
    answer: [
      "Nous nous adaptons aux exigences de l’urbanisme grâce à nos teintes proches du blanc, qui respectent les règles en vigueur. De plus, si le toit n’est pas visible, aucune Déclaration Préalable (DP) n’est requise.",
      "Vous n’avez rien à faire : nous nous occupons de toutes les vérifications nécessaires.",
    ],
  },
  {
    category: "Cool Roofing",
    question: "Le revêtement améliore-t-il le rendement des panneaux photovoltaïques ?",
    answer: [
      "Oui. Notre revêtement permet d’augmenter la productivité des installations photovoltaïques. Vous pouvez obtenir jusqu’à +8 % de rendement sur les panneaux monofaciaux et +22 % sur les panneaux bifaciaux, optimisant votre production d’énergie solaire.",
      "Vous êtes déjà équipé de panneaux solaires et souhaitez booster leur rendement cet été ? Demandez un diagnostic gratuit de votre toiture.",
    ],
  },
  {
    category: "Cool Roofing",
    question: "Y a-t-il un impact sur les bâtiments voisins ?",
    answer: [
      "L’impact dépend principalement de la structure du toit. Avec un toit plat, la lumière sera diffusée. Avec un toit en dents de scie, elle sera réfléchie de manière spéculaire. La hauteur et la distance des bâtiments environnants jouent également un rôle.",
      "Toutefois, nos retours d’expérience sur de nombreux chantiers montrent qu’il n’y a pas de gêne significative, et que des solutions d’orientation existent pour les configurations sensibles.",
    ],
  },
  {
    category: "Général",
    question: "Vos solutions sont-elles certifiées ?",
    answer: [
      "Oui. Nos solutions sont approuvées par le CSTB et disposent de toutes les accréditations nécessaires, y compris la certification B-ROOF T3.",
      "Toutes les données que nous avançons sont certifiées et vérifiées, garantissant la fiabilité et la performance de nos solutions.",
    ],
  },
  {
    category: "Général",
    question: "Pouvez-vous mesurer précisément les gains sur mon bâtiment ?",
    answer: [
      "Oui. Nous avons la possibilité de faire appel à un bureau d’étude spécialisé si vous souhaitez une analyse détaillée des gains.",
      "Nous pouvons également mettre en place un protocole IPMVP (International Performance Measurement and Verification Protocol) pour mesurer précisément l’impact de notre solution sur un projet pilote, garantissant des résultats fiables et auditables.",
    ],
  },
  {
    category: "Général",
    question: "Quelle est la différence avec les peintures réflectives du commerce ?",
    answer: [
      "Notre différence réside dans l’utilisation de l’aérogel de silice, une technologie innovante et hautement performante.",
      "Contrairement aux produits standards que l’on trouve sur Amazon, Leroy Merlin ou Castorama, nos solutions sont issues d’une expertise avancée et d’un processus de fabrication complexe. Nous ne vendons pas de simples peintures, mais une solution technique de pointe, conçue pour offrir des performances bien supérieures aux revêtements réflectifs classiques.",
    ],
  },
  {
    category: "Azur Reflect",
    question: "Combien de temps dure le vernis Azur Reflect ?",
    answer: [
      "Azur Reflect est une solution permanente. Contrairement aux films solaires traditionnels qui se décollent et perdent en performance, notre vernis ne se dégrade pas dans le temps.",
      "3 fois plus résistant que les films classiques, il maintient ses performances sur le long terme sans entretien spécifique.",
    ],
  },
  {
    category: "Azur Reflect",
    question: "Y a-t-il une perte de luminosité avec Azur Reflect ?",
    answer: [
      "Non. C’est même l’un des principaux avantages d’Azur Reflect : la solution préserve intégralement la transparence des vitrages et la luminosité naturelle.",
      "Idéal pour les écoles, bureaux, commerces et bâtiments recevant du public, où la lumière naturelle est essentielle au confort des occupants.",
    ],
  },
  {
    category: "Azur Reflect",
    question: "Combien de temps dure l’application ?",
    answer: [
      "L’application est rapide : de quelques heures à quelques jours selon la surface à traiter. L’intervention se fait depuis l’extérieur du bâtiment, sans démontage, sans bâche, sans interruption d’activité.",
    ],
  },
  {
    category: "Étanchéité",
    question: "Quelle est la durée de garantie sur l’étanchéité ?",
    answer: [
      "Toutes nos interventions d’étanchéité sont couvertes par la garantie décennale. Nos équipes justifient de plus de 45 ans d’expérience cumulée dans le domaine.",
    ],
  },
  {
    category: "Étanchéité",
    question: "Pouvez-vous combiner étanchéité et performance thermique ?",
    answer: [
      "Oui. C’est l’un de nos atouts majeurs : la toiture réfléchissante combine étanchéité et performance thermique en une seule intervention.",
      "Trois technologies maîtrisées : membrane bitumineuse réflective, membrane synthétique (EPDM/PVC/TPO), étanchéité liquide réflective. Le choix se fait selon la nature de votre support et vos contraintes.",
    ],
  },
  {
    category: "Général",
    question: "Sur quelle zone géographique intervenez-vous ?",
    answer: [
      "Notre siège est à Antibes (Alpes-Maritimes), mais nos équipes interviennent dans toute la France. Nous nous déplaçons partout pour les diagnostics et les chantiers.",
    ],
  },
  {
    category: "Général",
    question: "Comment se passe un diagnostic ?",
    answer: [
      "Le diagnostic est gratuit et sans engagement. Nous nous déplaçons sur site pour étudier votre bâtiment, mesurer les températures, comprendre vos contraintes, et revenir sous 48 h avec une estimation de gains thermiques et un planning d’intervention.",
    ],
  },
];

export function faqByCategory() {
  const groups: Record<string, FAQItem[]> = {};
  for (const item of faqItems) {
    (groups[item.category] ??= []).push(item);
  }
  return groups;
}
