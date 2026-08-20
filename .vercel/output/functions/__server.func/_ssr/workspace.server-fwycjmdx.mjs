import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { A as listWhiteboardImages, B as replaceWhiteboardImages, E as isAllowedImageDataUrl, I as parseBoardPayload, q as whiteboardFileAssetId, t as ASSET_PREFIX } from "./kanban-CtoXHh96.mjs";
import { r as getSql } from "./db-DiNR4WL6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workspace.server-fwycjmdx.js
var workspace_server_fwycjmdx_exports = /* @__PURE__ */ __exportAll({
	n: () => workspace_server_exports,
	t: () => commitWorkspacePayload
});
var workspace_server_exports = /* @__PURE__ */ __exportAll$1({
	ASSET_ID: () => ASSET_ID,
	WORKSPACE_ID: () => WORKSPACE_ID,
	claimCard: () => claimCard,
	commitWorkspacePayload: () => commitWorkspacePayload,
	loadWorkspaceSnapshot: () => loadWorkspaceSnapshot,
	readAssets: () => readAssets,
	readProfileName: () => readProfileName,
	saveAsset: () => saveAsset,
	writeProfileName: () => writeProfileName
});
var ASSET_ID = /^[a-zA-Z0-9_-]{1,64}$/;
function toPayload(themes, activeThemeId) {
	return parseBoardPayload({
		themes,
		activeThemeId
	});
}
async function upsertAsset(id, data) {
	await (await getSql())`
    insert into workspace_assets (id, data, updated_at)
    values (${id}, ${data}, datetime('now'))
    on conflict (id) do update
      set data = excluded.data, updated_at = datetime('now')
  `;
}
function asAssetId(id) {
	return ASSET_ID.test(id) ? id : "";
}
async function extractWhiteboardAssets(themes) {
	let changed = false;
	const next = [];
	for (const theme of themes) {
		const images = listWhiteboardImages(theme.whiteboard);
		if (!images.length) {
			next.push(theme);
			continue;
		}
		const srcById = /* @__PURE__ */ new Map();
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
		next.push(themeChanged ? {
			...theme,
			whiteboard: replaceWhiteboardImages(theme.whiteboard, srcById)
		} : theme);
	}
	return changed ? next : themes;
}
async function extractCardImages(themes) {
	let changed = false;
	const next = [];
	for (const theme of themes) {
		let themeChanged = false;
		const cards = { ...theme.cards };
		for (const card of Object.values(theme.cards)) {
			const images = {};
			let cardChanged = false;
			for (const [id, src] of Object.entries(card.images)) {
				if (src.startsWith("asset:")) {
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
			cards[card.id] = {
				...card,
				images
			};
			themeChanged = true;
			changed = true;
		}
		next.push(themeChanged ? {
			...theme,
			cards
		} : theme);
	}
	return changed ? next : themes;
}
async function extractBoardAssets(themes) {
	return extractCardImages(await extractWhiteboardAssets(themes));
}
async function loadWorkspaceSnapshot(version) {
	const { loadNormalized } = await import("./board-rows.server-DSnb0Mmn.mjs").then((n) => n.n).then((n) => n.n);
	return loadNormalized(version);
}
async function commitWorkspacePayload(themes, activeThemeId, token, version = 0) {
	const { assertUnlock } = await import("./workspace-gate.server-Dj103AgU.mjs");
	await assertUnlock(token);
	const parsed = toPayload(themes, activeThemeId);
	if (!parsed) return {
		ok: false,
		reason: "invalid"
	};
	const extracted = await extractBoardAssets(parsed.themes);
	const { persistNormalizedBoard, assembleBoard } = await import("./board-rows.server-DSnb0Mmn.mjs").then((n) => n.n).then((n) => n.n);
	const saved = await persistNormalizedBoard(extracted, parsed.activeThemeId, version);
	if (saved.ok) return saved;
	if (saved.reason === "invalid") return {
		ok: false,
		reason: "invalid"
	};
	const assembled = await assembleBoard();
	if (!assembled) return {
		ok: false,
		reason: "invalid"
	};
	return {
		ok: false,
		reason: "conflict",
		...assembled,
		version: saved.version
	};
}
async function readProfileName(deviceId) {
	if (!deviceId) return { name: null };
	return { name: (await (await getSql())`
    select name from profiles where user_id = ${deviceId} limit 1
  `)[0]?.name ?? null };
}
async function writeProfileName(deviceId, name) {
	if (!deviceId || !name) return { name: null };
	await (await getSql())`
    insert into profiles (user_id, name, updated_at)
    values (${deviceId}, ${name}, datetime('now'))
    on conflict (user_id) do update
      set name = excluded.name, updated_at = datetime('now')
  `;
	return { name };
}
async function readAssets(ids) {
	if (!ids.length) return [];
	const sql = await getSql();
	const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ");
	return sql.query(`select id, data from workspace_assets where id in (${placeholders})`, ids);
}
async function saveAsset(id, data) {
	if (!asAssetId(id) || !isAllowedImageDataUrl(data) || data.length > 5e5) return { ok: false };
	await upsertAsset(id, data);
	return { ok: true };
}
async function claimCard(cardId, name) {
	if (!cardId || !name) return {
		ok: false,
		reason: "invalid",
		card: null,
		assignee: "",
		version: 0
	};
	const { claimCardRow } = await import("./board-rows.server-DSnb0Mmn.mjs").then((n) => n.n).then((n) => n.n);
	return claimCardRow(cardId, name);
}
//#endregion
export { workspace_server_fwycjmdx_exports as n, commitWorkspacePayload as t };
