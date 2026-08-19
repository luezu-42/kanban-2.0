import { useEffect, useRef } from "react";
import { boardSignature, useBoardStore } from "@/lib/kanban";
import { compactThemeImages } from "@/lib/markdown-image";
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

  useEffect(() => {
    let cancelled = false;

    async function flush() {
      if (applying.current || flushing.current) return;
      if (!token()) return;
      const latest = currentBoard();
      window.clearTimeout(saveTimer.current);
      flushing.current = true;
      try {
        const unlock = token();
        const themes = await stashWhiteboardImages(latest.themes, unlock);
        await saveWorkspace({
          data: {
            themes,
            activeThemeId: latest.activeThemeId,
            token: unlock,
          },
        });
        if (!cancelled) {
          dirty.current = false;
          lastApplied.current = boardSignature(latest.themes, latest.activeThemeId);
        }
      } catch {
        if (!cancelled) dirty.current = true;
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
      } catch {
        // Keep the local cache if the workspace is unreachable.
      } finally {
        applying.current = false;
        if (!cancelled) ready.current = true;
      }
    }

    void pull();
    const timer = window.setInterval(() => {
      if (ready.current) void pull();
    }, 8000);

    const onFocus = () => {
      if (ready.current) void pull();
    };
    const onHide = () => {
      if (ready.current && dirty.current) void flush();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onHide();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);

    const unsub = useBoardStore.subscribe(() => {
      scheduleSave();
    });

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.clearTimeout(saveTimer.current);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
      unsub();
    };
  }, []);

  return null;
}
