/** App data backend: Neon Postgres, Turso/libSQL, or local PGLite. */
import type { InValue } from "@libsql/client";

export type DbSource = "turso" | "neon" | "pglite";

function envTrim(key: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

const tursoUrl =
  envTrim("TURSO_DATABASE_URL") ??
  envTrim("LIBSQL_URL") ??
  envTrim("TURSO_URL") ??
  envTrim("TURSO_DB_URL");
const tursoToken =
  envTrim("TURSO_AUTH_TOKEN") ??
  envTrim("LIBSQL_AUTH_TOKEN") ??
  envTrim("TURSO_DB_AUTH_TOKEN");
const databaseUrl = envTrim("DATABASE_URL");
const onVercel = Boolean(envTrim("VERCEL"));

export const dbSource: DbSource = tursoUrl
  ? "turso"
  : databaseUrl
    ? "neon"
    : "pglite";

export interface Sql {
  <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]>;
  query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[]
  ): Promise<T[]>;
}

const globalRef = globalThis as typeof globalThis & {
  __tursoSqlPromise__?: Promise<Sql>;
  __pgSqlPromise__?: Promise<Sql>;
  __pgliteInstance__?: Promise<import("@electric-sql/pglite").PGlite>;
  __pgliteMigrateChain__?: Promise<void>;
  __pgMigrateChain__?: Promise<void>;
};

const OID_INT8 = 20;
const OID_DATE = 1082;
const OID_INTERVAL = 1186;
const identity = (v: string) => v;

type Run = <T>(text: string, params: unknown[]) => Promise<T[]>;

function toSql(run: Run): Sql {
  const sql = (async <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]> => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return run<T>(text, values);
  }) as unknown as Sql;
  sql.query = <T = Record<string, unknown>>(text: string, params: unknown[] = []) =>
    run<T>(text, params);
  return sql;
}

/** Board queries are written with SQLite `datetime('now')`; rewrite for Postgres. */
function toPostgresSql(text: string) {
  return text
    .replace(
      /datetime\('now',\s*'-'\s*\|\|\s*(\$\d+)\s*\|\|\s*' seconds'\)/gi,
      "now() - ($1 || ' seconds')::interval",
    )
    .replace(/datetime\('now'\)/gi, "now()");
}

function pgPlaceholdersToLibsql(text: string) {
  return text.replace(/\$\d+/g, "?");
}

function splitSqlStatements(text: string) {
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

function asInArgs(params: unknown[] | undefined): InValue[] {
  if (!params?.length) return [];
  return params.map((value) => {
    if (value === undefined) return null;
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      typeof value === "bigint" ||
      value instanceof Date ||
      value instanceof Uint8Array ||
      value instanceof ArrayBuffer
    ) {
      return value;
    }
    return JSON.stringify(value);
  });
}

function isIgnorableSqliteMigrationError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /duplicate column name|already exists/i.test(message);
}

function postgresMigrationFiles() {
  return import.meta.glob("/migrations/*.sql", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;
}

async function applySqliteMigrations(
  execute: (sql: string, args?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>,
) {
  await execute(
    "create table if not exists _migrations (name text primary key, applied_at text not null default (datetime('now')))",
  );
  const doneResult = await execute("select name from _migrations");
  const done = new Set(doneResult.rows.map((row) => String(row.name)));
  const migrations = import.meta.glob("/migrations/sqlite/*.sql", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;
  for (const [path, text] of Object.entries(migrations).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const name = path.split("/").pop() as string;
    if (done.has(name)) continue;
    for (const statement of splitSqlStatements(text)) {
      try {
        await execute(statement);
      } catch (error) {
        if (!isIgnorableSqliteMigrationError(error)) throw error;
      }
    }
    await execute("insert into _migrations (name) values (?)", [name]);
  }
}

async function applyPostgresMigrations(
  query: (text: string, params?: unknown[]) => Promise<{ rows: Array<{ name?: string }> }>,
) {
  await query(
    "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  );
  const doneRows = await query("select name from _migrations");
  const done = new Set(doneRows.rows.map((row) => String(row.name)));
  const migrations = postgresMigrationFiles();
  for (const [path, text] of Object.entries(migrations).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const name = path.split("/").pop() as string;
    if (done.has(name)) continue;
    for (const statement of splitSqlStatements(text)) {
      await query(statement);
    }
    await query(
      "insert into _migrations (name) values ($1) on conflict (name) do nothing",
      [name],
    );
  }
}

function createLibsqlSql(): Promise<Sql> {
  globalRef.__tursoSqlPromise__ ??= (async () => {
    const url = tursoUrl ?? "file:/tmp/ledger-preview.db";
    const remote = !url.startsWith("file:");
    const { createClient } = remote
      ? await import("@libsql/client/web")
      : await import("@libsql/client");
    const client = createClient(
      remote ? { url, authToken: tursoToken } : { url },
    );
    await applySqliteMigrations(async (sql, args) => {
      const inArgs = asInArgs(args);
      const result = await client.execute(
        inArgs.length ? { sql, args: inArgs } : sql,
      );
      return { rows: result.rows as unknown as Record<string, unknown>[] };
    });
    return toSql(async <T>(text: string, params: unknown[]) => {
      const result = await client.execute({
        sql: pgPlaceholdersToLibsql(text),
        args: asInArgs(params),
      });
      return result.rows as unknown as T[];
    });
  })().catch((err) => {
    globalRef.__tursoSqlPromise__ = undefined;
    throw err;
  });
  return globalRef.__tursoSqlPromise__;
}

function createNeonSql(): Promise<Sql> {
  globalRef.__pgSqlPromise__ ??= (async () => {
    const { Pool, types } = await import("pg");
    types.setTypeParser(OID_INT8, Number);
    types.setTypeParser(OID_DATE, identity);
    types.setTypeParser(OID_INTERVAL, identity);
    const pool = new Pool({ connectionString: databaseUrl });
    const migrate = async () => {
      await applyPostgresMigrations(async (text, params) => {
        const result = params?.length
          ? await pool.query(text, params)
          : await pool.query(text);
        return { rows: result.rows as Array<{ name?: string }> };
      });
    };
    const pass = (globalRef.__pgMigrateChain__ ?? Promise.resolve())
      .catch(() => undefined)
      .then(migrate);
    globalRef.__pgMigrateChain__ = pass;
    await pass;
    return toSql(async <T>(text: string, params: unknown[]) => {
      const res = await pool.query(toPostgresSql(text), params);
      return res.rows as T[];
    });
  })().catch((err) => {
    globalRef.__pgSqlPromise__ = undefined;
    throw err;
  });
  return globalRef.__pgSqlPromise__;
}

async function openPglite(): Promise<import("@electric-sql/pglite").PGlite> {
  globalRef.__pgliteInstance__ ??= (async () => {
    const { PGlite } = await import("@electric-sql/pglite");
    const pg = new PGlite({
      parsers: {
        [OID_INT8]: Number,
        [OID_DATE]: identity,
        [OID_INTERVAL]: identity,
      },
    });
    await pg.waitReady;
    await pg.exec(
      "create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())",
    );
    return pg;
  })().catch((err) => {
    globalRef.__pgliteInstance__ = undefined;
    throw err;
  });
  const pg = await globalRef.__pgliteInstance__;

  const migrate = async (): Promise<void> => {
    const migrations = postgresMigrationFiles();
    const doneRows = await pg.query<{ name: string }>(
      "select name from _migrations",
    );
    const done = new Set(doneRows.rows.map((r) => r.name));
    for (const [path, text] of Object.entries(migrations).sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      const name = path.split("/").pop() as string;
      if (done.has(name)) continue;
      await pg.transaction(async (tx) => {
        await tx.exec(text);
        await tx.query(
          "insert into _migrations (name) values ($1) on conflict (name) do nothing",
          [name],
        );
      });
    }
  };
  const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve())
    .catch(() => undefined)
    .then(migrate);
  globalRef.__pgliteMigrateChain__ = pass;
  await pass;
  return pg;
}

async function createPgliteSql(): Promise<Sql> {
  const pg = await openPglite();
  return toSql(async <T>(text: string, params: unknown[]) => {
    const result = await pg.query<T>(toPostgresSql(text), params);
    return result.rows;
  });
}

let sqlPromise: Promise<Sql> | null = null;

async function createSql(): Promise<Sql> {
  if (typeof window !== "undefined") {
    throw new Error(
      "@/lib/db is server-only — call getSql() from a createServerFn handler " +
        "or a server route loader, never from client code.",
    );
  }
  if (dbSource === "turso") return createLibsqlSql();
  if (dbSource === "neon") return createNeonSql();
  if (onVercel) {
    throw new Error(
      "Missing DATABASE_URL (or TURSO_DATABASE_URL). Production needs a Postgres or Turso connection.",
    );
  }
  return createPgliteSql();
}

export function getSql(): Promise<Sql> {
  sqlPromise ??= createSql().catch((err) => {
    sqlPromise = null;
    throw err;
  });
  return sqlPromise;
}

export async function getPglite(): Promise<import("@electric-sql/pglite").PGlite> {
  if (dbSource !== "pglite") {
    throw new Error("getPglite() is only available when DATABASE_URL and TURSO_DATABASE_URL are unset");
  }
  return openPglite();
}

export function ensureDbReady(): Promise<void> {
  if (dbSource === "pglite" && !onVercel) {
    return getSql().then(() => undefined);
  }
  return Promise.resolve();
}

const globalBoot = globalThis as typeof globalThis & {
  __pgBootstrapPromise__?: Promise<void>;
};
if (typeof window === "undefined" && dbSource === "pglite" && !onVercel) {
  globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
    globalBoot.__pgBootstrapPromise__ = undefined;
    console.error("[db] bootstrap failed:", err);
    throw err;
  });
}
