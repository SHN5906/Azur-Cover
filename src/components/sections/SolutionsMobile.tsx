"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { expertises } from "@/content/expertises";
import { cn } from "@/lib/utils";

/**
 * Mobile solutions slider — pure CSS scroll-snap, zero JS library.
 * Replaces Swiper: 4 slides is trivial enough to do natively.
 */
export function SolutionsMobile() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // IntersectionObserver tracks which slide is most visible → updates dots.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = Array.from(track.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.55) {
            const idx = slides.indexOf(e.target as HTMLElement);
            if (idx !== -1) setActiveIdx(idx);
          }
        }
      },
      { root: track, threshold: 0.55 },
    );
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const scrollTo = (i: number) => {
    const track = trackRef.current;
    const slide = track?.children[i] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

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
        Quatre savoir-faire. Une seule promesse.
      </h2>

      {/* Scroll-snap track */}
      <div
        ref={trackRef}
        role="region"
        aria-label="Solutions, glisser pour naviguer"
        className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {expertises.map((s) => (
          <article
            key={s.slug}
            className="w-[92%] flex-shrink-0 snap-start"
          >
            <Link
              href={`/expertises/${s.slug}`}
              aria-label={`Voir la solution ${s.title}`}
              className="group relative block aspect-[3/4] w-full overflow-hidden rounded-md bg-graphite-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azur focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0a0c]"
            >
              <Image
                src={s.image.src}
                alt={s.image.alt}
                fill
                sizes="100vw"
                className="object-cover photo-treatment transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
            </Link>
            <div className="pb-12 pt-6">
              <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-azur">
                {s.index}
              </span>
              <h3
                className="mt-3 text-white"
                style={{
                  fontSize: "1.875rem",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                }}
              >
                {s.title}.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/70">{s.short}</p>
              <Link
                href={`/expertises/${s.slug}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white underline-grow"
              >
                {s.cta} <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination dots — same 44px touch targets as before */}
      <div className="flex justify-center gap-2" role="tablist" aria-label="Pagination solutions">
        {expertises.map((s, i) => (
          <button
            key={s.slug}
            type="button"
            role="tab"
            aria-selected={i === activeIdx}
            aria-label={`Aller à la solution ${i + 1}`}
            onClick={() => scrollTo(i)}
            className={cn(
              "h-11 w-11 rounded-full bg-clip-content p-[18px] transition-colors",
              i === activeIdx ? "bg-azur" : "bg-white/30",
            )}
          />
        ))}
      </div>
    </Container>
  );
}
