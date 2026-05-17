import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CountUp } from "@/components/motion/CountUp";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

type Stat = {
  value: string;
  label: string;
  context: string;
};

const STATS: Stat[] = [
  {
    value: "−4 °C",
    label: "vs classes témoins",
    context: "École Jacqueline de Romilly, Cannes — Azur Reflect sur vitrages",
  },
  {
    value: "−22 %",
    label: "de consommation clim.",
    context: "Cool Roofing sur 2 700 m² industriels — Promocash Grasse",
  },
  {
    value: "+22 %",
    label: "rendement photovoltaïque",
    context: "Panneaux bifaciaux sur toit Cool Roofing",
  },
];

export function ThermalStats() {
  return (
    <section
      aria-labelledby="thermal-stats-h"
      className="bg-graphite py-[clamp(100px,15vw,160px)] text-white"
    >
      <Container>
        <div className="max-w-[640px]">
          <Eyebrow tone="white">Mesures terrain</Eyebrow>
          <ScrollReveal delay={100}>
            <h2
              id="thermal-stats-h"
              className="mt-6 text-white"
              style={{
                fontSize: "clamp(2.25rem, 4.2vw, 4rem)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.02,
              }}
            >
              Ce que la chaleur perd, vos bâtiments le gagnent.
            </h2>
          </ScrollReveal>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-px bg-white/8 md:grid-cols-3 [&>li]:bg-graphite">
          {STATS.map((s, i) => (
            <ScrollReveal as="li" key={s.label} delay={120 + i * 100}>
              <div className="flex h-full flex-col p-8 md:p-10">
                <div
                  className="text-azur"
                  style={{
                    fontSize: "clamp(3.5rem, 6.5vw, 6.5rem)",
                    fontWeight: 200,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  <CountUp value={s.value} />
                </div>
                <div
                  className="mt-4 text-white"
                  style={{ fontSize: "1.0625rem", fontWeight: 500 }}
                >
                  {s.label}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  {s.context}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
