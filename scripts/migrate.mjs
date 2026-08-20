#!/usr/bin/env node
/**
 * Deploy-time migrator.
 *
 * Turso (TURSO_DATABASE_URL): apply migrations/sqlite against libSQL.
 * Neon (DATABASE_URL): apply migrations/*.sql against Postgres.
 * Neither set (local preview): skip — runtime bootstraps itself.
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tursoUrl =
  process.env.TURSO_DATABASE_URL?.trim() ||
  process.env.LIBSQL_URL?.trim() ||
  process.env.TURSO_URL?.trim() ||
  process.env.TURSO_DB_URL?.trim();
const tursoToken =
  process.env.TURSO_AUTH_TOKEN?.trim() ||
  process.env.LIBSQL_AUTH_TOKEN?.trim() ||
  process.env.TURSO_DB_AUTH_TOKEN?.trim();
const databaseUrl = process.env.DATABASE_URL?.trim();

function splitSqlStatements(text) {
  return text
    .split(";")
    .map((chunk) => chunk.trim())
    .filter((chunk) =>
      chunk.split("\n").some((line) => {
        const trimmed = line.trim();
        return trimmed.length > 0 && !trimmed.startsWith("--");
      }),
    );
}

async function migrateTurso() {
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: tursoUrl, authToken: tursoToken });
  await client.execute(
    "create table if not exists _migrations (name text primary key, applied_at text not null default (datetime('now')))",
  );
  const applied = new Set(
    (await client.execute("select name from _migrations")).rows.map((row) => String(row.name)),
  );
  const dir = join(root, "migrations", "sqlite");
  let files;
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  } catch {
    console.log("[migrate] no migrations/sqlite directory — nothing to do.");
    return;
  }
  let count = 0;
  for (const name of files) {
    if (applied.has(name)) continue;
    const text = await readFile(join(dir, name), "utf8");
    for (const statement of splitSqlStatements(text)) {
      await client.execute(statement);
    }
    await client.execute({
      sql: "insert into _migrations (name) values (?)",
      args: [name],
    });
    console.log(`[migrate] applied ${name}`);
    count += 1;
  }
  console.log(count ? `[migrate] turso done — ${count} migration(s).` : "[migrate] turso up to date.");
}

async function migratePostgres() {
  const pg = await import("pg");
  const pool = new pg.default.Pool({ connectionString: databaseUrl, max: 1 });
  const client = await pool.connect();
  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const applied = new Set(
      (await client.query("SELECT name FROM _migrations")).rows.map((r) => r.name),
    );
    const dir = join(root, "migrations");
    const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
    let count = 0;
    for (const name of files) {
      if (applied.has(name)) continue;
      const text = await readFile(join(dir, name), "utf8");
      try {
        await client.query("BEGIN");
        for (const statement of splitSqlStatements(text)) {
          await client.query(statement);
        }
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
        await client.query("COMMIT");
      } catch (err) {
        console.error(`[migrate] error applying ${name}`);
        try {
          await client.query("ROLLBACK");
        } catch {
          // keep original error
        }
        throw err;
      }
      console.log(`[migrate] applied ${name}`);
      count += 1;
    }
    console.log(count ? `[migrate] postgres done — ${count} migration(s).` : "[migrate] postgres up to date.");
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  if (tursoUrl) {
    await migrateTurso();
    return;
  }
  if (databaseUrl) {
    await migratePostgres();
    return;
  }
  console.log(
    "[migrate] no TURSO_DATABASE_URL / DATABASE_URL — skipping (preview bootstraps itself).",
  );
}

main().catch((err) => {
  console.error("[migrate] failed:", err?.message || err);
  process.exit(1);
});
