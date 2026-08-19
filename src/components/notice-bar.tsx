import { ChevronDown, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { selectActiveTheme, useBoardStore } from "@/lib/kanban";
import { useProfileStore } from "@/lib/profile";
import { cn } from "@/lib/utils";

export function NoticeBar() {
  const theme = useBoardStore(selectActiveTheme);
  const setThemeNotice = useBoardStore((state) => state.setThemeNotice);
  const lastRead = useProfileStore((state) => state.noticeRead[theme.id] ?? "");
  const markNoticeRead = useProfileStore((state) => state.markNoticeRead);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(theme.notice);

  useEffect(() => {
    setOpen(false);
    setDraft(theme.notice);
  }, [theme.id]);

  useEffect(() => {
    if (!open) setDraft(theme.notice);
  }, [open, theme.notice]);

  useEffect(() => {
    if (!open) return;
    markNoticeRead(theme.id, theme.notice);
  }, [open, theme.id, theme.notice, markNoticeRead]);

  useEffect(() => {
    if (draft === theme.notice) return;
    const timer = window.setTimeout(() => {
      setThemeNotice(draft);
      markNoticeRead(theme.id, draft);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [draft, theme.id, theme.notice, setThemeNotice, markNoticeRead]);

  const hasText = theme.notice.trim().length > 0;
  const unread = hasText && !open && lastRead !== theme.notice;
  const preview = theme.notice.trim().split("\n")[0] ?? "";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md bg-surface shadow-border",
        unread && "notice-unread",
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
          {unread ? (
            <span className="notice-unread-dot absolute top-0.5 right-0.5 size-2 rounded-full bg-urgent" />
          ) : null}
        </span>
        <span
          className={cn(
            "shrink-0 text-xs font-medium tracking-wide uppercase",
            unread ? "text-urgent" : "text-subtle",
          )}
        >
          {unread ? "Unread" : "Notice"}
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
            placeholder="Write a note for this tab. When this is closed, a cue will ask people to read it."
            maxLength={2000}
          />
        </div>
      ) : null}
    </div>
  );
}
