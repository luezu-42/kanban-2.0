import { Download, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ThemeFormDialog, type ThemeFormState } from "@/components/theme-form-dialog";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type Theme,
  selectActiveTheme,
  themeCardCount,
  useBoardStore,
} from "@/lib/kanban";
import { cn } from "@/lib/utils";
import { downloadDoneCsv } from "@/lib/done-csv";

export function ThemeTabs() {
  const themes = useBoardStore((state) => state.themes);
  const activeThemeId = useBoardStore((state) => state.activeThemeId);
  const setActiveTheme = useBoardStore((state) => state.setActiveTheme);
  const addTheme = useBoardStore((state) => state.addTheme);
  const renameTheme = useBoardStore((state) => state.renameTheme);
  const deleteTheme = useBoardStore((state) => state.deleteTheme);

  const [form, setForm] = useState<ThemeFormState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Theme | null>(null);

  function handleFormSubmit(name: string) {
    if (!form) return;
    if (form.mode === "create") {
      addTheme(name);
      toast.success("Theme added");
      return;
    }
    renameTheme(form.id, name);
    toast.success("Theme renamed");
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const name = pendingDelete.name;
    const removed = deleteTheme(pendingDelete.id);
    setPendingDelete(null);
    if (!removed) {
      toast.error("Keep at least one theme");
      return;
    }
    toast(`“${name}” deleted`);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <div
          role="tablist"
          aria-label="Themes"
          className="board-scroller flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
        >
          {themes.map((theme) => {
            const selected = theme.id === activeThemeId;
            const count = themeCardCount(theme);
            return (
              <div
                key={theme.id}
                className={cn(
                  "flex shrink-0 items-center rounded-lg transition-[background-color,color,box-shadow] duration-150",
                  selected
                    ? "bg-surface text-fg shadow-border"
                    : "text-muted hover:bg-surface/60 hover:text-fg",
                )}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  id={`theme-tab-${theme.id}`}
                  onClick={() => setActiveTheme(theme.id)}
                  className="h-11 whitespace-nowrap px-3 text-left text-sm font-medium"
                >
                  <span>{theme.name}</span>
                  <span className="ml-2 font-mono text-xs text-subtle tabular-nums">
                    {count}
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className={cn(
                        "relative mr-1 size-9 text-subtle hover:text-fg after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2",
                        !selected && "opacity-70",
                      )}
                      aria-label={`Theme actions for ${theme.name}`}
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onSelect={() =>
                        setForm({ mode: "rename", id: theme.id, name: theme.name })
                      }
                    >
                      <Pencil className="size-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        const count = downloadDoneCsv(theme);
                        if (!count) {
                          toast.error("No cards in Done to download.");
                          return;
                        }
                        toast.success(`Downloaded ${count} Done ${count === 1 ? "card" : "cards"}.`);
                      }}
                    >
                      <Download className="size-4" />
                      Download Done CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={themes.length <= 1}
                      onSelect={() => {
                        if (themes.length <= 1) return;
                        setPendingDelete(theme);
                      }}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="shrink-0"
          onClick={() => setForm({ mode: "create" })}
          aria-label="Add theme"
        >
          <Plus />
        </Button>
      </div>

      <ThemeFormDialog
        open={form !== null}
        state={form}
        onOpenChange={(open) => {
          if (!open) setForm(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this theme?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? (
                <>
                  Are you sure you want to delete “{pendingDelete.name}”? All{" "}
                  {themeCardCount(pendingDelete)}{" "}
                  {themeCardCount(pendingDelete) === 1 ? "card" : "cards"} in this
                  theme will be permanently removed. This cannot be undone.
                </>
              ) : (
                "Are you sure you want to delete this theme? All of its cards will be permanently removed."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep theme</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete theme
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ThemeTabsSkeleton() {
  return (
    <div className="flex h-11 gap-2">
      <div className="h-11 w-28 animate-pulse rounded-lg bg-surface" />
      <div className="h-11 w-24 animate-pulse rounded-lg bg-surface/60" />
    </div>
  );
}

export function useActiveThemeName() {
  return useBoardStore((state) => selectActiveTheme(state).name);
}
