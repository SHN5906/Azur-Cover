import { z } from "zod";
import { solutionEnum, sectorEnum } from "@/db/schema";

const optionalString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

// Image / logo : accepte les URLs Blob (https://) ET les chemins locaux
// (/images/...) pour rester compatible avec les chantiers migrés du fichier
// statique. Refuse les URLs http://, javascript:, data:, etc.
const imagePathOrUrl = z
  .string()
  .min(1, "Image requise")
  .refine(
    (u) => u.startsWith("https://") || u.startsWith("/"),
    "Image: URL https:// ou chemin local /images/...",
  );

const optionalImagePathOrUrl = z
  .string()
  .optional()
  .transform((v) => (v == null || v === "" ? undefined : v))
  .refine(
    (v) => v === undefined || v.startsWith("https://") || v.startsWith("/"),
    "Logo : URL https:// ou chemin local /images/...",
  );

export const RealisationSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug trop court (min 2)")
    .max(96, "Slug trop long (max 96)")
    .regex(/^[a-z0-9-]+$/, "Slug : minuscules, chiffres, tirets uniquement"),
  title: z.string().min(2, "Titre requis").max(160),
  client: z.string().min(2, "Client requis").max(160),
  city: z.string().min(2, "Ville requise").max(96),
  solution: z.enum(solutionEnum),
  sector: z.enum(sectorEnum),
  surface: optionalString(32),
  duration: z.string().min(1, "Durée requise").max(64),
  year: z.string().regex(/^\d{4}$/, "Année sur 4 chiffres (ex: 2024)"),
  short: z
    .string()
    .min(10, "Description courte trop courte (min 10)")
    .max(220, "Description courte trop longue (max 220)"),
  // textarea -> array de paragraphes, split sur ligne vide
  story: z
    .string()
    .min(1, "Histoire requise")
    .transform((s) =>
      s
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string()).min(1, "Au moins un paragraphe requis")),
  results: z
    .array(
      z.object({
        value: z.string().min(1).max(32),
        label: z.string().min(1).max(120),
      }),
    )
    .optional(),
  imageSrc: imagePathOrUrl,
  imageAlt: z
    .string()
    .min(5, "Texte alternatif requis (min 5 caractères)")
    .max(220),
  // Galerie : max 24 entrées (limite pratique pour ne pas exploser la
  // page de détail). Chaque entrée a sa propre image + alt.
  gallery: z
    .array(
      z.object({
        url: imagePathOrUrl,
        alt: z
          .string()
          .min(5, "Texte alternatif requis (min 5)")
          .max(220),
      }),
    )
    .max(24, "Galerie limitée à 24 photos")
    .optional()
    .default([]),
  // URL vidéo : on accepte large (YouTube, Vimeo, .mp4 via Blob). Le rendu
  // public refait la détection. Refus strict de javascript:/data:/file:.
  videoUrl: z
    .string()
    .url("URL vidéo invalide")
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  logo: optionalImagePathOrUrl,
});

export type RealisationInput = z.infer<typeof RealisationSchema>;
