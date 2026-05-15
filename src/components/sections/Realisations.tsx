"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { realisations } from "@/content/realisations";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { cn } from "@/lib/utils";

import "swiper/css";

export function Realisations() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    const s = swiperRef.current;
    if (!s) return;
    setCanPrev(!s.isBeginning);
    setCanNext(!s.isEnd);
  }, [activeIndex]);

  return (
    <section
      id="realisations"
      data-bg="3"
      aria-labelledby="realisations-h"
      className="overflow-hidden py-[clamp(120px,18vw,200px)]"
    >
      <Container className="lg:max-w-none lg:pr-0">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left column — sticky on desktop */}
          <div className="lg:col-span-5 xl:col-span-4 lg:pl-0">
            <div className="lg:sticky lg:top-28">
              <ScrollReveal>
                <Eyebrow>Nos réalisations</Eyebrow>
              </ScrollReveal>
              <ScrollReveal delay={120}>
                <h2
                  id="realisations-h"
                  className="mt-6 text-ink"
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 5rem)",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  Projets exemplaires.
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={240}>
                <p className="mt-6 max-w-[380px] text-muted" style={{ fontSize: "1.0625rem", lineHeight: 1.55 }}>
                  Quelques chantiers récents qui illustrent notre savoir-faire
                  dans la performance thermique et l&apos;étanchéité des
                  bâtiments tertiaires, industriels et publics.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={320}>
                <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  Dossier complet de références disponible sur demande
                </p>
              </ScrollReveal>

              {/* Controls */}
              <div className="mt-10 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slidePrev()}
                  aria-label="Projet précédent"
                  disabled={!canPrev}
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition",
                    canPrev ? "hover:bg-ink hover:text-white" : "cursor-not-allowed opacity-30"
                  )}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slideNext()}
                  aria-label="Projet suivant"
                  disabled={!canNext}
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition",
                    canNext ? "hover:bg-ink hover:text-white" : "cursor-not-allowed opacity-30"
                  )}
                >
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>

                <div className="ml-2 flex flex-1 items-center gap-1">
                  {realisations.map((_, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className={cn(
                        "h-px flex-1 transition-colors duration-300",
                        i === activeIndex ? "bg-ink" : "bg-ink/15"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column — overflowing carousel */}
          <div className="relative lg:col-span-7 xl:col-span-8">
            <Swiper
              modules={[A11y, Keyboard]}
              onSwiper={(s) => (swiperRef.current = s)}
              onSlideChange={(s) => setActiveIndex(s.activeIndex)}
              spaceBetween={24}
              keyboard={{ enabled: true }}
              breakpoints={{
                0: { slidesPerView: 1.15 },
                640: { slidesPerView: 1.5 },
                1024: { slidesPerView: 1.8 },
                1280: { slidesPerView: 2.2 },
                1536: { slidesPerView: 2.6 },
              }}
              className="!overflow-visible"
            >
              {realisations.map((r) => (
                <SwiperSlide key={r.id}>
                  <article>
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-line/60 bg-bg">
                      <Image
                        src={r.image.src}
                        alt={r.image.alt}
                        fill
                        loading="lazy"
                        sizes="(min-width: 1024px) 50vw, 90vw"
                        className="object-cover photo-treatment transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                      />
                    </div>
                    <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                      {r.client} · {r.solution} · {r.year}
                    </p>
                    <h3 className="mt-1 text-ink" style={{ fontSize: "1.125rem", fontWeight: 500 }}>
                      {r.title}
                    </h3>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </Container>
    </section>
  );
}
