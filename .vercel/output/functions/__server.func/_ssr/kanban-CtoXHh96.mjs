import { n as arrayMove } from "../_libs/dnd-kit__sortable.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kanban-CtoXHh96.js
var MAX_EDGE = 1280;
var TARGET_CHARS = 16e4;
var HARD_CHARS = 28e4;
var ALLOWED_DATA_IMAGE = /^data:image\/(png|jpe?g|webp|gif);base64,/i;
function isAllowedImageDataUrl(src) {
	return ALLOWED_DATA_IMAGE.test(src) && src.length <= 5e5 && !src.startsWith("data:image/svg");
}
function isImageFile(file) {
	if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) return false;
	return file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name);
}
async function fileToDataUrl(file) {
	if (!isImageFile(file)) throw new Error("Choose a PNG, JPEG, WebP, or GIF image.");
	if (file.type === "image/gif" && file.size < 28e4) return readAsDataUrl(file);
	try {
		return await compressImage(file);
	} catch {
		return readAsDataUrl(file);
	}
}
async function optimizeDataUrl(url) {
	if (!url.startsWith("data:image/") || url.startsWith("data:image/svg+xml")) return url;
	if (url.startsWith("data:image/gif") && url.length < 36e4) return url;
	if (url.startsWith("data:image/webp") && url.length <= TARGET_CHARS) return url;
	if (url.length <= 72e3) return url;
	try {
		return await compressImage(await (await fetch(url)).blob());
	} catch {
		return url;
	}
}
async function compactThemeImages(themes) {
	let changed = false;
	const next = [];
	for (const theme of themes) {
		const cards = { ...theme.cards };
		let themeChanged = false;
		for (const card of Object.values(theme.cards)) {
			const extracted = extractInlineImages(card.details, card.images);
			const images = {};
			for (const [id, url] of Object.entries(extracted.images)) images[id] = await optimizeDataUrl(url);
			const detailsChanged = extracted.details !== card.details;
			const imagesChanged = Object.keys(images).length !== Object.keys(card.images).length || Object.entries(images).some(([id, url]) => card.images[id] !== url);
			if (!detailsChanged && !imagesChanged) continue;
			cards[card.id] = {
				...card,
				details: extracted.details,
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
	const compacted = [];
	for (const theme of next) {
		const board = theme.whiteboard;
		if (!board) {
			compacted.push(theme);
			continue;
		}
		if (board.format === "excalidraw") {
			const files = { ...board.files };
			let boardChanged = false;
			for (const [id, file] of Object.entries(board.files)) {
				if (!file.src.startsWith("data:image/")) continue;
				const src = await optimizeDataUrl(file.src);
				if (src === file.src) continue;
				files[id] = {
					...file,
					src
				};
				boardChanged = true;
				changed = true;
			}
			compacted.push(boardChanged ? {
				...theme,
				whiteboard: {
					...board,
					files
				}
			} : theme);
			continue;
		}
		if (!board.nodes.length) {
			compacted.push(theme);
			continue;
		}
		const nodes = [];
		let boardChanged = false;
		for (const node of board.nodes) {
			if (node.type !== "image") {
				nodes.push(node);
				continue;
			}
			const src = await optimizeDataUrl(node.src);
			if (src !== node.src) {
				boardChanged = true;
				changed = true;
				nodes.push({
					...node,
					src
				});
			} else nodes.push(node);
		}
		compacted.push(boardChanged ? {
			...theme,
			whiteboard: {
				...board,
				nodes
			}
		} : theme);
	}
	return changed ? compacted : themes;
}
function readAsDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result;
			if (typeof result !== "string" || !result.startsWith("data:")) {
				reject(/* @__PURE__ */ new Error("Could not read this image."));
				return;
			}
			resolve(result);
		};
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read this image."));
		reader.readAsDataURL(file);
	});
}
async function compressImage(source) {
	if (typeof createImageBitmap === "function") {
		const bitmap = await createImageBitmap(source);
		try {
			return await encodeAdaptive(bitmap, bitmap.width, bitmap.height);
		} finally {
			bitmap.close();
		}
	}
	const image = await loadHtmlImage(URL.createObjectURL(source));
	return encodeAdaptive(image, image.naturalWidth, image.naturalHeight);
}
async function encodeAdaptive(source, sourceWidth, sourceHeight) {
	let edge = MAX_EDGE;
	let quality = .72;
	let best = "";
	for (let pass = 0; pass < 3; pass += 1) {
		const encoded = await drawToDataUrl(source, sourceWidth, sourceHeight, edge, quality);
		best = encoded;
		if (encoded.length <= TARGET_CHARS) return encoded;
		edge = Math.max(640, Math.round(edge * .78));
		quality = Math.max(.52, quality - .12);
	}
	if (best.length > HARD_CHARS) return drawToDataUrl(source, sourceWidth, sourceHeight, 640, .48);
	return best;
}
async function drawToDataUrl(source, sourceWidth, sourceHeight, maxEdge, quality) {
	const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight, 1));
	const width = Math.max(1, Math.round(sourceWidth * scale));
	const height = Math.max(1, Math.round(sourceHeight * scale));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("Could not read this image.");
	context.drawImage(source, 0, 0, width, height);
	const webp = await canvasToDataUrl(canvas, "image/webp", quality);
	if (webp.startsWith("data:image/webp") && webp.length < HARD_CHARS) return webp;
	return canvasToDataUrl(canvas, "image/jpeg", quality);
}
function canvasToDataUrl(canvas, type, quality) {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				reject(/* @__PURE__ */ new Error("Could not read this image."));
				return;
			}
			readAsDataUrl(blob).then(resolve, reject);
		}, type, quality);
	});
}
function loadHtmlImage(src) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => {
			URL.revokeObjectURL(src);
			resolve(image);
		};
		image.onerror = () => {
			URL.revokeObjectURL(src);
			reject(/* @__PURE__ */ new Error("Could not read this image."));
		};
		image.src = src;
	});
}
function filesFromDataTransfer(data) {
	if (!data) return [];
	const fromFiles = [...data.files].filter(isImageFile);
	if (fromFiles.length) return fromFiles;
	return [...data.items].filter((item) => item.kind === "file" && item.type.startsWith("image/")).map((item) => item.getAsFile()).filter((file) => Boolean(file));
}
function filesFromClipboard(data) {
	if (!data) return [];
	const fromItems = [...data.items].filter((item) => item.kind === "file" && item.type.startsWith("image/")).map((item) => item.getAsFile()).filter((file) => Boolean(file));
	if (fromItems.length) return fromItems;
	return [...data.files].filter(isImageFile);
}
function markdownImageSnippet(file, ref) {
	return `![${file.name.replace(/\.[^.]+$/, "").replace(/[[\]()\n]/g, " ").trim() || "image"}](${ref})`;
}
var IMAGE_REF_PREFIX = "ledger:img/";
function imageRef(id) {
	return `${IMAGE_REF_PREFIX}${id}`;
}
function newImageId() {
	return crypto.randomUUID().replaceAll("-", "").slice(0, 10);
}
function resolveImageUrl(url, images) {
	const id = imageIdFromUrl(url);
	if (!id) return url;
	return images[id] ?? url;
}
function imageIdFromUrl(url) {
	const trimmed = url.trim();
	if (trimmed.startsWith("ledger:img/")) return trimmed.slice(11);
	return trimmed.match(/\/ledger-img\/([a-zA-Z0-9_-]+)/)?.[1] ?? null;
}
function expandMarkdownImages(details, images) {
	return details.replace(/!\[([^\]]*)\]\((ledger:img\/[a-zA-Z0-9_-]+|\/ledger-img\/[a-zA-Z0-9_-]+)\)/g, (_full, alt, ref) => {
		const resolved = resolveImageUrl(ref, images);
		return resolved.startsWith("data:image/") ? `![${alt}](${resolved})` : `![${alt}](${ref})`;
	});
}
function extractInlineImages(details, images = {}) {
	const nextImages = { ...images };
	const nextDetails = details.replace(/!\[([^\]]*)\]\((data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+)\)/g, (_full, alt, url) => {
		const id = Object.entries(nextImages).find(([, value]) => value === url)?.[0] ?? newImageId();
		nextImages[id] = url;
		return `![${alt}](${imageRef(id)})`;
	});
	return {
		details: nextDetails,
		images: pruneImages(nextDetails, nextImages)
	};
}
function pruneImages(details, images) {
	const used = new Set([...details.matchAll(/ledger:img\/([a-zA-Z0-9_-]+)/g)].map((match) => match[1]));
	return Object.fromEntries(Object.entries(images).filter(([id]) => used.has(id)));
}
function insertAroundSelection(value, start, end, before, after = "", placeholder = "") {
	const selected = value.slice(start, end) || placeholder;
	return {
		next: value.slice(0, start) + before + selected + after + value.slice(end),
		cursor: start + before.length + selected.length + after.length
	};
}
var ASSET_PREFIX = "asset:";
var ASSET_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;
var EMPTY_WHITEBOARD = {
	format: "excalidraw",
	elements: [],
	appState: {},
	files: {}
};
function emptyWhiteboard() {
	return EMPTY_WHITEBOARD;
}
function isLegacyWhiteboard(doc) {
	return doc.format === "legacy";
}
function isWhiteboardImageSrc(src) {
	return src.startsWith("data:image/") || src.startsWith("asset:");
}
function whiteboardFileAssetId(fileId) {
	if (ASSET_ID_RE.test(fileId)) return fileId;
	const compact = fileId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
	if (ASSET_ID_RE.test(compact)) return compact;
	let hash = 5381;
	for (let i = 0; i < fileId.length; i += 1) hash = hash * 33 ^ fileId.charCodeAt(i);
	return `f${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
function listWhiteboardImages(doc) {
	if (isLegacyWhiteboard(doc)) {
		const images = [];
		for (const node of doc.nodes) if (node.type === "image") images.push({
			id: node.id,
			src: node.src
		});
		return images;
	}
	return Object.values(doc.files).map((file) => ({
		id: file.id,
		src: file.src
	}));
}
function replaceWhiteboardImages(doc, srcById) {
	if (isLegacyWhiteboard(doc)) {
		const nodes = [];
		for (const node of doc.nodes) {
			if (node.type !== "image") {
				nodes.push(node);
				continue;
			}
			const src = srcById.get(node.id);
			if (!src) continue;
			nodes.push(src === node.src ? node : {
				...node,
				src
			});
		}
		return {
			...doc,
			nodes
		};
	}
	const files = {};
	for (const [key, file] of Object.entries(doc.files)) {
		const src = srcById.get(file.id) ?? srcById.get(key);
		if (!src) continue;
		files[key] = src === file.src ? file : {
			...file,
			src
		};
	}
	return {
		...doc,
		files
	};
}
function whiteboardContentSignature(doc) {
	if (isLegacyWhiteboard(doc)) return whiteboardSignature(doc);
	return whiteboardSignature({
		...doc,
		appState: {}
	});
}
function whiteboardSignature(doc) {
	if (isLegacyWhiteboard(doc)) return JSON.stringify({
		format: "legacy",
		connectors: doc.connectors,
		nodes: doc.nodes.map((node) => node.type === "image" ? {
			...node,
			src: node.src.length
		} : node.type === "path" ? {
			...node,
			points: node.points.length
		} : node)
	});
	return JSON.stringify({
		format: "excalidraw",
		appState: doc.appState,
		elements: doc.elements.map((item) => elementSignature(item)),
		files: Object.values(doc.files).map((file) => [
			file.id,
			file.mimeType,
			file.src.startsWith("data:") ? file.src.length : file.src
		])
	});
}
function elementSignature(item) {
	if (!item || typeof item !== "object") return item;
	const { version: _version, versionNonce: _versionNonce, updated: _updated, seed: _seed, index: _index, ...rest } = item;
	return rest;
}
function num(value, fallback = 0) {
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function pointsOf(raw) {
	if (!Array.isArray(raw)) return [];
	const next = [];
	for (const item of raw) {
		if (!Array.isArray(item) || item.length < 2) continue;
		const x = num(item[0], NaN);
		const y = num(item[1], NaN);
		if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
		next.push([x, y]);
	}
	return next;
}
function normalizeLegacyNodes(raw) {
	if (!Array.isArray(raw)) return [];
	const nodes = [];
	for (const item of raw) {
		if (!item || typeof item !== "object") continue;
		const node = item;
		if (typeof node.id !== "string" || !node.id) continue;
		if (node.type === "path") {
			const points = pointsOf(node.points);
			if (points.length < 2) continue;
			nodes.push({
				type: "path",
				id: node.id,
				points,
				width: Math.min(12, Math.max(1, num(node.width, 2.5)))
			});
			continue;
		}
		const box = {
			x: num(node.x),
			y: num(node.y),
			w: Math.max(16, num(node.w, 120)),
			h: Math.max(16, num(node.h, 72))
		};
		if (node.type === "text") {
			nodes.push({
				...box,
				type: "text",
				id: node.id,
				text: typeof node.text === "string" ? node.text : ""
			});
			continue;
		}
		if (node.type === "image" && typeof node.src === "string" && isWhiteboardImageSrc(node.src)) {
			nodes.push({
				...box,
				type: "image",
				id: node.id,
				src: node.src
			});
			continue;
		}
		if (node.type === "rect" || node.type === "ellipse" || node.type === "diamond") nodes.push({
			...box,
			type: node.type,
			id: node.id
		});
	}
	return nodes;
}
function normalizeLegacyConnectors(raw, ids) {
	if (!Array.isArray(raw)) return [];
	const connectors = [];
	for (const item of raw) {
		if (!item || typeof item !== "object") continue;
		const link = item;
		if (typeof link.id !== "string" || !link.id) continue;
		if (typeof link.from !== "string" || typeof link.to !== "string") continue;
		if (link.from === link.to) continue;
		if (!ids.has(link.from) || !ids.has(link.to)) continue;
		connectors.push({
			id: link.id,
			from: link.from,
			to: link.to
		});
	}
	return connectors;
}
function toJsonValue(value) {
	try {
		return JSON.parse(JSON.stringify(value));
	} catch {
		return;
	}
}
function normalizeElements(raw) {
	if (!Array.isArray(raw)) return [];
	const elements = [];
	for (const item of raw) {
		const json = toJsonValue(item);
		if (!json || typeof json !== "object" || Array.isArray(json)) continue;
		const el = json;
		if (typeof el.id !== "string" || !el.id) continue;
		if (typeof el.type !== "string" || !el.type) continue;
		if (el.isDeleted === true) continue;
		elements.push(json);
	}
	return elements;
}
function normalizeAppState(raw) {
	if (!raw || typeof raw !== "object") return {};
	const value = raw;
	const next = {};
	if (typeof value.viewBackgroundColor === "string") next.viewBackgroundColor = value.viewBackgroundColor;
	if (typeof value.scrollX === "number" && Number.isFinite(value.scrollX)) next.scrollX = value.scrollX;
	if (typeof value.scrollY === "number" && Number.isFinite(value.scrollY)) next.scrollY = value.scrollY;
	if (value.zoom && typeof value.zoom === "object") {
		const zoomValue = value.zoom.value;
		if (typeof zoomValue === "number" && Number.isFinite(zoomValue) && zoomValue > 0) next.zoom = { value: zoomValue };
	}
	if (value.gridSize === null) next.gridSize = null;
	else if (typeof value.gridSize === "number" && Number.isFinite(value.gridSize)) next.gridSize = value.gridSize;
	return next;
}
function normalizeFiles(raw) {
	if (!raw || typeof raw !== "object") return {};
	const files = {};
	for (const [key, value] of Object.entries(raw)) {
		if (!value || typeof value !== "object") continue;
		const item = value;
		const id = typeof item.id === "string" && item.id ? item.id : key;
		const src = typeof item.src === "string" ? item.src : typeof item.dataURL === "string" ? item.dataURL : "";
		if (!id || !isWhiteboardImageSrc(src)) continue;
		files[id] = {
			id,
			mimeType: typeof item.mimeType === "string" && item.mimeType ? item.mimeType : "image/png",
			created: typeof item.created === "number" && Number.isFinite(item.created) ? item.created : 0,
			src
		};
	}
	return files;
}
function normalizeWhiteboard(raw) {
	if (!raw || typeof raw !== "object") return emptyWhiteboard();
	const value = raw;
	if (value.format === "excalidraw" || Array.isArray(value.elements)) return {
		format: "excalidraw",
		elements: normalizeElements(value.elements),
		appState: normalizeAppState(value.appState),
		files: normalizeFiles(value.files)
	};
	const nodes = normalizeLegacyNodes(value.nodes);
	if (!nodes.length) return emptyWhiteboard();
	return {
		format: "legacy",
		nodes,
		connectors: normalizeLegacyConnectors(value.connectors, new Set(nodes.map((node) => node.id)))
	};
}
async function compactWhiteboard(doc) {
	const images = listWhiteboardImages(doc);
	if (!images.length) return doc;
	let changed = false;
	const nextSrc = /* @__PURE__ */ new Map();
	for (const image of images) {
		if (!image.src.startsWith("data:image/")) {
			nextSrc.set(image.id, image.src);
			continue;
		}
		const src = await optimizeDataUrl(image.src);
		if (src !== image.src) changed = true;
		nextSrc.set(image.id, src);
	}
	return changed ? replaceWhiteboardImages(doc, nextSrc) : doc;
}
function stripWhiteboardDataUrls(doc) {
	const images = listWhiteboardImages(doc);
	if (!images.length) return doc;
	let changed = false;
	const nextSrc = /* @__PURE__ */ new Map();
	for (const image of images) if (image.src.startsWith("data:image/")) {
		nextSrc.set(image.id, `${ASSET_PREFIX}${whiteboardFileAssetId(image.id)}`);
		changed = true;
	} else nextSrc.set(image.id, image.src);
	return changed ? replaceWhiteboardImages(doc, nextSrc) : doc;
}
function applyBoardDelta(themes, activeThemeId, delta) {
	const deletedThemes = new Set(delta.deletedThemeIds);
	const deletedCards = new Set(delta.deletedCardIds);
	let next = themes.filter((theme) => !deletedThemes.has(theme.id));
	for (const incoming of delta.upsertThemes) if (next.find((theme) => theme.id === incoming.id)) next = next.map((theme) => theme.id === incoming.id ? {
		...theme,
		name: incoming.name,
		notice: incoming.notice,
		whiteboard: incoming.whiteboard ?? theme.whiteboard
	} : theme);
	else next = [...next, {
		id: incoming.id,
		name: incoming.name,
		notice: incoming.notice,
		whiteboard: incoming.whiteboard,
		cards: {},
		order: emptyColumns()
	}];
	next = next.map((theme) => {
		if (![...deletedCards].some((id) => theme.cards[id])) return theme;
		const cards = { ...theme.cards };
		for (const id of deletedCards) delete cards[id];
		return {
			...theme,
			cards
		};
	});
	for (const item of delta.upsertCards) {
		next = next.map((theme) => {
			if (theme.id !== item.themeId) {
				if (!theme.cards[item.card.id]) return theme;
				const { [item.card.id]: _removed, ...cards } = theme.cards;
				return {
					...theme,
					cards,
					order: stripId(theme.order, item.card.id)
				};
			}
			return {
				...theme,
				cards: {
					...theme.cards,
					[item.card.id]: item.card
				}
			};
		});
		if (!next.some((theme) => theme.id === item.themeId)) next = [...next, {
			id: item.themeId,
			name: "Theme",
			notice: "",
			whiteboard: emptyWhiteboard(),
			cards: { [item.card.id]: item.card },
			order: emptyColumns()
		}];
	}
	next = next.map((theme) => {
		const order = delta.orders[theme.id];
		return order ? {
			...theme,
			order: {
				...emptyColumns(),
				...order
			}
		} : theme;
	});
	const nextActive = delta.activeThemeId && next.some((theme) => theme.id === delta.activeThemeId) ? delta.activeThemeId : next.some((theme) => theme.id === activeThemeId) ? activeThemeId : next[0]?.id ?? activeThemeId;
	return {
		themes: next,
		activeThemeId: nextActive
	};
}
function emptyColumns() {
	return {
		backlog: [],
		planning: [],
		todo: [],
		doing: [],
		review: [],
		done: []
	};
}
function stripId(order, cardId) {
	return {
		backlog: order.backlog.filter((id) => id !== cardId),
		planning: order.planning.filter((id) => id !== cardId),
		todo: order.todo.filter((id) => id !== cardId),
		doing: order.doing.filter((id) => id !== cardId),
		review: order.review.filter((id) => id !== cardId),
		done: order.done.filter((id) => id !== cardId)
	};
}
var boardHistoryGate = { skip: false };
function skippingHistory(fn) {
	boardHistoryGate.skip = true;
	try {
		return fn();
	} finally {
		boardHistoryGate.skip = false;
	}
}
var COLUMN_IDS = [
	"backlog",
	"planning",
	"todo",
	"doing",
	"review",
	"done"
];
var COLUMNS = [
	{
		id: "backlog",
		title: "Backlog",
		hint: "Later",
		empty: "No ideas yet",
		emptyHint: "Park work that is not ready to shape.",
		allowsCreate: true
	},
	{
		id: "planning",
		title: "Planning",
		hint: "Shape the work",
		empty: "Nothing in planning",
		emptyHint: "Pull a card from the backlog to scope it.",
		allowsCreate: true
	},
	{
		id: "todo",
		title: "To Do",
		hint: "Ready to start",
		empty: "Queue is clear",
		emptyHint: "Advance a planned card when it is ready.",
		allowsCreate: true
	},
	{
		id: "doing",
		title: "Doing",
		hint: "In motion",
		empty: "Nothing active",
		emptyHint: "Start something from To Do.",
		allowsCreate: false
	},
	{
		id: "review",
		title: "Review",
		hint: "Queue · newest last",
		empty: "Nothing to review",
		emptyHint: "Advance a card from Doing when it needs a check.",
		allowsCreate: false
	},
	{
		id: "done",
		title: "Done",
		hint: "Shipped · compact",
		empty: "Nothing shipped",
		emptyHint: "Pass review, then ship it here.",
		allowsCreate: false
	}
];
function debouncedLocalStorage(delay = 900) {
	let timer = 0;
	let pending = null;
	const flush = () => {
		if (!pending || typeof localStorage === "undefined") return;
		try {
			localStorage.setItem(pending.name, pending.value);
		} catch {}
		pending = null;
	};
	if (typeof window !== "undefined") window.addEventListener("pagehide", flush);
	return {
		getItem: (name) => typeof localStorage === "undefined" ? null : localStorage.getItem(name),
		setItem: (name, value) => {
			pending = {
				name,
				value
			};
			if (typeof window === "undefined") return;
			window.clearTimeout(timer);
			timer = window.setTimeout(flush, delay);
		},
		removeItem: (name) => {
			pending = null;
			if (typeof window !== "undefined") window.clearTimeout(timer);
			if (typeof localStorage !== "undefined") localStorage.removeItem(name);
		}
	};
}
var COLUMN_PREFIX = "column:";
function columnDroppableId(id) {
	return `${COLUMN_PREFIX}${id}`;
}
function parseColumnId(id) {
	if (id.startsWith("column:")) {
		const raw = id.slice(7);
		return isColumnId(raw) ? raw : null;
	}
	return isColumnId(id) ? id : null;
}
function isColumnId(id) {
	return COLUMN_IDS.includes(id);
}
function columnMeta(id) {
	return COLUMNS.find((column) => column.id === id) ?? COLUMNS[0];
}
function columnAllowsCreate(id) {
	return columnMeta(id).allowsCreate;
}
function adjacentColumn(id, delta) {
	const index = COLUMN_IDS.indexOf(id);
	if (index < 0) return null;
	return COLUMN_IDS[index + delta] ?? null;
}
function canEnterColumn(from, to) {
	if (from === to) return true;
	if (to === "done") return from === "review";
	return true;
}
function cardLinkKey(kind) {
	return kind === "jira" ? "jiraUrl" : "prUrl";
}
function parseExternalUrl(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return "";
	const candidate = /^[a-zA-Z][a-zA-Z+\-.]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
	try {
		const url = new URL(candidate);
		if (url.protocol !== "http:" && url.protocol !== "https:") return null;
		return url.toString();
	} catch {
		return null;
	}
}
function findColumnOf(order, cardId) {
	for (const columnId of COLUMN_IDS) if (order[columnId].includes(cardId)) return columnId;
	return null;
}
function sortIdsByUrgency(cards, ids) {
	const urgent = [];
	const rest = [];
	for (const id of ids) {
		if (!cards[id]) continue;
		if (cards[id].urgent) urgent.push(id);
		else rest.push(id);
	}
	const next = [...urgent, ...rest];
	if (next.length === ids.length && next.every((id, index) => id === ids[index])) return ids;
	return next;
}
function sameOrder(left, right) {
	for (const columnId of COLUMN_IDS) {
		const a = left[columnId];
		const b = right[columnId];
		if (a === b) continue;
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
	}
	return true;
}
function sortThemeByUrgency(theme) {
	const order = emptyOrder();
	for (const columnId of COLUMN_IDS) order[columnId] = columnId === "review" ? (theme.order[columnId] ?? []).filter((id) => theme.cards[id]) : sortIdsByUrgency(theme.cards, theme.order[columnId] ?? []);
	return sameOrder(theme.order, order) ? theme : {
		...theme,
		order
	};
}
function sortThemeColumn(theme, columnId) {
	if (columnId === "review") return theme;
	const next = sortIdsByUrgency(theme.cards, theme.order[columnId]);
	if (next === theme.order[columnId]) return theme;
	return {
		...theme,
		order: {
			...theme.order,
			[columnId]: next
		}
	};
}
function themeCardCount(theme) {
	return COLUMN_IDS.reduce((sum, columnId) => sum + theme.order[columnId].length, 0);
}
function boardColumnCounts(themes) {
	const counts = Object.fromEntries(COLUMN_IDS.map((id) => [id, 0]));
	for (const theme of themes) for (const id of COLUMN_IDS) counts[id] += theme.order[id]?.length ?? 0;
	return counts;
}
function selectActiveTheme(state) {
	return state.themes.find((theme) => theme.id === state.activeThemeId) ?? state.themes[0];
}
function collectAllReviewCards(themes) {
	const cards = [];
	const seen = /* @__PURE__ */ new Set();
	for (const theme of themes) for (const id of theme.order.review) {
		const existing = theme.cards[id];
		if (!existing || seen.has(id)) continue;
		seen.add(id);
		cards.push(existing);
	}
	return cards;
}
function listThemeCards(theme) {
	const items = [];
	for (const columnId of COLUMN_IDS) for (const id of theme.order[columnId]) {
		const existing = theme.cards[id];
		if (!existing) continue;
		items.push({
			...existing,
			columnId
		});
	}
	return items;
}
function sanitizeBlockedBy(cards, id, blocked, raw) {
	if (!blocked) return [];
	const unique = /* @__PURE__ */ new Set();
	for (const other of raw ?? []) if (other && other !== id && cards[other]) unique.add(other);
	return [...unique];
}
function collectPlanningCards(themes) {
	const cards = [];
	for (const theme of themes) for (const id of theme.order.planning) {
		const existing = theme.cards[id];
		if (!existing) continue;
		cards.push({
			...existing,
			themeId: theme.id,
			themeName: theme.name
		});
	}
	return cards;
}
function card(title, description, createdAt, flags = {}) {
	return {
		id: crypto.randomUUID(),
		title,
		description,
		createdAt,
		blocked: Boolean(flags.blocked),
		urgent: Boolean(flags.urgent),
		jiraUrl: "",
		prUrl: "",
		details: "",
		images: {},
		assignee: "",
		duration: null,
		prAlert: false,
		blockedBy: flags.blocked && flags.blockedBy ? flags.blockedBy : []
	};
}
var emptyOrder = () => ({
	backlog: [],
	planning: [],
	todo: [],
	doing: [],
	review: [],
	done: []
});
function emptySnapshot() {
	return {
		cards: {},
		order: emptyOrder()
	};
}
function makeTheme(name, snapshot = emptySnapshot()) {
	return finalizeTheme({
		id: crypto.randomUUID(),
		name,
		notice: "",
		whiteboard: emptyWhiteboard(),
		cards: snapshot.cards,
		order: {
			...emptyOrder(),
			...snapshot.order
		}
	});
}
function seedBoard() {
	const now = Date.now();
	const parked = card("Park the analytics rewrite", "Useful, but it can wait until the launch cut is out.", now - 18e7);
	const queued = card("Scope the Q3 launch", "Outline milestones, owners, and the first public cut.", now - 936e5);
	const quotes = card("Collect three testimonials", "Reach out to early users for short, specific quotes.", now - 648e5, {
		blocked: true,
		urgent: true
	});
	const onboarding = card("Polish the onboarding flow", "Tighten first-run copy and cut one unnecessary step.", now - 216e5, { urgent: true });
	const standUp = card("Stand up the board", "Columns, cards, and local persistence are live.", now - 144e6);
	const type = card("Lock the type pairing", "Newsreader for the masthead, Figtree for the interface.", now - 1296e5);
	return {
		cards: {
			[parked.id]: parked,
			[queued.id]: queued,
			[quotes.id]: quotes,
			[onboarding.id]: onboarding,
			[standUp.id]: standUp,
			[type.id]: type
		},
		order: {
			backlog: [parked.id],
			planning: [queued.id],
			todo: [quotes.id],
			doing: [onboarding.id],
			review: [],
			done: [standUp.id, type.id]
		}
	};
}
function seedThemes() {
	const launch = makeTheme("Launch", seedBoard());
	const studio = makeTheme("Studio", {
		cards: {},
		order: emptyOrder()
	});
	const sketch = card("Sketch the next poster", "Black ink on cream, one headline, no extra ornament.", Date.now() - 288e5);
	studio.cards[sketch.id] = sketch;
	studio.order.backlog = [sketch.id];
	return {
		themes: [launch, studio],
		activeThemeId: launch.id
	};
}
function boardSignature(themes, activeThemeId) {
	return JSON.stringify({
		activeThemeId,
		themes: themes.map((theme) => ({
			id: theme.id,
			name: theme.name,
			notice: theme.notice,
			whiteboard: whiteboardSignature(theme.whiteboard ?? emptyWhiteboard()),
			order: theme.order,
			cards: Object.values(theme.cards).map((card) => [
				card.id,
				card.title,
				card.description,
				card.blocked,
				card.urgent,
				card.assignee,
				card.duration,
				card.prAlert,
				card.jiraUrl,
				card.prUrl,
				card.blockedBy,
				card.details.length,
				card.details.slice(0, 24),
				Object.keys(card.images).sort().map((id) => [id, card.images[id]?.length ?? 0])
			])
		}))
	});
}
function withActive(state, updater) {
	const current = state.themes.find((theme) => theme.id === state.activeThemeId) ?? state.themes[0];
	if (!current) return state;
	const next = updater(current);
	if (next === current) return state;
	return { themes: state.themes.map((theme) => theme.id === current.id ? next : theme) };
}
function mergeReviewCard(existing, incoming) {
	if (!existing) return incoming;
	return {
		...existing,
		title: incoming.title || existing.title,
		description: incoming.description || existing.description,
		assignee: incoming.assignee || existing.assignee,
		prAlert: incoming.prAlert,
		blocked: incoming.blocked,
		urgent: incoming.urgent,
		jiraUrl: incoming.jiraUrl || existing.jiraUrl,
		prUrl: incoming.prUrl || existing.prUrl,
		details: existing.details.length >= incoming.details.length ? existing.details : incoming.details,
		images: Object.keys(existing.images).length ? existing.images : incoming.images
	};
}
function normalizeCard(raw) {
	if (!raw || typeof raw !== "object") return null;
	const value = raw;
	if (typeof value.id !== "string" || !value.id) return null;
	if (typeof value.title !== "string") return null;
	const lifted = liftInlineImages(typeof value.details === "string" ? value.details : "", normalizeImages(value.images));
	return {
		id: value.id,
		title: value.title,
		description: typeof value.description === "string" ? value.description : "",
		createdAt: typeof value.createdAt === "number" ? value.createdAt : Date.now(),
		blocked: Boolean(value.blocked),
		urgent: Boolean(value.urgent),
		jiraUrl: storedExternalUrl(value.jiraUrl),
		prUrl: storedExternalUrl(value.prUrl),
		details: lifted.details,
		images: lifted.images,
		assignee: typeof value.assignee === "string" ? value.assignee : "",
		duration: typeof value.duration === "number" && Number.isFinite(value.duration) ? value.duration : null,
		prAlert: Boolean(value.prAlert),
		blockedBy: Array.isArray(value.blockedBy) ? [...new Set(value.blockedBy.filter((id) => typeof id === "string" && id.length > 0))] : []
	};
}
function storedExternalUrl(value) {
	if (typeof value !== "string" || !value.trim()) return "";
	return parseExternalUrl(value) ?? "";
}
function normalizeImages(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
	const next = {};
	for (const [key, value] of Object.entries(raw)) {
		if (typeof value !== "string") continue;
		if (value.startsWith("data:image/") || value.startsWith("asset:")) next[key] = value;
	}
	return next;
}
function liftInlineImages(details, images) {
	const nextImages = { ...images };
	return {
		details: details.replace(/!\[([^\]]*)\]\((data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+)\)/g, (_full, alt, url) => {
			const id = Object.entries(nextImages).find(([, value]) => value === url)?.[0] ?? crypto.randomUUID().replaceAll("-", "").slice(0, 10);
			nextImages[id] = url;
			return `![${alt}](ledger:img/${id})`;
		}),
		images: nextImages
	};
}
function normalizeCards(cards) {
	const next = {};
	for (const value of Object.values(cards)) {
		const normalized = normalizeCard(value);
		if (normalized) next[normalized.id] = normalized;
	}
	return next;
}
function normalizeTheme(raw, fallbackName) {
	if (!raw || typeof raw !== "object") return null;
	const id = typeof raw.id === "string" && raw.id ? raw.id : crypto.randomUUID();
	const name = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : fallbackName;
	const cards = raw.cards && typeof raw.cards === "object" ? normalizeCards(raw.cards) : {};
	return finalizeTheme({
		id,
		name,
		notice: typeof raw.notice === "string" ? raw.notice : "",
		whiteboard: normalizeWhiteboard(raw.whiteboard),
		cards,
		order: {
			...emptyOrder(),
			...raw.order ?? {}
		}
	});
}
function finalizeTheme(theme) {
	return sortThemeByUrgency({
		...theme,
		whiteboard: theme.whiteboard ?? emptyWhiteboard()
	});
}
function parseBoardPayload(raw) {
	if (!raw || typeof raw !== "object") return null;
	const value = raw;
	if (Array.isArray(value.themes) && value.themes.length > 0) {
		const themes = value.themes.map((theme, index) => normalizeTheme(theme, `Theme ${index + 1}`)).filter((theme) => Boolean(theme));
		if (!themes.length) return null;
		return {
			themes,
			activeThemeId: typeof value.activeThemeId === "string" && themes.some((theme) => theme.id === value.activeThemeId) ? value.activeThemeId : themes[0].id
		};
	}
	if (value.cards && value.order) {
		const migrated = makeTheme("Launch", {
			cards: normalizeCards(value.cards),
			order: {
				...emptyOrder(),
				...value.order
			}
		});
		return {
			themes: [migrated],
			activeThemeId: migrated.id
		};
	}
	return null;
}
var useBoardStore = create()(persist((set, get) => ({
	...seedThemes(),
	setActiveTheme: (id) => {
		skippingHistory(() => {
			set((state) => state.themes.some((theme) => theme.id === id) ? { activeThemeId: id } : state);
		});
	},
	addTheme: (name) => {
		const theme = makeTheme(name.trim() || "Untitled");
		set((state) => ({
			themes: [...state.themes, theme],
			activeThemeId: theme.id
		}));
		return theme.id;
	},
	renameTheme: (id, name) => {
		const next = name.trim();
		if (!next) return;
		set((state) => ({ themes: state.themes.map((theme) => theme.id === id ? {
			...theme,
			name: next
		} : theme) }));
	},
	deleteTheme: (id) => {
		const state = get();
		if (state.themes.length <= 1) return false;
		const index = state.themes.findIndex((theme) => theme.id === id);
		if (index < 0) return false;
		const themes = state.themes.filter((theme) => theme.id !== id);
		const fallback = themes[Math.max(0, index - 1)] ?? themes[0];
		set({
			themes,
			activeThemeId: state.activeThemeId === id ? fallback.id : state.activeThemeId
		});
		return true;
	},
	addCard: (columnId, title, description, flags) => {
		if (!columnAllowsCreate(columnId)) return "";
		const next = card(title.trim(), description.trim(), Date.now(), flags);
		set((state) => withActive(state, (theme) => {
			const cards = {
				...theme.cards,
				[next.id]: next
			};
			cards[next.id] = {
				...next,
				blockedBy: sanitizeBlockedBy(cards, next.id, next.blocked, next.blockedBy)
			};
			const order = {
				...theme.order,
				[columnId]: [next.id, ...theme.order[columnId]]
			};
			return sortThemeColumn({
				...theme,
				cards,
				order
			}, columnId);
		}));
		return next.id;
	},
	updateCard: (id, patch) => {
		set((state) => withActive(state, (theme) => {
			const existing = theme.cards[id];
			if (!existing) return theme;
			const nextTheme = {
				...theme,
				cards: {
					...theme.cards,
					[id]: {
						...existing,
						title: patch.title.trim(),
						description: patch.description.trim(),
						blocked: patch.blocked,
						urgent: patch.urgent,
						blockedBy: sanitizeBlockedBy(theme.cards, id, patch.blocked, patch.blockedBy ?? existing.blockedBy)
					}
				}
			};
			const columnId = findColumnOf(theme.order, id);
			return columnId && existing.urgent !== patch.urgent ? sortThemeColumn(nextTheme, columnId) : nextTheme;
		}));
	},
	toggleCardFlag: (id, flag) => {
		set((state) => withActive(state, (theme) => {
			const existing = theme.cards[id];
			if (!existing) return theme;
			const nextFlag = !existing[flag];
			const nextTheme = {
				...theme,
				cards: {
					...theme.cards,
					[id]: {
						...existing,
						[flag]: nextFlag,
						blockedBy: flag === "blocked" && !nextFlag ? [] : existing.blockedBy
					}
				}
			};
			const columnId = findColumnOf(theme.order, id);
			return flag === "urgent" && columnId ? sortThemeColumn(nextTheme, columnId) : nextTheme;
		}));
	},
	setCardBlock: (id, blocked, blockedBy) => {
		set((state) => withActive(state, (theme) => {
			const existing = theme.cards[id];
			if (!existing) return theme;
			return {
				...theme,
				cards: {
					...theme.cards,
					[id]: {
						...existing,
						blocked,
						blockedBy: sanitizeBlockedBy(theme.cards, id, blocked, blockedBy)
					}
				}
			};
		}));
	},
	setCardLink: (id, kind, url) => {
		set((state) => withActive(state, (theme) => {
			const existing = theme.cards[id];
			if (!existing) return theme;
			return {
				...theme,
				cards: {
					...theme.cards,
					[id]: {
						...existing,
						[cardLinkKey(kind)]: url
					}
				}
			};
		}));
	},
	setCardDetails: (id, details, images) => {
		set((state) => withActive(state, (theme) => {
			const existing = theme.cards[id];
			if (!existing) return theme;
			const lifted = liftInlineImages(details, images ?? existing.images);
			return {
				...theme,
				cards: {
					...theme.cards,
					[id]: {
						...existing,
						details: lifted.details,
						images: lifted.images
					}
				}
			};
		}));
	},
	setAssignee: (id, name) => {
		set((state) => withActive(state, (theme) => {
			const existing = theme.cards[id];
			if (!existing) return theme;
			return {
				...theme,
				cards: {
					...theme.cards,
					[id]: {
						...existing,
						assignee: name.trim()
					}
				}
			};
		}));
	},
	setCardDuration: (id, duration) => {
		set((state) => ({ themes: state.themes.map((theme) => {
			const existing = theme.cards[id];
			if (!existing) return theme;
			return {
				...theme,
				cards: {
					...theme.cards,
					[id]: {
						...existing,
						duration
					}
				}
			};
		}) }));
	},
	togglePrAlert: (id) => {
		set((state) => withActive(state, (theme) => {
			const existing = theme.cards[id];
			if (!existing) return theme;
			return {
				...theme,
				cards: {
					...theme.cards,
					[id]: {
						...existing,
						prAlert: !existing.prAlert
					}
				}
			};
		}));
	},
	setCardPrAlert: (id, on) => {
		set((state) => ({ themes: state.themes.map((theme) => {
			const existing = theme.cards[id];
			if (!existing || existing.prAlert === on) return theme;
			return {
				...theme,
				cards: {
					...theme.cards,
					[id]: {
						...existing,
						prAlert: on
					}
				}
			};
		}) }));
	},
	commitPokerResults: (results) => {
		const durations = new Map(results.map((item) => [item.id, item.duration]));
		set((state) => ({ themes: state.themes.map((theme) => {
			const cards = { ...theme.cards };
			for (const [id, duration] of durations) {
				const existing = cards[id];
				if (!existing) continue;
				cards[id] = {
					...existing,
					duration
				};
			}
			const planning = theme.order.planning.filter((id) => cards[id]);
			const todo = sortIdsByUrgency(cards, [...planning, ...theme.order.todo.filter((id) => !planning.includes(id))]);
			return {
				...theme,
				cards,
				order: {
					...theme.order,
					planning: [],
					todo
				}
			};
		}) }));
	},
	deleteCard: (id) => {
		set((state) => withActive(state, (theme) => {
			const cards = Object.fromEntries(Object.entries(theme.cards).filter(([cardId]) => cardId !== id).map(([cardId, existing]) => [cardId, {
				...existing,
				blockedBy: existing.blockedBy.filter((other) => other !== id)
			}]));
			const order = { ...theme.order };
			for (const columnId of COLUMN_IDS) order[columnId] = order[columnId].filter((cardId) => cardId !== id);
			return {
				...theme,
				cards,
				order
			};
		}));
	},
	moveCard: (activeId, overId) => {
		if (activeId === overId) return;
		const { order } = selectActiveTheme(get());
		const from = findColumnOf(order, activeId);
		const overColumn = parseColumnId(overId);
		const to = overColumn ?? findColumnOf(order, overId);
		if (!from || !to) return;
		if (!canEnterColumn(from, to)) return;
		if (from === to) {
			if (from === "review") return;
			const ids = order[from];
			const oldIndex = ids.indexOf(activeId);
			const newIndex = overColumn ? ids.length - 1 : ids.indexOf(overId);
			if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;
			set((state) => withActive(state, (current) => ({
				...current,
				order: {
					...current.order,
					[from]: arrayMove(ids, oldIndex, newIndex)
				}
			})));
			return;
		}
		const fromIds = order[from].filter((id) => id !== activeId);
		const toIds = order[to].filter((id) => id !== activeId);
		const insertAt = to === "review" || overColumn ? toIds.length : Math.max(toIds.indexOf(overId), 0);
		toIds.splice(insertAt, 0, activeId);
		set((state) => withActive(state, (current) => ({
			...current,
			order: {
				...current.order,
				[from]: fromIds,
				[to]: toIds
			}
		})));
	},
	sendCardTo: (cardId, columnId) => {
		const from = findColumnOf(selectActiveTheme(get()).order, cardId);
		if (!from || from === columnId) return false;
		if (!canEnterColumn(from, columnId)) return false;
		set((state) => withActive(state, (current) => {
			const fromIds = current.order[from].filter((id) => id !== cardId);
			const destIds = current.order[columnId].filter((id) => id !== cardId);
			const toIds = columnId === "review" ? [...destIds, cardId] : [cardId, ...destIds];
			const next = {
				...current,
				order: {
					...current.order,
					[from]: fromIds,
					[columnId]: toIds
				}
			};
			return columnId === "review" ? sortThemeColumn(next, from) : sortThemeColumn(sortThemeColumn(next, from), columnId);
		}));
		return true;
	},
	ingestReviewCard: (incoming) => {
		const card = normalizeCard(incoming);
		if (!card) return;
		skippingHistory(() => {
			set((state) => {
				let found = false;
				let changed = false;
				const themes = state.themes.map((theme) => {
					const existing = theme.cards[card.id];
					const inReview = theme.order.review.includes(card.id);
					if (!existing && !inReview) return theme;
					found = true;
					const merged = mergeReviewCard(existing, card);
					if (inReview && existing && existing.prAlert === merged.prAlert && existing.assignee === merged.assignee && existing.title === merged.title && existing.urgent === merged.urgent && existing.blocked === merged.blocked) return theme;
					changed = true;
					const order = { ...theme.order };
					for (const columnId of COLUMN_IDS) {
						if (columnId === "review" && inReview) continue;
						order[columnId] = order[columnId].filter((id) => id !== card.id);
					}
					return {
						...theme,
						cards: {
							...theme.cards,
							[card.id]: merged
						},
						order: inReview ? order : {
							...order,
							review: [...order.review.filter((id) => id !== card.id), card.id]
						}
					};
				});
				if (found) return changed ? { themes } : state;
				const active = themes.find((theme) => theme.id === state.activeThemeId) ?? themes[0];
				if (!active) return state;
				const nextActive = {
					...active,
					cards: {
						...active.cards,
						[card.id]: card
					},
					order: {
						...active.order,
						review: [...active.order.review.filter((id) => id !== card.id), card.id]
					}
				};
				return { themes: themes.map((theme) => theme.id === nextActive.id ? nextActive : theme) };
			});
		});
	},
	applyReviewLeave: (cardId, dest) => {
		skippingHistory(() => {
			set((state) => ({ themes: state.themes.map((theme) => {
				if (!theme.cards[cardId]) return theme;
				if (findColumnOf(theme.order, cardId) !== "review") return theme;
				if (!dest) {
					const { [cardId]: _removed, ...cards } = theme.cards;
					return {
						...theme,
						cards,
						order: {
							...theme.order,
							review: theme.order.review.filter((id) => id !== cardId)
						}
					};
				}
				const reviewIds = theme.order.review.filter((id) => id !== cardId);
				const destIds = [cardId, ...theme.order[dest].filter((id) => id !== cardId)];
				return sortThemeColumn({
					...theme,
					order: {
						...theme.order,
						review: reviewIds,
						[dest]: destIds
					}
				}, dest);
			}) }));
		});
	},
	applyUrgencySort: () => {
		skippingHistory(() => {
			set((state) => withActive(state, sortThemeByUrgency));
		});
	},
	setThemeNotice: (notice) => {
		set((state) => withActive(state, (theme) => theme.notice === notice ? theme : {
			...theme,
			notice
		}));
	},
	setThemeWhiteboard: (whiteboard) => {
		const next = normalizeWhiteboard(whiteboard);
		set((state) => withActive(state, (theme) => whiteboardSignature(theme.whiteboard ?? emptyWhiteboard()) === whiteboardSignature(next) ? theme : {
			...theme,
			whiteboard: next
		}));
	},
	replaceBoard: (themes, activeThemeId) => {
		const parsed = parseBoardPayload({
			themes,
			activeThemeId
		});
		if (!parsed) return;
		skippingHistory(() => {
			set((state) => boardSignature(state.themes, state.activeThemeId) === boardSignature(parsed.themes, parsed.activeThemeId) ? state : parsed);
		});
	},
	applyDelta: (delta) => {
		skippingHistory(() => {
			set((state) => {
				const next = applyBoardDelta(state.themes, state.activeThemeId, delta);
				return boardSignature(state.themes, state.activeThemeId) === boardSignature(next.themes, next.activeThemeId) ? state : next;
			});
		});
	},
	applyCard: (incoming) => {
		const card = normalizeCard(incoming);
		if (!card) return;
		set((state) => ({ themes: state.themes.map((theme) => {
			if (!theme.cards[card.id]) return theme;
			return {
				...theme,
				cards: {
					...theme.cards,
					[card.id]: {
						...theme.cards[card.id],
						...card
					}
				}
			};
		}) }));
	}
}), {
	name: "ledger-kanban-v1",
	storage: createJSONStorage(() => debouncedLocalStorage()),
	skipHydration: true,
	partialize: (state) => ({
		themes: state.themes.map((theme) => ({
			...theme,
			whiteboard: stripWhiteboardDataUrls(theme.whiteboard ?? emptyWhiteboard()),
			cards: Object.fromEntries(Object.values(theme.cards).map((card) => [card.id, {
				...card,
				images: Object.fromEntries(Object.entries(card.images).map(([id, src]) => [id, src.startsWith("data:") ? `asset:${id}` : src]))
			}]))
		})),
		activeThemeId: state.activeThemeId
	}),
	merge: (persisted, current) => {
		const parsed = parseBoardPayload(persisted);
		return parsed ? {
			...current,
			...parsed
		} : current;
	}
}));
//#endregion
export { listWhiteboardImages as A, replaceWhiteboardImages as B, findColumnOf as C, isColumnId as D, isAllowedImageDataUrl as E, optimizeDataUrl as F, useBoardStore as G, selectActiveTheme as H, parseBoardPayload as I, whiteboardContentSignature as K, parseColumnId as L, newImageId as M, normalizeCard as N, isLegacyWhiteboard as O, normalizeWhiteboard as P, parseExternalUrl as R, filesFromDataTransfer as S, insertAroundSelection as T, stripWhiteboardDataUrls as U, resolveImageUrl as V, themeCardCount as W, emptyWhiteboard as _, boardColumnCounts as a, fileToDataUrl as b, canEnterColumn as c, collectPlanningCards as d, columnAllowsCreate as f, compactWhiteboard as g, compactThemeImages as h, adjacentColumn as i, markdownImageSnippet as j, listThemeCards as k, cardLinkKey as l, columnMeta as m, COLUMNS as n, boardHistoryGate as o, columnDroppableId as p, whiteboardFileAssetId as q, COLUMN_IDS as r, boardSignature as s, ASSET_PREFIX as t, collectAllReviewCards as u, expandMarkdownImages as v, imageRef as w, filesFromClipboard as x, extractInlineImages as y, pruneImages as z };
