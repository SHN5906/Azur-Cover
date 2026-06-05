import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité d'Azur Cover : données personnelles, RGPD.",
  alternates: { canonical: "/confidentialite" },
};

// Page strictement obligatoire dès qu'il y a collecte de données personnelles
// (formulaire de contact). Conformité RGPD article 13.
export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Données personnelles"
      title="Politique de confidentialité."
      lead="Azur Cover s'engage à protéger les données personnelles que vous nous confiez, conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés."
      blocks={[
        {
          heading: "1. Responsable du traitement",
          paragraphs: [
            `Le responsable du traitement des données personnelles collectées sur ${site.url} est Azur Cover, dont l'adresse est ${site.address.full}.`,
            `Pour toute question relative à vos données : ${site.email}.`,
          ],
        },
        {
          heading: "2. Données collectées",
          paragraphs: [
            "Lorsque vous nous contactez via le formulaire ou par email, nous collectons : nom, prénom, entreprise, adresse email, téléphone, ville du bâtiment concerné, type de projet et contenu de votre message.",
            "Aucune donnée personnelle n'est collectée à votre insu lors de la simple consultation des pages du site.",
          ],
        },
        {
          heading: "3. Base légale du traitement",
          paragraphs: [
            "Le traitement de vos données repose sur votre consentement (article 6.1.a du RGPD), exprimé lors de l'envoi du formulaire de contact. Vous pouvez retirer ce consentement à tout moment en écrivant à " + site.email + ".",
            "Pour les échanges faisant suite à une demande de devis, le traitement peut également reposer sur l'exécution de mesures précontractuelles (article 6.1.b du RGPD).",
          ],
        },
        {
          heading: "4. Finalités",
          paragraphs: [
            "Vos données sont utilisées exclusivement pour : répondre à votre demande, établir un devis ou un planning d'intervention, et assurer le suivi commercial associé.",
            "Elles ne sont jamais cédées, louées ou revendues à des tiers.",
          ],
        },
        {
          heading: "5. Durée de conservation",
          paragraphs: [
            "Vos données sont conservées 3 ans à compter du dernier contact actif, sauf demande explicite de suppression de votre part ou obligation légale de conservation plus longue.",
          ],
        },
        {
          heading: "6. Vos droits",
          paragraphs: [
            "Vous disposez des droits suivants sur vos données : accès, rectification, opposition, effacement, limitation du traitement, portabilité, et le droit de définir des directives sur le sort de vos données après votre décès.",
            `Pour exercer ces droits, écrivez à ${site.email}. Nous nous engageons à vous répondre sous un mois maximum.`,
            "Vous pouvez également introduire une réclamation auprès de la CNIL (https://www.cnil.fr).",
          ],
        },
        {
          heading: "7. Sécurité",
          paragraphs: [
            "Nous mettons en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données contre la perte, l'accès non autorisé, la divulgation ou l'altération.",
          ],
        },
      ]}
    />
  );
}
