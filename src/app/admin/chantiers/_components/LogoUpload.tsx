"use client";

import { useRef, useState, useTransition } from "react";
import { uploadRealisationImage } from "../../_actions/upload";
import { prepareLogo, MAX_UPLOAD_BYTES } from "./compress-image";

type Props = {
  initialUrl?: string;
  slug: string;
};

export function LogoUpload({ initialUrl, slug }: Props) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = (file: File) => {
    setError(null);
    start(async () => {
      const prepared = await prepareLogo(file);
      if (prepared.size > MAX_UPLOAD_BYTES) {
        setError(
          "Logo trop lourd ou format non pris en charge. Utilisez PNG, JPG ou WebP.",
        );
        return;
      }
      const fd = new FormData();
      fd.append("file", prepared);
      fd.append("slug", `${slug || "draft"}-logo`);
      const res = await uploadRealisationImage(fd);
      if (res.ok) setUrl(res.url);
      else setError(res.error);
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  return (
    <div className="space-y-3">
      {/* Valeur sérialisée dans le FormData parent (chemin local OU URL Blob/https). */}
      <input type="hidden" name="logo" value={url} />

      <div
        role="button"
        tabIndex={0}
        aria-label="Déposer ou choisir un logo"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed p-4 text-center text-xs transition-colors ${
          dragging
            ? "border-ink bg-graphite/10"
            : "border-line/60 bg-graphite/5 hover:border-ink"
        }`}
      >
        {url ? (
          // Logo possiblement transparent / hôte arbitraire → <img> simple
          // (pas next/image, dont les remotePatterns ne couvrent pas tout).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Aperçu du logo"
            className="max-h-16 max-w-[180px] object-contain"
          />
        ) : (
          <span className="text-muted">
            Glissez-déposez un logo ici, ou cliquez pour parcourir
          </span>
        )}
        {pending && <span className="text-muted">Upload en cours…</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
        disabled={pending}
        className="hidden"
      />

      <label className="block">
        <span className="text-xs text-muted">
          …ou colle un chemin local / une URL
        </span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/images/clients/xxx.png ou https://..."
          className="mt-1 block w-full border-b border-line/80 bg-transparent py-2 outline-none focus:border-ink"
        />
      </label>

      {url && !pending && (
        <button
          type="button"
          onClick={() => {
            setUrl("");
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="text-xs text-red-600 underline hover:opacity-80"
        >
          Retirer le logo
        </button>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
