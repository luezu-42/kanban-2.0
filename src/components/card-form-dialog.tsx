import { Ban, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { BlockPicker } from "@/components/block-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Card, ColumnId } from "@/lib/kanban";
import { COLUMNS } from "@/lib/kanban";
import { cn } from "@/lib/utils";

export type CardFormState =
  | { mode: "create"; columnId: ColumnId }
  | { mode: "edit"; card: Card };

export type CardFormValues = {
  title: string;
  description: string;
  blocked: boolean;
  urgent: boolean;
  blockedBy: string[];
};

type Candidate = Card & { columnId: ColumnId };

type CardFormDialogProps = {
  open: boolean;
  state: CardFormState | null;
  candidates: Candidate[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CardFormValues) => void;
};

export function CardFormDialog({
  open,
  state,
  candidates,
  onOpenChange,
  onSubmit,
}: CardFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [blockedBy, setBlockedBy] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !state) return;
    if (state.mode === "edit") {
      setTitle(state.card.title);
      setDescription(state.card.description);
      setBlocked(state.card.blocked);
      setUrgent(state.card.urgent);
      setBlockedBy(state.card.blockedBy);
    } else {
      setTitle("");
      setDescription("");
      setBlocked(false);
      setUrgent(false);
      setBlockedBy([]);
    }
  }, [open, state]);

  const columnTitle =
    state?.mode === "create"
      ? COLUMNS.find((column) => column.id === state.columnId)?.title
      : null;
  const excludeId = state?.mode === "edit" ? state.card.id : "";
  const options = candidates.filter((card) => card.id !== excludeId);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;
    onSubmit({
      title: nextTitle,
      description: description.trim(),
      blocked,
      urgent,
      blockedBy: blocked ? blockedBy : [],
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>
              {state?.mode === "edit" ? "Edit card" : "New card"}
            </DialogTitle>
            <DialogDescription>
              {state?.mode === "edit"
                ? "Update the title, notes, and flags. Changes save to this device."
                : `Add a card to ${columnTitle ?? "the board"}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="card-title">Title</Label>
              <Input
                id="card-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What needs to happen?"
                autoFocus
                required
                maxLength={120}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="card-description">Description</Label>
              <Textarea
                id="card-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional context, links, or notes"
                maxLength={600}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
            </div>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium text-fg">Flags</legend>
              <div className="grid grid-cols-2 gap-2">
                <FlagToggle
                  pressed={urgent}
                  onPressedChange={setUrgent}
                  icon={TriangleAlert}
                  label="Urgent"
                  tone="urgent"
                />
                <FlagToggle
                  pressed={blocked}
                  onPressedChange={(next) => {
                    setBlocked(next);
                    if (!next) setBlockedBy([]);
                  }}
                  icon={Ban}
                  label="Blocked"
                  tone="blocked"
                />
              </div>
            </fieldset>
            {blocked ? (
              <div className="grid gap-2">
                <Label>Blocked by</Label>
                <BlockPicker
                  candidates={options}
                  selected={blockedBy}
                  onChange={setBlockedBy}
                />
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {state?.mode === "edit" ? "Save changes" : "Add card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FlagToggle({
  pressed,
  onPressedChange,
  icon: Icon,
  label,
  tone,
}: {
  pressed: boolean;
  onPressedChange: (next: boolean) => void;
  icon: typeof TriangleAlert;
  label: string;
  tone: "urgent" | "blocked";
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium shadow-border transition-[color,background-color,box-shadow] duration-150",
        pressed && tone === "urgent" && "bg-urgent/15 text-urgent shadow-none",
        pressed && tone === "blocked" && "bg-danger/15 text-danger shadow-none",
        !pressed && "bg-bg text-muted hover:text-fg",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}