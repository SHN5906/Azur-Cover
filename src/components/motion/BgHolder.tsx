"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed background holder with 4 stacked gradient layers.
 * IntersectionObserver swaps which layer is .active based on the section
 * currently in view (via [data-bg="1|2|3|4"]).
 *
 * Discipline: variations are intentionally subtle — the goal is a "felt"
 * transition, not a coloured backdrop.
 */
export function BgHolder() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-layer]"));

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-bg]")
    );
    if (!sections.length) return;

    const setActive = (key: string) => {
      layers.forEach((el) => {
        const isActive = el.dataset.layer === key;
        el.style.opacity = isActive ? "1" : "0";
      });
    };

    // Initial state: bg-1.
    setActive("1");

    let active: string = "1";
    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry that is "most" visible.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const next = (visible.target as HTMLElement).dataset.bg;
        if (next && next !== active) {
          active = next;
          setActive(next);
        }
      },
      { threshold: [0, 0.3, 0.6] }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[-1]"
    >
      <div
        data-layer="1"
        className="absolute inset-0 transition-opacity duration-[800ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
        style={{ background: "#fbfbfd", opacity: 1 }}
      />
      <div
        data-layer="2"
        className="absolute inset-0 transition-opacity duration-[800ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
        style={{
          background:
            "radial-gradient(ellipse at top, #2a2a2d 0%, #1d1d1f 60%)",
          opacity: 0,
        }}
      />
      <div
        data-layer="3"
        className="absolute inset-0 transition-opacity duration-[800ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
        style={{
          background: "linear-gradient(180deg, #fbfbfd 0%, #f4f4f6 100%)",
          opacity: 0,
        }}
      />
      <div
        data-layer="4"
        className="absolute inset-0 transition-opacity duration-[800ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
        style={{ background: "#fbfbfd", opacity: 0 }}
      />
    </div>
  );
}
