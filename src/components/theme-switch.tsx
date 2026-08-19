import { Moon, Sun, Sunset } from "lucide-react";
import { applyAppearance } from "@/lib/appearance";
import { APPEARANCES, type Appearance, useProfileStore } from "@/lib/profile";
import { cn } from "@/lib/utils";

const LABEL: Record<Appearance, string> = {
  dark: "Dark",
  light: "Light",
  soft: "Soft",
};

const ICON: Record<Appearance, typeof Moon> = {
  dark: Moon,
  light: Sun,
  soft: Sunset,
};

export function ThemeSwitch() {
  const appearance = useProfileStore((state) => state.appearance);
  const setAppearance = useProfileStore((state) => state.setAppearance);

  function choose(next: Appearance) {
    setAppearance(next);
    applyAppearance(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className="inline-flex rounded-lg bg-surface p-0.5 shadow-border"
    >
      {APPEARANCES.map((item) => {
        const Icon = ICON[item];
        const selected = item === appearance;
        return (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => choose(item)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors duration-150",
              selected ? "bg-bg-elevated text-fg shadow-border" : "text-muted hover:text-fg",
            )}
          >
            <Icon className="size-3.5" />
            {LABEL[item]}
          </button>
        );
      })}
    </div>
  );
}
