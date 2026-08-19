import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { applyAppearance } from "@/lib/appearance";
import { AuthProvider } from "@/lib/auth/provider";
import { useProfileStore } from "@/lib/profile";
import { registerLedgerWorker } from "@/lib/sync-queue";
import appCss from "../styles.css?url";

const APP_NAME = "Ledger";
const host = import.meta.env.VITE_PUBLIC_HOSTNAME;
const ogImage = host
  ? `https://og.grok.me/v1/card.png?host=${encodeURIComponent(host)}&title=${encodeURIComponent(APP_NAME)}`
  : undefined;

const THEME_BOOT = `(function(){try{var r=localStorage.getItem("ledger-profile-v1");var t=r?JSON.parse(r).state.appearance:"dark";if(t!=="light"&&t!=="soft")t="dark";document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t==="dark"?"dark":"light";}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: "A project planning workflow from backlog to done." },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "theme-color", content: "#0c0c0d" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
          ]
        : []),
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap",
      },
    ],
  }),
  component: Root,
});

function Root() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <ThemedToaster />
        <Scripts />
      </body>
    </html>
  );
}

function ThemedToaster() {
  const appearance = useProfileStore((state) => state.appearance);

  useEffect(() => {
    void registerLedgerWorker();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const result = useProfileStore.persist.rehydrate();
    void Promise.resolve(result).then(() => {
      if (cancelled) return;
      applyAppearance(useProfileStore.getState().appearance);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    applyAppearance(appearance);
  }, [appearance]);

  return (
    <Toaster
      theme={appearance === "dark" ? "dark" : "light"}
      position="bottom-center"
      toastOptions={{
        className:
          "!bg-bg-elevated !text-fg !border-border !shadow-lift !font-sans",
      }}
    />
  );
}