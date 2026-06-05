"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { expertises } from "@/content/expertises";

type Command = {
  id: string;
  label: string;
  hint?: string;
  group: "Pages" | "Expertises" | "Action";
  href?: string;
  action?: () => void;
};

const PAGES: Command[] = [
  { id: "home", label: "Accueil", group: "Pages", href: "/" },
  { id: "expertises", label: "Nos expertises", group: "Pages", href: "/expertises" },
  { id: "realisations", label: "Réalisations", group: "Pages", href: "/realisations" },
  { id: "qui", label: "Qui sommes-nous", group: "Pages", href: "/qui-sommes-nous" },
  { id: "presse", label: "Presse", group: "Pages", href: "/presse" },
  { id: "faq", label: "FAQ", group: "Pages", href: "/faq" },
  { id: "contact", label: "Contact", group: "Pages", href: "/contact" },
  { id: "legal", label: "Mentions légales", group: "Pages", href: "/mentions-legales" },
  { id: "privacy", label: "Confidentialité", group: "Pages", href: "/confidentialite" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const commands: Command[] = useMemo(
    () => [
      ...PAGES,
      ...expertises.map<Command>((e) => ({
        id: `exp-${e.slug}`,
        label: e.title,
        hint: e.index,
        group: "Expertises",
        href: `/expertises/${e.slug}`,
      })),
      {
        id: "audit",
        label: "Demander un audit gratuit",
        group: "Action",
        hint: "→ /contact",
        href: "/contact",
      },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      [c.label, c.hint ?? "", c.group].some((s) => s.toLowerCase().includes(q)),
    );
  }, [query, commands]);

  // Global hotkey ⌘+K / Ctrl+K. Reset state ON OPEN dans le même
  // handler (évite setState-in-effect, plus prévisible).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        setOpen((wasOpen) => {
          if (!wasOpen) {
            setQuery("");
            setActiveIdx(0);
          }
          return !wasOpen;
        });
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Ouverture via un événement global : permet à un déclencheur visible
  // (bouton "Rechercher" du header / drawer) d'ouvrir la palette, pas
  // seulement le raccourci ⌘K qui n'est ni découvrable ni tactile.
  useEffect(() => {
    const openHandler = () => {
      // Lock scroll immédiatement (pas dans le useEffect open, qui arrive
      // après le render) pour éviter un flash de scroll vers une ancre.
      document.documentElement.style.overflow = "hidden";
      setQuery("");
      setActiveIdx(0);
      setOpen(true);
    };
    window.addEventListener("open-command-palette", openHandler);
    return () => window.removeEventListener("open-command-palette", openHandler);
  }, []);

  // Focus input + scroll lock à l'ouverture, restauration du focus sur le
  // déclencheur à la fermeture (WCAG 2.4.3).
  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.documentElement.style.overflow = "";
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open]);

  // Garde l'option active visible pendant la navigation au clavier.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open, query]);

  // Arrow keys + Enter + focus-trap (Tab) inside the modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIdx];
      if (cmd) runCommand(cmd);
    } else if (e.key === "Tab") {
      // Seul l'input est focusable (les options sont pilotées via
      // aria-activedescendant) — on garde le focus dans la palette.
      e.preventDefault();
    }
  };

  const runCommand = (cmd: Command) => {
    setOpen(false);
    if (cmd.href) {
      router.push(cmd.href);
    } else if (cmd.action) {
      cmd.action();
    }
  };

  if (!open) return null;

  // Group filtered commands by their group label, in display order
  const groupOrder: Command["group"][] = ["Pages", "Expertises", "Action"];
  const grouped = groupOrder
    .map((g) => ({ group: g, items: filtered.filter((c) => c.group === g) }))
    .filter((g) => g.items.length > 0);

  // Flat index map for keyboard nav (matches filtered order)
  let runningIdx = -1;
  const activeId = filtered[activeIdx]
    ? `cmd-opt-${filtered[activeIdx].id}`
    : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Palette de commande"
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm command-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        className="command-panel w-full max-w-[600px] overflow-hidden rounded-xl border border-line/60 bg-bg shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="flex items-center gap-3 border-b border-line/60 px-5 py-4">
          <span aria-hidden className="text-muted">
            ⌘
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded
            aria-controls="command-listbox"
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Naviguer, chercher une page…"
            aria-label="Rechercher dans le site"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-ink outline-none placeholder:text-muted"
            style={{ fontSize: "1rem" }}
          />
          <kbd className="hidden font-mono text-[10px] uppercase tracking-wider text-muted sm:inline-block">
            Esc
          </kbd>
        </div>

        <ul
          ref={listRef}
          id="command-listbox"
          role="listbox"
          aria-label="Résultats de recherche"
          className="max-h-[60vh] overflow-y-auto py-2"
        >
          {grouped.length === 0 ? (
            <li className="px-5 py-6 text-sm text-muted">Aucun résultat.</li>
          ) : (
            grouped.map(({ group, items }) => (
              <li key={group} role="group" aria-label={group} className="py-1">
                <div
                  aria-hidden
                  className="px-5 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted"
                >
                  {group}
                </div>
                <ul role="presentation">
                  {items.map((c) => {
                    runningIdx++;
                    const isActive = runningIdx === activeIdx;
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          id={`cmd-opt-${c.id}`}
                          role="option"
                          aria-selected={isActive}
                          tabIndex={-1}
                          onClick={() => runCommand(c)}
                          onMouseEnter={() => setActiveIdx(runningIdx)}
                          className={`flex w-full items-center justify-between gap-4 px-5 py-2.5 text-left text-sm transition-colors ${
                            isActive
                              ? "bg-azur/10 text-ink"
                              : "text-ink/80 hover:bg-line/30"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            {isActive && (
                              <span aria-hidden className="h-1 w-1 rounded-full bg-azur" />
                            )}
                            <span className={isActive ? "ml-0" : "ml-4"}>{c.label}</span>
                          </span>
                          {c.hint && (
                            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                              {c.hint}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center justify-between gap-4 border-t border-line/60 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          <span>
            <kbd>↑↓</kbd> naviguer · <kbd>↵</kbd> ouvrir
          </span>
          <span>Azur Cover</span>
        </div>
      </div>

      <style>{`
        .command-overlay { animation: cmd-fade-in 180ms cubic-bezier(0.16,1,0.3,1) forwards; }
        .command-panel  { animation: cmd-rise-in 220ms cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes cmd-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cmd-rise-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .command-overlay, .command-panel { animation: none; }
        }
      `}</style>
    </div>
  );
}
