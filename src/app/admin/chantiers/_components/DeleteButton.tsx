"use client";

import { useTransition } from "react";
import { deleteRealisation } from "../../_actions/realisations";

export function DeleteButton({ slug, title }: { slug: string; title: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Supprimer définitivement « ${title} » ?\nL'image associée sera aussi supprimée du stockage.`)) return;
        start(() => deleteRealisation(slug));
      }}
      className="text-xs text-red-600 underline disabled:opacity-50"
    >
      {pending ? "…" : "Supprimer"}
    </button>
  );
}
