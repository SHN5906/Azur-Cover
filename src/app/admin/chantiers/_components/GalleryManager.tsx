"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadRealisationImage } from "../../_actions/upload";
import { compressImage, MAX_UPLOAD_BYTES } from "./compress-image";

type Item = { url: string; alt: string };

type Props = {
  initial?: Item[];
  slug: string;
};

const MAX_ITEMS = 24;

export function GalleryManager({ initial = [], slug }: Props) {
  const [items, setItems] = useState<Item[]>(initial);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setError(null);
    const room = MAX_ITEMS - items.length;
    if (room <= 0) {
      setError(`Galerie limitée à ${MAX_ITEMS} photos.`);
      return;
    }
    const toUpload = files.slice(0, room);
    setProgress({ done: 0, total: toUpload.length });

    // Upload séquentiel : la server action rate-limite par IP. Parallèle
    // déclencherait des 429.
    for (let i = 0; i < toUpload.length; i++) {
      const compressed = await compressImage(toUpload[i]);
      if (compressed.size > MAX_UPLOAD_BYTES) {
        setError(
          `« ${toUpload[i].name} » : image trop lourde ou format non pris en ` +
            "charge (HEIC ?). Convertissez-la en JPG ou PNG, puis réessayez.",
        );
        break;
      }
      const fd = new FormData();
      fd.append("file", compressed);
      fd.append("slug", slug || "draft");
      const res = await uploadRealisationImage(fd);
      if (res.ok) {
        setItems((prev) => [...prev, { url: res.url, alt: res.alt }]);
      } else {
        setError(res.error);
        break;
      }
      setProgress({ done: i + 1, total: toUpload.length });
    }

    setProgress(null);
    if (files.length > room) {
      setError(
        `Limite atteinte : ${room} photo(s) ajoutée(s), ${files.length - room} ignorée(s).`,
      );
    }
  };

  const remove = (i: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const move = (i: number, delta: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const j = i + delta;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const updateAlt = (i: number, alt: string) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, alt } : it)));
  };

  return (
    <div className="space-y-4">
      {/* Inputs cachés qui sont sérialisés dans le FormData parent */}
      {items.map((it, i) => (
        <input
          key={`url-${i}`}
          type="hidden"
          name={`gallery[${i}][url]`}
          value={it.url}
        />
      ))}

      {items.length === 0 ? (
        <div className="rounded border border-dashed border-line/60 bg-graphite/5 p-6 text-xs text-muted">
          Aucune photo additionnelle. Ajoute-en pour enrichir la fiche.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((it, i) => (
            <li
              key={`${it.url}-${i}`}
              className="flex gap-3 rounded border border-line/40 bg-bg p-3"
            >
              <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded bg-graphite/5">
                <Image
                  src={it.url}
                  alt={it.alt}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <input
                  name={`gallery[${i}][alt]`}
                  value={it.alt}
                  onChange={(e) => updateAlt(i, e.target.value)}
                  required
                  minLength={5}
                  maxLength={220}
                  placeholder="Description de la photo"
                  className="border-b border-line/60 bg-transparent py-1 text-sm outline-none focus:border-ink"
                />
                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="text-muted hover:text-ink disabled:opacity-30"
                    aria-label="Monter d'un cran"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    className="text-muted hover:text-ink disabled:opacity-30"
                    aria-label="Descendre d'un cran"
                  >
                    ↓
                  </button>
                  <span className="ml-auto text-muted">{i + 1}/{items.length}</span>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-red-600 underline hover:opacity-80"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={handleFiles}
          disabled={progress !== null || items.length >= MAX_ITEMS}
          className="block text-sm file:mr-3 file:rounded file:border-0 file:bg-ink file:px-3 file:py-2 file:text-xs file:font-medium file:text-white file:hover:opacity-90 disabled:opacity-50"
        />
        <p role="status" aria-live="polite" className="mt-2 text-xs text-muted">
          {progress && `Upload ${progress.done}/${progress.total}…`}
        </p>
        {error && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}
        <p className="mt-2 text-xs text-muted">
          {items.length}/{MAX_ITEMS} photos. JPG / PNG / WebP / AVIF — les
          photos sont automatiquement optimisées avant l&apos;envoi.
        </p>
      </div>
    </div>
  );
}
