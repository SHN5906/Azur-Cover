"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  beforeSrc: string;
  beforeAlt: string;
  afterSrc: string;
  afterAlt: string;
  /** Légende top-left "Avant" / "Après" (FR par défaut) */
  beforeLabel?: string;
  afterLabel?: string;
  /** Caption sous le slider (ex: "Toit traité Cool Roofing — Promocash Grasse") */
  caption?: string;
  /** Overlay thermique (rouge → bleu) appliqué à l'image after */
  thermalOverlay?: boolean;
  className?: string;
};

/**
 * Slider avant/après draggable. La poignée peut être bougée avec :
 * - souris (mousedown + mousemove + mouseup)
 * - touch (touchstart + touchmove)
 * - clavier (focus + ArrowLeft/Right)
 * - clic n'importe où sur l'image (saute la poignée à la position du clic)
 */
export function BeforeAfterSlider({
  beforeSrc,
  beforeAlt,
  afterSrc,
  afterAlt,
  beforeLabel = "Avant",
  afterLabel = "Après",
  caption,
  thermalOverlay = false,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50); // % visible of the "after" side from the left

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  const dragging = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      updateFromClientX(e.clientX);
    };
    const onTouch = (e: TouchEvent) => {
      if (!dragging.current) return;
      const t = e.touches[0];
      if (t) updateFromClientX(t.clientX);
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [updateFromClientX]);

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    dragging.current = true;
    document.body.style.userSelect = "none";
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    updateFromClientX(clientX);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPosition((p) => Math.max(0, p - 4));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPosition((p) => Math.min(100, p + 4));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPosition(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPosition(100);
    }
  };

  return (
    <figure className={className}>
      <div
        ref={containerRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-graphite/5 select-none"
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
      >
        {/* Before image (full layer) */}
        <Image
          src={beforeSrc}
          alt={beforeAlt}
          fill
          sizes="(min-width: 1024px) 80vw, 100vw"
          className="object-cover photo-treatment"
          priority
        />

        {/* After image (clipped by width = position%) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={afterSrc}
            alt={afterAlt}
            fill
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="object-cover photo-treatment"
            priority
          />
          {thermalOverlay && (
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-color opacity-70"
              style={{
                background:
                  "linear-gradient(180deg, #2222CC 0%, #1FAACC 40%, #6FDD8C 70%, #FFD86A 100%)",
              }}
            />
          )}
        </div>

        {/* Labels */}
        <span className="pointer-events-none absolute left-4 top-4 rounded-md bg-black/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur-sm">
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute right-4 top-4 rounded-md bg-azur/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur-sm">
          {afterLabel}
          {thermalOverlay && " · thermique"}
        </span>

        {/* Vertical divider line + handle */}
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.5)]"
          style={{ left: `${position}%` }}
        />
        <button
          type="button"
          aria-label="Glisser pour comparer avant/après"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          role="slider"
          onKeyDown={onKey}
          onMouseDown={onPointerDown}
          onTouchStart={onPointerDown}
          className="absolute top-1/2 z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-2 border-white bg-white text-ink shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-azur/40"
          style={{ left: `${position}%` }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M8 4L4 8l4 4" />
            <path d="M16 4l4 4-4 4" />
            <path d="M8 16l-4 4 4 4" opacity="0" />
            <path d="M4 8h16" />
          </svg>
        </button>
      </div>

      {caption && (
        <figcaption className="mt-4 text-sm leading-relaxed text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
