import { COLUMN_IDS, type Card, type ColumnId, type Theme } from "@/lib/kanban";

export type CardHit = {
  card: Card;
  themeId: string;
  themeName: string;
  columnId: ColumnId;
};

export function searchCards(themes: Theme[], query: string): CardHit[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const hits: CardHit[] = [];
  for (const theme of themes) {
    for (const columnId of COLUMN_IDS) {
      for (const id of theme.order[columnId]) {
        const card = theme.cards[id];
        if (!card) continue;
        if (
          card.title.toLowerCase().includes(needle) ||
          card.description.toLowerCase().includes(needle) ||
          card.assignee.toLowerCase().includes(needle) ||
          card.waitingNote.toLowerCase().includes(needle)
        ) {
          hits.push({
            card,
            themeId: theme.id,
            themeName: theme.name,
            columnId,
          });
        }
        if (hits.length >= 40) return hits;
      }
    }
  }
  return hits;
}
