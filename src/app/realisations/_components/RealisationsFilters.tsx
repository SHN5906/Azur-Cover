"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sectorEnum, solutionEnum } from "@/db/schema";
import type { SectorValue, SolutionValue } from "@/db/schema";
import {
  SECTOR_LABELS,
  SOLUTION_TO_SLUG,
} from "@/lib/realisations-filters";
import { cn } from "@/lib/utils";

type Props = {
  activeSector?: SectorValue;
  activeSolution?: SolutionValue;
  // Facettes réellement présentes en base — évite d'afficher un filtre vide.
  availableSectors?: readonly SectorValue[];
  availableSolutions?: readonly SolutionValue[];
};

// Construit l'URL cible en remplaçant un seul paramètre — les filtres
// secteur/solution se combinent (ex: ?secteur=industrie&solution=cool-roofing).
function buildHref(
  current: URLSearchParams,
  key: "secteur" | "solution",
  value: string | null,
): string {
  const next = new URLSearchParams(current.toString());
  if (value === null) next.delete(key);
  else next.set(key, value);
  const qs = next.toString();
  return qs ? `/realisations?${qs}` : "/realisations";
}

export function RealisationsFilters({
  activeSector,
  activeSolution,
  availableSectors = sectorEnum,
  availableSolutions = solutionEnum,
}: Props) {
  const searchParams = useSearchParams();
  const hasFilter = Boolean(activeSector || activeSolution);

  return (
    <div className="mt-2 border-y border-line/40 py-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto,1fr,auto] md:items-start md:gap-10">
        <FilterGroup label="Secteur">
          <FilterChip
            href={buildHref(searchParams, "secteur", null)}
            active={!activeSector}
          >
            Tous
          </FilterChip>
          {availableSectors.map((s) => (
            <FilterChip
              key={s}
              href={buildHref(searchParams, "secteur", s)}
              active={activeSector === s}
            >
              {SECTOR_LABELS[s]}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Solution">
          <FilterChip
            href={buildHref(searchParams, "solution", null)}
            active={!activeSolution}
          >
            Toutes
          </FilterChip>
          {availableSolutions.map((s) => (
            <FilterChip
              key={s}
              href={buildHref(searchParams, "solution", SOLUTION_TO_SLUG[s])}
              active={activeSolution === s}
            >
              {s}
            </FilterChip>
          ))}
        </FilterGroup>

        {hasFilter && (
          <Link
            href="/realisations"
            className="inline-flex min-h-[44px] items-center self-start text-sm text-muted underline-grow hover:text-ink md:self-end"
          >
            Réinitialiser
          </Link>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={`Filtrer par ${label.toLowerCase()}`}
      className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4"
    >
      <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-muted">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-sm transition-colors",
        active
          ? "border-ink bg-ink text-white"
          : "border-line/70 text-muted hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
