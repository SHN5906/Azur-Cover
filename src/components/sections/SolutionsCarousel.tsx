"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { expertises } from "@/content/expertises";
import { cn } from "@/lib/utils";
import { SolutionsMobile } from "./SolutionsMobile";

const N = expertises.length;
const AUTOPLAY_MS = 8000;
const CIRC = 113; // 2π · r=18

/**
 * Discrete slot positions à la Thales. No path interpolation — each slot has
 * a fixed transform (scale, translate %, opacity, blur, saturate, brightness).
 *
 * Coordinates are RELATIVE TO THE STAGE (right half of the viewport):
 *   x: percentage from the LEFT of the stage (0 = stage left edge, 100 = stage right edge)
 *   y: percentage from the TOP of the stage (50 = vertical centre)
 *
 * Only 3 planets are visible at any time: active + the next two in the queue.
 * The "previous" planet (offset 3) is faded out completely so it never lands
 * over the left-side text panel.
 */
type Slot = {
  x: number;      // %
  y: number;      // %
  scale: number;
  opacity: number;
  blur: number;   // px
  saturate: number;
  brightness: number;
  z: number;
};

const SLOTS: Record<number, Slot> = {
  0: { x: 38, y: 50, scale: 1.00, opacity: 1.0, blur: 0,  saturate: 1.0, brightness: 1.0, z: 50 }, // ACTIVE — centre of stage
  1: { x: 78, y: 70, scale: 0.55, opacity: 0.55, blur: 8, saturate: 0.3, brightness: 0.7, z: 30 }, // NEXT — bottom-right
  2: { x: 96, y: 30, scale: 0.35, opacity: 0.30, blur: 14, saturate: 0.1, brightness: 0.55, z: 20 }, // QUEUE — top-right corner
  3: { x: 38, y: 50, scale: 1.00, opacity: 0,   blur: 0,  saturate: 1.0, brightness: 1.0, z: 10 }, // PREV — fades out in place
};

function slotForOffset(offset: number): Slot {
  return SLOTS[offset] ?? SLOTS[0];
}

export function SolutionsCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const planetRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const progressRef = useRef<SVGCircleElement>(null);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const layout = useCallback(
    (immediate = false) => {
      planetRefs.current.forEach((el, i) => {
        if (!el) return;
        const offset = (i - active + N) % N;
        const slot = slotForOffset(offset);
        el.style.zIndex = String(slot.z);
        el.style.pointerEvents = slot.opacity === 0 ? "none" : "auto";

        gsap.to(el, {
          // Position via percentage of stage container; -50% centres on the spot
          left: `${slot.x}%`,
          top: `${slot.y}%`,
          xPercent: -50,
          yPercent: -50,
          scale: slot.scale,
          opacity: slot.opacity,
          duration: immediate ? 0 : 1.4,
          ease: "power3.inOut",
          overwrite: "auto",
          onStart: () => { el.style.willChange = "transform, opacity, filter"; },
          onComplete: () => { el.style.willChange = "auto"; },
        });
        gsap.to(el, {
          filter: `blur(${slot.blur}px) saturate(${slot.saturate}) brightness(${slot.brightness})`,
          duration: immediate ? 0 : 1.4,
          ease: "power3.inOut",
          overwrite: "auto",
        });
      });
    },
    [active]
  );

  useEffect(() => {
    if (!isMounted || !isDesktop) return;
    layout(true);
  }, [isMounted, isDesktop, layout]);

  useEffect(() => {
    if (!isDesktop) return;
    layout();
  }, [active, isDesktop, layout]);

  // Autoplay + circular progress
  useEffect(() => {
    if (!isDesktop || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const circle = progressRef.current;
    if (circle) {
      gsap.set(circle, { strokeDashoffset: CIRC });
      gsap.to(circle, {
        strokeDashoffset: 0,
        duration: AUTOPLAY_MS / 1000,
        ease: "none",
      });
    }
    const t = window.setTimeout(() => {
      setActive((i) => (i + 1) % N);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, isDesktop]);

  const goTo = useCallback((i: number) => {
    setActive(((i % N) + N) % N);
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!sectionRef.current?.contains(document.activeElement)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  if (!isMounted) {
    return <section className="min-h-screen bg-[#0e0e11]" />;
  }

  const current = expertises[active];

  return (
    <section
      ref={sectionRef}
      id="solutions"
      aria-labelledby="solutions-h"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative overflow-hidden text-white bg-[#0e0e11]"
      style={{
        background: isDesktop
          ? "radial-gradient(ellipse 70% 80% at 75% 50%, #2a2a2d 0%, #0e0e11 80%)"
          : undefined,
        minHeight: isDesktop ? "100vh" : "auto",
      }}
    >
      {/* Ambient dust */}
      {isDesktop && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-50 dust" />
      )}

      {/* Desktop layout — 2-column grid: text 40% / planets stage 60% */}
      {isDesktop && (
        <div className="relative grid h-screen min-h-[820px] grid-cols-12 z-10">
          {/* Text column */}
          <div
            role="tabpanel"
            id={`panel-${current.slug}`}
            aria-labelledby={`tab-${current.slug}`}
            className="col-span-5 flex items-center pl-[clamp(40px,6vw,120px)] pr-8 z-20"
          >
            <div className="w-full max-w-[460px]">
              <Eyebrow tone="white" id="solutions-h">
                Nos solutions
              </Eyebrow>

              {/* Crossfade text */}
              <div className="relative mt-8 min-h-[420px]">
                {expertises.map((s, i) => (
                  <div
                    key={s.slug}
                    aria-hidden={i !== active}
                    className={cn(
                      "absolute inset-0 transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                      i === active
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    )}
                  >
                    <h2
                      className="text-white"
                      style={{
                        fontSize: "clamp(2.5rem, 4vw, 4.5rem)",
                        fontWeight: 600,
                        letterSpacing: "-0.03em",
                        lineHeight: 0.95,
                      }}
                    >
                      {s.title}.
                    </h2>
                    <p
                      className="mt-7 text-white/70"
                      style={{ fontSize: "1.0625rem", lineHeight: 1.6 }}
                    >
                      {s.short}
                    </p>
                    <ul className="mt-7 space-y-2.5">
                      {s.bullets.slice(0, 4).map((b) => (
                        <li key={b} className="flex items-start gap-3 text-sm text-white/80">
                          <span aria-hidden className="mt-2 inline-block h-px w-4 shrink-0 bg-azur" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/expertises/${s.slug}`}
                      data-cursor="hover"
                      className="underline-grow mt-8 inline-flex items-center gap-2 text-sm font-medium text-white"
                    >
                      {s.cta}
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Controls — sit BELOW the min-height text block, never overlap */}
              <div className="mt-12 flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => goTo(active - 1)}
                  aria-label="Solution précédente"
                  data-cursor="hover"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60 hover:bg-white/5"
                >
                  ←
                </button>

                <div className="relative">
                  <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90" aria-hidden>
                    <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" />
                    <circle
                      ref={progressRef}
                      cx="20"
                      cy="20"
                      r="18"
                      stroke="var(--color-azur)"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      style={{ strokeDasharray: CIRC, strokeDashoffset: CIRC }}
                    />
                  </svg>
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    aria-label={paused ? "Reprendre l'auto-play" : "Mettre en pause"}
                    className="absolute inset-0 flex items-center justify-center text-[10px] text-white/80 transition hover:text-white"
                  >
                    {paused ? "▶" : "❚❚"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => goTo(active + 1)}
                  aria-label="Solution suivante"
                  data-cursor="hover"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60 hover:bg-white/5"
                >
                  →
                </button>

                <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                  {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
                </span>
              </div>

              {/* Pagination dots, separate from controls so they don't compete */}
              <div className="mt-6 flex items-center gap-2">
                {expertises.map((s, i) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Aller à ${s.title}`}
                    className="group relative h-6 w-12 flex items-center"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "h-px w-full transition-colors duration-500",
                        i === active ? "bg-azur" : "bg-white/15 group-hover:bg-white/30"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Planets stage — right 60%, isolated from text column */}
          <div className="col-span-7 relative">
            {/* Soft dotted arc as visual hint of orbit (decorative only) */}
            <svg
              aria-hidden
              viewBox="0 0 600 600"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full opacity-40"
            >
              <defs>
                <linearGradient id="orbit-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.18)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
              <path
                d="M-50,200 Q300,650 650,200"
                fill="none"
                stroke="url(#orbit-grad)"
                strokeWidth="1.2"
                strokeDasharray="3 8"
              />
            </svg>

            {/* Planet buttons — absolute, positioned by GSAP via slot transforms */}
            {expertises.map((s, i) => (
              <button
                type="button"
                key={s.slug}
                ref={(el) => { planetRefs.current[i] = el; }}
                onClick={() => goTo(i)}
                aria-label={`Voir ${s.title}`}
                data-cursor="hover"
                className={cn(
                  "planet group absolute h-[clamp(280px,30vw,420px)] w-[clamp(280px,30vw,420px)] overflow-visible rounded-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azur focus-visible:ring-offset-4 focus-visible:ring-offset-[#0e0e11]"
                )}
                style={{
                  // Initial placement (overridden by GSAP layout())
                  left: `${SLOTS[(i - active + N) % N]?.x ?? 50}%`,
                  top: `${SLOTS[(i - active + N) % N]?.y ?? 50}%`,
                  transform: `translate(-50%, -50%) scale(${SLOTS[(i - active + N) % N]?.scale ?? 1})`,
                  opacity: SLOTS[(i - active + N) % N]?.opacity ?? 1,
                  zIndex: SLOTS[(i - active + N) % N]?.z ?? 10,
                }}
              >
                {/* Active glow ring (rotating) */}
                {i === active && (
                  <span
                    aria-hidden
                    className="planet-ring pointer-events-none absolute -inset-2 rounded-full"
                    style={{
                      background:
                        "conic-gradient(from 0deg, rgba(0,166,166,0) 0deg, rgba(0,166,166,0.45) 80deg, rgba(0,166,166,0) 160deg, rgba(0,166,166,0) 360deg)",
                      filter: "blur(8px)",
                    }}
                  />
                )}

                <span
                  className={cn(
                    "absolute inset-0 overflow-hidden rounded-full transition-[border,box-shadow] duration-700",
                    i === active
                      ? "border border-azur shadow-[0_0_80px_rgba(0,166,166,0.18)]"
                      : "border border-white/10 group-hover:border-white/30"
                  )}
                >
                  <Image
                    src={s.image.src}
                    alt={s.image.alt}
                    fill
                    sizes="420px"
                    className="object-cover"
                  />
                  {/* Sphere highlight */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 40%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 60%)",
                      boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)",
                    }}
                  />
                </span>

                {/* Active caption — under the planet, only when active */}
                {i === active && (
                  <span
                    aria-hidden
                    className="planet-caption pointer-events-none absolute left-1/2 top-full mt-6 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.22em] text-white/85"
                  >
                    <span className="text-azur">{s.index}</span>
                    <span className="mx-2 text-white/30">·</span>
                    {s.title}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile fallback */}
      {!isDesktop && (
        <div className="py-[clamp(80px,15vw,120px)]">
          <SolutionsMobile />
        </div>
      )}

      {/* Hidden a11y tablist for screen readers */}
      <div role="tablist" aria-label="Choisir une solution" className="sr-only">
        {expertises.map((s, i) => (
          <button
            key={`a11y-${s.slug}`}
            id={`tab-a11y-${s.slug}`}
            role="tab"
            aria-selected={i === active}
            aria-controls={`panel-${s.slug}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => goTo(i)}
          >
            {s.title}
          </button>
        ))}
      </div>

      <style>{`
        .planet-ring {
          animation: planet-ring-spin 14s linear infinite;
        }
        @keyframes planet-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .planet-caption {
          animation: caption-in 700ms cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 350ms;
        }
        @keyframes caption-in {
          from { opacity: 0; transform: translate(-50%, -4px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }

        .dust {
          background-image:
            radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.18), transparent 60%),
            radial-gradient(1px 1px at 28% 72%, rgba(255,255,255,0.12), transparent 60%),
            radial-gradient(1.2px 1.2px at 41% 38%, rgba(0,166,166,0.20), transparent 60%),
            radial-gradient(1px 1px at 55% 88%, rgba(255,255,255,0.14), transparent 60%),
            radial-gradient(1px 1px at 64% 24%, rgba(255,255,255,0.10), transparent 60%),
            radial-gradient(1.4px 1.4px at 78% 56%, rgba(255,255,255,0.16), transparent 60%),
            radial-gradient(1px 1px at 90% 32%, rgba(0,166,166,0.16), transparent 60%),
            radial-gradient(1px 1px at 8% 88%, rgba(255,255,255,0.12), transparent 60%),
            radial-gradient(1px 1px at 95% 78%, rgba(255,255,255,0.10), transparent 60%),
            radial-gradient(1.2px 1.2px at 35% 12%, rgba(255,255,255,0.14), transparent 60%);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          animation: dust-drift 60s ease-in-out infinite alternate;
        }
        @keyframes dust-drift {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-12px, 6px, 0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .planet-ring, .planet-caption, .dust { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
