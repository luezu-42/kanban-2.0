import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ROWS = [
  ["/", "Search cards"],
  ["C", "New card in Backlog"],
  ["J / K", "Move focus down / up"],
  ["Enter", "Open focused card"],
  ["Z or ⌘Z", "Undo"],
  ["⇧Z or ⌘⇧Z", "Redo"],
  ["?", "This list"],
] as const;

export function ShortcutHelp({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard</DialogTitle>
          <DialogDescription>These skip while you type in a field.</DialogDescription>
        </DialogHeader>
        <ul className="grid gap-2">
          {ROWS.map(([keys, label]) => (
            <li key={keys} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted">{label}</span>
              <kbd className="rounded-md bg-surface px-2 py-1 font-mono text-xs text-fg shadow-border">
                {keys}
              </kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
