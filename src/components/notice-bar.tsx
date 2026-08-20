import { ChevronDown, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { selectActiveTheme, useBoardStore } from "@/lib/kanban";
import { cn } from "@/lib/utils";

export function NoticeBar() {
  const themeId = useBoardStore((state) => selectActiveTheme(state).id);
  const notice = useBoardStore((state) => selectActiveTheme(state).notice);
  const setThemeNotice = useBoardStore((state) => state.setThemeNotice);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(notice);

  useEffect(() => {
    setOpen(false);
    setDraft((current) => (current === notice ? current : notice));
  }, [themeId]);

  useEffect(() => {
    if (open) return;
    setDraft((current) => (current === notice ? current : notice));
  }, [open, notice]);

  useEffect(() => {
    if (!open) return;
    if (draft === notice) return;
    const timer = window.setTimeout(() => {
      setThemeNotice(draft);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [open, draft, notice, setThemeNotice]);

  const hasText = notice.trim().length > 0;
  const preview = notice.trim().split("\n")[0] ?? "";

  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-md bg-surface shadow-border",
        hasText && "notice-unread",
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="theme-notice"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 w-full items-center gap-2 px-3 text-left"
      >
        <span className="relative grid size-7 shrink-0 place-items-center">
          <Megaphone className="size-4 text-muted" aria-hidden="true" />
          {hasText ? (
            <span className="notice-unread-dot absolute top-0.5 right-0.5 size-2 rounded-full bg-urgent" />
          ) : null}
        </span>
        <span
          className={cn(
            "shrink-0 text-xs font-medium tracking-wide uppercase",
            hasText ? "text-urgent" : "text-subtle",
          )}
        >
          Notice
        </span>
        {!open ? (
          <span className="min-w-0 flex-1 truncate text-sm text-muted">
            {hasText ? preview : "Add a note for this tab"}
          </span>
        ) : (
          <span className="min-w-0 flex-1" />
        )}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-subtle transition-transform duration-150",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div id="theme-notice" className="px-3 pb-3">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a note for this tab. Any text here keeps the cue visible."
            maxLength={2000}
          />
        </div>
      ) : null}
    </div>
  );
}
