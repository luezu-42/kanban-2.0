import { Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";
import { selectActiveTheme, useBoardStore } from "@/lib/kanban";
import { useProfileStore } from "@/lib/profile";
import { getUnlockToken } from "@/lib/unlock";
import { getServerVersion, rememberServerVersion } from "@/lib/workspace-version";
import { saveWorkspace } from "@/lib/workspace";
import { stashBoardAssets } from "@/lib/whiteboard-persist";
import {
  type WhiteboardDoc,
  compactWhiteboard,
  emptyWhiteboard,
  isLegacyWhiteboard,
  normalizeWhiteboard,
  whiteboardContentSignature,
} from "@/lib/whiteboard";

type EditorProps = {
  doc: WhiteboardDoc;
  appearance: "dark" | "light" | "soft";
  onDraft: (next: WhiteboardDoc, migrated: boolean) => void;
};

export function WhiteboardCanvas({ onClose }: { onClose: () => void }) {
  const theme = useBoardStore(selectActiveTheme);
  const setThemeWhiteboard = useBoardStore((state) => state.setThemeWhiteboard);
  const appearance = useProfileStore((state) => state.appearance);
  const saved = theme.whiteboard;
  const savedSig = useMemo(
    () => whiteboardContentSignature(saved ?? emptyWhiteboard()),
    [saved],
  );
  const [Editor, setEditor] = useState<ComponentType<EditorProps> | null>(null);
  const [frame, setFrame] = useState(0);
  const [saving, setSaving] = useState(false);
  const [migrated, setMigrated] = useState(() => isLegacyWhiteboard(saved));
  const draft = useRef<WhiteboardDoc>(normalizeWhiteboard(saved));
  const baselineSig = useRef<string | null>(null);
  const appliedSaved = useRef(savedSig);
  const [draftSig, setDraftSig] = useState(() =>
    whiteboardContentSignature(draft.current),
  );
  const dirty = migrated || (baselineSig.current != null && draftSig !== baselineSig.current);

  useEffect(() => {
    let cancelled = false;
    void import("./excalidraw-editor").then((mod) => {
      if (!cancelled) setEditor(() => mod.ExcalidrawEditor);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    draft.current = normalizeWhiteboard(saved);
    baselineSig.current = null;
    setDraftSig(whiteboardContentSignature(draft.current));
    setMigrated(isLegacyWhiteboard(draft.current));
    setFrame((value) => value + 1);
  }, [theme.id]);

  const handleDraft = useCallback((next: WhiteboardDoc, fromLegacy: boolean) => {
    draft.current = next;
    const sig = whiteboardContentSignature(next);
    if (fromLegacy) setMigrated(true);
    if (baselineSig.current == null) {
      baselineSig.current = sig;
    }
    setDraftSig(sig);
  }, []);

  useEffect(() => {
    if (dirty) return;
    if (appliedSaved.current === savedSig) return;
    appliedSaved.current = savedSig;
    draft.current = normalizeWhiteboard(saved);
    baselineSig.current = null;
    setDraftSig(whiteboardContentSignature(draft.current));
    setMigrated(isLegacyWhiteboard(draft.current));
    setFrame((value) => value + 1);
  }, [savedSig, dirty, saved]);

  async function handleSave() {
    setSaving(true);
    try {
      const compacted = normalizeWhiteboard(await compactWhiteboard(draft.current));
      draft.current = compacted;
      setThemeWhiteboard(compacted);
      const latest = useBoardStore.getState();
      const token = getUnlockToken();
      const persisted = await stashBoardAssets(latest.themes, token);
      const result = await saveWorkspace({
        data: {
          themes: persisted,
          activeThemeId: latest.activeThemeId,
          token,
          version: getServerVersion(),
        },
      });
      if (result && "reason" in result && result.reason === "conflict") {
        rememberServerVersion(result.version);
        useBoardStore.getState().replaceBoard(result.themes, result.activeThemeId);
        toast.message("Board updated elsewhere");
        return;
      }
      if (!result?.ok) throw new Error("save failed");
      rememberServerVersion(result.version);
      appliedSaved.current = whiteboardContentSignature(compacted);
      baselineSig.current = whiteboardContentSignature(compacted);
      setMigrated(false);
      setDraftSig(baselineSig.current);
      toast.success("Canvas saved");
    } catch (error) {
      toast.error(errorMessage(error, "Could not save the canvas."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-bg-elevated shadow-border">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <p className="mr-auto text-xs font-medium tracking-[0.16em] text-subtle uppercase">
          Canvas
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Back to board
        </Button>
        <Button type="button" size="sm" disabled={!dirty || saving} onClick={() => void handleSave()}>
          <Save className="size-3.5" />
          {saving ? "Saving" : dirty ? "Save changes" : "Saved"}
        </Button>
      </div>

      <div className="relative h-[min(70dvh,46rem)] min-h-80 flex-1 overflow-hidden xl:h-auto">
        <div className="excalidraw-host absolute inset-0 min-h-0 min-w-0">
          {Editor ? (
            <Editor
              key={`${theme.id}:${frame}`}
              doc={draft.current}
              appearance={appearance}
              onDraft={handleDraft}
            />
          ) : (
            <div className="size-full animate-pulse bg-bg" />
          )}
        </div>
      </div>

      <p className="px-3 py-2 text-xs text-subtle">
        {migrated
          ? "This tab was upgraded to Excalidraw. Save to keep the drawing."
          : dirty
            ? "Unsaved marks on this tab. Save to keep them in the workspace."
            : "Draw, write, and drop images. Save to keep this tab in the workspace."}
      </p>
    </section>
  );
}
