import { n as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { I as parseBoardPayload } from "./kanban-CtoXHh96.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workspace-BAU1E2ns.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var ASSET_ID = /^[a-zA-Z0-9_-]{1,64}$/;
function toPayload(themes, activeThemeId) {
	return parseBoardPayload({
		themes,
		activeThemeId
	});
}
var unlockWorkspace_createServerFn_handler = createServerRpc({
	id: "e043004a1e625ef71bb8a319e726e2a6574b8d211431602bf7b7c4a174566064",
	name: "unlockWorkspace",
	filename: "src/lib/workspace.ts"
}, (opts) => unlockWorkspace.__executeServer(opts));
var unlockWorkspace = createServerFn({ method: "POST" }).validator((data) => ({ password: data.password })).handler(unlockWorkspace_createServerFn_handler, async ({ data }) => {
	const { unlockWithPassword } = await import("./workspace-gate.server-Dj103AgU.mjs");
	return unlockWithPassword(data.password);
});
var checkUnlock_createServerFn_handler = createServerRpc({
	id: "51f5552fb820119e0a514ca208265578c61b02884217497e7618f9746b49794f",
	name: "checkUnlock",
	filename: "src/lib/workspace.ts"
}, (opts) => checkUnlock.__executeServer(opts));
var checkUnlock = createServerFn({ method: "GET" }).validator((data) => ({ token: data.token })).handler(checkUnlock_createServerFn_handler, async ({ data }) => {
	try {
		const { assertUnlock } = await import("./workspace-gate.server-Dj103AgU.mjs");
		await assertUnlock(data.token);
		return { ok: true };
	} catch {
		return { ok: false };
	}
});
var loadProfile_createServerFn_handler = createServerRpc({
	id: "093fbe9fe1e23d72bd0109bbb86290536086600e843ca672b7cc613fbb41b395",
	name: "loadProfile",
	filename: "src/lib/workspace.ts"
}, (opts) => loadProfile.__executeServer(opts));
var loadProfile = createServerFn({ method: "GET" }).validator((data) => ({
	deviceId: data.deviceId.trim(),
	token: data.token
})).handler(loadProfile_createServerFn_handler, async ({ data }) => {
	const { assertUnlock } = await import("./workspace-gate.server-Dj103AgU.mjs");
	await assertUnlock(data.token);
	const { readProfileName } = await import("./workspace.server-fwycjmdx.mjs").then((n) => n.n).then((n) => n.n);
	return readProfileName(data.deviceId);
});
var saveProfile_createServerFn_handler = createServerRpc({
	id: "687797a3e0b2bfbd6298de7d11379a460c34785f69758cda4866ba980a304db6",
	name: "saveProfile",
	filename: "src/lib/workspace.ts"
}, (opts) => saveProfile.__executeServer(opts));
var saveProfile = createServerFn({ method: "POST" }).validator((data) => ({
	deviceId: data.deviceId.trim(),
	name: data.name.trim(),
	token: data.token
})).handler(saveProfile_createServerFn_handler, async ({ data }) => {
	const { assertUnlock } = await import("./workspace-gate.server-Dj103AgU.mjs");
	await assertUnlock(data.token);
	const { writeProfileName } = await import("./workspace.server-fwycjmdx.mjs").then((n) => n.n).then((n) => n.n);
	return writeProfileName(data.deviceId, data.name);
});
var loadWorkspace_createServerFn_handler = createServerRpc({
	id: "f250419c7022b908c9f63ff8099f0bc681d9b71bf0e24647a9a9d5c2790db76e",
	name: "loadWorkspace",
	filename: "src/lib/workspace.ts"
}, (opts) => loadWorkspace.__executeServer(opts));
var loadWorkspace = createServerFn({ method: "GET" }).validator((data) => ({
	token: data.token,
	version: typeof data.version === "number" && Number.isFinite(data.version) ? data.version : 0
})).handler(loadWorkspace_createServerFn_handler, async ({ data }) => {
	const { assertUnlock } = await import("./workspace-gate.server-Dj103AgU.mjs");
	await assertUnlock(data.token);
	const { loadWorkspaceSnapshot } = await import("./workspace.server-fwycjmdx.mjs").then((n) => n.n).then((n) => n.n);
	return loadWorkspaceSnapshot(data.version);
});
var saveWorkspace_createServerFn_handler = createServerRpc({
	id: "660d2259743bff2cfcb01f2c7c91b27e572662697a890056662344f43b58751d",
	name: "saveWorkspace",
	filename: "src/lib/workspace.ts"
}, (opts) => saveWorkspace.__executeServer(opts));
var saveWorkspace = createServerFn({ method: "POST" }).validator((data) => {
	const payload = toPayload(data.themes, data.activeThemeId);
	if (!payload) return null;
	return {
		...payload,
		token: data.token,
		version: typeof data.version === "number" && Number.isFinite(data.version) ? data.version : 0
	};
}).handler(saveWorkspace_createServerFn_handler, async ({ data }) => {
	if (!data) return {
		ok: false,
		reason: "invalid"
	};
	const { commitWorkspacePayload } = await import("./workspace.server-fwycjmdx.mjs").then((n) => n.n).then((n) => n.n);
	return commitWorkspacePayload(data.themes, data.activeThemeId, data.token, data.version);
});
var loadWorkspaceAssets_createServerFn_handler = createServerRpc({
	id: "9b57039195d044ca1a21623b669d5a36f9558f3949f3959fdb2e9f4bdcfa71ce",
	name: "loadWorkspaceAssets",
	filename: "src/lib/workspace.ts"
}, (opts) => loadWorkspaceAssets.__executeServer(opts));
var loadWorkspaceAssets = createServerFn({ method: "POST" }).validator((data) => ({
	ids: [...new Set(data.ids.map((id) => id.trim()).filter((id) => ASSET_ID.test(id)))].slice(0, 80),
	token: data.token
})).handler(loadWorkspaceAssets_createServerFn_handler, async ({ data }) => {
	const { assertUnlock } = await import("./workspace-gate.server-Dj103AgU.mjs");
	await assertUnlock(data.token);
	const { readAssets } = await import("./workspace.server-fwycjmdx.mjs").then((n) => n.n).then((n) => n.n);
	return readAssets(data.ids);
});
var saveWorkspaceAsset_createServerFn_handler = createServerRpc({
	id: "38e9d27e256402519ac1ea676381a4cc074afaf76a76bbafecf00f5b02dd3e03",
	name: "saveWorkspaceAsset",
	filename: "src/lib/workspace.ts"
}, (opts) => saveWorkspaceAsset.__executeServer(opts));
var saveWorkspaceAsset = createServerFn({ method: "POST" }).validator((data) => ({
	id: data.id.trim(),
	data: data.data,
	token: data.token
})).handler(saveWorkspaceAsset_createServerFn_handler, async ({ data }) => {
	const { assertUnlock } = await import("./workspace-gate.server-Dj103AgU.mjs");
	await assertUnlock(data.token);
	const { saveAsset } = await import("./workspace.server-fwycjmdx.mjs").then((n) => n.n).then((n) => n.n);
	return saveAsset(data.id, data.data);
});
var claimAssignee_createServerFn_handler = createServerRpc({
	id: "d8f25b32c763671aa1782e0faed9445b12dee6581e7cd6856e7f28527a33f530",
	name: "claimAssignee",
	filename: "src/lib/workspace.ts"
}, (opts) => claimAssignee.__executeServer(opts));
var claimAssignee = createServerFn({ method: "POST" }).validator((data) => ({
	cardId: data.cardId.trim(),
	name: data.name.trim(),
	token: data.token
})).handler(claimAssignee_createServerFn_handler, async ({ data }) => {
	const { assertUnlock } = await import("./workspace-gate.server-Dj103AgU.mjs");
	await assertUnlock(data.token);
	const { claimCard } = await import("./workspace.server-fwycjmdx.mjs").then((n) => n.n).then((n) => n.n);
	return claimCard(data.cardId, data.name);
});
//#endregion
export { checkUnlock_createServerFn_handler, claimAssignee_createServerFn_handler, loadProfile_createServerFn_handler, loadWorkspaceAssets_createServerFn_handler, loadWorkspace_createServerFn_handler, saveProfile_createServerFn_handler, saveWorkspaceAsset_createServerFn_handler, saveWorkspace_createServerFn_handler, unlockWorkspace_createServerFn_handler };
