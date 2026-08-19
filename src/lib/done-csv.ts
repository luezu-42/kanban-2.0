import type { Theme } from "@/lib/kanban";
import { triggerDownload } from "@/lib/errors";

const HEADERS = [
  "title",
  "description",
  "details",
  "jira",
  "pr",
  "assignee",
] as const;

function csvCell(value: string) {
  const text = value.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function fileName(themeName: string) {
  const name = themeName.trim() || "theme";
  return `${name}.csv`;
}

export function doneCardsCsv(theme: Theme) {
  const rows = theme.order.done
    .map((id) => theme.cards[id])
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
    .map((card) =>
      [
        card.title,
        card.description,
        card.details,
        card.jiraUrl,
        card.prUrl,
        card.assignee,
      ]
        .map(csvCell)
        .join(","),
    );
  return [HEADERS.join(","), ...rows].join("\n");
}

export function downloadDoneCsv(theme: Theme) {
  const count = theme.order.done.filter((id) => theme.cards[id]).length;
  if (!count) return 0;
  const csv = doneCardsCsv(theme);
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, fileName(theme.name));
  return count;
}
