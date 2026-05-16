"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../_actions/auth";

type Props = {
  hasUrlError?: boolean;
  from?: string;
};

export function LoginForm({ hasUrlError, from }: Props) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      {from && <input type="hidden" name="from" value={from} />}

      <label className="block">
        <span className="text-xs uppercase tracking-wider text-muted">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          autoFocus
          className="mt-2 block w-full border-b border-line/80 bg-transparent py-3 outline-none transition-colors focus:border-ink"
        />
      </label>

      <label className="block">
        <span className="text-xs uppercase tracking-wider text-muted">Mot de passe</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="mt-2 block w-full border-b border-line/80 bg-transparent py-3 outline-none transition-colors focus:border-ink"
        />
      </label>

      {state?.ok === false && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {hasUrlError && state?.ok !== false && (
        <p className="text-sm text-red-600" role="alert">
          Une erreur est survenue. Réessayez.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-ink px-5 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
