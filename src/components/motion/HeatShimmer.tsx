"use client";

import { useId } from "react";

/**
 * Heat shimmer SVG filter — applique une distorsion ondulante subtile
 * (façon air chaud au-dessus du bitume) à n'importe quel enfant.
 *
 * Usage :
 *   <HeatShimmer intensity="medium">
 *     <Image src="..." />
 *   </HeatShimmer>
 *
 * Le filter est défini inline + uniqueId pour permettre plusieurs
 * instances sans collision. feTurbulence anime via SMIL <animate>
 * (supporté partout sauf vieux Edge — fallback gracieux : pas d'anim).
 */
type Props = {
  children: React.ReactNode;
  /** Strength of the displacement. Subtle by default. */
  intensity?: "subtle" | "medium" | "strong";
  /** Disable on prefers-reduced-motion (default true). */
  respectReducedMotion?: boolean;
  className?: string;
};

export function HeatShimmer({
  children,
  intensity = "subtle",
  respectReducedMotion = true,
  className,
}: Props) {
  const id = useId().replace(/:/g, "");
  const scale = intensity === "strong" ? 6 : intensity === "medium" ? 4 : 2.5;

  return (
    <span className={`heat-shimmer-root ${className ?? ""}`} style={{ display: "block" }}>
      <svg
        aria-hidden
        focusable={false}
        width="0"
        height="0"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          <filter id={`heat-${id}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.04"
              numOctaves="2"
              seed="3"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="14s"
                values="0.012 0.04; 0.018 0.05; 0.012 0.04"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <span
        className="heat-shimmer-target"
        style={{ filter: `url(#heat-${id})`, display: "block" }}
      >
        {children}
      </span>

      {respectReducedMotion && (
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            .heat-shimmer-target { filter: none !important; }
          }
        `}</style>
      )}
    </span>
  );
}
