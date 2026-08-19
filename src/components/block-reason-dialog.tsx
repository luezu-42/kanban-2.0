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
import type { Card, ColumnId } from "@/lib/kanban";

type Candidate = Card & { columnId: ColumnId };

type BlockReasonDialogProps = {
  open: boolean;
  card: Card | null;
  candidates: Candidate[];
  onOpenChange: (open: boolean) => void;
  onConfirm: (blockedBy: string[]) => void;
};

export function BlockReasonDialog({
  open,
  card,
  candidates,
  onOpenChange,
  onConfirm,
}: BlockReasonDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !card) return;
    setSelected(card.blockedBy);
  }, [open, card]);

  const options = candidates.filter((item) => item.id !== card?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as blocked?</DialogTitle>
          <DialogDescription>
            {card
              ? `Optionally link what is blocking “${card.title}”. You can skip this.`
              : "Optionally link the cards that are blocking this work."}
          </DialogDescription>
        </DialogHeader>
        <BlockPicker candidates={options} selected={selected} onChange={setSelected} />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onConfirm(selected)}>
            Mark blocked
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
