"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { solutions } from "@/content/solutions";
import { cn } from "@/lib/utils";
import { SolutionsMobile } from "./SolutionsMobile";

if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin);
}

const N = solutions.length;
const AUTOPLAY_MS = 7000;

/** A planet's "slot" along the smile path: 0 = leftmost, 1 = rightmost.
 * Active is in the middle. The spread is symmetric. */
function slotForOffset(offset: number) {
  // offset = (i - active + N) % N, mapped to 0..N-1
  // We center "0" at 0.5 on the path, and place others at fixed slots around it.
  // For 4 planets: [0.5 (active), 0.85 (right), 0.15 (left), 0.0 or 1.0 (back)]
  switch (offset) {
    case 0:
      return 0.5; // active, centre
    case 1:
      return 0.84; // immediate right
    case 2:
      return 0.05; // far left (or "behind" feel)
    case 3:
      return 0.16; // immediate left
    default:
      return 0.5;
  }
}

function visualForOffset(offset: number) {
  // Scale and blur values per slot.
  switch (offset) {
    case 0:
      return { scale: 1.0, blur: 0, z: 5, opacity: 1 };
    case 1:
      return { scale: 0.65, blur: 8, z: 3, opacity: 0.85 };
    case 2:
      return { scale: 0.5, blur: 18, z: 1, opacity: 0.55 };
    case 3:
      return { scale: 0.65, blur: 8, z: 3, opacity: 0.85 };
    default:
      return { scale: 1, blur: 0, z: 5, opacity: 1 };
  }
}

export function SolutionsCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const planetRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Detect viewport on mount + resize
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /** Place all planets on the path according to current `active`. */
  const layoutPlanets = useCallback(
    (immediate = false) => {
      const path = pathRef.current;
      if (!path) return;
      planetRefs.current.forEach((el, i) => {
        if (!el) return;
        const offset = (i - active + N) % N;
        const t = slotForOffset(offset);
        const { scale, blur, z, opacity } = visualForOffset(offset);
        el.style.zIndex = String(z);

        gsap.to(el, {
          motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: t, end: t },
          scale,
          opacity,
          duration: immediate ? 0 : 0.85,
          ease: "expo.out",
          overwrite: "auto",
          onStart: () => {
            el.style.willChange = "transform, opacity, filter";
          },
          onComplete: () => {
            el.style.willChange = "auto";
          },
        });
        gsap.to(el, {
          filter: `blur(${blur}px)`,
          duration: immediate ? 0 : 0.6,
          ease: "expo.out",
          overwrite: "auto",
        });
      });
    },
    [active]
  );

  // Re-layout whenever active or viewport state changes
  useEffect(() => {
    if (!isDesktop) return;
    layoutPlanets();
  }, [layoutPlanets, isDesktop]);

  // Initial placement after fonts/svg ready
  useEffect(() => {
    if (!isDesktop) return;
    const id = window.requestAnimationFrame(() => layoutPlanets(true));
    return () => window.cancelAnimationFrame(id);
  }, [isDesktop, layoutPlanets]);

  // Autoplay + circular progress
  useEffect(() => {
    if (!isDesktop || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const circle = progressRef.current;
    const tabBar = tabBarRef.current;
    const CIRC = 113; // 2π * r=18

    if (circle) {
      gsap.set(circle, { strokeDasharray: CIRC, strokeDashoffset: CIRC });
      gsap.to(circle, {
        strokeDashoffset: 0,
        duration: AUTOPLAY_MS / 1000,
        ease: "none",
      });
    }
    if (tabBar) {
      const fill = tabBar.querySelector<HTMLSpanElement>(`[data-tabfill="${active}"]`);
      if (fill) {
        gsap.fromTo(
          fill,
          { scaleX: 0 },
          { scaleX: 1, duration: AUTOPLAY_MS / 1000, ease: "none" }
        );
      }
    }

    const t = window.setTimeout(() => {
      setActive((i) => (i + 1) % N);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, isDesktop]);

  // Crossfade text panel
  const goTo = useCallback((i: number) => {
    setActive(((i % N) + N) % N);
  }, []);

  // Keyboard navigation when section has focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!sectionRef.current?.contains(document.activeElement)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(active + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(active - 1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  const current = solutions[active];

  return (
    <section
      ref={sectionRef}
      id="solutions"
      data-bg="2"
      aria-labelledby="solutions-h"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative isolate text-white py-[clamp(120px,18vw,200px)]"
      style={{
        background: "radial-gradient(ellipse at top, #2a2a2d 0%, #1d1d1f 60%)",
      }}
    >
      <Container className="hidden md:block">
        <div className="grid grid-cols-12 gap-12">
          {/* Left content */}
          <div
            role="tabpanel"
            id={`panel-${current.id}`}
            aria-labelledby={`tab-${current.id}`}
            className="col-span-12 lg:col-span-5"
          >
            <Eyebrow tone="white" id="solutions-h">
              Nos solutions
            </Eyebrow>

            {/* Crossfade key on the active id ensures the slot animates on change */}
            <div key={current.id} className="mt-8 motion-fade-in">
              <h2
                className="text-white"
                style={{
                  fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
                data-slot="title"
              >
                {current.title}
              </h2>
              <p
                className="mt-6 max-w-[440px] text-white/70"
                style={{ fontSize: "1.0625rem", lineHeight: 1.6 }}
                data-slot="description"
              >
                {current.body}
              </p>
              <ul className="mt-7 space-y-2.5" data-slot="bullets">
                {current.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 text-sm text-white/80"
                  >
                    <span
                      aria-hidden
                      className="mt-2 inline-block h-px w-4 shrink-0 bg-azur"
                    />
                    {b}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                data-cursor="hover"
                data-slot="link"
                className="underline-grow mt-9 inline-flex items-center gap-2 text-sm font-medium text-white"
              >
                En savoir plus
                <span aria-hidden>→</span>
              </a>
            </div>

            {/* Controls + progress */}
            <div className="mt-12 flex items-center gap-5">
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                aria-label="Solution précédente"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60"
              >
                ←
              </button>

              <svg
                viewBox="0 0 40 40"
                className="h-10 w-10 -rotate-90"
                aria-hidden
              >
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
                  style={{ strokeDasharray: 113, strokeDashoffset: 113 }}
                />
              </svg>

              <button
                type="button"
                onClick={() => goTo(active + 1)}
                aria-label="Solution suivante"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60"
              >
                →
              </button>

              <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Right stage with orbit */}
          <div
            ref={stageRef}
            className="col-span-12 relative h-[520px] lg:col-span-7 lg:h-[600px]"
          >
            {/* SVG orbit */}
            <svg
              viewBox="0 0 800 600"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <path
                ref={pathRef}
                id="orbit-path"
                d="M80,200 Q400,420 720,200"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
                strokeDasharray="3 8"
              />
            </svg>

            {/* Planets */}
            {solutions.map((s, i) => (
              <button
                type="button"
                key={s.id}
                ref={(el) => {
                  planetRefs.current[i] = el;
                }}
                onClick={() => goTo(i)}
                aria-label={`Voir ${s.title.replace(/\.$/, "")}`}
                data-cursor="hover"
                className={cn(
                  "absolute left-0 top-0 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden",
                  "border-2 transition-colors duration-500",
                  i === active ? "border-azur" : "border-white/10"
                )}
                style={{ transformOrigin: "center" }}
              >
                <Image
                  src={s.image.src}
                  alt={s.image.alt}
                  fill
                  sizes="280px"
                  className="object-cover photo-treatment"
                />
                {/* Active label band */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 bottom-0 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em]",
                    "bg-bg/95 text-ink backdrop-blur-sm transition-opacity duration-300",
                    i === active ? "opacity-100" : "opacity-0"
                  )}
                >
                  {s.index} · {s.title.replace(/\.$/, "")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div ref={tabBarRef} role="tablist" aria-label="Choisir une solution" className="mt-16">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-0">
            {solutions.map((s, i) => {
              const selected = i === active;
              return (
                <button
                  key={s.id}
                  id={`tab-${s.id}`}
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`panel-${s.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => goTo(i)}
                  data-cursor="hover"
                  className={cn(
                    "relative flex flex-col items-start gap-1 px-2 py-5 text-left transition-colors",
                    selected ? "text-white" : "text-white/45 hover:text-white"
                  )}
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                    {s.index}
                  </span>
                  <span className="text-base font-medium" style={{ letterSpacing: "-0.01em" }}>
                    {s.title.replace(/\.$/, "")}
                  </span>

                  {/* Base hairline */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px bg-white/10"
                  />
                  {/* Progress fill */}
                  <span
                    aria-hidden
                    data-tabfill={i}
                    style={{
                      transformOrigin: "left",
                      transform: selected ? "scaleX(1)" : "scaleX(0)",
                    }}
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-px bg-azur",
                      // For non-active tabs we keep a 0 scale
                      !selected && "scale-x-0"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </Container>

      {/* Mobile fallback (Swiper) */}
      <div className="md:hidden">
        <SolutionsMobile />
      </div>

      <style>{`
        .motion-fade-in {
          animation: fade-in-up 600ms cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 120ms;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-fade-in { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
