"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
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
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-16",
          "transition-[background-color,backdrop-filter,border-color,color] duration-[240ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          scrolled
            ? "border-b border-line/50 bg-bg/80 text-ink backdrop-blur-xl"
            : "border-b border-transparent bg-transparent text-ink"
        )}
        style={
          scrolled
            ? { backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }
            : undefined
        }
      >
        <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between px-6 sm:px-10 lg:px-20">
          <Link
            href="#top"
            aria-label="Azur Cover - retour à l'accueil"
            className="font-mono text-[14px] font-semibold uppercase tracking-[0.18em]"
          >
            Azur <span className="opacity-60">Cover</span>
          </Link>

          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-8 lg:flex"
          >
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-opacity duration-200",
                  scrolled ? "text-ink/75 hover:text-ink" : "text-ink/75 hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              {scrolled ? (
                <Button href="#contact" arrow>
                  Demander un audit
                </Button>
              ) : (
                <Link
                  href="#contact"
                  data-cursor="hover"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-ink/30 px-5 text-sm font-medium text-ink transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px hover:border-ink hover:bg-ink/5"
                >
                  Demander un audit
                </Link>
              )}
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
