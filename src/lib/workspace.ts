import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import {
  type Card,
  type Theme,
  findCardInThemes,
  parseBoardPayload,
} from "@/lib/kanban";

export const WORKSPACE_ID = "ledger";

export type BoardPayload = {
  themes: Theme[];
  activeThemeId: string;
};

function toPayload(themes: Theme[], activeThemeId: string): BoardPayload | null {
  return parseBoardPayload({ themes, activeThemeId });
}

async function readPayload(): Promise<BoardPayload | null> {
  const sql = await getSql();
  const rows = await sql<{ payload: string }>`
    select payload from workspace where id = ${WORKSPACE_ID} limit 1
  `;
  const raw = rows[0]?.payload;
  if (!raw) return null;
  try {
    return parseBoardPayload(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function writePayload(payload: BoardPayload, previous?: string) {
  const sql = await getSql();
  const next = JSON.stringify(payload);
  if (previous != null) {
    const updated = await sql<{ id: string }>`
      update workspace
      set payload = ${next}, updated_at = now()
      where id = ${WORKSPACE_ID} and payload = ${previous}
      returning id
    `;
    return updated.length > 0;
  }
  await sql`
    insert into workspace (id, payload, updated_at)
    values (${WORKSPACE_ID}, ${next}, now())
    on conflict (id) do update
      set payload = excluded.payload, updated_at = now()
  `;
  return true;
}

function assignInPayload(
  payload: BoardPayload,
  cardId: string,
  name: string,
): { card: Card; payload: BoardPayload } | null {
  const current = findCardInThemes(payload.themes, cardId);
  if (!current) return null;
  const card: Card = { ...current, assignee: name };
  return {
    card,
    payload: {
      ...payload,
      themes: payload.themes.map((theme) =>
        theme.cards[cardId]
          ? { ...theme, cards: { ...theme.cards, [cardId]: card } }
          : theme,
      ),
    },
  };
}

export const unlockWorkspace = createServerFn({ method: "POST" })
  .validator((data: { password: string }) => ({ password: data.password }))
  .handler(async ({ data }) => {
    const { unlockWithPassword } = await import("@/lib/workspace-gate.server");
    return unlockWithPassword(data.password);
  });

export const checkUnlock = createServerFn({ method: "GET" })
  .validator((data: { token: string }) => ({ token: data.token }))
  .handler(async ({ data }) => {
    try {
      const { assertUnlock } = await import("@/lib/workspace-gate.server");
      await assertUnlock(data.token);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  });

export const loadProfile = createServerFn({ method: "GET" })
  .validator((data: { deviceId: string; token: string }) => ({
    deviceId: data.deviceId.trim(),
    token: data.token,
  }))
  .handler(async ({ data }) => {
    const { assertUnlock } = await import("@/lib/workspace-gate.server");
    await assertUnlock(data.token);
    if (!data.deviceId) return { name: null };
    const sql = await getSql();
    const rows = await sql<{ name: string }>`
      select name from profiles where user_id = ${data.deviceId} limit 1
    `;
    return { name: rows[0]?.name ?? null };
  });

export const saveProfile = createServerFn({ method: "POST" })
  .validator((data: { deviceId: string; name: string; token: string }) => ({
    deviceId: data.deviceId.trim(),
    name: data.name.trim(),
    token: data.token,
  }))
  .handler(async ({ data }) => {
    const { assertUnlock } = await import("@/lib/workspace-gate.server");
    await assertUnlock(data.token);
    if (!data.deviceId || !data.name) return { name: null };
    const sql = await getSql();
    await sql`
      insert into profiles (user_id, name, updated_at)
      values (${data.deviceId}, ${data.name}, now())
      on conflict (user_id) do update
        set name = excluded.name, updated_at = now()
    `;
    return { name: data.name };
  });

export const loadWorkspace = createServerFn({ method: "GET" })
  .validator((data: { token: string }) => ({ token: data.token }))
  .handler(async ({ data }) => {
    const { assertUnlock } = await import("@/lib/workspace-gate.server");
    await assertUnlock(data.token);
    return readPayload();
  });

export const saveWorkspace = createServerFn({ method: "POST" })
  .validator((data: BoardPayload & { token: string }) => {
    const payload = toPayload(data.themes, data.activeThemeId);
    return payload ? { ...payload, token: data.token } : null;
  })
  .handler(async ({ data }) => {
    if (!data) return { ok: false };
    const { assertUnlock } = await import("@/lib/workspace-gate.server");
    await assertUnlock(data.token);
    await writePayload({
      themes: data.themes,
      activeThemeId: data.activeThemeId,
    });
    return { ok: true };
  });

export const claimAssignee = createServerFn({ method: "POST" })
  .validator((data: { cardId: string; name: string; token: string }) => ({
    cardId: data.cardId.trim(),
    name: data.name.trim(),
    token: data.token,
  }))
  .handler(async ({ data }) => {
    const { assertUnlock } = await import("@/lib/workspace-gate.server");
    await assertUnlock(data.token);
    if (!data.cardId || !data.name) {
      return { ok: false as const, reason: "invalid" as const, card: null, assignee: "" };
    }
    const sql = await getSql();
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const rows = await sql<{ payload: string }>`
        select payload from workspace where id = ${WORKSPACE_ID} limit 1
      `;
      const raw = rows[0]?.payload;
      if (!raw) {
        return { ok: false as const, reason: "missing" as const, card: null, assignee: "" };
      }
      let parsed: BoardPayload | null = null;
      try {
        parsed = parseBoardPayload(JSON.parse(raw));
      } catch {
        parsed = null;
      }
      if (!parsed) {
        return { ok: false as const, reason: "missing" as const, card: null, assignee: "" };
      }
      const existing = findCardInThemes(parsed.themes, data.cardId);
      if (!existing) {
        return { ok: false as const, reason: "missing" as const, card: null, assignee: "" };
      }
      if (existing.assignee && existing.assignee !== data.name) {
        return {
          ok: false as const,
          reason: "taken" as const,
          card: existing,
          assignee: existing.assignee,
        };
      }
      const next = assignInPayload(parsed, data.cardId, data.name);
      if (!next) {
        return { ok: false as const, reason: "missing" as const, card: null, assignee: "" };
      }
      const saved = await writePayload(next.payload, raw);
      if (saved) {
        return { ok: true as const, reason: "ok" as const, card: next.card, assignee: data.name };
      }
    }
    return { ok: false as const, reason: "conflict" as const, card: null, assignee: "" };
  });
