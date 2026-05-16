import "server-only";
import { eq, asc, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { realisations } from "@/db/schema";

export type RealisationRow = typeof realisations.$inferSelect;
export type RealisationInsert = typeof realisations.$inferInsert;

export async function listRealisations(): Promise<RealisationRow[]> {
  return getDb()
    .select()
    .from(realisations)
    .orderBy(asc(realisations.sortIndex), desc(realisations.createdAt));
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
    .returning({ imageSrc: realisations.imageSrc });
  return row ?? null;
}
