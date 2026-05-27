/**
 * One-shot migration script: insère le contenu de src/content/realisations.ts
 * en DB Neon (table `realisations`), idempotent par slug.
 *
 * Run:
 *   pnpm db:migrate-realisations            # contre la DATABASE_URL de .env.local
 *
 * Pour la prod (manuel, depuis local) :
 *   vercel env pull .env.production --environment=production --yes
 *   dotenv -e .env.production -- tsx scripts/migrate-realisations.ts
 *   rm .env.production
 *
 * Bypass intentionnel de src/db/index.ts qui importe 'server-only'
 * (incompatible avec tsx hors contexte Next.js).
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { realisations as realisationsTable } from "../src/db/schema";
import { realisations as staticRealisations } from "../src/content/realisations";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (vercel env pull?)");
  const db = drizzle(neon(url));

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < staticRealisations.length; i++) {
    const r = staticRealisations[i];
    const [existing] = await db
      .select({ id: realisationsTable.id, sector: realisationsTable.sector })
      .from(realisationsTable)
      .where(eq(realisationsTable.slug, r.slug))
      .limit(1);

    if (existing) {
      // Backfill : si la colonne `sector` est encore à sa valeur par défaut
      // ('tertiaire') alors que la source statique a une autre valeur, on
      // corrige. Permet à `pnpm db:migrate-realisations` de servir aussi de
      // reclassification après l'ajout du champ.
      if (existing.sector !== r.sector) {
        await db
          .update(realisationsTable)
          .set({ sector: r.sector, updatedAt: new Date() })
          .where(eq(realisationsTable.slug, r.slug));
        console.log(`  updated sector : ${r.slug} → ${r.sector}`);
        updated++;
      } else {
        console.log(`  skip (exists)  : ${r.slug}`);
        skipped++;
      }
      continue;
    }

    await db.insert(realisationsTable).values({
      slug: r.slug,
      title: r.title,
      client: r.client,
      city: r.city,
      solution: r.solution,
      sector: r.sector,
      surface: r.surface ?? null,
      duration: r.duration,
      year: r.year,
      short: r.short,
      story: r.story,
      results: r.results ?? null,
      imageSrc: r.image.src,
      imageAlt: r.image.alt,
      gallery: r.gallery ?? [],
      videoUrl: r.videoUrl ?? null,
      logo: r.logo ?? null,
      sortIndex: i,
    });
    console.log(`  inserted       : ${r.slug}`);
    inserted++;
  }

  console.log(
    `\n→ inserted: ${inserted}, updated: ${updated}, skipped: ${skipped}, total in source: ${staticRealisations.length}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
