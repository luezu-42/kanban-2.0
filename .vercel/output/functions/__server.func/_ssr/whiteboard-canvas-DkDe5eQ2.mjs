import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { g as require_jsx_runtime } from "../_libs/@excalidraw/excalidraw+[...].mjs";
import { G as useBoardStore, H as selectActiveTheme, K as whiteboardContentSignature, O as isLegacyWhiteboard, P as normalizeWhiteboard, _ as emptyWhiteboard, g as compactWhiteboard } from "./kanban-CtoXHh96.mjs";
import { u as saveWorkspace } from "./board-rows.server-DSnb0Mmn.mjs";
import { m as Save } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { h as useProfileStore, l as errorMessage, n as Button } from "./router-YokSpP1N.mjs";
import { g as getUnlockToken, i as rememberServerVersion, n as stashBoardAssets, r as getServerVersion } from "./routes-COmF4DMp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/whiteboard-canvas-DkDe5eQ2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WhiteboardCanvas({ onClose }) {
	const theme = useBoardStore(selectActiveTheme);
	const setThemeWhiteboard = useBoardStore((state) => state.setThemeWhiteboard);
	const appearance = useProfileStore((state) => state.appearance);
	const saved = theme.whiteboard;
	const savedSig = (0, import_react.useMemo)(() => whiteboardContentSignature(saved ?? emptyWhiteboard()), [saved]);
	const [Editor, setEditor] = (0, import_react.useState)(null);
	const [frame, setFrame] = (0, import_react.useState)(0);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [migrated, setMigrated] = (0, import_react.useState)(() => isLegacyWhiteboard(saved));
	const draft = (0, import_react.useRef)(normalizeWhiteboard(saved));
	const baselineSig = (0, import_react.useRef)(null);
	const appliedSaved = (0, import_react.useRef)(savedSig);
	const [draftSig, setDraftSig] = (0, import_react.useState)(() => whiteboardContentSignature(draft.current));
	const dirty = migrated || baselineSig.current != null && draftSig !== baselineSig.current;
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		import("./excalidraw-editor-1dTB9SKt.mjs").then((mod) => {
			if (!cancelled) setEditor(() => mod.ExcalidrawEditor);
		});
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		draft.current = normalizeWhiteboard(saved);
		baselineSig.current = null;
		setDraftSig(whiteboardContentSignature(draft.current));
		setMigrated(isLegacyWhiteboard(draft.current));
		setFrame((value) => value + 1);
	}, [theme.id]);
	const handleDraft = (0, import_react.useCallback)((next, fromLegacy) => {
		draft.current = next;
		const sig = whiteboardContentSignature(next);
		if (fromLegacy) setMigrated(true);
		if (baselineSig.current == null) baselineSig.current = sig;
		setDraftSig(sig);
	}, []);
	(0, import_react.useEffect)(() => {
		if (dirty) return;
		if (appliedSaved.current === savedSig) return;
		appliedSaved.current = savedSig;
		draft.current = normalizeWhiteboard(saved);
		baselineSig.current = null;
		setDraftSig(whiteboardContentSignature(draft.current));
		setMigrated(isLegacyWhiteboard(draft.current));
		setFrame((value) => value + 1);
	}, [
		savedSig,
		dirty,
		saved
	]);
	async function handleSave() {
		setSaving(true);
		try {
			const compacted = normalizeWhiteboard(await compactWhiteboard(draft.current));
			draft.current = compacted;
			setThemeWhiteboard(compacted);
			const latest = useBoardStore.getState();
			const token = getUnlockToken();
			const persisted = await stashBoardAssets(latest.themes, token);
			const result = await saveWorkspace({ data: {
				themes: persisted,
				activeThemeId: latest.activeThemeId,
				token,
				version: getServerVersion()
			} });
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-bg-elevated shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 border-b border-border px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mr-auto text-xs font-medium tracking-[0.16em] text-subtle uppercase",
						children: "Canvas"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						onClick: onClose,
						children: "Back to board"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						disabled: !dirty || saving,
						onClick: () => void handleSave(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-3.5" }), saving ? "Saving" : dirty ? "Save changes" : "Saved"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative h-[min(70dvh,46rem)] min-h-80 flex-1 overflow-hidden xl:h-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "excalidraw-host absolute inset-0 min-h-0 min-w-0",
					children: Editor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Editor, {
						doc: draft.current,
						appearance,
						onDraft: handleDraft
					}, `${theme.id}:${frame}`) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-full animate-pulse bg-bg" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 py-2 text-xs text-subtle",
				children: migrated ? "This tab was upgraded to Excalidraw. Save to keep the drawing." : dirty ? "Unsaved marks on this tab. Save to keep them in the workspace." : "Draw, write, and drop images. Save to keep this tab in the workspace."
			})
		]
	});
}
//#endregion
export { WhiteboardCanvas };
