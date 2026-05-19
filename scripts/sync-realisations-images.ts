/**
 * One-shot sync: pour chaque slug présent en DB, met à jour `imageSrc` et
 * `imageAlt` depuis `src/content/realisations.ts`. Les autres colonnes ne
 * sont pas touchées (le CMS admin reste source de vérité pour le contenu).
 *
 * Run:
 *   pnpm tsx scripts/sync-realisations-images.ts   # via dotenv-cli si .env.local
 *   ou  pnpm db:sync-realisations-images
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { realisations as realisationsTable } from "../src/db/schema";
import { realisations as staticRealisations } from "../src/content/realisations";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const db = drizzle(neon(url));

  let updated = 0;
  let unchanged = 0;
  let missing = 0;

  for (const r of staticRealisations) {
    const [existing] = await db
      .select({
        id: realisationsTable.id,
        imageSrc: realisationsTable.imageSrc,
        imageAlt: realisationsTable.imageAlt,
      })
      .from(realisationsTable)
      .where(eq(realisationsTable.slug, r.slug))
      .limit(1);

    if (!existing) {
      console.log(`  missing in DB  : ${r.slug}`);
      missing++;
      continue;
    }

    if (existing.imageSrc === r.image.src && existing.imageAlt === r.image.alt) {
      console.log(`  unchanged      : ${r.slug}`);
      unchanged++;
      continue;
    }

    await db
      .update(realisationsTable)
      .set({
        imageSrc: r.image.src,
        imageAlt: r.image.alt,
        updatedAt: new Date(),
      })
      .where(eq(realisationsTable.slug, r.slug));
    console.log(
      `  updated        : ${r.slug}  (${existing.imageSrc} → ${r.image.src})`,
    );
    updated++;
  }

  console.log(
    `\n→ updated: ${updated}, unchanged: ${unchanged}, missing: ${missing}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
