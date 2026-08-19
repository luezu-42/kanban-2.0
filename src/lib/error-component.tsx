import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";

export function AppErrorComponent({ error, reset }: ErrorComponentProps) {
  function reload() {
    if (reset) {
      reset();
      return;
    }
    window.location.reload();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <span className="text-danger" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="font-display text-2xl font-medium tracking-tight">
        Something went wrong
      </h1>
      <p className="max-w-md text-sm break-words text-muted">
        {errorMessage(error, error.message || "An unexpected error occurred.")}
      </p>
      <Button type="button" className="mt-3" onClick={reload}>
        Try again
      </Button>
    </main>
  );
}
