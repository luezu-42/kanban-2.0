import {
  convertToExcalidrawElements,
  restore,
} from "@excalidraw/excalidraw";
import type { BinaryFiles, DataURL } from "@excalidraw/excalidraw/types";
import { resolveAsset } from "@/lib/asset-cache";
import {
  type ExcalidrawWhiteboard,
  type LegacyWhiteboard,
  type WhiteboardFile,
} from "@/lib/whiteboard";

type Skeleton = NonNullable<Parameters<typeof convertToExcalidrawElements>[0]>[number];

function asFileId(id: string) {
  return id as BinaryFiles[string]["id"];
}

function mimeFromSrc(src: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);/i.exec(src);
  return match?.[1] ?? "image/png";
}

export function migrateLegacyWhiteboard(
  doc: LegacyWhiteboard,
): ExcalidrawWhiteboard {
  const skeleton: Skeleton[] = [];
  const files: Record<string, WhiteboardFile> = {};
  const binary: BinaryFiles = {};

  for (const node of doc.nodes) {
    if (node.type === "rect" || node.type === "ellipse" || node.type === "diamond") {
      skeleton.push({
        id: node.id,
        type: node.type === "rect" ? "rectangle" : node.type,
        x: node.x,
        y: node.y,
        width: node.w,
        height: node.h,
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
        text: node.text || " ",
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
        points: node.points.map(
          ([x, y]) => [x - origin[0], y - origin[1]] as [number, number],
        ),
      });
      continue;
    }
    if (node.type !== "image") continue;
    const src = resolveAsset(node.src);
    if (!src.startsWith("data:image/")) continue;
    const fileId = asFileId(node.id);
    const mimeType = mimeFromSrc(src);
    files[node.id] = {
      id: node.id,
      mimeType,
      created: Date.now(),
      src: node.src,
    };
    binary[node.id] = {
      id: fileId,
      dataURL: src as DataURL,
      mimeType: mimeType as BinaryFiles[string]["mimeType"],
      created: Date.now(),
    };
    skeleton.push({
      id: node.id,
      type: "image",
      x: node.x,
      y: node.y,
      width: node.w,
      height: node.h,
      fileId,
    });
  }

  for (const link of doc.connectors) {
    skeleton.push({
      id: link.id,
      type: "arrow",
      x: 0,
      y: 0,
      start: { id: link.from },
      end: { id: link.to },
    });
  }

  const converted = convertToExcalidrawElements(skeleton, { regenerateIds: false });
  const restored = restore(
    { elements: converted, appState: {}, files: binary },
    null,
    null,
  );

  return {
    format: "excalidraw",
    elements: JSON.parse(
      JSON.stringify(restored.elements.filter((el) => !el.isDeleted)),
    ) as ExcalidrawWhiteboard["elements"],
    appState: {},
    files,
  };
}
