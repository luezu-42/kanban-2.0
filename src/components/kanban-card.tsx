import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { CardLinkButtons } from "@/components/card-link-buttons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type Card,
  type CardLinkKind,
  type ColumnId,
  adjacentColumn,
  columnMeta,
  useBoardStore,
} from "@/lib/kanban";
import { useProfileStore } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { claimAssignee } from "@/lib/workspace";

type KanbanCardProps = {
  card: Card;
  columnId: ColumnId;
  compact?: boolean;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
  onToggleFlag: (card: Card, flag: "blocked" | "urgent") => void;
  onSendTo: (card: Card, columnId: ColumnId) => void;
  onEditLink: (card: Card, kind: CardLinkKind) => void;
  onOpenDetails: (card: Card) => void;
  onPrAlert: (card: Card) => void;
};

type CardFaceProps = {
  card: Card;
  columnId?: ColumnId;
  overlay?: boolean;
  dragging?: boolean;
  compact?: boolean;
  onEdit?: (card: Card) => void;
  onDelete?: (card: Card) => void;
  onToggleFlag?: (card: Card, flag: "blocked" | "urgent") => void;
  onSendTo?: (card: Card, columnId: ColumnId) => void;
  onEditLink?: (card: Card, kind: CardLinkKind) => void;
  onOpenDetails?: (card: Card) => void;
  onPrAlert?: (card: Card) => void;
};

export function CardFlags({ card }: { card: Card }) {
  if (!card.urgent && !card.blocked) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {card.urgent ? (
        <li className="inline-flex items-center gap-1 rounded-full bg-urgent/15 px-2 py-0.5 text-xs font-medium text-urgent">
          <TriangleAlert className="size-3" aria-hidden="true" />
          Urgent
        </li>
      ) : null}
      {card.blocked ? (
        <li className="inline-flex items-center gap-1 rounded-full bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger">
          <Ban className="size-3" aria-hidden="true" />
          {card.blockedBy.length
            ? `Blocked · ${card.blockedBy.length}`
            : "Blocked"}
        </li>
      ) : null}
    </ul>
  );
}

export function CardFace({
  card,
  columnId,
  overlay,
  dragging,
  compact,
  onEdit,
  onDelete,
  onToggleFlag,
  onSendTo,
  onEditLink,
  onOpenDetails,
  onPrAlert,
}: CardFaceProps) {
  const previous = columnId ? adjacentColumn(columnId, -1) : null;
  const next = columnId ? adjacentColumn(columnId, 1) : null;
  const interactive = Boolean(
    onEdit && onDelete && onToggleFlag && onSendTo && onEditLink && onOpenDetails,
  );
  const profileName = useProfileStore((state) => state.name);
  const setAssignee = useBoardStore((state) => state.setAssignee);
  const applyCard = useBoardStore((state) => state.applyCard);
  const inReview = columnId === "review";
  const prAlertOn = inReview && card.prAlert;

  async function handleAssignMe(event: React.MouseEvent) {
    event.stopPropagation();
    if (!profileName) return;
    try {
      const result = await claimAssignee({
        data: { cardId: card.id, name: profileName },
      });
      if (result.ok) {
        applyCard(result.card);
        toast.success(`Assigned to ${profileName}`);
        return;
      }
      if (result.reason === "taken" && result.card) {
        applyCard(result.card);
        toast.error(`This card already has a responsible: ${result.assignee}`);
        return;
      }
      toast.error("Could not assign this card.");
    } catch {
      toast.error("Could not assign this card.");
    }
  }

  function handleUnassign() {
    setAssignee(card.id, "");
    toast("Unassigned");
  }

  if (compact) {
    return (
      <article
        className={cn(
          "kanban-card relative flex items-start gap-1 overflow-hidden rounded-md bg-surface px-2 py-1 shadow-card outline-none",
          "transition-[box-shadow,opacity] duration-200 ease-[var(--ease-smooth-out)]",
          !overlay && !dragging && "hover:shadow-lift",
          overlay && "kanban-overlay rotate-[1.5deg] scale-[1.03] shadow-lift",
          dragging && "opacity-30 shadow-border",
        )}
      >
        <h3 className="min-w-0 flex-1 px-1 py-2 text-sm leading-snug font-medium wrap-break-word text-fg [overflow-wrap:anywhere]">
          {card.title}
        </h3>
        {interactive && previous ? (
          <button
            type="button"
            aria-label={`Send back to ${columnMeta(previous).title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onSendTo?.(card, previous);
            }}
            className="relative grid size-9 shrink-0 place-items-center rounded-md text-subtle transition-colors duration-150 hover:bg-bg hover:text-fg after:absolute after:-inset-1"
          >
            <ChevronLeft className="size-4" />
          </button>
        ) : null}
        {interactive ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="relative shrink-0 text-subtle hover:text-fg after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2"
                aria-label={`Card actions for ${card.title}`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => onEdit?.(card)}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onOpenDetails?.(card)}
                onPointerDown={(event) => event.stopPropagation()}
              >
                Details
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onDelete?.(card)}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </article>
    );
  }

  return (
    <article
      className={cn(
        "kanban-card relative overflow-hidden rounded-lg bg-surface shadow-card outline-none",
        "transition-[background-color,box-shadow,transform,opacity] duration-200 ease-[var(--ease-smooth-out)]",
        !overlay && !dragging && !prAlertOn && "hover:shadow-lift",
        overlay && "kanban-overlay rotate-[1.5deg] scale-[1.03] shadow-lift",
        dragging && "opacity-30 shadow-border",
        prAlertOn && "pr-alert-card",
      )}
    >
      {inReview ? (
        <button
          type="button"
          aria-pressed={card.prAlert}
          aria-label="PR Alert"
          title="PR Alert"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            if (!interactive) return;
            onPrAlert?.(card);
          }}
          className={cn(
            "absolute top-0 right-3 z-10 flex h-11 w-8 items-start justify-center",
            "text-subtle transition-colors duration-200 ease-[var(--ease-smooth-out)]",
            card.prAlert ? "text-urgent" : "hover:text-muted",
          )}
        >
          <svg viewBox="0 0 24 36" className="h-9 w-6" aria-hidden="true">
            <path
              d="M3 0h18v32.5c0 .7-.8 1.1-1.4.7L12 26.2 4.4 33.2C3.8 33.6 3 33.2 3 32.5V0Z"
              className={card.prAlert ? "fill-urgent" : "fill-subtle"}
            />
          </svg>
        </button>
      ) : null}
      <div className={cn("p-4", inReview && "pr-12")}>
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 text-sm leading-snug font-medium wrap-break-word text-fg [overflow-wrap:anywhere]">
          {card.title}
        </h3>
        {interactive ? (
          <div className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="relative -mt-1 -mr-1 shrink-0 text-subtle hover:text-fg after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2"
                aria-label={`Card actions for ${card.title}`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => onEdit?.(card)}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              {previous ? (
                <DropdownMenuItem
                  onSelect={() => onSendTo?.(card, previous)}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <ChevronLeft className="size-4" />
                  Send back to {columnMeta(previous).title}
                </DropdownMenuItem>
              ) : null}
              {next ? (
                <DropdownMenuItem
                  onSelect={() => onSendTo?.(card, next)}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <ChevronRight className="size-4" />
                  Advance to {columnMeta(next).title}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                onSelect={() => onEditLink?.(card, "jira")}
                onPointerDown={(event) => event.stopPropagation()}
              >
                Jira link
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onEditLink?.(card, "pr")}
                onPointerDown={(event) => event.stopPropagation()}
              >
                PR link
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onToggleFlag?.(card, "urgent")}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <TriangleAlert className="size-4" />
                {card.urgent ? "Clear urgent" : "Mark urgent"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onToggleFlag?.(card, "blocked")}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <Ban className="size-4" />
                {card.blocked ? "Clear blocked" : "Mark blocked"}
              </DropdownMenuItem>
              {card.assignee ? (
                <DropdownMenuItem
                  onSelect={handleUnassign}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <UserRound className="size-4" />
                  Unassign
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onDelete?.(card)}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        ) : null}
      </div>
      {card.description ? (
        <p className="mt-2 text-sm leading-relaxed wrap-break-word text-muted [overflow-wrap:anywhere]">{card.description}</p>
      ) : null}
      <CardFlags card={card} />
      {card.assignee ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted">
          <span
            aria-hidden="true"
            className="grid size-6 place-items-center rounded-full bg-bg text-[0.65rem] font-semibold tracking-wide text-fg"
          >
            {card.assignee.slice(0, 1).toUpperCase()}
          </span>
          <span className="truncate">{card.assignee}</span>
        </p>
      ) : interactive && profileName ? (
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={handleAssignMe}
          className="relative mt-3 inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold tracking-wide text-muted transition-colors duration-150 hover:bg-bg hover:text-fg after:absolute after:-inset-1"
        >
          <UserRound className="size-3.5" />
          Assign me
        </button>
      ) : null}
      <p className="mt-3 font-mono text-xs tracking-wide text-subtle tabular-nums">
        Duration {card.duration ?? "—"}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="min-w-0 font-mono text-xs tracking-wide text-subtle tabular-nums">
          {formatDistanceToNowStrict(card.createdAt, { addSuffix: true })}
        </p>
        {interactive && (previous || next) ? (
          <div className="flex shrink-0 items-center">
            {previous ? (
              <button
                type="button"
                aria-label={`Send back to ${columnMeta(previous).title}`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onSendTo?.(card, previous);
                }}
                className="relative grid size-9 place-items-center rounded-md text-subtle transition-colors duration-150 hover:bg-bg hover:text-fg after:absolute after:-inset-1"
              >
                <ChevronLeft className="size-4" />
              </button>
            ) : null}
            {next ? (
              <button
                type="button"
                aria-label={`Advance to ${columnMeta(next).title}`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onSendTo?.(card, next);
                }}
                className="relative inline-flex h-9 items-center gap-0.5 rounded-md px-1.5 text-xs font-medium text-muted transition-colors duration-150 hover:bg-bg hover:text-fg after:absolute after:-inset-1"
              >
                {columnMeta(next).title}
                <ChevronRight className="size-3.5" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      </div>
      {onEditLink && onOpenDetails ? (
        <CardLinkButtons
          card={card}
          onEditLink={onEditLink}
          onOpenDetails={onOpenDetails}
        />
      ) : null}
    </article>
  );
}

export function KanbanCard({
  card,
  columnId,
  compact,
  onEdit,
  onDelete,
  onToggleFlag,
  onSendTo,
  onEditLink,
  onOpenDetails,
  onPrAlert,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      data-card-id={card.id}
      className="cursor-grab touch-none active:cursor-grabbing"
    >
      <CardFace
        card={card}
        columnId={columnId}
        dragging={isDragging}
        compact={compact}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleFlag={onToggleFlag}
        onSendTo={onSendTo}
        onEditLink={onEditLink}
        onOpenDetails={onOpenDetails}
        onPrAlert={onPrAlert}
      />
    </div>
  );
}
