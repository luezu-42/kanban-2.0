import { ArrowLeft, Download } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Button } from "@/components/ui/button";
import { useP2PRoom } from "@/lib/multiplayer";
import {
  MAX_POKER_PLAYERS,
  VOTE_VALUES,
  type PokerCard,
  type PokerMessage,
  type PokerState,
  type PokerVote,
  averageVote,
  durationOptions,
  emptyVotes,
  everyoneVoted,
  formatPokerTxt,
  isPokerState,
  isPokerVote,
  numericVotes,
  themeDurationTotals,
} from "@/lib/poker";
import { useBoardStore } from "@/lib/kanban";
import { cn } from "@/lib/utils";

const POKER_ROOM = "ledger-poker";

type PlanningPokerProps = {
  name: string;
  initialCards: PokerCard[];
  onExit: () => void;
};

export function PlanningPoker({
  name,
  initialCards,
  onExit,
}: PlanningPokerProps) {
  const p2p = useP2PRoom({ room: POKER_ROOM, name });
  const setCardDuration = useBoardStore((state) => state.setCardDuration);
  const commitPokerResults = useBoardStore((state) => state.commitPokerResults);
  const [seeding, setSeeding] = useState(() => initialCards.length > 0);
  const [state, setState] = useState<PokerState | null>(() =>
    initialCards.length
      ? {
          hostId: "pending",
          cards: initialCards,
          index: 0,
          phase: "voting",
          votes: {},
        }
      : null,
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  const players = useMemo(
    () => [
      { id: p2p.selfId, name },
      ...p2p.peers.map((peer) => ({ id: peer.id, name: peer.name || "Guest" })),
    ],
    [name, p2p.peers, p2p.selfId],
  );
  const playerIds = players.map((player) => player.id);

  useEffect(() => {
    if (!seeding) return;
    setState((current) => {
      if (!current || current.hostId === p2p.selfId) return current;
      return { ...current, hostId: p2p.selfId };
    });
  }, [seeding, p2p.selfId]);

  useEffect(() => {
    const total = 1 + p2p.peers.length;
    if (total <= MAX_POKER_PLAYERS) return;
    const ids = [p2p.selfId, ...p2p.peers.map((peer) => peer.id)].sort();
    if (ids[ids.length - 1] !== p2p.selfId) return;
    toast.error("This room is full (10 people).");
    onExit();
  }, [onExit, p2p.peers.length, p2p.selfId]);

  const playerKey = playerIds.join("|");
  useEffect(() => {
    const ids = playerKey ? playerKey.split("|") : [];
    setState((current) => {
      if (!current || current.phase === "done") return current;
      const nextVotes = { ...emptyVotes(ids) };
      let changed = Object.keys(current.votes).length !== ids.length;
      for (const id of ids) {
        if (current.votes[id] != null) nextVotes[id] = current.votes[id];
        if (current.votes[id] !== nextVotes[id]) changed = true;
      }
      const shouldReveal = everyoneVoted(nextVotes, ids);
      if (!changed && (!shouldReveal || current.phase === "reveal")) return current;
      return {
        ...current,
        votes: nextVotes,
        phase: shouldReveal ? "reveal" : current.phase,
      };
    });
  }, [playerKey]);

  useEffect(() => {
    return p2p.onMessage((from, data) => {
      if (!data || typeof data !== "object" || !("type" in data)) return;
      const message = data as PokerMessage;
      if (message.type === "sync" && isPokerState(message.state)) {
        setSeeding(false);
        setState(message.state);
        return;
      }
      if (message.type === "vote" && isPokerVote(message.value)) {
        setState((current) => {
          if (!current) return current;
          return applyVote(current, from, message.cardId, message.value, playerIdsRef.current);
        });
        return;
      }
      if (message.type === "pick") {
        setState((current) => {
          if (!current) return current;
          return applyPick(current, message.cardId, message.duration, playerIdsRef.current);
        });
        if (message.duration > 0) setCardDuration(message.cardId, message.duration);
      }
      if (message.type === "commit") {
        commitPokerResults(message.cards);
        toast.success("Planning cards moved to To Do");
      }
    });
  }, [p2p.onMessage, setCardDuration, commitPokerResults]);

  const playerIdsRef = useRef(playerIds);
  playerIdsRef.current = playerIds;

  useEffect(() => {
    if (!seeding || !p2p.joined) return;
    const current = stateRef.current;
    if (!current || current.phase === "done") return;
    p2p.send({
      type: "sync",
      state: { ...current, hostId: p2p.selfId },
    } satisfies PokerMessage);
  }, [seeding, p2p.joined, p2p.peers.length, p2p.selfId, p2p.send]);

  const card = state?.cards[state.index] ?? null;
  const myVote = state ? state.votes[p2p.selfId] ?? null : null;
  const numbers = state ? numericVotes(state.votes) : [];
  const average = averageVote(numbers);
  const options = average == null ? [] : durationOptions(average);
  const votedCount = state
    ? players.filter((player) => state.votes[player.id] != null).length
    : 0;

  function vote(value: PokerVote) {
    if (!state || !card || state.phase !== "voting") return;
    setState((current) => {
      if (!current) return current;
      return applyVote(current, p2p.selfId, card.id, value, playerIds);
    });
    p2p.send({ type: "vote", cardId: card.id, value } satisfies PokerMessage);
  }

  function pick(duration: number) {
    if (!state || !card || state.phase !== "reveal") return;
    setCardDuration(card.id, duration);
    setState((current) => {
      if (!current) return current;
      return applyPick(current, card.id, duration, playerIds);
    });
    p2p.send({ type: "pick", cardId: card.id, duration } satisfies PokerMessage);
  }

  function pickNextWithoutDuration() {
    if (!state || !card || state.phase !== "reveal") return;
    setState((current) => {
      if (!current) return current;
      return applyPick(current, card.id, null, playerIds);
    });
    p2p.send({ type: "pick", cardId: card.id, duration: -1 } satisfies PokerMessage);
  }

  function download() {
    if (!state) return;
    commitPokerResults(state.cards);
    p2p.send({ type: "commit", cards: state.cards } satisfies PokerMessage);
    const blob = new Blob([formatPokerTxt(state.cards)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "planning-poker.txt";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Durations saved. Planning cards moved to To Do.");
  }

  const revealed = state?.phase === "reveal";
  const done = state?.phase === "done";
  const themeTotals = done && state ? themeDurationTotals(state.cards) : [];
  const grandTotal = themeTotals.reduce((sum, group) => sum + group.total, 0);
  const progress =
    state && state.cards.length
      ? Math.min(1, (done ? state.cards.length : state.index) / state.cards.length)
      : 0;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-planning" aria-hidden="true" />
              <p className="text-xs font-medium tracking-[0.18em] text-subtle uppercase">
                Planning poker
              </p>
            </div>
            <h2 className="font-display mt-1 text-3xl tracking-tight text-fg sm:text-4xl">
              {done ? "The table is clear" : "The table"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {done
                ? "Durations are ready to save."
                : state && card
                  ? `${card.themeName} · ${state.index + 1} of ${state.cards.length}`
                  : "Waiting for Planning cards"}
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={onExit}>
            <ArrowLeft className="size-4" />
            Back to board
          </Button>
        </div>
        <div className="h-px overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-planning transition-[width] duration-300 ease-[var(--ease-smooth-out)]"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </header>

      {!state ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]">
          <div className="grid min-h-72 place-items-center rounded-xl bg-bg-elevated p-8 text-center shadow-border">
            <div>
              <p className="font-display text-2xl tracking-tight text-fg">Hold the seats</p>
              <p className="mt-2 max-w-sm text-sm text-muted">
                Planning cards will land here as soon as someone at the table shares them.
              </p>
            </div>
          </div>
          <PlayerRail players={players} votes={{}} revealed={false} selfId={p2p.selfId} />
        </div>
      ) : done ? (
        <div className="grid gap-5 rounded-xl bg-bg-elevated p-5 shadow-border sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="max-w-md text-sm text-muted">
              {state.cards.length} {state.cards.length === 1 ? "card" : "cards"} estimated. Download
              moves them from Planning to To Do.
            </p>
            <Button type="button" onClick={download}>
              <Download className="size-4" />
              Download list
            </Button>
          </div>
          {themeTotals.length ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {themeTotals.map((group) => (
                <div
                  key={group.themeId}
                  className="rounded-lg bg-surface px-4 py-3 shadow-border"
                >
                  <p className="truncate text-xs font-medium tracking-wide text-subtle uppercase">
                    {group.themeName}
                  </p>
                  <p className="font-display mt-1 text-3xl tabular-nums text-fg">
                    {group.total}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {group.counted} {group.counted === 1 ? "estimate" : "estimates"}
                  </p>
                </div>
              ))}
              {themeTotals.length > 1 ? (
                <div className="rounded-lg bg-bg px-4 py-3 shadow-border sm:col-span-2 lg:col-span-1">
                  <p className="text-xs font-medium tracking-wide text-subtle uppercase">
                    All tabs
                  </p>
                  <p className="font-display mt-1 text-3xl tabular-nums text-fg">
                    {grandTotal}
                  </p>
                  <p className="mt-1 text-xs text-muted">Sum of every estimate</p>
                </div>
              ) : null}
            </div>
          ) : null}
          <ol className="grid gap-2">
            {state.cards.map((item, index) => (
              <li
                key={item.id}
                className="flex items-baseline justify-between gap-4 rounded-lg bg-surface px-4 py-3 shadow-border"
              >
                <div className="min-w-0">
                  <p className="wrap-break-word text-sm font-medium text-fg [overflow-wrap:anywhere]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-subtle">{item.themeName}</p>
                </div>
                <p className="shrink-0 font-display text-xl tabular-nums text-fg">
                  {item.duration ?? "—"}
                  <span className="ml-1 font-sans text-xs text-subtle">{index + 1}</span>
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : card ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)]">
          <article className="min-h-80 overflow-hidden rounded-xl bg-bg-elevated shadow-border">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 sm:px-8">
              <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">
                {card.themeName}
              </p>
              <p className="font-mono text-xs text-subtle tabular-nums">
                {votedCount}/{players.length} voted
              </p>
            </div>
            <div className="max-h-[28rem] overflow-y-auto p-5 sm:p-8">
              <h3 className="font-display text-3xl leading-tight tracking-tight text-fg wrap-break-word [overflow-wrap:anywhere] sm:text-4xl">
                {card.title}
              </h3>
              {card.description ? (
                <p className="mt-4 max-w-2xl text-base leading-relaxed wrap-break-word text-muted [overflow-wrap:anywhere]">
                  {card.description}
                </p>
              ) : null}
              {card.details.trim() ? (
                <div className="mt-6 border-t border-border pt-5">
                  <MarkdownPreview markdown={card.details} images={card.images} />
                </div>
              ) : null}
            </div>
          </article>

          <PlayerRail
            players={players}
            votes={state.votes}
            revealed={revealed}
            selfId={p2p.selfId}
          />
        </div>
      ) : null}

      {state && card && state.phase === "voting" ? (
        <div className="rounded-xl bg-bg-elevated p-4 shadow-border sm:p-5">
          <p className="text-sm text-muted">
            Your estimate stays hidden until everyone has voted.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {VOTE_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => vote(value)}
                className={cn(
                  "grid h-16 w-12 place-items-center rounded-lg font-display text-xl shadow-card transition-[background-color,color,transform] duration-150",
                  myVote === value
                    ? "bg-accent text-accent-fg"
                    : "bg-surface text-fg hover:-translate-y-0.5 hover:bg-surface-hover",
                )}
              >
                {value}
              </button>
            ))}
            <button
              type="button"
              onClick={() => vote("skip")}
              className={cn(
                "inline-flex h-16 items-center rounded-lg px-5 text-sm font-medium shadow-card transition-[background-color,color] duration-150",
                myVote === "skip"
                  ? "bg-accent text-accent-fg"
                  : "bg-surface text-muted hover:bg-surface-hover hover:text-fg",
              )}
            >
              Skip
            </button>
          </div>
        </div>
      ) : null}

      {state && card && revealed ? (
        <div className="rounded-xl bg-bg-elevated p-4 shadow-border sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">
                Revealed
              </p>
              <p className="mt-1 text-sm text-muted">
                {average == null
                  ? "Everyone skipped. Leave duration empty, or pick one."
                  : "Choose a duration for this card."}
              </p>
            </div>
            {average != null ? (
              <p className="font-display text-5xl leading-none tracking-tight tabular-nums text-fg">
                {average.toFixed(1)}
              </p>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {options.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => pick(value)}
                className={cn(
                  "grid h-14 min-w-14 place-items-center rounded-lg px-4 font-display text-xl shadow-card transition-[background-color,color] duration-150",
                  value === Math.round(average ?? value)
                    ? "bg-accent text-accent-fg"
                    : "bg-surface text-fg hover:bg-surface-hover",
                )}
              >
                {value}
              </button>
            ))}
            {average == null ? (
              <Button type="button" variant="secondary" onClick={pickNextWithoutDuration}>
                Skip card
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PlayerRail({
  players,
  votes,
  revealed,
  selfId,
}: {
  players: Array<{ id: string; name: string }>;
  votes: Record<string, PokerVote | null>;
  revealed: boolean;
  selfId: string;
}) {
  return (
    <aside className="grid content-start gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Seats</p>
        <p className="font-mono text-xs text-subtle tabular-nums">
          {players.length}/{MAX_POKER_PLAYERS}
        </p>
      </div>
      <ul className="grid gap-2">
        {players.map((player) => {
          const voteValue = votes[player.id] ?? null;
          const placed = voteValue != null;
          return (
            <li
              key={player.id}
              className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2.5 shadow-border"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold tracking-wide",
                  placed ? "bg-accent text-accent-fg" : "bg-bg text-muted",
                )}
              >
                {player.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">
                  {player.name}
                  {player.id === selfId ? (
                    <span className="ml-1.5 text-xs font-normal text-subtle">you</span>
                  ) : null}
                </p>
                <p className="text-xs text-subtle">
                  {placed ? (revealed ? "Voted" : "In") : "Waiting"}
                </p>
              </div>
              <p className="shrink-0 font-display text-xl tabular-nums text-fg">
                {voteLabel(voteValue, revealed)}
              </p>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function voteLabel(vote: PokerVote | null, revealed: boolean) {
  if (vote == null) return "—";
  if (!revealed) return "•";
  return vote === "skip" ? "Skip" : String(vote);
}

function applyVote(
  state: PokerState,
  playerId: string,
  cardId: string,
  value: PokerVote,
  playerIds: string[],
): PokerState {
  const current = state.cards[state.index];
  if (!current || current.id !== cardId || state.phase !== "voting") return state;
  const votes = { ...state.votes, [playerId]: value };
  if (everyoneVoted(votes, playerIds)) return { ...state, votes, phase: "reveal" };
  return { ...state, votes };
}

function applyPick(
  state: PokerState,
  cardId: string,
  duration: number | null,
  playerIds: string[],
): PokerState {
  if (state.phase !== "reveal") return state;
  const current = state.cards[state.index];
  if (!current || current.id !== cardId) return state;
  const resolved = duration != null && duration > 0 ? duration : null;
  const cards = state.cards.map((item) =>
    item.id === cardId ? { ...item, duration: resolved } : item,
  );
  const nextIndex = state.index + 1;
  if (nextIndex >= cards.length) {
    return { ...state, cards, index: nextIndex, phase: "done", votes: {} };
  }
  return {
    ...state,
    cards,
    index: nextIndex,
    phase: "voting",
    votes: emptyVotes(playerIds),
  };
}
