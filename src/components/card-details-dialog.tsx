import {
  Bold,
  Code,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  Pencil,
  SquareCode,
  Workflow,
  ExternalLink,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Card } from "@/lib/kanban";
import {
  extractInlineImages,
  fileToDataUrl,
  filesFromClipboard,
  filesFromDataTransfer,
  imageRef,
  insertAroundSelection,
  markdownImageSnippet,
  newImageId,
  optimizeDataUrl,
  pruneImages,
} from "@/lib/markdown-image";
import { cn } from "@/lib/utils";
import { openOfflineCardPage } from "@/lib/offline-card-page";

type CardDetailsDialogProps = {
  open: boolean;
  card: Card | null;
  onOpenChange: (open: boolean) => void;
  onSave: (details: string, images: Record<string, string>) => void;
};

export function CardDetailsDialog({
  open,
  card,
  onOpenChange,
  onSave,
}: CardDetailsDialogProps) {
  const [value, setValue] = useState("");
  const [images, setImages] = useState<Record<string, string>>({});
  const imagesRef = useRef<Record<string, string>>({});
  const [mode, setMode] = useState<"view" | "edit">("edit");
  const [pane, setPane] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef("");
  const savedRef = useRef("");
  const selectionRef = useRef({ start: 0, end: 0 });
  const dragCountRef = useRef(0);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !card) return;
    const extracted = extractInlineImages(card.details, card.images);
    setValue(extracted.details);
    valueRef.current = extracted.details;
    savedRef.current = extracted.details;
    setImages(extracted.images);
    imagesRef.current = extracted.images;
    selectionRef.current = {
      start: extracted.details.length,
      end: extracted.details.length,
    };
    setMode(extracted.details.trim() ? "view" : "edit");
    setPane("write");
    setBusy(false);
    setDragging(false);
    dragCountRef.current = 0;
  }, [open, card?.id, card?.details]);

  function rememberSelection() {
    const area = areaRef.current;
    if (!area) return;
    selectionRef.current = {
      start: area.selectionStart,
      end: area.selectionEnd,
    };
  }

  function applyWrap(before: string, after = "", placeholder = "") {
    const current = valueRef.current;
    const { start, end } = selectionRef.current;
    const { next, cursor } = insertAroundSelection(
      current,
      start,
      end,
      before,
      after,
      placeholder,
    );
    valueRef.current = next;
    selectionRef.current = { start: cursor, end: cursor };
    setValue(next);
    requestAnimationFrame(() => {
      const area = areaRef.current;
      area?.focus();
      area?.setSelectionRange(cursor, cursor);
    });
  }

  async function insertImages(files: File[]) {
    const images = files.filter(Boolean);
    if (!images.length) {
      toast.error("Drop a PNG, JPG, GIF, or WebP.");
      return;
    }
    setBusy(true);
    try {
      const snippets: string[] = [];
      const added: Record<string, string> = {};
      for (const file of images) {
        const dataUrl = await fileToDataUrl(file);
        const id = newImageId();
        added[id] = dataUrl;
        snippets.push(markdownImageSnippet(file, imageRef(id)));
      }
      setImages((current) => {
        const next = { ...current, ...added };
        imagesRef.current = next;
        return next;
      });
      applyWrap(snippets.join("\n\n") + "\n\n");
    } catch {
      toast.error("Could not add that image. Try another file.");
    } finally {
      setBusy(false);
    }
  }

  function enterEdit() {
    setMode("edit");
    setPane("write");
    requestAnimationFrame(() => areaRef.current?.focus());
  }

  async function handleSave() {
    setBusy(true);
    try {
      const extracted = extractInlineImages(valueRef.current, imagesRef.current);
      const compactImages: Record<string, string> = {};
      for (const [id, url] of Object.entries(extracted.images)) {
        compactImages[id] = await optimizeDataUrl(url);
      }
      const kept = pruneImages(extracted.details, compactImages);
      valueRef.current = extracted.details;
      setValue(extracted.details);
      setImages(kept);
      imagesRef.current = kept;
      onSave(extracted.details, kept);
      onOpenChange(false);
    } catch {
      const extracted = extractInlineImages(valueRef.current, imagesRef.current);
      onSave(extracted.details, extracted.images);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  function handleCancelEdit() {
    if (!savedRef.current.trim()) {
      onOpenChange(false);
      return;
    }
    setValue(savedRef.current);
    valueRef.current = savedRef.current;
    setMode("view");
    setDragging(false);
    dragCountRef.current = 0;
  }

  function handleDragEnter(event: React.DragEvent) {
    if (![...event.dataTransfer.types].includes("Files")) return;
    event.preventDefault();
    dragCountRef.current += 1;
    setDragging(true);
  }

  function handleDragOver(event: React.DragEvent) {
    if (![...event.dataTransfer.types].includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(event: React.DragEvent) {
    if (![...event.dataTransfer.types].includes("Files")) return;
    event.preventDefault();
    dragCountRef.current = Math.max(0, dragCountRef.current - 1);
    if (dragCountRef.current === 0) setDragging(false);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    dragCountRef.current = 0;
    setDragging(false);
    const files = filesFromDataTransfer(event.dataTransfer);
    if (!files.length) {
      toast.error("Drop a PNG, JPG, GIF, or WebP.");
      return;
    }
    void insertImages(files);
  }

  const viewing = mode === "view";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "inset-4 top-4 left-4 flex h-auto w-auto max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden p-0",
          "sm:inset-8 sm:top-8 sm:left-8",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 pr-14">
          <div className="min-w-0">
            <DialogTitle className="wrap-break-word [overflow-wrap:anywhere]">
              {card?.title ?? "Details"}
            </DialogTitle>
            <DialogDescription>
              {viewing
                ? "Read the notes on this card."
                : "Markdown notes with images, code, and Mermaid diagrams. Drop an image onto the editor to attach it."}
            </DialogDescription>
          </div>
          {viewing && card ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={() => {
                const opened = openOfflineCardPage(card, previewRef.current);
                if (!opened) toast.error("Allow pop-ups to open the page.");
              }}
            >
              <ExternalLink className="size-4" />
              Open page
            </Button>
          ) : null}
        </div>

        {viewing ? null : (
          <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
            <ToolButton label="Heading" onClick={() => applyWrap("## ", "", "Heading")}>
              <Heading2 className="size-4" />
            </ToolButton>
            <ToolButton label="Bold" onClick={() => applyWrap("**", "**", "bold")}>
              <Bold className="size-4" />
            </ToolButton>
            <ToolButton label="Italic" onClick={() => applyWrap("_", "_", "italic")}>
              <Italic className="size-4" />
            </ToolButton>
            <ToolButton label="Inline code" onClick={() => applyWrap("`", "`", "code")}>
              <Code className="size-4" />
            </ToolButton>
            <ToolButton
              label="Code block"
              onClick={() => applyWrap("```\n", "\n```", "snippet")}
            >
              <SquareCode className="size-4" />
            </ToolButton>
            <ToolButton
              label="Mermaid diagram"
              onClick={() =>
                applyWrap(
                  "```mermaid\n",
                  "\n```",
                  "flowchart LR\n  Backlog --> Planning --> Todo[To Do] --> Doing --> Review --> Done",
                )
              }
            >
              <Workflow className="size-4" />
            </ToolButton>
            <ToolButton
              label="Link"
              onClick={() => applyWrap("[", "](https://)", "text")}
            >
              <Link2 className="size-4" />
            </ToolButton>
            <ToolButton
              label="Image"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              <ImagePlus className="size-4" />
            </ToolButton>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                const files = [...(event.target.files ?? [])];
                event.target.value = "";
                if (files.length) void insertImages(files);
              }}
            />

            <div className="ml-auto flex rounded-md bg-bg p-0.5 shadow-border md:hidden">
              <button
                type="button"
                onClick={() => setPane("write")}
                className={cn(
                  "h-8 rounded-sm px-3 text-xs font-medium",
                  pane === "write" ? "bg-surface text-fg" : "text-muted",
                )}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setPane("preview")}
                className={cn(
                  "h-8 rounded-sm px-3 text-xs font-medium",
                  pane === "preview" ? "bg-surface text-fg" : "text-muted",
                )}
              >
                Preview
              </button>
            </div>
          </div>
        )}

        {viewing ? (
          <div ref={previewRef} className="min-h-0 flex-1 overflow-y-auto bg-bg p-5 sm:p-8">
            <MarkdownPreview markdown={value} images={images} />
          </div>
        ) : (
          <div
            className="relative grid min-h-0 flex-1 md:grid-cols-2"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label
              className={cn(
                "min-h-0 border-border md:border-r",
                pane === "preview" ? "hidden md:block" : "block",
              )}
            >
              <span className="sr-only">Markdown</span>
              <textarea
                ref={areaRef}
                value={value}
                onSelect={rememberSelection}
                onClick={rememberSelection}
                onKeyUp={rememberSelection}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw.includes("data:image/")) {
                    const extracted = extractInlineImages(raw, imagesRef.current);
                    imagesRef.current = extracted.images;
                    setImages(extracted.images);
                    valueRef.current = extracted.details;
                    setValue(extracted.details);
                  } else {
                    valueRef.current = raw;
                    setValue(raw);
                  }
                  rememberSelection();
                }}
                onPaste={(event) => {
                  const files = filesFromClipboard(event.clipboardData);
                  if (!files.length) return;
                  event.preventDefault();
                  void insertImages(files);
                }}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    event.preventDefault();
                    void handleSave();
                  }
                }}
                spellCheck={false}
                placeholder={"Write markdown.\n\nDrop an image here, or paste a screenshot.\n\n```mermaid\nflowchart LR\n  A --> B\n```"}
                className="h-full min-h-72 w-full resize-none bg-transparent p-5 font-mono text-sm leading-relaxed text-fg outline-none placeholder:text-subtle"
              />
            </label>
            <div
              className={cn(
                "min-h-0 overflow-y-auto bg-bg p-5",
                pane === "write" ? "hidden md:block" : "block",
              )}
            >
              <MarkdownPreview markdown={value} images={images} />
            </div>

            {dragging ? (
              <div className="pointer-events-none absolute inset-2 z-10 grid place-items-center rounded-lg border border-dashed border-accent bg-bg/80">
                <p className="text-sm font-medium text-fg">Drop image to insert</p>
              </div>
            ) : null}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          {viewing ? (
            <>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="button" onClick={enterEdit}>
                <Pencil className="size-4" />
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void handleSave()} disabled={busy}>
                Save details
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-md text-muted transition-colors duration-150 hover:bg-surface hover:text-fg disabled:opacity-40"
    >
      {children}
    </button>
  );
}
