import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { g as require_jsx_runtime } from "../_libs/@excalidraw/excalidraw+[...].mjs";
import { V as resolveImageUrl, v as expandMarkdownImages } from "./kanban-CtoXHh96.mjs";
import { M as Copy, z as Check } from "../_libs/lucide-react.mjs";
import { s as cn } from "./router-YokSpP1N.mjs";
import { n as defaultSchema } from "../_libs/hast-util-sanitize+[...].mjs";
import { n as defaultUrlTransform, t as Markdown } from "../_libs/react-markdown+[...].mjs";
import { t as rehypeSanitize } from "../_libs/rehype-sanitize.mjs";
import { t as remarkGfm } from "../_libs/remark-gfm.mjs";
import { T as useAssetGeneration, w as resolveAsset } from "./routes-COmF4DMp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/markdown-preview-DR8VLGva.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function getMermaid() {
	const mermaid = (await import("../_libs/@excalidraw/mermaid-to-excalidraw+[...].mjs").then((n) => n.n)).default;
	const styles = getComputedStyle(document.documentElement);
	const read = (token, fallback) => styles.getPropertyValue(token).trim() || fallback;
	const elevated = read("--color-bg-elevated", "#141416");
	const surface = read("--color-surface", "#1b1b1e");
	const hover = read("--color-surface-hover", "#232326");
	const fg = read("--color-fg", "#f0eee8");
	const muted = read("--color-muted", "#9a9790");
	const border = read("--color-border-strong", "#3a3a40");
	const dark = document.documentElement.dataset.theme === "dark";
	mermaid.initialize({
		startOnLoad: false,
		securityLevel: "strict",
		theme: dark ? "dark" : "neutral",
		fontFamily: "Figtree, sans-serif",
		themeVariables: {
			darkMode: dark,
			background: elevated,
			primaryColor: surface,
			primaryTextColor: fg,
			primaryBorderColor: border,
			secondaryColor: hover,
			tertiaryColor: elevated,
			lineColor: muted,
			textColor: fg,
			mainBkg: surface,
			nodeBorder: border,
			clusterBkg: elevated,
			clusterBorder: border,
			titleColor: fg,
			edgeLabelBackground: elevated,
			actorBkg: surface,
			actorTextColor: fg,
			actorBorder: border,
			signalColor: muted,
			labelBoxBkgColor: surface,
			labelTextColor: fg
		}
	});
	return mermaid;
}
function MermaidDiagram({ chart, className }) {
	const reactId = (0, import_react.useId)().replace(/:/g, "");
	const [svg, setSvg] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const source = chart.trim();
		if (!source) {
			setSvg("");
			setError("");
			return;
		}
		let cancelled = false;
		const timer = window.setTimeout(() => {
			(async () => {
				try {
					const mermaid = await getMermaid();
					const id = `mermaid-${reactId}-${Math.random().toString(36).slice(2, 8)}`;
					const { svg: next } = await mermaid.render(id, source);
					if (cancelled) return;
					setSvg(next);
					setError("");
				} catch {
					if (!cancelled) setError("This Mermaid diagram is incomplete or invalid.");
				}
			})();
		}, 280);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [chart, reactId]);
	if (error && !svg) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "my-3 rounded-md bg-bg px-3 py-2 text-xs text-subtle shadow-border",
		children: error
	});
	if (!svg) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "my-3 text-xs text-subtle",
		children: "Rendering diagram…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mermaid-diagram my-3 overflow-x-auto rounded-md bg-bg p-4 shadow-border [&_svg]:mx-auto [&_svg]:max-w-full", className),
		dangerouslySetInnerHTML: { __html: svg }
	});
}
var schema = {
	...defaultSchema,
	protocols: {
		...defaultSchema.protocols,
		src: [
			...defaultSchema.protocols?.src ?? ["http", "https"],
			"data",
			"blob",
			"ledger"
		]
	},
	attributes: {
		...defaultSchema.attributes,
		img: [
			...defaultSchema.attributes?.img ?? [],
			"src",
			"alt",
			"title"
		],
		code: [...defaultSchema.attributes?.code ?? [], ["className", /^language-./]],
		pre: [...defaultSchema.attributes?.pre ?? [], "className"]
	}
};
function urlTransform(url, images) {
	const resolved = resolveAsset(resolveImageUrl(url, images));
	if (resolved.startsWith("blob:")) return resolved;
	if (/^data:image\/(png|jpe?g|webp|gif);/i.test(resolved)) return resolved;
	if (/^data:image\/(png|jpe?g|webp|gif);/i.test(url)) return url;
	return defaultUrlTransform(url);
}
var markdownComponents = {
	h1: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "font-display mt-6 mb-3 text-2xl tracking-tight first:mt-0",
		children
	}),
	h2: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-display mt-5 mb-2 text-xl tracking-tight first:mt-0",
		children
	}),
	h3: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "mt-4 mb-2 text-base font-semibold first:mt-0",
		children
	}),
	p: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-3 last:mb-0",
		children
	}),
	ul: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mb-3 list-disc space-y-1 pl-5 last:mb-0",
		children
	}),
	ol: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "mb-3 list-decimal space-y-1 pl-5 last:mb-0",
		children
	}),
	li: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		className: "leading-relaxed",
		children
	}),
	a: ({ href, children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href,
		target: "_blank",
		rel: "noopener noreferrer",
		className: "underline decoration-border-strong underline-offset-2 hover:text-accent",
		children
	}),
	blockquote: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
		className: "mb-3 border-l-2 border-border-strong pl-3 text-muted",
		children
	}),
	img: ({ src, alt }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt: alt ?? "",
		className: "my-3 max-h-96 w-full rounded-md object-contain bg-bg"
	}),
	hr: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "my-5 border-border" }),
	table: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-3 overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
			className: "w-full border-collapse text-left text-sm",
			children
		})
	}),
	th: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: "border border-border bg-surface px-2 py-1.5 font-medium",
		children
	}),
	td: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: "border border-border px-2 py-1.5",
		children
	}),
	code: CodeNode,
	pre: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children })
};
function MarkdownPreview({ markdown, images = {}, className }) {
	useAssetGeneration();
	if (!markdown.trim()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("text-sm text-subtle", className),
		children: "Nothing written yet. Use the editor to add notes, images, or code."
	});
	const source = expandMarkdownImages(markdown, images);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("markdown-body text-sm leading-relaxed text-fg", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
			remarkPlugins: [remarkGfm],
			rehypePlugins: [[rehypeSanitize, schema]],
			urlTransform: (url) => urlTransform(url, images),
			components: markdownComponents,
			children: source
		})
	});
}
function CodeNode({ className, children, ...props }) {
	const text = String(children).replace(/\n$/, "");
	if (!(Boolean(className) || text.includes("\n"))) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
		className: "rounded-sm bg-bg px-1 py-0.5 font-mono text-xs text-fg",
		...props,
		children
	});
	const language = className?.replace("language-", "") ?? "";
	if (language === "mermaid") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MermaidDiagram, { chart: text });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
		text,
		language
	});
}
function CodeBlock({ text, language }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1400);
		} catch {
			setCopied(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative my-3 overflow-hidden rounded-md bg-bg shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b border-border px-3 py-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs tracking-wide text-subtle uppercase",
				children: language || "code"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => void copy(),
				className: "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted transition-colors duration-150 hover:bg-surface hover:text-fg",
				children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), copied ? "Copied" : "Copy"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "overflow-x-auto p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
				className: "font-mono text-xs leading-relaxed text-fg",
				children: text
			})
		})]
	});
}
//#endregion
export { MarkdownPreview as t };
