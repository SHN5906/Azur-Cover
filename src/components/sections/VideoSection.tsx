"use client";

import { useRef, useState } from "react";
import { Play, Volume2, VolumeX, Maximize } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";

export function VideoSection() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);

  const togglePlay = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
      setStarted(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };
  const toggleMute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };
  const fullscreen = () => {
    const v = ref.current;
    if (!v) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void v.requestFullscreen();
  };

  return (
    <section
      id="video"
      aria-labelledby="video-h"
      className="bg-bg py-[clamp(120px,18vw,200px)]"
    >
      <Container>
        <div className="text-center">
          <Eyebrow>Le projet en 30 secondes</Eyebrow>
          <h2
            id="video-h"
            className="mt-6 text-ink"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 5rem)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Azur Cover en 1 vidéo.
          </h2>
        </div>

        <div className="relative mx-auto mt-16 max-w-[1100px]">
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-line/60 bg-graphite shadow-2xl">
            <video
              ref={ref}
              poster="/video/azur-cover-poster.jpg"
              preload="none"
              playsInline
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="h-full w-full object-cover"
            >
              <source
                src="/video/azur-cover-presentation-720p.mp4"
                type="video/mp4"
                media="(max-width: 768px)"
              />
              <source src="/video/azur-cover-presentation.mp4" type="video/mp4" />
            </video>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Mettre en pause" : "Lire la vidéo"}
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                playing ? "pointer-events-none opacity-0" : "opacity-100"
              )}
            >
              <span
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-ink shadow-2xl transition-transform duration-300 hover:scale-105 md:h-24 md:w-24"
                style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              >
                <Play className="h-7 w-7 translate-x-0.5 fill-current md:h-9 md:w-9" aria-hidden />
              </span>
            </button>

            <div
              className={cn(
                "absolute inset-x-3 bottom-3 flex items-center justify-between transition-opacity duration-300",
                started ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            >
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Activer le son" : "Couper le son"}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-graphite/70 text-white backdrop-blur transition hover:bg-graphite/90"
              >
                {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
              </button>
              <button
                type="button"
                onClick={fullscreen}
                aria-label="Plein écran"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-graphite/70 text-white backdrop-blur transition hover:bg-graphite/90"
              >
                <Maximize className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
