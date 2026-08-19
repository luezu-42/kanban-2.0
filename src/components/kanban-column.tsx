import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronsDownUp, ChevronsUpDown, Plus, Volume2, VolumeX } from "lucide-react";
import { KanbanCard } from "@/components/kanban-card";
import { Button } from "@/components/ui/button";
import {
  type Card,
  type CardLinkKind,
  type ColumnId,
  columnAllowsCreate,
  columnDroppableId,
} from "@/lib/kanban";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/lib/profile";

const DONE_PREVIEW = 3;

const TONE: Record<ColumnId, string> = {
  backlog: "bg-backlog",
  planning: "bg-planning",
  todo: "bg-todo",
  doing: "bg-doing",
  review: "bg-review",
  done: "bg-done",
};

type KanbanColumnProps = {
  id: ColumnId;
  title: string;
  hint: string;
  empty: string;
  emptyHint: string;
  cards: Card[];
  isOver: boolean;
  onAdd: (columnId: ColumnId) => void;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
  onToggleFlag: (card: Card, flag: "blocked" | "urgent") => void;
  onSendTo: (card: Card, columnId: ColumnId) => void;
  onEditLink: (card: Card, kind: CardLinkKind) => void;
  onOpenDetails: (card: Card) => void;
  onPrAlert: (card: Card) => void;
  soundOn?: boolean;
  onSoundToggle?: () => void;
};

export function KanbanColumn({
  id,
  title,
  hint,
  empty,
  emptyHint,
  cards,
  isOver,
  onAdd,
  onEdit,
  onDelete,
  onToggleFlag,
  onSendTo,
  onEditLink,
  onOpenDetails,
  onPrAlert,
  soundOn,
  onSoundToggle,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: columnDroppableId(id),
    data: { type: "column", columnId: id },
  });
  const canAdd = columnAllowsCreate(id);
  const doneCompact = useProfileStore((state) => state.doneCompact);
  const setDoneCompact = useProfileStore((state) => state.setDoneCompact);
  const collapsed = id === "done" && doneCompact && cards.length > DONE_PREVIEW;
  const visibleCards = collapsed ? cards.slice(0, DONE_PREVIEW) : cards;
  const hiddenCount = cards.length - visibleCards.length;

  return (
    <section
      id={`column-${id}`}
      className={cn(
        "flex w-[85vw] min-w-[85vw] shrink-0 flex-col rounded-xl bg-bg-elevated p-3 snap-center",
        "md:w-72 md:min-w-72",
        "transition-[box-shadow,background-color] duration-200 ease-[var(--ease-smooth-out)]",
        isOver ? "shadow-lift" : "shadow-border",
      )}
    >
      <header className="flex items-start justify-between gap-3 px-1 pt-1 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("size-2 shrink-0 rounded-full", TONE[id])} />
            <h2 className="text-sm font-semibold tracking-tight text-fg">
              {title}
            </h2>
            <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-xs text-muted tabular-nums">
              {cards.length}
            </span>
          </div>
          <p className="mt-1 pl-4 text-xs text-subtle">{hint}</p>
        </div>
        <div className="flex items-center gap-1">
          {id === "review" && onSoundToggle ? (
            <button
              type="button"
              role="switch"
              aria-checked={soundOn}
              aria-label="Review sound"
              title={soundOn ? "Sound on" : "Sound off"}
              onClick={onSoundToggle}
              className="relative inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-muted transition-colors duration-150 hover:bg-surface hover:text-fg"
            >
              {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              <span
                aria-hidden="true"
                className={cn(
                  "relative h-5 w-8 rounded-full shadow-border transition-colors duration-150",
                  soundOn ? "bg-accent" : "bg-bg",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 size-4 rounded-full bg-surface-hover transition-transform duration-150",
                    soundOn && "translate-x-3 bg-accent-fg",
                  )}
                />
              </span>
            </button>
          ) : null}
          {id === "done" && cards.length > DONE_PREVIEW ? (
            <button
              type="button"
              aria-expanded={!doneCompact}
              aria-label={doneCompact ? "Show all shipped cards" : "Compact shipped cards"}
              onClick={() => setDoneCompact(!doneCompact)}
              className="relative inline-flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted transition-colors duration-150 hover:bg-surface hover:text-fg"
            >
              {doneCompact ? (
                <ChevronsUpDown className="size-4" />
              ) : (
                <ChevronsDownUp className="size-4" />
              )}
              {doneCompact ? "Show all" : "Compact"}
            </button>
          ) : null}
          {canAdd ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="relative -mr-1 text-muted hover:text-fg after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2"
              onClick={() => onAdd(id)}
              aria-label={`Add card to ${title}`}
            >
              <Plus />
            </Button>
          ) : null}
        </div>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-32 flex-col gap-2.5 rounded-lg p-0.5",
          id === "done" && "gap-1.5",
          isOver && "bg-surface/40",
        )}
      >
        <SortableContext
          items={visibleCards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {visibleCards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              columnId={id}
              compact={id === "done"}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFlag={onToggleFlag}
              onSendTo={onSendTo}
              onEditLink={onEditLink}
              onOpenDetails={onOpenDetails}
              onPrAlert={onPrAlert}
            />
          ))}
        </SortableContext>
        {hiddenCount > 0 ? (
          <button
            type="button"
            onClick={() => setDoneCompact(false)}
            className="flex h-11 items-center justify-center rounded-md text-xs font-medium text-muted transition-colors duration-150 hover:bg-surface hover:text-fg"
          >
            +{hiddenCount} more shipped
          </button>
        ) : null}

        {cards.length === 0 ? (
          canAdd ? (
            <button
              type="button"
              onClick={() => onAdd(id)}
              className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center transition-[border-color,color] duration-150 hover:border-border-strong hover:text-fg"
            >
              <span className="text-sm text-subtle">{empty}</span>
              <span className="mt-1 text-xs text-subtle">{emptyHint}</span>
            </button>
          ) : (
            <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center">
              <span className="text-sm text-subtle">{empty}</span>
              <span className="mt-1 text-xs text-subtle">{emptyHint}</span>
            </div>
          )
        ) : null}
      </div>
    </section>
  );
}
