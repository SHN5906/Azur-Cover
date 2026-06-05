"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { MobileDrawer } from "./MobileDrawer";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        id="top"
        data-scrolled={scrolled}
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-16",
          // border + backdrop-filter are ALWAYS present (transparent at top, visible
          // when scrolled). This prevents any 1px / blur layout shift when the
          // threshold is crossed.
          "border-b border-transparent transition-[background-color,border-color] duration-[240ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          scrolled
            ? "border-line/50 bg-bg/85 text-ink"
            : "bg-transparent text-ink"
        )}
        style={{
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        }}
      >
        <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between px-6 sm:px-10 lg:px-20">
          <Link
            href="/"
            aria-label="Azur Cover - retour à l'accueil"
            className="block"
          >
            <div className="relative h-9 w-[78px] md:h-10 md:w-[87px]">
              <Image
                src="/images/brand/logo.png"
                alt="Azur Cover"
                fill
                priority
                sizes="120px"
                className="object-contain"
              />
            </div>
          </Link>

          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-8 lg:flex"
          >
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink/75 transition-opacity duration-200 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(new Event("open-command-palette"));
              }}
              aria-label="Rechercher sur le site"
              title="Rechercher (⌘K / Ctrl K)"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink transition-colors hover:bg-ink/5"
            >
              <Search className="h-5 w-5" aria-hidden />
            </button>
            <div className="hidden lg:block">
              {/* Always render the Button to keep a stable width — nav items
                  ne décalent plus au scroll. Le visuel s'adapte : transparent
                  en haut, rempli quand scrolled. */}
              <Button
                href="/contact"
                arrow
                className={cn(
                  "transition-[background-color,color,box-shadow] duration-[240ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                  !scrolled &&
                    "!bg-transparent !text-ink !shadow-none hover:!bg-ink/5 hover:!translate-y-0 hover:!shadow-none",
                )}
              >
                Demander un audit
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Ouvrir le menu"
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors lg:hidden",
                "text-ink hover:bg-ink/5"
              )}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
