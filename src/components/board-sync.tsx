import { useEffect, useRef } from "react";
import { useBoardStore } from "@/lib/kanban";
import { compactThemeImages } from "@/lib/markdown-image";
import { getUnlockToken } from "@/lib/unlock";
import { loadWorkspace, saveWorkspace } from "@/lib/workspace";

function token() {
  return getUnlockToken();
}

export function BoardSync() {
  const ready = useRef(false);
  const applying = useRef(false);
  const saveTimer = useRef<number>(0);
  const compacted = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function pull() {
      if (applying.current) return;
      try {
        await Promise.resolve(useBoardStore.persist.rehydrate());
        const remote = await loadWorkspace({ data: { token: token() } });
        if (cancelled) return;
        applying.current = true;
        if (remote) {
          let themes = remote.themes;
          if (!compacted.current) {
            themes = await compactThemeImages(remote.themes);
            compacted.current = true;
          }
          useBoardStore.getState().replaceBoard(themes, remote.activeThemeId);
          if (themes !== remote.themes) {
            await saveWorkspace({
              data: {
                themes,
                activeThemeId: remote.activeThemeId,
                token: token(),
              },
            });
          }
        } else {
          const local = useBoardStore.getState();
          const themes = compacted.current
            ? local.themes
            : await compactThemeImages(local.themes);
          compacted.current = true;
          if (themes !== local.themes) {
            useBoardStore.getState().replaceBoard(themes, local.activeThemeId);
          }
          await saveWorkspace({
            data: {
              themes,
              activeThemeId: local.activeThemeId,
              token: token(),
            },
          });
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
    window.addEventListener("focus", onFocus);

    const unsub = useBoardStore.subscribe(() => {
      if (!ready.current || applying.current) return;
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        const latest = useBoardStore.getState();
        void saveWorkspace({
          data: {
            themes: latest.themes,
            activeThemeId: latest.activeThemeId,
            token: token(),
          },
        });
      }, 400);
    });

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.clearTimeout(saveTimer.current);
      window.removeEventListener("focus", onFocus);
      unsub();
    };
  }, []);

  return null;
}
