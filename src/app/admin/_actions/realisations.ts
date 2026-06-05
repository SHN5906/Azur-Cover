"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { RealisationSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getRealisationBySlug,
  insertRealisation,
  updateRealisationBySlug,
  deleteRealisationBySlug,
} from "@/lib/realisations-repo";
import { deleteBlobIfHosted } from "./upload";

/**
 * Rate limit générique pour toutes les mutations admin (create/update/
 * delete). Défense contre un compte compromis ou un script qui tape
 * la DB en boucle. 30 mutations / minute = largement suffisant pour
 * un usage humain normal.
 */
async function rateLimitAdmin(action: string) {
  const ip = await getClientIp();
  const result = await checkRateLimit(`admin:${action}:${ip}`, 30, 60_000);
  if (!result.ok) {
    return {
      ok: false as const,
      error: `Trop d'opérations. Réessayez dans ${result.retryAfterSec}s.`,
    };
  }
  return null;
}

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

function parseFormData(formData: FormData) {
  // results = série de champs `results[i][value]` et `results[i][label]`
  const results: { value: string; label: string }[] = [];
  let i = 0;
  while (formData.has(`results[${i}][value]`) || formData.has(`results[${i}][label]`)) {
    const value = String(formData.get(`results[${i}][value]`) ?? "").trim();
    const label = String(formData.get(`results[${i}][label]`) ?? "").trim();
    if (value && label) results.push({ value, label });
    i++;
  }

  // gallery = série de champs `gallery[i][url]` et `gallery[i][alt]`.
  // Les entrées partielles (alt vide ou url vide) sont éliminées ici, la
  // validation Zod s'occupe du reste.
  const gallery: { url: string; alt: string }[] = [];
  let g = 0;
  while (formData.has(`gallery[${g}][url]`) || formData.has(`gallery[${g}][alt]`)) {
    const url = String(formData.get(`gallery[${g}][url]`) ?? "").trim();
    const alt = String(formData.get(`gallery[${g}][alt]`) ?? "").trim();
    if (url && alt) gallery.push({ url, alt });
    g++;
  }

  return {
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    title: String(formData.get("title") ?? "").trim(),
    client: String(formData.get("client") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    solution: String(formData.get("solution") ?? "").trim(),
    sector: String(formData.get("sector") ?? "").trim(),
    surface: String(formData.get("surface") ?? "").trim(),
    duration: String(formData.get("duration") ?? "").trim(),
    year: String(formData.get("year") ?? "").trim(),
    short: String(formData.get("short") ?? "").trim(),
    story: String(formData.get("story") ?? ""),
    results: results.length > 0 ? results : undefined,
    imageSrc: String(formData.get("imageSrc") ?? "").trim(),
    imageAlt: String(formData.get("imageAlt") ?? "").trim(),
    gallery,
    videoUrl: String(formData.get("videoUrl") ?? "").trim(),
    logo: String(formData.get("logo") ?? "").trim(),
  };
}

function revalidatePublic(slug: string, oldSlug?: string) {
  revalidatePath("/realisations");
  revalidatePath(`/realisations/${slug}`);
  if (oldSlug && oldSlug !== slug) {
    revalidatePath(`/realisations/${oldSlug}`);
  }
  revalidatePath("/admin/chantiers");
}

export async function createRealisation(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const rl = await rateLimitAdmin("create");
  if (rl) return rl;

  const parsed = RealisationSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation échouée. Vérifiez les champs en rouge.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await getRealisationBySlug(parsed.data.slug);
  if (existing) {
    return { ok: false, error: `Slug déjà utilisé : ${parsed.data.slug}` };
  }

  await insertRealisation(parsed.data);
  revalidatePublic(parsed.data.slug);
  redirect(`/admin/chantiers?created=${parsed.data.slug}`);
}

export async function updateRealisation(
  slug: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const rl = await rateLimitAdmin("update");
  if (rl) return rl;

  const parsed = RealisationSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation échouée. Vérifiez les champs en rouge.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await getRealisationBySlug(slug);
  if (!existing) {
    return { ok: false, error: "Chantier introuvable." };
  }

  // Si le slug change, vérifier qu'il n'est pas déjà pris par un autre chantier
  if (parsed.data.slug !== slug) {
    const conflict = await getRealisationBySlug(parsed.data.slug);
    if (conflict) {
      return { ok: false, error: `Slug déjà utilisé : ${parsed.data.slug}` };
    }
  }

  // Image remplacée → supprimer l'ancienne du Blob
  if (existing.imageSrc !== parsed.data.imageSrc) {
    await deleteBlobIfHosted(existing.imageSrc);
  }

  // Galerie : supprimer du Blob les images retirées (présentes avant, plus
  // dans la nouvelle liste). Évite l'accumulation de fichiers orphelins.
  const newUrls = new Set(parsed.data.gallery.map((g) => g.url));
  const removed = (existing.gallery ?? []).filter((g) => !newUrls.has(g.url));
  await Promise.all(removed.map((g) => deleteBlobIfHosted(g.url)));

  await updateRealisationBySlug(slug, parsed.data);
  revalidatePublic(parsed.data.slug, slug);
  redirect(`/admin/chantiers?updated=${parsed.data.slug}`);
}

export async function deleteRealisation(slug: string): Promise<ActionResult> {
  await requireAdmin();
  const rl = await rateLimitAdmin("delete");
  if (rl) return rl;
  const row = await deleteRealisationBySlug(slug);
  if (row) {
    await deleteBlobIfHosted(row.imageSrc);
    await Promise.all(
      (row.gallery ?? []).map((g) => deleteBlobIfHosted(g.url)),
    );
  }
  revalidatePublic(slug);
  return { ok: true };
}
