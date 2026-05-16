"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin error]", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl p-10">
      <p className="font-mono text-xs uppercase tracking-wider text-red-600">
        Erreur admin
      </p>
      <h1 className="mt-4 text-2xl font-semibold">
        Une erreur est survenue côté serveur.
      </h1>
      <p className="mt-3 text-sm text-muted">
        L&apos;opération a échoué. Réessayez ; si le problème persiste, vérifiez
        que la base de données est bien accessible.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-xs text-muted">
          Référence : {error.digest}
        </p>
      )}
      <div className="mt-8 flex items-center gap-4 text-sm">
        <button
          type="button"
          onClick={reset}
          className="rounded bg-ink px-4 py-2 font-medium text-white"
        >
          Réessayer
        </button>
        <Link href="/admin" className="underline">
          Retour au dashboard
        </Link>
      </div>
    </main>
  );
}
