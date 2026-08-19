import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { LayoutGrid, PenLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { BlockLinks } from "@/components/block-links";
import { BlockReasonDialog } from "@/components/block-reason-dialog";
import { CardDetailsDialog } from "@/components/card-details-dialog";
import { CardFormDialog, type CardFormState } from "@/components/card-form-dialog";
import { CardLinkDialog, type CardLinkState } from "@/components/card-link-dialog";
import { CardFace } from "@/components/kanban-card";
import { KanbanColumn } from "@/components/kanban-column";
import { ThemeTabs, ThemeTabsSkeleton } from "@/components/theme-tabs";
import { NoticeBar } from "@/components/notice-bar";
import { WhiteboardCanvas } from "@/components/whiteboard-canvas";
import { WorkflowStrip } from "@/components/workflow-strip";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  COLUMNS,
  type Card,
  type CardLinkKind,
  type ColumnId,
  columnMeta,
  canEnterColumn,
  findColumnOf,
  listThemeCards,
  parseColumnId,
  selectActiveTheme,
  useBoardStore,
} from "@/lib/kanban";
import { useProfileStore } from "@/lib/profile";
import { useReviewLive } from "@/lib/review-live";

const dropAnimation = {
  duration: 240,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.3" } },
  }),
};

export function KanbanBoard() {
  const [ready, setReady] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [overColumn, setOverColumn] = useState<ColumnId | null>(null);
  const [form, setForm] = useState<CardFormState | null>(null);
  const [linkForm, setLinkForm] = useState<CardLinkState | null>(null);
  const [detailsCard, setDetailsCard] = useState<Card | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Card | null>(null);
  const [pendingReview, setPendingReview] = useState<{
    card: Card;
    from: ColumnId;
  } | null>(null);
  const [pendingPrAlert, setPendingPrAlert] = useState<Card | null>(null);
  const [pendingBlock, setPendingBlock] = useState<Card | null>(null);
  const [boardEl, setBoardEl] = useState<HTMLDivElement | null>(null);
  const [canvasOpen, setCanvasOpen] = useState(false);

  const theme = useBoardStore(selectActiveTheme);
  const addCard = useBoardStore((state) => state.addCard);
  const updateCard = useBoardStore((state) => state.updateCard);
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const moveCard = useBoardStore((state) => state.moveCard);
  const sendCardTo = useBoardStore((state) => state.sendCardTo);
  const toggleCardFlag = useBoardStore((state) => state.toggleCardFlag);
  const setCardLink = useBoardStore((state) => state.setCardLink);
  const setCardDetails = useBoardStore((state) => state.setCardDetails);
  const applyUrgencySort = useBoardStore((state) => state.applyUrgencySort);
  const setCardPrAlert = useBoardStore((state) => state.setCardPrAlert);
  const setCardBlock = useBoardStore((state) => state.setCardBlock);
  const reviewSound = useProfileStore((state) => state.reviewSound);
  const setReviewSound = useProfileStore((state) => state.setReviewSound);
  const { publishEnter, publishLeave, publishPrAlert } = useReviewLive();

  const cards = theme.cards;
  const order = theme.order;
  const candidates = useMemo(() => listThemeCards(theme), [theme]);
  const linkLayoutKey = useMemo(
    () =>
      `${theme.id}:${JSON.stringify(order)}:${Object.values(cards)
        .map((card) => `${card.id}:${card.blocked}:${card.blockedBy.join(",")}`)
        .join("|")}`,
    [theme.id, order, cards],
  );

  useEffect(() => {
    let cancelled = false;
    const result = useBoardStore.persist.rehydrate();
    void Promise.resolve(result).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 160, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columns = useMemo(
    () =>
      COLUMNS.map((column) => ({
        ...column,
        cards: order[column.id]
          .map((id) => cards[id])
          .filter((card): card is Card => Boolean(card)),
      })),
    [cards, order],
  );

  const counts = useMemo(
    () =>
      Object.fromEntries(
        COLUMNS.map((column) => [column.id, order[column.id].length]),
      ) as Record<ColumnId, number>,
    [order],
  );

  function resolveColumn(id: string | undefined | null): ColumnId | null {
    if (!id) return null;
    return parseColumnId(id) ?? findColumnOf(order, id);
  }

  function handleDragStart(event: DragStartEvent) {
    const card = cards[String(event.active.id)];
    setActiveCard(card ?? null);
    setOverColumn(findColumnOf(order, String(event.active.id)));
  }

  function handleDragOver(event: DragOverEvent) {
    const overId = event.over?.id ? String(event.over.id) : null;
    const activeId = String(event.active.id);
    const nextColumn = resolveColumn(overId);
    const from = findColumnOf(order, activeId);
    if (from && nextColumn && !canEnterColumn(from, nextColumn)) {
      setOverColumn(from);
      return;
    }
    setOverColumn(nextColumn);

    if (!overId || !nextColumn) return;
    if (!from || from === nextColumn) return;
    if (nextColumn === "review") return;
    const card = cards[activeId];
    moveCard(activeId, overId);
    if (card && from === "review") publishLeave(card.id, nextColumn);
  }

  function handleDragEnd(event: DragEndEvent) {
    const overId = event.over?.id ? String(event.over.id) : null;
    const activeId = String(event.active.id);
    if (overId) {
      const current = selectActiveTheme(useBoardStore.getState());
      const from = findColumnOf(current.order, activeId);
      const to = resolveColumn(overId);
      const card = current.cards[activeId];
      if (card && from && to === "review" && from !== "review") {
        setPendingReview({ card, from });
      } else if (from && to && !canEnterColumn(from, to)) {
        toast.error("Cards reach Done from Review.");
      } else if (from && to && from === to && from !== "review") {
        moveCard(activeId, overId);
      }
    }
    applyUrgencySort();
    setActiveCard(null);
    setOverColumn(null);
  }

  function handleDragCancel() {
    applyUrgencySort();
    setActiveCard(null);
    setOverColumn(null);
  }

  function handleFormSubmit(values: {
    title: string;
    description: string;
    blocked: boolean;
    urgent: boolean;
    blockedBy: string[];
  }) {
    if (!form) return;
    if (form.mode === "create") {
      if (!columnMeta(form.columnId).allowsCreate) return;
      addCard(form.columnId, values.title, values.description, {
        blocked: values.blocked,
        urgent: values.urgent,
        blockedBy: values.blockedBy,
      });
      toast.success("Card added");
      return;
    }
    updateCard(form.card.id, values);
    toast.success("Card updated");
  }

  function handleDelete(card: Card) {
    setPendingDelete(card);
  }

  function handleToggleFlag(card: Card, flag: "blocked" | "urgent") {
    if (flag === "blocked") {
      if (card.blocked) {
        setCardBlock(card.id, false, []);
        toast("Blocked cleared");
        return;
      }
      setPendingBlock(card);
      return;
    }
    toggleCardFlag(card.id, flag);
    const next = !card.urgent;
    toast(next ? "Marked urgent" : "Urgent cleared");
  }

  function handleEditLink(card: Card, kind: CardLinkKind) {
    setLinkForm({ card, kind });
  }

  function handleLinkSubmit(url: string) {
    if (!linkForm) return;
    setCardLink(linkForm.card.id, linkForm.kind, url);
    toast.success(
      url
        ? linkForm.kind === "jira"
          ? "Jira link saved"
          : "PR link saved"
        : linkForm.kind === "jira"
          ? "Jira link removed"
          : "PR link removed",
    );
  }

  function handleDetailsSave(details: string, images: Record<string, string>) {
    if (!detailsCard) return;
    setCardDetails(detailsCard.id, details, images);
    toast.success("Details saved");
  }

  function handleSendTo(card: Card, columnId: ColumnId) {
    const from = findColumnOf(order, card.id);
    if (!from) return;
    if (columnId === "review") {
      if (from === "review") return;
      setPendingReview({ card, from });
      return;
    }
    if (!canEnterColumn(from, columnId)) {
      toast.error("Cards reach Done from Review.");
      return;
    }
    const moved = sendCardTo(card.id, columnId);
    if (!moved) return;
    if (from === "review") publishLeave(card.id, columnId);
    toast(`Moved to ${columnMeta(columnId).title}`);
    requestAnimationFrame(() => {
      document.getElementById(`column-${columnId}`)?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    });
  }

  function confirmReviewMove() {
    if (!pendingReview) return;
    const { card, from } = pendingReview;
    setPendingReview(null);
    if (from === "review") return;
    const moved = sendCardTo(card.id, "review");
    if (!moved) return;
    publishEnter(card);
    toast("Moved to Review");
    requestAnimationFrame(() => {
      document.getElementById("column-review")?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    });
  }

  function scrollToColumn(id: ColumnId) {
    document.getElementById(`column-${id}`)?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const from = findColumnOf(order, pendingDelete.id);
    deleteCard(pendingDelete.id);
    if (from === "review") publishLeave(pendingDelete.id, null);
    toast("Card deleted");
    setPendingDelete(null);
  }

  function confirmPrAlert() {
    if (!pendingPrAlert) return;
    const next = !pendingPrAlert.prAlert;
    setCardPrAlert(pendingPrAlert.id, next);
    publishPrAlert({ ...pendingPrAlert, prAlert: next }, next);
    toast(next ? "PR Alert on" : "PR Alert cleared");
    setPendingPrAlert(null);
  }

  if (!ready) {
    return (
      <div className="flex flex-col gap-5">
        <ThemeTabsSkeleton />
        <div className="h-11 w-full animate-pulse rounded-md bg-surface" />
        <BoardSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <ThemeTabs />
        <NoticeBar />
        <div className="flex items-center">
          <Button
            type="button"
            variant={canvasOpen ? "secondary" : "outline"}
            onClick={() => setCanvasOpen((open) => !open)}
          >
            {canvasOpen ? <LayoutGrid className="size-4" /> : <PenLine className="size-4" />}
            {canvasOpen ? "Show board" : "Open canvas"}
          </Button>
        </div>
        {canvasOpen ? (
          <WhiteboardCanvas onClose={() => setCanvasOpen(false)} />
        ) : (
          <>
        <WorkflowStrip counts={counts} onSelect={scrollToColumn} />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div
            key={theme.id}
            ref={setBoardEl}
            className="board-scroller relative flex snap-x snap-mandatory items-start gap-3 overflow-x-auto pb-2 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
          >
            <BlockLinks
              cards={cards}
              layoutKey={linkLayoutKey}
              scroller={boardEl}
            />
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                hint={column.hint}
                empty={column.empty}
                emptyHint={column.emptyHint}
                cards={column.cards}
                isOver={overColumn === column.id}
                onAdd={(columnId) => setForm({ mode: "create", columnId })}
                onEdit={(card) => setForm({ mode: "edit", card })}
                onDelete={handleDelete}
                onToggleFlag={handleToggleFlag}
                onSendTo={handleSendTo}
                onEditLink={handleEditLink}
                onOpenDetails={setDetailsCard}
                onPrAlert={setPendingPrAlert}
                soundOn={reviewSound}
                onSoundToggle={() => setReviewSound(!reviewSound)}
              />
            ))}
          </div>

          {typeof document !== "undefined"
            ? createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                  {activeCard ? (
                    <div className="w-[min(100vw-2.5rem,19.5rem)]">
                      <CardFace
                        card={activeCard}
                        overlay
                        compact={findColumnOf(order, activeCard.id) === "done"}
                      />
                    </div>
                  ) : null}
                </DragOverlay>,
                document.body,
              )
            : null}
        </DndContext>
          </>
        )}
      </div>

      <CardFormDialog
        open={form !== null}
        state={form}
        candidates={candidates}
        onOpenChange={(open) => {
          if (!open) setForm(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <CardLinkDialog
        open={linkForm !== null}
        state={linkForm}
        onOpenChange={(open) => {
          if (!open) setLinkForm(null);
        }}
        onSubmit={handleLinkSubmit}
      />

      <CardDetailsDialog
        open={detailsCard !== null}
        card={detailsCard}
        onOpenChange={(open) => {
          if (!open) setDetailsCard(null);
        }}
        onSave={handleDetailsSave}
      />

      <BlockReasonDialog
        open={pendingBlock !== null}
        card={pendingBlock}
        candidates={candidates}
        onOpenChange={(open) => {
          if (!open) setPendingBlock(null);
        }}
        onConfirm={(blockedBy) => {
          if (!pendingBlock) return;
          setCardBlock(pendingBlock.id, true, blockedBy);
          setPendingBlock(null);
          toast("Marked blocked");
        }}
      />
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this card?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `“${pendingDelete.title}” will be removed from the board. This cannot be undone.`
                : "This card will be removed from the board."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep card</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingReview !== null}
        onOpenChange={(open) => {
          if (!open) setPendingReview(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send to Review?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingReview
                ? `“${pendingReview.card.title}” will appear in Review for everyone, and the Review sound will play.`
                : "This card will appear in Review for everyone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReviewMove}>
              Send to Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingPrAlert !== null}
        onOpenChange={(open) => {
          if (!open) setPendingPrAlert(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingPrAlert?.prAlert ? "Clear PR Alert?" : "Turn on PR Alert?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingPrAlert?.prAlert
                ? `“${pendingPrAlert.title}” will return to its normal state.`
                : pendingPrAlert?.assignee
                  ? `“${pendingPrAlert.title}” will light up for everyone. ${pendingPrAlert.assignee} will hear a short alert.`
                  : `“${pendingPrAlert?.title ?? "This card"}” will light up for everyone. Assign someone if they should hear the alert.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPrAlert}>
              {pendingPrAlert?.prAlert ? "Clear alert" : "Turn on alert"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex items-start gap-3 overflow-hidden">
      {COLUMNS.map((column) => (
        <div
          key={column.id}
          className="h-72 w-[85vw] min-w-[85vw] shrink-0 animate-pulse rounded-xl bg-bg-elevated shadow-border md:w-72 md:min-w-72"
        />
      ))}
    </div>
  );
}
