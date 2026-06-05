import "server-only";
import { and, eq, asc, desc, type SQL } from "drizzle-orm";
import { unstable_cache, revalidateTag } from "next/cache";
import { getDb } from "@/db";
import {
  realisations,
  type SectorValue,
  type SolutionValue,
} from "@/db/schema";

export type RealisationRow = typeof realisations.$inferSelect;
export type RealisationInsert = typeof realisations.$inferInsert;

export type RealisationFilters = {
  sector?: SectorValue;
  solution?: SolutionValue;
};

/** Hard cap : empêche un data-flood d'exploser la mémoire (P3-05). */
const MAX_REALISATIONS = 200;

/**
 * Cache tag shared by all read queries. Admin mutations call
 * `invalidateRealisations()` to bust the cache on write.
 *
 * Why unstable_cache? The root layout forces every page to SSR (for the
 * CSP nonce), so the Full Route Cache is disabled. unstable_cache keeps
 * DB reads cached across SSR requests — pages re-render (fresh nonce)
 * but reuse the data until a mutation invalidates it.
 */
const CACHE_TAG = "realisations";

/** Bust all cached reads after a mutation. */
export function invalidateRealisations() {
  revalidateTag(CACHE_TAG, "max");
}

// ── Cached read queries ─────────────────────────────────────────────

export const listRealisations = unstable_cache(
  async (filters: RealisationFilters = {}): Promise<RealisationRow[]> => {
    const conditions: SQL[] = [];
    if (filters.sector)
      conditions.push(eq(realisations.sector, filters.sector));
    if (filters.solution)
      conditions.push(eq(realisations.solution, filters.solution));

    const query = getDb().select().from(realisations);
    const filtered =
      conditions.length > 0 ? query.where(and(...conditions)) : query;

    return filtered
      .orderBy(asc(realisations.sortIndex), desc(realisations.createdAt))
      .limit(MAX_REALISATIONS);
  },
  [CACHE_TAG, "list"],
  { tags: [CACHE_TAG], revalidate: 3600 },
);

export const getRealisationBySlug = unstable_cache(
  async (slug: string): Promise<RealisationRow | null> => {
    const rows = await getDb()
      .select()
      .from(realisations)
      .where(eq(realisations.slug, slug))
      .limit(1);
    return rows[0] ?? null;
  },
  [CACHE_TAG, "bySlug"],
  { tags: [CACHE_TAG], revalidate: 3600 },
);

// ── Write queries (not cached) ──────────────────────────────────────

export async function insertRealisation(data: RealisationInsert) {
  const [row] = await getDb().insert(realisations).values(data).returning();
  return row;
}

export async function updateRealisationBySlug(
  slug: string,
  data: Partial<RealisationInsert>,
) {
  const [row] = await getDb()
    .update(realisations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(realisations.slug, slug))
    .returning();
  return row ?? null;
}

export async function deleteRealisationBySlug(slug: string) {
  const [row] = await getDb()
    .delete(realisations)
    .where(eq(realisations.slug, slug))
    .returning({
      imageSrc: realisations.imageSrc,
      gallery: realisations.gallery,
    });
  return row ?? null;
}
