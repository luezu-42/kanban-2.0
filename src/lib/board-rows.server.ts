import { getSql } from "@/lib/db";
import type { BoardDelta } from "@/lib/board-delta";
import {
  COLUMN_IDS,
  type Card,
  type ColumnId,
  type Theme,
  isColumnId,
  normalizeCard,
  parseBoardPayload,
} from "@/lib/kanban";
import {
  emptyWhiteboard,
  normalizeWhiteboard,
  type WhiteboardDoc,
} from "@/lib/whiteboard";
import { WORKSPACE_ID } from "@/lib/workspace";

type ThemeRow = {
  id: string;
  name: string;
  notice: string;
  whiteboard: string;
  position: number;
  rev: number;
};

type CardRow = {
  id: string;
  theme_id: string;
  column_id: string;
  position: number;
  title: string;
  description: string;
  details: string;
  images: string;
  blocked: number | boolean;
  urgent: number | boolean;
  waiting?: number | boolean;
  waiting_note?: string;
  jira_url: string;
  pr_url: string;
  assignee: string;
  duration: number | null;
  pr_alert: number | boolean;
  blocked_by: string;
  created_at: number;
  rev: number;
};

export const ASSET_ID = /^[a-zA-Z0-9_-]{1,64}$/;
const FULL_AFTER_GAP = 40;
const FULL_AFTER_CHANGES = 80;

function emptyOrder(): Record<ColumnId, string[]> {
  return {
    backlog: [],
    planning: [],
    todo: [],
    doing: [],
    review: [],
    done: [],
  };
}

function asInt(value: number | boolean | string | null | undefined) {
  if (value === true) return 1;
  if (value === false || value == null) return 0;
  return Number(value) ? 1 : 0;
}

function parseImages(raw: string): Record<string, string> {
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
  } catch {
    return {};
  }
}

function parseBlockedBy(raw: string): string[] {
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function cardFromRow(row: CardRow): Card | null {
  return normalizeCard({
    id: row.id,
    title: row.title,
    description: row.description,
    details: row.details,
    images: parseImages(row.images),
    blocked: Boolean(asInt(row.blocked)),
    urgent: Boolean(asInt(row.urgent)),
    waiting: Boolean(asInt(row.waiting ?? 0)),
    waitingNote: typeof row.waiting_note === "string" ? row.waiting_note : "",
    jiraUrl: row.jira_url,
    prUrl: row.pr_url,
    assignee: row.assignee,
    duration: typeof row.duration === "number" ? row.duration : null,
    prAlert: Boolean(asInt(row.pr_alert)),
    blockedBy: parseBlockedBy(row.blocked_by),
    createdAt: Number(row.created_at) || Date.now(),
  });
}

function themeFingerprint(theme: Theme, position: number) {
  return JSON.stringify({
    name: theme.name,
    notice: theme.notice,
    position,
    whiteboard: theme.whiteboard ?? emptyWhiteboard(),
  });
}

function cardFingerprint(card: Card, columnId: string, position: number) {
  return JSON.stringify({
    columnId,
    position,
    title: card.title,
    description: card.description,
    details: card.details,
    images: card.images,
    blocked: card.blocked,
    urgent: card.urgent,
    waiting: card.waiting,
    waitingNote: card.waitingNote,
    jiraUrl: card.jiraUrl,
    prUrl: card.prUrl,
    assignee: card.assignee,
    duration: card.duration,
    prAlert: card.prAlert,
    blockedBy: card.blockedBy,
    createdAt: card.createdAt,
  });
}

function rowThemeFingerprint(row: ThemeRow) {
  return JSON.stringify({
    name: row.name,
    notice: row.notice,
    position: Number(row.position),
    whiteboard: normalizeWhiteboard(safeJson(row.whiteboard)),
  });
}

function rowCardFingerprint(row: CardRow) {
  const card = cardFromRow(row);
  if (!card) return "";
  return cardFingerprint(card, row.column_id, Number(row.position));
}

function safeJson(raw: string) {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return {};
  }
}

export async function ensureBoardRows() {
  const sql = await getSql();
  const meta = await sql<{ migrated: number | boolean }>`
    select migrated from board_meta where id = ${WORKSPACE_ID} limit 1
  `;
  if (asInt(meta[0]?.migrated)) return;

  const existing = await sql<{ payload: string }>`
    select payload from workspace where id = ${WORKSPACE_ID} limit 1
  `;
  let parsed: { themes: Theme[]; activeThemeId: string } | null = null;
  try {
    parsed = existing[0]?.payload
      ? parseBoardPayload(JSON.parse(existing[0].payload))
      : null;
  } catch {
    parsed = null;
  }

  if (parsed) {
    await writeRows(parsed.themes, parsed.activeThemeId, 1, true);
  } else {
    await sql`
      insert into board_meta (id, active_theme_id, migrated)
      values (${WORKSPACE_ID}, ${""}, 1)
      on conflict (id) do update
        set migrated = 1
    `;
  }
}

async function writeRows(
  themes: Theme[],
  activeThemeId: string,
  rev: number,
  force: boolean,
) {
  const sql = await getSql();
  const themeRows = await sql<ThemeRow>`select * from board_themes`;
  const cardRows = await sql<CardRow>`select * from board_cards`;
  const themeById = new Map(themeRows.map((row) => [row.id, row]));
  const cardById = new Map(cardRows.map((row) => [row.id, row]));
  const incomingThemeIds = new Set(themes.map((theme) => theme.id));
  const incomingCardIds = new Set<string>();

  for (const [index, theme] of themes.entries()) {
    const nextPrint = themeFingerprint(theme, index);
    const prev = themeById.get(theme.id);
    if (!force && prev && rowThemeFingerprint(prev) === nextPrint) continue;
    const whiteboard = JSON.stringify(theme.whiteboard ?? emptyWhiteboard());
    await sql`
      insert into board_themes (id, name, notice, whiteboard, position, rev, updated_at)
      values (${theme.id}, ${theme.name}, ${theme.notice}, ${whiteboard}, ${index}, ${rev}, datetime('now'))
      on conflict (id) do update set
        name = excluded.name,
        notice = excluded.notice,
        whiteboard = excluded.whiteboard,
        position = excluded.position,
        rev = excluded.rev,
        updated_at = datetime('now')
    `;
    await sql`delete from board_tombstones where id = ${theme.id}`;
  }

  for (const theme of themes) {
    for (const columnId of COLUMN_IDS) {
      const ids = theme.order[columnId] ?? [];
      for (const [position, cardId] of ids.entries()) {
        const card = theme.cards[cardId];
        if (!card) continue;
        incomingCardIds.add(card.id);
        const nextPrint = cardFingerprint(card, columnId, position);
        const prev = cardById.get(card.id);
        if (!force && prev && rowCardFingerprint(prev) === nextPrint && prev.theme_id === theme.id) {
          continue;
        }
        await sql`
          insert into board_cards (
            id, theme_id, column_id, position, title, description, details, images,
            blocked, urgent, waiting, waiting_note, jira_url, pr_url, assignee, duration, pr_alert, blocked_by,
            created_at, rev, updated_at
          ) values (
            ${card.id}, ${theme.id}, ${columnId}, ${position}, ${card.title}, ${card.description},
            ${card.details}, ${JSON.stringify(card.images)}, ${card.blocked ? 1 : 0}, ${card.urgent ? 1 : 0},
            ${card.waiting ? 1 : 0}, ${card.waitingNote},
            ${card.jiraUrl}, ${card.prUrl}, ${card.assignee}, ${card.duration}, ${card.prAlert ? 1 : 0},
            ${JSON.stringify(card.blockedBy)}, ${card.createdAt}, ${rev}, datetime('now')
          )
          on conflict (id) do update set
            theme_id = excluded.theme_id,
            column_id = excluded.column_id,
            position = excluded.position,
            title = excluded.title,
            description = excluded.description,
            details = excluded.details,
            images = excluded.images,
            blocked = excluded.blocked,
            urgent = excluded.urgent,
            waiting = excluded.waiting,
            waiting_note = excluded.waiting_note,
            jira_url = excluded.jira_url,
            pr_url = excluded.pr_url,
            assignee = excluded.assignee,
            duration = excluded.duration,
            pr_alert = excluded.pr_alert,
            blocked_by = excluded.blocked_by,
            created_at = excluded.created_at,
            rev = excluded.rev,
            updated_at = datetime('now')
        `;
        await sql`delete from board_tombstones where id = ${card.id}`;
      }
    }
  }

  for (const row of cardRows) {
    if (incomingCardIds.has(row.id)) continue;
    await sql`delete from board_cards where id = ${row.id}`;
    await sql`
      insert into board_tombstones (id, kind, rev)
      values (${row.id}, ${"card"}, ${rev})
      on conflict (id) do update set kind = ${"card"}, rev = ${rev}
    `;
  }
  for (const row of themeRows) {
    if (incomingThemeIds.has(row.id)) continue;
    await sql`delete from board_themes where id = ${row.id}`;
    await sql`delete from board_cards where theme_id = ${row.id}`;
    await sql`
      insert into board_tombstones (id, kind, rev)
      values (${row.id}, ${"theme"}, ${rev})
      on conflict (id) do update set kind = ${"theme"}, rev = ${rev}
    `;
  }

  await sql`
    insert into board_meta (id, active_theme_id, migrated)
    values (${WORKSPACE_ID}, ${activeThemeId}, 1)
    on conflict (id) do update set
      active_theme_id = excluded.active_theme_id,
      migrated = 1
  `;
}

export async function assembleBoard(): Promise<{
  themes: Theme[];
  activeThemeId: string;
} | null> {
  const sql = await getSql();
  const themeRows = await sql<ThemeRow>`
    select * from board_themes order by position, id
  `;
  if (!themeRows.length) return null;
  const cardRows = await sql<CardRow>`
    select * from board_cards order by theme_id, column_id, position, id
  `;
  const meta = await sql<{ active_theme_id: string }>`
    select active_theme_id from board_meta where id = ${WORKSPACE_ID} limit 1
  `;

  const byTheme = new Map<string, CardRow[]>();
  for (const row of cardRows) {
    const list = byTheme.get(row.theme_id) ?? [];
    list.push(row);
    byTheme.set(row.theme_id, list);
  }

  const themes: Theme[] = [];
  for (const row of themeRows) {
    const cards: Record<string, Card> = {};
    const order = emptyOrder();
    for (const cardRow of byTheme.get(row.id) ?? []) {
      const card = cardFromRow(cardRow);
      if (!card) continue;
      cards[card.id] = card;
      const columnId = isColumnId(cardRow.column_id) ? cardRow.column_id : "backlog";
      if (!order[columnId].includes(card.id)) order[columnId].push(card.id);
    }
    themes.push({
      id: row.id,
      name: row.name,
      notice: row.notice,
      whiteboard: normalizeWhiteboard(safeJson(row.whiteboard)),
      cards,
      order,
    });
  }

  const activeThemeId =
    meta[0]?.active_theme_id && themes.some((theme) => theme.id === meta[0]!.active_theme_id)
      ? meta[0]!.active_theme_id
      : (themes[0]?.id ?? "");
  return { themes, activeThemeId };
}

export async function persistNormalizedBoard(
  themes: Theme[],
  activeThemeId: string,
  expectedVersion: number,
): Promise<{ ok: true; version: number } | { ok: false; reason: "conflict"; version: number } | { ok: false; reason: "invalid" }> {
  await ensureBoardRows();
  const sql = await getSql();

  if (expectedVersion <= 0) {
    const existing = await sql<{ version: number | string }>`
      select version from workspace where id = ${WORKSPACE_ID} limit 1
    `;
    if (existing[0] && (await assembleBoard())) {
      return { ok: false, reason: "conflict", version: Number(existing[0].version) || 1 };
    }
    await writeRows(themes, activeThemeId, 1, true);
    await sql`
      insert into workspace (id, payload, version, updated_at)
      values (${WORKSPACE_ID}, ${"{\"normalized\":true}"}, 1, datetime('now'))
      on conflict (id) do update set
        payload = excluded.payload,
        version = 1,
        updated_at = datetime('now')
    `;
    return { ok: true, version: 1 };
  }

  const updated = await sql<{ version: number | string }>`
    update workspace
    set payload = ${"{\"normalized\":true}"}, version = version + 1, updated_at = datetime('now')
    where id = ${WORKSPACE_ID} and version = ${expectedVersion}
    returning version
  `;
  if (!updated[0]) {
    const current = await sql<{ version: number | string }>`
      select version from workspace where id = ${WORKSPACE_ID} limit 1
    `;
    return { ok: false, reason: "conflict", version: Number(current[0]?.version) || expectedVersion };
  }
  const version = Number(updated[0].version);
  await writeRows(themes, activeThemeId, version, false);
  return { ok: true, version };
}

export async function loadNormalized(
  clientVersion: number,
): Promise<
  | { status: "empty" }
  | { status: "unchanged"; version: number }
  | { status: "ok"; version: number; themes: Theme[]; activeThemeId: string }
  | ({ status: "delta" } & BoardDelta)
> {
  await ensureBoardRows();
  const sql = await getSql();
  const row = await sql<{ version: number | string }>`
    select version from workspace where id = ${WORKSPACE_ID} limit 1
  `;
  if (!row[0]) {
    const assembled = await assembleBoard();
    if (!assembled) return { status: "empty" };
    return { status: "ok", version: 1, ...assembled };
  }
  const version = Number(row[0].version) || 1;
  if (clientVersion > 0 && clientVersion === version) {
    return { status: "unchanged", version };
  }

  const assembled = await assembleBoard();
  if (!assembled) return { status: "empty" };

  const preferFull =
    clientVersion <= 0 ||
    version - clientVersion > FULL_AFTER_GAP;
  if (preferFull) return { status: "ok", version, ...assembled };

  const delta = await readDelta(clientVersion, version, assembled);
  if (!delta) return { status: "ok", version, ...assembled };
  if (
    delta.upsertCards.length + delta.deletedCardIds.length + delta.upsertThemes.length >
    FULL_AFTER_CHANGES
  ) {
    return { status: "ok", version, ...assembled };
  }
  return { status: "delta", ...delta };
}

async function readDelta(
  since: number,
  version: number,
  assembled: { themes: Theme[]; activeThemeId: string },
): Promise<BoardDelta | null> {
  const sql = await getSql();
  const themeRows = await sql<ThemeRow>`
    select * from board_themes where rev > ${since}
  `;
  const cardRows = await sql<CardRow>`
    select * from board_cards where rev > ${since}
  `;
  const tombs = await sql<{ id: string; kind: string }>`
    select id, kind from board_tombstones where rev > ${since}
  `;

  if (!themeRows.length && !cardRows.length && !tombs.length) {
    return {
      version,
      activeThemeId: assembled.activeThemeId,
      upsertThemes: [],
      upsertCards: [],
      deletedCardIds: [],
      deletedThemeIds: [],
      orders: {},
    };
  }

  const deletedCardIds = tombs.filter((row) => row.kind === "card").map((row) => row.id);
  const deletedThemeIds = tombs.filter((row) => row.kind === "theme").map((row) => row.id);
  const upsertThemes = themeRows.map((row) => ({
    id: row.id,
    name: row.name,
    notice: row.notice,
    whiteboard: normalizeWhiteboard(safeJson(row.whiteboard)) as WhiteboardDoc,
  }));

  const upsertCards: BoardDelta["upsertCards"] = [];
  for (const row of cardRows) {
    const card = cardFromRow(row);
    if (!card || !isColumnId(row.column_id)) continue;
    upsertCards.push({ themeId: row.theme_id, columnId: row.column_id, card });
  }

  const touched = new Set<string>([
    ...themeRows.map((row) => row.id),
    ...cardRows.map((row) => row.theme_id),
  ]);
  const orders: BoardDelta["orders"] = {};
  for (const theme of assembled.themes) {
    if (!touched.has(theme.id)) continue;
    orders[theme.id] = theme.order;
  }

  return {
    version,
    activeThemeId: assembled.activeThemeId,
    upsertThemes,
    upsertCards,
    deletedCardIds,
    deletedThemeIds,
    orders,
  };
}

export async function claimCardRow(cardId: string, name: string) {
  await ensureBoardRows();
  const sql = await getSql();
  const rows = await sql<CardRow>`
    select * from board_cards where id = ${cardId} limit 1
  `;
  const row = rows[0];
  const existing = row ? cardFromRow(row) : null;
  if (!row || !existing) {
    return { ok: false as const, reason: "missing" as const, card: null, assignee: "", version: 0 };
  }
  if (row.assignee && row.assignee !== name) {
    return {
      ok: false as const,
      reason: "taken" as const,
      card: existing,
      assignee: row.assignee,
      version: await currentVersion(),
    };
  }
  const bumped = await sql<{ version: number | string }>`
    update workspace
    set version = version + 1, updated_at = datetime('now')
    where id = ${WORKSPACE_ID}
    returning version
  `;
  const version = Number(bumped[0]?.version) || (await currentVersion());
  await sql`
    update board_cards
    set assignee = ${name}, rev = ${version}, updated_at = datetime('now')
    where id = ${cardId}
  `;
  const next = await sql<CardRow>`select * from board_cards where id = ${cardId} limit 1`;
  const card = (next[0] ? cardFromRow(next[0]) : existing) ?? existing;
  return {
    ok: true as const,
    reason: "ok" as const,
    card,
    assignee: name,
    version,
  };
}

async function currentVersion() {
  const sql = await getSql();
  const rows = await sql<{ version: number | string }>`
    select version from workspace where id = ${WORKSPACE_ID} limit 1
  `;
  return Number(rows[0]?.version) || 1;
}

export async function readAssetData(id: string) {
  const sql = await getSql();
  const rows = await sql<{ data: string }>`
    select data from workspace_assets where id = ${id} limit 1
  `;
  return rows[0]?.data ?? null;
}
