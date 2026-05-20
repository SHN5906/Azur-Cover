"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

// Récit scroll-orchestré : surchauffe → revêtement → rayonnement renvoyé.
// Desktop : section de 300vh, scène sticky pinnée, 3 chapitres en crossfade.
// Mobile : pas de pin — les 3 chapitres sont simplement empilés.
const CHAPTERS = [
  {
    index: "01",
    kicker: "Le problème",
    title: ["Un toit", "qui surchauffe."],
    body: "Sous le soleil, une toiture sombre peut dépasser 80 °C. Cette chaleur rayonne vers l’intérieur et fait grimper la température des espaces situés juste en dessous.",
  },
  {
    index: "02",
    kicker: "La réponse",
    title: ["Un héritage", "spatial."],
    body: "Le revêtement Cool Roofing intègre de l’aérogel de silice — un isolant conçu pour protéger les structures spatiales des écarts thermiques extrêmes. Appliqué en membrane continue, sans démontage de la toiture existante.",
  },
  {
    index: "03",
    kicker: "Le résultat",
    title: ["80 à 90 %", "renvoyés."],
    body: "La membrane réfléchit 80 à 90 % du rayonnement solaire avant qu’il ne pénètre le bâtiment. Performance certifiée CSTB et classement B-ROOF (t3).",
  },
] as const;

// Rayons solaires illustrés sur le bâtiment : un trait entrant (lime = chaleur)
// frappe le toit ou une fenêtre, puis un trait réfléchi (azur) repart vers le
// ciel. Coordonnées calées sur building-cool-roof.svg (viewBox 800×600).
// t0 → début du tracé entrant, t1 → impact, t2 → fin du tracé réfléchi.
const RAYS = [
  { in: "M238,12 L385,296", impact: { x: 385, y: 296 }, end: { x: 523, y: 30 }, t0: 0.05, t1: 0.26, t2: 0.42 },
  { in: "M376,12 L505,262", impact: { x: 505, y: 262 }, end: { x: 625, y: 30 }, t0: 0.2, t1: 0.42, t2: 0.58 },
  { in: "M102,12 L295,385", impact: { x: 295, y: 385 }, end: { x: 479, y: 30 }, t0: 0.36, t1: 0.58, t2: 0.74 },
  { in: "M302,12 L495,385", impact: { x: 495, y: 385 }, end: { x: 679, y: 30 }, t0: 0.52, t1: 0.74, t2: 0.93 },
] as const;

// Fenêtres d’opacité de chaque chapitre sur la progression [0–1].
const WINDOWS: [number, number, number, number][] = [
  [0, 0.04, 0.28, 0.34],
  [0.33, 0.41, 0.59, 0.67],
  [0.66, 0.74, 0.97, 1],
];

export function AerogelStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  // Progression [0–1] calculée directement depuis getBoundingClientRect :
  // robuste, sans dépendre de la détection de conteneur de useScroll.
  const progress = useMotionValue(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const raw = distance > 0 ? -rect.top / distance : 0;
      progress.set(raw < 0 ? 0 : raw > 1 ? 1 : raw);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [progress]);

  // Drift de caméra — l’illustration glisse doucement pour donner de la vie
  // sans jamais rogner les sujets (object-contain conservé).
  const imgX = useTransform(progress, [0, 1], ["5%", "-5%"]);
  const imgScale = useTransform(progress, [0, 1], [1.02, 1.12]);

  // Glow ambiant qui respire avec la progression.
  const glowOpacity = useTransform(progress, [0, 0.5, 1], [0.25, 0.5, 0.3]);

  // Chapitre actif — dérivé du scroll pour piloter l’index visuel.
  const [activeChapter, setActiveChapter] = useState(0);
  useMotionValueEvent(progress, "change", (p) => {
    const next = p < 0.34 ? 0 : p < 0.66 ? 1 : 2;
    setActiveChapter((prev) => (prev === next ? prev : next));
  });

  return (
    <>
      {/* Desktop — scène pinnée sur 300vh */}
      <section
        ref={sectionRef}
        id="aerogel-story"
        aria-labelledby="aerogel-h"
        className="relative hidden h-[300vh] bg-ink text-white lg:block"
      >
        <div className="sticky top-0 flex h-svh w-full items-center overflow-hidden">
          <motion.div
            aria-hidden
            style={{ opacity: glowOpacity }}
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 55% 70% at 32% 45%, rgba(0,142,185,0.40) 0%, transparent 62%), radial-gradient(circle at 88% 88%, rgba(189,213,119,0.16) 0%, transparent 52%)",
              }}
            />
          </motion.div>

          <Container className="relative z-10">
            <div className="grid grid-cols-12 items-center gap-x-12 xl:gap-x-16">
              {/* Viewport — panneau clair, l’illustration blanche y est native */}
              <div className="col-span-7">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
                  <motion.div
                    style={{ x: imgX, scale: imgScale }}
                    className="absolute inset-0"
                  >
                    <Image
                      src="/images/illustrations/building-cool-roof.svg"
                      alt="Bâtiment moderne à toiture plate équipée du revêtement réfléchissant Cool Roofing"
                      fill
                      sizes="(min-width: 1024px) 56vw, 0px"
                      className="object-contain"
                    />
                    {/* Calque rayons — solidaire de la dérive caméra pour rester aligné */}
                    <HeatRays progress={progress} staticState={!!prefersReduced} idKey="desktop" />
                  </motion.div>

                  <span className="absolute bottom-4 left-5 font-mono text-[12px] uppercase tracking-[0.22em] text-ink/45">
                    Toiture Cool Roofing
                  </span>
                  <ScrubBar progress={progress} />
                </div>
              </div>

              {/* Texte — chapitres en crossfade */}
              <div className="col-span-5">
                <span
                  id="aerogel-h"
                  className="block font-mono text-[17px] uppercase tracking-[0.22em] text-white/55"
                >
                  Le matériau qui réfléchit
                </span>

                <div className="relative mt-7 min-h-[340px]">
                  {CHAPTERS.map((chapter, i) => (
                    <Chapter
                      key={chapter.index}
                      chapter={chapter}
                      progress={progress}
                      window={WINDOWS[i]}
                    />
                  ))}
                </div>

                <div className="mt-10 flex items-center gap-6 border-t border-white/10 pt-6">
                  {CHAPTERS.map((chapter, i) => (
                    <span
                      key={chapter.index}
                      className={cn(
                        "flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.22em] transition-colors duration-300",
                        i === activeChapter ? "text-white" : "text-white/35"
                      )}
                    >
                      {chapter.index}
                      <span
                        aria-hidden
                        className={cn(
                          "block h-px bg-azur transition-all duration-300 ease-out",
                          i === activeChapter
                            ? "w-7 opacity-100"
                            : "w-2.5 opacity-40"
                        )}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Container>

          <ScrollCue progress={progress} />
        </div>
      </section>

      {/* Mobile — récit vertical, sans pin */}
      <section
        aria-labelledby="aerogel-h-mobile"
        className="relative overflow-hidden bg-ink py-24 text-white lg:hidden"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 45% at 50% 22%, rgba(0,142,185,0.32) 0%, transparent 64%), radial-gradient(circle at 85% 92%, rgba(189,213,119,0.14) 0%, transparent 52%)",
          }}
        />
        <Container className="relative">
          <span
            id="aerogel-h-mobile"
            className="block font-mono text-[17px] uppercase tracking-[0.22em] text-white/55"
          >
            Le matériau qui réfléchit
          </span>

          <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)]">
            <Image
              src="/images/illustrations/building-cool-roof.svg"
              alt="Bâtiment moderne à toiture plate équipée du revêtement réfléchissant Cool Roofing"
              fill
              sizes="100vw"
              className="object-contain"
            />
            {/* Mobile non pinné : rayons rendus dans leur état final, statique */}
            <HeatRays progress={progress} staticState idKey="mobile" />
          </div>

          <ol className="mt-12 space-y-12">
            {CHAPTERS.map((chapter) => (
              <li key={chapter.index} className="border-l border-white/15 pl-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[13px] tracking-[0.18em] text-azur">
                    {chapter.index}
                  </span>
                  <span className="font-mono text-[13px] uppercase tracking-[0.18em] text-white/50">
                    {chapter.kicker}
                  </span>
                </div>
                <h2
                  className="mt-3 text-white"
                  style={{
                    fontSize: "clamp(1.75rem, 6vw, 2.5rem)",
                    fontWeight: 600,
                    letterSpacing: "-0.035em",
                    lineHeight: 1.02,
                  }}
                >
                  {chapter.title.join(" ")}
                </h2>
                <p
                  className="mt-4 text-white/65"
                  style={{ fontSize: "1rem", lineHeight: 1.65 }}
                >
                  {chapter.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}

type ChapterData = (typeof CHAPTERS)[number];

function Chapter({
  chapter,
  progress,
  window: w,
}: {
  chapter: ChapterData;
  progress: MotionValue<number>;
  window: [number, number, number, number];
}) {
  const opacity = useTransform(progress, w, [0, 1, 1, 0]);
  const y = useTransform(progress, w, [22, 0, 0, -16]);

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0">
      <span className="font-mono text-[13px] uppercase tracking-[0.22em] text-azur">
        {chapter.kicker}
      </span>
      <h2
        className="mt-4 text-white"
        style={{
          fontSize: "clamp(2.25rem, 3.4vw, 3.5rem)",
          fontWeight: 600,
          letterSpacing: "-0.04em",
          lineHeight: 0.99,
        }}
      >
        {chapter.title[0]}
        <br />
        {chapter.title[1]}
      </h2>
      <p
        className="mt-6 max-w-[420px] text-white/65"
        style={{ fontSize: "1.0625rem", lineHeight: 1.6 }}
      >
        {chapter.body}
      </p>
    </motion.div>
  );
}

type RayData = (typeof RAYS)[number];

// Trajet du rayon réfléchi : segment impact→ciel terminé par une pointe de
// flèche. Tout est décrit d'un seul `d` → tracé via pathLength, toujours
// synchronisé (la pointe se dessine juste après le faisceau).
function reflectedPath(
  impact: { x: number; y: number },
  end: { x: number; y: number },
) {
  const dx = end.x - impact.x;
  const dy = end.y - impact.y;
  const m = Math.hypot(dx, dy) || 1;
  const ux = dx / m;
  const uy = dy / m;
  const px = -uy;
  const py = ux;
  const L = 16;
  const W = 9;
  const a = `${(end.x - ux * L + px * W).toFixed(1)},${(end.y - uy * L + py * W).toFixed(1)}`;
  const b = `${(end.x - ux * L - px * W).toFixed(1)},${(end.y - uy * L - py * W).toFixed(1)}`;
  // Chemin continu (sans `moveto`) : le tracé via pathLength reste propre,
  // sans segment résiduel. La barbe a→end est retracée, sans effet visible.
  return `M${impact.x},${impact.y} L${end.x},${end.y} L${a} L${end.x},${end.y} L${b}`;
}

// Faisceau : un trait fin net + un halo plus large, tracé par `len` (pathLength).
function Beam({
  d,
  color,
  len,
  staticState,
}: {
  d: string;
  color: string;
  len: MotionValue<number>;
  staticState: boolean;
}) {
  if (staticState) {
    return (
      <g stroke={color} fill="none" strokeLinecap="butt" strokeLinejoin="round">
        <path d={d} strokeWidth={8} opacity={0.18} />
        <path d={d} strokeWidth={3} opacity={0.95} />
      </g>
    );
  }
  return (
    <g stroke={color} fill="none" strokeLinecap="butt" strokeLinejoin="round">
      <motion.path d={d} strokeWidth={8} opacity={0.18} style={{ pathLength: len }} />
      <motion.path d={d} strokeWidth={3} opacity={0.95} style={{ pathLength: len }} />
    </g>
  );
}

// Un rayon : faisceau entrant lime → flash d'impact → faisceau réfléchi azur.
function Ray({
  ray,
  progress,
  staticState,
}: {
  ray: RayData;
  progress: MotionValue<number>;
  staticState: boolean;
}) {
  const inLen = useTransform(progress, [ray.t0, ray.t1], [0, 1]);
  const outLen = useTransform(progress, [ray.t1, ray.t2], [0, 1]);
  const groupOp = useTransform(progress, [ray.t0, ray.t0 + 0.03], [0, 1]);
  const flashOp = useTransform(
    progress,
    [ray.t1 - 0.05, ray.t1, ray.t1 + 0.12, 1],
    [0, 1, 0.4, 0.4],
  );
  const outD = reflectedPath(ray.impact, ray.end);

  if (staticState) {
    return (
      <g>
        <Beam d={ray.in} color="var(--color-lime)" len={inLen} staticState />
        <Beam d={outD} color="var(--color-azur)" len={outLen} staticState />
        <circle cx={ray.impact.x} cy={ray.impact.y} r={10} fill="var(--color-lime)" opacity={0.35} />
        <circle cx={ray.impact.x} cy={ray.impact.y} r={4.5} fill="#ffffff" opacity={0.6} />
      </g>
    );
  }
  return (
    <motion.g style={{ opacity: groupOp }}>
      <Beam d={ray.in} color="var(--color-lime)" len={inLen} staticState={false} />
      <Beam d={outD} color="var(--color-azur)" len={outLen} staticState={false} />
      <motion.circle
        cx={ray.impact.x}
        cy={ray.impact.y}
        r={10}
        fill="var(--color-lime)"
        style={{ opacity: flashOp }}
      />
      <motion.circle
        cx={ray.impact.x}
        cy={ray.impact.y}
        r={4.5}
        fill="#ffffff"
        style={{ opacity: flashOp }}
      />
    </motion.g>
  );
}

// Soleil — halo lime en haut de scène, dont l'intensité monte avec le scroll.
function Sun({
  progress,
  staticState,
  glowId,
}: {
  progress: MotionValue<number>;
  staticState: boolean;
  glowId: string;
}) {
  const op = useTransform(progress, [0, 0.12, 1], [0, 0.5, 0.95]);
  const core = (
    <>
      <circle cx={210} cy={78} r={185} fill={`url(#${glowId})`} />
      <circle cx={210} cy={78} r={44} fill="var(--color-lime)" opacity={0.5} />
      <circle cx={210} cy={78} r={23} fill="#ffffff" opacity={0.92} />
    </>
  );
  if (staticState) return <g opacity={0.9}>{core}</g>;
  return <motion.g style={{ opacity: op }}>{core}</motion.g>;
}

// Calque SVG superposé au bâtiment : rayonnement solaire réfléchi par la
// toiture Cool Roofing. Piloté par le scroll (desktop) ou figé (mobile /
// mouvement réduit). Distinct de la flèche ScrollCue du bas de scène.
function HeatRays({
  progress,
  staticState,
  idKey,
}: {
  progress: MotionValue<number>;
  staticState: boolean;
  // Désambiguïse l'id du dégradé : desktop et mobile coexistent dans le DOM.
  idKey: string;
}) {
  const glowId = `azurSunGlow-${idKey}`;
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Sun progress={progress} staticState={staticState} glowId={glowId} />
      {RAYS.map((ray, i) => (
        <Ray key={i} ray={ray} progress={progress} staticState={staticState} />
      ))}
    </svg>
  );
}

// Indice de défilement : une flèche-rayon qui rebondit, représentant la
// lumière captée par la toiture. Présente pendant le récit, elle s'efface
// une fois la dernière scène atteinte.
function ScrollCue({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const opacity = useTransform(progress, [0, 0.06, 0.8, 0.94], [0, 1, 1, 0]);

  return (
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none absolute bottom-7 left-1/2 z-20 -translate-x-1/2"
    >
      <motion.svg
        width="26"
        height="36"
        viewBox="0 0 26 36"
        fill="none"
        animate={reduce ? undefined : { y: [0, 12, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 0 9px rgba(0,142,185,0.85))" }}
      >
        <path
          d="M13 2v28M4 21l9 9 9-9"
          stroke="var(--color-azur)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  );
}

function ScrubBar({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[3px] bg-ink/8">
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="h-full origin-left bg-azur"
      />
    </div>
  );
}
