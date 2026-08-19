import type { Card, ColumnId } from "@/lib/kanban";
import { columnMeta } from "@/lib/kanban";
import { cn } from "@/lib/utils";

type Candidate = Card & { columnId: ColumnId };

type BlockPickerProps = {
  candidates: Candidate[];
  selected: string[];
  onChange: (ids: string[]) => void;
};

export function BlockPicker({ candidates, selected, onChange }: BlockPickerProps) {
  if (!candidates.length) {
    return (
      <p className="text-sm text-subtle">No other cards in this tab to link.</p>
    );
  }

  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id],
    );
  }

  return (
    <div className="grid gap-2">
      <p className="text-sm text-muted">
        Optionally pick what is blocking this card. Same tab only.
      </p>
      <ul className="grid max-h-52 gap-1 overflow-y-auto rounded-md bg-bg p-1 shadow-border">
        {candidates.map((card) => {
          const on = selected.includes(card.id);
          return (
            <li key={card.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggle(card.id)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left transition-colors duration-150",
                  on ? "bg-danger/12 text-fg" : "text-muted hover:bg-surface hover:text-fg",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded-xs shadow-border",
                    on && "bg-danger text-accent-fg",
                  )}
                >
                  {on ? "✓" : ""}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{card.title}</span>
                  <span className="mt-0.5 block text-[0.65rem] tracking-wide text-subtle uppercase">
                    {columnMeta(card.columnId).title}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
