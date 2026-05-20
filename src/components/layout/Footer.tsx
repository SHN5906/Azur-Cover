import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { expertises } from "@/content/expertises";
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

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-graphite text-white/80">
      <Container size="default" className="py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-block" aria-label="Azur Cover - accueil">
              <div className="relative h-11 w-[96px]">
                <Image
                  src="/images/brand/logo-white.png"
                  alt="Azur Cover"
                  fill
                  sizes="120px"
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="mt-5 max-w-[260px] text-sm font-medium leading-snug text-white/75">
              La solution thermique qui réfléchit.
            </p>
            <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-white/55">
              Expert national en performance thermique et étanchéité.
            </p>
            {(site.social.instagram || site.social.facebook || site.social.linkedin) && (
              <div className="mt-6 flex gap-3">
                {site.social.instagram && (
                  <a
                    href={site.social.instagram}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Instagram"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
                  >
                    <InstagramIcon className="h-4 w-4" />
                  </a>
                )}
                {site.social.facebook && (
                  <a
                    href={site.social.facebook}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Facebook"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
                  >
                    <FacebookIcon className="h-4 w-4" />
                  </a>
                )}
                {site.social.linkedin && (
                  <a
                    href={site.social.linkedin}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="LinkedIn"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
                  >
                    <LinkedinIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-mono text-[13px] uppercase tracking-[0.18em] text-white/55">
              Expertises
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {expertises.map((s) => (
                <li key={s.slug}>
                  <Link href={`/expertises/${s.slug}`} className="text-white/70 hover:text-white">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[13px] uppercase tracking-[0.18em] text-white/55">
              Entreprise
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li>
                <Link href="/qui-sommes-nous" className="text-white/70 hover:text-white">
                  Qui sommes-nous
                </Link>
              </li>
              <li>
                <Link href="/realisations" className="text-white/70 hover:text-white">
                  Réalisations
                </Link>
              </li>
              <li>
                <Link href="/presse" className="text-white/70 hover:text-white">
                  Presse
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/70 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[13px] uppercase tracking-[0.18em] text-white/55">
              Contact
            </h3>
            <address className="mt-5 not-italic text-sm leading-relaxed text-white/70">
              {site.address.building}
              <br />
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

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 font-mono text-[13px] uppercase tracking-[0.15em] text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Azur Cover. Tous droits réservés.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/mentions-legales" className="hover:text-white/70">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-white/70">Confidentialité</Link>
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-[12px] uppercase tracking-[0.18em] text-white/25">
          Site conçu par Renew Editing
        </p>
      </Container>
    </footer>
  );
}
