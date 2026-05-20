export type Expertise = {
  slug: "etancheite" | "cool-roofing" | "azur-reflect" | "autres";
  index: string;
  title: string;
  short: string;
  hero: { eyebrow: string; title: string; lead: string };
  problem: { title: string; body: string[] };
  solution: { title: string; body: string[] };
  /** Numbered key-figures shown as a band ("KPIs") */
  kpis: { value: string; label: string }[];
  /** Long-form sub-sections, each a block */
  sections: { title: string; body: string[] }[];
  bullets: string[];
  cta: string;
  image: { src: string; alt: string };
};

export const expertises: Expertise[] = [
  /* ───────────────────── 01 ÉTANCHÉITÉ ───────────────────── */
  {
    slug: "etancheite",
    index: "01",
    title: "Étanchéité",
    short:
      "Diagnostic, reprise, garantie. Tous types de toitures, avec en option l’étanchéité réflective qui combine étanchéité et performance thermique.",
    hero: {
      eyebrow: "01. Expertise",
      title: "Étanchéité.",
      lead:
        "Diagnostic, reprise, garantie. Azur Cover intervient sur tous types de toitures avec, en option, l’étanchéité réflective : un revêtement blanc qui combine étanchéité et performance thermique en une seule intervention.",
    },
    problem: {
      title: "Le problème",
      body: [
        "Les toitures sont parmi les parties d’un bâtiment les plus exposées aux intempéries : vent, pluie, neige, grêle. Qu'elles soient accessibles ou non, leur étanchéité n’est pas une option : une défaillance peut rapidement entraîner des infiltrations d’eau et des dommages difficiles à contenir.",
        "Les conséquences d’une mauvaise étanchéité sont souvent sous-estimées. Humidité persistante, moisissures, murs fissurés. ces désordres touchent autant l’intérieur que l’extérieur du bâtiment. Dans les cas les plus sérieux, c’est l’isolation ou la charpente qui est atteinte, avec des coûts de réparation considérables.",
      ],
    },
    solution: {
      title: "Notre approche",
      body: [
        "Accompagnés d’experts justifiant de plus de 45 ans d’expérience dans le domaine de l’étanchéité, les équipes d’Azur Cover interviennent sur des chantiers de toutes tailles et de tous types. Chaque projet est pris en charge avec le même niveau d’exigence, et des solutions complémentaires peuvent être proposées pour combiner étanchéité et performance thermique.",
        "La toiture réfléchissante repose sur l’application d’une membrane de couleur blanche qui joue un rôle clé sur deux aspects : la réflectivité et la longévité du toit. En renvoyant une partie de la chaleur solaire, elle permet de maintenir une température intérieure plus fraîche et plus stable, tout en limitant les chocs thermiques sur la membrane.",
      ],
    },
    kpis: [],
    sections: [
      {
        title: "Étanchéité en membrane bitumineuse réflective",
        body: [
          "La membrane bitumineuse est une solution d’étanchéité constituée d’une armature enrobée de bitume, disponible en rouleau et posée par soudage ou fixation mécanique. Économique et rapide à mettre en œuvre, elle s’adapte à tous les types de toiture, y compris les surfaces complexes.",
          "Azur Cover propose une gamme de membranes bitumineuses alliant performance et écoresponsabilité. Les versions réflectives offrent plusieurs avantages : étanchéité efficace, réduction notable de la température en toiture, meilleure performance énergétique. En accumulant moins la chaleur, elles limitent les phénomènes de dilatation thermique, préservant l’intégrité de la membrane sur le long terme.",
        ],
      },
      {
        title: "Étanchéité en membrane synthétique",
        body: [
          "Les membranes synthétiques (EPDM, PVC ou TPO) s’adaptent à tous les types de supports. béton, acier, bois. et à toutes les formes de toiture. Discrètes et polyvalentes, elles se posent par fixation mécanique, parfois à l’aide d’une colle.",
          "Légères, résistantes, disponibles dans une large gamme de coloris. Les versions réflectives sont particulièrement appréciées : en accumulant moins la chaleur, elles contribuent à réduire les phénomènes de dilatation thermique et améliorent le confort intérieur.",
        ],
      },
      {
        title: "Étanchéité liquide réflective",
        body: [
          "L'étanchéité liquide est une solution polyvalente, adaptée aussi bien aux grandes surfaces qu’aux espaces plus restreints, circulables ou non. Elle répond à une grande variété de situations : protections sous carrelage ou dalles amovibles, coupoles en béton, terrasses techniques.",
          "La mise en service est rapide. la surface est circulable en 24 à 72 heures après application. Une fois polymérisée, la membrane forme un film continu et sans joints, offrant une excellente adhérence sur tous types de support et une bonne résistance aux poinçonnements, statique comme dynamique.",
          "Sur le plan thermique, cette solution réduit la conduction de chaleur dans le bâtiment dès son application. Particulièrement adaptée à la rénovation, elle permet de redonner vie à des surfaces endommagées sans recourir à des protections lourdes. un levier intéressant pour la performance globale du bâtiment.",
        ],
      },
    ],
    bullets: [
      "Toitures industrielles et tertiaires, accessibles ou non",
      "Garantie décennale sur toutes nos interventions",
      "Reprise des points faibles existants",
      "Contrats d’entretien long terme",
    ],
    cta: "En savoir plus",
    image: {
      src: "/images/solutions/etancheite.jpg",
      alt: "Ouvrier Azur Cover sur chantier d’étanchéité",
    },
  },

  /* ───────────────────── 02 COOL ROOFING ───────────────────── */
  {
    slug: "cool-roofing",
    index: "02",
    title: "Cool Roofing",
    short:
      "Revêtement haute performance enrichi à l’aérogel de silice. Réfléchit 80 à 90 % du rayonnement solaire. −4 à −8 °C à l’intérieur, jusqu’à 40 % d’économies sur la climatisation.",
    hero: {
      eyebrow: "02. Expertise",
      title: "Cool Roofing.",
      lead:
        "70 % des apports de chaleur passent par la toiture. Notre revêtement haute performance, enrichi à l’aérogel de silice, en réfléchit 80 à 90 %. Résultat : −30 à −50 °C en surface de toiture, −4 à −8 °C à l’intérieur, jusqu’à 40 % d’économies sur la climatisation.",
    },
    problem: {
      title: "Le problème",
      body: [
        "Dans la majorité des bâtiments, jusqu’à 70 % des apports de chaleur proviennent de la toiture. Sous l’effet du rayonnement solaire, une toiture classique peut atteindre 70 à 80 °C en été, transformant le bâtiment en véritable accumulateur thermique.",
        "Résultat : la chaleur pénètre en continu, les températures intérieures deviennent difficiles à maîtriser, et les systèmes de climatisation fonctionnent en surcharge permanente. Les consommations énergétiques peuvent dépasser 30 à 50 % de hausse, avec une usure accélérée des équipements.",
        "Les solutions traditionnelles. isolation seule, climatisation, membranes standards. ne traitent pas la cause réelle : l’absorption du rayonnement solaire. Pire, les cycles thermiques répétés provoquent une dilatation constante des matériaux, ce qui accélère le vieillissement des membranes d’étanchéité.",
      ],
    },
    solution: {
      title: "Notre approche",
      body: [
        "Azur Cover agit directement à la source avec une solution de Cool Roofing haute performance. Le revêtement appliqué en surface permet de réfléchir jusqu’à 80 à 90 % du rayonnement solaire, réduisant drastiquement la température de la toiture.",
        "En limitant les chocs thermiques, la solution permet également de prolonger la durée de vie des membranes d’étanchéité, en réduisant leur vieillissement prématuré (UV, fissuration, dilatation). Le résultat est immédiat : un bâtiment plus stable thermiquement, des coûts énergétiques réduits, et une toiture protégée dans la durée.",
      ],
    },
    kpis: [
      { value: "−50°C", label: "en surface de toiture" },
      { value: "−8°C", label: "à l’intérieur du bâtiment" },
      { value: "40%", label: "d’économies sur la climatisation" },
    ],
    sections: [
      {
        title: "L'aérogel de silice : un matériau venu du spatial",
        body: [
          "Certains matériaux ne sont pas conçus pour le bâtiment. Ils sont développés pour des environnements où la maîtrise de la chaleur est critique. Dans le domaine spatial, notamment au sein d’organisations comme la NASA, la gestion des écarts de température est un enjeu majeur : protéger des structures exposées à des conditions extrêmes.",
          "C'est dans ce contexte qu’a été utilisé un matériau hors norme : l’aérogel de silice. Sa structure unique, composée en grande partie d’air, lui permet d’atteindre une conductivité thermique extrêmement faible. l’un des isolants les plus performants au monde.",
          "Chez Azur Cover, nous avons choisi de l’intégrer au cœur de notre revêtement. L'aérogel modifie la structure même du produit, en lui apportant une densité et une homogénéité supérieures. Après application, le revêtement forme une membrane continue directement liée à l’étanchéité existante.",
        ],
      },
      {
        title: "Une application sans travaux lourds",
        body: [
          "Le Cool Roofing s’applique directement sur la toiture existante. Pas de démontage, pas de chantier d’isolation lourd. L'intervention se fait en quelques jours selon la surface, sans perturber l’activité du bâtiment.",
          "La solution est compatible avec tous types de toitures : bac acier, étanchéité multicouche, membranes synthétiques. Une étude technique préalable permet de valider l’adhérence et la performance sur votre support.",
        ],
      },
      {
        title: "Performance certifiée et mesurable",
        body: [
          "Nos solutions sont approuvées par le CSTB et disposent de toutes les accréditations nécessaires, y compris la certification B-ROOF T3. Toutes les données que nous avançons sont certifiées et vérifiées.",
          "Nous pouvons également mettre en place un protocole IPMVP (International Performance Measurement and Verification Protocol) pour mesurer précisément l’impact de notre solution sur un projet pilote, garantissant des résultats fiables et auditables.",
        ],
      },
      {
        title: "Bonus : +8 à +22 % de rendement photovoltaïque",
        body: [
          "Notre revêtement permet d’augmenter la productivité des installations photovoltaïques. Vous pouvez obtenir jusqu’à +8 % de rendement sur les panneaux monofaciaux et +22 % sur les panneaux bifaciaux, optimisant votre production d’énergie solaire.",
        ],
      },
    ],
    bullets: [
      "Aérogel de silice (issu du domaine spatial)",
      "Application sans travaux lourds, sans interruption d’activité",
      "Prolonge la durée de vie de l’étanchéité",
      "Certifications CSTB · B-ROOF T3",
    ],
    cta: "En savoir plus",
    image: {
      src: "/images/solutions/cool-roofing.jpg",
      alt: "Application du revêtement Cool Roofing sur toiture",
    },
  },

  /* ───────────────────── 03 AZUR REFLECT ───────────────────── */
  {
    slug: "azur-reflect",
    index: "03",
    title: "Azur Reflect",
    short:
      "Vernis transparent appliqué sur l’extérieur des vitrages. Bloque 99 % des UV et 90 % des IR sans réduire la luminosité. Jusqu’à −12 °C en intérieur.",
    hero: {
      eyebrow: "03. Expertise",
      title: "Azur Reflect.",
      lead:
        "Un vernis transparent appliqué directement sur l’extérieur des vitrages. Bloque la chaleur sans réduire la luminosité, sans se décoller comme les films traditionnels. Renvoie 99 % des UV et 90 % des IR. Jusqu’à −12 °C en intérieur mesurés chez nos clients.",
    },
    problem: {
      title: "Le problème",
      body: [
        "Dans de nombreux bâtiments, les vitrages deviennent une véritable source de surchauffe. Les films solaires, souvent utilisés comme solution, finissent par se décoller et perdent rapidement en efficacité.",
        "Résultat : la chaleur s’installe durablement, les espaces deviennent inconfortables. notamment dans les écoles, bureaux et commerces. et les systèmes de climatisation fonctionnent en permanence, entraînant une surconsommation énergétique.",
        "Ces solutions temporaires ne traitent pas le fond du problème et finissent par impacter la performance globale des bâtiments ainsi que le confort des occupants.",
      ],
    },
    solution: {
      title: "Notre approche",
      body: [
        "Azur Reflect apporte une réponse durable en traitant directement la source du problème. Cette solution se présente sous forme de vernis transparent appliqué directement sur l’extérieur des vitrages, permettant de bloquer efficacement la chaleur tout en conservant la transparence.",
        "Contrairement aux films traditionnels, elle ne se dégrade pas dans le temps et maintient ses performances sur le long terme. Le résultat : un confort thermique immédiatement amélioré, une réduction de la dépendance à la climatisation et une solution fiable, pensée pour durer.",
      ],
    },
    kpis: [
      { value: "−12°C", label: "à l’intérieur du bâtiment" },
      { value: "99%", label: "des UV bloqués" },
      { value: "90%", label: "des IR renvoyés" },
    ],
    sections: [
      {
        title: "Pas de perte de luminosité",
        body: [
          "Contrairement aux films traditionnels qui assombrissent les espaces, Azur Reflect maintient la transparence du vitrage. La lumière naturelle entre, la chaleur reste dehors. Particulièrement adapté aux écoles, bureaux, commerces et bâtiments recevant du public.",
        ],
      },
      {
        title: "Solution permanente",
        body: [
          "3 fois plus résistant que les films solaires classiques. Pas d’entretien, pas de remplacement périodique. Une intervention, des bénéfices durables.",
          "Application sans démontage, sans bâche, sans interruption d’activité. Nos équipes interviennent depuis l’extérieur du bâtiment, en quelques heures à quelques jours selon la surface.",
        ],
      },
      {
        title: "Validé par les chantiers les plus exigeants",
        body: [
          "À l’école Jacqueline de Romilly de Cannes, lors des pics de chaleur estivale, nous avons enregistré une différence moyenne de 3 à 4 °C en faveur des classes équipées Azur Reflect par rapport aux classes témoins. Mesures réalisées par sondes en temps réel.",
          "Sur les vitrines de U Express à Saint-Laurent-du-Var, l’application sur la façade complète a permis de stopper la chaleur tout en conservant une transparence parfaite pour préserver la visibilité commerciale.",
        ],
      },
    ],
    bullets: [
      "3× plus résistant que les films solaires",
      "Aucune perte de luminosité",
      "Solution permanente, pas d’entretien",
      "30 % d’économie d’énergie",
      "Application sans démontage",
    ],
    cta: "En savoir plus",
    image: {
      src: "/images/solutions/azur-reflect.jpg",
      alt: "Application du vernis anti-chaleur Azur Reflect sur vitrage",
    },
  },

  /* ───────────────────── 04 AUTRES ───────────────────── */
  {
    slug: "autres",
    index: "04",
    title: "Autres expertises",
    short:
      "Contrats d’entretien, encapsulation amiante (équipes SS4 certifiées), Laque Solaire pour skydomes et verrières, peinture façade et intérieur à l’aérogel de silice.",
    hero: {
      eyebrow: "04. Expertise",
      title: "Autres expertises.",
      lead:
        "Contrats d’entretien annuels, encapsulation d’amiante, Laque Solaire pour skydomes, peinture technique pour façades et intérieurs. Pour les sujets connexes à la performance thermique de votre bâtiment, Azur Cover reste votre interlocuteur unique.",
    },
    problem: {
      title: "Au-delà des trois solutions phares",
      body: [
        "Beaucoup de bâtiments présentent des problématiques connexes : amiante en toiture vieillissante, surchauffe par les puits de lumière, façades qui dégradent le confort thermique. Plutôt que de multiplier les prestataires, Azur Cover propose un guichet unique pour toutes les interventions liées à la performance thermique et à la longévité du bâti.",
      ],
    },
    solution: {
      title: "Une approche complète",
      body: [
        "Toutes nos prestations partagent la même rigueur : étude technique préalable, équipes certifiées, garantie écrite, suivi long terme.",
      ],
    },
    kpis: [],
    sections: [
      {
        title: "Contrats d’entretien toiture",
        body: [
          "Une toiture remise à neuf ne s’entretient pas seule. Pour préserver dans la durée les travaux réalisés, une visite d’entretien annuelle est fortement recommandée.",
          "C'est souvent ce suivi régulier qui permet d’éviter des dégradations plus importantes, et donc des coûts de réparation plus élevés. Vous souhaitez réaliser un diagnostic, obtenir un devis ou simplement savoir quels travaux sont nécessaires ? Nous nous déplaçons.",
        ],
      },
      {
        title: "Encapsulation d’amiante",
        body: [
          "Sur de nombreuses toitures anciennes en fibrociment, la présence d’amiante devient un problème avec le temps : le matériau se dégrade, devient poreux et fragile, et expose à des contraintes importantes dès qu’une intervention est envisagée.",
          "Notre revêtement technique permet d’encapsuler l’amiante en toiture, en créant une membrane continue qui stabilise le support, limite durablement les émissions de fibres et protège la couverture contre les agressions climatiques. Intervention par nos équipes certifiées SS4.",
          "Bénéfice secondaire : ce traitement améliore le comportement thermique de la toiture en limitant les échanges de chaleur. surchauffes estivales et pertes hivernales réduites, gains énergétiques concrets.",
        ],
      },
      {
        title: "Laque Solaire pour skydomes et verrières",
        body: [
          "Aujourd’hui, traiter un vitrage ne se limite plus à poser un film ou ajouter une teinte, surtout sur des surfaces très exposées comme les skydomes (puits de lumière) ou certaines verrières. Avec la Laque Solaire développée par Azur Cover, ces zones critiques bénéficient d’un revêtement technique adapté.",
          "Cette solution laisse passer environ 70 % de la lumière naturelle, tout en bloquant les apports solaires responsables de la surchauffe. limite fortement l’effet de serre sous toiture sans assombrir les espaces. Contrairement aux films souvent inadaptés ou peu durables sur ce type de supports, la laque est appliquée en couche continue.",
          "Disponible en différentes finitions, elle s’adapte parfaitement aux contraintes des skydomes et verrières, en combinant lumière, confort thermique et durabilité.",
        ],
      },
      {
        title: "Peinture façade et intérieur à l’aérogel",
        body: [
          "Aujourd’hui, une peinture ne se limite plus à l’esthétique. Avec les solutions développées par Azur Cover, vos façades comme vos espaces intérieurs bénéficient d’un revêtement technique saturé en aérogels de silice, capable de ralentir efficacement la conduction thermique.",
          "Contrairement à une peinture classique qui ne fait que décorer, cette technologie agit directement sur le comportement thermique du mur : elle ne bloque pas la chaleur, mais freine les échanges, limitant la surchauffe en été et les pertes en hiver.",
          "Disponible en plusieurs teintes, elle s’adapte à tous les projets, sans compromis entre performance et esthétique.",
        ],
      },
    ],
    bullets: [
      "Contrats d’entretien toiture annuels",
      "Désamiantage et encapsulation (équipes SS4 certifiées)",
      "Laque Solaire pour skydomes et verrières",
      "Peinture technique façade et intérieur",
      "Solutions sur-mesure, interlocuteur unique",
    ],
    cta: "En savoir plus",
    image: {
      src: "/images/solutions/autres.jpg",
      alt: "Équipe Azur Cover sur chantier",
    },
  },
];

export function getExpertise(slug: string) {
  return expertises.find((e) => e.slug === slug);
}
