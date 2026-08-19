import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { BoardSync } from "@/components/board-sync";
import { KanbanBoard } from "@/components/kanban-board";
import { PlanningPoker } from "@/components/planning-poker";
import { PokerLaunch } from "@/components/poker-launch";
import { SiteHeader } from "@/components/site-header";
import { SyncBanner } from "@/components/sync-banner";
import { WelcomeScreen, WelcomeSkeleton } from "@/components/welcome-screen";
import { errorMessage } from "@/lib/errors";
import { useBoardStore } from "@/lib/kanban";
import { type PokerCard, planningDeck } from "@/lib/poker";
import { useProfileStore } from "@/lib/profile";
import { getUnlockToken } from "@/lib/unlock";
import { checkUnlock, loadProfile } from "@/lib/workspace";
import { ReviewLiveProvider } from "@/lib/review-live";

export const Route = createFileRoute("/")({ component: Home });

type PokerSession = {
  cards: PokerCard[];
};

function Home() {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [bootError, setBootError] = useState("");
  const [retry, setRetry] = useState(0);
  const [poker, setPoker] = useState<PokerSession | null>(null);
  const name = useProfileStore((state) => state.name);
  const setName = useProfileStore((state) => state.setName);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setBootError("");
      await Promise.resolve(useProfileStore.persist.rehydrate());
      const token = getUnlockToken();
      let ok = false;
      if (token) {
        try {
          const checked = await checkUnlock({ data: { token } });
          ok = checked.ok;
        } catch (error) {
          if (!cancelled) {
            setBootError(
              errorMessage(error, "Could not reach the workspace. Try again."),
            );
            setReady(true);
          }
          return;
        }
      }
      if (ok) {
        const profile = useProfileStore.getState();
        if (!profile.name && profile.deviceId) {
          try {
            const remote = await loadProfile({
              data: { deviceId: profile.deviceId, token },
            });
            if (!cancelled && remote.name) setName(remote.name);
          } catch {
            // Keep the local name if the profile cannot load.
          }
        }
      }
      if (!cancelled) {
        setUnlocked(ok);
        setReady(true);
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [setName, retry]);

  function startPoker() {
    const cards = planningDeck(useBoardStore.getState().themes);
    setPoker({ cards });
  }

  const exitPoker = useCallback(() => setPoker(null), []);

  if (!ready) return <WelcomeSkeleton />;
  if (bootError) {
    return (
      <WelcomeScreen
        needName={false}
        requirePassword={false}
        bootError={bootError}
        onRetry={() => {
          setReady(false);
          setRetry((value) => value + 1);
        }}
        onUnlocked={() => setUnlocked(true)}
      />
    );
  }
  if (!unlocked) {
    return (
      <WelcomeScreen
        needName={!name}
        requirePassword
        onUnlocked={() => setUnlocked(true)}
      />
    );
  }
  if (!name) {
    return (
      <WelcomeScreen
        needName
        requirePassword={false}
        onUnlocked={() => setUnlocked(true)}
      />
    );
  }

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <ReviewLiveProvider>
      <BoardSync />
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <SiteHeader />
        <SyncBanner />
        {poker ? (
          <PlanningPoker
            name={name}
            initialCards={poker.cards}
            onExit={exitPoker}
          />
        ) : (
          <>
            <KanbanBoard />
            <PokerLaunch onStart={startPoker} />
            <p className="text-center text-xs text-subtle">
              Saved to the shared workspace.
            </p>
          </>
        )}
      </div>
      </ReviewLiveProvider>
    </main>
  );
}
