if (typeof window !== "undefined") {
  const win = window as Window & { EXCALIDRAW_ASSET_PATH?: string };
  if (!win.EXCALIDRAW_ASSET_PATH) win.EXCALIDRAW_ASSET_PATH = "/excalidraw/";
}

export {};
