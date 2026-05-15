"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/content/site";

type Props = { open: boolean; onClose: () => void };

export function MobileDrawer({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
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
        <span className="font-mono text-[14px] font-semibold uppercase tracking-[0.18em]">
          Azur <span className="opacity-60">Cover</span>
        </span>
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

          <p className="mt-10 font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
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
