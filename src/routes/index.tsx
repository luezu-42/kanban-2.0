import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const HomePage = lazy(() =>
  import("@/components/home-page").then((mod) => ({ default: mod.HomePage })),
);

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-bg" />}>
      <HomePage />
    </Suspense>
  );
}
