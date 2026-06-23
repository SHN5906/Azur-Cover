// Compression d'image côté navigateur, exécutée AVANT la server action
// d'upload. Next.js rejette toute server action dont le corps dépasse 1 Mo
// (limite `serverActions.bodySizeLimit` par défaut) — une photo de téléphone
// (2–8 Mo) déclenchait donc une « erreur serveur » avant même d'atteindre
// notre code. On redimensionne et on ré-encode en JPEG pour rester bien en
// dessous de cette limite.
//
// En cas d'échec de décodage (HEIC, fichier corrompu…), on renvoie le fichier
// d'origine intact : la validation par magic bytes de la server action s'en
// chargera proprement plutôt que de planter.

// Plus grand côté de l'image après redimensionnement. 2400 px couvre largement
// l'affichage hero pleine largeur du site.
const MAX_DIMENSION = 2400;
// Cible de poids. ~800 Ko laisse une marge confortable sous la limite de 1 Mo
// (overhead multipart du FormData inclus).
const TARGET_BYTES = 800_000;
const MIN_QUALITY = 0.5;
const START_QUALITY = 0.82;

// Garde-fou : poids max accepté par la server action (limite Next.js de 1 Mo,
// marge multipart déduite). Si la compression échoue et que le fichier dépasse
// ce seuil, on refuse côté client avec un message clair plutôt que de laisser
// la server action planter.
export const MAX_UPLOAD_BYTES = 1_000_000;

export async function compressImage(file: File): Promise<File> {
  // Les fichiers déjà légers passent tels quels — pas de recompression inutile
  // qui dégraderait la qualité.
  if (!file.type.startsWith("image/") || file.size <= TARGET_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    // `imageOrientation: "from-image"` applique l'orientation EXIF pour que les
    // photos prises au téléphone ne soient pas tournées.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return file;
  }
  // Fond blanc : le JPEG n'a pas de canal alpha, on évite ainsi un fond noir
  // sur les PNG transparents.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  let quality = START_QUALITY;
  let blob = await toJpegBlob(canvas, quality);
  while (blob && blob.size > TARGET_BYTES && quality > MIN_QUALITY) {
    quality -= 0.1;
    blob = await toJpegBlob(canvas, quality);
  }
  // Si l'encodage échoue ou ne réduit pas le poids, on garde l'original.
  if (!blob || blob.size >= file.size) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

function toJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

// Plus grand côté d'un logo après redimensionnement. Un logo n'a pas besoin
// d'être grand ; 800 px suffit largement.
const LOGO_MAX_DIMENSION = 800;

// Prépare un logo pour l'upload. Contrairement aux photos, on PRÉSERVE la
// transparence (la plupart des logos sont des PNG à fond transparent) : sortie
// PNG pour les formats à canal alpha, JPEG seulement pour les sources JPEG.
// Redimensionne uniquement si nécessaire pour rester sous la limite de 1 Mo.
export async function prepareLogo(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  // Déjà petit et léger → on n'y touche pas (évite de re-encoder un logo net).
  if (Math.max(bitmap.width, bitmap.height) <= LOGO_MAX_DIMENSION && file.size <= TARGET_BYTES) {
    bitmap.close?.();
    return file;
  }

  const scale = Math.min(1, LOGO_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return file;
  }
  const keepAlpha = file.type !== "image/jpeg";
  if (!keepAlpha) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const mime = keepAlpha ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, 0.9),
  );
  if (!blob || blob.size >= file.size) return file;

  const ext = keepAlpha ? "png" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
  return new File([blob], name, { type: mime });
}
