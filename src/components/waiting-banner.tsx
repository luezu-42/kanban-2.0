import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function WaitingBanner({ text }: { text: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const measure = measureRef.current;
    if (!box || !measure) return;

    function update() {
      if (!box || !measure) return;
      setOverflows(measure.scrollWidth > box.clientWidth + 2);
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => observer.disconnect();
  }, [text]);

  const duration = `${Math.max(8, Math.round(text.length * 0.28))}s`;

  return (
    <div
      ref={boxRef}
      className={cn(
        "waiting-banner relative mt-2 overflow-hidden rounded-xs bg-waiting/15 px-2 py-1 text-xs text-waiting",
        overflows && "waiting-banner-scroll",
      )}
      style={{ ["--waiting-marquee-duration" as string]: duration }}
      title={text}
    >
      <span ref={measureRef} className="invisible absolute whitespace-nowrap">
        {text}
      </span>
      {overflows ? (
        <p className="waiting-marquee whitespace-nowrap" aria-label={text}>
          <span className="inline-block pr-8">{text}</span>
          <span className="inline-block pr-8" aria-hidden="true">
            {text}
          </span>
        </p>
      ) : (
        <p className={cn("truncate")}>{text}</p>
      )}
    </div>
  );
}
