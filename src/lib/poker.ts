import type { Card, Theme } from "@/lib/kanban";
import { collectPlanningCards } from "@/lib/kanban";

export const VOTE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
export const MAX_POKER_PLAYERS = 10;

export type PokerVote = (typeof VOTE_VALUES)[number] | "skip";

export type PokerCard = {
  id: string;
  themeId: string;
  themeName: string;
  title: string;
  description: string;
  details: string;
  images: Record<string, string>;
  duration: number | null;
};

export type PokerPlayer = {
  id: string;
  name: string;
};

export type PokerPhase = "voting" | "reveal" | "done";

export type PokerState = {
  hostId: string;
  cards: PokerCard[];
  index: number;
  phase: PokerPhase;
  votes: Record<string, PokerVote | null>;
};

export type PokerMessage =
  | { type: "sync"; state: PokerState }
  | { type: "vote"; cardId: string; value: PokerVote }
  | { type: "pick"; cardId: string; duration: number }
  | { type: "commit"; cards: PokerCard[] };

export function planningDeck(themes: Theme[]): PokerCard[] {
  return collectPlanningCards(themes).map((card) => slimCard(card));
}

function slimCard(
  card: Card & { themeId: string; themeName: string },
): PokerCard {
  return {
    id: card.id,
    themeId: card.themeId,
    themeName: card.themeName,
    title: card.title,
    description: card.description,
    details: slimDetails(card.details),
    images: {},
    duration: card.duration,
  };
}

function slimDetails(details: string) {
  const withoutHugeImages = details.replace(
    /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g,
    "",
  );
  return withoutHugeImages.length > 12_000
    ? withoutHugeImages.slice(0, 12_000)
    : withoutHugeImages;
}

export function emptyVotes(playerIds: string[]): Record<string, PokerVote | null> {
  return Object.fromEntries(playerIds.map((id) => [id, null]));
}

export function numericVotes(votes: Record<string, PokerVote | null>) {
  const values: number[] = [];
  for (const value of Object.values(votes)) {
    if (typeof value === "number") values.push(value);
  }
  return values;
}

export function averageVote(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function durationOptions(average: number) {
  const center = Math.round(average);
  const unique = new Set<number>();
  for (const delta of [-2, -1, 0, 1, 2]) {
    unique.add(Math.min(13, Math.max(1, center + delta)));
  }
  return [...unique].sort((a, b) => a - b);
}

export function everyoneVoted(votes: Record<string, PokerVote | null>, playerIds: string[]) {
  return playerIds.length > 0 && playerIds.every((id) => votes[id] != null);
}

export function formatPokerTxt(cards: PokerCard[]) {
  return cards
    .map((card) => {
      const duration =
        card.duration == null ? "Duration: —" : `Duration: ${card.duration}`;
      return [card.title, card.description || "—", duration].join("\n");
    })
    .join("\n\n");
}

export function themeDurationTotals(cards: PokerCard[]) {
  const groups = new Map<
    string,
    { themeId: string; themeName: string; total: number; counted: number }
  >();
  for (const card of cards) {
    const existing = groups.get(card.themeId) ?? {
      themeId: card.themeId,
      themeName: card.themeName,
      total: 0,
      counted: 0,
    };
    if (typeof card.duration === "number") {
      existing.total += card.duration;
      existing.counted += 1;
    }
    groups.set(card.themeId, existing);
  }
  return [...groups.values()];
}

export function isPokerVote(value: unknown): value is PokerVote {
  return value === "skip" || (typeof value === "number" && VOTE_VALUES.includes(value as never));
}

export function isPokerState(value: unknown): value is PokerState {
  if (!value || typeof value !== "object") return false;
  const state = value as PokerState;
  return (
    typeof state.hostId === "string" &&
    Array.isArray(state.cards) &&
    typeof state.index === "number" &&
    (state.phase === "voting" || state.phase === "reveal" || state.phase === "done") &&
    Boolean(state.votes) &&
    typeof state.votes === "object"
  );
}
