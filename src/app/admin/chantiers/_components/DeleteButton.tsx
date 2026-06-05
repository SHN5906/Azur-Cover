"use client";

import { useState, useTransition } from "react";
import { deleteRealisation } from "../../_actions/realisations";

export function DeleteButton({ slug, title }: { slug: string; title: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            !confirm(
              `Supprimer définitivement « ${title} » ?\nL'image associée sera aussi supprimée du stockage.`,
            )
          )
            return;
          setError(null);
          start(async () => {
            const res = await deleteRealisation(slug);
            if (res && !res.ok) setError(res.error);
          });
        }}
        className="inline-block py-1.5 text-xs text-red-600 underline disabled:opacity-50"
      >
        {pending ? "Suppression…" : "Supprimer"}
      </button>
      {error && (
        <span role="alert" className="mt-1 max-w-[200px] text-right text-[11px] text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
