import { Hourglass } from "lucide-react";
import { useEffect, useState } from "react";
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
import type { Card } from "@/lib/kanban";
import { WAITING_NOTE_MAX } from "@/lib/kanban";

type WaitingNoteDialogProps = {
  open: boolean;
  card: Card | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note: string) => void;
  onClear: () => void;
};

export function WaitingNoteDialog({
  open,
  card,
  onOpenChange,
  onConfirm,
  onClear,
}: WaitingNoteDialogProps) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open || !card) return;
    setNote(card.waitingNote);
  }, [open, card]);

  const next = note.trim();
  const editing = Boolean(card?.waiting);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!next) return;
    onConfirm(next);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hourglass className="size-4 text-waiting" />
              {editing ? "Update waiting note" : "Mark as waiting?"}
            </DialogTitle>
            <DialogDescription>
              {card
                ? `This note shows on “${card.title}”, under the tags.`
                : "This note shows on the card, under the tags."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="waiting-note">Waiting on</Label>
            <Input
              id="waiting-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Design review, legal, a reply…"
              maxLength={WAITING_NOTE_MAX}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {editing ? (
              <Button type="button" variant="ghost" onClick={onClear}>
                Clear waiting
              </Button>
            ) : null}
            <Button type="submit" disabled={!next}>
              {editing ? "Save note" : "Mark waiting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
