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
import {
  type Card,
  type CardLinkKind,
  cardLinkKey,
  parseExternalUrl,
} from "@/lib/kanban";

export type CardLinkState = {
  card: Card;
  kind: CardLinkKind;
};

type CardLinkDialogProps = {
  open: boolean;
  state: CardLinkState | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string) => void;
};

const COPY: Record<
  CardLinkKind,
  { title: string; description: string; label: string; placeholder: string }
> = {
  jira: {
    title: "Jira link",
    description: "Paste the issue URL. It opens from the Jira button under this card.",
    label: "Jira URL",
    placeholder: "https://your-team.atlassian.net/browse/ABC-12",
  },
  pr: {
    title: "Pull request",
    description: "Paste the PR URL. It opens from the PR button under this card.",
    label: "PR URL",
    placeholder: "https://github.com/org/repo/pull/12",
  },
};

export function CardLinkDialog({
  open,
  state,
  onOpenChange,
  onSubmit,
}: CardLinkDialogProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !state) return;
    setValue(state.card[cardLinkKey(state.kind)]);
    setError("");
  }, [open, state]);

  const copy = state ? COPY[state.kind] : COPY.jira;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = parseExternalUrl(value);
    if (parsed === null) {
      setError("Enter a valid http or https link.");
      return;
    }
    onSubmit(parsed);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="card-link-url">{copy.label}</Label>
            <Input
              id="card-link-url"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setError("");
              }}
              placeholder={copy.placeholder}
              autoFocus
            />
            {error ? <p className="text-xs text-danger">{error}</p> : null}
          </div>

          <DialogFooter>
            {state?.card[cardLinkKey(state.kind)] ? (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto"
                onClick={() => {
                  onSubmit("");
                  onOpenChange(false);
                }}
              >
                Remove
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!value.trim()}>
              Save link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
