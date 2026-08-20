import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BoardSync } from "@/components/board-sync";
import { KanbanBoard } from "@/components/kanban-board";
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

const PlanningPoker = lazy(() =>
  import("@/components/planning-poker").then((mod) => ({ default: mod.PlanningPoker })),
);

type PokerSession = {
  cards: PokerCard[];
};

export function HomePage() {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [bootError, setBootError] = useState("");
  const [retry, setRetry] = useState(0);
  const [poker, setPoker] = useState<PokerSession | null>(null);
  const [canvasOpen, setCanvasOpen] = useState(false);
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
    <main
      className={cn(
        "min-h-dvh bg-bg text-fg",
        (poker || canvasOpen) && "lg:h-dvh lg:overflow-hidden",
      )}
    >
      <ReviewLiveProvider>
      <BoardSync />
      <div className="mx-auto flex h-full min-h-0 w-full flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:gap-4 lg:px-8 lg:py-5 wide:px-10 qhd:px-14">
        <SiteHeader />
        <SyncBanner />
        {poker ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-bg-elevated" />}>
              <PlanningPoker
                name={name}
                initialCards={poker.cards}
                onExit={exitPoker}
              />
            </Suspense>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col">
              <KanbanBoard
                canvasOpen={canvasOpen}
                onCanvasOpenChange={setCanvasOpen}
              />
            </div>
            {canvasOpen ? null : (
              <>
                <PokerLaunch onStart={startPoker} />
                <p className="shrink-0 text-center text-xs text-subtle lg:hidden">
                  Saved to the shared workspace.
                </p>
              </>
            )}
          </>
        )}
      </div>
      </ReviewLiveProvider>
    </main>
  );
}
