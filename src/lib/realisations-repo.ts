import "server-only";
import { and, eq, asc, desc, type SQL } from "drizzle-orm";
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

export async function listRealisations(
  filters: RealisationFilters = {},
): Promise<RealisationRow[]> {
  const conditions: SQL[] = [];
  if (filters.sector) conditions.push(eq(realisations.sector, filters.sector));
  if (filters.solution)
    conditions.push(eq(realisations.solution, filters.solution));

  const query = getDb().select().from(realisations);
  const filtered =
    conditions.length > 0 ? query.where(and(...conditions)) : query;

  return filtered.orderBy(
    asc(realisations.sortIndex),
    desc(realisations.createdAt),
  );
}

export async function getRealisationBySlug(slug: string): Promise<RealisationRow | null> {
  const rows = await getDb()
    .select()
    .from(realisations)
    .where(eq(realisations.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

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
