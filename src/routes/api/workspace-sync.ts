import { createFileRoute } from "@tanstack/react-router";
import { parseBoardPayload } from "@/lib/kanban";
import { commitWorkspacePayload } from "@/lib/workspace.server";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

async function handlePost({ request }: { request: Request }) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid JSON" }, 400);
  }
  const value = (body ?? {}) as {
    token?: unknown;
    themes?: unknown;
    activeThemeId?: unknown;
    version?: unknown;
  };
  if (typeof value.token !== "string" || !value.token) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
  const parsed = parseBoardPayload({
    themes: value.themes,
    activeThemeId: value.activeThemeId,
  });
  if (!parsed) return json({ ok: false, error: "invalid board" }, 400);
  const version = typeof value.version === "number" && Number.isFinite(value.version) ? value.version : 0;
  try {
    const result = await commitWorkspacePayload(
      parsed.themes,
      parsed.activeThemeId,
      value.token,
      version,
    );
    if (!result.ok && result.reason === "conflict") {
      return json(result, 409);
    }
    return json(result, result.ok ? 200 : 400);
  } catch {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
}

export const Route = createFileRoute("/api/workspace-sync")({
  server: {
    handlers: {
      POST: handlePost,
    },
  },
});
