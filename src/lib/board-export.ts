import { COLUMN_IDS, columnMeta, type Theme } from "@/lib/kanban";
import { stripWhiteboardDataUrls } from "@/lib/whiteboard";
import { triggerDownload } from "@/lib/errors";

function csvCell(value: string) {
  const text = value.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function slug(name: string) {
  return (name.trim() || "ledger").replace(/[^\w-]+/g, "-").slice(0, 40);
}

export function downloadBoardJson(themes: Theme[], activeThemeId: string) {
  const payload = {
    activeThemeId,
    themes: themes.map((theme) => ({
      id: theme.id,
      name: theme.name,
      notice: theme.notice,
      order: theme.order,
      whiteboard: stripWhiteboardDataUrls(theme.whiteboard),
      cards: Object.fromEntries(
        Object.values(theme.cards).map((card) => [
          card.id,
          {
            ...card,
            images: Object.fromEntries(
              Object.entries(card.images).map(([id, src]) => [
                id,
                src.startsWith("data:") ? `asset:${id}` : src,
              ]),
            ),
          },
        ]),
      ),
    })),
  };
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: "application/json;charset=utf-8",
  });
  triggerDownload(blob, `${slug("ledger-board")}.json`);
}

export function downloadThemeCsv(theme: Theme) {
  const header = [
    "column",
    "title",
    "description",
    "assignee",
    "urgent",
    "blocked",
    "waiting",
    "waiting_note",
    "duration",
    "jira",
    "pr",
  ];
  const rows = [header.join(",")];
  for (const columnId of COLUMN_IDS) {
    const column = columnMeta(columnId).title;
    for (const id of theme.order[columnId]) {
      const card = theme.cards[id];
      if (!card) continue;
      rows.push(
        [
          column,
          card.title,
          card.description,
          card.assignee,
          card.urgent ? "yes" : "",
          card.blocked ? "yes" : "",
          card.waiting ? "yes" : "",
          card.waitingNote,
          card.duration == null ? "" : String(card.duration),
          card.jiraUrl,
          card.prUrl,
        ]
          .map(csvCell)
          .join(","),
      );
    }
  }
  if (rows.length <= 1) return 0;
  const blob = new Blob([`\uFEFF${rows.join("\n")}`], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, `${slug(theme.name)}.csv`);
  return rows.length - 1;
}
