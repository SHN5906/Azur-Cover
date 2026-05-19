"use client";

import { useActionState, useState } from "react";
import { solutionEnum, type SolutionValue } from "@/db/schema";
import { ImageUpload } from "./ImageUpload";
import type { ActionResult } from "../../_actions/realisations";

type ResultRow = { value: string; label: string };

const FIELD_LABELS: Record<string, string> = {
  slug: "Slug",
  title: "Titre",
  client: "Client",
  city: "Ville",
  solution: "Solution",
  surface: "Surface",
  duration: "Durée",
  year: "Année",
  short: "Description courte",
  story: "Histoire",
  results: "Résultats",
  imageSrc: "Image",
  imageAlt: "Texte alternatif (alt)",
  logo: "Logo",
};

export type RealisationFormInitial = {
  slug: string;
  title: string;
  client: string;
  city: string;
  solution: SolutionValue;
  surface?: string | null;
  duration: string;
  year: string;
  short: string;
  story: string[];
  results?: ResultRow[] | null;
  imageSrc: string;
  imageAlt: string;
  logo?: string | null;
};

type Props = {
  initial?: RealisationFormInitial;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
};

export function RealisationForm({ initial, action, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );
  const [results, setResults] = useState<ResultRow[]>(initial?.results ?? []);
  const slugValue = initial?.slug ?? "";
  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-10">
      {state?.ok === false && (
        <div className="rounded border border-red-500/40 bg-red-50 p-3 text-sm text-red-700">
          <p>{state.error}</p>
          {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs">
              {Object.entries(state.fieldErrors).map(([field, errs]) =>
                errs?.map((e, i) => (
                  <li key={`${field}-${i}`}>
                    <strong>{FIELD_LABELS[field] ?? field}</strong> : {e}
                  </li>
                )),
              )}
            </ul>
          )}
        </div>
      )}

      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-3 text-xs uppercase tracking-wider text-muted md:col-span-2">
          Identité du chantier
        </legend>
        <TextField
          name="slug"
          label="Slug (URL)"
          required
          defaultValue={slugValue}
          pattern="[a-z0-9-]+"
          minLength={2}
          maxLength={96}
          placeholder="promocash-grasse"
          hint="Minuscules, chiffres, tirets. Apparaît dans l'URL /realisations/[slug]."
          error={fieldErrors?.slug}
        />
        <TextField
          name="title"
          label="Titre"
          required
          defaultValue={initial?.title}
          maxLength={160}
          error={fieldErrors?.title}
        />
        <TextField
          name="client"
          label="Client"
          required
          defaultValue={initial?.client}
          maxLength={160}
          error={fieldErrors?.client}
        />
        <TextField
          name="city"
          label="Ville"
          required
          defaultValue={initial?.city}
          maxLength={96}
          error={fieldErrors?.city}
        />
        <SelectField
          name="solution"
          label="Solution"
          required
          defaultValue={initial?.solution}
          options={solutionEnum}
          error={fieldErrors?.solution}
        />
        <TextField
          name="surface"
          label="Surface"
          defaultValue={initial?.surface ?? ""}
          maxLength={32}
          placeholder="2 700 m²"
          hint="Optionnel."
        />
        <TextField
          name="duration"
          label="Durée chantier"
          required
          defaultValue={initial?.duration}
          maxLength={64}
          placeholder="3 semaines"
          error={fieldErrors?.duration}
        />
        <TextField
          name="year"
          label="Année"
          required
          defaultValue={initial?.year}
          pattern="\d{4}"
          maxLength={4}
          placeholder="2024"
          error={fieldErrors?.year}
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-xs uppercase tracking-wider text-muted">
          Description
        </legend>
        <TextAreaField
          name="short"
          label="Description courte (carrousel + carte, max 220 c.)"
          required
          rows={2}
          defaultValue={initial?.short}
          maxLength={220}
          error={fieldErrors?.short}
        />
        <TextAreaField
          name="story"
          label="Histoire complète"
          required
          rows={10}
          defaultValue={initial?.story.join("\n\n")}
          hint="Séparez les paragraphes par une LIGNE VIDE (Entrée x2)."
          error={fieldErrors?.story}
        />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-wider text-muted">
          Résultats chiffrés (optionnel)
        </legend>
        {results.length === 0 && (
          <p className="text-xs text-muted">
            Ex: « 3 à 4 °C » / « vs classes témoins, en pic chaleur ». Affiché en
            grand sur la fiche détaillée.
          </p>
        )}
        {results.map((r, i) => (
          <div key={i} className="flex gap-2">
            <input
              name={`results[${i}][value]`}
              defaultValue={r.value}
              placeholder="3 à 4 °C"
              maxLength={32}
              className="flex-1 border-b border-line/80 bg-transparent py-2 outline-none focus:border-ink"
            />
            <input
              name={`results[${i}][label]`}
              defaultValue={r.label}
              placeholder="vs classes témoins"
              maxLength={120}
              className="flex-[2] border-b border-line/80 bg-transparent py-2 outline-none focus:border-ink"
            />
            <button
              type="button"
              onClick={() => setResults((rs) => rs.filter((_, j) => j !== i))}
              className="text-xs text-red-600 underline"
              aria-label={`Supprimer le résultat ${i + 1}`}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setResults((rs) => [...rs, { value: "", label: "" }])}
          className="text-xs underline hover:text-ink"
        >
          + Ajouter un résultat
        </button>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-wider text-muted">
          Image principale
        </legend>
        <ImageUpload
          initialUrl={initial?.imageSrc}
          initialAlt={initial?.imageAlt}
          slug={slugValue}
        />
        {fieldErrors?.imageSrc && (
          <p className="text-xs text-red-600">{fieldErrors.imageSrc.join(", ")}</p>
        )}
        {fieldErrors?.imageAlt && (
          <p className="text-xs text-red-600">{fieldErrors.imageAlt.join(", ")}</p>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-xs uppercase tracking-wider text-muted">
          Logo client (optionnel)
        </legend>
        <TextField
          name="logo"
          label="URL du logo"
          defaultValue={initial?.logo ?? ""}
          placeholder="/images/clients/xxx.png ou https://..."
          hint="Chemin local /images/clients/* ou URL https://"
          error={fieldErrors?.logo}
        />
      </fieldset>

      <div className="flex items-center gap-4 border-t border-line/40 pt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-ink px-5 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : submitLabel}
        </button>
        <a href="/admin/chantiers" className="text-sm text-muted hover:text-ink">
          Annuler
        </a>
      </div>
    </form>
  );
}

// --- Champs réutilisables ---

type TextFieldProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string[];
} & React.InputHTMLAttributes<HTMLInputElement>;

function TextField({ name, label, hint, error, ...props }: TextFieldProps) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted">
        {label}
        {props.required && " *"}
      </span>
      <input
        name={name}
        className="mt-1 block w-full border-b border-line/80 bg-transparent py-2 outline-none transition-colors focus:border-ink"
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error?.map((e) => (
        <p key={e} className="mt-1 text-xs text-red-600">
          {e}
        </p>
      ))}
    </label>
  );
}

type TextAreaFieldProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string[];
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

function TextAreaField({ name, label, hint, error, ...props }: TextAreaFieldProps) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted">
        {label}
        {props.required && " *"}
      </span>
      <textarea
        name={name}
        className="mt-1 block w-full resize-y border border-line/60 bg-transparent p-3 outline-none transition-colors focus:border-ink"
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error?.map((e) => (
        <p key={e} className="mt-1 text-xs text-red-600">
          {e}
        </p>
      ))}
    </label>
  );
}

type SelectFieldProps = {
  name: string;
  label: string;
  options: readonly string[];
  error?: string[];
} & React.SelectHTMLAttributes<HTMLSelectElement>;

function SelectField({ name, label, options, error, ...props }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted">
        {label}
        {props.required && " *"}
      </span>
      <select
        name={name}
        className="mt-1 block w-full border-b border-line/80 bg-transparent py-2 outline-none transition-colors focus:border-ink"
        {...props}
      >
        <option value="" disabled>
          —
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error?.map((e) => (
        <p key={e} className="mt-1 text-xs text-red-600">
          {e}
        </p>
      ))}
    </label>
  );
}
