import type { Theme } from "@/lib/kanban";
import { optimizeDataUrl } from "@/lib/markdown-image";
import { ASSET_PREFIX } from "@/lib/whiteboard";
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
    const nodes = [];
    for (const node of theme.whiteboard?.nodes ?? []) {
      if (node.type !== "image") {
        nodes.push(node);
        continue;
      }
      if (node.src.startsWith(ASSET_PREFIX)) {
        nodes.push(node);
        continue;
      }
      if (!node.src.startsWith("data:image/")) {
        nodes.push(node);
        continue;
      }
      const mark = fingerprint(node.src);
      if (uploaded.get(node.id) !== mark) {
        const data = await optimizeDataUrl(node.src);
        const saved = await saveWorkspaceAsset({
          data: { id: node.id, data, token },
        });
        if (!saved?.ok) {
          throw new Error("Could not save a canvas image.");
        }
        uploaded.set(node.id, fingerprint(data));
      }
      changed = true;
      nodes.push({ ...node, src: `${ASSET_PREFIX}${node.id}` });
    }
    next.push(
      theme.whiteboard
        ? { ...theme, whiteboard: { ...theme.whiteboard, nodes } }
        : theme,
    );
  }
  return changed ? next : themes;
}
