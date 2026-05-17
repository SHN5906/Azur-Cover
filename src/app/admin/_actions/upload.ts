"use server";

import { put, del } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (sous la limite serveur Vercel ~4.5MB)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export type UploadResult =
  | { ok: true; url: string; alt: string }
  | { ok: false; error: string };

export async function uploadRealisationImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  // Rate limit : 20 uploads / minute. Évite qu'un compte compromis
  // n'inonde le Blob (coût Vercel + risque DoS).
  const ip = await getClientIp();
  const rl = checkRateLimit(`admin:upload:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return { ok: false, error: `Trop d'uploads. Réessayez dans ${rl.retryAfterSec}s.` };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Fichier manquant." };
  }
  if (file.size === 0) {
    return { ok: false, error: "Fichier vide." };
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: `Image trop lourde : ${(file.size / 1_048_576).toFixed(1)} Mo (max 4 Mo).`,
    };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: `Type non autorisé : ${file.type}. Utilisez JPG, PNG, WebP ou AVIF.`,
    };
  }

  const rawSlug = String(formData.get("slug") ?? "realisation");
  const slug = rawSlug.replace(/[^a-z0-9-]/gi, "-").toLowerCase() || "realisation";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `realisations/${slug}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });

  const baseAlt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  return { ok: true, url: blob.url, alt: baseAlt };
}

export async function deleteBlobIfHosted(url: string | null | undefined) {
  if (!url) return;
  if (!url.includes(".public.blob.vercel-storage.com/")) return;
  try {
    await del(url);
  } catch {
    // idempotent : déjà supprimé ou jamais existé
  }
}
