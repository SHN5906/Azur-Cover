"use server";

import { put, del } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (sous la limite serveur Vercel ~4.5MB)

// Le type MIME et l'extension fournis par le client ne sont pas dignes de
// confiance : on les dérive des magic bytes du fichier réel.
type ImageSig = { type: string; ext: string; match: (b: Uint8Array) => boolean };

function avifBrand(b: Uint8Array): boolean {
  // Boîte ISO-BMFF : "ftyp" à l'offset 4, puis major brand + compatible brands.
  if (!(b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70)) return false;
  for (let i = 8; i + 4 <= 32; i += 4) {
    const brand = String.fromCharCode(b[i], b[i + 1], b[i + 2], b[i + 3]);
    if (brand === "avif" || brand === "avis") return true;
  }
  return false;
}

const SIGNATURES: ImageSig[] = [
  {
    type: "image/jpeg",
    ext: "jpg",
    match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    type: "image/png",
    ext: "png",
    match: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    type: "image/webp",
    ext: "webp",
    match: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  { type: "image/avif", ext: "avif", match: avifBrand },
];

export type UploadResult =
  | { ok: true; url: string; alt: string }
  | { ok: false; error: string };

export async function uploadRealisationImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  // Rate limit : 20 uploads / minute. Évite qu'un compte compromis
  // n'inonde le Blob (coût Vercel + risque DoS).
  const ip = await getClientIp();
  const rl = await checkRateLimit(`admin:upload:${ip}`, 20, 60_000);
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
  // Validation par magic bytes — le file.type client n'est pas fiable.
  const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const detected = SIGNATURES.find((s) => s.match(header));
  if (!detected) {
    return {
      ok: false,
      error: "Type d'image non reconnu. Utilisez JPG, PNG, WebP ou AVIF.",
    };
  }

  const rawSlug = String(formData.get("slug") ?? "realisation");
  const slug = rawSlug.replace(/[^a-z0-9-]/gi, "-").toLowerCase() || "realisation";
  const filename = `realisations/${slug}.${detected.ext}`;

  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: detected.type,
  });

  const baseAlt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  return { ok: true, url: blob.url, alt: baseAlt };
}

export async function deleteBlobIfHosted(url: string | null | undefined) {
  if (!url) return;
  // Validate by hostname, not substring (INFO-01). Prevents a crafted URL
  // like "https://evil.com/x?.public.blob.vercel-storage.com/" from passing.
  try {
    const host = new URL(url).hostname;
    if (!host.endsWith(".public.blob.vercel-storage.com")) return;
  } catch {
    return;
  }
  try {
    await del(url);
  } catch {
    // idempotent : déjà supprimé ou jamais existé
  }
}
