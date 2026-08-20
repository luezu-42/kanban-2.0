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
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { BlockLinks } from "@/components/block-links";
import { BlockReasonDialog } from "@/components/block-reason-dialog";
import { WaitingNoteDialog } from "@/components/waiting-note-dialog";
import { CardFormDialog, type CardFormState } from "@/components/card-form-dialog";
import { CardLinkDialog, type CardLinkState } from "@/components/card-link-dialog";
import { CardFace } from "@/components/kanban-card";
import { KanbanColumn } from "@/components/kanban-column";
import { ThemeTabs, ThemeTabsSkeleton } from "@/components/theme-tabs";
import { NoticeBar } from "@/components/notice-bar";
import { WorkflowStrip } from "@/components/workflow-strip";
import { BoardSearch } from "@/components/board-search";
import { ShortcutHelp } from "@/components/shortcut-help";

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
  COLUMN_IDS,
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
import { BOARD_EVENT, typingInField } from "@/lib/board-events";
import { attachBoardHistory, redoBoard, undoBoard } from "@/lib/board-history";
import type { CardHit } from "@/lib/card-search";

const CardDetailsDialog = lazy(() =>
  import("@/components/card-details-dialog").then((mod) => ({ default: mod.CardDetailsDialog })),
);
const WhiteboardCanvas = lazy(() =>
  import("@/components/whiteboard-canvas").then((mod) => ({ default: mod.WhiteboardCanvas })),
);

const POINTER_SENSOR = { activationConstraint: { distance: 6 } };
const TOUCH_SENSOR = { activationConstraint: { delay: 160, tolerance: 6 } };
const KEYBOARD_SENSOR = { coordinateGetter: sortableKeyboardCoordinates };

const dropAnimation = {
  duration: 240,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.3" } },
  }),
};

export function KanbanBoard({
  canvasOpen,
  onCanvasOpenChange,
}: {
  canvasOpen: boolean;
  onCanvasOpenChange: (open: boolean) => void;
}) {
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
  const [pendingWaiting, setPendingWaiting] = useState<Card | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

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
  const setCardWaiting = useBoardStore((state) => state.setCardWaiting);
  const reviewSound = useProfileStore((state) => state.reviewSound);
  const setReviewSound = useProfileStore((state) => state.setReviewSound);
  const { publishEnter, publishLeave, publishPrAlert } = useReviewLive();

  const cards = theme.cards;
  const order = theme.order;
  const candidates = useMemo(() => listThemeCards(theme), [theme]);
  const linkLayoutKey = useMemo(
    () =>
      `${theme.id}:${COLUMN_IDS.map((id) => order[id].join(",")).join("|")}:${Object.values(cards)
        .map((card) => `${card.id}:${card.blocked}:${card.blockedBy.join(",")}`)
        .join("|")}`,
    [theme.id, order, cards],
  );

  useEffect(() => {
    let cancelled = false;
    const result = useBoardStore.persist.rehydrate();
    void Promise.resolve(result).then(() => {
      if (cancelled) return;
      attachBoardHistory();
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!focusedCardId) return;
    const node = document.querySelector(`[data-card-id="${focusedCardId}"]`);
    node?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [focusedCardId]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if (typingInField(event.target)) return;
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          if (redoBoard()) toast("Redone");
        } else if (undoBoard()) {
          toast("Undone");
        }
        return;
      }
      if (meta && event.key.toLowerCase() === "y") {
        event.preventDefault();
        if (redoBoard()) toast("Redone");
        return;
      }
      if (
        searchOpen ||
        helpOpen ||
        form ||
        detailsCard ||
        linkForm ||
        canvasOpen ||
        pendingBlock ||
        pendingWaiting
      ) {
        if (event.key === "Escape") {
          setSearchOpen(false);
          setHelpOpen(false);
        }
        return;
      }
      if (event.key === "/" && !event.shiftKey) {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (event.key === "?") {
        event.preventDefault();
        setHelpOpen(true);
        return;
      }
      if (event.key.toLowerCase() === "c" && !meta) {
        event.preventDefault();
        setForm({ mode: "create", columnId: "backlog" });
        return;
      }
      if (event.key.toLowerCase() === "z" && !meta) {
        event.preventDefault();
        if (undoBoard()) toast("Undone");
        return;
      }
      if (event.key.toLowerCase() === "u" && !meta) {
        event.preventDefault();
        if (undoBoard()) toast("Undone");
        return;
      }
      if (event.key.toLowerCase() === "r" && !meta && event.shiftKey) {
        event.preventDefault();
        if (redoBoard()) toast("Redone");
        return;
      }
      const ids = listThemeCards(selectActiveTheme(useBoardStore.getState())).map(
        (card) => card.id,
      );
      if (!ids.length) return;
      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        setFocusedCardId((current) => {
          const index = current ? ids.indexOf(current) : -1;
          return ids[Math.min(ids.length - 1, index + 1)] ?? ids[0]!;
        });
        return;
      }
      if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        setFocusedCardId((current) => {
          const index = current ? ids.indexOf(current) : ids.length;
          return ids[Math.max(0, index - 1)] ?? ids[0]!;
        });
        return;
      }
      if (event.key === "Enter" && focusedCardId) {
        const card = selectActiveTheme(useBoardStore.getState()).cards[focusedCardId];
        if (card) {
          event.preventDefault();
          setDetailsCard(card);
        }
      }
    }
    function onSearch() {
      setSearchOpen(true);
    }
    function onUndo() {
      if (undoBoard()) toast("Undone");
    }
    function onRedo() {
      if (redoBoard()) toast("Redone");
    }
    function onHelp() {
      setHelpOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener(BOARD_EVENT.search, onSearch);
    window.addEventListener(BOARD_EVENT.undo, onUndo);
    window.addEventListener(BOARD_EVENT.redo, onRedo);
    window.addEventListener(BOARD_EVENT.help, onHelp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(BOARD_EVENT.search, onSearch);
      window.removeEventListener(BOARD_EVENT.undo, onUndo);
      window.removeEventListener(BOARD_EVENT.redo, onRedo);
      window.removeEventListener(BOARD_EVENT.help, onHelp);
    };
  }, [
    searchOpen,
    helpOpen,
    form,
    detailsCard,
    linkForm,
    canvasOpen,
    pendingBlock,
    pendingWaiting,
    focusedCardId,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, POINTER_SENSOR),
    useSensor(TouchSensor, TOUCH_SENSOR),
    useSensor(KeyboardSensor, KEYBOARD_SENSOR),
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
      setOverColumn((current) => (current === from ? current : from));
      return;
    }
    setOverColumn((current) => (current === nextColumn ? current : nextColumn));
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
      } else if (from && to && from !== to) {
        moveCard(activeId, overId);
        if (card && from === "review") publishLeave(card.id, to);
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
    waiting: boolean;
    waitingNote: string;
  }) {
    if (!form) return;
    if (form.mode === "create") {
      if (!columnMeta(form.columnId).allowsCreate) return;
      addCard(form.columnId, values.title, values.description, {
        blocked: values.blocked,
        urgent: values.urgent,
        blockedBy: values.blockedBy,
        waiting: values.waiting,
        waitingNote: values.waitingNote,
      });
      toast.success("Card added");
      return;
    }
    updateCard(form.card.id, values);
    toast.success("Card updated");
  }

  const handleDelete = useCallback((card: Card) => {
    setPendingDelete(card);
  }, []);

  const handleToggleFlag = useCallback((card: Card, flag: "blocked" | "urgent" | "waiting") => {
    if (flag === "blocked") {
      if (card.blocked) {
        setCardBlock(card.id, false, []);
        toast("Blocked cleared");
        return;
      }
      setPendingBlock(card);
      return;
    }
    if (flag === "waiting") {
      setPendingWaiting(card);
      return;
    }
    toggleCardFlag(card.id, flag);
    const next = !card.urgent;
    toast(next ? "Marked urgent" : "Urgent cleared");
  }, [setCardBlock, toggleCardFlag]);

  const handleEditLink = useCallback((card: Card, kind: CardLinkKind) => {
    setLinkForm({ card, kind });
  }, []);

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

  const handleSendTo = useCallback((card: Card, columnId: ColumnId) => {
    const from = findColumnOf(selectActiveTheme(useBoardStore.getState()).order, card.id);
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
  }, [publishLeave, sendCardTo]);

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
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:gap-3">
        <ThemeTabsSkeleton />
        <div className="h-11 w-full animate-pulse rounded-md bg-surface" />
        <BoardSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:gap-3">
        <ThemeTabs />
        <NoticeBar />
        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant={canvasOpen ? "secondary" : "outline"}
            onClick={() => onCanvasOpenChange(!canvasOpen)}
          >
            {canvasOpen ? <LayoutGrid className="size-4" /> : <PenLine className="size-4" />}
            {canvasOpen ? "Show board" : "Open canvas"}
          </Button>
        </div>
        {canvasOpen ? (
          <div className="flex min-h-80 flex-1 flex-col xl:min-h-0">
          <Suspense fallback={<div className="h-80 flex-1 animate-pulse rounded-xl bg-bg-elevated" />}>
            <WhiteboardCanvas onClose={() => onCanvasOpenChange(false)} />
          </Suspense>
          </div>
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
            ref={boardRef}
            className="board-scroller relative flex snap-x snap-mandatory items-start gap-3 overflow-x-auto pb-2 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200 xl:gap-3 xl:overflow-x-hidden xl:snap-none wide:gap-4"
          >
            <BlockLinks
              cards={cards}
              layoutKey={linkLayoutKey}
              scrollerRef={boardRef}
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
                itemIds={order[column.id]}
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
                virtualize={!activeCard && !focusedCardId}
                focusedCardId={focusedCardId}
              />
            ))}
          </div>

          {typeof document !== "undefined"
            ? createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                  {activeCard ? (
                    <div className="w-[min(100vw-2.5rem,19.5rem)] xl:w-80">
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

      <BoardSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onPick={(hit: CardHit) => {
          useBoardStore.getState().setActiveTheme(hit.themeId);
          setFocusedCardId(hit.card.id);
          setDetailsCard(hit.card);
        }}
      />
      <ShortcutHelp open={helpOpen} onOpenChange={setHelpOpen} />
      {detailsCard ? (
        <Suspense fallback={null}>
          <CardDetailsDialog
            open
            card={detailsCard}
            onOpenChange={(open) => {
              if (!open) setDetailsCard(null);
            }}
            onSave={handleDetailsSave}
          />
        </Suspense>
      ) : null}

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
      <WaitingNoteDialog
        open={pendingWaiting !== null}
        card={pendingWaiting}
        onOpenChange={(open) => {
          if (!open) setPendingWaiting(null);
        }}
        onConfirm={(note) => {
          if (!pendingWaiting) return;
          setCardWaiting(pendingWaiting.id, true, note);
          setPendingWaiting(null);
          toast("Marked waiting");
        }}
        onClear={() => {
          if (!pendingWaiting) return;
          setCardWaiting(pendingWaiting.id, false, "");
          setPendingWaiting(null);
          toast("Waiting cleared");
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
          className="h-72 w-[85vw] min-w-[85vw] shrink-0 animate-pulse rounded-xl bg-bg-elevated shadow-border md:h-80 md:w-64 md:min-w-64 xl:h-auto xl:min-h-0 xl:w-auto xl:flex-1"
        />
      ))}
    </div>
  );
}
