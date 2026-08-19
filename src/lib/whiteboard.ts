import { optimizeDataUrl } from "@/lib/markdown-image";

export const WHITEBOARD_TOOLS = [
  "select",
  "pan",
  "pen",
  "text",
  "rect",
  "ellipse",
  "diamond",
  "arrow",
] as const;

export type WhiteboardTool = (typeof WHITEBOARD_TOOLS)[number];

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

export type WhiteboardDoc = {
  nodes: WhiteboardNode[];
  connectors: WhiteboardConnector[];
};

export type Box = { x: number; y: number; w: number; h: number };
export type Point = { x: number; y: number };
export type Side = "n" | "e" | "s" | "w";

export const ASSET_PREFIX = "asset:";

export const EMPTY_WHITEBOARD: WhiteboardDoc = { nodes: [], connectors: [] };

export function emptyWhiteboard(): WhiteboardDoc {
  return EMPTY_WHITEBOARD;
}

export function isWhiteboardImageSrc(src: string) {
  return src.startsWith("data:image/") || src.startsWith(ASSET_PREFIX);
}

export function whiteboardImageId(src: string, fallback: string) {
  return src.startsWith(ASSET_PREFIX) ? src.slice(ASSET_PREFIX.length) : fallback;
}

export function whiteboardSignature(doc: WhiteboardDoc) {
  return JSON.stringify({
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

function nid() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 12);
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

export function normalizeWhiteboard(raw: unknown): WhiteboardDoc {
  if (!raw || typeof raw !== "object") return emptyWhiteboard();
  const value = raw as Partial<WhiteboardDoc>;
  const nodes: WhiteboardNode[] = [];
  for (const item of Array.isArray(value.nodes) ? value.nodes : []) {
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
    if (
      node.type === "image" &&
      typeof node.src === "string" &&
      isWhiteboardImageSrc(node.src)
    ) {
      nodes.push({ ...box, type: "image", id: node.id, src: node.src });
      continue;
    }
    if (node.type === "rect" || node.type === "ellipse" || node.type === "diamond") {
      nodes.push({ ...box, type: node.type, id: node.id });
    }
  }
  const ids = new Set(nodes.map((node) => node.id));
  const connectors: WhiteboardConnector[] = [];
  for (const item of Array.isArray(value.connectors) ? value.connectors : []) {
    if (!item || typeof item !== "object") continue;
    const link = item as Partial<WhiteboardConnector>;
    if (typeof link.id !== "string" || !link.id) continue;
    if (typeof link.from !== "string" || typeof link.to !== "string") continue;
    if (link.from === link.to) continue;
    if (!ids.has(link.from) || !ids.has(link.to)) continue;
    connectors.push({ id: link.id, from: link.from, to: link.to });
  }
  return { nodes, connectors };
}

export function nodeBox(node: WhiteboardNode): Box {
  if (node.type === "path") {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [x, y] of node.points) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    return {
      x: minX - 8,
      y: minY - 8,
      w: Math.max(16, maxX - minX + 16),
      h: Math.max(16, maxY - minY + 16),
    };
  }
  return { x: node.x, y: node.y, w: node.w, h: node.h };
}

export function hitNode(nodes: WhiteboardNode[], point: Point): WhiteboardNode | null {
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i]!;
    if (node.type === "path") {
      for (let p = 1; p < node.points.length; p += 1) {
        const a = node.points[p - 1]!;
        const b = node.points[p]!;
        if (distanceToSegment(point, { x: a[0], y: a[1] }, { x: b[0], y: b[1] }) <= 10) {
          return node;
        }
      }
      continue;
    }
    const box = nodeBox(node);
    if (
      point.x >= box.x &&
      point.x <= box.x + box.w &&
      point.y >= box.y &&
      point.y <= box.y + box.h
    ) {
      return node;
    }
  }
  return null;
}

function distanceToSegment(point: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = dx * dx + dy * dy;
  if (len === 0) return Math.hypot(point.x - a.x, point.y - a.y);
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / len));
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

function sidePoint(box: Box, side: Side): Point {
  if (side === "n") return { x: box.x + box.w / 2, y: box.y };
  if (side === "s") return { x: box.x + box.w / 2, y: box.y + box.h };
  if (side === "w") return { x: box.x, y: box.y + box.h / 2 };
  return { x: box.x + box.w, y: box.y + box.h / 2 };
}

function bestSides(from: Box, to: Box): [Side, Side] {
  const sides: Side[] = ["n", "e", "s", "w"];
  let best: [Side, Side] = ["e", "w"];
  let score = Infinity;
  for (const a of sides) {
    for (const b of sides) {
      const pa = sidePoint(from, a);
      const pb = sidePoint(to, b);
      const d = Math.hypot(pb.x - pa.x, pb.y - pa.y);
      if (d < score) {
        score = d;
        best = [a, b];
      }
    }
  }
  return best;
}

function control(point: Point, side: Side, distance: number): Point {
  if (side === "n") return { x: point.x, y: point.y - distance };
  if (side === "s") return { x: point.x, y: point.y + distance };
  if (side === "w") return { x: point.x - distance, y: point.y };
  return { x: point.x + distance, y: point.y };
}

export function connectorGeometry(from: WhiteboardNode, to: WhiteboardNode) {
  const a = nodeBox(from);
  const b = nodeBox(to);
  const [fromSide, toSide] = bestSides(a, b);
  const start = sidePoint(a, fromSide);
  const end = sidePoint(b, toSide);
  const span = Math.max(48, Math.hypot(end.x - start.x, end.y - start.y) / 3);
  const c1 = control(start, fromSide, span);
  const c2 = control(end, toSide, span);
  return {
    d: `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`,
    end,
    angle: Math.atan2(end.y - c2.y, end.x - c2.x),
  };
}

export function moveNode(node: WhiteboardNode, dx: number, dy: number): WhiteboardNode {
  if (node.type === "path") {
    return {
      ...node,
      points: node.points.map(([x, y]) => [x + dx, y + dy] as [number, number]),
    };
  }
  return { ...node, x: node.x + dx, y: node.y + dy };
}

export function resizeNode(node: WhiteboardNode, box: Box): WhiteboardNode {
  if (node.type === "path") return node;
  return {
    ...node,
    x: box.x,
    y: box.y,
    w: Math.max(32, box.w),
    h: Math.max(28, box.h),
  };
}

export function createShape(
  type: "rect" | "ellipse" | "diamond" | "text",
  a: Point,
  b: Point,
): WhiteboardNode {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const w = Math.max(36, Math.abs(b.x - a.x));
  const h = Math.max(36, Math.abs(b.y - a.y));
  if (type === "text") {
    return { type: "text", id: nid(), x, y, w: Math.max(w, 160), h: Math.max(h, 56), text: "" };
  }
  return { type, id: nid(), x, y, w, h };
}

export function createPath(points: [number, number][]): WhiteboardNode | null {
  if (points.length < 2) return null;
  return { type: "path", id: nid(), points, width: 2.4 };
}

export function createImage(src: string, at: Point, width: number, height: number): WhiteboardNode {
  const max = 420;
  const scale = Math.min(1, max / Math.max(width, height, 1));
  const w = Math.max(80, width * scale);
  const h = Math.max(80, height * scale);
  return { type: "image", id: nid(), x: at.x - w / 2, y: at.y - h / 2, w, h, src };
}

export function createConnector(from: string, to: string): WhiteboardConnector | null {
  if (!from || !to || from === to) return null;
  return { id: nid(), from, to };
}

export function removeNode(doc: WhiteboardDoc, id: string): WhiteboardDoc {
  return {
    nodes: doc.nodes.filter((node) => node.id !== id),
    connectors: doc.connectors.filter((link) => link.from !== id && link.to !== id),
  };
}

export function upsertNode(doc: WhiteboardDoc, node: WhiteboardNode): WhiteboardDoc {
  const index = doc.nodes.findIndex((item) => item.id === node.id);
  if (index < 0) return { ...doc, nodes: [...doc.nodes, node] };
  const nodes = doc.nodes.slice();
  nodes[index] = node;
  return { ...doc, nodes };
}

export async function compactWhiteboard(doc: WhiteboardDoc): Promise<WhiteboardDoc> {
  const nodes: WhiteboardNode[] = [];
  let changed = false;
  for (const node of doc.nodes) {
    if (node.type !== "image" || !node.src.startsWith("data:image/")) {
      nodes.push(node);
      continue;
    }
    const src = await optimizeDataUrl(node.src);
    if (src !== node.src) changed = true;
    nodes.push({ ...node, src });
  }
  return changed ? { ...doc, nodes } : doc;
}

export function stripWhiteboardDataUrls(doc: WhiteboardDoc): WhiteboardDoc {
  return {
    ...doc,
    nodes: doc.nodes.map((node) =>
      node.type === "image" && node.src.startsWith("data:image/")
        ? { ...node, src: `${ASSET_PREFIX}${node.id}` }
        : node,
    ),
  };
}

export function simplifyPoints(points: [number, number][], min = 2): [number, number][] {
  if (points.length < 3) return points;
  const next: [number, number][] = [points[0]!];
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = next[next.length - 1]!;
    const cur = points[i]!;
    if (Math.hypot(cur[0] - prev[0], cur[1] - prev[1]) >= min) next.push(cur);
  }
  next.push(points[points.length - 1]!);
  return next;
}
