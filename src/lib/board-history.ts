import { useSyncExternalStore } from "react";
import {
  boardHistoryGate,
  boardSignature,
  useBoardStore,
  type Theme,
} from "@/lib/kanban";

type Snapshot = {
  themes: Theme[];
  activeThemeId: string;
};

const MAX = 40;

let past: Snapshot[] = [];
let future: Snapshot[] = [];
let prev: Snapshot | null = null;
let attached = false;
let status = { canUndo: false, canRedo: false };
const listeners = new Set<() => void>();

function emit() {
  const next = { canUndo: past.length > 0, canRedo: future.length > 0 };
  if (next.canUndo === status.canUndo && next.canRedo === status.canRedo) return;
  status = next;
  for (const listener of listeners) listener();
}

function snap(state: { themes: Theme[]; activeThemeId: string }): Snapshot {
  return { themes: state.themes, activeThemeId: state.activeThemeId };
}

export function subscribeHistory(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function historyStatus() {
  return status;
}

export function attachBoardHistory() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  prev = snap(useBoardStore.getState());
  useBoardStore.subscribe((state) => {
    const next = snap(state);
    if (boardHistoryGate.skip) {
      prev = next;
      return;
    }
    if (
      prev &&
      boardSignature(prev.themes, prev.activeThemeId) !==
        boardSignature(next.themes, next.activeThemeId)
    ) {
      past.push(prev);
      if (past.length > MAX) past.shift();
      future = [];
      emit();
    }
    prev = next;
  });
}

export function undoBoard() {
  if (!past.length) return false;
  const current = snap(useBoardStore.getState());
  const target = past.pop()!;
  future.push(current);
  boardHistoryGate.skip = true;
  useBoardStore.getState().replaceBoard(target.themes, target.activeThemeId);
  boardHistoryGate.skip = false;
  prev = snap(useBoardStore.getState());
  emit();
  return true;
}

export function useHistoryStatus() {
  return useSyncExternalStore(subscribeHistory, historyStatus, () => status);
}

export function redoBoard() {
  if (!future.length) return false;
  const current = snap(useBoardStore.getState());
  const target = future.pop()!;
  past.push(current);
  boardHistoryGate.skip = true;
  useBoardStore.getState().replaceBoard(target.themes, target.activeThemeId);
  boardHistoryGate.skip = false;
  prev = snap(useBoardStore.getState());
  emit();
  return true;
}
