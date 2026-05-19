import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site azurcover.com — éditeur, hébergement, propriété intellectuelle.",
  alternates: { canonical: "/mentions-legales" },
};

// Page obligatoire (LCEN article 6, III). Les informations sociales détaillées
// (forme juridique, capital, SIREN/SIRET, TVA, directeur de publication) sont
// communiquées sur demande à l'éditeur — voir email ci-dessus.
export default function MentionsLegales() {
  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Mentions légales."
      blocks={[
        {
          heading: "Éditeur du site",
          paragraphs: [
            `Le site ${site.url} est édité par Azur Cover.`,
            `Adresse : ${site.address.full}, ${site.address.country}.`,
            `Téléphone : ${site.phones[0]} · Email : ${site.email}.`,
            `Les informations sociales détaillées (forme juridique, capital social, numéro SIREN/SIRET, TVA intracommunautaire, directeur de publication) sont communiquées sur simple demande à l'adresse ci-dessus.`,
          ],
        },
        {
          heading: "Hébergeur",
          paragraphs: [
            "Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis. Téléphone : +1 (559) 288-7060.",
          ],
        },
        {
          heading: "Propriété intellectuelle",
          paragraphs: [
            "L'ensemble des contenus du site (textes, images, vidéos, logos, graphismes, code) est la propriété d'Azur Cover ou de ses partenaires, et est protégé par le droit français et international de la propriété intellectuelle.",
            "Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, est interdite sans autorisation écrite préalable d'Azur Cover.",
          ],
        },
        {
          heading: "Données personnelles",
          paragraphs: [
            "Les conditions de collecte et de traitement de vos données personnelles sont détaillées dans notre Politique de confidentialité.",
            `Pour toute question, écrivez à ${site.email}.`,
          ],
        },
        {
          heading: "Crédits",
          paragraphs: [
            "Conception et développement : Renew Editing.",
            "Photographies : Azur Cover et partenaires.",
          ],
        },
      ]}
    />
  );
}
