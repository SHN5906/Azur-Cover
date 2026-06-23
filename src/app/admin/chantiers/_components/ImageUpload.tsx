"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { uploadRealisationImage } from "../../_actions/upload";
import { compressImage, MAX_UPLOAD_BYTES } from "./compress-image";

type Props = {
  initialUrl?: string;
  initialAlt?: string;
  slug: string;
};

export function ImageUpload({ initialUrl, initialAlt, slug }: Props) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [alt, setAlt] = useState(initialAlt ?? "");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    start(async () => {
      const compressed = await compressImage(file);
      if (compressed.size > MAX_UPLOAD_BYTES) {
        setError(
          "Image trop lourde ou format non pris en charge (HEIC ?). " +
            "Convertissez-la en JPG ou PNG, puis réessayez.",
        );
        return;
      }
      const fd = new FormData();
      fd.append("file", compressed);
      fd.append("slug", slug || "draft");
      const res = await uploadRealisationImage(fd);
      if (res.ok) {
        setUrl(res.url);
        if (!alt) setAlt(res.alt);
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-3">
      {url ? (
        <div className="relative aspect-[4/3] max-w-sm overflow-hidden rounded bg-graphite/5">
          <Image
            src={url}
            alt={alt || "Aperçu image chantier"}
            fill
            sizes="400px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/3] max-w-sm items-center justify-center rounded border border-dashed border-line/60 bg-graphite/5 text-xs text-muted">
          Aucune image
        </div>
      )}

      <input type="hidden" name="imageSrc" value={url} />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFile}
        disabled={pending}
        className="block text-sm file:mr-3 file:rounded file:border-0 file:bg-ink file:px-3 file:py-2 file:text-xs file:font-medium file:text-white file:hover:opacity-90"
      />
      <p className="text-xs text-muted">
        JPG / PNG / WebP / AVIF. Les photos sont automatiquement optimisées
        avant l&apos;envoi.
      </p>

      <p role="status" aria-live="polite" className="text-xs text-muted">
        {pending && "Upload en cours…"}
        {url && !pending && (
          <>
            ✓ Uploadé.{" "}
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setAlt("");
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="underline hover:text-ink"
            >
              Retirer
            </button>
          </>
        )}
      </p>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}

      <label className="block">
        <span className="text-sm uppercase tracking-wider text-muted">
          Texte alternatif (alt)
        </span>
        <input
          name="imageAlt"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          required
          minLength={5}
          maxLength={220}
          placeholder="Ex: Toiture industrielle après Cool Roofing"
          className="mt-2 block w-full border-b border-line/80 bg-transparent py-3 outline-none focus:border-ink"
        />
      </label>
    </div>
  );
}
