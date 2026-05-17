"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Surface vitrée Liquid Glass — un panneau translucide qui suit la
 * souris et applique un backdrop-blur + une déformation feDisplacement
 * subtile pour donner l'effet "vernis Azur Reflect appliqué sur le
 * contenu derrière".
 *
 * Sur mobile (pas de souris), le panneau reste statique au centre.
 */
type Props = {
  /** Content rendered UNDER the glass (the background that will be refracted). */
  children: ReactNode;
  className?: string;
};

export function LiquidGlass({ children, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const [reveal, setReveal] = useState(false);

  // Reveal on first viewport intersection (skip initial flash)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setReveal(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Mouse follow (desktop only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = containerRef.current;
    const glass = glassRef.current;
    if (!container || !glass) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch

    let frame = 0;
    const onMove = (e: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
        // Center the glass on the cursor with slight lag (CSS transition)
        glass.style.left = `${x}px`;
        glass.style.top = `${y}px`;
      });
    };
    container.addEventListener("mousemove", onMove);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      container.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className ?? ""}`}>
      {/* SVG glass distortion filter */}
      <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="liquid-glass-distort" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="20"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Background content (gets refracted) — fill the container */}
      <div className="absolute inset-0">{children}</div>

      {/* Glass disc that follows the cursor */}
      <div
        ref={glassRef}
        aria-hidden
        className={`liquid-glass-disc pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ${
          reveal ? "opacity-100" : "opacity-0"
        }`}
        style={{
          left: "50%",
          top: "50%",
          width: "clamp(200px, 35vw, 380px)",
          height: "clamp(200px, 35vw, 380px)",
          borderRadius: "9999px",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 30%, rgba(0,166,166,0.08) 60%, rgba(0,166,166,0.02) 100%)",
          backdropFilter: "blur(8px) saturate(1.4)",
          WebkitBackdropFilter: "blur(8px) saturate(1.4)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow:
            "inset 0 2px 14px rgba(255,255,255,0.4), inset 0 -8px 30px rgba(0,166,166,0.2), 0 30px 60px -10px rgba(0,0,0,0.3)",
          transition:
            "left 700ms cubic-bezier(0.22,1,0.36,1), top 700ms cubic-bezier(0.22,1,0.36,1), opacity 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Highlight band (the "vernis" sweep) */}
        <span
          aria-hidden
          className="liquid-glass-shine absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
            maskImage: "radial-gradient(circle at center, black 0%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at center, black 0%, transparent 70%)",
          }}
        />
      </div>

      <style>{`
        .liquid-glass-shine {
          animation: glass-shine 6s cubic-bezier(0.4,0,0.6,1) infinite;
        }
        @keyframes glass-shine {
          0%, 100% { opacity: 0.3; transform: rotate(0deg); }
          50%      { opacity: 0.7; transform: rotate(180deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .liquid-glass-shine { animation: none; }
          .liquid-glass-disc { transition: opacity 700ms !important; }
        }
      `}</style>
    </div>
  );
}
