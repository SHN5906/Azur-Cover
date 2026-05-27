import {
  sectorEnum,
  solutionEnum,
  type SectorValue,
  type SolutionValue,
} from "@/db/schema";

// La DB stocke les solutions en libellé humain ("Cool Roofing"). Pour les URLs
// on utilise des slugs sans accent ni espace. Cette correspondance vit ici,
// hors du schéma, parce qu'elle ne concerne que la présentation et le routing.
export const SOLUTION_TO_SLUG: Record<SolutionValue, string> = {
  Étanchéité: "etancheite",
  "Cool Roofing": "cool-roofing",
  "Azur Reflect": "azur-reflect",
  "Multi-solutions": "multi-solutions",
};

export const SLUG_TO_SOLUTION = Object.fromEntries(
  Object.entries(SOLUTION_TO_SLUG).map(([k, v]) => [v, k as SolutionValue]),
) as Record<string, SolutionValue>;

export const SECTOR_LABELS: Record<SectorValue, string> = {
  industrie: "Industrie",
  tertiaire: "Tertiaire",
  collectivites: "Collectivités",
};

export function parseSectorParam(v: string | undefined): SectorValue | undefined {
  return v && (sectorEnum as readonly string[]).includes(v)
    ? (v as SectorValue)
    : undefined;
}

export function parseSolutionParam(
  v: string | undefined,
): SolutionValue | undefined {
  if (!v) return undefined;
  const matched = SLUG_TO_SOLUTION[v];
  if (matched) return matched;
  // Tolère aussi le libellé exact (déjà encodé)
  return (solutionEnum as readonly string[]).includes(v)
    ? (v as SolutionValue)
    : undefined;
}
