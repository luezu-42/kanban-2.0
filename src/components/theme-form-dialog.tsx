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

export type ThemeFormState =
  | { mode: "create" }
  | { mode: "rename"; id: string; name: string };

type ThemeFormDialogProps = {
  open: boolean;
  state: ThemeFormState | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
};

export function ThemeFormDialog({
  open,
  state,
  onOpenChange,
  onSubmit,
}: ThemeFormDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open || !state) return;
    setName(state.mode === "rename" ? state.name : "");
  }, [open, state]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = name.trim();
    if (!next) return;
    onSubmit(next);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>
              {state?.mode === "rename" ? "Rename theme" : "New theme"}
            </DialogTitle>
            <DialogDescription>
              {state?.mode === "rename"
                ? "This name is only a label. Cards in the theme stay put."
                : "Each theme has its own Backlog, Planning, To Do, Doing, Review, and Done columns."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="theme-name">Name</Label>
            <Input
              id="theme-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Product, Personal, Studio"
              autoFocus
              required
              maxLength={40}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {state?.mode === "rename" ? "Save name" : "Add theme"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
