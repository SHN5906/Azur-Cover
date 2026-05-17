"use client";

import { useEffect, useRef } from "react";

/**
 * Mince trait cyan en haut qui se remplit à mesure que l'utilisateur
 * scroll. Directement piloté via ref (pas de React state) pour ne
 * jamais re-render le DOM React au scroll — purement transform GPU.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = (doc.scrollHeight - window.innerHeight) || 1;
      const pct = Math.min(1, Math.max(0, window.scrollY / max));
      el.style.transform = `scaleX(${pct})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent"
    >
      <span
        ref={ref}
        className="block h-full origin-left bg-azur shadow-[0_0_12px_rgba(0,166,166,0.5)]"
        style={{ transform: "scaleX(0)", willChange: "transform" }}
      />
    </div>
  );
}
