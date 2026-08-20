import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { n as createServerFn, r as getServerFnById, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { D as isColumnId, I as parseBoardPayload, N as normalizeCard, P as normalizeWhiteboard, _ as emptyWhiteboard, r as COLUMN_IDS } from "./kanban-CtoXHh96.mjs";
import { r as getSql } from "./db-DiNR4WL6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/board-rows.server-DSnb0Mmn.js
var board_rows_server_DSnb0Mmn_exports = /* @__PURE__ */ __exportAll({
	a: () => claimAssignee,
	c: () => loadWorkspaceAssets,
	d: () => saveWorkspaceAsset,
	f: () => unlockWorkspace,
	i: () => checkUnlock,
	l: () => saveProfile,
	n: () => board_rows_server_exports,
	o: () => loadProfile,
	r: () => readAssetData,
	s: () => loadWorkspace,
	t: () => ASSET_ID,
	u: () => saveWorkspace
});
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var WORKSPACE_ID = "ledger";
var ASSET_ID$1 = /^[a-zA-Z0-9_-]{1,64}$/;
function toPayload(themes, activeThemeId) {
	return parseBoardPayload({
		themes,
		activeThemeId
	});
}
var unlockWorkspace = createServerFn({ method: "POST" }).validator((data) => ({ password: data.password })).handler(createSsrRpc("e043004a1e625ef71bb8a319e726e2a6574b8d211431602bf7b7c4a174566064"));
var checkUnlock = createServerFn({ method: "GET" }).validator((data) => ({ token: data.token })).handler(createSsrRpc("51f5552fb820119e0a514ca208265578c61b02884217497e7618f9746b49794f"));
var loadProfile = createServerFn({ method: "GET" }).validator((data) => ({
	deviceId: data.deviceId.trim(),
	token: data.token
})).handler(createSsrRpc("093fbe9fe1e23d72bd0109bbb86290536086600e843ca672b7cc613fbb41b395"));
var saveProfile = createServerFn({ method: "POST" }).validator((data) => ({
	deviceId: data.deviceId.trim(),
	name: data.name.trim(),
	token: data.token
})).handler(createSsrRpc("687797a3e0b2bfbd6298de7d11379a460c34785f69758cda4866ba980a304db6"));
var loadWorkspace = createServerFn({ method: "GET" }).validator((data) => ({
	token: data.token,
	version: typeof data.version === "number" && Number.isFinite(data.version) ? data.version : 0
})).handler(createSsrRpc("f250419c7022b908c9f63ff8099f0bc681d9b71bf0e24647a9a9d5c2790db76e"));
var saveWorkspace = createServerFn({ method: "POST" }).validator((data) => {
	const payload = toPayload(data.themes, data.activeThemeId);
	if (!payload) return null;
	return {
		...payload,
		token: data.token,
		version: typeof data.version === "number" && Number.isFinite(data.version) ? data.version : 0
	};
}).handler(createSsrRpc("660d2259743bff2cfcb01f2c7c91b27e572662697a890056662344f43b58751d"));
var loadWorkspaceAssets = createServerFn({ method: "POST" }).validator((data) => ({
	ids: [...new Set(data.ids.map((id) => id.trim()).filter((id) => ASSET_ID$1.test(id)))].slice(0, 80),
	token: data.token
})).handler(createSsrRpc("9b57039195d044ca1a21623b669d5a36f9558f3949f3959fdb2e9f4bdcfa71ce"));
var saveWorkspaceAsset = createServerFn({ method: "POST" }).validator((data) => ({
	id: data.id.trim(),
	data: data.data,
	token: data.token
})).handler(createSsrRpc("38e9d27e256402519ac1ea676381a4cc074afaf76a76bbafecf00f5b02dd3e03"));
var claimAssignee = createServerFn({ method: "POST" }).validator((data) => ({
	cardId: data.cardId.trim(),
	name: data.name.trim(),
	token: data.token
})).handler(createSsrRpc("d8f25b32c763671aa1782e0faed9445b12dee6581e7cd6856e7f28527a33f530"));
var board_rows_server_exports = /* @__PURE__ */ __exportAll$1({
	ASSET_ID: () => ASSET_ID,
	assembleBoard: () => assembleBoard,
	claimCardRow: () => claimCardRow,
	ensureBoardRows: () => ensureBoardRows,
	loadNormalized: () => loadNormalized,
	persistNormalizedBoard: () => persistNormalizedBoard,
	readAssetData: () => readAssetData
});
var ASSET_ID = /^[a-zA-Z0-9_-]{1,64}$/;
var FULL_AFTER_GAP = 40;
var FULL_AFTER_CHANGES = 80;
function emptyOrder() {
	return {
		backlog: [],
		planning: [],
		todo: [],
		doing: [],
		review: [],
		done: []
	};
}
function asInt(value) {
	if (value === true) return 1;
	if (value === false || value == null) return 0;
	return Number(value) ? 1 : 0;
}
function parseImages(raw) {
	try {
		const value = JSON.parse(raw);
		if (!value || typeof value !== "object" || Array.isArray(value)) return {};
		return Object.fromEntries(Object.entries(value).filter((entry) => typeof entry[1] === "string"));
	} catch {
		return {};
	}
}
function parseBlockedBy(raw) {
	try {
		const value = JSON.parse(raw);
		return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
	} catch {
		return [];
	}
}
function cardFromRow(row) {
	return normalizeCard({
		id: row.id,
		title: row.title,
		description: row.description,
		details: row.details,
		images: parseImages(row.images),
		blocked: Boolean(asInt(row.blocked)),
		urgent: Boolean(asInt(row.urgent)),
		jiraUrl: row.jira_url,
		prUrl: row.pr_url,
		assignee: row.assignee,
		duration: typeof row.duration === "number" ? row.duration : null,
		prAlert: Boolean(asInt(row.pr_alert)),
		blockedBy: parseBlockedBy(row.blocked_by),
		createdAt: Number(row.created_at) || Date.now()
	});
}
function themeFingerprint(theme, position) {
	return JSON.stringify({
		name: theme.name,
		notice: theme.notice,
		position,
		whiteboard: theme.whiteboard ?? emptyWhiteboard()
	});
}
function cardFingerprint(card, columnId, position) {
	return JSON.stringify({
		columnId,
		position,
		title: card.title,
		description: card.description,
		details: card.details,
		images: card.images,
		blocked: card.blocked,
		urgent: card.urgent,
		jiraUrl: card.jiraUrl,
		prUrl: card.prUrl,
		assignee: card.assignee,
		duration: card.duration,
		prAlert: card.prAlert,
		blockedBy: card.blockedBy,
		createdAt: card.createdAt
	});
}
function rowThemeFingerprint(row) {
	return JSON.stringify({
		name: row.name,
		notice: row.notice,
		position: Number(row.position),
		whiteboard: normalizeWhiteboard(safeJson(row.whiteboard))
	});
}
function rowCardFingerprint(row) {
	const card = cardFromRow(row);
	if (!card) return "";
	return cardFingerprint(card, row.column_id, Number(row.position));
}
function safeJson(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		return {};
	}
}
async function ensureBoardRows() {
	const sql = await getSql();
	if (asInt((await sql`
    select migrated from board_meta where id = ${"ledger"} limit 1
  `)[0]?.migrated)) return;
	const existing = await sql`
    select payload from workspace where id = ${WORKSPACE_ID} limit 1
  `;
	let parsed = null;
	try {
		parsed = existing[0]?.payload ? parseBoardPayload(JSON.parse(existing[0].payload)) : null;
	} catch {
		parsed = null;
	}
	if (parsed) await writeRows(parsed.themes, parsed.activeThemeId, 1, true);
	else await sql`
      insert into board_meta (id, active_theme_id, migrated)
      values (${WORKSPACE_ID}, ${""}, 1)
      on conflict (id) do update
        set migrated = 1
    `;
}
async function writeRows(themes, activeThemeId, rev, force) {
	const sql = await getSql();
	const themeRows = await sql`select * from board_themes`;
	const cardRows = await sql`select * from board_cards`;
	const themeById = new Map(themeRows.map((row) => [row.id, row]));
	const cardById = new Map(cardRows.map((row) => [row.id, row]));
	const incomingThemeIds = new Set(themes.map((theme) => theme.id));
	const incomingCardIds = /* @__PURE__ */ new Set();
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
	for (const theme of themes) for (const columnId of COLUMN_IDS) {
		const ids = theme.order[columnId] ?? [];
		for (const [position, cardId] of ids.entries()) {
			const card = theme.cards[cardId];
			if (!card) continue;
			incomingCardIds.add(card.id);
			const nextPrint = cardFingerprint(card, columnId, position);
			const prev = cardById.get(card.id);
			if (!force && prev && rowCardFingerprint(prev) === nextPrint && prev.theme_id === theme.id) continue;
			await sql`
          insert into board_cards (
            id, theme_id, column_id, position, title, description, details, images,
            blocked, urgent, jira_url, pr_url, assignee, duration, pr_alert, blocked_by,
            created_at, rev, updated_at
          ) values (
            ${card.id}, ${theme.id}, ${columnId}, ${position}, ${card.title}, ${card.description},
            ${card.details}, ${JSON.stringify(card.images)}, ${card.blocked ? 1 : 0}, ${card.urgent ? 1 : 0},
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
async function assembleBoard() {
	const sql = await getSql();
	const themeRows = await sql`
    select * from board_themes order by position, id
  `;
	if (!themeRows.length) return null;
	const cardRows = await sql`
    select * from board_cards order by theme_id, column_id, position, id
  `;
	const meta = await sql`
    select active_theme_id from board_meta where id = ${WORKSPACE_ID} limit 1
  `;
	const byTheme = /* @__PURE__ */ new Map();
	for (const row of cardRows) {
		const list = byTheme.get(row.theme_id) ?? [];
		list.push(row);
		byTheme.set(row.theme_id, list);
	}
	const themes = [];
	for (const row of themeRows) {
		const cards = {};
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
			order
		});
	}
	return {
		themes,
		activeThemeId: meta[0]?.active_theme_id && themes.some((theme) => theme.id === meta[0].active_theme_id) ? meta[0].active_theme_id : themes[0]?.id ?? ""
	};
}
async function persistNormalizedBoard(themes, activeThemeId, expectedVersion) {
	await ensureBoardRows();
	const sql = await getSql();
	if (expectedVersion <= 0) {
		const existing = await sql`
      select version from workspace where id = ${WORKSPACE_ID} limit 1
    `;
		if (existing[0] && await assembleBoard()) return {
			ok: false,
			reason: "conflict",
			version: Number(existing[0].version) || 1
		};
		await writeRows(themes, activeThemeId, 1, true);
		await sql`
      insert into workspace (id, payload, version, updated_at)
      values (${WORKSPACE_ID}, ${"{\"normalized\":true}"}, 1, datetime('now'))
      on conflict (id) do update set
        payload = excluded.payload,
        version = 1,
        updated_at = datetime('now')
    `;
		return {
			ok: true,
			version: 1
		};
	}
	const updated = await sql`
    update workspace
    set payload = ${"{\"normalized\":true}"}, version = version + 1, updated_at = datetime('now')
    where id = ${WORKSPACE_ID} and version = ${expectedVersion}
    returning version
  `;
	if (!updated[0]) {
		const current = await sql`
      select version from workspace where id = ${WORKSPACE_ID} limit 1
    `;
		return {
			ok: false,
			reason: "conflict",
			version: Number(current[0]?.version) || expectedVersion
		};
	}
	const version = Number(updated[0].version);
	await writeRows(themes, activeThemeId, version, false);
	return {
		ok: true,
		version
	};
}
async function loadNormalized(clientVersion) {
	await ensureBoardRows();
	const row = await (await getSql())`
    select version from workspace where id = ${WORKSPACE_ID} limit 1
  `;
	if (!row[0]) {
		const assembled = await assembleBoard();
		if (!assembled) return { status: "empty" };
		return {
			status: "ok",
			version: 1,
			...assembled
		};
	}
	const version = Number(row[0].version) || 1;
	if (clientVersion > 0 && clientVersion === version) return {
		status: "unchanged",
		version
	};
	const assembled = await assembleBoard();
	if (!assembled) return { status: "empty" };
	if (clientVersion <= 0 || version - clientVersion > FULL_AFTER_GAP) return {
		status: "ok",
		version,
		...assembled
	};
	const delta = await readDelta(clientVersion, version, assembled);
	if (!delta) return {
		status: "ok",
		version,
		...assembled
	};
	if (delta.upsertCards.length + delta.deletedCardIds.length + delta.upsertThemes.length > FULL_AFTER_CHANGES) return {
		status: "ok",
		version,
		...assembled
	};
	return {
		status: "delta",
		...delta
	};
}
async function readDelta(since, version, assembled) {
	const sql = await getSql();
	const themeRows = await sql`
    select * from board_themes where rev > ${since}
  `;
	const cardRows = await sql`
    select * from board_cards where rev > ${since}
  `;
	const tombs = await sql`
    select id, kind from board_tombstones where rev > ${since}
  `;
	if (!themeRows.length && !cardRows.length && !tombs.length) return {
		version,
		activeThemeId: assembled.activeThemeId,
		upsertThemes: [],
		upsertCards: [],
		deletedCardIds: [],
		deletedThemeIds: [],
		orders: {}
	};
	const deletedCardIds = tombs.filter((row) => row.kind === "card").map((row) => row.id);
	const deletedThemeIds = tombs.filter((row) => row.kind === "theme").map((row) => row.id);
	const upsertThemes = themeRows.map((row) => ({
		id: row.id,
		name: row.name,
		notice: row.notice,
		whiteboard: normalizeWhiteboard(safeJson(row.whiteboard))
	}));
	const upsertCards = [];
	for (const row of cardRows) {
		const card = cardFromRow(row);
		if (!card || !isColumnId(row.column_id)) continue;
		upsertCards.push({
			themeId: row.theme_id,
			columnId: row.column_id,
			card
		});
	}
	const touched = /* @__PURE__ */ new Set([...themeRows.map((row) => row.id), ...cardRows.map((row) => row.theme_id)]);
	const orders = {};
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
		orders
	};
}
async function claimCardRow(cardId, name) {
	await ensureBoardRows();
	const sql = await getSql();
	const row = (await sql`
    select * from board_cards where id = ${cardId} limit 1
  `)[0];
	const existing = row ? cardFromRow(row) : null;
	if (!row || !existing) return {
		ok: false,
		reason: "missing",
		card: null,
		assignee: "",
		version: 0
	};
	if (row.assignee && row.assignee !== name) return {
		ok: false,
		reason: "taken",
		card: existing,
		assignee: row.assignee,
		version: await currentVersion()
	};
	const bumped = await sql`
    update workspace
    set version = version + 1, updated_at = datetime('now')
    where id = ${WORKSPACE_ID}
    returning version
  `;
	const version = Number(bumped[0]?.version) || await currentVersion();
	await sql`
    update board_cards
    set assignee = ${name}, rev = ${version}, updated_at = datetime('now')
    where id = ${cardId}
  `;
	const next = await sql`select * from board_cards where id = ${cardId} limit 1`;
	return {
		ok: true,
		reason: "ok",
		card: (next[0] ? cardFromRow(next[0]) : existing) ?? existing,
		assignee: name,
		version
	};
}
async function currentVersion() {
	const rows = await (await getSql())`
    select version from workspace where id = ${WORKSPACE_ID} limit 1
  `;
	return Number(rows[0]?.version) || 1;
}
async function readAssetData(id) {
	return (await (await getSql())`
    select data from workspace_assets where id = ${id} limit 1
  `)[0]?.data ?? null;
}
//#endregion
export { loadProfile as a, readAssetData as c, saveWorkspaceAsset as d, unlockWorkspace as f, claimAssignee as i, saveProfile as l, board_rows_server_DSnb0Mmn_exports as n, loadWorkspace as o, checkUnlock as r, loadWorkspaceAssets as s, ASSET_ID as t, saveWorkspace as u };
