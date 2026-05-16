import { z } from "zod";
import { solutionEnum } from "@/db/schema";

const optionalString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

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
  imageSrc: z
    .string()
    .url("URL d'image invalide")
    .refine((u) => u.startsWith("https://"), "L'image doit être servie en HTTPS"),
  imageAlt: z
    .string()
    .min(5, "Texte alternatif requis (min 5 caractères)")
    .max(220),
  logo: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type RealisationInput = z.infer<typeof RealisationSchema>;
