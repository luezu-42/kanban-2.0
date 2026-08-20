export const BOARD_EVENT = {
  search: "ledger-search",
  undo: "ledger-undo",
  redo: "ledger-redo",
  help: "ledger-help",
} as const;

export function emitBoardEvent(type: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(type));
}

export function typingInField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}
