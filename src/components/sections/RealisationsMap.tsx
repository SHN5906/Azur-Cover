"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RealisationRow } from "@/lib/realisations-repo";

/**
 * Carte minimaliste de la France (Sud-Est zoom) avec un pin par
 * chantier. Hover sur un pin = tooltip avec titre, click = lien vers
 * la fiche. SVG inline, pas de dépendance externe.
 *
 * Coordonnées approximatives (longitude/latitude) → pixels dans le
 * viewBox 600x600. Le viewBox couvre le Sud-Est de la France :
 *   longitude 1.0 (gauche, Marseille-Aix) → 8.0 (droite, Italie)
 *   latitude  44.5 (haut, Provence-nord)  → 42.5 (bas, Méditerranée)
 *
 * Pour chaque chantier, on map city → (lon, lat) puis vers le
 * viewBox. Les villes inconnues sont ignorées (skip render).
 */
const CITIES: Record<string, { lon: number; lat: number }> = {
  Grasse: { lon: 6.9244, lat: 43.6589 },
  Cannes: { lon: 7.0128, lat: 43.5528 },
  Antibes: { lon: 7.1239, lat: 43.5808 },
  Nice: { lon: 7.262, lat: 43.7102 },
  Vallauris: { lon: 7.05, lat: 43.58 },
  "Saint-Laurent-du-Var": { lon: 7.1908, lat: 43.6691 },
  Fayence: { lon: 6.6919, lat: 43.625 },
  "La Fare-les-Oliviers": { lon: 5.1858, lat: 43.5478 },
  Vitrolles: { lon: 5.2486, lat: 43.4609 },
  Gardanne: { lon: 5.4711, lat: 43.4528 },
};

const LON_MIN = 4.5;
const LON_MAX = 8.0;
const LAT_MIN = 42.8;
const LAT_MAX = 44.0;

function project(lon: number, lat: number) {
  // map [LON_MIN, LON_MAX] → [0, 600], invert Y for SVG
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 600;
  const y = (1 - (lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 400;
  return { x, y };
}

type Props = {
  realisations: RealisationRow[];
};

export function RealisationsMap({ realisations }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const pins = useMemo(
    () =>
      realisations
        .map((r) => {
          const coords = CITIES[r.city];
          if (!coords) return null;
          const { x, y } = project(coords.lon, coords.lat);
          return { r, x, y };
        })
        .filter((p): p is { r: RealisationRow; x: number; y: number } => p !== null),
    [realisations],
  );

  return (
    <section aria-labelledby="map-h" className="bg-graphite py-[clamp(80px,12vw,140px)] text-white">
      <div className="mx-auto w-full max-w-[1200px] px-6 sm:px-10 lg:px-20">
        <div className="max-w-[640px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
            Nos chantiers, géolocalisés
          </p>
          <h2
            id="map-h"
            className="mt-4 text-white"
            style={{
              fontSize: "clamp(1.75rem, 3.2vw, 2.75rem)",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
            }}
          >
            Côte d&apos;Azur, arrière-pays, Provence.
          </h2>
          <p className="mt-4 text-sm text-white/60">
            Survolez un point pour découvrir le chantier.
          </p>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-md border border-white/10 bg-graphite/80">
          <svg
            viewBox="0 0 600 400"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Carte des chantiers Azur Cover"
            className="block h-auto w-full"
          >
            {/* Contour lines (topographic feel) */}
            <defs>
              <radialGradient id="map-bg-glow" cx="50%" cy="60%" r="55%">
                <stop offset="0%" stopColor="rgba(0,166,166,0.10)" />
                <stop offset="80%" stopColor="rgba(0,166,166,0)" />
              </radialGradient>
            </defs>
            <rect width="600" height="400" fill="url(#map-bg-glow)" />

            {/* Subtle grid */}
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={`vh-${i}`}
                x1={i * 75}
                y1={0}
                x2={i * 75}
                y2={400}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line
                key={`hh-${i}`}
                x1={0}
                y1={i * 67}
                x2={600}
                y2={i * 67}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.5"
              />
            ))}

            {/* Approximate coastline (very rough hand-drawn path of the Med coast in our window) */}
            <path
              d="M 0 320 Q 80 310, 160 305 T 320 295 Q 400 290, 480 285 T 600 275"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <text
              x="540"
              y="370"
              fill="rgba(255,255,255,0.3)"
              fontSize="8"
              fontFamily="monospace"
              letterSpacing="2"
            >
              MER MÉDITERRANÉE
            </text>

            {/* Pins */}
            {pins.map(({ r, x, y }) => {
              const isActive = active === r.slug;
              return (
                <g
                  key={r.slug}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setActive(r.slug)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(r.slug)}
                  onBlur={() => setActive(null)}
                >
                  <a href={`/realisations/${r.slug}`}>
                    {/* Halo pulse */}
                    <circle
                      r="14"
                      fill="rgba(0,166,166,0.15)"
                      className={isActive ? "map-pin-halo-active" : "map-pin-halo"}
                    />
                    {/* Outer ring */}
                    <circle
                      r="6"
                      fill="none"
                      stroke="rgba(0,166,166,0.6)"
                      strokeWidth="1"
                    />
                    {/* Inner dot */}
                    <circle r="3" fill="#00a6a6" />
                  </a>
                </g>
              );
            })}

            {/* Active label */}
            {active && (() => {
              const pin = pins.find((p) => p.r.slug === active);
              if (!pin) return null;
              const isRight = pin.x > 380;
              const labelX = isRight ? pin.x - 12 : pin.x + 12;
              const anchor = isRight ? "end" : "start";
              return (
                <g transform={`translate(0, 0)`}>
                  <text
                    x={labelX}
                    y={pin.y - 8}
                    fill="#fff"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor={anchor}
                  >
                    {pin.r.title}
                  </text>
                  <text
                    x={labelX}
                    y={pin.y + 6}
                    fill="rgba(255,255,255,0.55)"
                    fontSize="9"
                    fontFamily="monospace"
                    letterSpacing="1.5"
                    textAnchor={anchor}
                  >
                    {pin.r.city.toUpperCase()} · {pin.r.solution.toUpperCase()}
                  </text>
                </g>
              );
            })()}
          </svg>

          <style>{`
            .map-pin-halo {
              animation: map-pin-pulse 2.6s cubic-bezier(0.4,0,0.6,1) infinite;
              transform-origin: center;
              transform-box: fill-box;
            }
            .map-pin-halo-active {
              transform-origin: center;
              transform-box: fill-box;
              transform: scale(1.6);
              fill: rgba(0,166,166,0.28);
              transition: transform 300ms cubic-bezier(0.16,1,0.3,1), fill 300ms;
            }
            @keyframes map-pin-pulse {
              0%, 100% { opacity: 0.4; transform: scale(0.9); }
              50%      { opacity: 1; transform: scale(1.4); }
            }
            @media (prefers-reduced-motion: reduce) {
              .map-pin-halo { animation: none; }
            }
          `}</style>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/55">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-azur shadow-[0_0_8px_rgba(0,166,166,0.6)]" />
            {pins.length} chantier{pins.length > 1 ? "s" : ""} sur la carte
          </span>
          <Link href="/realisations" className="font-mono uppercase tracking-[0.18em] text-white/70 underline-grow">
            Voir toutes les références
          </Link>
        </div>
      </div>
    </section>
  );
}
