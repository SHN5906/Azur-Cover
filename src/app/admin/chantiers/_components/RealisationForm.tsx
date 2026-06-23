"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  solutionEnum,
  sectorEnum,
  type SolutionValue,
  type SectorValue,
} from "@/db/schema";
import { ImageUpload } from "./ImageUpload";
import { GalleryManager } from "./GalleryManager";
import { LogoUpload } from "./LogoUpload";
import type { ActionResult } from "../../_actions/realisations";

type ResultRow = { value: string; label: string };

// Libellés humains pour le select secteur (la DB stocke des slugs).
const SECTOR_LABELS: Record<SectorValue, string> = {
  industrie: "Industrie",
  tertiaire: "Tertiaire",
  collectivites: "Collectivités",
};

const FIELD_LABELS: Record<string, string> = {
  slug: "Slug",
  title: "Titre",
  client: "Client",
  city: "Ville",
  solution: "Solution",
  sector: "Secteur",
  surface: "Surface",
  duration: "Durée",
  year: "Année",
  short: "Description courte",
  story: "Histoire",
  results: "Résultats",
  imageSrc: "Image",
  imageAlt: "Texte alternatif (alt)",
  gallery: "Galerie",
  videoUrl: "Vidéo",
  logo: "Logo",
};

export type RealisationFormInitial = {
  slug: string;
  title: string;
  client: string;
  city: string;
  solution: SolutionValue;
  sector: SectorValue;
  surface?: string | null;
  duration: string;
  year: string;
  short: string;
  story: string[];
  results?: ResultRow[] | null;
  imageSrc: string;
  imageAlt: string;
  gallery?: { url: string; alt: string }[] | null;
  videoUrl?: string | null;
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
  // Nouveau chantier : pré-rempli avec l'année courante. Édition : on garde
  // l'année enregistrée.
  const currentYear = String(new Date().getFullYear());

  // Champs contrôlés : la suppression d'une ligne du milieu ne mélange plus
  // les valeurs (l'ancien defaultValue + clé d'index laissait des valeurs
  // fantômes dans le DOM).
  const updateResult = (i: number, field: "value" | "label", val: string) =>
    setResults((rs) => rs.map((r, j) => (j === i ? { ...r, [field]: val } : r)));
  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined;
  const isEditing = !!initial;
  const [dirty, setDirty] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  // Échec serveur : on déplace le focus sur le récapitulatif (annonce via
  // role="alert" + repère visuel) plutôt que de le laisser sur le bouton.
  useEffect(() => {
    if (state?.ok === false) errorRef.current?.focus();
  }, [state]);

  // Avertit avant de quitter la page avec des modifications non enregistrées.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return (
    <form
      action={formAction}
      onChange={() => setDirty(true)}
      className="space-y-12"
    >
      {state?.ok === false && (
        <div
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          className="rounded border border-red-500/40 bg-red-50 p-3 text-sm text-red-700 outline-none"
        >
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

      <fieldset className="grid gap-x-8 gap-y-8 md:grid-cols-2">
        <legend className="mb-3 text-sm uppercase tracking-wider text-muted md:col-span-2">
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
          hint={
            isEditing
              ? "Minuscules, chiffres, tirets. Attention : changer le slug modifie l'URL publique et casse les liens existants."
              : "Minuscules, chiffres, tirets. Apparaît dans l'URL /realisations/[slug]."
          }
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
        <SelectField
          name="sector"
          label="Secteur"
          required
          defaultValue={initial?.sector}
          options={sectorEnum}
          labels={SECTOR_LABELS}
          error={fieldErrors?.sector}
        />
        <SurfaceField initialValue={initial?.surface} />
        <DurationField initialValue={initial?.duration} error={fieldErrors?.duration} />
        <TextField
          name="year"
          label="Année"
          required
          defaultValue={initial?.year ?? currentYear}
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          placeholder={currentYear}
          error={fieldErrors?.year}
        />
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="text-sm uppercase tracking-wider text-muted">
          Description
        </legend>
        <TextAreaField
          name="short"
          label="Description courte"
          required
          rows={2}
          defaultValue={initial?.short}
          maxLength={220}
          error={fieldErrors?.short}
        />
        <TextAreaField
          name="story"
          label="Histoire complète"
          rows={10}
          defaultValue={initial?.story.join("\n\n")}
          hint="Séparez les paragraphes par une LIGNE VIDE (Entrée x2)."
          error={fieldErrors?.story}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm uppercase tracking-wider text-muted">
          Résultats chiffrés (optionnel)
        </legend>
        <p className="text-xs text-muted">
          Chiffres clés affichés en grand sur la fiche. Ex : la valeur «&nbsp;3 à
          4&nbsp;°C&nbsp;» avec la légende «&nbsp;vs classes témoins, en pic
          chaleur&nbsp;».
        </p>

        {results.length > 0 && (
          <ul className="space-y-3">
            {results.map((r, i) => (
              <li key={i} className="rounded border border-line/40 bg-bg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted">
                    Résultat {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setResults((rs) => rs.filter((_, j) => j !== i))}
                    className="py-1 text-xs text-red-600 underline hover:opacity-80"
                  >
                    Retirer
                  </button>
                </div>
                <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_2fr]">
                  <label className="block">
                    <span className="text-xs text-muted">Valeur</span>
                    <input
                      name={`results[${i}][value]`}
                      value={r.value}
                      onChange={(e) => updateResult(i, "value", e.target.value)}
                      placeholder="3 à 4 °C"
                      maxLength={32}
                      className="mt-1 block w-full border-b border-line/80 bg-transparent py-2 outline-none focus:border-ink"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-muted">Légende</span>
                    <input
                      name={`results[${i}][label]`}
                      value={r.label}
                      onChange={(e) => updateResult(i, "label", e.target.value)}
                      placeholder="vs classes témoins, en pic chaleur"
                      maxLength={120}
                      className="mt-1 block w-full border-b border-line/80 bg-transparent py-2 outline-none focus:border-ink"
                    />
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setResults((rs) => [...rs, { value: "", label: "" }])}
          className="rounded border border-line/60 px-3 py-2 text-xs font-medium transition-colors hover:border-ink"
        >
          + Ajouter un résultat
        </button>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm uppercase tracking-wider text-muted">
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

      <fieldset className="space-y-4">
        <legend className="text-sm uppercase tracking-wider text-muted">
          Galerie photo (optionnel)
        </legend>
        <p className="text-xs text-muted">
          Photos additionnelles du chantier. Affichées en grille sous l&apos;image
          principale sur la fiche publique.
        </p>
        <GalleryManager initial={initial?.gallery ?? []} slug={slugValue} />
        {fieldErrors?.gallery && (
          <p className="text-xs text-red-600">{fieldErrors.gallery.join(", ")}</p>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-sm uppercase tracking-wider text-muted">
          Vidéo du chantier (optionnel)
        </legend>
        <TextField
          name="videoUrl"
          label="URL vidéo"
          type="url"
          defaultValue={initial?.videoUrl ?? ""}
          placeholder="https://www.youtube.com/watch?v=… ou https://…/chantier.mp4"
          hint="YouTube, Vimeo, ou URL directe .mp4 (ex: fichier hébergé sur Vercel Blob)."
          error={fieldErrors?.videoUrl}
          maxLength={500}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm uppercase tracking-wider text-muted">
          Logo client (optionnel)
        </legend>
        <LogoUpload initialUrl={initial?.logo ?? ""} slug={slugValue} />
        {fieldErrors?.logo && (
          <p className="text-xs text-red-600">{fieldErrors.logo.join(", ")}</p>
        )}
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
  const hasError = !!error?.length;
  const errorId = hasError ? `${name}-error` : undefined;
  const hintId = hint ? `${name}-hint` : undefined;
  return (
    <label className="block">
      <span className="text-sm uppercase tracking-wider text-muted">
        {label}
        {props.required && " *"}
      </span>
      <input
        name={name}
        aria-invalid={hasError || undefined}
        aria-describedby={errorId ?? hintId}
        className="mt-2 block w-full border-b border-line/80 bg-transparent py-3 outline-none transition-colors focus:border-ink"
        {...props}
      />
      {hint && !hasError && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {hasError && (
        <span id={errorId}>
          {error!.map((e) => (
            <p key={e} className="mt-1 text-xs text-red-600">
              {e}
            </p>
          ))}
        </span>
      )}
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
  const hasError = !!error?.length;
  const errorId = hasError ? `${name}-error` : undefined;
  const hintId = hint ? `${name}-hint` : undefined;
  return (
    <label className="block">
      <span className="text-sm uppercase tracking-wider text-muted">
        {label}
        {props.required && " *"}
      </span>
      <textarea
        name={name}
        aria-invalid={hasError || undefined}
        aria-describedby={errorId ?? hintId}
        className="mt-2 block w-full resize-y border border-line/60 bg-transparent p-3 outline-none transition-colors focus:border-ink"
        {...props}
      />
      {hint && !hasError && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {hasError && (
        <span id={errorId}>
          {error!.map((e) => (
            <p key={e} className="mt-1 text-xs text-red-600">
              {e}
            </p>
          ))}
        </span>
      )}
    </label>
  );
}

type SelectFieldProps = {
  name: string;
  label: string;
  options: readonly string[];
  labels?: Record<string, string>;
  error?: string[];
} & React.SelectHTMLAttributes<HTMLSelectElement>;

function SelectField({
  name,
  label,
  options,
  labels,
  error,
  ...props
}: SelectFieldProps) {
  const hasError = !!error?.length;
  const errorId = hasError ? `${name}-error` : undefined;
  return (
    <label className="block">
      <span className="text-sm uppercase tracking-wider text-muted">
        {label}
        {props.required && " *"}
      </span>
      <select
        name={name}
        aria-invalid={hasError || undefined}
        aria-describedby={errorId}
        className="mt-2 block w-full border-b border-line/80 bg-transparent py-3 outline-none transition-colors focus:border-ink"
        {...props}
      >
        <option value="" disabled>
          —
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? o}
          </option>
        ))}
      </select>
      {hasError && (
        <span id={errorId}>
          {error!.map((e) => (
            <p key={e} className="mt-1 text-xs text-red-600">
              {e}
            </p>
          ))}
        </span>
      )}
    </label>
  );
}

// --- Champs numériques avec unité ----------------------------------------
// L'admin ne saisit que le nombre ; l'unité est gérée (suffixe fixe ou
// sélecteur). La valeur stockée reste au même format texte qu'avant
// ("2 700 m²", "3 semaines") → aucun impact sur la fiche publique ni la DB.

function parseSurface(value: string): string {
  return value.replace(/\s*m(²|2)\s*$/i, "").trim();
}

function SurfaceField({ initialValue }: { initialValue?: string | null }) {
  const [val, setVal] = useState(parseSurface(initialValue ?? ""));
  const composed = val.trim() ? `${val.trim()} m²` : "";
  return (
    <div>
      <span className="text-sm uppercase tracking-wider text-muted">Surface</span>
      <div className="mt-2 flex items-center border-b border-line/80 transition-colors focus-within:border-ink">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          inputMode="numeric"
          maxLength={28}
          aria-label="Surface, en mètres carrés"
          placeholder="2 700"
          className="w-full bg-transparent py-3 outline-none"
        />
        <span aria-hidden className="shrink-0 pl-2 text-sm text-muted">
          m²
        </span>
      </div>
      <input type="hidden" name="surface" value={composed} />
    </div>
  );
}

const DURATION_UNITS = ["jours", "semaines", "mois"] as const;

// Accord singulier/pluriel pour respecter le format existant
// ("1 semaine" vs "3 semaines" ; "mois" est invariable).
function durationWord(unit: string, n: number): string {
  if (unit === "mois") return "mois";
  return n === 1 ? unit.replace(/s$/, "") : unit;
}

function parseDuration(value: string): { num: string; unit: string } {
  const m = /^\s*(\d+)\s*(jours?|semaines?|mois)?\s*$/i.exec(value);
  if (!m) return { num: value.trim(), unit: "semaines" };
  const raw = (m[2] ?? "").toLowerCase();
  const unit = raw.startsWith("jour")
    ? "jours"
    : raw === "mois"
      ? "mois"
      : "semaines";
  return { num: m[1] ?? "", unit };
}

function DurationField({
  initialValue,
  error,
}: {
  initialValue?: string | null;
  error?: string[];
}) {
  const parsed = parseDuration(initialValue ?? "");
  const [num, setNum] = useState(parsed.num);
  const [unit, setUnit] = useState(parsed.unit);
  const n = Number.parseInt(num, 10);
  const composed = num.trim() ? `${num.trim()} ${durationWord(unit, n)}` : "";
  const hasError = !!error?.length;
  const errorId = hasError ? "duration-error" : undefined;
  return (
    <div>
      <span className="text-sm uppercase tracking-wider text-muted">Durée chantier *</span>
      <div className="mt-2 flex items-center gap-2">
        <input
          value={num}
          onChange={(e) => setNum(e.target.value)}
          inputMode="numeric"
          required
          aria-invalid={hasError || undefined}
          aria-describedby={errorId}
          aria-label="Durée du chantier (nombre)"
          placeholder="3"
          className="w-20 border-b border-line/80 bg-transparent py-3 outline-none transition-colors focus:border-ink"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          aria-label="Unité de durée"
          className="border-b border-line/80 bg-transparent py-3 outline-none transition-colors focus:border-ink"
        >
          {DURATION_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      <input type="hidden" name="duration" value={composed} />
      {composed && (
        <p className="mt-1 text-xs text-muted">Enregistré : « {composed} »</p>
      )}
      {hasError && (
        <span id={errorId}>
          {error!.map((e) => (
            <p key={e} className="mt-1 text-xs text-red-600">
              {e}
            </p>
          ))}
        </span>
      )}
    </div>
  );
}
