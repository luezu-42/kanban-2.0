import { create } from "zustand";

export type SyncHealth = "ok" | "offline" | "queued" | "error";

type SyncStatusStore = {
  health: SyncHealth;
  message: string;
  setHealth: (health: SyncHealth, message?: string) => void;
};

export const useSyncStatus = create<SyncStatusStore>((set) => ({
  health: typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "ok",
  message: "",
  setHealth: (health, message = "") =>
    set((state) =>
      state.health === health && state.message === message ? state : { health, message },
    ),
}));
