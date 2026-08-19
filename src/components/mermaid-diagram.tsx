import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

type MermaidDiagramProps = {
  chart: string;
  className?: string;
};

async function getMermaid() {
  const mermaid = (await import("mermaid")).default;
  const styles = getComputedStyle(document.documentElement);
  const read = (token: string, fallback: string) =>
    styles.getPropertyValue(token).trim() || fallback;
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
      labelTextColor: fg,
    },
  });
  return mermaid;
}

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const source = chart.trim();
    if (!source) {
      setSvg("");
      setError("");
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
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

  if (error && !svg) {
    return (
      <p className="my-3 rounded-md bg-bg px-3 py-2 text-xs text-subtle shadow-border">
        {error}
      </p>
    );
  }

  if (!svg) {
    return (
      <p className="my-3 text-xs text-subtle">Rendering diagram…</p>
    );
  }

  return (
    <div
      className={cn(
        "mermaid-diagram my-3 overflow-x-auto rounded-md bg-bg p-4 shadow-border [&_svg]:mx-auto [&_svg]:max-w-full",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
