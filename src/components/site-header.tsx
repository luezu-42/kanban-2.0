import { Download, Redo2, Search, Undo2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadBoardJson, downloadThemeCsv } from "@/lib/board-export";
import { BOARD_EVENT, emitBoardEvent } from "@/lib/board-events";
import { redoBoard, undoBoard, useHistoryStatus } from "@/lib/board-history";
import { errorMessage } from "@/lib/errors";
import {
  COLUMNS,
  boardColumnCounts,
  selectActiveTheme,
  themeCardCount,
  useBoardStore,
} from "@/lib/kanban";
import { useProfileStore } from "@/lib/profile";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  backlog: "bg-backlog",
  planning: "bg-planning",
  todo: "bg-todo",
  doing: "bg-doing",
  review: "bg-review",
  done: "bg-done",
};

export function SiteHeader() {
  const [hydrated, setHydrated] = useState(false);
  const themeName = useBoardStore((state) => selectActiveTheme(state).name);
  const total = useBoardStore((state) => themeCardCount(selectActiveTheme(state)));
  const themes = useBoardStore((state) => state.themes);
  const activeThemeId = useBoardStore((state) => state.activeThemeId);
  const counts = useMemo(() => boardColumnCounts(themes), [themes]);
  const name = useProfileStore((state) => state.name);
  const history = useHistoryStatus();

  useEffect(() => {
    const finish = () => setHydrated(true);
    if (useBoardStore.persist.hasHydrated()) {
      finish();
      return;
    }
    return useBoardStore.persist.onFinishHydration(finish);
  }, []);

  function handleUndo() {
    if (undoBoard()) toast("Undone");
  }

  function handleRedo() {
    if (redoBoard()) toast("Redone");
  }

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border pb-4 lg:pb-3">
      <div className="flex flex-wrap items-center gap-2">
        <ThemeSwitch />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Search cards"
          title="Search /"
          onClick={() => emitBoardEvent(BOARD_EVENT.search)}
        >
          <Search />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Undo"
          title="Undo"
          disabled={!history.canUndo}
          onClick={handleUndo}
        >
          <Undo2 />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Redo"
          title="Redo"
          disabled={!history.canRedo}
          onClick={handleRedo}
        >
          <Redo2 />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Export">
              <Download />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onSelect={() => {
                try {
                  downloadBoardJson(themes, activeThemeId);
                  toast.success("Downloaded the board JSON.");
                } catch (error) {
                  toast.error(errorMessage(error, "Could not export the board."));
                }
              }}
            >
              Export JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                const theme = themes.find((item) => item.id === activeThemeId) ?? themes[0];
                if (!theme) return;
                try {
                  const count = downloadThemeCsv(theme);
                  if (!count) {
                    toast.error("This theme has no cards to export.");
                    return;
                  }
                  toast.success(`Downloaded ${count} cards.`);
                } catch (error) {
                  toast.error(errorMessage(error, "Could not export the CSV."));
                }
              }}
            >
              Export this theme CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <div className="flex min-w-0 items-center gap-2 rounded-md bg-surface py-1 pr-2 pl-2.5 shadow-border">
          <p className="shrink-0 text-[0.65rem] font-medium tracking-[0.16em] text-subtle uppercase">
            Overview
          </p>
          <ul className="flex items-center gap-0.5 overflow-x-auto">
            {COLUMNS.map((column) => (
              <li key={column.id}>
                <span className="inline-flex h-7 items-center gap-1.5 rounded-md px-1.5">
                  <span
                    className={cn("size-1.5 shrink-0 rounded-full", TONE[column.id])}
                    aria-hidden="true"
                  />
                  <span className="text-[0.65rem] font-medium text-muted">{column.title}</span>
                  <span className="font-mono text-xs text-fg tabular-nums">
                    {hydrated ? counts[column.id] : "—"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="font-mono text-xs tracking-wide text-subtle tabular-nums">
          {hydrated
            ? `${total} ${total === 1 ? "card" : "cards"} in ${themeName}`
            : "—"}
        </p>
        {name ? (
          <p className="flex h-9 items-center rounded-md bg-surface px-3 text-sm font-medium shadow-border">
            {name}
          </p>
        ) : null}
      </div>
    </header>
  );
}
