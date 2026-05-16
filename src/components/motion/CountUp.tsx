"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** Final value as displayed (e.g. "−12°C", "99%", "+45"). The number inside
   *  will be animated from 0 (or the negative-equivalent) to its final value
   *  while the surrounding characters (sign, °C, %) remain static. */
  value: string;
  /** Animation duration in milliseconds. */
  duration?: number;
  className?: string;
  /** Optional element to render as. Defaults to span. */
  as?: "span" | "div";
};

type Parsed = { prefix: string; num: number; isNeg: boolean; suffix: string };

function parse(value: string): Parsed | null {
  const m = value.match(/^([^\d-−]*)(-?−?\s*\d+(?:[.,]\d+)?)(.*)$/);
  if (!m) return null;
  const numStr = m[2].replace(/[\s−]/g, "").replace(",", ".");
  return {
    prefix: m[1],
    num: parseFloat(numStr),
    isNeg: /[-−]/.test(m[2]),
    suffix: m[3],
  };
}

function format(p: Parsed, current: number): string {
  const rounded = Number.isInteger(p.num) ? Math.round(current) : current.toFixed(1);
  return `${p.prefix}${p.isNeg ? "−" : ""}${rounded}${p.suffix}`;
}

/**
 * Scroll-triggered count-up. Parses the first number found in `value` and
 * animates it from 0 to its target. Handles negative values (e.g. "−12°C")
 * and percentages ("40%"). Respects prefers-reduced-motion.
 *
 * Animation drives `textContent` via a ref — no React state, no cascading
 * renders. Initial server render shows the final value (graceful no-JS).
 */
export function CountUp({ value, duration = 1200, className, as = "span" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parsed = parse(value);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !parsed) {
      el.textContent = value;
      return;
    }

    // Start at zero via DOM mutation (avoids React re-render).
    el.textContent = format(parsed, 0);

    let hasRun = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !hasRun) {
          hasRun = true;
          observer.disconnect();

          const start = performance.now();
          const absTarget = Math.abs(parsed.num);
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            el.textContent = format(parsed, absTarget * eased);
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  const Tag = as as keyof React.JSX.IntrinsicElements;
  return (
    // @ts-expect-error dynamic intrinsic tag
    <Tag ref={ref} className={cn(className)} suppressHydrationWarning>
      {value}
    </Tag>
  );
}
