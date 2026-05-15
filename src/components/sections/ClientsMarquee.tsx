"use client";

import Image from "next/image";
import { useRef } from "react";
import { clients } from "@/content/clients";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function ClientsMarquee() {
  // Auto-scroll loop on idle, but the user can also drag to scroll horizontally
  // (much like the Apple "compare" rails). On hover we pause the marquee so the
  // user can read the names. On drag we hard-pause and let them scrub.
  const railRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = railRef.current;
    if (!el) return;
    dragState.current = {
      isDown: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
    };
    el.setPointerCapture(e.pointerId);
    el.style.cursor = "grabbing";
    el.style.scrollSnapType = "none";
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.isDown) return;
    const el = railRef.current;
    if (!el) return;
    const dx = e.clientX - dragState.current.startX;
    el.scrollLeft = dragState.current.scrollLeft - dx;
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = railRef.current;
    if (!el) return;
    dragState.current.isDown = false;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    el.style.cursor = "";
  };

  const loop = [...clients, ...clients];

  return (
    <section
      id="trusted"
      aria-labelledby="trusted-h"
      className="border-y border-line/40 py-16 md:py-20"
    >
      <Eyebrow id="trusted-h" className="text-center">
        Ils nous font confiance
      </Eyebrow>

      {/* Desktop: drag-to-scroll rail with auto-marquee on idle */}
      <div className="mt-10 hidden lg:block">
        <div
          ref={railRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          role="region"
          aria-label="Liste des clients (faites glisser pour faire défiler)"
          tabIndex={0}
          className="marquee-rail mask-fade-x cursor-grab overflow-x-auto select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-azur focus-visible:ring-offset-4"
          style={{ scrollbarWidth: "none" }}
        >
          <ul className="marquee-track flex w-max items-center gap-16">
            {loop.map((c, i) => (
              <li
                key={`${c.name}-${i}`}
                className="relative flex h-12 w-[180px] shrink-0 items-center justify-center"
                aria-hidden={i >= clients.length}
              >
                <Image
                  src={c.src}
                  alt={c.alt}
                  fill
                  sizes="180px"
                  draggable={false}
                  style={{ pointerEvents: "none" }}
                  className="object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile: static grid */}
      <ul className="mx-auto mt-10 grid max-w-md grid-cols-3 items-center justify-items-center gap-x-6 gap-y-10 px-6 lg:hidden">
        {clients.map((c) => (
          <li key={c.name} className="relative flex h-9 w-full items-center justify-center">
            <Image
              src={c.src}
              alt={c.alt}
              fill
              sizes="120px"
              className="object-contain opacity-70 grayscale"
            />
          </li>
        ))}
      </ul>

      <style>{`
        /* Hide native scrollbar but keep scroll behaviour */
        .marquee-rail::-webkit-scrollbar { display: none; }

        /* Auto-scroll the inner track ; CSS animation drives the visual loop. */
        .marquee-track {
          animation: marquee-track 60s linear infinite;
          will-change: transform;
        }
        .marquee-rail:hover .marquee-track,
        .marquee-rail:focus-within .marquee-track {
          animation-play-state: paused;
        }
        @keyframes marquee-track {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
