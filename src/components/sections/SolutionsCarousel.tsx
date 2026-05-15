"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { expertises } from "@/content/expertises";
import { cn } from "@/lib/utils";
import { SolutionsMobile } from "./SolutionsMobile";

if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin);
}

const N = expertises.length;
const AUTOPLAY_MS = 7000;
const CIRC = 113; // 2π · r=18

/** For 4 items, the slot positions on the path (0 = leftmost, 1 = rightmost) */
function slotForOffset(offset: number): number {
  switch (offset) {
    case 0:
      return 0.5; // active — centre
    case 1:
      return 0.78; // immediate right
    case 2:
      return 0.92; // far right (or off)
    case 3:
      return 0.22; // immediate left
    default:
      return 0.5;
  }
}

function visualForOffset(offset: number) {
  switch (offset) {
    case 0:
      return { scale: 1.0, blur: 0, z: 50, opacity: 1 };
    case 1:
      return { scale: 0.55, blur: 6, z: 30, opacity: 0.65 };
    case 2:
      return { scale: 0.4, blur: 14, z: 10, opacity: 0.4 };
    case 3:
      return { scale: 0.55, blur: 6, z: 30, opacity: 0.65 };
    default:
      return { scale: 1, blur: 0, z: 50, opacity: 1 };
  }
}

export function SolutionsCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const planetRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /** Place planets, dots and labels along the path. */
  const layout = useCallback(
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
          duration: immediate ? 0 : 0.95,
          ease: "expo.out",
          overwrite: "auto",
          onStart: () => { el.style.willChange = "transform, opacity, filter"; },
          onComplete: () => { el.style.willChange = "auto"; },
        });
        gsap.to(el, {
          filter: `blur(${blur}px)`,
          duration: immediate ? 0 : 0.7,
          ease: "expo.out",
          overwrite: "auto",
        });
      });
    },
    [active]
  );

  useEffect(() => {
    if (!isDesktop) return;
    layout();
  }, [layout, isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;
    const id = window.requestAnimationFrame(() => layout(true));
    const onResize = () => layout(true);
    window.addEventListener("resize", onResize);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("resize", onResize);
    };
  }, [isDesktop, layout]);

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

  const current = expertises[active];

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
      className="relative isolate overflow-hidden text-white py-[clamp(120px,18vw,200px)]"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, #2a2a2d 0%, #1d1d1f 60%)",
      }}
    >
      <Container className="hidden lg:block">
        {/* Header row: text left, controls right */}
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-7" role="tabpanel" id={`panel-${current.slug}`} aria-labelledby={`tab-${current.slug}`}>
            <Eyebrow tone="white" id="solutions-h">
              Nos solutions
            </Eyebrow>

            {/* Crossfade key — short opacity-only fade, no translate */}
            <div key={current.slug} className="mt-8 motion-soft-fade">
              <h2
                className="text-white"
                style={{
                  fontSize: "clamp(3rem, 5.5vw, 6rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.95,
                }}
              >
                {current.title}.
              </h2>
              <p
                className="mt-7 max-w-[520px] text-white/70"
                style={{ fontSize: "1.0625rem", lineHeight: 1.6 }}
              >
                {current.short}
              </p>
              <ul className="mt-6 space-y-2.5">
                {current.bullets.slice(0, 4).map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-white/80">
                    <span aria-hidden className="mt-2 inline-block h-px w-4 shrink-0 bg-azur" />
                    {b}
                  </li>
                ))}
              </ul>

              <Link
                href={`/expertises/${current.slug}`}
                data-cursor="hover"
                className="underline-grow mt-9 inline-flex items-center gap-2 text-sm font-medium text-white"
              >
                {current.cta}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* Right side intentionally empty — the orbit takes full width below */}
          <div className="col-span-5" />
        </div>

        {/* The orbit stage — spans full container width */}
        <div ref={stageRef} className="relative mt-16 h-[400px] w-full">
          {/* SVG orbit, full-width curve from edge to edge */}
          <svg
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id="orbit-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.18)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
              </linearGradient>
            </defs>
            <path
              ref={pathRef}
              d="M30,160 Q600,360 1170,160"
              fill="none"
              stroke="url(#orbit-grad)"
              strokeWidth="1.25"
              strokeDasharray="4 8"
            />
          </svg>

          {/* Planets (image discs) */}
          {expertises.map((s, i) => (
            <button
              type="button"
              key={s.slug}
              ref={(el) => { planetRefs.current[i] = el; }}
              onClick={() => goTo(i)}
              aria-label={`Voir ${s.title}`}
              data-cursor="hover"
              className={cn(
                "absolute left-0 top-0 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full",
                "border-2 transition-colors duration-500",
                i === active ? "border-azur shadow-[0_0_60px_rgba(0,166,166,0.25)]" : "border-white/10"
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
              {/* Subtle radial sphere highlight for 3D feel */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 35%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 60%)",
                }}
              />
            </button>
          ))}
        </div>

        {/* Labels row — clickable + active highlighted */}
        <div className="mt-12 grid grid-cols-4 gap-2">
          {expertises.map((s, i) => {
            const selected = i === active;
            return (
              <button
                key={s.slug}
                id={`tab-${s.slug}`}
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${s.slug}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => goTo(i)}
                data-cursor="hover"
                className={cn(
                  "group relative flex flex-col items-start gap-1 px-1 py-4 text-left transition-colors",
                  selected ? "text-white" : "text-white/45 hover:text-white"
                )}
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                  {s.index}
                </span>
                <span className="text-base font-medium" style={{ letterSpacing: "-0.01em" }}>
                  {s.title}
                </span>
                {/* Underline */}
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-px origin-left bg-azur transition-transform duration-500 ease-out",
                    selected ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Controls — centered under the active position */}
        <div className="mt-12 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Solution précédente"
            data-cursor="hover"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60"
          >
            ←
          </button>

          <div className="relative">
            <svg viewBox="0 0 40 40" className="h-12 w-12 -rotate-90" aria-hidden>
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
              className="absolute inset-0 flex items-center justify-center text-white/80 transition hover:text-white"
            >
              {paused ? "▶" : "❚❚"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Solution suivante"
            data-cursor="hover"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60"
          >
            →
          </button>

          <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
            {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </span>
        </div>

        {/* Hidden a11y placeholder, real tabs are above */}
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
      </Container>

      {/* Mobile fallback */}
      <div className="lg:hidden">
        <SolutionsMobile />
      </div>

      <style>{`
        .motion-soft-fade {
          animation: soft-fade 360ms ease-out both;
        }
        @keyframes soft-fade {
          from { opacity: 0.55; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-soft-fade { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
