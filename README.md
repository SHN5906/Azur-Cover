# Azur Cover — Site v2

Refonte complète **azurcover.com**, posture industrielle premium.
Stack : **Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 · GSAP MotionPath · Swiper**.

---

## Démarrage

```bash
pnpm install
bash scripts/download-assets.sh   # rapatrie images + vidéo depuis Wix CDN
pnpm dev                          # http://localhost:3000
pnpm build                        # build production (Turbopack)
pnpm start                        # serveur production local
pnpm lint
```

Node ≥ 20 requis. macOS recommandé pour `sips` (le script down-sample les images > 2 Mo automatiquement). À défaut, le script reste fonctionnel mais laisse les originaux.

---

## Architecture

```
src/
├── app/
│   ├── layout.tsx            # fonts locales + metadata + JSON-LD LocalBusiness
│   ├── page.tsx              # composition des 10 sections
│   ├── opengraph-image.tsx   # OG image dynamique 1200×630
│   └── globals.css           # design tokens (Tailwind v4 @theme)
├── components/
│   ├── layout/               # Header, Footer, MobileDrawer
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── ClientsMarquee.tsx
│   │   ├── Proposition.tsx
│   │   ├── SolutionsCarousel.tsx     # ⭐ pseudo-3D GSAP MotionPath (desktop)
│   │   ├── SolutionsMobile.tsx       # fallback Swiper (< 768px)
│   │   ├── VideoSection.tsx
│   │   ├── Sectors.tsx
│   │   ├── Realisations.tsx          # split sticky + carrousel débordant
│   │   ├── Methodology.tsx
│   │   └── Contact.tsx
│   ├── ui/                   # Button, Container, Eyebrow
│   └── motion/               # ScrollReveal, BgHolder, CustomCursor
├── content/                  # données 100 % éditables sans toucher au code
│   ├── site.ts               # email, téléphones, adresse, navigation
│   ├── solutions.ts          # 4 solutions + bullets + image
│   ├── clients.ts            # 13 logos clients
│   ├── sectors.ts            # Industrie / Tertiaire / Collectivités
│   ├── realisations.ts       # carrousel projets
│   └── methodology.ts        # 4 étapes 01-04
├── lib/utils.ts
└── scripts/
    └── download-assets.sh    # idempotent, run once
```

### Comment éditer le contenu

| Quoi                          | Où                              |
| ----------------------------- | ------------------------------- |
| Email, téléphones, adresse, nav | `src/content/site.ts`         |
| Onglets du carrousel central  | `src/content/solutions.ts`      |
| Logos clients (marquee)       | `src/content/clients.ts`        |
| Cards Secteurs                | `src/content/sectors.ts`        |
| Galerie Réalisations          | `src/content/realisations.ts`   |
| Étapes méthodologie           | `src/content/methodology.ts`    |
| Méta SEO + JSON-LD            | `src/app/layout.tsx`            |

### Comment remplacer une image

1. Dépose le nouveau fichier dans `public/images/<dossier>/`
2. Met à jour le chemin dans le fichier de contenu correspondant
3. `next/image` re-génère AVIF/WebP au build

---

## Direction artistique

### Palette (5 tokens)

| Token            | Valeur     | Usage                           |
| ---------------- | ---------- | ------------------------------- |
| `--color-ink`    | `#0a0a0b`  | Texte principal                 |
| `--color-graphite` | `#1d1d1f` | Sections sombres + footer      |
| `--color-muted`  | `#6e6e73`  | Texte secondaire                |
| `--color-line`   | `#d2d2d7`  | Bordures fines                  |
| `--color-bg`     | `#fbfbfd`  | Fond clair                      |
| `--color-azur`   | `#00a6a6`  | Accent unique (3 occurrences max / viewport) |

### Typographie (UNE famille)

- **Inter Variable** (locale, `public/fonts/InterVariable.woff2`) — weight 100→900 + italic
- **JetBrains Mono** (locale) — pour les labels/eyebrows

Aucune Google Fonts en runtime. Tout est self-hosté.

### Animations

- Easing global : `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- Durations : 600-800 ms entrée, 200-300 ms micro
- Scroll reveals : IntersectionObserver natif (pas de lib externe)
- Carrousel solutions desktop : **GSAP 3.15 + MotionPathPlugin** (gratuit), 4 planètes le long d'une courbe SVG, scale/blur/z-index dynamiques par slot, autoplay 7 s, contrôles clavier ←/→
- Carrousel solutions mobile + carrousel réalisations : **Swiper 12** (modules A11y + Keyboard)
- `prefers-reduced-motion` désactive l'autoplay et raccourcit les transitions

---

## Vidéo

`public/video/` contient :

- `azur-cover-presentation.mp4` (1080p source, 21 Mo)
- `azur-cover-presentation-720p.mp4` (720p mobile, 6,4 Mo)
- `azur-cover-poster.jpg` (frame à 3 s)

Pour ré-encoder :

```bash
ffmpeg -i public/video/azur-cover-presentation.mp4 \
  -vf scale=-2:720 -c:v libx264 -crf 23 -preset slow \
  -c:a aac -b:a 128k public/video/azur-cover-presentation-720p.mp4
```

---

## Déploiement Vercel

```bash
pnpm dlx vercel        # preview
pnpm dlx vercel --prod # production
```

Aucune variable d'environnement requise. Le build cible Lighthouse ≥ 95 desktop / ≥ 90 mobile.

---

## Accessibilité

- Lang `fr`, skip link, focus visible global, contraste WCAG AA
- Carrousel solutions : `role=tablist` / `role=tab` / `aria-selected` + clavier ←/→
- `prefers-reduced-motion` respecté partout
- Marquee logos désactivé sur mobile (grille statique)
- Tap targets ≥ 44 px

---

## Limites connues / à valider

- **Numéro téléphone affiché** : récupéré via le brief (`+33 6 99 52 23 20` / `+33 6 59 88 76 35`). Vérifier qu'ils sont à jour côté client.
- **SIRET et année de fondation** dans le hero : valeurs placeholders confirmables (`SIRET 814 339 217 00027`, `Depuis 2015`). À ajuster dans `src/content/site.ts` (`trust.siret`, `trust.since`).
- **Mapping images ↔ solutions** : fait à partir des alts/noms des fichiers Wix. Si une photo ne correspond pas à la solution affichée, swap libre dans `src/content/solutions.ts`.
- **Pages secondaires** (Qui sommes-nous, Réalisations détaillées, etc.) : non créées — tout vit sur la landing comme spécifié.
- **CMS / cookie banner / analytics** : aucun par défaut, à brancher si besoin.

---

Site conçu par Renew Editing.
