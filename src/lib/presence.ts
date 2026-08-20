import { useEffect, useState } from "react";

const ROOM = "ledger-here";
const TICK_MS = 4000;

export type PresencePeer = {
  id: string;
  name: string;
  themeName: string;
};

function encodeLabel(name: string, themeName: string) {
  const who = name.trim().slice(0, 28) || "Guest";
  const where = themeName.trim().slice(0, 28) || "Board";
  return `${who} · ${where}`.slice(0, 64);
}

function parseLabel(raw: string): Pick<PresencePeer, "name" | "themeName"> {
  const split = raw.split(" · ");
  if (split.length >= 2) {
    return { name: split[0]!.trim() || "Guest", themeName: split.slice(1).join(" · ").trim() };
  }
  return { name: raw.trim() || "Guest", themeName: "" };
}

export function usePresence({
  name,
  themeName,
  enabled,
}: {
  name: string;
  themeName: string;
  enabled: boolean;
}) {
  const [selfId] = useState(() => `p-${Math.random().toString(36).slice(2, 10)}`);
  const [peers, setPeers] = useState<PresencePeer[]>([]);

  useEffect(() => {
    if (!enabled) {
      setPeers([]);
      return;
    }
    let cancelled = false;
    let timer = 0;

    async function tick() {
      try {
        const params = new URLSearchParams({
          room: ROOM,
          peer: selfId,
          name: encodeLabel(name, themeName),
          since: "0",
        });
        const response = await fetch(`/api/rtc?${params}`);
        if (!response.ok || cancelled) return;
        const body = (await response.json()) as {
          peers?: Array<{ id: string; name: string }>;
        };
        const next = (body.peers ?? [])
          .filter((peer) => peer.id !== selfId)
          .map((peer) => ({ id: peer.id, ...parseLabel(peer.name) }));
        if (!cancelled) setPeers(next);
      } catch {
        // Presence is decorative; a missed beat is fine.
      }
    }

    void tick();
    timer = window.setInterval(() => void tick(), TICK_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      void fetch("/api/rtc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "leave", room: ROOM, peer: selfId }),
        keepalive: true,
      }).catch(() => {});
    };
  }, [enabled, name, themeName, selfId]);

  return { selfId, peers };
}
