import { createFileRoute } from "@tanstack/react-router";

const ASSET_ID = /^[a-zA-Z0-9_-]{1,64}$/;

function unauthorized() {
  return new Response("Unauthorized", {
    status: 401,
    headers: { "cache-control": "no-store" },
  });
}

function notFound() {
  return new Response("Not found", {
    status: 404,
    headers: { "cache-control": "no-store" },
  });
}

async function handleGet({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  const token = request.headers.get("x-ledger-unlock") ?? "";
  if (!token) return unauthorized();
  try {
    const { assertUnlock } = await import("@/lib/workspace-gate.server");
    await assertUnlock(token);
  } catch {
    return unauthorized();
  }

  const id = params.id.trim();
  if (!ASSET_ID.test(id)) return notFound();
  const { readAssetData } = await import("@/lib/board-rows.server");
  const data = await readAssetData(id);
  if (!data || !data.startsWith("data:image/")) return notFound();

  const comma = data.indexOf(",");
  if (comma < 0) return notFound();
  const meta = data.slice(0, comma);
  const payload = data.slice(comma + 1);
  const mime = meta.match(/^data:(image\/[a-zA-Z0-9.+-]+)/)?.[1] ?? "application/octet-stream";
  if (mime.includes("svg")) return notFound();

  let body: ArrayBuffer;
  try {
    const raw = Buffer.from(payload, "base64");
    body = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer;
  } catch {
    return notFound();
  }

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": mime,
      "cache-control": "private, max-age=604800",
      "x-content-type-options": "nosniff",
    },
  });
}

export const Route = createFileRoute("/api/assets/$id")({
  server: {
    handlers: {
      GET: handleGet,
    },
  },
});
