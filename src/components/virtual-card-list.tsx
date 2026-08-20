import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const OVERSCAN = 5;

export function VirtualCardList({
  count,
  estimate,
  enabled,
  contained = false,
  children,
}: {
  count: number;
  estimate: number;
  enabled: boolean;
  contained?: boolean;
  children: (range: { start: number; end: number }) => ReactNode;
}) {
  const scroller = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(estimate * 8);
  const virtual = contained && enabled && count > 0;

  useEffect(() => {
    const node = scroller.current;
    if (!node || !virtual) return;
    const onScroll = () => setScrollTop(node.scrollTop);
    const frame = window.requestAnimationFrame(() => {
      setHeight(node.clientHeight || estimate * 8);
    });
    node.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(() => {
      setHeight(node.clientHeight || estimate * 8);
    });
    observer.observe(node);
    return () => {
      window.cancelAnimationFrame(frame);
      node.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [virtual, estimate]);

  if (!contained) {
    return <>{children({ start: 0, end: count })}</>;
  }

  if (!virtual) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {children({ start: 0, end: count })}
      </div>
    );
  }

  const start = Math.max(0, Math.floor(scrollTop / estimate) - OVERSCAN);
  const visible = Math.ceil(height / estimate) + OVERSCAN * 2;
  const end = Math.min(count, start + visible);
  const padTop = start * estimate;
  const padBottom = Math.max(0, (count - end) * estimate);

  return (
    <div
      ref={scroller}
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain")}
    >
      <div style={{ height: padTop }} />
      {children({ start, end })}
      <div style={{ height: padBottom }} />
    </div>
  );
}
