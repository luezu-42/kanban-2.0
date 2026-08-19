import { MermaidDiagram } from "@/components/mermaid-diagram";
import { Check, Copy } from "lucide-react";
import { useState, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { expandMarkdownImages, resolveImageUrl } from "@/lib/markdown-image";

const schema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src ?? ["http", "https"]), "data", "ledger"],
  },
  attributes: {
    ...defaultSchema.attributes,
    img: [...(defaultSchema.attributes?.img ?? []), "src", "alt", "title"],
    code: [...(defaultSchema.attributes?.code ?? []), ["className", /^language-./]],
    pre: [...(defaultSchema.attributes?.pre ?? []), "className"],
  },
};

function urlTransform(url: string, images: Record<string, string>) {
  const resolved = resolveImageUrl(url, images);
  if (/^data:image\/[a-zA-Z0-9.+-]+;/.test(resolved)) return resolved;
  if (/^data:image\/[a-zA-Z0-9.+-]+;/.test(url)) return url;
  return defaultUrlTransform(url);
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="font-display mt-6 mb-3 text-2xl tracking-tight first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-display mt-5 mb-2 text-xl tracking-tight first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-base font-semibold first:mt-0">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-border-strong underline-offset-2 hover:text-accent"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-border-strong pl-3 text-muted">
      {children}
    </blockquote>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt ?? ""}
      className="my-3 max-h-96 w-full rounded-md object-contain bg-bg"
    />
  ),
  hr: () => <hr className="my-5 border-border" />,
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border bg-surface px-2 py-1.5 font-medium">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-2 py-1.5">{children}</td>
  ),
  code: CodeNode,
  pre: ({ children }) => <>{children}</>,
};

export function MarkdownPreview({
  markdown,
  images = {},
  className,
}: {
  markdown: string;
  images?: Record<string, string>;
  className?: string;
}) {
  if (!markdown.trim()) {
    return (
      <p className={cn("text-sm text-subtle", className)}>
        Nothing written yet. Use the editor to add notes, images, or code.
      </p>
    );
  }

  const source = expandMarkdownImages(markdown, images);

  return (
    <div
      className={cn(
        "markdown-body text-sm leading-relaxed text-fg",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, schema]]}
        urlTransform={(url) => urlTransform(url, images)}
        components={markdownComponents}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

function CodeNode({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"code">) {
  const text = String(children).replace(/\n$/, "");
  const isBlock = Boolean(className) || text.includes("\n");

  if (!isBlock) {
    return (
      <code
        className="rounded-sm bg-bg px-1 py-0.5 font-mono text-xs text-fg"
        {...props}
      >
        {children}
      </code>
    );
  }

  const language = className?.replace("language-", "") ?? "";
  if (language === "mermaid") {
    return <MermaidDiagram chart={text} />;
  }

  return <CodeBlock text={text} language={language} />;
}

function CodeBlock({ text, language }: { text: string; language: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative my-3 overflow-hidden rounded-md bg-bg shadow-border">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-xs tracking-wide text-subtle uppercase">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted transition-colors duration-150 hover:bg-surface hover:text-fg"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3">
        <code className="font-mono text-xs leading-relaxed text-fg">{text}</code>
      </pre>
    </div>
  );
}
