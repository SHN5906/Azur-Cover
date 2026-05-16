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
const AUTOPLAY_MS = 8000;

// --- Per-solution tint (drives a CSS variable for the radial-gradient bg).
//     Subtle — must not compete with planet imagery.
const TINTS: Record<string, string> = {
  etancheite: "rgba(56, 102, 138, 0.30)",     // sealing — deep cool blue
  "cool-roofing": "rgba(214, 196, 156, 0.28)", // warm reflective sand
  "azur-reflect": "rgba(0, 166, 166, 0.32)",   // brand cyan
  autres: "rgba(120, 124, 138, 0.22)",         // graphite neutral
};
const TINT_FALLBACK = "rgba(60, 60, 65, 0.25)";

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

// Orbital wheel — 4 planets visible. Each "next" tick: 1 → 0 → 3 → 2 → 1 …
// All four hops are short, no teleport across the stage.
const SLOTS: Record<number, Slot> = {
  0: { x: 52, y: 55, scale: 0.85, opacity: 1.0,  blur: 0,  saturate: 1.0,  brightness: 1.0,  z: 50 }, // ACTIVE centre
  1: { x: 92, y: 30, scale: 0.42, opacity: 0.55, blur: 7,  saturate: 0.35, brightness: 0.72, z: 30 }, // upper-right
  2: { x: 60, y: 10, scale: 0.30, opacity: 0.30, blur: 12, saturate: 0.15, brightness: 0.60, z: 20 }, // top
  3: { x: 14, y: 22, scale: 0.42, opacity: 0.55, blur: 7,  saturate: 0.35, brightness: 0.72, z: 30 }, // upper-left (above text)
};

function slotForOffset(offset: number): Slot {
  return SLOTS[offset] ?? SLOTS[0];
}

// --- Hydration-safe matchMedia (no setState-in-effect, no flash).
//     Server + initial client = false, then real value after mount.
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
        const stagger = immediate ? 0 : offset * 0.08;
        gsap.to(el, {
          left: `${slot.x}%`,
          top: `${slot.y}%`,
          xPercent: -50,
          yPercent: -50,
          scale: slot.scale,
          opacity: slot.opacity,
          filter: `blur(${slot.blur}px) saturate(${slot.saturate}) brightness(${slot.brightness})`,
          duration: immediate ? 0 : 1.4,
          delay: stagger,
          ease: "power2.inOut",
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

  // Autoplay (pauses on hover/focus, respects reduced-motion).
  useEffect(() => {
    if (!isDesktop || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setActive((i) => (i + 1) % N), AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, isDesktop]);

  const goTo = useCallback((i: number) => {
    setActive(((i % N) + N) % N);
  }, []);

  // Keyboard arrows.
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
      className="relative overflow-hidden bg-[#0e0e11] text-white"
      style={
        {
          "--tint": tint,
          background: isDesktop
            ? "radial-gradient(ellipse 70% 80% at 75% 50%, var(--tint), #0e0e11 80%)"
            : undefined,
          transition: "background 1400ms cubic-bezier(0.16,1,0.3,1)",
          minHeight: isDesktop ? "100vh" : "auto",
        } as React.CSSProperties
      }
    >
      {/* Ambient dust (desktop only) */}
      {isDesktop && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-50 dust"
        />
      )}

      {/* Desktop layout */}
      {isDesktop && (
        <div className="relative grid h-screen min-h-[820px] grid-cols-12 z-10 pb-24">
          {/* Text column */}
          <div
            role="tabpanel"
            id={`panel-${current.slug}`}
            aria-labelledby={`tab-a11y-${current.slug}`}
            tabIndex={0}
            className="col-span-5 flex items-center pl-[clamp(40px,6vw,120px)] pr-8 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azur focus-visible:ring-offset-4 focus-visible:ring-offset-[#0e0e11]"
          >
            <div className="w-full max-w-[460px]">
              <Eyebrow tone="white" id="solutions-h">
                Nos solutions
              </Eyebrow>

              {/* Crossfade text with word-by-word stagger on title */}
              <div className="relative mt-8 min-h-[420px]">
                {expertises.map((s, i) => (
                  <div
                    key={s.slug}
                    aria-hidden={i !== active}
                    className={cn(
                      "absolute inset-0 transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                      i === active
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-4 pointer-events-none",
                    )}
                  >
                    <h2
                      key={`h2-${s.slug}-${i === active ? "active" : "idle"}`}
                      className="text-white solutions-title"
                      style={{
                        fontSize: "clamp(2.5rem, 4vw, 4.5rem)",
                        fontWeight: 600,
                        letterSpacing: "-0.03em",
                        lineHeight: 0.95,
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
                            style={{ animationDelay: i === active ? `${idx * 70}ms` : "0ms" }}
                          >
                            {part}
                          </span>
                        ),
                      )}
                    </h2>
                    <p
                      className="mt-7 text-white/70"
                      style={{ fontSize: "1.0625rem", lineHeight: 1.6 }}
                    >
                      {s.short}
                    </p>
                    <ul className="mt-7 space-y-2.5">
                      {s.bullets.slice(0, 4).map((b) => (
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
                    <Link
                      href={`/expertises/${s.slug}`}
                      className="underline-grow mt-8 inline-flex items-center gap-2 text-sm font-medium text-white"
                    >
                      {s.cta}
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Prev/next + counter only — labels moved to bottom tabs */}
              <div className="mt-12 flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => goTo(active - 1)}
                  aria-label="Solution précédente"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60 hover:bg-white/5"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => goTo(active + 1)}
                  aria-label="Solution suivante"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60 hover:bg-white/5"
                >
                  →
                </button>
                <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                  {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Planets stage. right 60%, isolated from text column */}
          <div className="col-span-7 relative">
            {/* Orbit decoration */}
            <svg
              aria-hidden
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <ellipse
                cx="52"
                cy="40"
                rx="42"
                ry="32"
                fill="none"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="0.15"
                strokeDasharray="0.6 1.2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

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
                  "planet group absolute left-0 top-0 h-[clamp(280px,30vw,420px)] w-[clamp(280px,30vw,420px)] overflow-visible rounded-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azur focus-visible:ring-offset-4 focus-visible:ring-offset-[#0e0e11]",
                  i === active && "planet-active",
                )}
                /* GSAP owns left/top/transform/opacity */
              >
                {/* Active glow ring */}
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
                      : "border border-white/10 group-hover:border-white/30",
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
                      sizes="420px"
                      className="object-cover"
                      priority
                    />
                  </div>
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
              </button>
            ))}

            {/* Active caption pinned at the active slot, immune to GSAP transforms */}
            <span
              key={`cap-${active}`}
              aria-hidden
              className="planet-caption pointer-events-none absolute z-[60] whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.22em] text-white/85"
              style={{
                left: `${SLOTS[0].x}%`,
                top: `${SLOTS[0].y}%`,
                transform: "translate(-50%, calc(clamp(119px, 12.75vw, 178.5px) + 28px))",
              }}
            >
              <span className="text-azur">{expertises[active].index}</span>
              <span className="mx-2 text-white/30">·</span>
              {expertises[active].title}
            </span>
          </div>

          {/* Bottom tab labels (à la Thales) */}
          <nav
            role="tablist"
            aria-label="Choisir une solution"
            className="absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/30 backdrop-blur-md"
          >
            <div className="mx-auto grid max-w-[1320px] grid-cols-4 px-[clamp(40px,6vw,120px)]">
              {expertises.map((s, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={s.slug}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${s.slug}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => goTo(i)}
                    className={cn(
                      "tab-btn group relative flex flex-col items-start gap-1 py-5 text-left transition-colors duration-300",
                      isActive
                        ? "text-white"
                        : "text-white/45 hover:text-white/85",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[10px] tracking-[0.22em] transition-colors duration-300",
                        isActive ? "text-azur" : "text-white/30",
                      )}
                    >
                      {s.index}
                    </span>
                    <span className="text-[15px] font-medium leading-tight tracking-tight">
                      {s.title}
                    </span>
                    {/* Top accent line */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-0 -top-px h-px origin-left transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                        isActive
                          ? "scale-x-100 bg-azur"
                          : "scale-x-0 bg-white/30 group-hover:scale-x-100",
                      )}
                    />
                    {/* Autoplay progress (active only, restarts on slide change) */}
                    {isActive && !paused && (
                      <span
                        key={`prog-${active}`}
                        aria-hidden
                        className="tab-progress absolute inset-x-0 -top-px h-px origin-left bg-azur/60"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {/* Mobile fallback */}
      {!isDesktop && (
        <div className="py-[clamp(80px,15vw,120px)]">
          <SolutionsMobile />
        </div>
      )}

      {/* Hidden a11y tablist (kept for SR users who don't see bottom tabs on init) */}
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
        .planet-ring { animation: planet-ring-spin 14s linear infinite; }
        @keyframes planet-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .planet-caption {
          animation: caption-in 700ms cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 350ms;
        }
        @keyframes caption-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Ken-burns on the active planet's image only.
           Restarts every slide change via the key={} reset. */
        .ken-burns {
          animation: ken-burns ${AUTOPLAY_MS}ms cubic-bezier(0.33,0,0.67,1) forwards;
          transform-origin: 50% 50%;
        }
        @keyframes ken-burns {
          from { transform: scale(1) translate3d(0, 0, 0); }
          to   { transform: scale(1.08) translate3d(-1%, -1%, 0); }
        }

        /* Word-by-word stagger on the active title (mask + slide-up). */
        .solutions-title-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(28px);
          animation: title-word-in 1100ms cubic-bezier(0.16,1,0.3,1) forwards;
          /* delay set inline per word */
        }
        @keyframes title-word-in {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Autoplay progress bar inside the active tab. */
        .tab-progress {
          animation: tab-progress ${AUTOPLAY_MS}ms linear forwards;
        }
        @keyframes tab-progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
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
          .planet-ring,
          .planet-caption,
          .ken-burns,
          .solutions-title-word,
          .tab-progress,
          .dust {
            animation: none !important;
          }
          .solutions-title-word { opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}
