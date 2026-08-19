import {
  ArrowUpRight,
  Circle,
  Diamond,
  Hand,
  MousePointer2,
  Pencil,
  Save,
  Square,
  StickyNote,
  Trash2,
  Type,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { selectActiveTheme, useBoardStore } from "@/lib/kanban";
import { fileToDataUrl, isImageFile } from "@/lib/markdown-image";
import { getUnlockToken } from "@/lib/unlock";
import { saveWorkspace } from "@/lib/workspace";
import { stashWhiteboardImages } from "@/lib/whiteboard-persist";
import {
  type Box,
  type Point,
  type WhiteboardDoc,
  type WhiteboardNode,
  type WhiteboardTool,
  compactWhiteboard,
  connectorGeometry,
  createConnector,
  createImage,
  createPath,
  createShape,
  emptyWhiteboard,
  hitNode,
  moveNode,
  nodeBox,
  normalizeWhiteboard,
  removeNode,
  resizeNode,
  simplifyPoints,
  upsertNode,
  whiteboardSignature,
} from "@/lib/whiteboard";
import { cn } from "@/lib/utils";

type Camera = { x: number; y: number; z: number };
type Drag =
  | { kind: "pan"; last: Point }
  | { kind: "move"; id: string; last: Point }
  | { kind: "draw"; points: [number, number][] }
  | { kind: "shape"; start: Point; current: Point }
  | { kind: "resize"; id: string; handle: Handle; start: Point; box: Box };

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const TOOLS: { id: WhiteboardTool; label: string; icon: typeof Pencil }[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "pan", label: "Pan", icon: Hand },
  { id: "pen", label: "Draw", icon: Pencil },
  { id: "text", label: "Write", icon: Type },
  { id: "rect", label: "Rectangle", icon: Square },
  { id: "ellipse", label: "Ellipse", icon: Circle },
  { id: "diamond", label: "Diamond", icon: Diamond },
  { id: "arrow", label: "Connect", icon: ArrowUpRight },
];

function worldPoint(event: { clientX: number; clientY: number }, rect: DOMRect, camera: Camera): Point {
  return {
    x: (event.clientX - rect.left - camera.x) / camera.z,
    y: (event.clientY - rect.top - camera.y) / camera.z,
  };
}

function applyHandle(box: Box, handle: Handle, point: Point): Box {
  let { x, y, w, h } = box;
  const right = x + w;
  const bottom = y + h;
  if (handle.includes("w")) x = point.x;
  if (handle.includes("e")) w = point.x - x;
  if (handle.includes("n")) y = point.y;
  if (handle.includes("s")) h = point.y - y;
  if (handle.includes("w")) w = right - x;
  if (handle.includes("n")) h = bottom - y;
  return { x, y, w, h };
}

function imageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth || 320, height: image.naturalHeight || 240 });
    image.onerror = () => resolve({ width: 320, height: 240 });
    image.src = src;
  });
}

export function WhiteboardCanvas({ onClose }: { onClose: () => void }) {
  const theme = useBoardStore(selectActiveTheme);
  const setThemeWhiteboard = useBoardStore((state) => state.setThemeWhiteboard);
  const saved = theme.whiteboard ?? emptyWhiteboard();
  const [doc, setDoc] = useState<WhiteboardDoc>(() => normalizeWhiteboard(saved));
  const [camera, setCamera] = useState<Camera>({ x: 48, y: 48, z: 1 });
  const [tool, setTool] = useState<WhiteboardTool>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [linkFrom, setLinkFrom] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [saving, setSaving] = useState(false);
  const space = useRef(false);
  const frame = useRef<HTMLDivElement>(null);
  const savedSig = useMemo(() => whiteboardSignature(saved), [saved]);
  const dirty = whiteboardSignature(doc) !== savedSig;

  useEffect(() => {
    setDoc(normalizeWhiteboard(theme.whiteboard));
    setSelectedId(null);
    setLinkFrom(null);
    setEditingId(null);
    setDrag(null);
  }, [theme.id]);

  useEffect(() => {
    if (dirty) return;
    setDoc(normalizeWhiteboard(saved));
  }, [savedSig, dirty, saved]);

  const nodesById = useMemo(() => {
    const map = new Map<string, WhiteboardNode>();
    for (const node of doc.nodes) map.set(node.id, node);
    return map;
  }, [doc.nodes]);

  const selected = selectedId ? nodesById.get(selectedId) ?? null : null;

  const toWorld = useCallback(
    (event: { clientX: number; clientY: number }) => {
      const rect = frame.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return worldPoint(event, rect, camera);
    },
    [camera],
  );

  async function placeImage(file: File, at?: Point) {
    if (!isImageFile(file)) return;
    const src = await fileToDataUrl(file);
    const size = await imageSize(src);
    const point = at ?? {
      x: (innerWidth / 2 - camera.x) / camera.z,
      y: (innerHeight / 2 - camera.y) / camera.z,
    };
    const node = createImage(src, point, size.width, size.height);
    setDoc((current) => upsertNode(current, node));
    setSelectedId(node.id);
    setTool("select");
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === " " && !event.repeat) space.current = true;
      const typing = event.target instanceof HTMLTextAreaElement;
      if (typing) return;
      if (event.key === "Escape") {
        setLinkFrom(null);
        setEditingId(null);
        setDrag(null);
        setTool("select");
        return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        event.preventDefault();
        setDoc((current) => removeNode(current, selectedId));
        setSelectedId(null);
      }
      if (event.key === "v") setTool("select");
      if (event.key === "h") setTool("pan");
      if (event.key === "p") setTool("pen");
      if (event.key === "t") setTool("text");
      if (event.key === "r") setTool("rect");
      if (event.key === "o") setTool("ellipse");
      if (event.key === "d") setTool("diamond");
      if (event.key === "l") setTool("arrow");
    }
    function onUp(event: KeyboardEvent) {
      if (event.key === " ") space.current = false;
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, [selectedId]);

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (event.button === 1 || space.current || tool === "pan") {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDrag({ kind: "pan", last: { x: event.clientX, y: event.clientY } });
      setEditingId(null);
      return;
    }
    if (event.button !== 0) return;
    const point = toWorld(event);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (tool === "pen") {
      setDrag({ kind: "draw", points: [[point.x, point.y]] });
      setSelectedId(null);
      setEditingId(null);
      return;
    }
    if (tool === "rect" || tool === "ellipse" || tool === "diamond" || tool === "text") {
      setDrag({ kind: "shape", start: point, current: point });
      setSelectedId(null);
      setEditingId(null);
      return;
    }
    if (tool === "arrow") {
      const hit = hitNode(doc.nodes, point);
      if (!hit || hit.type === "path") {
        toast("Select a shape, note, or image to connect.");
        return;
      }
      if (!linkFrom) {
        setLinkFrom(hit.id);
        setSelectedId(hit.id);
        return;
      }
      const link = createConnector(linkFrom, hit.id);
      if (link) {
        setDoc((current) => {
          const exists = current.connectors.some(
            (item) => item.from === link.from && item.to === link.to,
          );
          return exists ? current : { ...current, connectors: [...current.connectors, link] };
        });
      }
      setLinkFrom(null);
      setSelectedId(hit.id);
      return;
    }

    const handle = (event.target as HTMLElement).dataset.handle as Handle | undefined;
    if (handle && selected && selected.type !== "path") {
      setDrag({ kind: "resize", id: selected.id, handle, start: point, box: nodeBox(selected) });
      return;
    }
    const hit = hitNode(doc.nodes, point);
    setSelectedId(hit?.id ?? null);
    setEditingId(null);
    if (hit) setDrag({ kind: "move", id: hit.id, last: point });
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!drag) return;
    if (drag.kind === "pan") {
      const dx = event.clientX - drag.last.x;
      const dy = event.clientY - drag.last.y;
      setCamera((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
      setDrag({ kind: "pan", last: { x: event.clientX, y: event.clientY } });
      return;
    }
    const point = toWorld(event);
    if (drag.kind === "draw") {
      setDrag({ kind: "draw", points: simplifyPoints([...drag.points, [point.x, point.y]], 1.6) });
      return;
    }
    if (drag.kind === "shape") {
      setDrag({ ...drag, current: point });
      return;
    }
    if (drag.kind === "move") {
      const dx = point.x - drag.last.x;
      const dy = point.y - drag.last.y;
      setDoc((current) => {
        const node = current.nodes.find((item) => item.id === drag.id);
        if (!node) return current;
        return upsertNode(current, moveNode(node, dx, dy));
      });
      setDrag({ ...drag, last: point });
      return;
    }
    setDoc((current) => {
      const node = current.nodes.find((item) => item.id === drag.id);
      if (!node || node.type === "path") return current;
      return upsertNode(current, resizeNode(node, applyHandle(drag.box, drag.handle, point)));
    });
  }

  function handlePointerUp() {
    if (!drag) return;
    if (drag.kind === "draw") {
      const node = createPath(simplifyPoints(drag.points, 1.8));
      if (node) {
        setDoc((current) => upsertNode(current, node));
        setSelectedId(node.id);
      }
    }
    if (drag.kind === "shape") {
      const type = tool === "text" || tool === "rect" || tool === "ellipse" || tool === "diamond" ? tool : "rect";
      if (type === "text" || type === "rect" || type === "ellipse" || type === "diamond") {
        const node = createShape(type, drag.start, drag.current);
        setDoc((current) => upsertNode(current, node));
        setSelectedId(node.id);
        if (type === "text") setEditingId(node.id);
        setTool("select");
      }
    }
    setDrag(null);
  }

  function handleWheel(event: React.WheelEvent<SVGSVGElement>) {
    event.preventDefault();
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const nextZ = Math.min(2.4, Math.max(0.28, camera.z * (event.deltaY > 0 ? 0.92 : 1.08)));
    const cursor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const world = worldPoint(event, rect, camera);
    setCamera({
      z: nextZ,
      x: cursor.x - world.x * nextZ,
      y: cursor.y - world.y * nextZ,
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const compacted = await compactWhiteboard(doc);
      setDoc(compacted);
      setThemeWhiteboard(compacted);
      const latest = useBoardStore.getState();
      const token = getUnlockToken();
      const persisted = await stashWhiteboardImages(latest.themes, token);
      const result = await saveWorkspace({
        data: {
          themes: persisted,
          activeThemeId: latest.activeThemeId,
          token,
        },
      });
      if (!result?.ok) throw new Error("save failed");
      toast.success("Canvas saved");
    } catch {
      toast.error("Could not save the canvas.");
    } finally {
      setSaving(false);
    }
  }

  const draftShape =
    drag?.kind === "shape" && (tool === "rect" || tool === "ellipse" || tool === "diamond" || tool === "text")
      ? createShape(tool, drag.start, drag.current)
      : null;

  return (
    <section className="overflow-hidden rounded-xl bg-bg-elevated shadow-border">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <p className="mr-auto text-xs font-medium tracking-[0.16em] text-subtle uppercase">
          Canvas
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Back to board
        </Button>
        <Button type="button" size="sm" disabled={!dirty || saving} onClick={() => void handleSave()}>
          <Save className="size-3.5" />
          {saving ? "Saving" : dirty ? "Save changes" : "Saved"}
        </Button>
      </div>

      <div
        ref={frame}
        tabIndex={0}
        className="relative h-[min(70dvh,46rem)] overflow-hidden bg-bg outline-none"
        onPaste={(event) => {
          const file = [...event.clipboardData.files][0];
          if (file) {
            event.preventDefault();
            const rect = frame.current?.getBoundingClientRect();
            const at = rect
              ? {
                  x: (rect.width / 2 - camera.x) / camera.z,
                  y: (rect.height / 2 - camera.y) / camera.z,
                }
              : undefined;
            void placeImage(file, at);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          const file = [...event.dataTransfer.files][0];
          if (file) void placeImage(file, toWorld(event));
        }}
      >
        <svg
          className={cn(
            "absolute inset-0 size-full touch-none",
            tool === "pan" || space.current ? "cursor-grab" : "cursor-crosshair",
            tool === "select" && "cursor-default",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          onDoubleClick={(event) => {
            const hit = hitNode(doc.nodes, toWorld(event));
            if (hit?.type === "text") {
              setEditingId(hit.id);
              setSelectedId(hit.id);
            }
          }}
        >
          <defs>
            <pattern
              id="wb-grid"
              width={32}
              height={32}
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" className="fill-border-strong" />
            </pattern>
          </defs>
          <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.z})`}>
            <rect x={-4000} y={-4000} width={8000} height={8000} fill="url(#wb-grid)" />
            {doc.connectors.map((link) => {
              const from = nodesById.get(link.from);
              const to = nodesById.get(link.to);
              if (!from || !to) return null;
              const geo = connectorGeometry(from, to);
              return (
                <g key={link.id} className="text-doing">
                  <path d={geo.d} fill="none" stroke="currentColor" strokeWidth={2.2} />
                  <polygon
                    className="fill-doing"
                    transform={`translate(${geo.end.x} ${geo.end.y}) rotate(${(geo.angle * 180) / Math.PI})`}
                    points="0,0 -12,-5 -12,5"
                  />
                </g>
              );
            })}
            {doc.nodes.map((node) => (
              <NodeView
                key={node.id}
                node={node}
                selected={node.id === selectedId || node.id === linkFrom}
                editing={node.id === editingId}
                onText={(text) =>
                  setDoc((current) => {
                    const existing = current.nodes.find((item) => item.id === node.id);
                    if (!existing || existing.type !== "text") return current;
                    return upsertNode(current, { ...existing, text });
                  })
                }
              />
            ))}
            {drag?.kind === "draw" ? (
              <polyline
                points={drag.points.map((point) => point.join(",")).join(" ")}
                fill="none"
                className="stroke-fg"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {draftShape ? <NodeView node={draftShape} selected editing={false} /> : null}
            {selected && selected.type !== "path" ? <Handles box={nodeBox(selected)} /> : null}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3">
          <div className="pointer-events-auto flex items-center gap-1 rounded-lg bg-bg-elevated/95 p-1 shadow-lift">
            {TOOLS.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  type="button"
                  size="icon-sm"
                  variant={tool === item.id ? "secondary" : "ghost"}
                  aria-label={item.label}
                  title={item.label}
                  onClick={() => {
                    setTool(item.id);
                    setLinkFrom(null);
                    setEditingId(null);
                  }}
                >
                  <Icon className="size-4" />
                </Button>
              );
            })}
            <span className="mx-1 h-6 w-px bg-border" />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Zoom out"
              onClick={() => setCamera((current) => ({ ...current, z: Math.max(0.28, current.z * 0.9) }))}
            >
              <ZoomOut className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Zoom in"
              onClick={() => setCamera((current) => ({ ...current, z: Math.min(2.4, current.z * 1.1) }))}
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Delete"
              disabled={!selectedId}
              onClick={() => {
                if (!selectedId) return;
                setDoc((current) => removeNode(current, selectedId));
                setSelectedId(null);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <p className="flex items-center gap-2 px-3 py-2 text-xs text-subtle">
        <StickyNote className="size-3.5" />
        {linkFrom
          ? "Click another shape to draw the arrow."
          : dirty
            ? "Unsaved marks on this tab. Save to keep them in the workspace."
            : "Draw, write, paste images, and connect shapes. Wheel zooms · space pans."}
      </p>
    </section>
  );
}

function NodeView({
  node,
  selected,
  editing,
  onText,
}: {
  node: WhiteboardNode;
  selected: boolean;
  editing: boolean;
  onText?: (text: string) => void;
}) {
  const ring = selected ? "stroke-accent" : "stroke-border-strong";
  if (node.type === "path") {
    return (
      <polyline
        points={node.points.map((point) => point.join(",")).join(" ")}
        fill="none"
        className={selected ? "stroke-accent" : "stroke-fg"}
        strokeWidth={node.width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
  if (node.type === "image") {
    if (!node.src.startsWith("data:image/")) return null;
    return (
      <image
        href={node.src}
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        className={selected ? "outline outline-2 outline-accent" : undefined}
        preserveAspectRatio="xMidYMid meet"
      />
    );
  }
  if (node.type === "ellipse") {
    return (
      <ellipse
        cx={node.x + node.w / 2}
        cy={node.y + node.h / 2}
        rx={node.w / 2}
        ry={node.h / 2}
        className={cn("fill-surface", ring)}
        strokeWidth={1.6}
      />
    );
  }
  if (node.type === "diamond") {
    const midX = node.x + node.w / 2;
    const midY = node.y + node.h / 2;
    return (
      <polygon
        points={`${midX},${node.y} ${node.x + node.w},${midY} ${midX},${node.y + node.h} ${node.x},${midY}`}
        className={cn("fill-surface", ring)}
        strokeWidth={1.6}
      />
    );
  }
  if (node.type === "text") {
    return (
      <g>
        <rect
          x={node.x}
          y={node.y}
          width={node.w}
          height={node.h}
          rx={10}
          className={cn("fill-bg-elevated", ring)}
          strokeWidth={1.6}
        />
        <foreignObject x={node.x + 8} y={node.y + 8} width={Math.max(40, node.w - 16)} height={Math.max(24, node.h - 16)}>
          {editing ? (
            <textarea
              value={node.text}
              onChange={(event) => onText?.(event.target.value)}
              className="h-full w-full resize-none bg-transparent text-sm text-fg outline-none"
              autoFocus
            />
          ) : (
            <p className="h-full overflow-hidden text-sm leading-relaxed whitespace-pre-wrap text-fg">
              {node.text || "Write here"}
            </p>
          )}
        </foreignObject>
      </g>
    );
  }
  return (
    <rect
      x={node.x}
      y={node.y}
      width={node.w}
      height={node.h}
      rx={12}
      className={cn("fill-surface", ring)}
      strokeWidth={1.6}
    />
  );
}

function Handles({ box }: { box: Box }) {
  const spots: { id: Handle; x: number; y: number }[] = [
    { id: "nw", x: box.x, y: box.y },
    { id: "n", x: box.x + box.w / 2, y: box.y },
    { id: "ne", x: box.x + box.w, y: box.y },
    { id: "e", x: box.x + box.w, y: box.y + box.h / 2 },
    { id: "se", x: box.x + box.w, y: box.y + box.h },
    { id: "s", x: box.x + box.w / 2, y: box.y + box.h },
    { id: "sw", x: box.x, y: box.y + box.h },
    { id: "w", x: box.x, y: box.y + box.h / 2 },
  ];
  return (
    <g>
      {spots.map((spot) => (
        <rect
          key={spot.id}
          data-handle={spot.id}
          x={spot.x - 5}
          y={spot.y - 5}
          width={10}
          height={10}
          className="fill-accent stroke-bg"
          strokeWidth={1}
        />
      ))}
    </g>
  );
}
