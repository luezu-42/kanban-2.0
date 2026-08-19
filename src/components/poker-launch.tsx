import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { collectPlanningCards, useBoardStore } from "@/lib/kanban";
import { cn } from "@/lib/utils";

type PokerLaunchProps = {
  onStart: () => void;
};

const FACES = ["1", "2", "3", "5", "8", "13"] as const;

export function PokerLaunch({ onStart }: PokerLaunchProps) {
  const waiting = useBoardStore((state) => collectPlanningCards(state.themes).length);
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="overflow-hidden rounded-xl bg-bg-elevated shadow-border">
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-planning" aria-hidden="true" />
            <p className="text-xs font-medium tracking-[0.18em] text-subtle uppercase">
              Planning poker
            </p>
          </div>
          <h2 className="font-display mt-2 text-2xl tracking-tight text-fg sm:text-3xl">
            Sit at the table
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            One shared room. Hidden votes, then a duration for every card in Planning.
          </p>
          <p className="mt-3 font-mono text-xs tracking-wide text-subtle tabular-nums">
            {waiting === 0
              ? "Nothing in Planning yet"
              : `${waiting} ${waiting === 1 ? "card" : "cards"} waiting`}
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 sm:items-end">
          <div className="flex" aria-hidden="true">
            {FACES.map((face, index) => (
              <span
                key={face}
                className="grid size-11 -ml-2 place-items-center rounded-md bg-surface font-display text-sm text-fg shadow-card first:ml-0"
                style={{ transform: `rotate(${(index - 2.5) * 4}deg)` }}
              >
                {face}
              </span>
            ))}
          </div>
          <Button type="button" onClick={() => setConfirming(true)} className="h-11 px-5">
            Start planning poker
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start planning poker?</AlertDialogTitle>
            <AlertDialogDescription>
              {waiting === 0
                ? "The room will open now. Planning cards from every tab will land on the table as they appear."
                : `This opens the live room and loads ${waiting} ${waiting === 1 ? "card" : "cards"} from Planning across every tab. Votes stay hidden until everyone has played.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants())}
              onClick={onStart}
            >
              Enter room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
