import { COLUMNS, type ColumnId } from "@/lib/kanban";
import { cn } from "@/lib/utils";

type WorkflowStripProps = {
  counts: Record<ColumnId, number>;
  onSelect: (id: ColumnId) => void;
};

export function WorkflowStrip({ counts, onSelect }: WorkflowStripProps) {
  const total = COLUMNS.reduce((sum, column) => sum + counts[column.id], 0);

  return (
    <nav aria-label="Project workflow" className="board-scroller shrink-0 overflow-x-auto">
      <ol className="flex min-w-max items-stretch">
        {COLUMNS.map((column, index) => {
          const count = counts[column.id];
          return (
            <li key={column.id} className="flex items-center">
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="mx-1 h-px w-3 shrink-0 bg-border sm:mx-1.5 sm:w-5"
                />
              ) : null}
              <button
                type="button"
                onClick={() => onSelect(column.id)}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-md px-2.5 text-left transition-[background-color,color] duration-150",
                  "hover:bg-surface hover:text-fg",
                  count > 0 ? "text-fg" : "text-subtle",
                )}
              >
                <span className="text-xs font-medium tracking-wide">
                  {column.title}
                </span>
                <span className="font-mono text-xs text-muted tabular-nums">
                  {count}
                </span>
              </button>
            </li>
          );
        })}
        <li className="ml-3 flex items-center pl-3 text-xs text-subtle">
          {total === 0 ? "Empty board" : `${total} in flow`}
        </li>
      </ol>
    </nav>
  );
}
