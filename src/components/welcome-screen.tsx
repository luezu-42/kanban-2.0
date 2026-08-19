import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfileStore } from "@/lib/profile";
import { saveProfile } from "@/lib/workspace";

export function WelcomeScreen() {
  const setName = useProfileStore((state) => state.setName);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = value.trim();
    if (!next || busy) return;
    setBusy(true);
    try {
      const saved = await saveProfile({
        data: { deviceId: useProfileStore.getState().deviceId, name: next },
      });
      setName(saved.name ?? next);
    } catch {
      setName(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4 text-fg">
      <form onSubmit={(event) => void handleSubmit(event)} className="w-full max-w-md">
        <p className="text-xs font-medium tracking-[0.18em] text-subtle uppercase">
          Ledger
        </p>
        <h1 className="font-display mt-3 text-4xl leading-none tracking-tight sm:text-5xl">
          What should we call you?
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
          Just a name for this device. We will not ask again.
        </p>

        <div className="mt-8 grid gap-2">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Your name"
            autoFocus
            required
            maxLength={40}
            autoComplete="name"
          />
        </div>

        <Button type="submit" className="mt-6 w-full" disabled={!value.trim() || busy}>
          Continue
        </Button>
      </form>
    </main>
  );
}

export function WelcomeSkeleton() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="h-3 w-16 animate-pulse rounded-sm bg-surface" />
        <div className="mt-4 h-10 w-64 animate-pulse rounded-md bg-surface" />
        <div className="mt-4 h-4 w-48 animate-pulse rounded-sm bg-surface" />
        <div className="mt-8 h-11 w-full animate-pulse rounded-md bg-surface" />
      </div>
    </main>
  );
}
