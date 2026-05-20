"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/content/site";

type Props = { open: boolean; onClose: () => void };

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileDrawer({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Remember the trigger so we can restore focus on close
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    // Move focus inside the dialog
    const dialog = dialogRef.current;
    const focusables = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE);
    focusables?.[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Focus trap
      if (e.key === "Tab" && dialog) {
        const items = Array.from(
          dialog.querySelectorAll<HTMLElement>(FOCUSABLE)
        ).filter((el) => !el.hasAttribute("disabled"));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      // Restore focus to the trigger
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navigation"
      aria-hidden={!open}
      data-state={open ? "open" : "closed"}
      className={cn(
        "drawer fixed inset-0 z-[70] flex flex-col bg-bg",
        open ? "visible opacity-100" : "invisible opacity-0"
      )}
    >
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/" onClick={onClose} aria-label="Azur Cover - accueil">
          <div className="relative h-9 w-[78px]">
            <Image
              src="/images/brand/logo.png"
              alt="Azur Cover"
              fill
              sizes="120px"
              className="object-contain"
            />
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-ink/5"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <nav
        aria-label="Navigation mobile"
        className="flex flex-1 flex-col justify-center px-6 pb-20"
      >
        <ul className="flex flex-col gap-2">
          {site.nav.map((item, i) => (
            <li
              key={item.href}
              className="drawer-item"
              style={{ ["--i" as string]: i }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className="block py-3 text-[2rem] font-medium leading-tight text-ink"
                style={{ letterSpacing: "-0.02em" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div
          className="drawer-item mt-12"
          style={{ ["--i" as string]: site.nav.length }}
        >
          <Link
            href="/contact"
            onClick={onClose}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink px-7 text-sm font-medium text-white"
          >
            Demander un audit <span aria-hidden>→</span>
          </Link>

          <p className="mt-10 font-mono text-[13px] uppercase tracking-[0.18em] text-muted">
            {site.address.full}
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-2 block text-sm text-ink/80 hover:text-ink"
          >
            {site.email}
          </a>
        </div>
      </nav>

      <style>{`
        .drawer { transition: opacity 240ms cubic-bezier(0.16,1,0.3,1), visibility 240ms; }
        .drawer-item {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 360ms cubic-bezier(0.16,1,0.3,1), transform 360ms cubic-bezier(0.16,1,0.3,1);
          transition-delay: 0ms;
        }
        .drawer[data-state="open"] .drawer-item {
          opacity: 1;
          transform: translateY(0);
          transition-delay: calc(80ms + var(--i, 0) * 60ms);
        }
        @media (prefers-reduced-motion: reduce) {
          .drawer, .drawer-item { transition: opacity 0.01ms !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}
