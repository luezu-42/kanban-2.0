import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { g as require_jsx_runtime, n as Yi, r as io, t as IM } from "../_libs/@excalidraw/excalidraw+[...].mjs";
import { A as listWhiteboardImages, O as isLegacyWhiteboard, _ as emptyWhiteboard } from "./kanban-CtoXHh96.mjs";
import { s as loadWorkspaceAssets } from "./board-rows.server-DSnb0Mmn.mjs";
import { C as fetchAssetRows, S as ensureAssets, g as getUnlockToken, w as resolveAsset, x as assetIdFromSrc } from "./routes-COmF4DMp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/excalidraw-editor-1dTB9SKt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function asFileId$1(id) {
	return id;
}
function mimeFromSrc(src) {
	return /^data:(image\/[a-zA-Z0-9.+-]+);/i.exec(src)?.[1] ?? "image/png";
}
function migrateLegacyWhiteboard(doc) {
	const skeleton = [];
	const files = {};
	const binary = {};
	for (const node of doc.nodes) {
		if (node.type === "rect" || node.type === "ellipse" || node.type === "diamond") {
			skeleton.push({
				id: node.id,
				type: node.type === "rect" ? "rectangle" : node.type,
				x: node.x,
				y: node.y,
				width: node.w,
				height: node.h
			});
			continue;
		}
		if (node.type === "text") {
			skeleton.push({
				id: node.id,
				type: "text",
				x: node.x,
				y: node.y,
				width: node.w,
				height: node.h,
				text: node.text || " "
			});
			continue;
		}
		if (node.type === "path") {
			const origin = node.points[0] ?? [0, 0];
			skeleton.push({
				id: node.id,
				type: "line",
				x: origin[0],
				y: origin[1],
				strokeWidth: node.width,
				points: node.points.map(([x, y]) => [x - origin[0], y - origin[1]])
			});
			continue;
		}
		if (node.type !== "image") continue;
		const src = resolveAsset(node.src);
		if (!src.startsWith("data:image/")) continue;
		const fileId = asFileId$1(node.id);
		const mimeType = mimeFromSrc(src);
		files[node.id] = {
			id: node.id,
			mimeType,
			created: Date.now(),
			src: node.src
		};
		binary[node.id] = {
			id: fileId,
			dataURL: src,
			mimeType,
			created: Date.now()
		};
		skeleton.push({
			id: node.id,
			type: "image",
			x: node.x,
			y: node.y,
			width: node.w,
			height: node.h,
			fileId
		});
	}
	for (const link of doc.connectors) skeleton.push({
		id: link.id,
		type: "arrow",
		x: 0,
		y: 0,
		start: { id: link.from },
		end: { id: link.to }
	});
	const converted = Yi(skeleton, { regenerateIds: false });
	const restored = io({
		elements: converted,
		appState: {},
		files: binary
	}, null, null);
	return {
		format: "excalidraw",
		elements: JSON.parse(JSON.stringify(restored.elements.filter((el) => !el.isDeleted))),
		appState: {},
		files
	};
}
function asFileId(id) {
	return id;
}
function asMime(value) {
	return value;
}
function sceneFiles(doc) {
	const files = {};
	for (const file of Object.values(doc.files)) {
		const dataURL = resolveAsset(file.src);
		if (!dataURL.startsWith("data:image/")) continue;
		files[file.id] = {
			id: asFileId(file.id),
			dataURL,
			mimeType: asMime(file.mimeType || "image/png"),
			created: file.created || Date.now()
		};
	}
	return files;
}
function toWhiteboard(elements, appState, files) {
	const live = elements.filter((el) => !el.isDeleted);
	const used = /* @__PURE__ */ new Set();
	for (const el of live) if ("fileId" in el && typeof el.fileId === "string" && el.fileId) used.add(el.fileId);
	const nextFiles = {};
	for (const file of Object.values(files)) {
		if (!used.has(file.id)) continue;
		if (typeof file.dataURL !== "string" || !file.dataURL.startsWith("data:image/")) continue;
		nextFiles[file.id] = {
			id: file.id,
			mimeType: file.mimeType,
			created: file.created,
			src: file.dataURL
		};
	}
	return {
		format: "excalidraw",
		elements: JSON.parse(JSON.stringify(live)),
		appState: {
			viewBackgroundColor: appState.viewBackgroundColor,
			scrollX: appState.scrollX,
			scrollY: appState.scrollY,
			zoom: appState.zoom ? { value: appState.zoom.value } : void 0,
			gridSize: appState.gridSize ?? null
		},
		files: nextFiles
	};
}
async function hydrateFiles(doc) {
	const token = getUnlockToken();
	if (!token) return;
	const ids = listWhiteboardImages(doc).map((image) => assetIdFromSrc(image.src)).filter((id) => Boolean(id));
	if (!ids.length) return;
	await ensureAssets(ids, async (missing) => {
		const fromHttp = await fetchAssetRows(missing, token);
		if (fromHttp.length === missing.length) return fromHttp;
		const have = new Set(fromHttp.map((row) => row.id));
		const rest = missing.filter((id) => !have.has(id));
		if (!rest.length) return fromHttp;
		const fallback = await loadWorkspaceAssets({ data: {
			ids: rest,
			token
		} });
		return [...fromHttp, ...fallback];
	});
}
function ExcalidrawEditor({ doc, appearance, onDraft }) {
	const theme = appearance === "light" ? "light" : "dark";
	const initialDoc = (0, import_react.useRef)(doc);
	const onDraftRef = (0, import_react.useRef)(onDraft);
	const ready = (0, import_react.useRef)(false);
	onDraftRef.current = onDraft;
	const loadInitial = (0, import_react.useCallback)(async () => {
		const current = initialDoc.current;
		await hydrateFiles(current);
		const migrated = isLegacyWhiteboard(current);
		let next;
		try {
			next = isLegacyWhiteboard(current) ? migrateLegacyWhiteboard(current) : current;
		} catch {
			next = emptyWhiteboard();
		}
		if (migrated) onDraftRef.current(next, true);
		ready.current = true;
		const files = sceneFiles(next);
		const restored = io({
			elements: next.elements,
			appState: {
				...next.appState,
				theme
			},
			files
		}, { theme }, null);
		return {
			elements: restored.elements,
			appState: restored.appState,
			files: restored.files,
			scrollToContent: next.appState.scrollX == null
		};
	}, [theme]);
	const handleChange = (0, import_react.useCallback)((elements, appState, files) => {
		if (!ready.current) return;
		onDraftRef.current(toWhiteboard(elements, appState, files), false);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IM, {
		initialData: loadInitial,
		onChange: handleChange,
		theme,
		langCode: "en",
		aiEnabled: false,
		isCollaborating: false,
		handleKeyboardGlobally: true,
		generateIdForFile: async (file) => {
			const digest = await crypto.subtle.digest("SHA-1", await file.arrayBuffer());
			return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
		},
		UIOptions: { canvasActions: {
			loadScene: false,
			saveToActiveFile: false,
			toggleTheme: false,
			saveAsImage: true
		} }
	});
}
//#endregion
export { ExcalidrawEditor };
