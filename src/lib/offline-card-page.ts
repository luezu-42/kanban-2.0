import type { Card } from "@/lib/kanban";

function escapeHtml(text: string) {
  const amp = String.fromCharCode(38);
  return text
    .replaceAll("&", `${amp}amp;`)
    .replaceAll("<", `${amp}lt;`)
    .replaceAll(">", `${amp}gt;`)
    .replaceAll('"', `${amp}quot;`);
}

function descriptionHtml(text: string) {
  if (!text.trim()) return "";
  return `<p class="lede">${escapeHtml(text).replaceAll("\n", "<br />")}</p>`;
}

const PAGE_CSS = `
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

export function openOfflineCardPage(card: Card, previewRoot: HTMLElement | null) {
  const source =
    previewRoot?.querySelector(".markdown-body") ?? previewRoot;
  const clone = source?.cloneNode(true) as HTMLElement | null;
  if (clone) {
    clone.querySelectorAll("button").forEach((node) => node.remove());
  }
  const details = clone?.innerHTML?.trim()
    ? clone.innerHTML
    : `<p>${escapeHtml(card.details || "Nothing written yet.")}</p>`;

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
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return Boolean(page);
}
