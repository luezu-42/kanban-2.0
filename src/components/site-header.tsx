import { useEffect, useMemo, useState } from "react";
import { ThemeSwitch } from "@/components/theme-switch";
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
  const theme = useBoardStore(selectActiveTheme);
  const total = themeCardCount(theme);
  const themes = useBoardStore((state) => state.themes);
  const counts = useMemo(() => boardColumnCounts(themes), [themes]);
  const name = useProfileStore((state) => state.name);

  useEffect(() => {
    const finish = () => setHydrated(true);
    if (useBoardStore.persist.hasHydrated()) {
      finish();
      return;
    }
    return useBoardStore.persist.onFinishHydration(finish);
  }, []);

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
      <ThemeSwitch />
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
            ? `${total} ${total === 1 ? "card" : "cards"} in ${theme.name}`
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
