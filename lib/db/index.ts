import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

// Reuse one connection pool across hot reloads in development.
const globalForDb = globalThis as unknown as { db?: Database };

/** Returns null when DATABASE_URL isn't configured; progress then stays in the browser. */
export function getDb(): Database | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  globalForDb.db ??= drizzle(postgres(url, { max: 5, prepare: false }), { schema });
  return globalForDb.db;
}
