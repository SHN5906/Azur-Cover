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
  const [paused, setPaused] = useState(false);

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
            ? "radial-gradient(ellipse 65% 80% at 50% 32%, var(--tint), #0a0a0c 78%)"
            : undefined,
          transition: "background 2200ms cubic-bezier(0.16,1,0.3,1)",
          minHeight: isDesktop ? "100vh" : "auto",
        } as React.CSSProperties
      }
    >
      {/* Desktop layout — planète active centrée, texte juste sous elle.
          Layout 1-colonne : la rotation des planètes et le crossfade du texte
          sont alignés visuellement (même axe vertical), donc l'œil perçoit
          le changement comme un seul mouvement synchrone. */}
      {isDesktop && (
        <div className="relative z-10 flex h-screen min-h-[900px] flex-col items-center pt-[clamp(40px,6vh,72px)] pb-[clamp(40px,5vh,72px)]">
          {/* Section label — au-dessus des planètes pour annoncer la section.
              Forcé en blanc plein + tracking large pour lever toute ambiguïté
              sur le fond carbone + tint radial. */}
          <Eyebrow
            tone="white"
            id="solutions-h"
            className="!text-white !text-[18px] [letter-spacing:0.28em]"
          >
            Nos solutions
          </Eyebrow>

          {/* Planets stage — zone supérieure, planètes absolument positionnées */}
          <div className="relative mt-[clamp(16px,2.5vh,32px)] w-full max-w-[1100px] h-[clamp(360px,42vh,480px)]">
            {expertises.map((s, i) => (
              <button
                type="button"
                key={s.slug}
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

          {/* Nav (flèches + compteur) — directement sous la planète, au-dessus
              du texte. Sert de transition visuelle entre l'illustration et
              le contenu. */}
          <div className="mt-[clamp(16px,2.5vh,32px)] flex items-center gap-5">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Solution précédente"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white/50 hover:text-white"
            >
              ←
            </button>
            <span className="font-mono text-[13px] uppercase tracking-[0.22em] text-white/35">
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

          {/* Texte — sous la nav, centré horizontalement. Le crossfade (1400ms)
              démarre en même temps que GSAP repositionne les planètes (1800ms)
              — perception d'un seul mouvement synchrone. */}
          <div
            role="tabpanel"
            id={`panel-${current.slug}`}
            aria-labelledby={`tab-a11y-${current.slug}`}
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
                  {/* Title : mask reveal mot par mot. Le remount via key force
                      le redémarrage de l'animation à chaque slide actif. */}
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

      {/* Fondu vers la section suivante (bg-ink = #0d2537) — évite la coupe
          nette entre le fond carbone du carousel et le navy de l'AerogelStory. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[160px]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, var(--color-ink) 100%)",
        }}
      />

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
