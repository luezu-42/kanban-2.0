import { createFileRoute } from "@tanstack/react-router";

const authDisabled = import.meta.env.VITE_AUTH_ENABLED === "false";

async function handleAuth({ request }: { request: Request }) {
  if (authDisabled) {
    return new Response(JSON.stringify({ error: "auth disabled" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }
  const { auth } = await import("@/lib/auth/server");
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: handleAuth,
      POST: handleAuth,
    },
  },
});
