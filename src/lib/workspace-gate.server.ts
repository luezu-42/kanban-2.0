import { createHmac, scrypt, timingSafeEqual } from "node:crypto";
import { getSql } from "@/lib/db";

const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;

type AuthRow = { salt: string; hash: string };

function sameBuffer(left: Buffer, right: Buffer) {
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function sameText(left: string, right: string) {
  const a = createHmac("sha256", "ledger-compare").update(left).digest();
  const b = createHmac("sha256", "ledger-compare").update(right).digest();
  return sameBuffer(a, b);
}

function hashPassword(password: string, saltHex: string) {
  const salt = Buffer.from(saltHex, "hex");
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, SCRYPT, (error, derived) => {
      if (error) reject(error);
      else resolve(derived as Buffer);
    });
  });
}

async function readAuth(): Promise<AuthRow | null> {
  const sql = await getSql();
  const rows = await sql<AuthRow>`
    select salt, hash from workspace_auth where id = ${"ledger"} limit 1
  `;
  return rows[0] ?? null;
}

function makeToken(row: AuthRow) {
  return createHmac("sha256", `${row.salt}:${row.hash}`)
    .update("ledger-unlocked-v1")
    .digest("hex");
}

export async function unlockWithPassword(password: string) {
  const submitted = password.trim();
  if (!submitted) return { ok: false as const, token: "" };

  const envPassword = process.env.WORKSPACE_PASSWORD?.trim();
  const row = await readAuth();
  if (!row) return { ok: false as const, token: "" };

  let ok = false;
  if (envPassword) {
    ok = sameText(submitted, envPassword);
  } else {
    const derived = await hashPassword(submitted, row.salt);
    ok = sameBuffer(derived, Buffer.from(row.hash, "hex"));
  }

  if (!ok) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { ok: false as const, token: "" };
  }
  return { ok: true as const, token: makeToken(row) };
}

export async function assertUnlock(token: string) {
  const row = await readAuth();
  if (!row || !token) {
    throw new Error("Unauthorized");
  }
  const expected = Buffer.from(makeToken(row));
  const received = Buffer.from(token);
  if (!sameBuffer(expected, received)) {
    throw new Error("Unauthorized");
  }
}
