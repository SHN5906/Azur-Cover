"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

/**
 * Root error boundary. Catches uncaught errors in any Server/Client component
 * below the root layout. Logs to console in dev; in prod we'd wire Sentry
 * here, but for now we just render a recovery UI.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <>
      <Header />
      <main id="main">
        <section className="flex min-h-[80vh] items-center py-32">
          <Container>
            <div className="max-w-[640px]">
              <Eyebrow>Erreur inattendue</Eyebrow>
              <h1
                className="mt-6 text-ink"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 5rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.02,
                }}
              >
                Quelque chose s&apos;est mal passé.
              </h1>
              <p
                className="mt-6 max-w-[480px] text-muted"
                style={{ fontSize: "1.125rem", lineHeight: 1.55 }}
              >
                Une erreur est survenue côté serveur. Pas de panique : essayez
                de recharger la page ou revenez à l&apos;accueil.
              </p>
              {error.digest && (
                <p className="mt-4 font-mono text-xs text-muted">
                  Référence : {error.digest}
                </p>
              )}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
                <Button onClick={reset}>Réessayer</Button>
                <Button href="/" variant="ghost" arrow>
                  Retour à l&apos;accueil
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
