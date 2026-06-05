import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Accès refusé",
  description: "Vous n'avez pas accès à cette page.",
};

export default function Forbidden() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="flex min-h-[80vh] items-center py-32">
          <Container>
            <div className="max-w-[640px]">
              <Eyebrow>Accès refusé</Eyebrow>
              <h1
                className="mt-6 text-ink"
                style={{
                  fontSize: "clamp(3rem, 6vw, 6rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.98,
                }}
              >
                Cette page est réservée.
              </h1>
              <p
                className="mt-6 max-w-[480px] text-muted"
                style={{ fontSize: "1.125rem", lineHeight: 1.55 }}
              >
                Vous n&apos;avez pas l&apos;autorisation d&apos;accéder à cette
                page. Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur,
                n&apos;hésitez pas à nous contacter.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
                <Button href="/" arrow>
                  Retour à l&apos;accueil
                </Button>
                <Button href="/contact" variant="ghost" arrow>
                  Nous contacter
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
