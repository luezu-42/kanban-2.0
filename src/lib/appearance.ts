import type { Appearance } from "@/lib/profile";

export function applyAppearance(appearance: Appearance) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = appearance;
  document.documentElement.style.colorScheme = appearance === "dark" ? "dark" : "light";
}
