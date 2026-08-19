import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { boardSignature, useBoardStore } from "@/lib/kanban";
import { compactThemeImages } from "@/lib/markdown-image";
import { SYNC_RETRY_EVENT, errorMessage, isOffline } from "@/lib/errors";
import {
  clearWorkspaceSync,
  enqueueWorkspaceSync,
  subscribeSyncMessages,
} from "@/lib/sync-queue";
import { useSyncStatus } from "@/lib/sync-status";
import { getUnlockToken } from "@/lib/unlock";
import { loadWorkspace, saveWorkspace } from "@/lib/workspace";
import { stashWhiteboardImages } from "@/lib/whiteboard-persist";

function token() {
  return getUnlockToken();
}

function currentBoard() {
  const { themes, activeThemeId } = useBoardStore.getState();
  return { themes, activeThemeId };
}

export function BoardSync() {
  const ready = useRef(false);
  const applying = useRef(false);
  const dirty = useRef(false);
  const flushing = useRef(false);
  const saveTimer = useRef(0);
  const compacted = useRef(false);
  const hydrated = useRef(false);
  const lastApplied = useRef("");
  const announced = useRef(false);
  const setHealth = useSyncStatus((state) => state.setHealth);

  useEffect(() => {
    let cancelled = false;

    function markOk() {
      if (isOffline()) {
        setHealth(
          "offline",
          "You are offline. Edits stay on this device until you reconnect.",
        );
        return;
      }
      if (announced.current) {
        toast.success("Workspace saved");
        announced.current = false;
      }
      setHealth("ok");
    }

    function markFail(error: unknown, queued: boolean) {
      const message = errorMessage(
        error,
        queued
          ? "Could not save. The board is queued and will retry."
          : "Could not reach the workspace.",
      );
      setHealth(queued ? "queued" : "error", message);
      if (!announced.current) {
        announced.current = true;
        toast.error(message);
      }
    }

    async function flush() {
      if (applying.current || flushing.current) return;
      if (!token()) return;
      const latest = currentBoard();
      window.clearTimeout(saveTimer.current);
      flushing.current = true;
      const unlock = token();
      let queuedThemes = latest.themes;
      try {
        queuedThemes = await stashWhiteboardImages(latest.themes, unlock);
        await saveWorkspace({
          data: {
            themes: queuedThemes,
            activeThemeId: latest.activeThemeId,
            token: unlock,
          },
        });
        if (!cancelled) {
          dirty.current = false;
          lastApplied.current = boardSignature(latest.themes, latest.activeThemeId);
          void clearWorkspaceSync();
          markOk();
        }
      } catch (error) {
        if (!cancelled) {
          dirty.current = true;
          try {
            await enqueueWorkspaceSync({
              token: unlock,
              themes: queuedThemes,
              activeThemeId: latest.activeThemeId,
            });
            markFail(error, true);
          } catch (queueError) {
            markFail(queueError, false);
          }
        }
      } finally {
        flushing.current = false;
      }
    }

    function scheduleSave() {
      if (!ready.current || applying.current) return;
      dirty.current = true;
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void flush();
      }, 400);
    }

    async function pull() {
      if (applying.current || flushing.current) return;
      if (dirty.current) {
        await flush();
        return;
      }
      try {
        if (!hydrated.current) {
          await Promise.resolve(useBoardStore.persist.rehydrate());
          hydrated.current = true;
          const local = currentBoard();
          lastApplied.current = boardSignature(local.themes, local.activeThemeId);
        }
        const remote = await loadWorkspace({ data: { token: token() } });
        if (cancelled || dirty.current) return;
        applying.current = true;
        if (remote) {
          let themes = remote.themes;
          if (!compacted.current) {
            themes = await compactThemeImages(remote.themes);
            compacted.current = true;
          }
          const signature = boardSignature(themes, remote.activeThemeId);
          if (signature !== lastApplied.current) {
            useBoardStore.getState().replaceBoard(themes, remote.activeThemeId);
            lastApplied.current = signature;
          }
          if (themes !== remote.themes) {
            const persisted = await stashWhiteboardImages(themes, token());
            await saveWorkspace({
              data: {
                themes: persisted,
                activeThemeId: remote.activeThemeId,
                token: token(),
              },
            });
          }
        } else {
          const local = currentBoard();
          const themes = compacted.current
            ? local.themes
            : await compactThemeImages(local.themes);
          compacted.current = true;
          if (themes !== local.themes) {
            useBoardStore.getState().replaceBoard(themes, local.activeThemeId);
          }
          await saveWorkspace({
            data: {
              themes: await stashWhiteboardImages(themes, token()),
              activeThemeId: local.activeThemeId,
              token: token(),
            },
          });
          lastApplied.current = boardSignature(themes, local.activeThemeId);
        }
        if (!cancelled) markOk();
      } catch (error) {
        if (!cancelled) {
          if (isOffline()) {
            setHealth(
              "offline",
              "You are offline. Edits stay on this device until you reconnect.",
            );
          } else {
            markFail(error, dirty.current);
          }
        }
      } finally {
        applying.current = false;
        if (!cancelled) ready.current = true;
      }
    }

    void pull();
    const timer = window.setInterval(() => {
      if (ready.current && document.visibilityState === "visible") void pull();
    }, 12_000);

    const onFocus = () => {
      if (ready.current) void pull();
    };
    const onHide = () => {
      if (!ready.current || !dirty.current) return;
      const latest = currentBoard();
      void enqueueWorkspaceSync({
        token: token(),
        themes: latest.themes,
        activeThemeId: latest.activeThemeId,
      });
      void flush();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onHide();
      else if (ready.current) void pull();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);

    const onOnline = () => {
      setHealth("queued", "Back online. Saving the workspace…");
      if (ready.current) void flush();
    };
    const onOffline = () => {
      setHealth(
        "offline",
        "You are offline. Edits stay on this device until you reconnect.",
      );
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const onRetry = () => {
      if (ready.current) void flush();
    };
    window.addEventListener(SYNC_RETRY_EVENT, onRetry);

    const unsub = useBoardStore.subscribe(() => {
      scheduleSave();
    });
    const unsubSync = subscribeSyncMessages(
      () => {
        if (ready.current) void flush();
      },
      () => {
        if (ready.current && document.visibilityState === "visible") void pull();
      },
    );

    if (isOffline()) onOffline();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.clearTimeout(saveTimer.current);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener(SYNC_RETRY_EVENT, onRetry);
      unsub();
      unsubSync();
    };
  }, []);

  return null;
}
