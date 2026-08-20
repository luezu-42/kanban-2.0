import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { g as require_jsx_runtime } from "../_libs/@excalidraw/excalidraw+[...].mjs";
import { F as optimizeDataUrl, M as newImageId, S as filesFromDataTransfer, T as insertAroundSelection, b as fileToDataUrl, j as markdownImageSnippet, w as imageRef, x as filesFromClipboard, y as extractInlineImages, z as pruneImages } from "./kanban-CtoXHh96.mjs";
import { B as Bold, E as Heading2, N as Code, S as Link2, T as ImagePlus, f as SquareCode, k as ExternalLink, n as Workflow, v as Pencil, w as Italic } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Button, s as cn } from "./router-YokSpP1N.mjs";
import { t as MarkdownPreview } from "./markdown-preview-DR8VLGva.mjs";
import { _ as Dialog, b as DialogTitle, v as DialogContent, y as DialogDescription } from "./routes-COmF4DMp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/card-details-dialog-PkdB26_K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function escapeHtml(text) {
	const amp = String.fromCharCode(38);
	return text.replaceAll("&", `${amp}amp;`).replaceAll("<", `${amp}lt;`).replaceAll(">", `${amp}gt;`).replaceAll("\"", `${amp}quot;`);
}
function descriptionHtml(text) {
	if (!text.trim()) return "";
	return `<p class="lede">${escapeHtml(text).replaceAll("\n", "<br />")}</p>`;
}
var PAGE_CSS = `
:root { color-scheme: dark; }
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body {
  background: #0c0c0d;
  color: #f0eee8;
  font: 16px/1.55 ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
main { width: min(48rem, calc(100% - 2.5rem)); margin: 0 auto; padding: 2.5rem 0 4rem; }
.kicker { margin: 0 0 0.5rem; font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; color: #6e6b66; }
h1.title { margin: 0 0 1rem; font: 600 2.25rem/1.15 ui-serif, Georgia, serif; }
.lede { margin: 0 0 2rem; color: #9a9790; }
.details { border-top: 1px solid rgb(240 238 232 / 0.09); padding-top: 1.5rem; }
.markdown-body h1, .markdown-body h2, .markdown-body h3 { font-family: ui-serif, Georgia, serif; letter-spacing: -0.02em; }
.markdown-body h1 { font-size: 1.75rem; margin: 1.5rem 0 0.75rem; }
.markdown-body h2 { font-size: 1.35rem; margin: 1.25rem 0 0.5rem; }
.markdown-body h3 { font-size: 1.05rem; margin: 1rem 0 0.4rem; }
.markdown-body h1:first-child, .markdown-body h2:first-child, .markdown-body h3:first-child { margin-top: 0; }
.markdown-body p { margin: 0 0 0.75rem; }
.markdown-body ul, .markdown-body ol { margin: 0 0 0.75rem; padding-left: 1.25rem; }
.markdown-body li { margin: 0.2rem 0; }
.markdown-body a { color: inherit; text-underline-offset: 0.15em; }
.markdown-body blockquote { margin: 0 0 0.75rem; padding-left: 0.85rem; border-left: 2px solid rgb(240 238 232 / 0.16); color: #9a9790; }
.markdown-body img { display: block; max-width: 100%; max-height: 28rem; margin: 0.75rem 0; border-radius: 0.5rem; background: #141416; object-fit: contain; }
.markdown-body hr { border: 0; border-top: 1px solid rgb(240 238 232 / 0.09); margin: 1.25rem 0; }
.markdown-body table { width: 100%; border-collapse: collapse; margin: 0 0 0.75rem; font-size: 0.9rem; }
.markdown-body th, .markdown-body td { border: 1px solid rgb(240 238 232 / 0.09); padding: 0.4rem 0.55rem; text-align: left; }
.markdown-body th { background: #1b1b1e; }
.markdown-body pre, .markdown-body .relative { margin: 0.75rem 0; border-radius: 0.5rem; background: #141416; box-shadow: 0 0 0 1px rgb(240 238 232 / 0.08); overflow: auto; }
.markdown-body pre { padding: 0.75rem; }
.markdown-body code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.8rem; }
.markdown-body p code, .markdown-body li code { background: #141416; padding: 0.1rem 0.3rem; border-radius: 0.2rem; }
.markdown-body button { display: none; }
.markdown-body .mermaid-diagram { margin: 0.75rem 0; padding: 1rem; overflow-x: auto; border-radius: 0.5rem; background: #141416; box-shadow: 0 0 0 1px rgb(240 238 232 / 0.08); }
.markdown-body .mermaid-diagram svg { display: block; max-width: 100%; height: auto; margin: 0 auto; }
`;
function openOfflineCardPage(card, previewRoot) {
	const clone = (previewRoot?.querySelector(".markdown-body") ?? previewRoot)?.cloneNode(true);
	if (clone) clone.querySelectorAll("button").forEach((node) => node.remove());
	const details = clone?.innerHTML?.trim() ? clone.innerHTML : `<p>${escapeHtml(card.details || "Nothing written yet.")}</p>`;
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark" />
<title>${escapeHtml(card.title)}</title>
<style>${PAGE_CSS}</style>
</head>
<body>
<main>
  <p class="kicker">Card</p>
  <h1 class="title">${escapeHtml(card.title)}</h1>
  ${descriptionHtml(card.description)}
  <section class="details">
    <div class="markdown-body">${details}</div>
  </section>
</main>
</body>
</html>`;
	const blob = new Blob([html], { type: "text/html;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const page = window.open(url, "_blank", "noopener");
	window.setTimeout(() => URL.revokeObjectURL(url), 6e4);
	return Boolean(page);
}
function CardDetailsDialog({ open, card, onOpenChange, onSave }) {
	const [value, setValue] = (0, import_react.useState)("");
	const [images, setImages] = (0, import_react.useState)({});
	const imagesRef = (0, import_react.useRef)({});
	const [mode, setMode] = (0, import_react.useState)("edit");
	const [pane, setPane] = (0, import_react.useState)("write");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const areaRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const valueRef = (0, import_react.useRef)("");
	const savedRef = (0, import_react.useRef)("");
	const selectionRef = (0, import_react.useRef)({
		start: 0,
		end: 0
	});
	const dragCountRef = (0, import_react.useRef)(0);
	const previewRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!open || !card) return;
		const extracted = extractInlineImages(card.details, card.images);
		setValue(extracted.details);
		valueRef.current = extracted.details;
		savedRef.current = extracted.details;
		setImages(extracted.images);
		imagesRef.current = extracted.images;
		selectionRef.current = {
			start: extracted.details.length,
			end: extracted.details.length
		};
		setMode(extracted.details.trim() ? "view" : "edit");
		setPane("write");
		setBusy(false);
		setDragging(false);
		dragCountRef.current = 0;
	}, [
		open,
		card?.id,
		card?.details
	]);
	function rememberSelection() {
		const area = areaRef.current;
		if (!area) return;
		selectionRef.current = {
			start: area.selectionStart,
			end: area.selectionEnd
		};
	}
	function applyWrap(before, after = "", placeholder = "") {
		const current = valueRef.current;
		const { start, end } = selectionRef.current;
		const { next, cursor } = insertAroundSelection(current, start, end, before, after, placeholder);
		valueRef.current = next;
		selectionRef.current = {
			start: cursor,
			end: cursor
		};
		setValue(next);
		requestAnimationFrame(() => {
			const area = areaRef.current;
			area?.focus();
			area?.setSelectionRange(cursor, cursor);
		});
	}
	async function insertImages(files) {
		const images = files.filter(Boolean);
		if (!images.length) {
			toast.error("Drop a PNG, JPG, GIF, or WebP.");
			return;
		}
		setBusy(true);
		try {
			const snippets = [];
			const added = {};
			for (const file of images) {
				const dataUrl = await fileToDataUrl(file);
				const id = newImageId();
				added[id] = dataUrl;
				snippets.push(markdownImageSnippet(file, imageRef(id)));
			}
			setImages((current) => {
				const next = {
					...current,
					...added
				};
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
			const compactImages = {};
			for (const [id, url] of Object.entries(extracted.images)) compactImages[id] = await optimizeDataUrl(url);
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
	function handleDragEnter(event) {
		if (![...event.dataTransfer.types].includes("Files")) return;
		event.preventDefault();
		dragCountRef.current += 1;
		setDragging(true);
	}
	function handleDragOver(event) {
		if (![...event.dataTransfer.types].includes("Files")) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";
	}
	function handleDragLeave(event) {
		if (![...event.dataTransfer.types].includes("Files")) return;
		event.preventDefault();
		dragCountRef.current = Math.max(0, dragCountRef.current - 1);
		if (dragCountRef.current === 0) setDragging(false);
	}
	function handleDrop(event) {
		event.preventDefault();
		dragCountRef.current = 0;
		setDragging(false);
		const files = filesFromDataTransfer(event.dataTransfer);
		if (!files.length) {
			toast.error("Drop a PNG, JPG, GIF, or WebP.");
			return;
		}
		insertImages(files);
	}
	const viewing = mode === "view";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: cn("details-frame inset-4 top-4 left-4 flex h-auto w-auto max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden p-0", "sm:inset-8 sm:top-8 sm:left-8", "wide:inset-10 wide:top-10 wide:left-10"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3 border-b border-border px-5 py-4 pr-14",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "wrap-break-word [overflow-wrap:anywhere]",
							children: card?.title ?? "Details"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: viewing ? "Read the notes on this card." : "Markdown notes with images, code, and Mermaid diagrams. Drop an image onto the editor to attach it." })]
					}), viewing && card ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "secondary",
						size: "sm",
						className: "shrink-0",
						onClick: () => {
							if (!openOfflineCardPage(card, previewRef.current)) toast.error("Allow pop-ups to open the page.");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" }), "Open page"]
					}) : null]
				}),
				viewing ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-1 border-b border-border px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
							label: "Heading",
							onClick: () => applyWrap("## ", "", "Heading"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading2, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
							label: "Bold",
							onClick: () => applyWrap("**", "**", "bold"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bold, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
							label: "Italic",
							onClick: () => applyWrap("_", "_", "italic"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Italic, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
							label: "Inline code",
							onClick: () => applyWrap("`", "`", "code"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Code, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
							label: "Code block",
							onClick: () => applyWrap("```\n", "\n```", "snippet"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCode, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
							label: "Mermaid diagram",
							onClick: () => applyWrap("```mermaid\n", "\n```", "flowchart LR\n  Backlog --> Planning --> Todo[To Do] --> Doing --> Review --> Done"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Workflow, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
							label: "Link",
							onClick: () => applyWrap("[", "](https://)", "text"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
							label: "Image",
							onClick: () => fileRef.current?.click(),
							disabled: busy,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: fileRef,
							type: "file",
							accept: "image/*",
							multiple: true,
							className: "sr-only",
							onChange: (event) => {
								const files = [...event.target.files ?? []];
								event.target.value = "";
								if (files.length) insertImages(files);
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex rounded-md bg-bg p-0.5 shadow-border md:hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setPane("write"),
								className: cn("h-8 rounded-sm px-3 text-xs font-medium", pane === "write" ? "bg-surface text-fg" : "text-muted"),
								children: "Write"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setPane("preview"),
								className: cn("h-8 rounded-sm px-3 text-xs font-medium", pane === "preview" ? "bg-surface text-fg" : "text-muted"),
								children: "Preview"
							})]
						})
					]
				}),
				viewing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: previewRef,
					className: "min-h-0 flex-1 overflow-y-auto bg-bg p-5 sm:p-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownPreview, {
						markdown: value,
						images
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative grid min-h-0 flex-1 md:grid-cols-2",
					onDragEnter: handleDragEnter,
					onDragOver: handleDragOver,
					onDragLeave: handleDragLeave,
					onDrop: handleDrop,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: cn("min-h-0 border-border md:border-r", pane === "preview" ? "hidden md:block" : "block"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Markdown"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								ref: areaRef,
								value,
								onSelect: rememberSelection,
								onClick: rememberSelection,
								onKeyUp: rememberSelection,
								onChange: (event) => {
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
								},
								onPaste: (event) => {
									const files = filesFromClipboard(event.clipboardData);
									if (!files.length) return;
									event.preventDefault();
									insertImages(files);
								},
								onKeyDown: (event) => {
									if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
										event.preventDefault();
										handleSave();
									}
								},
								spellCheck: false,
								placeholder: "Write markdown.\n\nDrop an image here, or paste a screenshot.\n\n```mermaid\nflowchart LR\n  A --> B\n```",
								className: "h-full min-h-72 w-full resize-none bg-transparent p-5 font-mono text-sm leading-relaxed text-fg outline-none placeholder:text-subtle"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("min-h-0 overflow-y-auto bg-bg p-5", pane === "write" ? "hidden md:block" : "block"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownPreview, {
								markdown: value,
								images
							})
						}),
						dragging ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-2 z-10 grid place-items-center rounded-lg border border-dashed border-accent bg-bg/80",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-fg",
								children: "Drop image to insert"
							})
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-end gap-2 border-t border-border px-5 py-3",
					children: viewing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => onOpenChange(false),
						children: "Close"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						onClick: enterEdit,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "Edit"]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: handleCancelEdit,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: () => void handleSave(),
						disabled: busy,
						children: "Save details"
					})] })
				})
			]
		})
	});
}
function ToolButton({ label, onClick, disabled, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		title: label,
		"aria-label": label,
		disabled,
		onClick,
		className: "grid size-9 place-items-center rounded-md text-muted transition-colors duration-150 hover:bg-surface hover:text-fg disabled:opacity-40",
		children
	});
}
//#endregion
export { CardDetailsDialog };
