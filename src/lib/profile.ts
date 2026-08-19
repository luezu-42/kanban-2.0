import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const APPEARANCES = ["dark", "light", "soft"] as const;
export type Appearance = (typeof APPEARANCES)[number];

export function isAppearance(value: unknown): value is Appearance {
  return APPEARANCES.includes(value as Appearance);
}

type ProfileStore = {
  deviceId: string;
  name: string | null;
  reviewSound: boolean;
  doneCompact: boolean;
  appearance: Appearance;
  noticeRead: Record<string, string>;
  setName: (name: string) => void;
  setReviewSound: (on: boolean) => void;
  setDoneCompact: (on: boolean) => void;
  setAppearance: (appearance: Appearance) => void;
  markNoticeRead: (themeId: string, notice: string) => void;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      deviceId: crypto.randomUUID(),
      name: null,
      reviewSound: true,
      doneCompact: true,
      appearance: "dark",
      noticeRead: {},
      setName: (name) => {
        const next = name.trim();
        if (!next) return;
        set({ name: next });
      },
      setReviewSound: (on) => set({ reviewSound: on }),
      setDoneCompact: (on) => set({ doneCompact: on }),
      setAppearance: (appearance) => set({ appearance }),
      markNoticeRead: (themeId, notice) => {
        set((state) =>
          state.noticeRead[themeId] === notice
            ? state
            : { noticeRead: { ...state.noticeRead, [themeId]: notice } },
        );
      },
    }),
    {
      name: "ledger-profile-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        deviceId: state.deviceId,
        name: state.name,
        reviewSound: state.reviewSound,
        doneCompact: state.doneCompact,
        appearance: state.appearance,
        noticeRead: state.noticeRead,
      }),
      merge: (persisted, current) => {
        const raw = (persisted ?? {}) as Partial<ProfileStore>;
        return {
          ...current,
          deviceId:
            typeof raw.deviceId === "string" && raw.deviceId
              ? raw.deviceId
              : current.deviceId,
          name: typeof raw.name === "string" && raw.name.trim() ? raw.name : current.name,
          reviewSound: raw.reviewSound !== false,
          doneCompact: raw.doneCompact !== false,
          appearance: isAppearance(raw.appearance) ? raw.appearance : current.appearance,
          noticeRead:
            raw.noticeRead && typeof raw.noticeRead === "object"
              ? Object.fromEntries(
                  Object.entries(raw.noticeRead).filter(
                    (entry): entry is [string, string] => typeof entry[1] === "string",
                  ),
                )
              : current.noticeRead,
        };
      },
    },
  ),
);
