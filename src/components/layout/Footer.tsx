import Link from "next/link";
import { site } from "@/content/site";
import { solutions } from "@/content/solutions";
import { Container } from "@/components/ui/Container";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.32 6.39a5.42 5.42 0 0 1-3.18-1.02V15.5a5.5 5.5 0 1 1-5.5-5.5c.31 0 .61.03.9.08v2.84a2.66 2.66 0 1 0 1.85 2.58V2h2.75a5.42 5.42 0 0 0 3.18 4.39v.0z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-graphite text-white/80">
      <Container size="default" className="py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="#top"
              className="font-mono text-[14px] font-semibold uppercase tracking-[0.18em] text-white"
            >
              Azur Cover
            </Link>
            <p className="mt-5 max-w-[260px] text-sm leading-relaxed text-white/55">
              Expert national en performance thermique et étanchéité.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={site.social.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a
                href={site.social.tiktok}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="TikTok"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
              >
                <TiktokIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-[12px] uppercase tracking-[0.18em] text-white/55">
              Expertises
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {solutions.map((s) => (
                <li key={s.id}>
                  <Link href="#solutions" className="text-white/70 hover:text-white">
                    {s.title.replace(/\.$/, "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[12px] uppercase tracking-[0.18em] text-white/55">
              Entreprise
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li>
                <Link href="#methodologie" className="text-white/70 hover:text-white">
                  Qui sommes-nous
                </Link>
              </li>
              <li>
                <Link href="#realisations" className="text-white/70 hover:text-white">
                  Réalisations
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-white/70 hover:text-white">
                  Presse
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-white/70 hover:text-white">
                  Carrières
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[12px] uppercase tracking-[0.18em] text-white/55">
              Contact
            </h3>
            <address className="mt-5 not-italic text-sm leading-relaxed text-white/70">
              {site.address.street}
              <br />
              {site.address.postal} {site.address.city}, {site.address.country}
            </address>
            <ul className="mt-3 space-y-1 text-sm">
              {site.phones.map((p) => (
                <li key={p}>
                  <a
                    href={`tel:${p.replace(/\s/g, "")}`}
                    className="text-white/70 hover:text-white"
                  >
                    {p}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="text-white/70 hover:text-white"
                >
                  {site.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Azur Cover. Tous droits réservés.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="#" className="hover:text-white/70">Mentions légales</Link>
            <Link href="#" className="hover:text-white/70">CGV</Link>
            <Link href="#" className="hover:text-white/70">Confidentialité</Link>
            <Link href="#" className="hover:text-white/70">Cookies</Link>
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/25">
          Site conçu par Renew Editing
        </p>
      </Container>
    </footer>
  );
}
