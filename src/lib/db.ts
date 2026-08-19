/** App data backend: remote Turso, or a local libSQL file in preview. */
import type { InValue } from "@libsql/client";

export type DbSource = "turso" | "local";

function envTrim(key: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

// Vercel Marketplace (resource `database-camel-cave`) injects TURSO_*.
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
const isViteBuild = process.env.npm_lifecycle_event === "build";

export const dbSource: DbSource = tursoUrl ? "turso" : "local";

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
  __pgliteInstance__?: Promise<import("@electric-sql/pglite").PGlite>;
  __pgliteMigrateChain__?: Promise<void>;
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

function pgPlaceholdersToLibsql(text: string) {
  return text.replace(/\$\d+/g, "?");
}

function splitSqlStatements(text: string) {
  return text
    .split(";")
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0 && !chunk.startsWith("--"));
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
      await execute(statement);
    }
    await execute("insert into _migrations (name) values (?)", [name]);
  }
}

function createLibsqlSql(): Promise<Sql> {
  globalRef.__tursoSqlPromise__ ??= (async () => {
    if (onVercel && !tursoUrl) {
      throw new Error(
        "Missing TURSO_DATABASE_URL. Connect the Turso store database-camel-cave to this Vercel project so TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are injected.",
      );
    }
    const { createClient } = await import("@libsql/client");
    const client = createClient(
      tursoUrl
        ? { url: tursoUrl, authToken: tursoToken }
        : { url: "file:/tmp/ledger-preview.db" },
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
    const migrations = import.meta.glob("/migrations/*.sql", {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>;
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
        await tx.query("insert into _migrations (name) values ($1)", [name]);
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

let sqlPromise: Promise<Sql> | null = null;

async function createSql(): Promise<Sql> {
  if (typeof window !== "undefined") {
    throw new Error(
      "@/lib/db is server-only — call getSql() from a createServerFn handler " +
        "or a server route loader, never from client code.",
    );
  }
  return createLibsqlSql();
}

export function getSql(): Promise<Sql> {
  sqlPromise ??= createSql().catch((err) => {
    sqlPromise = null;
    throw err;
  });
  return sqlPromise;
}

export async function getPglite(): Promise<import("@electric-sql/pglite").PGlite> {
  if (databaseUrl) {
    throw new Error("getPglite() is only available when DATABASE_URL is unset");
  }
  return openPglite();
}

export function ensureDbReady(): Promise<void> {
  const tasks: Promise<unknown>[] = [getSql()];
  if (!tursoUrl && !databaseUrl && !onVercel) tasks.push(getPglite());
  return Promise.all(tasks).then(() => undefined);
}

const globalBoot = globalThis as typeof globalThis & {
  __pgBootstrapPromise__?: Promise<void>;
};
if (typeof window === "undefined" && !isViteBuild) {
  globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
    globalBoot.__pgBootstrapPromise__ = undefined;
    console.error("[db] bootstrap failed:", err);
    throw err;
  });
}
