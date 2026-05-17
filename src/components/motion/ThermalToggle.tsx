"use client";

import { useState, useEffect } from "react";

/**
 * Toggle "Mode thermique". Quand activé, applique un filter SVG sur
 * toutes les images du <main> (sauf opt-out via data-no-thermal) qui
 * les transforme en faux feed caméra thermique (gradient bleu → vert →
 * jaune → rouge selon la luminosité du pixel d'origine).
 *
 * Le filter est défini une fois au niveau du body et activé via une
 * classe sur <html>. Aucun re-render React des composants images.
 */
export function ThermalToggle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (active) html.classList.add("thermal-mode");
    else html.classList.remove("thermal-mode");
    return () => html.classList.remove("thermal-mode");
  }, [active]);

  return (
    <>
      {/* Filter defined once at root scope */}
      <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="thermal-filter">
            {/* Step 1 : grayscale via luminance */}
            <feColorMatrix
              type="matrix"
              values="0.3 0.59 0.11 0 0
                      0.3 0.59 0.11 0 0
                      0.3 0.59 0.11 0 0
                      0   0    0    1 0"
            />
            {/* Step 2 : remap luminance → thermal palette via component transfer */}
            <feComponentTransfer>
              <feFuncR
                type="table"
                tableValues="0.08 0.12 0.18 0.50 0.85 1.00 1.00 1.00"
              />
              <feFuncG
                type="table"
                tableValues="0.00 0.06 0.20 0.55 0.70 0.45 0.20 0.10"
              />
              <feFuncB
                type="table"
                tableValues="0.45 0.65 0.85 0.55 0.20 0.05 0.00 0.00"
              />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <button
        type="button"
        onClick={() => setActive((v) => !v)}
        aria-pressed={active}
        title={active ? "Désactiver le mode thermique" : "Activer le mode thermique"}
        className={`fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.18em] transition-all duration-300 ${
          active
            ? "border-azur bg-azur text-white shadow-[0_8px_24px_-4px_rgba(0,166,166,0.5)]"
            : "border-line/60 bg-bg text-ink hover:border-ink hover:shadow-md"
        }`}
      >
        <span aria-hidden className="text-base leading-none">
          {active ? "🌡️" : "🌡"}
        </span>
        {active ? "Vue thermique on" : "Vue thermique"}
      </button>

      <style>{`
        html.thermal-mode main img,
        html.thermal-mode main video {
          filter: url(#thermal-filter);
          transition: filter 600ms cubic-bezier(0.16,1,0.3,1);
        }
        html.thermal-mode main img[data-no-thermal="true"],
        html.thermal-mode main video[data-no-thermal="true"] {
          filter: none;
        }
        @media (prefers-reduced-motion: reduce) {
          html.thermal-mode main img,
          html.thermal-mode main video {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
