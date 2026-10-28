import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import * as schema from "./schema.ts";

export type AppDatabase = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as unknown as {
  covenantDb?: AppDatabase;
  covenantSqlite?: Database.Database;
};

export function createDatabase(filename: string): AppDatabase {
  if (filename !== ":memory:") {
    mkdirSync(dirname(filename), { recursive: true });
  }
  const sqlite = new Database(filename);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  return drizzle(sqlite, { schema });
}

export function runMigrations(db: AppDatabase, folder = join(process.cwd(), "drizzle")) {
  migrate(db, { migrationsFolder: folder });
}

export function getDb(): AppDatabase {
  if (!globalForDb.covenantDb) {
    const filename = process.env.DATABASE_PATH ?? join(process.cwd(), "data", "covenant.db");
    const db = createDatabase(filename);
    runMigrations(db);
    globalForDb.covenantDb = db;
  }
  return globalForDb.covenantDb;
}
