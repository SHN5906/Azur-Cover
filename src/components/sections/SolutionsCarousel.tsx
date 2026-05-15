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
const AUTOPLAY_MS = 8000;
const CIRC = 113; // 2π · r=18

function slotForOffset(offset: number): number {
  switch (offset) {
    case 0:
      return 0.5; // active - centre
    case 1:
      return 0.85; // immediate right
    case 2:
      return 0.95; // hidden far right
    case 3:
      return 0.15; // immediate left
    default:
      return 0.5;
  }
}

function visualForOffset(offset: number) {
  // saturate / brightness shift adds focus contrast between active and inactive planets
  switch (offset) {
    case 0:
      return { scale: 0.9, blur: 0, z: 50, opacity: 1, saturate: 1, brightness: 1 };
    case 1:
      return { scale: 0.5, blur: 10, z: 30, opacity: 0.55, saturate: 0.25, brightness: 0.7 };
    case 2:
      return { scale: 0.3, blur: 22, z: 10, opacity: 0, saturate: 0, brightness: 0.5 };
    case 3:
      return { scale: 0.5, blur: 10, z: 30, opacity: 0.55, saturate: 0.25, brightness: 0.7 };
    default:
      return { scale: 0.9, blur: 0, z: 50, opacity: 1, saturate: 1, brightness: 1 };
  }
}

export function SolutionsCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const planetRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
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
      const path = pathRef.current;
      if (!path) return;

      planetRefs.current.forEach((el, i) => {
        if (!el) return;
        const offset = (i - active + N) % N;
        const t = slotForOffset(offset);
        const { scale, blur, z, opacity, saturate, brightness } = visualForOffset(offset);
        el.style.zIndex = String(z);
        // hidden far-side: don't accept clicks
        el.style.pointerEvents = opacity === 0 ? "none" : "auto";

        gsap.to(el, {
          motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: t, end: t },
          scale,
          opacity,
          duration: immediate ? 0 : 1.4,
          ease: "power3.inOut",
          overwrite: "auto",
          onStart: () => { el.style.willChange = "transform, opacity, filter"; },
          onComplete: () => { el.style.willChange = "auto"; },
        });
        gsap.to(el, {
          filter: `blur(${blur}px) saturate(${saturate}) brightness(${brightness})`,
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
    // Initial layout
    layout(true);
    
    // Ensure GSAP layout happens after SVG is fully rendered
    const t1 = setTimeout(() => layout(true), 100);
    const t2 = setTimeout(() => layout(true), 500);

    const onResize = () => layout(true);
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", onResize);
    };
  }, [isMounted, isDesktop, layout]);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!sectionRef.current?.contains(document.activeElement)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  // Prevent hydration mismatch
  if (!isMounted) {
    return <section className="min-h-screen bg-[#0e0e11]" />;
  }

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
      className="relative overflow-hidden text-white bg-[#0e0e11]"
      style={{
        background: isDesktop ? "radial-gradient(ellipse 70% 80% at 70% 50%, #2a2a2d 0%, #0e0e11 80%)" : undefined,
        minHeight: isDesktop ? "100vh" : "auto",
      }}
    >
      {/* Ambient dust layer (desktop only) */}
      {isDesktop && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-50 dust" />
      )}

      {/* Desktop View */}
      {isDesktop && (
        <>
          {/* Orbit and Planets shared container */}
          <div className="absolute inset-0 pointer-events-none z-10 min-h-[800px]">
            <svg
              viewBox="0 0 1440 682"
              className="absolute top-1/2 left-[5%] w-[120%] h-[70%] -translate-y-1/2"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="orbit-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.14)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                </linearGradient>
              </defs>
              <path
                id="orbit-path"
                ref={pathRef}
                d="M-100,200 Q720,800 1540,200"
                fill="none"
                stroke="url(#orbit-grad)"
                strokeWidth="1.5"
                strokeDasharray="4 10"
              />
            </svg>
            {expertises.map((s, i) => (
              <button
                type="button"
                key={s.slug}
                ref={(el) => { planetRefs.current[i] = el; }}
                onClick={() => goTo(i)}
                aria-label={`Voir ${s.title}`}
                data-cursor="hover"
                className={cn(
                  "planet group absolute top-0 left-0 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full pointer-events-auto",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azur focus-visible:ring-offset-4 focus-visible:ring-offset-[#0e0e11]"
                )}
                style={{ transformOrigin: "center" }}
              >
                {/* Active glow ring (rotating) */}
                {i === active && (
                  <span
                    aria-hidden
                    className="planet-ring pointer-events-none absolute -inset-2 rounded-full"
                    style={{
                      background: "conic-gradient(from 0deg, rgba(0,166,166,0) 0deg, rgba(0,166,166,0.45) 80deg, rgba(0,166,166,0) 160deg, rgba(0,166,166,0) 360deg)",
                      filter: "blur(8px)",
                    }}
                  />
                )}

                {/* Image disc */}
                <span
                  className={cn(
                    "absolute inset-0 overflow-hidden rounded-full transition-[border,box-shadow] duration-700",
                    i === active
                      ? "border border-azur shadow-[0_0_80px_rgba(0,166,166,0.15)]"
                      : "border border-white/10 group-hover:border-white/30 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
                  )}
                >
                  <Image
                    src={s.image.src}
                    alt={s.image.alt}
                    fill
                    sizes="400px"
                    className="object-cover"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 40%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%)",
                      boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)"
                    }}
                  />
                </span>

                {/* Caption (only for active) */}
                {i === active && (
                  <span
                    aria-hidden
                    className="planet-caption pointer-events-none absolute left-1/2 top-full mt-6 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-white/85"
                  >
                    <span className="text-azur">{s.index}</span>
                    <span className="mx-2 text-white/30">·</span>
                    {s.title}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Texts and Controls (Absolute Left) */}
          <div className="absolute left-[8%] lg:left-[10%] top-[50%] -translate-y-[50%] z-50 w-[460px]">
            <Eyebrow tone="white" id="solutions-h">
              Nos solutions
            </Eyebrow>

            {/* Text Tabs wrapper */}
            <div className="relative mt-8 min-h-[380px]">
              {expertises.map((s, i) => (
                <div
                  key={s.slug}
                  className={cn(
                    "absolute top-0 left-0 w-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    i === active ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-12 pointer-events-none"
                  )}
                >
                  <h2
                    className="text-white font-medium"
                    style={{
                      fontSize: "clamp(2.5rem, 4vw, 4.5rem)",
                      letterSpacing: "-0.03em",
                      lineHeight: 0.95,
                    }}
                  >
                    {s.title}.
                  </h2>
                  <p className="mt-8 text-lg text-white/70 leading-[1.6]">
                    {s.short}
                  </p>
                  
                  <ul className="mt-8 space-y-3">
                    {s.bullets.slice(0, 4).map((b) => (
                      <li key={b} className="flex items-start gap-3 text-[15px] text-white/80">
                        <span aria-hidden className="mt-2.5 inline-block h-[2px] w-4 shrink-0 bg-azur" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/expertises/${s.slug}`}
                    data-cursor="hover"
                    className="underline-grow mt-10 inline-flex items-center gap-2 text-sm font-medium text-white uppercase tracking-widest"
                  >
                    {s.cta}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center gap-6">
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                aria-label="Solution précédente"
                data-cursor="hover"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10"
              >
                ←
              </button>

              <div className="relative">
                <svg viewBox="0 0 40 40" className="h-12 w-12 -rotate-90" aria-hidden>
                  <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" fill="none" />
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
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10"
              >
                →
              </button>

              <div className="ml-4 flex gap-1">
                {expertises.map((_, i) => (
                   <span 
                     key={i} 
                     className={cn(
                       "h-1.5 w-1.5 rounded-full transition-colors duration-500",
                       i === active ? "bg-azur" : "bg-white/20"
                     )}
                   />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile fallback */}
      {!isDesktop && (
        <div className="py-[clamp(80px,15vw,120px)]">
          <SolutionsMobile />
        </div>
      )}

      <style>{`
        /* Slow rotating glow ring on the active planet */
        .planet-ring {
          animation: planet-ring-spin 14s linear infinite;
        }
        @keyframes planet-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Caption soft pop-in when planet becomes active */
        .planet-caption {
          animation: caption-in 700ms cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 350ms;
        }
        @keyframes caption-in {
          from { opacity: 0; transform: translate(-50%, -4px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }

        /* Ambient dust — tiny static specks, slow drift */
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
