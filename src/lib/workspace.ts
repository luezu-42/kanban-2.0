import { createServerFn } from "@tanstack/react-start";
import type { BoardDelta } from "@/lib/board-delta";
import { parseBoardPayload, type Theme } from "@/lib/kanban";

export const WORKSPACE_ID = "ledger";
const ASSET_ID = /^[a-zA-Z0-9_-]{1,64}$/;

export type BoardPayload = {
  themes: Theme[];
  activeThemeId: string;
};

export type WorkspaceSnapshot = BoardPayload & { version: number };

export type LoadWorkspaceResult =
  | { status: "empty" }
  | { status: "unchanged"; version: number }
  | ({ status: "ok" } & WorkspaceSnapshot)
  | ({ status: "delta" } & BoardDelta);

export type SaveWorkspaceResult =
  | { ok: true; version: number }
  | { ok: false; reason: "invalid" | "too-large" }
  | ({ ok: false; reason: "conflict" } & WorkspaceSnapshot);

function toPayload(themes: Theme[], activeThemeId: string): BoardPayload | null {
  return parseBoardPayload({ themes, activeThemeId });
}

export const unlockWorkspace = createServerFn({ method: "POST" })
  .validator((data: { password: string }) => ({ password: data.password }))
  .handler(async ({ data }) => {
    const { unlockWithPassword } = await import("@/lib/workspace-gate.server");
    return unlockWithPassword(data.password);
  });

export const checkUnlock = createServerFn({ method: "GET" })
  .validator((data: { token: string }) => ({ token: data.token }))
  .handler(async ({ data }) => {
    try {
      const { assertUnlock } = await import("@/lib/workspace-gate.server");
      await assertUnlock(data.token);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  });

export const loadProfile = createServerFn({ method: "GET" })
  .validator((data: { deviceId: string; token: string }) => ({
    deviceId: data.deviceId.trim(),
    token: data.token,
  }))
  .handler(async ({ data }) => {
    const { assertUnlock } = await import("@/lib/workspace-gate.server");
    await assertUnlock(data.token);
    const { readProfileName } = await import("@/lib/workspace.server");
    return readProfileName(data.deviceId);
  });

export const saveProfile = createServerFn({ method: "POST" })
  .validator((data: { deviceId: string; name: string; token: string }) => ({
    deviceId: data.deviceId.trim(),
    name: data.name.trim(),
    token: data.token,
  }))
  .handler(async ({ data }) => {
    const { assertUnlock } = await import("@/lib/workspace-gate.server");
    await assertUnlock(data.token);
    const { writeProfileName } = await import("@/lib/workspace.server");
    return writeProfileName(data.deviceId, data.name);
  });

export const loadWorkspace = createServerFn({ method: "GET" })
  .validator((data: { token: string; version?: number }) => ({
    token: data.token,
    version: typeof data.version === "number" && Number.isFinite(data.version) ? data.version : 0,
  }))
  .handler(async ({ data }): Promise<LoadWorkspaceResult> => {
    const { assertUnlock } = await import("@/lib/workspace-gate.server");
    await assertUnlock(data.token);
    const { loadWorkspaceSnapshot } = await import("@/lib/workspace.server");
    return loadWorkspaceSnapshot(data.version);
  });

export const saveWorkspace = createServerFn({ method: "POST" })
  .validator((data: BoardPayload & { token: string; version?: number }) => {
    const payload = toPayload(data.themes, data.activeThemeId);
    if (!payload) return null;
    return {
      ...payload,
      token: data.token,
      version: typeof data.version === "number" && Number.isFinite(data.version) ? data.version : 0,
    };
  })
  .handler(async ({ data }): Promise<SaveWorkspaceResult> => {
    if (!data) return { ok: false, reason: "invalid" };
    const { commitWorkspacePayload } = await import("@/lib/workspace.server");
    return commitWorkspacePayload(data.themes, data.activeThemeId, data.token, data.version);
  });

export const loadWorkspaceAssets = createServerFn({ method: "POST" })
  .validator((data: { ids: string[]; token: string }) => ({
    ids: [...new Set(data.ids.map((id) => id.trim()).filter((id) => ASSET_ID.test(id)))].slice(
      0,
      80,
    ),
    token: data.token,
  }))
  .handler(async ({ data }) => {
    const { assertUnlock } = await import("@/lib/workspace-gate.server");
    await assertUnlock(data.token);
    const { readAssets } = await import("@/lib/workspace.server");
    return readAssets(data.ids);
  });

export const saveWorkspaceAsset = createServerFn({ method: "POST" })
  .validator((data: { id: string; data: string; token: string }) => ({
    id: data.id.trim(),
    data: data.data,
    token: data.token,
  }))
  .handler(async ({ data }) => {
    const { assertUnlock } = await import("@/lib/workspace-gate.server");
    await assertUnlock(data.token);
    const { saveAsset } = await import("@/lib/workspace.server");
    return saveAsset(data.id, data.data);
  });

export const claimAssignee = createServerFn({ method: "POST" })
  .validator((data: { cardId: string; name: string; token: string }) => ({
    cardId: data.cardId.trim(),
    name: data.name.trim(),
    token: data.token,
  }))
  .handler(async ({ data }) => {
    const { assertUnlock } = await import("@/lib/workspace-gate.server");
    await assertUnlock(data.token);
    const { claimCard } = await import("@/lib/workspace.server");
    return claimCard(data.cardId, data.name);
  });
