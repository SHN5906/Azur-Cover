import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { requireEnv } from "@/lib/env";

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  const sql = neon(requireEnv("DATABASE_URL"));
  return drizzle(sql, { schema });
}

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

export { schema };
