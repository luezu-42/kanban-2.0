import { getSql } from "@/lib/db";
import {
  type Card,
  type Theme,
  findCardInThemes,
  parseBoardPayload,
} from "@/lib/kanban";
import { isAllowedImageDataUrl, MAX_ASSET_CHARS } from "@/lib/markdown-image";
import {
  ASSET_PREFIX,
  listWhiteboardImages,
  replaceWhiteboardImages,
  whiteboardFileAssetId,
} from "@/lib/whiteboard";
import type {
  BoardPayload,
  LoadWorkspaceResult,
  SaveWorkspaceResult,
  WorkspaceSnapshot,
} from "@/lib/workspace";

export const WORKSPACE_ID = "ledger";
const MAX_PAYLOAD_CHARS = 1_500_000;
export const ASSET_ID = /^[a-zA-Z0-9_-]{1,64}$/;

function toPayload(themes: Theme[], activeThemeId: string): BoardPayload | null {
  return parseBoardPayload({ themes, activeThemeId });
}

async function upsertAsset(id: string, data: string) {
  const sql = await getSql();
  await sql`
    insert into workspace_assets (id, data, updated_at)
    values (${id}, ${data}, datetime('now'))
    on conflict (id) do update
      set data = excluded.data, updated_at = datetime('now')
  `;
}

function asAssetId(id: string) {
  return ASSET_ID.test(id) ? id : "";
}

async function extractWhiteboardAssets(themes: Theme[]): Promise<Theme[]> {
  let changed = false;
  const next: Theme[] = [];
  for (const theme of themes) {
    const images = listWhiteboardImages(theme.whiteboard);
    if (!images.length) {
      next.push(theme);
      continue;
    }
    const srcById = new Map<string, string>();
    let themeChanged = false;
    for (const image of images) {
      if (!image.src.startsWith("data:image/")) {
        srcById.set(image.id, image.src);
        continue;
      }
      const assetId = asAssetId(whiteboardFileAssetId(image.id));
      if (!assetId || !isAllowedImageDataUrl(image.src)) continue;
      await upsertAsset(assetId, image.src);
      themeChanged = true;
      changed = true;
      srcById.set(image.id, `${ASSET_PREFIX}${assetId}`);
    }
    next.push(
      themeChanged
        ? { ...theme, whiteboard: replaceWhiteboardImages(theme.whiteboard, srcById) }
        : theme,
    );
  }
  return changed ? next : themes;
}

async function extractCardImages(themes: Theme[]): Promise<Theme[]> {
  let changed = false;
  const next: Theme[] = [];
  for (const theme of themes) {
    let themeChanged = false;
    const cards = { ...theme.cards };
    for (const card of Object.values(theme.cards)) {
      const images: Record<string, string> = {};
      let cardChanged = false;
      for (const [id, src] of Object.entries(card.images)) {
        if (src.startsWith(ASSET_PREFIX)) {
          images[id] = src;
          continue;
        }
        if (!src.startsWith("data:image/")) {
          cardChanged = true;
          continue;
        }
        const assetId = asAssetId(id);
        if (!assetId || !isAllowedImageDataUrl(src)) {
          cardChanged = true;
          continue;
        }
        await upsertAsset(assetId, src);
        images[id] = `${ASSET_PREFIX}${assetId}`;
        cardChanged = true;
      }
      if (!cardChanged) continue;
      cards[card.id] = { ...card, images };
      themeChanged = true;
      changed = true;
    }
    next.push(themeChanged ? { ...theme, cards } : theme);
  }
  return changed ? next : themes;
}

async function extractBoardAssets(themes: Theme[]) {
  return extractCardImages(await extractWhiteboardAssets(themes));
}

function parseStoredPayload(raw: string): BoardPayload | null {
  try {
    return parseBoardPayload(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function readRow(): Promise<{ payload: string; version: number } | null> {
  const sql = await getSql();
  const rows = await sql<{ payload: string; version: number | string | null }>`
    select payload, version from workspace where id = ${WORKSPACE_ID} limit 1
  `;
  const row = rows[0];
  if (!row?.payload) return null;
  return { payload: row.payload, version: Number(row.version ?? 1) || 1 };
}

async function snapshotFromRow(
  row: { payload: string; version: number },
): Promise<WorkspaceSnapshot | null> {
  const parsed = parseStoredPayload(row.payload);
  if (!parsed) return null;
  return { ...parsed, version: row.version };
}

async function writePayload(
  payload: BoardPayload,
  expectedVersion: number,
): Promise<SaveWorkspaceResult> {
  const next = JSON.stringify(payload);
  if (next.length > MAX_PAYLOAD_CHARS) {
    return { ok: false, reason: "too-large" };
  }
  const sql = await getSql();

  if (expectedVersion <= 0) {
    const existing = await readRow();
    if (existing) {
      const snapshot = await snapshotFromRow(existing);
      return snapshot
        ? { ok: false, reason: "conflict", ...snapshot }
        : { ok: false, reason: "invalid" };
    }
    await sql`
      insert into workspace (id, payload, version, updated_at)
      values (${WORKSPACE_ID}, ${next}, 1, datetime('now'))
    `;
    return { ok: true, version: 1 };
  }

  const updated = await sql<{ version: number | string }>`
    update workspace
    set payload = ${next}, version = version + 1, updated_at = datetime('now')
    where id = ${WORKSPACE_ID} and version = ${expectedVersion}
    returning version
  `;
  if (updated[0]) {
    return { ok: true, version: Number(updated[0].version) };
  }
  const current = await readRow();
  if (!current) {
    await sql`
      insert into workspace (id, payload, version, updated_at)
      values (${WORKSPACE_ID}, ${next}, 1, datetime('now'))
    `;
    return { ok: true, version: 1 };
  }
  const snapshot = await snapshotFromRow(current);
  return snapshot
    ? { ok: false, reason: "conflict", ...snapshot }
    : { ok: false, reason: "invalid" };
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

export async function loadWorkspaceSnapshot(
  version: number,
): Promise<LoadWorkspaceResult> {
  const { loadNormalized } = await import("@/lib/board-rows.server");
  return loadNormalized(version);
}

export async function commitWorkspacePayload(
  themes: Theme[],
  activeThemeId: string,
  token: string,
  version = 0,
): Promise<SaveWorkspaceResult> {
  const { assertUnlock } = await import("@/lib/workspace-gate.server");
  await assertUnlock(token);
  const parsed = toPayload(themes, activeThemeId);
  if (!parsed) return { ok: false, reason: "invalid" };
  const extracted = await extractBoardAssets(parsed.themes);
  const { persistNormalizedBoard, assembleBoard } = await import("@/lib/board-rows.server");
  const saved = await persistNormalizedBoard(
    extracted,
    parsed.activeThemeId,
    version,
  );
  if (saved.ok) return saved;
  if (saved.reason === "invalid") return { ok: false, reason: "invalid" };
  const assembled = await assembleBoard();
  if (!assembled) return { ok: false, reason: "invalid" };
  return { ok: false, reason: "conflict", ...assembled, version: saved.version };
}

export async function readProfileName(deviceId: string) {
  if (!deviceId) return { name: null as string | null };
  const sql = await getSql();
  const rows = await sql<{ name: string }>`
    select name from profiles where user_id = ${deviceId} limit 1
  `;
  return { name: rows[0]?.name ?? null };
}

export async function writeProfileName(deviceId: string, name: string) {
  if (!deviceId || !name) return { name: null as string | null };
  const sql = await getSql();
  await sql`
    insert into profiles (user_id, name, updated_at)
    values (${deviceId}, ${name}, datetime('now'))
    on conflict (user_id) do update
      set name = excluded.name, updated_at = datetime('now')
  `;
  return { name };
}

export async function readAssets(ids: string[]) {
  if (!ids.length) return [] as Array<{ id: string; data: string }>;
  const sql = await getSql();
  const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ");
  return sql.query<{ id: string; data: string }>(
    `select id, data from workspace_assets where id in (${placeholders})`,
    ids,
  );
}

export async function saveAsset(id: string, data: string) {
  if (!asAssetId(id) || !isAllowedImageDataUrl(data) || data.length > MAX_ASSET_CHARS) {
    return { ok: false };
  }
  await upsertAsset(id, data);
  return { ok: true };
}

export async function claimCard(cardId: string, name: string) {
  if (!cardId || !name) {
    return { ok: false as const, reason: "invalid" as const, card: null, assignee: "", version: 0 };
  }
  const { claimCardRow } = await import("@/lib/board-rows.server");
  return claimCardRow(cardId, name);
}
