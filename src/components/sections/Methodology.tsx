"use client";

import { useEffect, useRef } from "react";
import { steps } from "@/content/methodology";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

/** SVG arrow with pathLength drawn from 0→1 when it scrolls into view. */
function DrawnArrow() {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.strokeDasharray = "1";
      el.style.strokeDashoffset = "0";
      return;
    }
    const len = el.getTotalLength();
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    el.style.transition =
      "stroke-dashoffset 800ms cubic-bezier(0.16,1,0.3,1)";
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.style.strokeDashoffset = "0";
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      aria-hidden
      width="32"
      height="12"
      viewBox="0 0 32 12"
      fill="none"
      className="text-ink/25"
    >
      <path
        ref={ref}
        d="M0 6h28m0 0L23 1m5 5l-5 5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Methodology() {
  return (
    <section
      id="methodologie"

      aria-labelledby="methodologie-h"
      className="py-[clamp(56px,9vw,110px)]"
    >
      <Container>
        <div className="max-w-[880px]">
          <ScrollReveal>
            <Eyebrow>Notre process</Eyebrow>
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <h2
              id="methodologie-h"
              className="mt-6 text-ink"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 5rem)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                textWrap: "balance",
              }}
            >
              Notre méthodologie.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <p
              className="mt-6 max-w-[640px] text-muted"
              style={{ fontSize: "1.25rem", lineHeight: 1.5 }}
            >
              Un process éprouvé. Quatre étapes, un seul interlocuteur.
            </p>
          </ScrollReveal>
        </div>

        <ol className="relative mt-20 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, i) => (
            <ScrollReveal key={step.index} delay={120 + i * 100} as="li" className="relative">
              <div className="group h-full rounded-md border border-line/70 bg-white p-8 transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-lg">
                <span
                  aria-hidden
                  className="block text-azur"
                  style={{
                    fontSize: "clamp(5rem, 9vw, 8rem)",
                    fontWeight: 200,
                    letterSpacing: "-0.04em",
                    lineHeight: 0.85,
                  }}
                >
                  {step.index}
                </span>
                <h3
                  className="mt-6 text-ink"
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  <span className="sr-only">Étape {step.index} :</span>
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>

              {/* Connector arrow (desktop only, not on last) — positionnée
                  pile au centre du gap (gap-8 = 32px, flèche 32px → right-[-32px]
                  fait que le shaft commence à la bordure droite de la card et la
                  pointe atteint la bordure gauche de la suivante). */}
              {i < steps.length - 1 && (
                <div className="absolute top-1/2 -right-8 hidden -translate-y-1/2 lg:block">
                  <DrawnArrow />
                </div>
              )}
            </ScrollReveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
