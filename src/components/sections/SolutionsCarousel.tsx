"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
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

// Layout centré : active au centre horizontal, légèrement décalée vers le bas
// pour laisser place aux 3 planètes périphériques en arc au-dessus d'elle.
// Coordonnées en % de la zone planets (relative, max-w-1100, h-clamp 360-480).
const SLOTS: Record<number, Slot> = {
  0: { x: 50, y: 62, scale: 1.0,  opacity: 1.0,  blur: 0,  saturate: 1.0,  brightness: 1.0,  z: 50 },
  1: { x: 82, y: 18, scale: 0.32, opacity: 0.22, blur: 14, saturate: 0.2,  brightness: 0.55, z: 30 },
  2: { x: 50, y: 6,  scale: 0.22, opacity: 0.14, blur: 18, saturate: 0.1,  brightness: 0.45, z: 20 },
  3: { x: 18, y: 18, scale: 0.32, opacity: 0.22, blur: 14, saturate: 0.2,  brightness: 0.55, z: 30 },
};

function slotForOffset(offset: number): Slot {
  return SLOTS[offset] ?? SLOTS[0];
}

/** Animate a planet element to a slot via the native Web Animations API.
 *  Replaces the previous gsap.to() call — zero runtime dependency. */
function animatePlanet(el: HTMLElement, slot: Slot, immediate: boolean) {
  el.style.zIndex = String(slot.z);

  const target: Keyframe = {
    left: `${slot.x}%`,
    top: `${slot.y}%`,
    transform: `translate(-50%, -50%) scale(${slot.scale})`,
    opacity: slot.opacity,
    filter: `blur(${slot.blur}px) saturate(${slot.saturate}) brightness(${slot.brightness})`,
  };

  if (immediate) {
    Object.assign(el.style, target);
    return;
  }

  el.style.willChange = "transform, opacity, filter";
  const anim = el.animate([target], {
    duration: TRANSITION_MS,
    easing: "cubic-bezier(0.65, 0, 0.35, 1)", // power3.inOut equivalent
    fill: "forwards",
  });
  anim.onfinish = () => {
    // Commit final values to inline style, remove the animation, and clean up.
    Object.assign(el.style, target);
    anim.cancel();
    el.style.willChange = "auto";
  };
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
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const planetRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [active, setActive] = useState(0);
  // Pause au focus clavier uniquement (mécanisme WCAG 2.2.2). Pas de pause
  // au survol : la section fait 100vh, la souris serait toujours dessus.
  const [paused, setPaused] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressAnimRef = useRef<Animation | null>(null);

  // Prefetch toutes les pages solutions au mount : le clic sur la planète
  // active doit naviguer instantanément.
  useEffect(() => {
    expertises.forEach((s) => router.prefetch(`/expertises/${s.slug}`));
  }, [router]);

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
        animatePlanet(el, slot, immediate);
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

  // The WAAPI animation IS the timer: when it finishes → next slide.
  // Pausing the animation automatically pauses the slide change.
  // No setTimeout needed — one source of truth, always in sync.
  useEffect(() => {
    if (!isDesktop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = progressRef.current;
    if (!el) return;

    const anim = el.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: AUTOPLAY_MS, easing: "linear", fill: "forwards" },
    );
    progressAnimRef.current = anim;

    if (paused) anim.pause();

    anim.onfinish = () => setActive((i) => (i + 1) % N);

    return () => { anim.cancel(); };
  }, [active, isDesktop]); // intentionally excludes `paused` (handled below)

  // Pause / resume — separate effect so it doesn't restart the animation.
  useEffect(() => {
    const anim = progressAnimRef.current;
    if (!anim || anim.playState === "idle") return;
    if (paused) anim.pause();
    else anim.play();
  }, [paused]);

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
      // Pas de pause au survol : la section fait 100vh, donc la souris est
      // toujours dessus quand on la regarde → la barre resterait figée à 0.
      // On garde uniquement la pause au focus clavier (mécanisme WCAG 2.2.2)
      // — l'autoplay reste contrôlable via les flèches ‹ › et le clic planète.
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative overflow-hidden bg-[#0a0a0c] text-white"
      style={
        {
          "--tint": tint,
          background: isDesktop
            ? "radial-gradient(ellipse 65% 80% at 50% 32%, var(--tint), #0a0a0c 78%)"
            : undefined,
          transition: "background 2200ms cubic-bezier(0.16,1,0.3,1)",
          minHeight: isDesktop ? "100vh" : "auto",
        } as React.CSSProperties
      }
    >
      {/* Desktop layout — planète active centrée, texte juste sous elle. */}
      {isDesktop && (
        <div className="relative z-10 flex h-screen min-h-[900px] flex-col items-center pt-[clamp(40px,6vh,72px)] pb-[clamp(40px,5vh,72px)]">
          <Eyebrow
            tone="white"
            id="solutions-h"
            className="!text-white !text-[18px] [letter-spacing:0.28em]"
          >
            Nos solutions
          </Eyebrow>

          <div
            role="tablist"
            aria-label="Choisir une solution"
            className="relative mt-[clamp(16px,2.5vh,32px)] w-full max-w-[1100px] h-[clamp(360px,42vh,480px)]"
          >
            {expertises.map((s, i) => (
              <button
                type="button"
                key={s.slug}
                id={`tab-${s.slug}`}
                role="tab"
                aria-selected={i === active}
                aria-controls="solutions-panel"
                tabIndex={i === active ? 0 : -1}
                ref={(el) => {
                  planetRefs.current[i] = el;
                }}
                onClick={() => {
                  if (i === active) {
                    router.push(`/expertises/${s.slug}`);
                  } else {
                    goTo(i);
                  }
                }}
                aria-label={
                  i === active
                    ? `Voir la page ${s.title}`
                    : `Afficher la solution ${s.title}`
                }
                className={cn(
                  "planet group absolute left-0 top-0 h-[clamp(220px,22vw,320px)] w-[clamp(220px,22vw,320px)] overflow-visible rounded-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azur focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0a0c]",
                  i === active && "planet-active cursor-pointer",
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
                      sizes="320px"
                      className="object-cover"
                    />
                  </div>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 38%), radial-gradient(circle at 72% 78%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 55%)",
                    }}
                  />
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

          <div className="mt-[clamp(16px,2.5vh,32px)] flex items-center gap-5">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Solution précédente"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white/50 hover:text-white"
            >
              ←
            </button>
            <span className="font-mono text-[13px] uppercase tracking-[0.22em] text-white/60">
              {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Solution suivante"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white/50 hover:text-white"
            >
              →
            </button>
          </div>

          <div
            aria-hidden
            className="mt-4 h-[2px] w-[180px] overflow-hidden rounded-full bg-white/10"
          >
            <div
              ref={progressRef}
              className="h-full origin-left bg-azur"
              style={{ transform: "scaleX(0)" }}
            />
          </div>

          <div
            role="tabpanel"
            id="solutions-panel"
            aria-labelledby={`tab-${current.slug}`}
            tabIndex={0}
            className="relative mt-[clamp(20px,3vh,40px)] w-full max-w-[640px] px-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azur focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0a0c]"
          >
            <div className="relative min-h-[220px]">
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
                  <h2
                    key={`h2-${s.slug}-${i === active ? "a" : "i"}`}
                    className="text-white solutions-title"
                    style={{
                      fontSize: "clamp(2.25rem, 3.6vw, 3.75rem)",
                      fontWeight: 600,
                      letterSpacing: "-0.035em",
                      lineHeight: 1.05,
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
                    className="mx-auto mt-5 max-w-[540px] text-white/65"
                    style={{
                      fontSize: "1.0625rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {s.short}
                  </p>

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

          </div>
        </div>
      )}

      {/* Mobile fallback */}
      {!isDesktop && (
        <div className="py-[clamp(80px,15vw,120px)]">
          <SolutionsMobile />
        </div>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[160px]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, var(--color-ink) 100%)",
        }}
      />

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

        /* Reflet diagonal — vernis Azur Reflect */
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
