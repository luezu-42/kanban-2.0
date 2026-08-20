import { Command } from "cmdk";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { columnMeta, useBoardStore } from "@/lib/kanban";
import { searchCards, type CardHit } from "@/lib/card-search";

export function BoardSearch({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (hit: CardHit) => void;
}) {
  const themes = useBoardStore((state) => state.themes);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const hits = useMemo(() => searchCards(themes, query), [themes, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(calc(100%-2rem),34rem)] gap-0 overflow-hidden p-0 wide:w-[min(calc(100%-2rem),40rem)]">
        <DialogTitle className="sr-only">Search cards</DialogTitle>
        <DialogDescription className="sr-only">
          Search by title, description, or assignee. Details and images stay out of the index.
        </DialogDescription>
        <Command shouldFilter={false} label="Search cards" loop vimBindings={false}>
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-subtle" aria-hidden="true" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search titles and descriptions"
              className="h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-subtle"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            {query.trim() && !hits.length ? (
              <Command.Empty className="px-3 py-8 text-center text-sm text-muted">
                No cards match “{query.trim()}”.
              </Command.Empty>
            ) : null}
            {!query.trim() ? (
              <p className="px-3 py-8 text-center text-sm text-subtle">
                Type to search this workspace. Shortcut{" "}
                <kbd className="rounded-sm bg-surface px-1.5 font-mono text-xs text-muted">/</kbd>
              </p>
            ) : null}
            {hits.map((hit) => (
              <Command.Item
                key={`${hit.themeId}:${hit.card.id}`}
                value={hit.card.id}
                onSelect={() => {
                  onPick(hit);
                  onOpenChange(false);
                }}
                className="flex cursor-pointer flex-col gap-0.5 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-surface"
              >
                <span className="font-medium text-fg">{hit.card.title}</span>
                <span className="text-xs text-subtle">
                  {hit.themeName} · {columnMeta(hit.columnId).title}
                  {hit.card.assignee ? ` · ${hit.card.assignee}` : ""}
                </span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
