import { rememberAssets } from "@/lib/asset-cache";
import type { Theme } from "@/lib/kanban";
import { isAllowedImageDataUrl, optimizeDataUrl } from "@/lib/markdown-image";
import {
  ASSET_PREFIX,
  listWhiteboardImages,
  replaceWhiteboardImages,
  whiteboardFileAssetId,
} from "@/lib/whiteboard";
import { saveWorkspaceAsset } from "@/lib/workspace";

const uploaded = new Map<string, string>();

function fingerprint(src: string) {
  return `${src.length}:${src.slice(0, 24)}:${src.slice(-24)}`;
}

export async function stashWhiteboardImages(
  themes: Theme[],
  token: string,
): Promise<Theme[]> {
  let changed = false;
  const next: Theme[] = [];
  for (const theme of themes) {
    const images = listWhiteboardImages(theme.whiteboard);
    if (!images.length) {
      next.push(theme);
      continue;
    }
    const srcById = new Map<string, string>();
    let themeChanged = false;
    for (const image of images) {
      if (image.src.startsWith(ASSET_PREFIX)) {
        srcById.set(image.id, image.src);
        continue;
      }
      if (!image.src.startsWith("data:image/")) continue;
      if (!isAllowedImageDataUrl(image.src)) continue;
      const assetId = whiteboardFileAssetId(image.id);
      const mark = fingerprint(image.src);
      if (uploaded.get(assetId) !== mark) {
        const data = await optimizeDataUrl(image.src);
        if (!isAllowedImageDataUrl(data)) {
          throw new Error("Could not save a canvas image.");
        }
        const saved = await saveWorkspaceAsset({
          data: { id: assetId, data, token },
        });
        if (!saved?.ok) {
          throw new Error("Could not save a canvas image.");
        }
        uploaded.set(assetId, fingerprint(data));
        rememberAssets([{ id: assetId, data }]);
      }
      themeChanged = true;
      srcById.set(image.id, `${ASSET_PREFIX}${assetId}`);
    }
    if (!themeChanged) {
      next.push(theme);
      continue;
    }
    changed = true;
    next.push({
      ...theme,
      whiteboard: replaceWhiteboardImages(theme.whiteboard, srcById),
    });
  }
  return changed ? next : themes;
}

export async function stashCardImages(
  themes: Theme[],
  token: string,
): Promise<Theme[]> {
  let changed = false;
  const next: Theme[] = [];
  for (const theme of themes) {
    const cards = { ...theme.cards };
    let themeChanged = false;
    for (const card of Object.values(theme.cards)) {
      const images: Record<string, string> = {};
      let cardChanged = false;
      for (const [id, src] of Object.entries(card.images)) {
        if (src.startsWith(ASSET_PREFIX)) {
          images[id] = src;
          continue;
        }
        if (!src.startsWith("data:image/") || !isAllowedImageDataUrl(src)) {
          cardChanged = true;
          continue;
        }
        const mark = fingerprint(src);
        if (uploaded.get(id) !== mark) {
          const data = await optimizeDataUrl(src);
          if (!isAllowedImageDataUrl(data)) {
            cardChanged = true;
            continue;
          }
          const saved = await saveWorkspaceAsset({
            data: { id, data, token },
          });
          if (!saved?.ok) {
            throw new Error("Could not save a card image.");
          }
          uploaded.set(id, fingerprint(data));
          rememberAssets([{ id, data }]);
        }
        images[id] = `${ASSET_PREFIX}${id}`;
        cardChanged = true;
      }
      if (!cardChanged) continue;
      cards[card.id] = { ...card, images };
      themeChanged = true;
      changed = true;
    }
    next.push(themeChanged ? { ...theme, cards } : theme);
  }
  return changed ? next : themes;
}

export async function stashBoardAssets(themes: Theme[], token: string) {
  return stashWhiteboardImages(await stashCardImages(themes, token), token);
}
