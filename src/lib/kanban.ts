import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const COLUMN_IDS = [
  "backlog",
  "planning",
  "todo",
  "doing",
  "review",
  "done",
] as const;
export type ColumnId = (typeof COLUMN_IDS)[number];

export const COLUMNS: {
  id: ColumnId;
  title: string;
  hint: string;
  empty: string;
  emptyHint: string;
  allowsCreate: boolean;
}[] = [
  {
    id: "backlog",
    title: "Backlog",
    hint: "Later",
    empty: "No ideas yet",
    emptyHint: "Park work that is not ready to shape.",
    allowsCreate: true,
  },
  {
    id: "planning",
    title: "Planning",
    hint: "Shape the work",
    empty: "Nothing in planning",
    emptyHint: "Pull a card from the backlog to scope it.",
    allowsCreate: true,
  },
  {
    id: "todo",
    title: "To Do",
    hint: "Ready to start",
    empty: "Queue is clear",
    emptyHint: "Advance a planned card when it is ready.",
    allowsCreate: true,
  },
  {
    id: "doing",
    title: "Doing",
    hint: "In motion",
    empty: "Nothing active",
    emptyHint: "Start something from To Do.",
    allowsCreate: false,
  },
  {
    id: "review",
    title: "Review",
    hint: "Queue · newest last",
    empty: "Nothing to review",
    emptyHint: "Advance a card from Doing when it needs a check.",
    allowsCreate: false,
  },
  {
    id: "done",
    title: "Done",
    hint: "Shipped · compact",
    empty: "Nothing shipped",
    emptyHint: "Pass review, then ship it here.",
    allowsCreate: false,
  },
];

export type Card = {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  blocked: boolean;
  urgent: boolean;
  jiraUrl: string;
  prUrl: string;
  details: string;
  images: Record<string, string>;
  assignee: string;
  duration: number | null;
  prAlert: boolean;
  blockedBy: string[];
};

export type CardLinkKind = "jira" | "pr";

export type BoardSnapshot = {
  cards: Record<string, Card>;
  order: Record<ColumnId, string[]>;
};

export type Theme = BoardSnapshot & {
  id: string;
  name: string;
  notice: string;
};

type BoardStore = {
  themes: Theme[];
  activeThemeId: string;
  setActiveTheme: (id: string) => void;
  addTheme: (name: string) => string;
  renameTheme: (id: string, name: string) => void;
  deleteTheme: (id: string) => boolean;
  addCard: (
    columnId: ColumnId,
    title: string,
    description: string,
    flags?: { blocked?: boolean; urgent?: boolean; blockedBy?: string[] },
  ) => string;
  updateCard: (
    id: string,
    patch: {
      title: string;
      description: string;
      blocked: boolean;
      urgent: boolean;
      blockedBy?: string[];
    },
  ) => void;
  toggleCardFlag: (id: string, flag: "blocked" | "urgent") => void;
  setCardBlock: (id: string, blocked: boolean, blockedBy?: string[]) => void;
  setCardLink: (id: string, kind: CardLinkKind, url: string) => void;
  setCardDetails: (
    id: string,
    details: string,
    images?: Record<string, string>,
  ) => void;
  setAssignee: (id: string, name: string) => void;
  setCardDuration: (id: string, duration: number | null) => void;
  togglePrAlert: (id: string) => void;
  setCardPrAlert: (id: string, on: boolean) => void;
  commitPokerResults: (
    results: Array<{ id: string; duration: number | null }>,
  ) => void;
  deleteCard: (id: string) => void;
  moveCard: (activeId: string, overId: string) => void;
  sendCardTo: (cardId: string, columnId: ColumnId) => boolean;
  ingestReviewCard: (incoming: Card) => void;
  applyReviewLeave: (cardId: string, dest: ColumnId | null) => void;
  applyUrgencySort: () => void;
  setThemeNotice: (notice: string) => void;
  replaceBoard: (themes: Theme[], activeThemeId: string) => void;
  applyCard: (card: Card) => void;
};

export const COLUMN_PREFIX = "column:";

export function columnDroppableId(id: ColumnId) {
  return `${COLUMN_PREFIX}${id}` as const;
}

export function parseColumnId(id: string): ColumnId | null {
  if (id.startsWith(COLUMN_PREFIX)) {
    const raw = id.slice(COLUMN_PREFIX.length);
    return isColumnId(raw) ? raw : null;
  }
  return isColumnId(id) ? id : null;
}

export function isColumnId(id: string): id is ColumnId {
  return (COLUMN_IDS as readonly string[]).includes(id);
}

export function columnMeta(id: ColumnId) {
  return COLUMNS.find((column) => column.id === id) ?? COLUMNS[0]!;
}

export function columnAllowsCreate(id: ColumnId) {
  return columnMeta(id).allowsCreate;
}

export function adjacentColumn(id: ColumnId, delta: 1 | -1): ColumnId | null {
  const index = COLUMN_IDS.indexOf(id);
  if (index < 0) return null;
  return COLUMN_IDS[index + delta] ?? null;
}

export function cardLinkKey(kind: CardLinkKind): "jiraUrl" | "prUrl" {
  return kind === "jira" ? "jiraUrl" : "prUrl";
}

export function parseExternalUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const candidate = /^[a-zA-Z][a-zA-Z+\-.]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function findColumnOf(
  order: Record<ColumnId, string[]>,
  cardId: string,
): ColumnId | null {
  for (const columnId of COLUMN_IDS) {
    if (order[columnId].includes(cardId)) return columnId;
  }
  return null;
}

export function sortIdsByUrgency(
  cards: Record<string, Card>,
  ids: string[],
): string[] {
  const urgent: string[] = [];
  const rest: string[] = [];
  for (const id of ids) {
    if (!cards[id]) continue;
    if (cards[id].urgent) urgent.push(id);
    else rest.push(id);
  }
  return [...urgent, ...rest];
}

function sortThemeByUrgency(theme: Theme): Theme {
  const order = emptyOrder();
  for (const columnId of COLUMN_IDS) {
    order[columnId] =
      columnId === "review"
        ? (theme.order[columnId] ?? []).filter((id) => theme.cards[id])
        : sortIdsByUrgency(theme.cards, theme.order[columnId] ?? []);
  }
  return { ...theme, order };
}

function sortThemeColumn(theme: Theme, columnId: ColumnId): Theme {
  if (columnId === "review") return theme;
  return {
    ...theme,
    order: {
      ...theme.order,
      [columnId]: sortIdsByUrgency(theme.cards, theme.order[columnId]),
    },
  };
}

export function themeCardCount(theme: Theme) {
  return COLUMN_IDS.reduce((sum, columnId) => sum + theme.order[columnId].length, 0);
}

export function boardCardCount(themes: Theme[]) {
  return themes.reduce((sum, theme) => sum + themeCardCount(theme), 0);
}

export function boardColumnCounts(themes: Theme[]): Record<ColumnId, number> {
  const counts = Object.fromEntries(COLUMN_IDS.map((id) => [id, 0])) as Record<
    ColumnId,
    number
  >;
  for (const theme of themes) {
    for (const id of COLUMN_IDS) {
      counts[id] += theme.order[id]?.length ?? 0;
    }
  }
  return counts;
}

export function selectActiveTheme(state: Pick<BoardStore, "themes" | "activeThemeId">) {
  return state.themes.find((theme) => theme.id === state.activeThemeId) ?? state.themes[0]!;
}

export function collectAllReviewCards(themes: Theme[]) {
  const cards: Card[] = [];
  const seen = new Set<string>();
  for (const theme of themes) {
    for (const id of theme.order.review) {
      const existing = theme.cards[id];
      if (!existing || seen.has(id)) continue;
      seen.add(id);
      cards.push(existing);
    }
  }
  return cards;
}

export function listThemeCards(theme: Theme) {
  const items: Array<Card & { columnId: ColumnId }> = [];
  for (const columnId of COLUMN_IDS) {
    for (const id of theme.order[columnId]) {
      const existing = theme.cards[id];
      if (!existing) continue;
      items.push({ ...existing, columnId });
    }
  }
  return items;
}

function sanitizeBlockedBy(
  cards: Record<string, Card>,
  id: string,
  blocked: boolean,
  raw: string[] | undefined,
) {
  if (!blocked) return [];
  const unique = new Set<string>();
  for (const other of raw ?? []) {
    if (other && other !== id && cards[other]) unique.add(other);
  }
  return [...unique];
}

export function collectPlanningCards(themes: Theme[]) {
  const cards: Array<Card & { themeId: string; themeName: string }> = [];
  for (const theme of themes) {
    for (const id of theme.order.planning) {
      const existing = theme.cards[id];
      if (!existing) continue;
      cards.push({ ...existing, themeId: theme.id, themeName: theme.name });
    }
  }
  return cards;
}

function card(
  title: string,
  description: string,
  createdAt: number,
  flags: { blocked?: boolean; urgent?: boolean; blockedBy?: string[] } = {},
): Card {
  return {
    id: crypto.randomUUID(),
    title,
    description,
    createdAt,
    blocked: Boolean(flags.blocked),
    urgent: Boolean(flags.urgent),
    jiraUrl: "",
    prUrl: "",
    details: "",
    images: {},
    assignee: "",
    duration: null,
    prAlert: false,
    blockedBy: flags.blocked && flags.blockedBy ? flags.blockedBy : [],
  };
}

const emptyOrder = (): Record<ColumnId, string[]> => ({
  backlog: [],
  planning: [],
  todo: [],
  doing: [],
  review: [],
  done: [],
});

function emptySnapshot(): BoardSnapshot {
  return { cards: {}, order: emptyOrder() };
}

function makeTheme(name: string, snapshot: BoardSnapshot = emptySnapshot()): Theme {
  return finalizeTheme({
    id: crypto.randomUUID(),
    name,
    notice: "",
    cards: snapshot.cards,
    order: { ...emptyOrder(), ...snapshot.order },
  });
}

function seedBoard(): BoardSnapshot {
  const now = Date.now();
  const parked = card(
    "Park the analytics rewrite",
    "Useful, but it can wait until the launch cut is out.",
    now - 1000 * 60 * 60 * 50,
  );
  const queued = card(
    "Scope the Q3 launch",
    "Outline milestones, owners, and the first public cut.",
    now - 1000 * 60 * 60 * 26,
  );
  const quotes = card(
    "Collect three testimonials",
    "Reach out to early users for short, specific quotes.",
    now - 1000 * 60 * 60 * 18,
    { blocked: true, urgent: true },
  );
  const onboarding = card(
    "Polish the onboarding flow",
    "Tighten first-run copy and cut one unnecessary step.",
    now - 1000 * 60 * 60 * 6,
    { urgent: true },
  );
  const standUp = card(
    "Stand up the board",
    "Columns, cards, and local persistence are live.",
    now - 1000 * 60 * 60 * 40,
  );
  const type = card(
    "Lock the type pairing",
    "Newsreader for the masthead, Figtree for the interface.",
    now - 1000 * 60 * 60 * 36,
  );

  return {
    cards: {
      [parked.id]: parked,
      [queued.id]: queued,
      [quotes.id]: quotes,
      [onboarding.id]: onboarding,
      [standUp.id]: standUp,
      [type.id]: type,
    },
    order: {
      backlog: [parked.id],
      planning: [queued.id],
      todo: [quotes.id],
      doing: [onboarding.id],
      review: [],
      done: [standUp.id, type.id],
    },
  };
}

function seedThemes(): Pick<BoardStore, "themes" | "activeThemeId"> {
  const launch = makeTheme("Launch", seedBoard());
  const studio = makeTheme("Studio", {
    cards: {},
    order: emptyOrder(),
  });
  const sketch = card(
    "Sketch the next poster",
    "Black ink on cream, one headline, no extra ornament.",
    Date.now() - 1000 * 60 * 60 * 8,
  );
  studio.cards[sketch.id] = sketch;
  studio.order.backlog = [sketch.id];
  return { themes: [launch, studio], activeThemeId: launch.id };
}

function withActive(state: BoardStore, updater: (theme: Theme) => Theme) {
  return {
    themes: state.themes.map((theme) =>
      theme.id === state.activeThemeId ? updater(theme) : theme,
    ),
  };
}

export function normalizeCard(raw: unknown): Card | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<Card>;
  if (typeof value.id !== "string" || !value.id) return null;
  if (typeof value.title !== "string") return null;
  const lifted = liftInlineImages(
    typeof value.details === "string" ? value.details : "",
    normalizeImages(value.images),
  );
  return {
    id: value.id,
    title: value.title,
    description: typeof value.description === "string" ? value.description : "",
    createdAt: typeof value.createdAt === "number" ? value.createdAt : Date.now(),
    blocked: Boolean(value.blocked),
    urgent: Boolean(value.urgent),
    jiraUrl: typeof value.jiraUrl === "string" ? value.jiraUrl : "",
    prUrl: typeof value.prUrl === "string" ? value.prUrl : "",
    details: lifted.details,
    images: lifted.images,
    assignee: typeof value.assignee === "string" ? value.assignee : "",
    duration:
      typeof value.duration === "number" && Number.isFinite(value.duration)
        ? value.duration
        : null,
    prAlert: Boolean(value.prAlert),
    blockedBy: Array.isArray(value.blockedBy)
      ? [...new Set(value.blockedBy.filter((id): id is string => typeof id === "string" && id.length > 0))]
      : [],
  };
}

function normalizeImages(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string" && value.startsWith("data:image/")) next[key] = value;
  }
  return next;
}

function liftInlineImages(details: string, images: Record<string, string>) {
  const nextImages = { ...images };
  const nextDetails = details.replace(
    /!\[([^\]]*)\]\((data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+)\)/g,
    (_full, alt: string, url: string) => {
      const existing = Object.entries(nextImages).find(([, value]) => value === url);
      const id = existing?.[0] ?? crypto.randomUUID().replaceAll("-", "").slice(0, 10);
      nextImages[id] = url;
      return `![${alt}](ledger:img/${id})`;
    },
  );
  return { details: nextDetails, images: nextImages };
}

function normalizeCards(cards: Record<string, unknown>): Record<string, Card> {
  const next: Record<string, Card> = {};
  for (const value of Object.values(cards)) {
    const normalized = normalizeCard(value);
    if (normalized) next[normalized.id] = normalized;
  }
  return next;
}

function normalizeTheme(raw: Partial<Theme>, fallbackName: string): Theme | null {
  if (!raw || typeof raw !== "object") return null;
  const id = typeof raw.id === "string" && raw.id ? raw.id : crypto.randomUUID();
  const name =
    typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : fallbackName;
  const cards =
    raw.cards && typeof raw.cards === "object"
      ? normalizeCards(raw.cards as Record<string, unknown>)
      : {};
  return finalizeTheme({
    id,
    name,
    notice: typeof raw.notice === "string" ? raw.notice : "",
    cards,
    order: { ...emptyOrder(), ...(raw.order ?? {}) },
  });
}

function finalizeTheme(theme: Theme): Theme {
  return sortThemeByUrgency(theme);
}

export function parseBoardPayload(raw: unknown): {
  themes: Theme[];
  activeThemeId: string;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as {
    themes?: unknown;
    activeThemeId?: unknown;
    cards?: BoardSnapshot["cards"];
    order?: BoardSnapshot["order"];
  };
  if (Array.isArray(value.themes) && value.themes.length > 0) {
    const themes = value.themes
      .map((theme, index) =>
        normalizeTheme(theme as Partial<Theme>, `Theme ${index + 1}`),
      )
      .filter((theme): theme is Theme => Boolean(theme));
    if (!themes.length) return null;
    const activeThemeId =
      typeof value.activeThemeId === "string" &&
      themes.some((theme) => theme.id === value.activeThemeId)
        ? value.activeThemeId
        : themes[0]!.id;
    return { themes, activeThemeId };
  }
  if (value.cards && value.order) {
    const migrated = makeTheme("Launch", {
      cards: normalizeCards(value.cards as Record<string, unknown>),
      order: { ...emptyOrder(), ...value.order },
    });
    return { themes: [migrated], activeThemeId: migrated.id };
  }
  return null;
}

export function findCardInThemes(themes: Theme[], cardId: string): Card | null {
  for (const theme of themes) {
    const existing = theme.cards[cardId];
    if (existing) return existing;
  }
  return null;
}

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      ...seedThemes(),

      setActiveTheme: (id) => {
        set((state) =>
          state.themes.some((theme) => theme.id === id)
            ? { activeThemeId: id }
            : state,
        );
      },

      addTheme: (name) => {
        const theme = makeTheme(name.trim() || "Untitled");
        set((state) => ({
          themes: [...state.themes, theme],
          activeThemeId: theme.id,
        }));
        return theme.id;
      },

      renameTheme: (id, name) => {
        const next = name.trim();
        if (!next) return;
        set((state) => ({
          themes: state.themes.map((theme) =>
            theme.id === id ? { ...theme, name: next } : theme,
          ),
        }));
      },

      deleteTheme: (id) => {
        const state = get();
        if (state.themes.length <= 1) return false;
        const index = state.themes.findIndex((theme) => theme.id === id);
        if (index < 0) return false;
        const themes = state.themes.filter((theme) => theme.id !== id);
        const fallback = themes[Math.max(0, index - 1)] ?? themes[0]!;
        set({
          themes,
          activeThemeId:
            state.activeThemeId === id ? fallback.id : state.activeThemeId,
        });
        return true;
      },

      addCard: (columnId, title, description, flags) => {
        if (!columnAllowsCreate(columnId)) return "";
        const next = card(title.trim(), description.trim(), Date.now(), flags);
        set((state) =>
          withActive(state, (theme) => {
            const cards = { ...theme.cards, [next.id]: next };
            cards[next.id] = {
              ...next,
              blockedBy: sanitizeBlockedBy(cards, next.id, next.blocked, next.blockedBy),
            };
            const order = {
              ...theme.order,
              [columnId]: [next.id, ...theme.order[columnId]],
            };
            return sortThemeColumn({ ...theme, cards, order }, columnId);
          }),
        );
        return next.id;
      },

      updateCard: (id, patch) => {
        set((state) =>
          withActive(state, (theme) => {
            const existing = theme.cards[id];
            if (!existing) return theme;
            const nextTheme: Theme = {
              ...theme,
              cards: {
                ...theme.cards,
                [id]: {
                  ...existing,
                  title: patch.title.trim(),
                  description: patch.description.trim(),
                  blocked: patch.blocked,
                  urgent: patch.urgent,
                  blockedBy: sanitizeBlockedBy(
                    theme.cards,
                    id,
                    patch.blocked,
                    patch.blockedBy ?? existing.blockedBy,
                  ),
                },
              },
            };
            const columnId = findColumnOf(theme.order, id);
            return columnId && existing.urgent !== patch.urgent
              ? sortThemeColumn(nextTheme, columnId)
              : nextTheme;
          }),
        );
      },

      toggleCardFlag: (id, flag) => {
        set((state) =>
          withActive(state, (theme) => {
            const existing = theme.cards[id];
            if (!existing) return theme;
            const nextFlag = !existing[flag];
            const nextTheme: Theme = {
              ...theme,
              cards: {
                ...theme.cards,
                [id]: {
                  ...existing,
                  [flag]: nextFlag,
                  blockedBy:
                    flag === "blocked" && !nextFlag ? [] : existing.blockedBy,
                },
              },
            };
            const columnId = findColumnOf(theme.order, id);
            return flag === "urgent" && columnId
              ? sortThemeColumn(nextTheme, columnId)
              : nextTheme;
          }),
        );
      },

      setCardBlock: (id, blocked, blockedBy) => {
        set((state) =>
          withActive(state, (theme) => {
            const existing = theme.cards[id];
            if (!existing) return theme;
            return {
              ...theme,
              cards: {
                ...theme.cards,
                [id]: {
                  ...existing,
                  blocked,
                  blockedBy: sanitizeBlockedBy(theme.cards, id, blocked, blockedBy),
                },
              },
            };
          }),
        );
      },

      setCardLink: (id, kind, url) => {
        set((state) =>
          withActive(state, (theme) => {
            const existing = theme.cards[id];
            if (!existing) return theme;
            return {
              ...theme,
              cards: {
                ...theme.cards,
                [id]: { ...existing, [cardLinkKey(kind)]: url },
              },
            };
          }),
        );
      },

      setCardDetails: (id, details, images) => {
        set((state) =>
          withActive(state, (theme) => {
            const existing = theme.cards[id];
            if (!existing) return theme;
            const lifted = liftInlineImages(details, images ?? existing.images);
            return {
              ...theme,
              cards: {
                ...theme.cards,
                [id]: { ...existing, details: lifted.details, images: lifted.images },
              },
            };
          }),
        );
      },

      setAssignee: (id, name) => {
        set((state) =>
          withActive(state, (theme) => {
            const existing = theme.cards[id];
            if (!existing) return theme;
            return {
              ...theme,
              cards: {
                ...theme.cards,
                [id]: { ...existing, assignee: name.trim() },
              },
            };
          }),
        );
      },

      setCardDuration: (id, duration) => {
        set((state) => ({
          themes: state.themes.map((theme) => {
            const existing = theme.cards[id];
            if (!existing) return theme;
            return {
              ...theme,
              cards: {
                ...theme.cards,
                [id]: { ...existing, duration },
              },
            };
          }),
        }));
      },

      togglePrAlert: (id) => {
        set((state) =>
          withActive(state, (theme) => {
            const existing = theme.cards[id];
            if (!existing) return theme;
            return {
              ...theme,
              cards: {
                ...theme.cards,
                [id]: { ...existing, prAlert: !existing.prAlert },
              },
            };
          }),
        );
      },

      setCardPrAlert: (id, on) => {
        set((state) => ({
          themes: state.themes.map((theme) => {
            const existing = theme.cards[id];
            if (!existing || existing.prAlert === on) return theme;
            return {
              ...theme,
              cards: {
                ...theme.cards,
                [id]: { ...existing, prAlert: on },
              },
            };
          }),
        }));
      },

      commitPokerResults: (results) => {
        const durations = new Map(results.map((item) => [item.id, item.duration]));
        set((state) => ({
          themes: state.themes.map((theme) => {
            const cards = { ...theme.cards };
            for (const [id, duration] of durations) {
              const existing = cards[id];
              if (!existing) continue;
              cards[id] = { ...existing, duration };
            }
            const planning = theme.order.planning.filter((id) => cards[id]);
            const todo = sortIdsByUrgency(cards, [
              ...planning,
              ...theme.order.todo.filter((id) => !planning.includes(id)),
            ]);
            return {
              ...theme,
              cards,
              order: {
                ...theme.order,
                planning: [],
                todo,
              },
            };
          }),
        }));
      },

      deleteCard: (id) => {
        set((state) =>
          withActive(state, (theme) => {
            const cards = Object.fromEntries(
              Object.entries(theme.cards)
                .filter(([cardId]) => cardId !== id)
                .map(([cardId, existing]) => [
                  cardId,
                  {
                    ...existing,
                    blockedBy: existing.blockedBy.filter((other) => other !== id),
                  },
                ]),
            );
            const order = { ...theme.order };
            for (const columnId of COLUMN_IDS) {
              order[columnId] = order[columnId].filter((cardId) => cardId !== id);
            }
            return { ...theme, cards, order };
          }),
        );
      },

      moveCard: (activeId, overId) => {
        if (activeId === overId) return;
        const theme = selectActiveTheme(get());
        const { order } = theme;
        const from = findColumnOf(order, activeId);
        const overColumn = parseColumnId(overId);
        const to = overColumn ?? findColumnOf(order, overId);
        if (!from || !to) return;

        if (from === to) {
          if (from === "review") return;
          const ids = order[from];
          const oldIndex = ids.indexOf(activeId);
          const newIndex = overColumn ? ids.length - 1 : ids.indexOf(overId);
          if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;
          set((state) =>
            withActive(state, (current) => ({
              ...current,
              order: { ...current.order, [from]: arrayMove(ids, oldIndex, newIndex) },
            })),
          );
          return;
        }

        const fromIds = order[from].filter((id) => id !== activeId);
        const toIds = order[to].filter((id) => id !== activeId);
        const insertAt =
          to === "review" || overColumn
            ? toIds.length
            : Math.max(toIds.indexOf(overId), 0);
        toIds.splice(insertAt, 0, activeId);
        set((state) =>
          withActive(state, (current) => ({
            ...current,
            order: { ...current.order, [from]: fromIds, [to]: toIds },
          })),
        );
      },

      sendCardTo: (cardId, columnId) => {
        const theme = selectActiveTheme(get());
        const from = findColumnOf(theme.order, cardId);
        if (!from || from === columnId) return false;
        set((state) =>
          withActive(state, (current) => {
            const fromIds = current.order[from].filter((id) => id !== cardId);
            const destIds = current.order[columnId].filter((id) => id !== cardId);
            const toIds =
              columnId === "review" ? [...destIds, cardId] : [cardId, ...destIds];
            const next: Theme = {
              ...current,
              order: {
                ...current.order,
                [from]: fromIds,
                [columnId]: toIds,
              },
            };
            return columnId === "review"
              ? sortThemeColumn(next, from)
              : sortThemeColumn(sortThemeColumn(next, from), columnId);
          }),
        );
        return true;
      },

      ingestReviewCard: (incoming) => {
        const card = normalizeCard(incoming);
        if (!card) return;
        set((state) => {
          const queued = state.themes.some((theme) =>
            theme.order.review.includes(card.id),
          );
          const themes = state.themes.map((theme) => {
            const inReview = theme.order.review.includes(card.id);
            if (!theme.cards[card.id] && !inReview) return theme;
            const order = { ...theme.order };
            for (const columnId of COLUMN_IDS) {
              if (columnId === "review" && inReview) continue;
              order[columnId] = order[columnId].filter((id) => id !== card.id);
            }
            return {
              ...theme,
              cards: { ...theme.cards, [card.id]: { ...card } },
              order,
            };
          });
          if (queued) return { themes };
          const active =
            themes.find((theme) => theme.id === state.activeThemeId) ?? themes[0];
          if (!active) return state;
          const nextActive: Theme = {
            ...active,
            cards: { ...active.cards, [card.id]: card },
            order: {
              ...active.order,
              review: [...active.order.review.filter((id) => id !== card.id), card.id],
            },
          };
          return {
            themes: themes.map((theme) => (theme.id === nextActive.id ? nextActive : theme)),
          };
        });
      },

      applyReviewLeave: (cardId, dest) => {
        set((state) => ({
          themes: state.themes.map((theme) => {
            if (!theme.cards[cardId]) return theme;
            const from = findColumnOf(theme.order, cardId);
            if (from !== "review") return theme;
            if (!dest) {
              const { [cardId]: _removed, ...cards } = theme.cards;
              return {
                ...theme,
                cards,
                order: {
                  ...theme.order,
                  review: theme.order.review.filter((id) => id !== cardId),
                },
              };
            }
            const reviewIds = theme.order.review.filter((id) => id !== cardId);
            const destIds = [
              cardId,
              ...theme.order[dest].filter((id) => id !== cardId),
            ];
            return sortThemeColumn(
              {
                ...theme,
                order: {
                  ...theme.order,
                  review: reviewIds,
                  [dest]: destIds,
                },
              },
              dest,
            );
          }),
        }));
      },

      applyUrgencySort: () => {
        set((state) => withActive(state, sortThemeByUrgency));
      },

      setThemeNotice: (notice) => {
        set((state) =>
          withActive(state, (theme) =>
            theme.notice === notice ? theme : { ...theme, notice },
          ),
        );
      },

      replaceBoard: (themes, activeThemeId) => {
        const parsed = parseBoardPayload({ themes, activeThemeId });
        if (!parsed) return;
        set(parsed);
      },

      applyCard: (incoming) => {
        const card = normalizeCard(incoming);
        if (!card) return;
        set((state) => ({
          themes: state.themes.map((theme) => {
            if (!theme.cards[card.id]) return theme;
            return {
              ...theme,
              cards: { ...theme.cards, [card.id]: { ...theme.cards[card.id], ...card } },
            };
          }),
        }));
      },
    }),
    {
      name: "ledger-kanban-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        themes: state.themes,
        activeThemeId: state.activeThemeId,
      }),
      merge: (persisted, current) => {
        const parsed = parseBoardPayload(persisted);
        return parsed ? { ...current, ...parsed } : current;
      },
    },
  ),
);
