import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site azurcover.com : éditeur, hébergement, propriété intellectuelle.",
  alternates: { canonical: "/mentions-legales" },
};

// Page obligatoire (LCEN article 6, III).
// LCEN art. 6 III — toutes les mentions obligatoires sont renseignées.
export default function MentionsLegales() {
  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Mentions légales."
      blocks={[
        {
          heading: "Éditeur du site",
          paragraphs: [
            `Le site ${site.url} est édité par Azur Cover, SAS (société par actions simplifiée) au capital de 2 000 €.`,
            `Siège social : ${site.address.full}, ${site.address.country}.`,
            `SIREN : 932 197 999 — SIRET : 932 197 999 00034.`,
            `RCS Grasse — Code APE : 74.90B.`,
            `TVA intracommunautaire : FR07 932 197 999.`,
            `Téléphone : ${site.phones[0]} · Email : ${site.email}.`,
            `Directeurs de la publication : Théo Cilins, Président — Tony Ramos, Directeur Général.`,
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
