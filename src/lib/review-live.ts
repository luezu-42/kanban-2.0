import { createContext, createElement, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  type Card,
  type ColumnId,
  collectAllReviewCards,
  isColumnId,
  normalizeCard,
  useBoardStore,
} from "@/lib/kanban";
import { useP2PRoom } from "@/lib/multiplayer";
import { playPrAlertChime, playReviewChime, unlockReviewChime } from "@/lib/review-chime";
import { useProfileStore } from "@/lib/profile";

const ROOM = "ledger-review";

type ReviewMessage =
  | { type: "review-enter"; card: Card }
  | { type: "review-leave"; cardId: string; dest: ColumnId | null }
  | { type: "review-snapshot"; cards: Card[] }
  | { type: "pr-alert"; cardId: string; title: string; assignee: string; on: boolean };

type ReviewLiveApi = {
  publishEnter: (card: Card) => void;
  publishLeave: (cardId: string, dest: ColumnId | null) => void;
  publishPrAlert: (card: Card, on: boolean) => void;
};

const ReviewLiveContext = createContext<ReviewLiveApi | null>(null);

function slimCard(card: Card): Card {
  return {
    ...card,
    details: card.details
      .replace(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g, "")
      .slice(0, 4000),
    images: {},
  };
}

function isReviewMessage(value: unknown): value is ReviewMessage {
  if (!value || typeof value !== "object" || !("type" in value)) return false;
  const message = value as ReviewMessage;
  if (message.type === "review-enter") return Boolean(message.card?.id);
  if (message.type === "review-leave") return typeof message.cardId === "string";
  if (message.type === "review-snapshot") return Array.isArray(message.cards);
  if (message.type === "pr-alert") {
    return typeof message.cardId === "string" && typeof message.on === "boolean";
  }
  return false;
}

function samePerson(left: string, right: string) {
  const a = left.trim().toLowerCase();
  const b = right.trim().toLowerCase();
  return Boolean(a) && a === b;
}

function pruneStampMap(map: Map<string, number>, now: number) {
  if (map.size < 40) return;
  for (const [key, at] of map) {
    if (now - at > 30_000) map.delete(key);
  }
}

function reviewIdsOf(themes: ReturnType<typeof useBoardStore.getState>["themes"]) {
  return collectAllReviewCards(themes).map((card) => card.id);
}

function useReviewLiveSession(enabled: boolean): ReviewLiveApi {
  const name = useProfileStore((state) => state.name) ?? "Guest";
  const soundOn = useProfileStore((state) => state.reviewSound);
  const p2p = useP2PRoom({ room: ROOM, name, enabled });
  const prevPeers = useRef(new Set<string>());
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;
  const nameRef = useRef(name);
  nameRef.current = name;
  const lastEnterAt = useRef(new Map<string, number>());
  const lastAlertAt = useRef(new Map<string, number>());
  const queueRef = useRef<ReviewMessage[]>([]);
  const joinedRef = useRef(false);
  joinedRef.current = p2p.joined;
  const skipPullChime = useRef(true);
  const prevReviewIds = useRef(new Set<string>());

  useEffect(() => {
    const unlock = () => unlockReviewChime();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    return p2p.onMessage((_from, data) => {
      if (!isReviewMessage(data)) return;
      if (data.type === "review-snapshot") {
        for (const card of data.cards) {
          const next = normalizeCard(card);
          if (next) useBoardStore.getState().ingestReviewCard(next);
        }
        return;
      }
      if (data.type === "review-enter") {
        const next = normalizeCard(data.card);
        if (!next) return;
        const before = collectAllReviewCards(useBoardStore.getState().themes);
        const existed = before.some((card) => card.id === next.id);
        useBoardStore.getState().ingestReviewCard(next);
        if (!existed && soundOnRef.current) playReviewChime();
        return;
      }
      if (data.type === "pr-alert") {
        useBoardStore.getState().setCardPrAlert(data.cardId, data.on);
        if (
          data.on &&
          samePerson(nameRef.current, data.assignee) &&
          soundOnRef.current
        ) {
          playPrAlertChime();
        }
        return;
      }
      const dest =
        data.dest && isColumnId(data.dest) && data.dest !== "review" ? data.dest : null;
      useBoardStore.getState().applyReviewLeave(data.cardId, dest);
    });
  }, [p2p.onMessage]);

  const reviewKey = useBoardStore((state) =>
    state.themes.map((theme) => theme.order.review.join(",")).join("|"),
  );
  useEffect(() => {
    const ids = new Set(reviewIdsOf(useBoardStore.getState().themes));
    if (skipPullChime.current) {
      skipPullChime.current = false;
      prevReviewIds.current = ids;
      return;
    }
    const added = [...ids].filter((id) => !prevReviewIds.current.has(id));
    prevReviewIds.current = ids;
    if (added.length && !p2p.joined && soundOnRef.current) playReviewChime();
  }, [reviewKey, p2p.joined]);

  useEffect(() => {
    if (!p2p.joined) return;
    const queued = queueRef.current;
    if (!queued.length) return;
    queueRef.current = [];
    for (const message of queued) p2p.send(message);
  }, [p2p.joined, p2p.send]);

  const peerKey = p2p.peers.map((peer) => peer.id).join("|");
  useEffect(() => {
    const now = new Set(peerKey ? peerKey.split("|") : []);
    const added = [...now].filter((id) => !prevPeers.current.has(id));
    const remaining = [p2p.selfId, ...prevPeers.current].sort();
    if (added.length && remaining[0] === p2p.selfId) {
      const cards = collectAllReviewCards(useBoardStore.getState().themes).map(slimCard);
      const payload: ReviewMessage = { type: "review-snapshot", cards };
      for (const id of added) p2p.send(payload, id);
    }
    prevPeers.current = now;
  }, [peerKey, p2p.selfId, p2p.send]);

  return useMemo(
    () => {
      const sendOrQueue = (message: ReviewMessage) => {
        if (joinedRef.current) p2p.send(message);
        else queueRef.current.push(message);
      };
      return {
        publishEnter(card: Card) {
          const now = Date.now();
          pruneStampMap(lastEnterAt.current, now);
          const previous = lastEnterAt.current.get(card.id) ?? 0;
          if (now - previous < 2500) return;
          lastEnterAt.current.set(card.id, now);
          sendOrQueue({ type: "review-enter", card: slimCard(card) });
          if (soundOnRef.current) playReviewChime();
        },
        publishLeave(cardId: string, dest: ColumnId | null) {
          sendOrQueue({ type: "review-leave", cardId, dest });
        },
        publishPrAlert(card: Card, on: boolean) {
          const key = `${card.id}:${on ? "on" : "off"}`;
          const now = Date.now();
          pruneStampMap(lastAlertAt.current, now);
          const previous = lastAlertAt.current.get(key) ?? 0;
          if (now - previous < 2500) return;
          lastAlertAt.current.set(key, now);
          sendOrQueue({
            type: "pr-alert",
            cardId: card.id,
            title: card.title,
            assignee: card.assignee,
            on,
          });
          if (on && samePerson(nameRef.current, card.assignee) && soundOnRef.current) {
            playPrAlertChime();
          }
        },
      };
    },
    [p2p.send],
  );
}

export function ReviewLiveProvider({ children }: { children: ReactNode }) {
  const [armed, setArmed] = useState(false);
  const hasReview = useBoardStore((state) =>
    state.themes.some((theme) => theme.order.review.length > 0),
  );
  const enabled = hasReview || armed;
  const session = useReviewLiveSession(enabled);
  const value = useMemo<ReviewLiveApi>(
    () => ({
      publishEnter(card) {
        setArmed(true);
        session.publishEnter(card);
      },
      publishLeave(cardId, dest) {
        setArmed(true);
        session.publishLeave(cardId, dest);
      },
      publishPrAlert(card, on) {
        setArmed(true);
        session.publishPrAlert(card, on);
      },
    }),
    [session],
  );
  return createElement(ReviewLiveContext.Provider, { value }, children);
}

export function useReviewLive(): ReviewLiveApi {
  const context = useContext(ReviewLiveContext);
  if (context) return context;
  return {
    publishEnter() {},
    publishLeave() {},
    publishPrAlert() {},
  };
}
