import type { Card, ColumnId, Theme } from "@/lib/kanban";
import { emptyWhiteboard, type WhiteboardDoc } from "@/lib/whiteboard";

export type BoardDelta = {
  version: number;
  activeThemeId: string;
  upsertThemes: Array<{
    id: string;
    name: string;
    notice: string;
    whiteboard: WhiteboardDoc;
  }>;
  upsertCards: Array<{
    themeId: string;
    columnId: ColumnId;
    card: Card;
  }>;
  deletedCardIds: string[];
  deletedThemeIds: string[];
  orders: Record<string, Record<ColumnId, string[]>>;
};

export function isBoardDelta(value: unknown): value is BoardDelta {
  if (!value || typeof value !== "object") return false;
  const delta = value as BoardDelta;
  return (
    typeof delta.version === "number" &&
    typeof delta.activeThemeId === "string" &&
    Array.isArray(delta.upsertThemes) &&
    Array.isArray(delta.upsertCards) &&
    Array.isArray(delta.deletedCardIds) &&
    Array.isArray(delta.deletedThemeIds) &&
    Boolean(delta.orders) &&
    typeof delta.orders === "object"
  );
}

export function applyBoardDelta(themes: Theme[], activeThemeId: string, delta: BoardDelta) {
  const deletedThemes = new Set(delta.deletedThemeIds);
  const deletedCards = new Set(delta.deletedCardIds);
  let next = themes.filter((theme) => !deletedThemes.has(theme.id));

  for (const incoming of delta.upsertThemes) {
    const existing = next.find((theme) => theme.id === incoming.id);
    if (existing) {
      next = next.map((theme) =>
        theme.id === incoming.id
          ? {
              ...theme,
              name: incoming.name,
              notice: incoming.notice,
              whiteboard: incoming.whiteboard ?? theme.whiteboard,
            }
          : theme,
      );
    } else {
      next = [
        ...next,
        {
          id: incoming.id,
          name: incoming.name,
          notice: incoming.notice,
          whiteboard: incoming.whiteboard,
          cards: {},
          order: emptyColumns(),
        },
      ];
    }
  }

  next = next.map((theme) => {
    if (![...deletedCards].some((id) => theme.cards[id])) return theme;
    const cards = { ...theme.cards };
    for (const id of deletedCards) delete cards[id];
    return { ...theme, cards };
  });

  for (const item of delta.upsertCards) {
    next = next.map((theme) => {
      if (theme.id !== item.themeId) {
        if (!theme.cards[item.card.id]) return theme;
        const { [item.card.id]: _removed, ...cards } = theme.cards;
        return {
          ...theme,
          cards,
          order: stripId(theme.order, item.card.id),
        };
      }
      return {
        ...theme,
        cards: { ...theme.cards, [item.card.id]: item.card },
      };
    });
    if (!next.some((theme) => theme.id === item.themeId)) {
      next = [
        ...next,
        {
          id: item.themeId,
          name: "Theme",
          notice: "",
          whiteboard: emptyWhiteboard(),
          cards: { [item.card.id]: item.card },
          order: emptyColumns(),
        },
      ];
    }
  }

  next = next.map((theme) => {
    const order = delta.orders[theme.id];
    return order ? { ...theme, order: { ...emptyColumns(), ...order } } : theme;
  });

  const nextActive =
    delta.activeThemeId && next.some((theme) => theme.id === delta.activeThemeId)
      ? delta.activeThemeId
      : next.some((theme) => theme.id === activeThemeId)
        ? activeThemeId
        : (next[0]?.id ?? activeThemeId);

  return { themes: next, activeThemeId: nextActive };
}

function emptyColumns(): Record<ColumnId, string[]> {
  return {
    backlog: [],
    planning: [],
    todo: [],
    doing: [],
    review: [],
    done: [],
  };
}

function stripId(order: Record<ColumnId, string[]>, cardId: string) {
  return {
    backlog: order.backlog.filter((id) => id !== cardId),
    planning: order.planning.filter((id) => id !== cardId),
    todo: order.todo.filter((id) => id !== cardId),
    doing: order.doing.filter((id) => id !== cardId),
    review: order.review.filter((id) => id !== cardId),
    done: order.done.filter((id) => id !== cardId),
  };
}
