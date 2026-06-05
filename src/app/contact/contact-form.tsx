"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Après un envoi réussi, on revient à l'état initial pour autoriser une
  // nouvelle demande (sinon le bouton resterait désactivé indéfiniment).
  useEffect(() => {
    if (status !== "sent") return;
    const t = window.setTimeout(() => setStatus("idle"), 6000);
    return () => window.clearTimeout(t);
  }, [status]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      company: String(fd.get("company") ?? ""),
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      city: String(fd.get("city") ?? ""),
      project: String(fd.get("project") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""), // honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(
          (typeof data?.error === "string" && data.error) ||
            "Échec de l’envoi. Réessayez ou écrivez-nous directement."
        );
        return;
      }
      setStatus("sent");
      // Reset the form after success
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
      setErrorMsg("Erreur réseau. Vérifiez votre connexion et réessayez.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="lg:col-span-7">
      <Eyebrow>Demande d’audit</Eyebrow>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Entreprise" name="company" autoComplete="organization" required />
        <Field label="Nom & prénom" name="name" autoComplete="name" spellCheck={false} required />
        <Field label="Email" name="email" type="email" autoComplete="email" spellCheck={false} required />
        <Field label="Téléphone" name="phone" type="tel" autoComplete="tel" />
        <Field label="Ville du bâtiment" name="city" autoComplete="address-level2" full />
        <Select
          label="Type de projet"
          name="project"
          full
          options={[
            "Cool Roofing toiture",
            "Azur Reflect vitrages",
            "Étanchéité",
            "Désamiantage / Laque Solaire",
            "Autre / Je ne sais pas encore",
          ]}
        />
        <Textarea
          label="Décrivez votre besoin"
          name="message"
          required
          placeholder="Surface approximative, contraintes, planning souhaité…"
        />

        {/* Honeypot — hidden field, real users never fill it. Bots do. */}
        <label
          aria-hidden
          className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
          tabIndex={-1}
        >
          Site web
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <p className="mt-8 text-xs text-muted">
        En soumettant ce formulaire, vous acceptez que vos données soient
        traitées conformément à notre{" "}
        <a href="/confidentialite" className="underline hover:text-ink">
          politique de confidentialité
        </a>
        .
      </p>

      <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
        <SubmitButton status={status} />
        <p className="text-xs text-muted">
          Vous serez contacté sous 48&nbsp;h.
        </p>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={cn(
          "mt-6 text-sm transition-opacity duration-300",
          status === "idle" || status === "sending"
            ? "opacity-0"
            : "opacity-100"
        )}
      >
        {status === "sent" && (
          <p className="text-ink">
            Demande reçue. Nous revenons vers vous sous 48&nbsp;h.
          </p>
        )}
        {status === "error" && (
          <p className="text-ink">
            {errorMsg} Vous pouvez aussi nous écrire à{" "}
            <a
              href={`mailto:${site.email}`}
              className="font-medium text-azur-deep hover:underline"
            >
              {site.email}
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}

function SubmitButton({ status }: { status: Status }) {
  const isSending = status === "sending";
  const isSent = status === "sent";
  const isError = status === "error";

  return (
    <button
      type="submit"
      disabled={isSending || isSent}
      aria-busy={isSending}
      className={cn(
        "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-lg bg-ink px-7 text-sm font-medium leading-none text-white shadow-sm transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azur focus-visible:ring-offset-4",
        "hover:-translate-y-px hover:bg-graphite hover:shadow-lg active:translate-y-0",
        "disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:bg-ink disabled:hover:shadow-sm",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 bg-azur/40 motion-reduce:transition-none",
          isSending &&
            "w-[92%] transition-[width] duration-[1400ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:w-full",
          isSent && "w-full transition-[width] duration-200",
          !isSending && !isSent && "w-0 transition-[width] duration-300",
        )}
      />
      <span className="relative inline-flex items-center gap-2">
        {isSent ? (
          <>
            <CheckIcon />
            Demande envoyée
          </>
        ) : isSending ? (
          "Envoi…"
        ) : isError ? (
          <>
            Réessayer
            <Arrow />
          </>
        ) : (
          <>
            Envoyer ma demande
            <Arrow />
          </>
        )}
      </span>
    </button>
  );
}

function Arrow() {
  return (
    <span
      aria-hidden
      className="inline-block transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
    >
      →
    </span>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  full?: boolean;
  autoComplete?: string;
  spellCheck?: boolean;
};

function Field({ label, name, type = "text", required, full, autoComplete, spellCheck }: FieldProps) {
  return (
    <label className={full ? "md:col-span-2" : ""}>
      <span className="block font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
        {label}
        {required && " *"}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        className="mt-2 block w-full border-b border-muted/80 bg-transparent py-3 text-ink outline-none transition-colors duration-200 placeholder:text-muted/70 focus-visible:border-ink focus-visible:ring-0"
        style={{ fontSize: "1.0625rem" }}
      />
    </label>
  );
}

function Textarea({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="md:col-span-2">
      <span className="block font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
        {label}
        {required && " *"}
      </span>
      <textarea
        name={name}
        rows={5}
        required={required}
        placeholder={placeholder}
        className="mt-2 block w-full resize-y border-b border-muted/80 bg-transparent py-3 text-ink outline-none transition-colors duration-200 placeholder:text-muted/70 focus-visible:border-ink focus-visible:ring-0"
        style={{ fontSize: "1.0625rem" }}
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  full,
}: {
  label: string;
  name: string;
  options: string[];
  full?: boolean;
}) {
  return (
    <label className={full ? "md:col-span-2" : ""}>
      <span className="block font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <select
        name={name}
        defaultValue=""
        className="mt-2 block w-full border-b border-muted/80 bg-transparent py-3 text-ink outline-none transition-colors duration-200 focus-visible:border-ink focus-visible:ring-0"
        style={{ fontSize: "1.0625rem" }}
      >
        <option value="" disabled>
          Sélectionner…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
