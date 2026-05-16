# CMS Admin Réalisations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner à l'admin une interface `/admin` pour créer, éditer et supprimer les chantiers (réalisations) sans toucher au code, avec upload d'images et publication immédiate via revalidation.

**Architecture:** Next.js 16 App Router avec Server Actions pour les mutations. Données stockées dans Neon Postgres via Drizzle (HTTP driver), images dans Vercel Blob, auth par magic link Auth.js v5 (Resend) avec un seul email autorisé. Route `/admin` protégée par `proxy.ts` (le middleware renommé en Next 16). Le front public bascule sur la DB en gardant le fichier statique comme filet de sécurité jusqu'à validation prod.

**Tech Stack:**
- Next.js 16.2.6 (App Router) + React 19 + TypeScript strict
- Drizzle ORM 0.36+ + `@neondatabase/serverless` (HTTP, Fluid-Compute friendly)
- Auth.js v5 (`next-auth@beta`) + `@auth/drizzle-adapter` + Resend magic link
- `@vercel/blob` pour les images
- Zod pour la validation Server Actions
- Tailwind v4 + composants UI existants (`Button`, `Container`, `Eyebrow`)

> ⚠️ **Next.js 16 — différences clés à connaître avant de coder :**
> - `middleware.ts` n'existe plus → fichier `proxy.ts` à la racine du projet (la fonction s'appelle `proxy`, pas `middleware`).
> - `cookies()` et `headers()` sont **async**, il faut `await`.
> - `cacheComponents` n'est PAS activé sur ce projet — on reste sur le modèle "previous" (`force-cache`, `revalidatePath`, `revalidateTag`).
> - Lire `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` au moindre doute.

---

## Décisions imposées (rappel)

Ces choix sont fixés par le brief utilisateur — ne pas re-débattre :

| Sujet | Choix |
| --- | --- |
| DB | Neon Postgres via Vercel Marketplace (free tier) |
| ORM | Drizzle (driver `neon-http`) |
| Auth | Auth.js v5 (NextAuth) + Resend magic link, un seul admin |
| Storage images | Vercel Blob (`access: 'public'`) |
| UI admin | App Router `/admin`, Server Actions, design system existant |
| Validation | Zod côté serveur sur toutes les Server Actions |
| Périmètre | Pas de roles, pas de WYSIWYG, pas de versioning, pas d'i18n admin |

---

## File structure

### Fichiers créés

```
/proxy.ts                                       # Protection /admin (Next 16: ex-middleware)
/drizzle.config.ts                              # Config Drizzle Kit
/scripts/migrate-realisations.ts                # Import idempotent du fichier statique
/src/auth.ts                                    # Export NextAuth handlers + auth()
/src/db/index.ts                                # getDb() lazy + export schema
/src/db/schema.ts                               # Tables realisations + auth (users/accounts/sessions/verificationTokens)
/src/lib/admin.ts                               # requireAdmin() — DAL: check session + ADMIN_EMAIL
/src/lib/realisations-repo.ts                   # Toutes les queries Drizzle, source unique
/src/lib/validation.ts                          # Schémas Zod réutilisables
/src/app/api/auth/[...nextauth]/route.ts        # Route handler Auth.js
/src/app/admin/layout.tsx                       # Layout admin (header + logout)
/src/app/admin/page.tsx                         # Dashboard admin (vide initial)
/src/app/admin/login/page.tsx                   # Form magic link
/src/app/admin/chantiers/page.tsx               # Liste des chantiers
/src/app/admin/chantiers/new/page.tsx           # Form création
/src/app/admin/chantiers/[slug]/edit/page.tsx   # Form édition
/src/app/admin/chantiers/_components/RealisationForm.tsx
/src/app/admin/chantiers/_components/ImageUpload.tsx
/src/app/admin/_actions/realisations.ts         # Server Actions: create/update/delete
/src/app/admin/_actions/upload.ts               # Server Action: blob upload
/src/app/admin/_actions/auth.ts                 # Server Action: signIn / signOut
/drizzle/                                       # SQL migrations générées par drizzle-kit
```

### Fichiers modifiés

```
/.env.local.example                             # + DATABASE_URL, AUTH_SECRET, AUTH_RESEND_KEY, ADMIN_EMAIL, BLOB_READ_WRITE_TOKEN
/next.config.ts                                 # + images.remotePatterns blob.vercel-storage.com
/package.json                                   # + deps drizzle, next-auth@beta, etc.
/src/app/realisations/page.tsx                  # remplacer import statique par getAllRealisations()
/src/app/realisations/[slug]/page.tsx           # remplacer getRealisation/realisations par queries
```

### Fichier conservé (filet de sécurité Phase 4)

```
/src/content/realisations.ts                    # supprimé seulement APRÈS validation prod
```

---

## Spécification : schéma Drizzle

Table `realisations` 1:1 avec le type TS actuel, avec ajout d'`id`/`createdAt`/`updatedAt` et contraintes :

```ts
// src/db/schema.ts (extrait realisations — auth tables détaillées plus bas)
import { pgTable, text, varchar, timestamp, jsonb, uuid, integer } from "drizzle-orm/pg-core";

export const solutionEnum = ["Étanchéité", "Cool Roofing", "Azur Reflect", "Multi-solutions"] as const;

export const realisations = pgTable("realisations", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  client: varchar("client", { length: 160 }).notNull(),
  city: varchar("city", { length: 96 }).notNull(),
  // Stocké en text + validé via Zod enum côté action
  solution: text("solution").$type<(typeof solutionEnum)[number]>().notNull(),
  surface: varchar("surface", { length: 32 }),
  duration: varchar("duration", { length: 64 }).notNull(),
  year: varchar("year", { length: 8 }).notNull(),
  short: varchar("short", { length: 220 }).notNull(),
  // story = array de paragraphes (jsonb)
  story: jsonb("story").$type<string[]>().notNull().default([]),
  // results = array d'objets { value, label } (jsonb, optionnel)
  results: jsonb("results").$type<{ value: string; label: string }[]>(),
  imageSrc: text("image_src").notNull(),
  imageAlt: varchar("image_alt", { length: 220 }).notNull(),
  logo: text("logo"),
  // Tri stable sur la page index (default = ordre d'insertion)
  sortIndex: integer("sort_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

**Justifications :**
- `uuid` pour PK (vs serial) : pas d'énumération devinable côté URLs admin.
- `slug` unique : contrainte DB + check Zod côté action = double sécurité.
- `story` / `results` en `jsonb` : on garde la structure existante 1:1, pas de table normalisée (YAGNI — pas de recherche full-text sur les paragraphes).
- `solution` en `text` + Zod enum : changer la liste se fait en TypeScript, pas en migration.
- `sortIndex` pour permettre un drag-and-drop futur sans casser l'ordre (default = 0, tri secondaire par `createdAt desc`).

Les tables auth (`users`, `accounts`, `sessions`, `verificationTokens`) suivent strictement le schéma standard de `@auth/drizzle-adapter` — copier le snippet officiel sans le modifier (voir Phase 2, Task 2.2).

---

## Spécification : flow auth

1. Utilisateur va sur `/admin/*` (URL devinable ou bookmark).
2. `proxy.ts` (matcher `/admin/:path*`) lit le cookie de session.
   - **Cookie absent ou invalide → `redirect('/admin/login')`**.
   - Cookie valide → `NextResponse.next()` (la vérification fine `email === ADMIN_EMAIL` se fait côté page/action, voir étape 5).
3. `/admin/login` affiche un `<form>` qui invoque une Server Action `requestMagicLink(email)`.
4. Server Action vérifie que l'email soumis === `process.env.ADMIN_EMAIL` (côté serveur — un email random ne reçoit jamais de lien). Sinon, message "Email non autorisé" sans révéler s'il existe en DB. Si OK : `signIn("resend", { email, redirectTo: "/admin" })`.
5. Auth.js envoie un email magic-link via Resend. Le clic crée une session DB + cookie HttpOnly.
6. Toute page/action sous `/admin` appelle `requireAdmin()` :
   - `const session = await auth()` (cached via React `cache()`).
   - Si pas de session → `redirect('/admin/login')`.
   - Si `session.user.email !== process.env.ADMIN_EMAIL` → `forbidden()` (rend la 403 du file-convention `forbidden.tsx`).
   - Retourne `session.user` pour usage en composant.
7. Logout : Server Action `signOut({ redirectTo: '/' })`.

**Pourquoi `proxy.ts` ET `requireAdmin()` ?**
- Le `proxy.ts` est une protection optimiste (rapide, basée cookie). Il évite que des pages admin s'affichent même brièvement à un visiteur non loggué.
- `requireAdmin()` est la **vraie** garde — Server Actions et Server Components atteignables hors UI, doivent revérifier. Cité par les docs Next.js : "Treat Server Actions with the same security considerations as public-facing API endpoints" (`node_modules/next/dist/docs/01-app/02-guides/authentication.md`).

---

## Spécification : routes admin

| Route | Composant | Garde | Description |
| --- | --- | --- | --- |
| `/admin/login` | `app/admin/login/page.tsx` | aucune | Form magic link |
| `/admin` | `app/admin/page.tsx` | `requireAdmin()` | Landing : "Connecté en tant que X", liens, bouton logout |
| `/admin/chantiers` | `app/admin/chantiers/page.tsx` | `requireAdmin()` | Table des chantiers + bouton "Nouveau" + actions edit/delete |
| `/admin/chantiers/new` | `app/admin/chantiers/new/page.tsx` | `requireAdmin()` | Form vide → `createRealisation` |
| `/admin/chantiers/[slug]/edit` | `app/admin/chantiers/[slug]/edit/page.tsx` | `requireAdmin()` | Form prérempli → `updateRealisation` |

Toutes ces pages sont des **Server Components** sauf le composant `RealisationForm` qui est `"use client"` (besoin de `useActionState` + upload progressif).

---

## Spécification : intégration Vercel Blob

- Upload **côté serveur** (Server Action) pour rester sous 4.5 MB. Au-dessus → client upload, mais les photos de chantier compressées par `next/image` tiennent largement sous cette limite.
- `put(filename, file, { access: "public", addRandomSuffix: true })` — le suffixe random évite les collisions et permet de garder le slug du chantier dans le nom.
- L'URL retournée (`https://<hash>.public.blob.vercel-storage.com/...`) est stockée telle quelle dans `realisations.imageSrc`.
- Suppression d'image quand on remplace ou supprime un chantier : `del(oldUrl)`. Idempotent — pas d'erreur si l'URL n'existe plus.
- `next/image` doit autoriser le domaine : `next.config.ts` → `images.remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }]`.

---

## Variables d'environnement

À ajouter dans `.env.local` (dev) et sur Vercel (prod). Le marketplace en provisionne plusieurs automatiquement.

| Variable | Source | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Auto (Neon Marketplace) | Connection string pooled, format `postgresql://...neon.tech/...?sslmode=require` |
| `BLOB_READ_WRITE_TOKEN` | Auto (Blob Marketplace) | Token serveur, jamais exposé client |
| `AUTH_SECRET` | Manuel — `openssl rand -base64 32` | ≥ 32 chars, ne PAS commit |
| `AUTH_RESEND_KEY` | Manuel (réutilise `RESEND_API_KEY`) | Auth.js cherche `AUTH_RESEND_KEY` par défaut. Aliaser dans `auth.ts` pour réutiliser la clé existante. |
| `ADMIN_EMAIL` | Manuel | Email du seul admin autorisé. Ex: `sohan.benbournane@gmail.com` |
| `RESEND_API_KEY` | Déjà présent | Réutilisé tel quel par le form de contact + alias par `auth.ts` |
| `RESEND_FROM` | Déjà présent | Réutilisé pour l'email magic-link |

Dev local : `vercel env pull .env.local --yes` après provisioning.

---

## Self-review checklist

À cocher avant d'enclencher l'exécution de chaque phase :

- [ ] Les types `Realisation` (TS) et `realisations` (Drizzle) restent en phase (mêmes champs, mêmes optionnels).
- [ ] Aucun usage de `middleware.ts` — uniquement `proxy.ts`.
- [ ] Aucun `import 'server-only'` manquant dans `auth.ts`, `db/index.ts`, `realisations-repo.ts`.
- [ ] `cookies()` et `headers()` sont toujours `await`-ées.
- [ ] Toutes les Server Actions appellent `requireAdmin()` **en premier**.
- [ ] Toutes les Server Actions parsent l'input via Zod **avant** de toucher la DB.
- [ ] Pas de `Proxy` JavaScript autour de `getDb()` (casse Auth.js).
- [ ] `next/image` autorise `*.public.blob.vercel-storage.com`.

---

# PHASE 1 — Foundation & infra

**But :** poser la fondation (deps, schéma DB, config Drizzle, env scaffolding) et provisionner Neon + Blob. À la fin de cette phase, `pnpm drizzle-kit push` doit créer les tables sur Neon. Pas de UI, pas d'auth, pas de mutation.

**PR Phase 1 contient :** le présent plan, le scaffolding Drizzle, les nouvelles deps, le `.env.local.example` mis à jour, le `next.config.ts` patché. Pas de changement visible sur le site public.

### Task 1.1 : Installer le Vercel CLI (action utilisateur)

**Files:** aucun (action manuelle utilisateur)

- [ ] **Step 1 : Vérifier si Vercel CLI est installé**

Run: `vercel --version`
Expected: si `command not found`, passer à l'étape 2.

- [ ] **Step 2 : Installer Vercel CLI globalement**

```bash
npm i -g vercel
```

- [ ] **Step 3 : Login et lier le projet**

```bash
vercel login
vercel link
```

Sélectionner le projet `azur-cover` existant. Crée `.vercel/project.json` (déjà gitignored).

### Task 1.2 : Provisionner Neon Postgres (action utilisateur via CLI)

**Files:** aucun (commande CLI)

- [ ] **Step 1 : Ajouter l'intégration Neon**

```bash
vercel integration add neon
```

Sélectionner le free tier (Hobby). Le CLI peut basculer sur le dashboard pour la finalisation OAuth — terminer dans le navigateur si demandé.

- [ ] **Step 2 : Vérifier que `DATABASE_URL` est provisionnée sur Vercel**

```bash
vercel env ls
```

Expected : `DATABASE_URL` listée pour `development`, `preview`, `production`.

- [ ] **Step 3 : Synchroniser en local**

```bash
vercel env pull .env.local --yes
```

Confirme la présence de `DATABASE_URL=postgresql://...` dans `.env.local`. **Ne pas commit `.env.local`**.

### Task 1.3 : Provisionner Vercel Blob

**Files:** aucun (CLI)

- [ ] **Step 1 : Créer le store Blob**

```bash
vercel blob create azur-cover-realisations
```

(Si la commande n'existe pas dans cette version du CLI, créer via dashboard : Vercel → Storage → Create → Blob, nommer `azur-cover-realisations`, lier au projet `azur-cover`.)

- [ ] **Step 2 : Re-pull les env vars**

```bash
vercel env pull .env.local --yes
```

Vérifier que `BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...` est présent dans `.env.local`.

### Task 1.4 : Générer AUTH_SECRET et configurer ADMIN_EMAIL

**Files:** `.env.local` (non commité), env vars Vercel

- [ ] **Step 1 : Générer un secret**

```bash
openssl rand -base64 32
```

Copier la sortie.

- [ ] **Step 2 : Ajouter les variables sur Vercel (les 3 environnements)**

```bash
vercel env add AUTH_SECRET production
# coller le secret
vercel env add AUTH_SECRET preview
vercel env add AUTH_SECRET development

vercel env add ADMIN_EMAIL production
# entrer l'email admin (ex: sohan.benbournane@gmail.com)
vercel env add ADMIN_EMAIL preview
vercel env add ADMIN_EMAIL development
```

- [ ] **Step 3 : Re-pull en local**

```bash
vercel env pull .env.local --yes
```

### Task 1.5 : Mettre à jour `.env.local.example`

**Files:**
- Modify: `.env.local.example`

- [ ] **Step 1 : Réécrire le fichier**

```bash
# Resend — formulaire de contact + magic link admin
RESEND_API_KEY=
RESEND_FROM="Azur Cover <onboarding@resend.dev>"
RESEND_TO="contact@azur-cover.com"

# Neon Postgres — auto-provisionné par `vercel integration add neon`
DATABASE_URL=

# Vercel Blob — auto-provisionné par le marketplace Blob
BLOB_READ_WRITE_TOKEN=

# Auth.js — secret signé pour les sessions (openssl rand -base64 32)
AUTH_SECRET=

# Email unique autorisé à se connecter à /admin
ADMIN_EMAIL=
```

- [ ] **Step 2 : Commit ce fichier seul (sans la doc)**

```bash
git add .env.local.example
git commit -m "chore(env): document admin/db/blob env vars for CMS"
```

### Task 1.6 : Installer les dépendances

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1 : Installer les deps runtime**

```bash
pnpm add drizzle-orm @neondatabase/serverless @vercel/blob next-auth@beta @auth/drizzle-adapter zod
```

- [ ] **Step 2 : Installer les deps dev**

```bash
pnpm add -D drizzle-kit dotenv-cli tsx
```

- [ ] **Step 3 : Vérifier les versions résolues**

```bash
pnpm list drizzle-orm next-auth @auth/drizzle-adapter @vercel/blob
```

Expected : `drizzle-orm@^0.36`, `next-auth@5.0.0-beta.x`, `@auth/drizzle-adapter@^1.x`, `@vercel/blob@^0.x ou ^1.x`.

### Task 1.7 : Créer le schéma Drizzle complet

**Files:**
- Create: `src/db/schema.ts`

- [ ] **Step 1 : Écrire `src/db/schema.ts`**

```ts
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  uuid,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

// --- Domaine métier ---

export const solutionEnum = [
  "Étanchéité",
  "Cool Roofing",
  "Azur Reflect",
  "Multi-solutions",
] as const;

export type SolutionValue = (typeof solutionEnum)[number];

export const realisations = pgTable("realisations", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  client: varchar("client", { length: 160 }).notNull(),
  city: varchar("city", { length: 96 }).notNull(),
  solution: text("solution").$type<SolutionValue>().notNull(),
  surface: varchar("surface", { length: 32 }),
  duration: varchar("duration", { length: 64 }).notNull(),
  year: varchar("year", { length: 8 }).notNull(),
  short: varchar("short", { length: 220 }).notNull(),
  story: jsonb("story").$type<string[]>().notNull().default([]),
  results: jsonb("results").$type<{ value: string; label: string }[]>(),
  imageSrc: text("image_src").notNull(),
  imageAlt: varchar("image_alt", { length: 220 }).notNull(),
  logo: text("logo"),
  sortIndex: integer("sort_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Tables Auth.js (schéma standard @auth/drizzle-adapter) ---

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date", withTimezone: true }),
  image: text("image"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    pk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (vt) => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
```

### Task 1.8 : Créer la connexion DB (lazy init obligatoire)

**Files:**
- Create: `src/db/index.ts`

- [ ] **Step 1 : Écrire `src/db/index.ts`**

```ts
import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

export { schema };
```

> ⚠️ **Ne PAS wrapper `getDb()` dans un `new Proxy(...)`**. Auth.js inspecte l'adapter DB (vérifie l'existence de méthodes, itère les propriétés). Le Proxy intercepte ces checks et casse silencieusement le flow auth (la requête se hang sans erreur). Référence : skill `vercel:vercel-storage`.

### Task 1.9 : Config Drizzle Kit

**Files:**
- Create: `drizzle.config.ts`

- [ ] **Step 1 : Écrire `drizzle.config.ts`**

```ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
} satisfies Config;
```

### Task 1.10 : Ajouter les scripts npm Drizzle

**Files:**
- Modify: `package.json`

- [ ] **Step 1 : Ajouter aux `scripts`**

Insérer dans la section `scripts` :

```json
"db:generate": "dotenv -e .env.local -- drizzle-kit generate",
"db:push": "dotenv -e .env.local -- drizzle-kit push",
"db:studio": "dotenv -e .env.local -- drizzle-kit studio",
"db:migrate-realisations": "dotenv -e .env.local -- tsx scripts/migrate-realisations.ts"
```

> Pourquoi `dotenv-cli` : `drizzle-kit` et `tsx` ne lisent PAS `.env.local` automatiquement (seul Next.js le fait). Sans wrapper, `DATABASE_URL` est `undefined` au moment du push.

### Task 1.11 : Pousser le schéma vers Neon

**Files:** aucun (commande)

- [ ] **Step 1 : Push initial**

```bash
pnpm db:push
```

Expected : drizzle-kit affiche le diff (création de 5 tables : realisations, users, accounts, sessions, verificationTokens) et l'applique sans erreur.

- [ ] **Step 2 : Vérifier dans Neon**

```bash
pnpm db:studio
```

Expected : interface s'ouvre, les 5 tables sont listées, toutes vides.

### Task 1.12 : Autoriser le domaine Blob dans `next/image`

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1 : Patcher la config**

```ts
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2 : Build pour valider la config**

```bash
pnpm build
```

Expected : build passe sans warning. Aucun comportement visible n'a changé.

### Task 1.13 : Commit Phase 1 + ouvrir la PR

- [ ] **Step 1 : Commit groupé**

```bash
git add docs/superpowers/plans/2026-05-16-cms-admin-realisations.md \
        drizzle.config.ts \
        src/db/ \
        next.config.ts \
        package.json \
        pnpm-lock.yaml
git commit -m "feat(cms): foundation drizzle + neon + blob (phase 1/4)"
```

- [ ] **Step 2 : Push + PR**

```bash
git push -u origin <branch>
gh pr create --title "feat(cms): foundation drizzle + neon + blob (1/4)" --body "..."
```

- [ ] **Step 3 : `/code-review` puis `/verify` avant merge.**

---

# PHASE 2 — Auth + page admin protégée vide

**But :** route `/admin` redirige vers `/admin/login` si non loggué ; magic link Resend ; vérif `email === ADMIN_EMAIL` ; page `/admin` qui affiche "Connecté en tant que X" + bouton logout. Aucun CRUD encore.

### Task 2.1 : Configurer Auth.js v5

**Files:**
- Create: `src/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1 : Écrire `src/auth.ts`**

```ts
import "server-only";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb } from "@/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(getDb()),
  providers: [
    Resend({
      // Alias sur la clé existante du form de contact
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM ?? "Azur Cover <onboarding@resend.dev>",
    }),
  ],
  pages: {
    signIn: "/admin/login",
    verifyRequest: "/admin/login?check=email",
    error: "/admin/login?error=1",
  },
  session: { strategy: "database" },
});
```

- [ ] **Step 2 : Route handler Auth.js**

```ts
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

### Task 2.2 : Créer le `proxy.ts` (ex-middleware)

**Files:**
- Create: `proxy.ts` (à la racine du projet, à côté de `next.config.ts`)

- [ ] **Step 1 : Écrire `proxy.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";

// Cookies de session Auth.js v5 (db strategy)
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // /admin/login est public
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const hasSession = SESSION_COOKIE_NAMES.some((name) =>
    request.cookies.has(name),
  );

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?from=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

> ⚠️ La présence du cookie ≠ session valide en DB. C'est volontaire — check optimiste rapide. La vraie garde est `requireAdmin()` côté page/action (Task 2.3).

### Task 2.3 : Créer le DAL admin

**Files:**
- Create: `src/lib/admin.ts`

- [ ] **Step 1 : Écrire `requireAdmin()`**

```ts
import "server-only";
import { cache } from "react";
import { redirect, forbidden } from "next/navigation";
import { auth } from "@/auth";

export const requireAdmin = cache(async () => {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/admin/login");
  }
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL not configured on server");
  }
  if (session.user.email.toLowerCase() !== adminEmail.toLowerCase()) {
    forbidden();
  }
  return { email: session.user.email, name: session.user.name ?? null };
});
```

- [ ] **Step 2 : Créer `app/forbidden.tsx`** (active la file-convention)

```tsx
// src/app/forbidden.tsx
import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-2xl font-semibold">Accès refusé.</h1>
      <p className="mt-4 text-muted">Cet email n&apos;est pas autorisé sur /admin.</p>
      <Link href="/" className="mt-6 inline-block underline">Retour au site</Link>
    </main>
  );
}
```

- [ ] **Step 3 : Activer la route `forbidden()` dans `next.config.ts`**

```ts
// next.config.ts — ajouter
const nextConfig: NextConfig = {
  // ...existant
  experimental: {
    authInterrupts: true,
  },
};
```

> Source : `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/forbidden.md` — `forbidden()` est gated derrière `experimental.authInterrupts: true`.

### Task 2.4 : Page login + Server Action `requestMagicLink`

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/login/LoginForm.tsx`
- Create: `src/app/admin/_actions/auth.ts`

- [ ] **Step 1 : Server Action**

```ts
// src/app/admin/_actions/auth.ts
"use server";
import { signIn, signOut } from "@/auth";
import { z } from "zod";

const EmailSchema = z.object({
  email: z.string().email("Email invalide").transform((e) => e.trim().toLowerCase()),
});

export async function requestMagicLink(_prev: unknown, formData: FormData) {
  const parsed = EmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Email invalide." };
  }
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!adminEmail || parsed.data.email !== adminEmail) {
    // Réponse volontairement générique — ne pas révéler si l'email existe
    return { ok: true, sent: true };
  }
  await signIn("resend", {
    email: parsed.data.email,
    redirect: false,
  });
  return { ok: true, sent: true };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
```

- [ ] **Step 2 : Page login (Server Component)**

```tsx
// src/app/admin/login/page.tsx
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion admin", robots: { index: false, follow: false } };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ check?: string; error?: string }>;
}) {
  return (
    <main className="mx-auto max-w-md p-10">
      <h1 className="text-2xl font-semibold">Admin Azur Cover</h1>
      <p className="mt-3 text-sm text-muted">
        Un lien de connexion sera envoyé à votre email.
      </p>
      <LoginForm searchParams={searchParams} />
    </main>
  );
}
```

- [ ] **Step 3 : Composant client `LoginForm`**

```tsx
// src/app/admin/login/LoginForm.tsx
"use client";
import { useActionState, use } from "react";
import { requestMagicLink } from "../_actions/auth";

type Props = { searchParams: Promise<{ check?: string; error?: string }> };

export function LoginForm({ searchParams }: Props) {
  const params = use(searchParams);
  const [state, action, pending] = useActionState(requestMagicLink, null);

  if (params.check === "email" || state?.sent) {
    return (
      <p className="mt-8 rounded border border-line/60 p-4 text-sm">
        Si l&apos;email est autorisé, un lien de connexion a été envoyé. Vérifiez votre boîte.
      </p>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-muted">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="mt-2 block w-full border-b border-line/80 bg-transparent py-3 outline-none focus:border-ink"
        />
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {params.error && <p className="text-sm text-red-600">Une erreur est survenue. Réessayez.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Envoi…" : "Recevoir le lien"}
      </button>
    </form>
  );
}
```

### Task 2.5 : Layout + page admin landing

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1 : Layout admin**

```tsx
// src/app/admin/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin Azur Cover" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white text-ink">{children}</div>;
}
```

- [ ] **Step 2 : Landing /admin**

```tsx
// src/app/admin/page.tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { logoutAction } from "./_actions/auth";

export default async function AdminHome() {
  const admin = await requireAdmin();
  return (
    <main className="mx-auto max-w-2xl p-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Azur Cover</h1>
        <form action={logoutAction}>
          <button type="submit" className="text-sm underline">Se déconnecter</button>
        </form>
      </header>
      <p className="mt-4 text-sm text-muted">Connecté en tant que <strong>{admin.email}</strong>.</p>
      <nav className="mt-10 grid gap-4">
        <Link href="/admin/chantiers" className="rounded border border-line/60 p-4 hover:border-ink">
          Chantiers (réalisations) →
        </Link>
      </nav>
    </main>
  );
}
```

### Task 2.6 : Tester le flow auth de bout en bout

- [ ] **Step 1 : `pnpm dev`** et aller sur `http://localhost:3000/admin`
  - Expected : redirige vers `/admin/login`.

- [ ] **Step 2 : Soumettre un email NON autorisé (ex: `random@example.com`)**
  - Expected : message "Si l'email est autorisé, un lien a été envoyé." (jamais d'email envoyé).

- [ ] **Step 3 : Soumettre `ADMIN_EMAIL`**
  - Expected : même message + un email magic-link arrive (vérifier dans la boîte).

- [ ] **Step 4 : Cliquer le lien**
  - Expected : redirige sur `/admin`, affiche "Connecté en tant que X".

- [ ] **Step 5 : Modifier `ADMIN_EMAIL` en local pour un autre email + recharger `/admin`**
  - Expected : 403 / page forbidden.
  - Remettre la valeur d'origine après.

- [ ] **Step 6 : Logout → vérifier redirect vers `/`** et que `/admin` redemande la connexion.

### Task 2.7 : Commit Phase 2 + PR

```bash
git add src/auth.ts src/db proxy.ts src/app/api/auth src/app/admin src/app/forbidden.tsx src/lib/admin.ts next.config.ts
git commit -m "feat(cms): auth.js v5 + protected /admin shell (phase 2/4)"
git push
gh pr create --title "feat(cms): auth + admin shell (2/4)" --body "..."
```

`/code-review` puis `/verify`.

---

# PHASE 3 — CRUD chantiers

**But :** liste / new / edit / delete avec upload Blob, validation Zod, revalidation immédiate. Toujours pas de bascule du front public.

### Task 3.1 : Repository chantiers (Drizzle queries)

**Files:**
- Create: `src/lib/realisations-repo.ts`

- [ ] **Step 1 : Écrire le repo**

```ts
import "server-only";
import { eq, asc, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { realisations } from "@/db/schema";

export type RealisationRow = typeof realisations.$inferSelect;
export type RealisationInsert = typeof realisations.$inferInsert;

export async function listRealisations(): Promise<RealisationRow[]> {
  return getDb()
    .select()
    .from(realisations)
    .orderBy(asc(realisations.sortIndex), desc(realisations.createdAt));
}

export async function getRealisationBySlug(slug: string): Promise<RealisationRow | null> {
  const rows = await getDb().select().from(realisations).where(eq(realisations.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function insertRealisation(data: RealisationInsert) {
  const [row] = await getDb().insert(realisations).values(data).returning();
  return row;
}

export async function updateRealisationBySlug(slug: string, data: Partial<RealisationInsert>) {
  const [row] = await getDb()
    .update(realisations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(realisations.slug, slug))
    .returning();
  return row ?? null;
}

export async function deleteRealisationBySlug(slug: string) {
  const [row] = await getDb()
    .delete(realisations)
    .where(eq(realisations.slug, slug))
    .returning({ imageSrc: realisations.imageSrc });
  return row ?? null;
}
```

### Task 3.2 : Schémas Zod réutilisables

**Files:**
- Create: `src/lib/validation.ts`

- [ ] **Step 1 :**

```ts
import { z } from "zod";
import { solutionEnum } from "@/db/schema";

export const RealisationSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(96)
    .regex(/^[a-z0-9-]+$/, "Slug : minuscules, chiffres, tirets uniquement"),
  title: z.string().min(2).max(160),
  client: z.string().min(2).max(160),
  city: z.string().min(2).max(96),
  solution: z.enum(solutionEnum),
  surface: z.string().max(32).optional().or(z.literal("").transform(() => undefined)),
  duration: z.string().min(1).max(64),
  year: z.string().regex(/^\d{4}$/, "Année sur 4 chiffres"),
  short: z.string().min(10).max(220),
  // textarea -> array, on split sur \n\n et trim
  story: z
    .string()
    .min(1)
    .transform((s) =>
      s
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    ),
  // Liste de résultats : 0..N paires value/label
  results: z
    .array(z.object({ value: z.string().min(1).max(32), label: z.string().min(1).max(120) }))
    .optional(),
  imageSrc: z.string().url().startsWith("https://"),
  imageAlt: z.string().min(5).max(220),
  logo: z.string().url().optional().or(z.literal("").transform(() => undefined)),
});

export type RealisationInput = z.infer<typeof RealisationSchema>;
```

### Task 3.3 : Note sur le rendu de `story`

Pas de fichier `sanitize.ts` nécessaire : React échappe automatiquement le texte rendu via `{paragraph}` dans le JSX du front public (`{r.story.map((p, i) => <p>{p}</p>)}`). On stocke le texte brut en DB et on le rend tel quel — pas d'injection HTML possible tant qu'on n'utilise pas d'API "raw HTML" de React. Si une future feature en demande, ajouter `DOMPurify` à ce moment-là, pas avant.

### Task 3.4 : Server Action upload Blob

**Files:**
- Create: `src/app/admin/_actions/upload.ts`

- [ ] **Step 1 :**

```ts
"use server";
import { put, del } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (sous la limite serveur Vercel ~4.5MB)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadRealisationImage(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false as const, error: "Fichier manquant." };
  }
  if (file.size === 0) {
    return { ok: false as const, error: "Fichier vide." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false as const, error: `Image > 4 Mo (${(file.size / 1_048_576).toFixed(1)} Mo).` };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false as const, error: `Type non autorisé : ${file.type}. Utilisez JPG/PNG/WebP/AVIF.` };
  }
  const slug = String(formData.get("slug") ?? "realisation").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `realisations/${slug}.${ext}`;
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });
  return { ok: true as const, url: blob.url, alt: file.name };
}

export async function deleteBlobIfHosted(url: string | null | undefined) {
  if (!url) return;
  if (!url.includes(".public.blob.vercel-storage.com/")) return; // ne touche pas les /images/... locales
  try {
    await del(url);
  } catch {
    // idempotent : déjà supprimé ou jamais existé
  }
}
```

### Task 3.5 : Server Actions CRUD

**Files:**
- Create: `src/app/admin/_actions/realisations.ts`

- [ ] **Step 1 :**

```ts
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { RealisationSchema } from "@/lib/validation";
import {
  getRealisationBySlug,
  insertRealisation,
  updateRealisationBySlug,
  deleteRealisationBySlug,
} from "@/lib/realisations-repo";
import { deleteBlobIfHosted } from "./upload";

type ActionResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function parseFormData(formData: FormData) {
  // results = série de champs `results[i][value]` / `results[i][label]`
  const results: { value: string; label: string }[] = [];
  let i = 0;
  while (formData.has(`results[${i}][value]`) || formData.has(`results[${i}][label]`)) {
    const value = String(formData.get(`results[${i}][value]`) ?? "").trim();
    const label = String(formData.get(`results[${i}][label]`) ?? "").trim();
    if (value && label) results.push({ value, label });
    i++;
  }
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    client: String(formData.get("client") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    solution: String(formData.get("solution") ?? "").trim(),
    surface: String(formData.get("surface") ?? "").trim(),
    duration: String(formData.get("duration") ?? "").trim(),
    year: String(formData.get("year") ?? "").trim(),
    short: String(formData.get("short") ?? "").trim(),
    story: String(formData.get("story") ?? ""),
    results: results.length > 0 ? results : undefined,
    imageSrc: String(formData.get("imageSrc") ?? "").trim(),
    imageAlt: String(formData.get("imageAlt") ?? "").trim(),
    logo: String(formData.get("logo") ?? "").trim(),
  };
}

export async function createRealisation(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = RealisationSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { ok: false, error: "Validation échouée.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const existing = await getRealisationBySlug(parsed.data.slug);
  if (existing) return { ok: false, error: `Slug déjà utilisé : ${parsed.data.slug}` };
  await insertRealisation(parsed.data);
  revalidatePath("/realisations");
  revalidatePath(`/realisations/${parsed.data.slug}`);
  revalidatePath("/admin/chantiers");
  redirect("/admin/chantiers");
}

export async function updateRealisation(slug: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = RealisationSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { ok: false, error: "Validation échouée.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const existing = await getRealisationBySlug(slug);
  if (!existing) return { ok: false, error: "Chantier introuvable." };
  // Si nouvelle imageSrc differente -> supprimer l'ancienne du Blob
  if (existing.imageSrc !== parsed.data.imageSrc) {
    await deleteBlobIfHosted(existing.imageSrc);
  }
  await updateRealisationBySlug(slug, parsed.data);
  revalidatePath("/realisations");
  revalidatePath(`/realisations/${slug}`);
  if (parsed.data.slug !== slug) {
    revalidatePath(`/realisations/${parsed.data.slug}`);
  }
  revalidatePath("/admin/chantiers");
  redirect("/admin/chantiers");
}

export async function deleteRealisation(slug: string) {
  await requireAdmin();
  const row = await deleteRealisationBySlug(slug);
  if (row) await deleteBlobIfHosted(row.imageSrc);
  revalidatePath("/realisations");
  revalidatePath(`/realisations/${slug}`);
  revalidatePath("/admin/chantiers");
}
```

### Task 3.6 : Page liste `/admin/chantiers`

**Files:**
- Create: `src/app/admin/chantiers/page.tsx`

- [ ] **Step 1 :**

```tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { listRealisations } from "@/lib/realisations-repo";
import { deleteRealisation } from "../_actions/realisations";

export default async function ChantiersList() {
  await requireAdmin();
  const rows = await listRealisations();
  return (
    <main className="mx-auto max-w-5xl p-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chantiers ({rows.length})</h1>
        <Link href="/admin/chantiers/new" className="rounded bg-ink px-4 py-2 text-sm text-white">
          + Nouveau
        </Link>
      </header>
      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line/60 text-left">
            <th className="py-2">Titre</th>
            <th className="py-2">Client</th>
            <th className="py-2">Ville</th>
            <th className="py-2">Solution</th>
            <th className="py-2">Année</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line/30">
              <td className="py-3">
                <Link href={`/admin/chantiers/${r.slug}/edit`} className="underline">{r.title}</Link>
              </td>
              <td className="py-3">{r.client}</td>
              <td className="py-3">{r.city}</td>
              <td className="py-3">{r.solution}</td>
              <td className="py-3">{r.year}</td>
              <td className="py-3 text-right">
                <Link href={`/realisations/${r.slug}`} className="mr-4 text-xs underline" target="_blank">Voir</Link>
                <form action={async () => { "use server"; await deleteRealisation(r.slug); }} className="inline">
                  <button
                    type="submit"
                    className="text-xs text-red-600 underline"
                    // confirm() côté client → faire un composant client si requis ; pour simplicité v1, pas de confirm
                  >
                    Supprimer
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
```

> Note : pour ajouter un `confirm()` JS à la suppression, créer un petit composant `"use client"` `<DeleteButton slug={r.slug} />` qui wrappe le form. Optionnel pour la v1.

### Task 3.7 : Composant `RealisationForm` (client, réutilisé new + edit)

**Files:**
- Create: `src/app/admin/chantiers/_components/RealisationForm.tsx`
- Create: `src/app/admin/chantiers/_components/ImageUpload.tsx`

- [ ] **Step 1 : `ImageUpload.tsx`** (gère l'upload Blob, retourne l'URL via input hidden)

```tsx
"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { uploadRealisationImage } from "../../_actions/upload";

type Props = { initialUrl?: string; initialAlt?: string; slug: string };

export function ImageUpload({ initialUrl, initialAlt, slug }: Props) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [alt, setAlt] = useState(initialAlt ?? "");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    start(async () => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", slug);
      const res = await uploadRealisationImage(fd);
      if (res.ok) {
        setUrl(res.url);
        if (!alt) setAlt(res.alt.replace(/\.[^.]+$/, ""));
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-3">
      {url && (
        <div className="relative aspect-[4/3] max-w-sm overflow-hidden rounded bg-graphite/5">
          <Image src={url} alt={alt} fill sizes="400px" className="object-cover" />
        </div>
      )}
      <input type="hidden" name="imageSrc" value={url} required />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFile}
        disabled={pending}
        className="block text-sm"
      />
      {pending && <p className="text-xs text-muted">Upload en cours…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-muted">Texte alternatif (alt)</span>
        <input
          name="imageAlt"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          required
          className="mt-1 block w-full border-b border-line/80 bg-transparent py-2"
        />
      </label>
    </div>
  );
}
```

- [ ] **Step 2 : `RealisationForm.tsx`**

```tsx
"use client";
import { useActionState, useState } from "react";
import { solutionEnum } from "@/db/schema";
import { ImageUpload } from "./ImageUpload";

type ResultRow = { value: string; label: string };

export type RealisationFormInitial = {
  slug: string;
  title: string;
  client: string;
  city: string;
  solution: (typeof solutionEnum)[number];
  surface?: string | null;
  duration: string;
  year: string;
  short: string;
  story: string[];
  results?: ResultRow[] | null;
  imageSrc: string;
  imageAlt: string;
  logo?: string | null;
};

type ActionResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string[]> } | null;

type Props = {
  initial?: RealisationFormInitial;
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
};

export function RealisationForm({ initial, action, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(action, null);
  const [results, setResults] = useState<ResultRow[]>(initial?.results ?? []);
  const slugValue = initial?.slug ?? "";

  return (
    <form action={formAction} className="space-y-8">
      {state?.ok === false && (
        <div className="rounded border border-red-500/40 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <fieldset className="grid gap-4 md:grid-cols-2">
        <TextField name="slug" label="Slug (URL)" required defaultValue={slugValue} error={state?.ok === false ? state.fieldErrors?.slug : undefined} pattern="[a-z0-9-]+" />
        <TextField name="title" label="Titre" required defaultValue={initial?.title} error={state?.ok === false ? state.fieldErrors?.title : undefined} />
        <TextField name="client" label="Client" required defaultValue={initial?.client} error={state?.ok === false ? state.fieldErrors?.client : undefined} />
        <TextField name="city" label="Ville" required defaultValue={initial?.city} error={state?.ok === false ? state.fieldErrors?.city : undefined} />
        <SelectField name="solution" label="Solution" required defaultValue={initial?.solution} options={solutionEnum} error={state?.ok === false ? state.fieldErrors?.solution : undefined} />
        <TextField name="surface" label="Surface (ex: 2 700 m²)" defaultValue={initial?.surface ?? ""} />
        <TextField name="duration" label="Durée chantier" required defaultValue={initial?.duration} />
        <TextField name="year" label="Année (YYYY)" required defaultValue={initial?.year} pattern="\d{4}" />
      </fieldset>

      <TextArea name="short" label="Description courte (max 220 c.)" rows={2} required defaultValue={initial?.short} maxLength={220} error={state?.ok === false ? state.fieldErrors?.short : undefined} />

      <TextArea name="story" label="Histoire (séparer les paragraphes par une ligne vide)" rows={10} required defaultValue={initial?.story.join("\n\n")} error={state?.ok === false ? state.fieldErrors?.story : undefined} />

      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-wider text-muted">Résultats chiffrés (optionnel)</legend>
        {results.map((r, i) => (
          <div key={i} className="flex gap-2">
            <input name={`results[${i}][value]`} defaultValue={r.value} placeholder="3 à 4 °C" className="flex-1 border-b border-line/80 bg-transparent py-2" />
            <input name={`results[${i}][label]`} defaultValue={r.label} placeholder="vs classes témoins" className="flex-[2] border-b border-line/80 bg-transparent py-2" />
            <button type="button" onClick={() => setResults((rs) => rs.filter((_, j) => j !== i))} className="text-xs text-red-600">×</button>
          </div>
        ))}
        <button type="button" onClick={() => setResults((rs) => [...rs, { value: "", label: "" }])} className="text-xs underline">
          + Ajouter un résultat
        </button>
      </fieldset>

      <div>
        <h3 className="text-xs uppercase tracking-wider text-muted">Image principale</h3>
        <div className="mt-3">
          <ImageUpload initialUrl={initial?.imageSrc} initialAlt={initial?.imageAlt} slug={slugValue || "draft"} />
        </div>
      </div>

      <TextField name="logo" label="URL logo client (optionnel)" defaultValue={initial?.logo ?? ""} />

      <button type="submit" disabled={pending} className="rounded bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}

// --- Petits champs ---

function TextField({ name, label, error, ...props }: { name: string; label: string; error?: string[] } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <input name={name} className="mt-1 block w-full border-b border-line/80 bg-transparent py-2 outline-none focus:border-ink" {...props} />
      {error?.map((e) => <p key={e} className="mt-1 text-xs text-red-600">{e}</p>)}
    </label>
  );
}

function TextArea({ name, label, error, ...props }: { name: string; label: string; error?: string[] } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <textarea name={name} className="mt-1 block w-full border-b border-line/80 bg-transparent py-2 outline-none focus:border-ink" {...props} />
      {error?.map((e) => <p key={e} className="mt-1 text-xs text-red-600">{e}</p>)}
    </label>
  );
}

function SelectField({ name, label, options, error, ...props }: { name: string; label: string; options: readonly string[]; error?: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <select name={name} className="mt-1 block w-full border-b border-line/80 bg-transparent py-2" {...props}>
        <option value="" disabled>—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error?.map((e) => <p key={e} className="mt-1 text-xs text-red-600">{e}</p>)}
    </label>
  );
}
```

### Task 3.8 : Page `new`

**Files:**
- Create: `src/app/admin/chantiers/new/page.tsx`

```tsx
import { requireAdmin } from "@/lib/admin";
import { RealisationForm } from "../_components/RealisationForm";
import { createRealisation } from "../../_actions/realisations";

export default async function NewChantier() {
  await requireAdmin();
  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="text-2xl font-semibold">Nouveau chantier</h1>
      <div className="mt-8">
        <RealisationForm action={createRealisation} submitLabel="Créer" />
      </div>
    </main>
  );
}
```

### Task 3.9 : Page `edit`

**Files:**
- Create: `src/app/admin/chantiers/[slug]/edit/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getRealisationBySlug } from "@/lib/realisations-repo";
import { RealisationForm } from "../../_components/RealisationForm";
import { updateRealisation } from "../../../_actions/realisations";

export default async function EditChantier({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const row = await getRealisationBySlug(slug);
  if (!row) notFound();

  // Bind du slug courant à l'action (pour update by current slug)
  const action = updateRealisation.bind(null, slug);

  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="text-2xl font-semibold">Éditer : {row.title}</h1>
      <div className="mt-8">
        <RealisationForm
          submitLabel="Enregistrer"
          action={action}
          initial={{
            slug: row.slug,
            title: row.title,
            client: row.client,
            city: row.city,
            solution: row.solution,
            surface: row.surface,
            duration: row.duration,
            year: row.year,
            short: row.short,
            story: row.story,
            results: row.results,
            imageSrc: row.imageSrc,
            imageAlt: row.imageAlt,
            logo: row.logo,
          }}
        />
      </div>
    </main>
  );
}
```

### Task 3.10 : Tester le CRUD complet

- [ ] **Step 1 : Créer un chantier de test depuis `/admin/chantiers/new`**
  - Slug `test-cms`, image uploadée depuis disque, story 2 paragraphes, 1 résultat.
  - Expected : redirige sur `/admin/chantiers`, le chantier apparaît dans la table.

- [ ] **Step 2 : Aller sur `/realisations/test-cms`**
  - Expected : la page s'affiche avec l'image Blob, la story, les résultats.

- [ ] **Step 3 : Éditer le chantier, changer l'image**
  - Expected : nouvelle image sur la fiche, ancienne supprimée du Blob (vérifier via `vercel blob ls`).

- [ ] **Step 4 : Essayer de créer un chantier avec un slug déjà pris**
  - Expected : message "Slug déjà utilisé : ...".

- [ ] **Step 5 : Tester la validation (slug avec espaces, year `25`, short trop long)**
  - Expected : erreurs Zod affichées sous les champs.

- [ ] **Step 6 : Supprimer le chantier de test**
  - Expected : disparaît de la table ET de `/realisations`. L'image Blob est supprimée.

### Task 3.11 : Commit Phase 3 + PR

```bash
git add src/app/admin src/lib next.config.ts
git commit -m "feat(cms): CRUD chantiers + upload blob (phase 3/4)"
gh pr create --title "feat(cms): CRUD chantiers (3/4)" --body "..."
```

`/code-review` puis `/verify`.

---

# PHASE 4 — Migration & bascule du front public

**But :** importer les 12 chantiers actuels du fichier statique vers la DB sans perte, basculer les pages publiques sur la DB, et **garder le fichier `src/content/realisations.ts` jusqu'à validation prod**.

### Task 4.1 : Script de migration idempotent

**Files:**
- Create: `scripts/migrate-realisations.ts`

- [ ] **Step 1 : Écrire le script**

```ts
import "dotenv/config";
import { getDb } from "../src/db";
import { realisations as realisationsTable } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { realisations as staticRealisations } from "../src/content/realisations";

async function main() {
  const db = getDb();
  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < staticRealisations.length; i++) {
    const r = staticRealisations[i];
    const [existing] = await db
      .select({ id: realisationsTable.id })
      .from(realisationsTable)
      .where(eq(realisationsTable.slug, r.slug))
      .limit(1);
    if (existing) {
      console.log(`  skip (exists)  : ${r.slug}`);
      skipped++;
      continue;
    }
    await db.insert(realisationsTable).values({
      slug: r.slug,
      title: r.title,
      client: r.client,
      city: r.city,
      solution: r.solution,
      surface: r.surface ?? null,
      duration: r.duration,
      year: r.year,
      short: r.short,
      story: r.story,
      results: r.results ?? null,
      imageSrc: r.image.src,
      imageAlt: r.image.alt,
      logo: r.logo ?? null,
      sortIndex: i,
    });
    console.log(`  inserted       : ${r.slug}`);
    inserted++;
  }
  console.log(`\n→ inserted: ${inserted}, skipped: ${skipped}, total in source: ${staticRealisations.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

- [ ] **Step 2 : Lancer la migration en local (DB Neon dev)**

```bash
pnpm db:migrate-realisations
```

Expected : 12 lignes insérées (selon le fichier source actuel — 12 chantiers).

- [ ] **Step 3 : Re-lancer pour vérifier idempotence**

```bash
pnpm db:migrate-realisations
```

Expected : 12 "skip (exists)", 0 inserted.

- [ ] **Step 4 : Spot-check via Studio**

```bash
pnpm db:studio
```

Vérifier visuellement 2-3 lignes (titre, story, results).

### Task 4.2 : Bascule de `src/app/realisations/page.tsx`

**Files:**
- Modify: `src/app/realisations/page.tsx`

- [ ] **Step 1 : Remplacer l'import statique par la query DB**

```tsx
// Remplacer la ligne :
// import { realisations } from "@/content/realisations";
// par :
import { listRealisations } from "@/lib/realisations-repo";

// puis dans le composant, rendre la fonction async :
export default async function RealisationsIndex() {
  const realisations = await listRealisations();
  return (
    // ... reste inchangé : la forme des objets matche (slug, image.src/image.alt remplacés par imageSrc/imageAlt)
  );
}
```

> ⚠️ **Attention au shape** : dans le fichier statique, c'était `r.image.src` / `r.image.alt`. Dans la DB, c'est `r.imageSrc` / `r.imageAlt`. Adapter les références dans le JSX.

- [ ] **Step 2 : Patcher les usages dans `page.tsx`**

```tsx
<Image
  src={r.imageSrc}            // ex r.image.src
  alt={r.imageAlt}            // ex r.image.alt
  fill
  loading={i < 4 ? "eager" : "lazy"}
  sizes="(min-width: 768px) 50vw, 100vw"
  className="..."
/>
```

### Task 4.3 : Bascule de `src/app/realisations/[slug]/page.tsx`

**Files:**
- Modify: `src/app/realisations/[slug]/page.tsx`

- [ ] **Step 1 : Imports**

```tsx
// Supprimer:
// import { realisations, getRealisation } from "@/content/realisations";
// Ajouter:
import { listRealisations, getRealisationBySlug } from "@/lib/realisations-repo";
```

- [ ] **Step 2 : `generateStaticParams` lit la DB**

```tsx
export async function generateStaticParams() {
  const rows = await listRealisations();
  return rows.map((r) => ({ slug: r.slug }));
}
```

- [ ] **Step 3 : `generateMetadata` et la page**

```tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRealisationBySlug(slug);
  if (!r) return {};
  return {
    title: r.title,
    description: r.short,
    alternates: { canonical: `/realisations/${r.slug}` },
  };
}

export default async function RealisationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRealisationBySlug(slug);
  if (!r) notFound();

  const all = await listRealisations();
  const idx = all.findIndex((x) => x.slug === slug);
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];

  // ... reste inchangé, mais r.image.src → r.imageSrc, r.image.alt → r.imageAlt
}
```

- [ ] **Step 4 : Patcher tous les `r.image.src` → `r.imageSrc` et `r.image.alt` → `r.imageAlt` dans le JSX.**

### Task 4.4 : Vérifier le build + Lighthouse

- [ ] **Step 1 : Build**

```bash
pnpm build
```

Expected : aucun warning. Vérifier le rapport de build — les routes `/realisations` et `/realisations/[slug]` doivent rester en SSG (les pages ne lisent la DB qu'au build via `generateStaticParams`).

- [ ] **Step 2 : Lighthouse local**

```bash
pnpm start
# autre terminal :
npx lighthouse http://localhost:3000/realisations --only-categories=performance --chrome-flags="--headless"
```

Expected : score performance ≥ 90.

- [ ] **Step 3 : Spot-check visuel**

Comparer avant/après sur `/realisations` et 2-3 fiches. Tout doit être identique pixel-perfect.

### Task 4.5 : Commit + déploiement preview

```bash
git add src/app/realisations scripts/migrate-realisations.ts
git commit -m "feat(cms): bascule pages publiques sur DB + script migration (phase 4/4)"
gh pr create --title "feat(cms): bascule pages publiques + migration (4/4)" --body "..."
```

`/code-review` puis `/verify`.

- [ ] **Step suivant — sur la PR Vercel preview** :
  - [ ] Vérifier que la preview affiche bien les chantiers depuis la DB Neon preview.
  - [ ] Vérifier qu'un chantier créé via `/admin` sur la preview apparaît immédiatement sur `/realisations` (revalidatePath).

### Task 4.6 : Migration prod + cleanup

- [ ] **Step 1 : Après merge en main et déploiement prod, lancer la migration sur la DB prod**

```bash
# Récupérer la DATABASE_URL prod
vercel env pull .env.production --environment=production --yes
dotenv -e .env.production -- tsx scripts/migrate-realisations.ts
rm .env.production   # nettoyer immédiatement
```

Expected : 12 inserted (si la DB prod est vierge) ou skip (si déjà fait).

- [ ] **Step 2 : Vérifier la prod**

Ouvrir `https://www.azurcover.com/realisations` — tous les chantiers doivent s'afficher (lus depuis la DB).

- [ ] **Step 3 : Créer un chantier de test via `/admin` en prod, vérifier l'apparition publique, puis le supprimer.**

- [ ] **Step 4 : Suppression du filet de sécurité (PR séparée, optionnelle)**

```bash
git rm src/content/realisations.ts
# Vérifier qu'aucun autre fichier ne l'importe :
grep -r "content/realisations" src/ scripts/
# scripts/migrate-realisations.ts l'importe encore — soit on supprime le script aussi,
# soit on le garde sous /scripts comme outil one-shot, en gardant le fichier static.
git commit -m "chore: remove static realisations.ts (now in DB)"
```

> Décision : **garder `realisations.ts` au moins 30 jours après bascule prod**. Coût : 0 (fichier ignoré par le runtime). Bénéfice : rollback rapide si problème DB.

---

## Acceptance criteria (récap)

- [ ] `/admin` redirige vers `/admin/login` si non connecté (`proxy.ts` matcher `/admin/:path*`).
- [ ] Seul `ADMIN_EMAIL` peut accéder ; un autre email connecté tombe sur 403 (file-convention `forbidden.tsx`).
- [ ] Créer un chantier depuis `/admin/chantiers/new` le fait apparaître sur `/realisations` sans rebuild (via `revalidatePath`).
- [ ] Upload image fonctionne : URL `*.public.blob.vercel-storage.com` stockée en DB et rendue par `next/image`.
- [ ] Edit + delete fonctionnent ; suppression d'image Blob idempotente.
- [ ] Slug unique : contrainte DB (`.unique()`) + check `getRealisationBySlug` avant `insert` + regex Zod.
- [ ] Les 12 chantiers actuels sont migrés sans perte (script idempotent, log inséré/skippé par slug).
- [ ] `pnpm build` passe sans warning.
- [ ] Lighthouse `/realisations` reste ≥ 90 perf.

## Sécurité (récap)

- [ ] Validation Zod sur **toutes** les Server Actions (`createRealisation`, `updateRealisation`, `requestMagicLink`, `uploadRealisationImage`).
- [ ] `requireAdmin()` en première ligne dans chaque Server Action ET Server Component admin.
- [ ] Rate limit : non bloquant pour la v1 puisqu'un seul admin connecté, mais à ajouter sur `requestMagicLink` si jamais l'email admin fuit (réutiliser le pattern `Map<ip, lastRequest>` du form contact).
- [ ] Pas de SQL brut : queries via Drizzle (`db.select`/`insert`/`update`/`delete`) uniquement.
- [ ] `AUTH_SECRET` généré via `openssl rand -base64 32`, jamais commité.
- [ ] `next/image` autorise uniquement `*.public.blob.vercel-storage.com` en remote pattern.
- [ ] `story` rendu via React (échappement automatique des accolades JSX). Pas de rendu HTML brut.
- [ ] Réponse générique sur `requestMagicLink` (ne révèle pas l'email admin).

## Périmètre — non fait

- Pas de multi-utilisateur, pas de rôles, pas d'invitations.
- Pas de WYSIWYG : textarea suffit pour `story`.
- Pas de versioning / draft / preview.
- Pas de migration des autres `src/content/*.ts` (clients, presse, etc.).
- Pas de refonte du design public de `/realisations`.
- Pas d'i18n de l'admin (FR uniquement).
