import "./excalidraw-asset-path";
import "@excalidraw/excalidraw/index.css";
import { Excalidraw, restore } from "@excalidraw/excalidraw";
import { useCallback, useRef } from "react";
import {
  assetIdFromSrc,
  ensureAssets,
  fetchAssetRows,
  resolveAsset,
} from "@/lib/asset-cache";
import type { Appearance } from "@/lib/profile";
import { getUnlockToken } from "@/lib/unlock";
import { loadWorkspaceAssets } from "@/lib/workspace";
import { migrateLegacyWhiteboard } from "@/lib/whiteboard-migrate";
import {
  type ExcalidrawWhiteboard,
  type WhiteboardDoc,
  type WhiteboardFile,
  emptyWhiteboard,
  isLegacyWhiteboard,
  listWhiteboardImages,
} from "@/lib/whiteboard";
import type {
  BinaryFileData,
  BinaryFiles,
  DataURL,
  ExcalidrawProps,
} from "@excalidraw/excalidraw/types";

type SceneElements = Parameters<NonNullable<ExcalidrawProps["onChange"]>>[0];
type SceneAppState = Parameters<NonNullable<ExcalidrawProps["onChange"]>>[1];
type SceneFiles = Parameters<NonNullable<ExcalidrawProps["onChange"]>>[2];

function asFileId(id: string) {
  return id as BinaryFileData["id"];
}

function asMime(value: string): BinaryFileData["mimeType"] {
  return value as BinaryFileData["mimeType"];
}

function sceneFiles(doc: ExcalidrawWhiteboard): BinaryFiles {
  const files: BinaryFiles = {};
  for (const file of Object.values(doc.files)) {
    const dataURL = resolveAsset(file.src);
    if (!dataURL.startsWith("data:image/")) continue;
    files[file.id] = {
      id: asFileId(file.id),
      dataURL: dataURL as DataURL,
      mimeType: asMime(file.mimeType || "image/png"),
      created: file.created || Date.now(),
    };
  }
  return files;
}

function toWhiteboard(
  elements: SceneElements,
  appState: SceneAppState,
  files: SceneFiles,
): ExcalidrawWhiteboard {
  const live = elements.filter((el) => !el.isDeleted);
  const used = new Set<string>();
  for (const el of live) {
    if ("fileId" in el && typeof el.fileId === "string" && el.fileId) {
      used.add(el.fileId);
    }
  }
  const nextFiles: Record<string, WhiteboardFile> = {};
  for (const file of Object.values(files)) {
    if (!used.has(file.id)) continue;
    if (typeof file.dataURL !== "string" || !file.dataURL.startsWith("data:image/")) continue;
    nextFiles[file.id] = {
      id: file.id,
      mimeType: file.mimeType,
      created: file.created,
      src: file.dataURL,
    };
  }
  return {
    format: "excalidraw",
    elements: JSON.parse(JSON.stringify(live)) as ExcalidrawWhiteboard["elements"],
    appState: {
      viewBackgroundColor: appState.viewBackgroundColor,
      scrollX: appState.scrollX,
      scrollY: appState.scrollY,
      zoom: appState.zoom ? { value: appState.zoom.value } : undefined,
      gridSize: appState.gridSize ?? null,
    },
    files: nextFiles,
  };
}

async function hydrateFiles(doc: WhiteboardDoc) {
  const token = getUnlockToken();
  if (!token) return;
  const ids = listWhiteboardImages(doc)
    .map((image) => assetIdFromSrc(image.src))
    .filter((id): id is string => Boolean(id));
  if (!ids.length) return;
  await ensureAssets(ids, async (missing) => {
    const fromHttp = await fetchAssetRows(missing, token);
    if (fromHttp.length === missing.length) return fromHttp;
    const have = new Set(fromHttp.map((row) => row.id));
    const rest = missing.filter((id) => !have.has(id));
    if (!rest.length) return fromHttp;
    const fallback = await loadWorkspaceAssets({ data: { ids: rest, token } });
    return [...fromHttp, ...fallback];
  });
}

export function ExcalidrawEditor({
  doc,
  appearance,
  onDraft,
}: {
  doc: WhiteboardDoc;
  appearance: Appearance;
  onDraft: (next: WhiteboardDoc, migrated: boolean) => void;
}) {
  const theme = appearance === "light" ? "light" : "dark";
  const initialDoc = useRef(doc);
  const onDraftRef = useRef(onDraft);
  const ready = useRef(false);
  onDraftRef.current = onDraft;

  const loadInitial = useCallback(async () => {
    const current = initialDoc.current;
    await hydrateFiles(current);
    const migrated = isLegacyWhiteboard(current);
    let next: ExcalidrawWhiteboard;
    try {
      next = isLegacyWhiteboard(current)
        ? migrateLegacyWhiteboard(current)
        : current;
    } catch {
      next = emptyWhiteboard();
    }
    if (migrated) onDraftRef.current(next, true);
    ready.current = true;
    const files = sceneFiles(next);
    const restored = restore(
      {
        elements: next.elements as never,
        appState: { ...next.appState, theme } as never,
        files,
      },
      { theme },
      null,
    );
    return {
      elements: restored.elements,
      appState: restored.appState,
      files: restored.files,
      scrollToContent: next.appState.scrollX == null,
    };
  }, [theme]);

  const handleChange = useCallback(
    (elements: SceneElements, appState: SceneAppState, files: SceneFiles) => {
      if (!ready.current) return;
      onDraftRef.current(toWhiteboard(elements, appState, files), false);
    },
    [],
  );

  return (
    <Excalidraw
      initialData={loadInitial}
      onChange={handleChange}
      theme={theme}
      langCode="en"
      aiEnabled={false}
      isCollaborating={false}
      handleKeyboardGlobally
      generateIdForFile={async (file) => {
        const digest = await crypto.subtle.digest("SHA-1", await file.arrayBuffer());
        return [...new Uint8Array(digest)]
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
      }}
      UIOptions={{
        canvasActions: {
          loadScene: false,
          saveToActiveFile: false,
          toggleTheme: false,
          saveAsImage: true,
        },
      }}
    />
  );
}
