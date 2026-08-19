import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorMessage } from "@/lib/errors";
import { getUnlockToken, setUnlockToken } from "@/lib/unlock";
import { useProfileStore } from "@/lib/profile";
import { saveProfile, unlockWorkspace } from "@/lib/workspace";

export function WelcomeScreen({
  needName,
  requirePassword,
  bootError,
  onUnlocked,
  onRetry,
}: {
  needName: boolean;
  requirePassword: boolean;
  bootError?: string;
  onUnlocked: () => void;
  onRetry?: () => void;
}) {
  const setName = useProfileStore((state) => state.setName);
  const [name, setNameValue] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (bootError) {
      onRetry?.();
      return;
    }
    const nextName = name.trim();
    if (needName && !nextName) return;
    if (requirePassword && !password) return;
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      let token = getUnlockToken();
      if (requirePassword) {
        const unlocked = await unlockWorkspace({ data: { password } });
        if (!unlocked.ok) {
          setError("Wrong password.");
          setPassword("");
          return;
        }
        token = unlocked.token;
        setUnlockToken(token);
      }
      if (needName) {
        const saved = await saveProfile({
          data: {
            deviceId: useProfileStore.getState().deviceId,
            name: nextName,
            token,
          },
        });
        setName(saved.name ?? nextName);
      }
      onUnlocked();
    } catch (caught) {
      setError(
        errorMessage(
          caught,
          requirePassword ? "Could not unlock the workspace." : "Could not save your name.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  const title = bootError
    ? "Could not open the board"
    : needName
      ? "Join the board"
      : "Unlock the board";

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4 text-fg">
      <form onSubmit={(event) => void handleSubmit(event)} className="w-full max-w-md">
        <p className="text-xs font-medium tracking-[0.18em] text-subtle uppercase">
          Ledger
        </p>
        <h1 className="font-display mt-3 text-4xl leading-none tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
          {bootError
            ? bootError
            : needName
              ? requirePassword
                ? "Enter your name and the shared workspace password."
                : "Just a name for this device. We will not ask again."
              : "This workspace is private. Enter the shared password to continue."}
        </p>

        {bootError ? (
          <Button type="submit" className="mt-6 w-full" disabled={busy}>
            Try again
          </Button>
        ) : (
          <>
        {needName ? (
          <div className="mt-8 grid gap-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setNameValue(event.target.value)}
              placeholder="Your name"
              autoFocus
              required
              maxLength={40}
              autoComplete="name"
            />
          </div>
        ) : null}

        {requirePassword ? (
          <div className={`${needName ? "mt-4" : "mt-8"} grid gap-2`}>
            <Label htmlFor="workspace-password">Password</Label>
            <Input
              id="workspace-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Shared password"
              autoFocus={!needName}
              required
              autoComplete="current-password"
            />
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-urgent">{error}</p> : null}

        <Button
          type="submit"
          className="mt-6 w-full"
          disabled={(needName && !name.trim()) || (requirePassword && !password) || busy}
        >
          Continue
        </Button>
          </>
        )}
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
