"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  /** Reduce vertical offset (default 24px). */
  y?: number;
  as?:
    | "div"
    | "section"
    | "header"
    | "p"
    | "h1"
    | "h2"
    | "h3"
    | "li"
    | "ul"
    | "ol"
    | "span";
};

/**
 * Native IntersectionObserver-based reveal.
 *
 * SSR-safe: the element ships visible (no opacity:0 in the initial markup, so
 * users with JS disabled / crawlers see the content). On mount we check
 * whether the element is *already* in the viewport. If yes, we skip the
 * animation entirely. Otherwise we hide it, then animate in on intersection.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // Already in viewport on mount? Don't hide.
    const rect = el.getBoundingClientRect();
    const inView =
      rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
    if (inView) return;

    el.style.opacity = "0";
    el.style.transform = `translateY(${y}px)`;
    el.style.transition =
      "opacity 700ms cubic-bezier(0.16,1,0.3,1), transform 700ms cubic-bezier(0.16,1,0.3,1)";
    el.style.transitionDelay = `${delay}ms`;
    el.style.willChange = "opacity, transform";

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            window.setTimeout(() => {
              el.style.willChange = "auto";
            }, 800 + delay);
            io.disconnect();
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, y]);

  const Tag = as as keyof React.JSX.IntrinsicElements;
  return (
    // @ts-expect-error -- dynamic intrinsic tag, ref is correctly typed at runtime
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
