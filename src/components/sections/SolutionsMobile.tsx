"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y } from "swiper/modules";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { solutions } from "@/content/solutions";

import "swiper/css";
import "swiper/css/pagination";

export function SolutionsMobile() {
  return (
    <Container className="text-white">
      <Eyebrow tone="white">Nos solutions</Eyebrow>
      <h2
        className="mt-6 text-white"
        style={{
          fontSize: "clamp(2rem, 8vw, 3rem)",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        Quatre expertises, un seul interlocuteur.
      </h2>

      <Swiper
        modules={[Pagination, A11y]}
        spaceBetween={20}
        slidesPerView={1.05}
        centeredSlides={false}
        pagination={{ clickable: true }}
        className="mt-10 [&_.swiper-pagination-bullet]:!bg-white/30 [&_.swiper-pagination-bullet-active]:!bg-azur"
      >
        {solutions.map((s) => (
          <SwiperSlide key={s.id}>
            <article className="flex flex-col">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-graphite-warm">
                <Image
                  src={s.image.src}
                  alt={s.image.alt}
                  fill
                  sizes="100vw"
                  className="object-cover photo-treatment"
                />
                <span className="absolute left-3 top-3 inline-block rounded-md bg-bg/95 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink">
                  {s.index} · {s.title.replace(/\.$/, "")}
                </span>
              </div>
              <div className="pb-12 pt-6">
                <h3
                  className="text-white"
                  style={{
                    fontSize: "1.875rem",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.05,
                  }}
                >
                  {s.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  {s.body}
                </p>
                <ul className="mt-5 space-y-2">
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 text-sm text-white/85"
                    >
                      <span
                        aria-hidden
                        className="mt-2 inline-block h-px w-4 shrink-0 bg-azur"
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </Container>
  );
}
