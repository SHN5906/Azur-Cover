"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { expertises } from "@/content/expertises";
import { cn } from "@/lib/utils";
import { SolutionsMobile } from "./SolutionsMobile";

const N = expertises.length;
// Plus lent = plus premium. Thales tourne à ~10s par slide, on s'aligne.
const AUTOPLAY_MS = 10000;
const TRANSITION_MS = 1800;

// Tint par solution — encore plus subtil qu'avant, juste un voile.
const TINTS: Record<string, string> = {
  etancheite: "rgba(40, 80, 120, 0.22)",
  "cool-roofing": "rgba(190, 170, 130, 0.20)",
  "azur-reflect": "rgba(0, 140, 140, 0.24)",
  autres: "rgba(110, 114, 128, 0.18)",
};
const TINT_FALLBACK = "rgba(60, 60, 65, 0.20)";

type Slot = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  blur: number;
  saturate: number;
  brightness: number;
  z: number;
};

// Active devient HÉROÏQUE (scale 1.0, full saturation). Autres deviennent
// quasi fantomatiques (0.20 opacity, blur 14px) — l'œil ne lit que l'active.
const SLOTS: Record<number, Slot> = {
  0: { x: 52, y: 50, scale: 1.0,  opacity: 1.0,  blur: 0,  saturate: 1.0,  brightness: 1.0,  z: 50 },
  1: { x: 95, y: 28, scale: 0.32, opacity: 0.22, blur: 14, saturate: 0.2,  brightness: 0.55, z: 30 },
  2: { x: 60, y: 6,  scale: 0.22, opacity: 0.14, blur: 18, saturate: 0.1,  brightness: 0.45, z: 20 },
  3: { x: 9,  y: 22, scale: 0.32, opacity: 0.22, blur: 14, saturate: 0.2,  brightness: 0.55, z: 30 },
};

function slotForOffset(offset: number): Slot {
  return SLOTS[offset] ?? SLOTS[0];
}

const DESKTOP_MQ = "(min-width: 1024px)";
function subscribeDesktop(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(DESKTOP_MQ);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getDesktopSnapshot() {
  return typeof window !== "undefined" && window.matchMedia(DESKTOP_MQ).matches;
}
function getDesktopServerSnapshot() {
  return false;
}

export function SolutionsCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const planetRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktopSnapshot,
    getDesktopServerSnapshot,
  );

  const layout = useCallback(
    (immediate = false) => {
      planetRefs.current.forEach((el, i) => {
        if (!el) return;
        const offset = (i - active + N) % N;
        const slot = slotForOffset(offset);
        el.style.zIndex = String(slot.z);
        gsap.to(el, {
          left: `${slot.x}%`,
          top: `${slot.y}%`,
          xPercent: -50,
          yPercent: -50,
          scale: slot.scale,
          opacity: slot.opacity,
          filter: `blur(${slot.blur}px) saturate(${slot.saturate}) brightness(${slot.brightness})`,
          duration: immediate ? 0 : TRANSITION_MS / 1000,
          // power3.inOut = plus lent en début/fin, courbe plus cinématique
          ease: "power3.inOut",
          overwrite: "auto",
          onStart: () => {
            el.style.willChange = "transform, opacity, filter";
          },
          onComplete: () => {
            el.style.willChange = "auto";
          },
        });
      });
    },
    [active],
  );

  const isFirstLayout = useRef(true);
  useLayoutEffect(() => {
    if (!isDesktop) return;
    if (isFirstLayout.current) {
      layout(true);
      isFirstLayout.current = false;
    } else {
      layout(false);
    }
  }, [active, isDesktop, layout]);

  useEffect(() => {
    if (!isDesktop) isFirstLayout.current = true;
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setActive((i) => (i + 1) % N), AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, isDesktop]);

  const goTo = useCallback((i: number) => {
    setActive(((i % N) + N) % N);
  }, []);

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

  const current = expertises[active];
  const tint = TINTS[current.slug] ?? TINT_FALLBACK;

  return (
    <section
      ref={sectionRef}
      id="solutions"
      aria-labelledby="solutions-h"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative overflow-hidden bg-[#0a0a0c] text-white"
      style={
        {
          "--tint": tint,
          background: isDesktop
            ? "radial-gradient(ellipse 75% 90% at 72% 50%, var(--tint), #0a0a0c 75%)"
            : undefined,
          transition: "background 2200ms cubic-bezier(0.16,1,0.3,1)",
          minHeight: isDesktop ? "100vh" : "auto",
        } as React.CSSProperties
      }
    >
      {/* Desktop layout */}
      {isDesktop && (
        <div className="relative grid h-screen min-h-[820px] grid-cols-12 z-10">
          {/* Text column — plus de place, typo plus généreuse */}
          <div
            role="tabpanel"
            id={`panel-${current.slug}`}
            aria-labelledby={`tab-a11y-${current.slug}`}
            tabIndex={0}
            className="col-span-5 flex items-center pl-[clamp(48px,7vw,140px)] pr-12 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azur focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0a0c]"
          >
            <div className="w-full max-w-[500px]">
              <Eyebrow tone="white" id="solutions-h">
                Nos solutions
              </Eyebrow>

              <div className="relative mt-10 min-h-[460px]">
                {expertises.map((s, i) => (
                  <div
                    key={s.slug}
                    aria-hidden={i !== active}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-[1400ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                      i === active
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none",
                    )}
                  >
                    {/* Title : mask reveal mot par mot (clean, plus subtil que slide+fade) */}
                    <h2
                      key={`h2-${s.slug}-${i === active ? "a" : "i"}`}
                      className="text-white solutions-title"
                      style={{
                        fontSize: "clamp(3rem, 4.6vw, 5.5rem)",
                        fontWeight: 600,
                        letterSpacing: "-0.035em",
                        lineHeight: 0.96,
                      }}
                      aria-label={`${s.title}.`}
                    >
                      {(s.title + ".").split(/(\s+)/).map((part, idx) =>
                        /^\s+$/.test(part) ? (
                          <span key={idx}>{part}</span>
                        ) : (
                          <span
                            key={idx}
                            aria-hidden
                            className="solutions-title-word"
                            style={{ animationDelay: i === active ? `${idx * 90}ms` : "0ms" }}
                          >
                            <span className="solutions-title-word-inner">{part}</span>
                          </span>
                        ),
                      )}
                    </h2>

                    <p
                      className="mt-8 text-white/65"
                      style={{
                        fontSize: "1.1rem",
                        lineHeight: 1.65,
                        animationDelay: `${(s.title.split(" ").length + 2) * 90}ms`,
                      }}
                    >
                      {s.short}
                    </p>

                    <ul className="mt-8 space-y-3">
                      {s.bullets.slice(0, 4).map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-3 text-sm text-white/75"
                        >
                          <span
                            aria-hidden
                            className="mt-2 inline-block h-px w-5 shrink-0 bg-azur"
                          />
                          {b}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/expertises/${s.slug}`}
                      className="underline-grow mt-10 inline-flex items-center gap-2 text-sm font-medium text-white"
                    >
                      {s.cta}
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Compteur + arrows — minimaliste, pas de pagination redondante */}
              <div className="mt-14 flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => goTo(active - 1)}
                  aria-label="Solution précédente"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white/50 hover:text-white"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => goTo(active + 1)}
                  aria-label="Solution suivante"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white/50 hover:text-white"
                >
                  →
                </button>
                <span className="ml-2 font-mono text-[13px] uppercase tracking-[0.22em] text-white/35">
                  {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Planets stage — épuré : pas d'orbit SVG, pas de ring, pas de caption */}
          <div className="col-span-7 relative">
            {expertises.map((s, i) => (
              <button
                type="button"
                key={s.slug}
                ref={(el) => {
                  planetRefs.current[i] = el;
                }}
                onClick={() => goTo(i)}
                aria-label={`Voir ${s.title}`}
                className={cn(
                  "planet group absolute left-0 top-0 h-[clamp(320px,32vw,460px)] w-[clamp(320px,32vw,460px)] overflow-visible rounded-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azur focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0a0c]",
                  i === active && "planet-active",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-0 overflow-hidden rounded-full transition-[border,box-shadow] duration-700",
                    i === active
                      ? "border border-white/20 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.6),inset_0_0_60px_rgba(0,0,0,0.3)]"
                      : "border border-white/8",
                  )}
                >
                  <div
                    key={`kb-${i}-${active}`}
                    className={cn(
                      "absolute inset-0",
                      i === active && "ken-burns",
                    )}
                  >
                    <Image
                      src={s.image.src}
                      alt={s.image.alt}
                      fill
                      sizes="460px"
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                  {/* Sphère : ombre interne très douce */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 38%), radial-gradient(circle at 72% 78%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 55%)",
                    }}
                  />
                  {/* Reflet diagonal Azur Reflect (active seulement) */}
                  {i === active && (
                    <span
                      key={`gloss-${active}`}
                      aria-hidden
                      className="planet-gloss pointer-events-none absolute inset-0 rounded-full overflow-hidden"
                    >
                      <span className="planet-gloss-band" />
                    </span>
                  )}
                </span>
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

      {/* Hidden a11y tablist */}
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
        /* Ken-burns lent et imperceptible — juste assez pour donner vie. */
        .ken-burns {
          animation: ken-burns 16s cubic-bezier(0.33,0,0.67,1) forwards;
          transform-origin: 50% 50%;
        }
        @keyframes ken-burns {
          from { transform: scale(1) translate3d(0, 0, 0); }
          to   { transform: scale(1.04) translate3d(-0.5%, -0.5%, 0); }
        }

        /* Title : mask reveal — chaque mot dans un masque qui se lève */
        .solutions-title-word {
          display: inline-block;
          overflow: hidden;
          vertical-align: top;
          padding-bottom: 0.06em;
        }
        .solutions-title-word-inner {
          display: inline-block;
          transform: translateY(100%);
          animation: title-mask-up 1200ms cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes title-mask-up {
          to { transform: translateY(0); }
        }

        /* Reflet diagonal — vernis Azur Reflect appliqué littéralement.
           Une bande blanche translucide qui balaie la planète une fois,
           ~1.6s après l'arrivée de l'active (laisse le temps au mask + ken-burns
           de poser). */
        .planet-gloss-band {
          position: absolute;
          top: -50%;
          left: -75%;
          width: 50%;
          height: 200%;
          background: linear-gradient(
            115deg,
            transparent 35%,
            rgba(255,255,255,0.04) 45%,
            rgba(255,255,255,0.22) 50%,
            rgba(255,255,255,0.04) 55%,
            transparent 65%
          );
          transform: translateX(0) rotate(0deg);
          animation: planet-gloss-sweep 2400ms cubic-bezier(0.22,1,0.36,1) 1600ms forwards;
          mix-blend-mode: screen;
        }
        @keyframes planet-gloss-sweep {
          0%   { transform: translateX(0); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(380%); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ken-burns,
          .solutions-title-word-inner,
          .planet-gloss-band {
            animation: none !important;
          }
          .solutions-title-word-inner { transform: none; }
          .planet-gloss-band { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
