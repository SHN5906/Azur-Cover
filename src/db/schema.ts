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

// --- Tables Auth.js v5 (schéma standard @auth/drizzle-adapter) ---

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
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
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
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);
