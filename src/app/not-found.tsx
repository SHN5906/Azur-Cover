import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Page introuvable",
  description: "Cette page n'existe pas ou a été déplacée.",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="flex min-h-[80vh] items-center py-32">
          <Container>
            <div className="max-w-[640px]">
              <Eyebrow>Erreur 404</Eyebrow>
              <h1
                className="mt-6 text-ink"
                style={{
                  fontSize: "clamp(3rem, 6vw, 6rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.98,
                }}
              >
                Cette page s&apos;est volatilisée.
              </h1>
              <p
                className="mt-6 max-w-[480px] text-muted"
                style={{ fontSize: "1.125rem", lineHeight: 1.55 }}
              >
                Le lien que vous avez suivi est cassé, ou la page a été déplacée.
                Pas grave : voilà comment retrouver votre chemin.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
                <Button href="/" arrow>
                  Retour à l&apos;accueil
                </Button>
                <Button href="/contact" variant="ghost" arrow>
                  Nous contacter
                </Button>
              </div>

              <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted">
                <p className="font-mono text-[13px] uppercase tracking-[0.18em]">
                  Vous cherchez peut-être
                </p>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <li>
                    <Link href="/expertises" className="text-ink hover:text-azur-deep">
                      Nos expertises <span aria-hidden>→</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/realisations" className="text-ink hover:text-azur-deep">
                      Nos réalisations <span aria-hidden>→</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/qui-sommes-nous" className="text-ink hover:text-azur-deep">
                      Qui sommes-nous <span aria-hidden>→</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-ink hover:text-azur-deep">
                      FAQ <span aria-hidden>→</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
