import { optimizeDataUrl } from "@/lib/markdown-image";

export const ASSET_PREFIX = "asset:";
export const ASSET_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type WhiteboardNode =
  | {
      type: "rect" | "ellipse" | "diamond";
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }
  | {
      type: "text";
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
      text: string;
    }
  | {
      type: "image";
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
      src: string;
    }
  | {
      type: "path";
      id: string;
      points: [number, number][];
      width: number;
    };

export type WhiteboardConnector = {
  id: string;
  from: string;
  to: string;
};

export type WhiteboardFile = {
  id: string;
  mimeType: string;
  created: number;
  src: string;
};

export type WhiteboardAppState = {
  viewBackgroundColor?: string;
  scrollX?: number;
  scrollY?: number;
  zoom?: { value: number };
  gridSize?: number | null;
};

export type ExcalidrawWhiteboard = {
  format: "excalidraw";
  elements: JsonValue[];
  appState: WhiteboardAppState;
  files: Record<string, WhiteboardFile>;
};

export type LegacyWhiteboard = {
  format: "legacy";
  nodes: WhiteboardNode[];
  connectors: WhiteboardConnector[];
};

export type WhiteboardDoc = ExcalidrawWhiteboard | LegacyWhiteboard;

export const EMPTY_WHITEBOARD: ExcalidrawWhiteboard = {
  format: "excalidraw",
  elements: [],
  appState: {},
  files: {},
};

export function emptyWhiteboard(): ExcalidrawWhiteboard {
  return EMPTY_WHITEBOARD;
}

export function isLegacyWhiteboard(doc: WhiteboardDoc): doc is LegacyWhiteboard {
  return doc.format === "legacy";
}

export function isExcalidrawWhiteboard(
  doc: WhiteboardDoc,
): doc is ExcalidrawWhiteboard {
  return doc.format === "excalidraw";
}

export function isWhiteboardImageSrc(src: string) {
  return src.startsWith("data:image/") || src.startsWith(ASSET_PREFIX);
}

export function whiteboardImageId(src: string, fallback: string) {
  return src.startsWith(ASSET_PREFIX) ? src.slice(ASSET_PREFIX.length) : fallback;
}

export function whiteboardFileAssetId(fileId: string) {
  if (ASSET_ID_RE.test(fileId)) return fileId;
  const compact = fileId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  if (ASSET_ID_RE.test(compact)) return compact;
  let hash = 5381;
  for (let i = 0; i < fileId.length; i += 1) {
    hash = (hash * 33) ^ fileId.charCodeAt(i);
  }
  return `f${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function listWhiteboardImages(doc: WhiteboardDoc): Array<{ id: string; src: string }> {
  if (isLegacyWhiteboard(doc)) {
    const images: Array<{ id: string; src: string }> = [];
    for (const node of doc.nodes) {
      if (node.type === "image") images.push({ id: node.id, src: node.src });
    }
    return images;
  }
  return Object.values(doc.files).map((file) => ({ id: file.id, src: file.src }));
}

export function replaceWhiteboardImages(
  doc: WhiteboardDoc,
  srcById: Map<string, string>,
): WhiteboardDoc {
  if (isLegacyWhiteboard(doc)) {
    const nodes: WhiteboardNode[] = [];
    for (const node of doc.nodes) {
      if (node.type !== "image") {
        nodes.push(node);
        continue;
      }
      const src = srcById.get(node.id);
      if (!src) continue;
      nodes.push(src === node.src ? node : { ...node, src });
    }
    return { ...doc, nodes };
  }
  const files: Record<string, WhiteboardFile> = {};
  for (const [key, file] of Object.entries(doc.files)) {
    const src = srcById.get(file.id) ?? srcById.get(key);
    if (!src) continue;
    files[key] = src === file.src ? file : { ...file, src };
  }
  return { ...doc, files };
}

export function whiteboardContentSignature(doc: WhiteboardDoc) {
  if (isLegacyWhiteboard(doc)) return whiteboardSignature(doc);
  return whiteboardSignature({ ...doc, appState: {} });
}

export function whiteboardSignature(doc: WhiteboardDoc) {
  if (isLegacyWhiteboard(doc)) {
    return JSON.stringify({
      format: "legacy",
      connectors: doc.connectors,
      nodes: doc.nodes.map((node) =>
        node.type === "image"
          ? { ...node, src: node.src.length }
          : node.type === "path"
            ? { ...node, points: node.points.length }
            : node,
      ),
    });
  }
  return JSON.stringify({
    format: "excalidraw",
    appState: doc.appState,
    elements: doc.elements.map((item) => elementSignature(item)),
    files: Object.values(doc.files).map((file) => [
      file.id,
      file.mimeType,
      file.src.startsWith("data:") ? file.src.length : file.src,
    ]),
  });
}

function elementSignature(item: unknown) {
  if (!item || typeof item !== "object") return item;
  const {
    version: _version,
    versionNonce: _versionNonce,
    updated: _updated,
    seed: _seed,
    index: _index,
    ...rest
  } = item as Record<string, unknown>;
  return rest;
}

function num(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function pointsOf(raw: unknown): [number, number][] {
  if (!Array.isArray(raw)) return [];
  const next: [number, number][] = [];
  for (const item of raw) {
    if (!Array.isArray(item) || item.length < 2) continue;
    const x = num(item[0], Number.NaN);
    const y = num(item[1], Number.NaN);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    next.push([x, y]);
  }
  return next;
}

function normalizeLegacyNodes(raw: unknown): WhiteboardNode[] {
  if (!Array.isArray(raw)) return [];
  const nodes: WhiteboardNode[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const node = item as {
      type?: string;
      id?: string;
      x?: unknown;
      y?: unknown;
      w?: unknown;
      h?: unknown;
      text?: unknown;
      src?: unknown;
      points?: unknown;
      width?: unknown;
    };
    if (typeof node.id !== "string" || !node.id) continue;
    if (node.type === "path") {
      const points = pointsOf(node.points);
      if (points.length < 2) continue;
      nodes.push({
        type: "path",
        id: node.id,
        points,
        width: Math.min(12, Math.max(1, num(node.width, 2.5))),
      });
      continue;
    }
    const box = {
      x: num(node.x),
      y: num(node.y),
      w: Math.max(16, num(node.w, 120)),
      h: Math.max(16, num(node.h, 72)),
    };
    if (node.type === "text") {
      nodes.push({
        ...box,
        type: "text",
        id: node.id,
        text: typeof node.text === "string" ? node.text : "",
      });
      continue;
    }
    if (node.type === "image" && typeof node.src === "string" && isWhiteboardImageSrc(node.src)) {
      nodes.push({ ...box, type: "image", id: node.id, src: node.src });
      continue;
    }
    if (node.type === "rect" || node.type === "ellipse" || node.type === "diamond") {
      nodes.push({ ...box, type: node.type, id: node.id });
    }
  }
  return nodes;
}

function normalizeLegacyConnectors(
  raw: unknown,
  ids: Set<string>,
): WhiteboardConnector[] {
  if (!Array.isArray(raw)) return [];
  const connectors: WhiteboardConnector[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const link = item as Partial<WhiteboardConnector>;
    if (typeof link.id !== "string" || !link.id) continue;
    if (typeof link.from !== "string" || typeof link.to !== "string") continue;
    if (link.from === link.to) continue;
    if (!ids.has(link.from) || !ids.has(link.to)) continue;
    connectors.push({ id: link.id, from: link.from, to: link.to });
  }
  return connectors;
}

function toJsonValue(value: unknown): JsonValue | undefined {
  try {
    return JSON.parse(JSON.stringify(value)) as JsonValue;
  } catch {
    return undefined;
  }
}

function normalizeElements(raw: unknown): JsonValue[] {
  if (!Array.isArray(raw)) return [];
  const elements: JsonValue[] = [];
  for (const item of raw) {
    const json = toJsonValue(item);
    if (!json || typeof json !== "object" || Array.isArray(json)) continue;
    const el = json as { id?: unknown; type?: unknown; isDeleted?: unknown };
    if (typeof el.id !== "string" || !el.id) continue;
    if (typeof el.type !== "string" || !el.type) continue;
    if (el.isDeleted === true) continue;
    elements.push(json);
  }
  return elements;
}

function normalizeAppState(raw: unknown): WhiteboardAppState {
  if (!raw || typeof raw !== "object") return {};
  const value = raw as Record<string, unknown>;
  const next: WhiteboardAppState = {};
  if (typeof value.viewBackgroundColor === "string") {
    next.viewBackgroundColor = value.viewBackgroundColor;
  }
  if (typeof value.scrollX === "number" && Number.isFinite(value.scrollX)) {
    next.scrollX = value.scrollX;
  }
  if (typeof value.scrollY === "number" && Number.isFinite(value.scrollY)) {
    next.scrollY = value.scrollY;
  }
  if (value.zoom && typeof value.zoom === "object") {
    const zoomValue = (value.zoom as { value?: unknown }).value;
    if (typeof zoomValue === "number" && Number.isFinite(zoomValue) && zoomValue > 0) {
      next.zoom = { value: zoomValue };
    }
  }
  if (value.gridSize === null) next.gridSize = null;
  else if (typeof value.gridSize === "number" && Number.isFinite(value.gridSize)) {
    next.gridSize = value.gridSize;
  }
  return next;
}

function normalizeFiles(raw: unknown): Record<string, WhiteboardFile> {
  if (!raw || typeof raw !== "object") return {};
  const files: Record<string, WhiteboardFile> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const item = value as {
      id?: unknown;
      mimeType?: unknown;
      created?: unknown;
      src?: unknown;
      dataURL?: unknown;
    };
    const id = typeof item.id === "string" && item.id ? item.id : key;
    const src =
      typeof item.src === "string"
        ? item.src
        : typeof item.dataURL === "string"
          ? item.dataURL
          : "";
    if (!id || !isWhiteboardImageSrc(src)) continue;
    files[id] = {
      id,
      mimeType: typeof item.mimeType === "string" && item.mimeType ? item.mimeType : "image/png",
      created: typeof item.created === "number" && Number.isFinite(item.created) ? item.created : 0,
      src,
    };
  }
  return files;
}

export function normalizeWhiteboard(raw: unknown): WhiteboardDoc {
  if (!raw || typeof raw !== "object") return emptyWhiteboard();
  const value = raw as {
    format?: unknown;
    elements?: unknown;
    appState?: unknown;
    files?: unknown;
    nodes?: unknown;
    connectors?: unknown;
  };
  if (value.format === "excalidraw" || Array.isArray(value.elements)) {
    return {
      format: "excalidraw",
      elements: normalizeElements(value.elements),
      appState: normalizeAppState(value.appState),
      files: normalizeFiles(value.files),
    };
  }
  const nodes = normalizeLegacyNodes(value.nodes);
  if (!nodes.length) return emptyWhiteboard();
  return {
    format: "legacy",
    nodes,
    connectors: normalizeLegacyConnectors(
      value.connectors,
      new Set(nodes.map((node) => node.id)),
    ),
  };
}

export async function compactWhiteboard(doc: WhiteboardDoc): Promise<WhiteboardDoc> {
  const images = listWhiteboardImages(doc);
  if (!images.length) return doc;
  let changed = false;
  const nextSrc = new Map<string, string>();
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

export function stripWhiteboardDataUrls(doc: WhiteboardDoc): WhiteboardDoc {
  const images = listWhiteboardImages(doc);
  if (!images.length) return doc;
  let changed = false;
  const nextSrc = new Map<string, string>();
  for (const image of images) {
    if (image.src.startsWith("data:image/")) {
      nextSrc.set(image.id, `${ASSET_PREFIX}${whiteboardFileAssetId(image.id)}`);
      changed = true;
    } else {
      nextSrc.set(image.id, image.src);
    }
  }
  return changed ? replaceWhiteboardImages(doc, nextSrc) : doc;
}
