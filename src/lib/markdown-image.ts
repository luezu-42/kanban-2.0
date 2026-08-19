import type { Theme } from "@/lib/kanban";

const MAX_EDGE = 1280;
const TARGET_CHARS = 160_000;
const HARD_CHARS = 280_000;
const DATA_URL_RE = /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g;

export function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(file.name);
}

export async function fileToDataUrl(file: File): Promise<string> {
  if (!isImageFile(file)) {
    throw new Error("Choose an image file.");
  }

  if (file.type === "image/svg+xml") {
    return readAsDataUrl(file);
  }

  if (file.type === "image/gif" && file.size < 280_000) {
    return readAsDataUrl(file);
  }

  try {
    return await compressImage(file);
  } catch {
    return readAsDataUrl(file);
  }
}

export async function optimizeDataUrl(url: string): Promise<string> {
  if (!url.startsWith("data:image/") || url.startsWith("data:image/svg+xml")) {
    return url;
  }
  if (url.startsWith("data:image/gif") && url.length < 360_000) {
    return url;
  }
  if (url.startsWith("data:image/webp") && url.length <= TARGET_CHARS) {
    return url;
  }
  if (url.length <= 72_000) return url;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await compressImage(blob);
  } catch {
    return url;
  }
}

export async function compactMarkdownImages(markdown: string): Promise<string> {
  const matches = markdown.match(DATA_URL_RE);
  if (!matches?.length) return markdown;
  let next = markdown;
  const seen = new Set<string>();
  for (const url of matches) {
    if (seen.has(url)) continue;
    seen.add(url);
    const optimized = await optimizeDataUrl(url);
    if (optimized !== url) next = next.split(url).join(optimized);
  }
  return next;
}

export async function compactThemeImages(themes: Theme[]): Promise<Theme[]> {
  let changed = false;
  const next: Theme[] = [];
  for (const theme of themes) {
    const cards = { ...theme.cards };
    let themeChanged = false;
    for (const card of Object.values(theme.cards)) {
      const extracted = extractInlineImages(card.details, card.images);
      const images: Record<string, string> = {};
      for (const [id, url] of Object.entries(extracted.images)) {
        images[id] = await optimizeDataUrl(url);
      }
      const detailsChanged = extracted.details !== card.details;
      const imagesChanged =
        Object.keys(images).length !== Object.keys(card.images).length ||
        Object.entries(images).some(([id, url]) => card.images[id] !== url);
      if (!detailsChanged && !imagesChanged) continue;
      cards[card.id] = { ...card, details: extracted.details, images };
      themeChanged = true;
      changed = true;
    }
    next.push(themeChanged ? { ...theme, cards } : theme);
  }
  return changed ? next : themes;
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || !result.startsWith("data:")) {
        reject(new Error("Could not read this image."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.readAsDataURL(file);
  });
}

async function compressImage(source: Blob): Promise<string> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(source);
    try {
      return await encodeAdaptive(bitmap, bitmap.width, bitmap.height);
    } finally {
      bitmap.close();
    }
  }
  const objectUrl = URL.createObjectURL(source);
  const image = await loadHtmlImage(objectUrl);
  return encodeAdaptive(image, image.naturalWidth, image.naturalHeight);
}

async function encodeAdaptive(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
): Promise<string> {
  let edge = MAX_EDGE;
  let quality = 0.72;
  let best = "";
  for (let pass = 0; pass < 3; pass += 1) {
    const encoded = await drawToDataUrl(source, sourceWidth, sourceHeight, edge, quality);
    best = encoded;
    if (encoded.length <= TARGET_CHARS) return encoded;
    edge = Math.max(640, Math.round(edge * 0.78));
    quality = Math.max(0.52, quality - 0.12);
  }
  if (best.length > HARD_CHARS) {
    return drawToDataUrl(source, sourceWidth, sourceHeight, 640, 0.48);
  }
  return best;
}

async function drawToDataUrl(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  maxEdge: number,
  quality: number,
): Promise<string> {
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

function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not read this image."));
          return;
        }
        void readAsDataUrl(blob).then(resolve, reject);
      },
      type,
      quality,
    );
  });
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(src);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(src);
      reject(new Error("Could not read this image."));
    };
    image.src = src;
  });
}

export function filesFromDataTransfer(data: DataTransfer | null): File[] {
  if (!data) return [];
  const fromFiles = [...data.files].filter(isImageFile);
  if (fromFiles.length) return fromFiles;
  return [...data.items]
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));
}

export function filesFromClipboard(data: DataTransfer | null): File[] {
  if (!data) return [];
  const fromItems = [...data.items]
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));
  if (fromItems.length) return fromItems;
  return [...data.files].filter(isImageFile);
}

export function markdownImageSnippet(file: File, ref: string) {
  const alt = file.name.replace(/\.[^.]+$/, "").replace(/[[\]()\n]/g, " ").trim() || "image";
  return `![${alt}](${ref})`;
}

export const IMAGE_REF_PREFIX = "ledger:img/";

export function imageRef(id: string) {
  return `${IMAGE_REF_PREFIX}${id}`;
}

export function newImageId() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 10);
}

export function resolveImageUrl(url: string, images: Record<string, string>) {
  const id = imageIdFromUrl(url);
  if (!id) return url;
  return images[id] ?? url;
}

export function imageIdFromUrl(url: string) {
  const trimmed = url.trim();
  if (trimmed.startsWith(IMAGE_REF_PREFIX)) {
    return trimmed.slice(IMAGE_REF_PREFIX.length);
  }
  const path = trimmed.match(/\/ledger-img\/([a-zA-Z0-9_-]+)/);
  return path?.[1] ?? null;
}

export function expandMarkdownImages(
  details: string,
  images: Record<string, string>,
) {
  return details.replace(
    /!\[([^\]]*)\]\((ledger:img\/[a-zA-Z0-9_-]+|\/ledger-img\/[a-zA-Z0-9_-]+)\)/g,
    (_full, alt: string, ref: string) => {
      const resolved = resolveImageUrl(ref, images);
      return resolved.startsWith("data:image/") ? `![${alt}](${resolved})` : `![${alt}](${ref})`;
    },
  );
}

export function extractInlineImages(
  details: string,
  images: Record<string, string> = {},
) {
  const nextImages = { ...images };
  const nextDetails = details.replace(
    /!\[([^\]]*)\]\((data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+)\)/g,
    (_full, alt: string, url: string) => {
      const existing = Object.entries(nextImages).find(([, value]) => value === url);
      const id = existing?.[0] ?? newImageId();
      nextImages[id] = url;
      return `![${alt}](${imageRef(id)})`;
    },
  );
  return { details: nextDetails, images: pruneImages(nextDetails, nextImages) };
}

export function pruneImages(details: string, images: Record<string, string>) {
  const used = new Set(
    [...details.matchAll(/ledger:img\/([a-zA-Z0-9_-]+)/g)].map((match) => match[1]!),
  );
  return Object.fromEntries(
    Object.entries(images).filter(([id]) => used.has(id)),
  );
}

export function insertAroundSelection(
  value: string,
  start: number,
  end: number,
  before: string,
  after = "",
  placeholder = "",
) {
  const selected = value.slice(start, end) || placeholder;
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  const cursor = start + before.length + selected.length + after.length;
  return { next, cursor };
}
