import { useEffect, useId, useRef, useState } from "react";
import type { Card } from "@/lib/kanban";

type Link = {
  id: string;
  d: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type BlockLinksProps = {
  cards: Record<string, Card>;
  layoutKey: string;
  scroller: HTMLElement | null;
};

type Box = {
  x: number;
  left: number;
  right: number;
  midY: number;
};

function point(scroller: HTMLElement, node: HTMLElement): Box {
  const board = scroller.getBoundingClientRect();
  const box = node.getBoundingClientRect();
  return {
    x: box.left - board.left + scroller.scrollLeft + box.width / 2,
    left: box.left - board.left + scroller.scrollLeft,
    right: box.right - board.left + scroller.scrollLeft,
    midY: box.top - board.top + scroller.scrollTop + box.height / 2,
  };
}

function curve(from: Box, to: Box): Omit<Link, "id"> {
  const pad = 8;
  const sameColumn = Math.abs(from.x - to.x) < 48;
  if (sameColumn) {
    const outward = from.left < 72 ? 1 : -1;
    const x1 = outward > 0 ? from.right - pad : from.left + pad;
    const x2 = outward > 0 ? to.right - pad : to.left + pad;
    const bulge = Math.max(x1, x2) + outward * 64;
    return {
      d: `M ${x1} ${from.midY} C ${bulge} ${from.midY}, ${bulge} ${to.midY}, ${x2} ${to.midY}`,
      x1,
      y1: from.midY,
      x2,
      y2: to.midY,
    };
  }
  const rightward = from.x < to.x;
  const x1 = rightward ? from.right - pad : from.left + pad;
  const x2 = rightward ? to.left + pad : to.right - pad;
  const dx = Math.max(64, Math.abs(x2 - x1) * 0.48);
  const sweep = rightward ? dx : -dx;
  return {
    d: `M ${x1} ${from.midY} C ${x1 + sweep} ${from.midY}, ${x2 - sweep} ${to.midY}, ${x2} ${to.midY}`,
    x1,
    y1: from.midY,
    x2,
    y2: to.midY,
  };
}

function sameLinks(left: Link[], right: Link[]) {
  if (left.length !== right.length) return false;
  return left.every(
    (link, index) =>
      link.id === right[index]?.id &&
      link.d === right[index]?.d &&
      link.x1 === right[index]?.x1 &&
      link.y1 === right[index]?.y1,
  );
}

export function BlockLinks({ cards, layoutKey, scroller }: BlockLinksProps) {
  const uid = useId().replace(/:/g, "");
  const glowId = `block-glow-${uid}`;
  const [links, setLinks] = useState<Link[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const linksRef = useRef<Link[]>([]);

  useEffect(() => {
    if (!scroller) return;

    function measure() {
      if (!scroller) return;
      const next: Link[] = [];
      for (const card of Object.values(cards)) {
        if (!card.blocked || !card.blockedBy.length) continue;
        const toNode = scroller.querySelector<HTMLElement>(
          `[data-card-id="${card.id}"]`,
        );
        if (!toNode) continue;
        const to = point(scroller, toNode);
        for (const fromId of card.blockedBy) {
          const fromNode = scroller.querySelector<HTMLElement>(
            `[data-card-id="${fromId}"]`,
          );
          if (!fromNode) continue;
          next.push({
            id: `${fromId}-${card.id}`,
            ...curve(point(scroller, fromNode), to),
          });
        }
      }
      const nextSize = {
        width: Math.max(scroller.scrollWidth, scroller.clientWidth),
        height: Math.max(scroller.scrollHeight, scroller.clientHeight),
      };
      setSize((current) =>
        current.width === nextSize.width && current.height === nextSize.height
          ? current
          : nextSize,
      );
      if (sameLinks(linksRef.current, next)) return;
      linksRef.current = next;
      setLinks(next);
    }

    const frame = () => {
      window.requestAnimationFrame(measure);
    };
    frame();
    window.addEventListener("resize", frame);
    const observer = new ResizeObserver(frame);
    observer.observe(scroller);
    for (const node of scroller.querySelectorAll("[data-card-id]")) {
      observer.observe(node);
    }
    return () => {
      window.removeEventListener("resize", frame);
      observer.disconnect();
    };
  }, [cards, layoutKey, scroller]);

  if (!links.length || !size.width) return null;

  return (
    <svg
      className="pointer-events-none absolute top-0 left-0 z-20 overflow-visible text-danger"
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${size.width} ${size.height}`}
      aria-hidden="true"
    >
      <defs>
        <filter id={glowId} x="-30%" y="-50%" width="160%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {links.map((link) => (
        <g key={link.id} filter={`url(#${glowId})`}>
          <path
            d={link.d}
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d={link.d}
            pathLength={1}
            className="block-link-draw"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d={link.d}
            pathLength={1}
            className="block-link-flow"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle className="block-link-bead" r="3.25" fill="currentColor">
            <animateMotion dur="2.4s" repeatCount="indefinite" rotate="auto" path={link.d} />
          </circle>
          <circle className="block-link-bead" r="1.6" fill="currentColor" fillOpacity="0.7">
            <animateMotion
              dur="2.4s"
              begin="1.2s"
              repeatCount="indefinite"
              rotate="auto"
              path={link.d}
            />
          </circle>
          <circle
            className="block-link-pulse"
            cx={link.x1}
            cy={link.y1}
            r="7"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
          <circle cx={link.x1} cy={link.y1} r="3.25" fill="currentColor" />
          <circle cx={link.x2} cy={link.y2} r="3.25" fill="currentColor" />
          <circle cx={link.x2} cy={link.y2} r="1.4" className="fill-bg-elevated" />
        </g>
      ))}
    </svg>
  );
}
