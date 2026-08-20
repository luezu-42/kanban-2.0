import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { g as require_jsx_runtime } from "../_libs/@excalidraw/excalidraw+[...].mjs";
import { C as require_react_dom, _ as CSS, a as PointerSensor, c as defaultDropAnimationSideEffects, g as useSensors, h as useSensor, i as KeyboardSensor, m as useDroppable, n as DragOverlay, o as TouchSensor, s as closestCorners, t as DndContext } from "../_libs/@dnd-kit/core+[...].mjs";
import { a as verticalListSortingStrategy, i as useSortable, r as sortableKeyboardCoordinates, t as SortableContext } from "../_libs/dnd-kit__sortable.mjs";
import { r as create } from "../_libs/zustand.mjs";
import { A as listWhiteboardImages, B as replaceWhiteboardImages, C as findColumnOf, D as isColumnId, E as isAllowedImageDataUrl, F as optimizeDataUrl, G as useBoardStore, H as selectActiveTheme, L as parseColumnId, N as normalizeCard, R as parseExternalUrl, U as stripWhiteboardDataUrls, W as themeCardCount, a as boardColumnCounts, c as canEnterColumn, d as collectPlanningCards, f as columnAllowsCreate, h as compactThemeImages, i as adjacentColumn, k as listThemeCards, l as cardLinkKey, m as columnMeta, n as COLUMNS, o as boardHistoryGate, p as columnDroppableId, q as whiteboardFileAssetId, r as COLUMN_IDS, s as boardSignature, t as ASSET_PREFIX, u as collectAllReviewCards } from "./kanban-CtoXHh96.mjs";
import { a as loadProfile, d as saveWorkspaceAsset, f as unlockWorkspace, i as claimAssignee, l as saveProfile, o as loadWorkspace, r as checkUnlock, s as loadWorkspaceAssets, u as saveWorkspace } from "./board-rows.server-DSnb0Mmn.mjs";
import { A as Ellipsis, C as LayoutGrid, D as GitPullRequest, F as ChevronsDownUp, H as ArrowRight, I as ChevronRight, L as ChevronLeft, O as FileText, P as ChevronsUpDown, R as ChevronDown, V as Ban, _ as Plus, a as Volume2, b as Moon, c as TriangleAlert, d as Sun, g as Redo2, h as RefreshCw, i as VolumeX, j as Download, l as Trash2, o as UserRound, p as Search, r as WifiOff, s as Undo2, t as X, u as Sunset, v as Pencil, x as Megaphone, y as PenLine } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Overlay2, c as Title2, d as DialogContent$1, f as DialogDescription$1, h as DialogTitle$1, i as Description2, l as Dialog$1, m as DialogPortal$1, n as Cancel, o as Portal2, p as DialogOverlay$1, r as Content2, s as Root2, t as Action, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as buttonVariants, c as enqueueWorkspaceSync, d as requestSyncRetry, h as useProfileStore, i as applyAppearance, l as errorMessage, m as triggerDownload, n as Button, o as clearWorkspaceSync, p as subscribeSyncMessages, r as SYNC_RETRY_EVENT, s as cn, t as APPEARANCES, u as isOffline } from "./router-YokSpP1N.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { t as formatDistanceToNowStrict } from "../_libs/date-fns.mjs";
import { a as Trigger, i as Root2$1, n as Item2, r as Portal2$1, t as Content2$1 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { t as _e } from "../_libs/cmdk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/asset-cache-BXVgVX3n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var memory = /* @__PURE__ */ new Map();
var listeners$1 = /* @__PURE__ */ new Set();
var generation = 0;
var DB_NAME = "ledger-assets";
var STORE = "blobs";
function emit$1() {
	generation += 1;
	for (const listener of listeners$1) listener();
}
function subscribeAssets(listener) {
	listeners$1.add(listener);
	return () => {
		listeners$1.delete(listener);
	};
}
function getAssetGeneration() {
	return generation;
}
function assetIdFromSrc(src) {
	if (src.startsWith("asset:")) return src.slice(ASSET_PREFIX.length);
	return null;
}
function resolveAsset(src) {
	const id = assetIdFromSrc(src);
	if (!id) return src;
	return memory.get(id) ?? src;
}
function useAssetGeneration() {
	return (0, import_react.useSyncExternalStore)(subscribeAssets, getAssetGeneration, () => 0);
}
function rememberAssets(rows) {
	let changed = false;
	for (const row of rows) {
		if (!row.id || !row.data) continue;
		if (memory.get(row.id) === row.data) continue;
		memory.set(row.id, row.data);
		changed = true;
	}
	if (changed) emit$1();
}
function openDb() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);
		request.onupgradeneeded = () => {
			if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
async function readIdb(ids) {
	if (typeof indexedDB === "undefined" || !ids.length) return [];
	try {
		const db = await openDb();
		const rows = await new Promise((resolve, reject) => {
			const store = db.transaction(STORE, "readonly").objectStore(STORE);
			const found = [];
			let pending = ids.length;
			if (!pending) {
				resolve(found);
				return;
			}
			for (const id of ids) {
				const get = store.get(id);
				get.onsuccess = () => {
					const value = get.result;
					if (typeof value === "string" && value) found.push({
						id,
						data: value
					});
					pending -= 1;
					if (pending === 0) resolve(found);
				};
				get.onerror = () => reject(get.error);
			}
		});
		db.close();
		return rows;
	} catch {
		return [];
	}
}
async function writeIdb(rows) {
	if (typeof indexedDB === "undefined" || !rows.length) return;
	try {
		const db = await openDb();
		await new Promise((resolve, reject) => {
			const tx = db.transaction(STORE, "readwrite");
			const store = tx.objectStore(STORE);
			for (const row of rows) store.put(row.data, row.id);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
		db.close();
	} catch {}
}
async function fetchAssetRows(ids, token) {
	const rows = [];
	for (const id of ids) try {
		const response = await fetch(`/api/assets/${encodeURIComponent(id)}`, { headers: { "x-ledger-unlock": token } });
		if (!response.ok) continue;
		const data = await blobToDataUrl(await response.blob());
		if (data.startsWith("data:image/")) rows.push({
			id,
			data
		});
	} catch {}
	return rows;
}
function blobToDataUrl(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result ?? ""));
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read image."));
		reader.readAsDataURL(blob);
	});
}
async function ensureAssets(ids, loadMissing) {
	const missing = [...new Set(ids.filter(Boolean))].filter((id) => !memory.has(id));
	if (!missing.length) return;
	const cached = await readIdb(missing);
	if (cached.length) rememberAssets(cached);
	const still = missing.filter((id) => !memory.has(id));
	if (!still.length) return;
	const remote = await loadMissing(still);
	if (!remote.length) return;
	rememberAssets(remote);
	writeIdb(remote);
}
function collectAssetIdsFromThemes(themes) {
	const ids = [];
	for (const theme of themes) {
		for (const card of Object.values(theme.cards)) for (const src of Object.values(card.images)) {
			const id = assetIdFromSrc(src);
			if (id) ids.push(id);
		}
		const board = theme.whiteboard;
		for (const file of Object.values(board?.files ?? {})) {
			if (typeof file.src !== "string") continue;
			const id = assetIdFromSrc(file.src);
			if (id) ids.push(id);
		}
		for (const node of board?.nodes ?? []) {
			if (node.type !== "image" || typeof node.src !== "string") continue;
			const id = assetIdFromSrc(node.src);
			if (id) ids.push(id);
		}
	}
	return ids;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/routes-COmF4DMp.js
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-bg/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed top-1/2 left-1/2 z-50 grid w-[min(calc(100%-2rem),28rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-bg-elevated p-6 shadow-lift duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute top-3 right-3 grid size-11 place-items-center rounded-md text-muted transition-[color,background-color] duration-150 hover:bg-surface hover:text-fg focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:outline-none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5 pr-8", className),
		...props
	});
}
function DialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("font-display text-xl font-medium tracking-tight text-fg", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var UNLOCK_KEY = "ledger-unlock-token";
function readStore(store) {
	if (!store) return "";
	try {
		return store.getItem("ledger-unlock-token") ?? "";
	} catch {
		return "";
	}
}
function writeStore(store, token) {
	if (!store) return;
	try {
		if (token) store.setItem(UNLOCK_KEY, token);
		else store.removeItem(UNLOCK_KEY);
	} catch {}
}
function getUnlockToken() {
	if (typeof window === "undefined") return "";
	const local = readStore(window.localStorage);
	if (local) return local;
	const session = readStore(window.sessionStorage);
	if (session) {
		writeStore(window.localStorage, session);
		return session;
	}
	return "";
}
function setUnlockToken(token) {
	if (typeof window === "undefined") return;
	writeStore(window.localStorage, token);
	writeStore(window.sessionStorage, token);
}
var FAST_POLL_MS = 400;
var IDLE_POLL_MS = 2500;
var HIDDEN_POLL_MS = 1e4;
var PING_INTERVAL_MS = 4e3;
var STALL_MS = 1e4;
var MAX_RECOVERY_ATTEMPTS = 3;
var SIGNAL_RETRY_DELAYS_MS = [250, 750];
function defaultIceServers() {
	return [{ urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }];
}
var P2PRoom = class {
	opts;
	peers = /* @__PURE__ */ new Map();
	/** Per-remote-peer signal delivery chains (order-preserving). */
	signalQueues = /* @__PURE__ */ new Map();
	cursor = 0;
	pollTimer = null;
	pingTimer = null;
	closed = false;
	everPolled = false;
	lastPeersFingerprint = "";
	onVisibility = () => {
		if (this.closed) return;
		if (document.visibilityState === "visible") this.poll();
		else this.schedulePoll(HIDDEN_POLL_MS);
	};
	constructor(opts) {
		this.opts = opts;
	}
	/**
	* The first poll IS the join: it registers this peer and returns the
	* roster. A failed first poll (cold DB, offline tab) must not strand the
	* room: the loop and timers start regardless and the next poll retries.
	*/
	async join() {
		try {
			await this.pollOnce();
		} catch {}
		if (this.closed) return;
		this.schedulePoll(this.nextPollDelay());
		this.pingTimer = setInterval(() => {
			this.pingAll();
			this.watchdog();
		}, PING_INTERVAL_MS);
		document.addEventListener("visibilitychange", this.onVisibility);
	}
	close() {
		this.closed = true;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		if (this.pingTimer) clearInterval(this.pingTimer);
		document.removeEventListener("visibilitychange", this.onVisibility);
		for (const slot of this.peers.values()) {
			slot.pc.onicecandidate = null;
			slot.pc.onconnectionstatechange = null;
			slot.pc.onnegotiationneeded = null;
			slot.pc.ondatachannel = null;
			slot.pc.close();
		}
		this.peers.clear();
		this.signalQueues.clear();
		fetch("/api/rtc", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				op: "leave",
				room: this.opts.room,
				peer: this.opts.selfId
			}),
			keepalive: true
		}).catch(() => {});
	}
	/** Send on the unreliable game-state channel (drops stale packets). */
	broadcast(data) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		for (const slot of this.peers.values()) if (slot.state?.readyState === "open") try {
			slot.state.send(wire);
		} catch {}
	}
	/** Send reliably (ordered) to one peer, or to all when peerId is omitted. */
	send(data, peerId) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		const targets = peerId ? [this.peers.get(peerId)] : [...this.peers.values()];
		for (const slot of targets) if (slot?.reliable?.readyState === "open") try {
			slot.reliable.send(wire);
		} catch {}
	}
	peerList() {
		return [...this.peers.values()].map((s) => ({ ...s.info }));
	}
	nextPollDelay() {
		if (typeof document !== "undefined" && document.visibilityState === "hidden") return HIDDEN_POLL_MS;
		return this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS;
	}
	schedulePoll(delay) {
		if (this.closed) return;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.pollTimer = setTimeout(() => void this.poll(), delay);
	}
	anyPairConnecting() {
		for (const s of this.peers.values()) {
			if (s.terminal) continue;
			if (s.info.connectionState !== "connected") return true;
		}
		return false;
	}
	async pollOnce() {
		const params = new URLSearchParams({
			room: this.opts.room,
			peer: this.opts.selfId,
			name: this.opts.name ?? "",
			since: String(this.cursor)
		});
		const res = await fetch(`/api/rtc?${params}`);
		if (this.closed) return;
		if (!res.ok) throw new Error(`signaling poll failed: ${res.status}`);
		const body = await res.json();
		if (this.closed) return;
		if (!this.everPolled) {
			this.everPolled = true;
			this.opts.onConnected?.();
		}
		this.reconcileRoster(body.peers);
		const roster = new Set(body.peers.map((p) => p.id));
		for (const sig of body.signals) {
			this.cursor = Math.max(this.cursor, sig.id);
			await this.onSignal(sig.from, sig.kind, sig.payload, roster);
			if (this.closed) return;
		}
	}
	async poll() {
		if (this.closed) return;
		try {
			await this.pollOnce();
		} catch {}
		this.schedulePoll(this.nextPollDelay());
	}
	reconcileRoster(peers) {
		const alive = new Set(peers.map((p) => p.id));
		for (const p of peers) {
			if (p.id === this.opts.selfId) continue;
			const existing = this.peers.get(p.id);
			if (existing) existing.info.name = p.name;
			else this.connectTo(p.id, p.name, this.opts.selfId > p.id);
		}
		for (const [id, slot] of this.peers) if (!alive.has(id)) {
			slot.pc.close();
			this.peers.delete(id);
			this.signalQueues.delete(id);
		}
		this.emitPeers();
	}
	connectTo(peerId, name, initiator) {
		if (this.closed) return null;
		const pc = new RTCPeerConnection({ iceServers: this.opts.iceServers ?? defaultIceServers() });
		const slot = {
			pc,
			makingOffer: false,
			ignoreOffer: false,
			pendingCandidates: [],
			lastProgressAt: Date.now(),
			recoveryAttempts: 0,
			info: {
				id: peerId,
				name,
				connectionState: pc.connectionState,
				candidateType: null,
				rttMs: null
			}
		};
		this.peers.set(peerId, slot);
		pc.onicecandidate = (e) => {
			if (e.candidate) this.sendSignal(peerId, "ice", e.candidate.toJSON());
		};
		pc.onconnectionstatechange = () => {
			slot.info.connectionState = pc.connectionState;
			if (pc.connectionState === "connecting" || pc.connectionState === "connected") slot.lastProgressAt = Date.now();
			if (pc.connectionState === "connected") {
				slot.recoveryAttempts = 0;
				slot.terminal = false;
				this.readCandidateType(slot);
			}
			this.emitPeers();
			if (pc.connectionState === "failed") pc.restartIce();
			if (pc.connectionState === "failed" || pc.connectionState === "disconnected") this.schedulePoll(FAST_POLL_MS);
		};
		pc.onnegotiationneeded = async () => {
			try {
				slot.makingOffer = true;
				await pc.setLocalDescription();
				await this.sendSignal(peerId, "offer", pc.localDescription.toJSON());
			} catch {} finally {
				slot.makingOffer = false;
			}
		};
		pc.ondatachannel = (e) => this.attachChannel(slot, e.channel);
		if (initiator) {
			this.attachChannel(slot, pc.createDataChannel("state", {
				ordered: false,
				maxRetransmits: 0
			}));
			this.attachChannel(slot, pc.createDataChannel("reliable", { ordered: true }));
		}
		return slot;
	}
	attachChannel(slot, channel) {
		if (channel.label === "state") slot.state = channel;
		else slot.reliable = channel;
		channel.onopen = () => {
			slot.lastProgressAt = Date.now();
		};
		channel.onmessage = (e) => {
			let msg;
			try {
				msg = JSON.parse(e.data);
			} catch {
				return;
			}
			if (msg.t === "ping") {
				if (slot.state?.readyState === "open") slot.state.send(JSON.stringify({ t: "pong" }));
			} else if (msg.t === "pong") {
				if (slot.pingSentAt) {
					slot.info.rttMs = Math.round(performance.now() - slot.pingSentAt);
					slot.pingSentAt = void 0;
					this.emitPeers();
				}
			} else this.opts.onMessage?.(slot.info.id, msg.d, channel.label === "state" ? "state" : "reliable");
		};
	}
	/** Apply buffered ICE candidates once a remote description is in place. */
	async flushPendingCandidates(slot) {
		while (slot.pendingCandidates.length > 0) {
			const candidate = slot.pendingCandidates.shift();
			try {
				await slot.pc.addIceCandidate(candidate);
			} catch (err) {
				if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
			}
			if (this.closed) return;
		}
	}
	async onSignal(from, kind, payload, roster) {
		if (this.closed) return;
		let slot = this.peers.get(from);
		if (!slot) {
			if (!roster.has(from)) return;
			const created = this.connectTo(from, "", false);
			if (!created) return;
			slot = created;
		}
		const polite = this.opts.selfId < from;
		try {
			if (kind === "offer" || kind === "answer") {
				const description = payload;
				const collision = kind === "offer" && (slot.makingOffer || slot.pc.signalingState !== "stable");
				slot.ignoreOffer = !polite && collision;
				if (slot.ignoreOffer) return;
				try {
					await slot.pc.setRemoteDescription(description);
				} catch (err) {
					if (kind !== "offer" || slot.recreatedForOffer) throw err;
					const attempts = slot.recoveryAttempts;
					const name = slot.info.name;
					slot.pc.close();
					this.peers.delete(from);
					const fresh = this.connectTo(from, name, false);
					if (!fresh) return;
					fresh.recoveryAttempts = attempts;
					fresh.recreatedForOffer = true;
					slot = fresh;
					await slot.pc.setRemoteDescription(description);
				}
				if (this.closed) return;
				await this.flushPendingCandidates(slot);
				if (this.closed) return;
				if (kind === "offer") {
					await slot.pc.setLocalDescription();
					if (this.closed) return;
					await this.sendSignal(from, "answer", slot.pc.localDescription.toJSON());
				}
			} else if (kind === "ice") {
				const candidate = payload;
				if (!slot.pc.remoteDescription) {
					slot.pendingCandidates.push(candidate);
					if (slot.pendingCandidates.length > 24) slot.pendingCandidates.shift();
					return;
				}
				try {
					await slot.pc.addIceCandidate(candidate);
				} catch (err) {
					if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
				}
			}
		} catch {}
	}
	/**
	* Signals are serialized per remote peer (a candidate must never overtake
	* its SDP into the DB) and retried on failure with short backoff.
	*/
	sendSignal(to, kind, payload) {
		const next = (this.signalQueues.get(to) ?? Promise.resolve()).then(() => this.postSignal(to, kind, payload));
		this.signalQueues.set(to, next.catch(() => {}));
		return next;
	}
	async postSignal(to, kind, payload) {
		for (let attempt = 0;; attempt++) {
			if (this.closed) return;
			try {
				const res = await fetch("/api/rtc", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						op: "signal",
						room: this.opts.room,
						from: this.opts.selfId,
						to,
						kind,
						payload
					})
				});
				if (res.ok) return;
				throw new Error(`signal POST failed: ${res.status}`);
			} catch (err) {
				if (attempt >= SIGNAL_RETRY_DELAYS_MS.length) {
					console.warn(`[p2p] signal ${kind} to ${to} failed after retries`, err);
					return;
				}
				await new Promise((r) => setTimeout(r, SIGNAL_RETRY_DELAYS_MS[attempt]));
			}
		}
	}
	pingAll() {
		const wire = JSON.stringify({ t: "ping" });
		for (const slot of this.peers.values()) {
			if (slot.state?.readyState !== "open") continue;
			const stale = slot.pingSentAt !== void 0 && performance.now() - slot.pingSentAt > 2 * PING_INTERVAL_MS;
			if (slot.pingSentAt === void 0 || stale) {
				slot.pingSentAt = performance.now();
				slot.state.send(wire);
			}
		}
	}
	/**
	* Stuck-pair recovery, piggybacked on the ping interval. A pair that has
	* made no progress for STALL_MS gets rebuilt by the dialer with a FRESH
	* RTCPeerConnection (new DTLS identity — fixes the suspend/resume
	* fingerprint wedge). After MAX_RECOVERY_ATTEMPTS the pair is terminal:
	* visible to the app as its last connectionState, ignored by fast-poll.
	*/
	watchdog() {
		if (this.closed) return;
		const now = Date.now();
		for (const [peerId, slot] of this.peers) {
			const live = slot.pc.connectionState;
			if (live !== slot.info.connectionState) {
				slot.info.connectionState = live;
				if (live === "connecting" || live === "connected") slot.lastProgressAt = now;
				this.emitPeers();
			}
			if (slot.terminal || live === "connected") continue;
			if (now - slot.lastProgressAt <= STALL_MS) continue;
			if (slot.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
				slot.terminal = true;
				this.emitPeers();
				continue;
			}
			slot.recoveryAttempts += 1;
			slot.lastProgressAt = now;
			if (this.opts.selfId > peerId) {
				const { name } = slot.info;
				const attempts = slot.recoveryAttempts;
				slot.pc.close();
				this.peers.delete(peerId);
				const fresh = this.connectTo(peerId, name, true);
				if (fresh) fresh.recoveryAttempts = attempts;
				this.schedulePoll(FAST_POLL_MS);
			}
		}
	}
	async readCandidateType(slot) {
		try {
			const stats = await slot.pc.getStats();
			let selected;
			stats.forEach((s) => {
				if (s.type === "candidate-pair" && s.nominated) selected = s;
			});
			const localId = selected?.localCandidateId;
			if (localId) {
				const local = stats.get(localId);
				slot.info.candidateType = local?.candidateType ?? null;
				this.emitPeers();
			}
		} catch {}
	}
	emitPeers() {
		const list = this.peerList();
		const fingerprint = JSON.stringify(list.map((p) => [
			p.id,
			p.name,
			p.connectionState,
			p.candidateType,
			p.rttMs
		]));
		if (fingerprint === this.lastPeersFingerprint) return;
		this.lastPeersFingerprint = fingerprint;
		this.opts.onPeersChanged?.(list);
	}
};
/**
* React binding for P2PRoom. Identity and room id are captured once on mount
* (useState initializers) so re-renders never tear down the mesh.
*/
function useP2PRoom(options) {
	const [selfId] = (0, import_react.useState)(() => `p-${Math.random().toString(36).slice(2, 10)}`);
	const [room] = (0, import_react.useState)(() => options.room);
	const [name] = (0, import_react.useState)(() => options.name ?? selfId);
	const enabled = options.enabled !== false;
	const [peers, setPeers] = (0, import_react.useState)([]);
	const [joined, setJoined] = (0, import_react.useState)(false);
	const roomRef = (0, import_react.useRef)(null);
	const listeners = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		if (!enabled) {
			setJoined(false);
			setPeers([]);
			return;
		}
		const p2p = new P2PRoom({
			room,
			selfId,
			name,
			onPeersChanged: (list) => {
				setPeers((current) => {
					if (current.length === list.length && current.every((peer, index) => peer.id === list[index]?.id && peer.name === list[index]?.name && peer.connectionState === list[index]?.connectionState)) return current;
					return list;
				});
			},
			onMessage: (from, data, channel) => {
				for (const fn of listeners.current) fn(from, data, channel);
			},
			onConnected: () => setJoined(true)
		});
		roomRef.current = p2p;
		p2p.join();
		return () => {
			roomRef.current = null;
			p2p.close();
			setJoined(false);
			setPeers([]);
		};
	}, [
		room,
		selfId,
		name,
		enabled
	]);
	return {
		selfId,
		room,
		peers,
		joined,
		broadcast: (0, import_react.useCallback)((data) => roomRef.current?.broadcast(data), []),
		send: (0, import_react.useCallback)((data, peerId) => roomRef.current?.send(data, peerId), []),
		onMessage: (0, import_react.useCallback)((fn) => {
			listeners.current.add(fn);
			return () => {
				listeners.current.delete(fn);
			};
		}, [])
	};
}
var VOTE_VALUES = [
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13
];
function planningDeck(themes) {
	return collectPlanningCards(themes).map((card) => slimCard$1(card));
}
function slimCard$1(card) {
	return {
		id: card.id,
		themeId: card.themeId,
		themeName: card.themeName,
		title: card.title,
		description: card.description,
		details: slimDetails(card.details),
		images: {},
		duration: card.duration
	};
}
function slimDetails(details) {
	const withoutHugeImages = details.replace(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g, "");
	return withoutHugeImages.length > 12e3 ? withoutHugeImages.slice(0, 12e3) : withoutHugeImages;
}
function emptyVotes(playerIds) {
	return Object.fromEntries(playerIds.map((id) => [id, null]));
}
function numericVotes(votes) {
	const values = [];
	for (const value of Object.values(votes)) if (typeof value === "number") values.push(value);
	return values;
}
function averageVote(values) {
	if (!values.length) return null;
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function durationOptions(average) {
	const center = Math.round(average);
	const unique = /* @__PURE__ */ new Set();
	for (const delta of [
		-2,
		-1,
		0,
		1,
		2
	]) unique.add(Math.min(13, Math.max(1, center + delta)));
	return [...unique].sort((a, b) => a - b);
}
function everyoneVoted(votes, playerIds) {
	return playerIds.length > 0 && playerIds.every((id) => votes[id] != null);
}
function formatPokerTxt(cards) {
	return cards.map((card) => {
		const duration = card.duration == null ? "Duration: —" : `Duration: ${card.duration}`;
		return [
			card.title,
			card.description || "—",
			duration
		].join("\n");
	}).join("\n\n");
}
function themeDurationTotals(cards) {
	const groups = /* @__PURE__ */ new Map();
	for (const card of cards) {
		const existing = groups.get(card.themeId) ?? {
			themeId: card.themeId,
			themeName: card.themeName,
			total: 0,
			counted: 0
		};
		if (typeof card.duration === "number") {
			existing.total += card.duration;
			existing.counted += 1;
		}
		groups.set(card.themeId, existing);
	}
	return [...groups.values()];
}
function isPokerVote(value) {
	return value === "skip" || typeof value === "number" && VOTE_VALUES.includes(value);
}
function isPokerState(value) {
	if (!value || typeof value !== "object") return false;
	const state = value;
	return typeof state.hostId === "string" && Array.isArray(state.cards) && typeof state.index === "number" && (state.phase === "voting" || state.phase === "reveal" || state.phase === "done") && Boolean(state.votes) && typeof state.votes === "object";
}
var serverVersion = 0;
function getServerVersion() {
	return serverVersion;
}
function rememberServerVersion(version) {
	if (!Number.isFinite(version) || version < 0) return;
	serverVersion = version;
}
var uploaded = /* @__PURE__ */ new Map();
function fingerprint(src) {
	return `${src.length}:${src.slice(0, 24)}:${src.slice(-24)}`;
}
async function stashWhiteboardImages(themes, token) {
	let changed = false;
	const next = [];
	for (const theme of themes) {
		const images = listWhiteboardImages(theme.whiteboard);
		if (!images.length) {
			next.push(theme);
			continue;
		}
		const srcById = /* @__PURE__ */ new Map();
		let themeChanged = false;
		for (const image of images) {
			if (image.src.startsWith("asset:")) {
				srcById.set(image.id, image.src);
				continue;
			}
			if (!image.src.startsWith("data:image/")) continue;
			if (!isAllowedImageDataUrl(image.src)) continue;
			const assetId = whiteboardFileAssetId(image.id);
			const mark = fingerprint(image.src);
			if (uploaded.get(assetId) !== mark) {
				const data = await optimizeDataUrl(image.src);
				if (!isAllowedImageDataUrl(data)) throw new Error("Could not save a canvas image.");
				if (!(await saveWorkspaceAsset({ data: {
					id: assetId,
					data,
					token
				} }))?.ok) throw new Error("Could not save a canvas image.");
				uploaded.set(assetId, fingerprint(data));
				rememberAssets([{
					id: assetId,
					data
				}]);
			}
			themeChanged = true;
			srcById.set(image.id, `${ASSET_PREFIX}${assetId}`);
		}
		if (!themeChanged) {
			next.push(theme);
			continue;
		}
		changed = true;
		next.push({
			...theme,
			whiteboard: replaceWhiteboardImages(theme.whiteboard, srcById)
		});
	}
	return changed ? next : themes;
}
async function stashCardImages(themes, token) {
	let changed = false;
	const next = [];
	for (const theme of themes) {
		const cards = { ...theme.cards };
		let themeChanged = false;
		for (const card of Object.values(theme.cards)) {
			const images = {};
			let cardChanged = false;
			for (const [id, src] of Object.entries(card.images)) {
				if (src.startsWith("asset:")) {
					images[id] = src;
					continue;
				}
				if (!src.startsWith("data:image/") || !isAllowedImageDataUrl(src)) {
					cardChanged = true;
					continue;
				}
				const mark = fingerprint(src);
				if (uploaded.get(id) !== mark) {
					const data = await optimizeDataUrl(src);
					if (!isAllowedImageDataUrl(data)) {
						cardChanged = true;
						continue;
					}
					if (!(await saveWorkspaceAsset({ data: {
						id,
						data,
						token
					} }))?.ok) throw new Error("Could not save a card image.");
					uploaded.set(id, fingerprint(data));
					rememberAssets([{
						id,
						data
					}]);
				}
				images[id] = `${ASSET_PREFIX}${id}`;
				cardChanged = true;
			}
			if (!cardChanged) continue;
			cards[card.id] = {
				...card,
				images
			};
			themeChanged = true;
			changed = true;
		}
		next.push(themeChanged ? {
			...theme,
			cards
		} : theme);
	}
	return changed ? next : themes;
}
async function stashBoardAssets(themes, token) {
	return stashWhiteboardImages(await stashCardImages(themes, token), token);
}
var useSyncStatus = create((set) => ({
	health: typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "ok",
	message: "",
	setHealth: (health, message = "") => set((state) => state.health === health && state.message === message ? state : {
		health,
		message
	})
}));
function token() {
	return getUnlockToken();
}
function currentBoard() {
	const { themes, activeThemeId } = useBoardStore.getState();
	return {
		themes,
		activeThemeId
	};
}
async function hydrateAssets(themes) {
	const token = getUnlockToken();
	if (!token) return;
	await ensureAssets(collectAssetIdsFromThemes(themes), async (ids) => {
		const fromHttp = await fetchAssetRows(ids, token);
		if (fromHttp.length === ids.length) return fromHttp;
		const have = new Set(fromHttp.map((row) => row.id));
		const rest = ids.filter((id) => !have.has(id));
		if (!rest.length) return fromHttp;
		const fallback = await loadWorkspaceAssets({ data: {
			ids: rest,
			token
		} });
		return [...fromHttp, ...fallback];
	});
}
function BoardSync() {
	const ready = (0, import_react.useRef)(false);
	const applying = (0, import_react.useRef)(false);
	const dirty = (0, import_react.useRef)(false);
	const flushing = (0, import_react.useRef)(false);
	const saveTimer = (0, import_react.useRef)(0);
	const compacted = (0, import_react.useRef)(false);
	const hydrated = (0, import_react.useRef)(false);
	const lastApplied = (0, import_react.useRef)("");
	const announced = (0, import_react.useRef)(false);
	const setHealth = useSyncStatus((state) => state.setHealth);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		function markOk() {
			if (isOffline()) {
				setHealth("offline", "You are offline. Edits stay on this device until you reconnect.");
				return;
			}
			if (announced.current) {
				toast.success("Workspace saved");
				announced.current = false;
			}
			setHealth("ok");
		}
		function markFail(error, queued) {
			const message = errorMessage(error, queued ? "Could not save. The board is queued and will retry." : "Could not reach the workspace.");
			setHealth(queued ? "queued" : "error", message);
			if (!announced.current) {
				announced.current = true;
				toast.error(message);
			}
		}
		async function flush() {
			if (applying.current || flushing.current) return;
			if (!token()) return;
			const latest = currentBoard();
			window.clearTimeout(saveTimer.current);
			flushing.current = true;
			const unlock = token();
			let queuedThemes = latest.themes;
			try {
				queuedThemes = await stashBoardAssets(latest.themes, unlock);
				const result = await saveWorkspace({ data: {
					themes: queuedThemes,
					activeThemeId: latest.activeThemeId,
					token: unlock,
					version: getServerVersion()
				} });
				if (result && "reason" in result && result.reason === "conflict") {
					rememberServerVersion(result.version);
					useBoardStore.getState().replaceBoard(result.themes, result.activeThemeId);
					lastApplied.current = boardSignature(result.themes, result.activeThemeId);
					await hydrateAssets(result.themes);
					dirty.current = false;
					clearWorkspaceSync();
					setHealth("ok", "Board updated elsewhere. Reloaded the latest version.");
					toast.message("Board updated elsewhere");
					return;
				}
				if (!result?.ok) throw new Error("Could not save the workspace.");
				rememberServerVersion(result.version);
				if (!cancelled) {
					dirty.current = false;
					lastApplied.current = boardSignature(latest.themes, latest.activeThemeId);
					clearWorkspaceSync();
					markOk();
				}
			} catch (error) {
				if (!cancelled) {
					dirty.current = true;
					try {
						await enqueueWorkspaceSync({
							token: unlock,
							themes: queuedThemes,
							activeThemeId: latest.activeThemeId,
							version: getServerVersion()
						});
						markFail(error, true);
					} catch (queueError) {
						markFail(queueError, false);
					}
				}
			} finally {
				flushing.current = false;
			}
		}
		function scheduleSave() {
			if (!ready.current || applying.current) return;
			dirty.current = true;
			window.clearTimeout(saveTimer.current);
			saveTimer.current = window.setTimeout(() => {
				flush();
			}, 400);
		}
		async function pull() {
			if (applying.current || flushing.current) return;
			if (dirty.current) {
				await flush();
				return;
			}
			try {
				if (!hydrated.current) {
					await Promise.resolve(useBoardStore.persist.rehydrate());
					hydrated.current = true;
					const local = currentBoard();
					lastApplied.current = boardSignature(local.themes, local.activeThemeId);
				}
				const remote = await loadWorkspace({ data: {
					token: token(),
					version: getServerVersion()
				} });
				if (cancelled || dirty.current) return;
				applying.current = true;
				if (remote.status === "unchanged") rememberServerVersion(remote.version);
				else if (remote.status === "delta") {
					rememberServerVersion(remote.version);
					useBoardStore.getState().applyDelta(remote);
					const latest = currentBoard();
					lastApplied.current = boardSignature(latest.themes, latest.activeThemeId);
					await hydrateAssets(latest.themes);
				} else if (remote.status === "ok") {
					rememberServerVersion(remote.version);
					let themes = remote.themes;
					if (!compacted.current) {
						themes = await compactThemeImages(remote.themes);
						compacted.current = true;
					}
					const signature = boardSignature(themes, remote.activeThemeId);
					if (signature !== lastApplied.current) {
						useBoardStore.getState().replaceBoard(themes, remote.activeThemeId);
						lastApplied.current = signature;
					}
					await hydrateAssets(themes);
					if (themes !== remote.themes) {
						const persisted = await stashBoardAssets(themes, token());
						const saved = await saveWorkspace({ data: {
							themes: persisted,
							activeThemeId: remote.activeThemeId,
							token: token(),
							version: getServerVersion()
						} });
						if (saved.ok) rememberServerVersion(saved.version);
					}
				} else {
					const local = currentBoard();
					const themes = compacted.current ? local.themes : await compactThemeImages(local.themes);
					compacted.current = true;
					if (themes !== local.themes) useBoardStore.getState().replaceBoard(themes, local.activeThemeId);
					const saved = await saveWorkspace({ data: {
						themes: await stashBoardAssets(themes, token()),
						activeThemeId: local.activeThemeId,
						token: token(),
						version: getServerVersion()
					} });
					if (saved.ok) rememberServerVersion(saved.version);
					lastApplied.current = boardSignature(themes, local.activeThemeId);
					await hydrateAssets(themes);
				}
				if (!cancelled) markOk();
			} catch (error) {
				if (!cancelled) {
					if (isOffline()) setHealth("offline", "You are offline. Edits stay on this device until you reconnect.");
					else markFail(error, dirty.current);
				}
			} finally {
				applying.current = false;
				if (!cancelled) ready.current = true;
			}
		}
		pull();
		const timer = window.setInterval(() => {
			if (ready.current && document.visibilityState === "visible") pull();
		}, 12e3);
		const onFocus = () => {
			if (ready.current) pull();
		};
		const onHide = () => {
			if (!ready.current || !dirty.current) return;
			const latest = currentBoard();
			enqueueWorkspaceSync({
				token: token(),
				themes: latest.themes,
				activeThemeId: latest.activeThemeId,
				version: getServerVersion()
			});
			flush();
		};
		const onVisibility = () => {
			if (document.visibilityState === "hidden") onHide();
			else if (ready.current) pull();
		};
		window.addEventListener("focus", onFocus);
		window.addEventListener("pagehide", onHide);
		document.addEventListener("visibilitychange", onVisibility);
		const onOnline = () => {
			setHealth("queued", "Back online. Saving the workspace…");
			if (ready.current) flush();
		};
		const onOffline = () => {
			setHealth("offline", "You are offline. Edits stay on this device until you reconnect.");
		};
		window.addEventListener("online", onOnline);
		window.addEventListener("offline", onOffline);
		const onRetry = () => {
			if (ready.current) flush();
		};
		window.addEventListener(SYNC_RETRY_EVENT, onRetry);
		const unsub = useBoardStore.subscribe(() => {
			scheduleSave();
		});
		const unsubSync = subscribeSyncMessages(() => {
			if (ready.current) flush();
		}, () => {
			if (ready.current && document.visibilityState === "visible") pull();
		});
		if (isOffline()) onOffline();
		return () => {
			cancelled = true;
			window.clearInterval(timer);
			window.clearTimeout(saveTimer.current);
			window.removeEventListener("focus", onFocus);
			window.removeEventListener("pagehide", onHide);
			document.removeEventListener("visibilitychange", onVisibility);
			window.removeEventListener("online", onOnline);
			window.removeEventListener("offline", onOffline);
			window.removeEventListener(SYNC_RETRY_EVENT, onRetry);
			unsub();
			unsubSync();
		};
	}, []);
	return null;
}
function point(scroller, node) {
	const board = scroller.getBoundingClientRect();
	const box = node.getBoundingClientRect();
	return {
		x: box.left - board.left + scroller.scrollLeft + box.width / 2,
		left: box.left - board.left + scroller.scrollLeft,
		right: box.right - board.left + scroller.scrollLeft,
		midY: box.top - board.top + scroller.scrollTop + box.height / 2
	};
}
function curve(from, to) {
	const pad = 8;
	if (Math.abs(from.x - to.x) < 48) {
		const outward = from.left < 72 ? 1 : -1;
		const x1 = outward > 0 ? from.right - pad : from.left + pad;
		const x2 = outward > 0 ? to.right - pad : to.left + pad;
		const bulge = Math.max(x1, x2) + outward * 64;
		return {
			d: `M ${x1} ${from.midY} C ${bulge} ${from.midY}, ${bulge} ${to.midY}, ${x2} ${to.midY}`,
			x1,
			y1: from.midY,
			x2,
			y2: to.midY
		};
	}
	const rightward = from.x < to.x;
	const x1 = rightward ? from.right - pad : from.left + pad;
	const x2 = rightward ? to.left + pad : to.right - pad;
	const dx = Math.max(64, Math.abs(x2 - x1) * .48);
	const sweep = rightward ? dx : -dx;
	return {
		d: `M ${x1} ${from.midY} C ${x1 + sweep} ${from.midY}, ${x2 - sweep} ${to.midY}, ${x2} ${to.midY}`,
		x1,
		y1: from.midY,
		x2,
		y2: to.midY
	};
}
function sameLinks(left, right) {
	if (left.length !== right.length) return false;
	return left.every((link, index) => link.id === right[index]?.id && link.d === right[index]?.d && link.x1 === right[index]?.x1 && link.y1 === right[index]?.y1);
}
function BlockLinks({ cards, layoutKey, scrollerRef }) {
	const glowId = `block-glow-${(0, import_react.useId)().replace(/:/g, "")}`;
	const [links, setLinks] = (0, import_react.useState)([]);
	const [size, setSize] = (0, import_react.useState)({
		width: 0,
		height: 0
	});
	const linksRef = (0, import_react.useRef)([]);
	(0, import_react.useEffect)(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;
		function measure() {
			const node = scrollerRef.current;
			if (!node) return;
			const next = [];
			for (const card of Object.values(cards)) {
				if (!card.blocked || !card.blockedBy.length) continue;
				const toNode = node.querySelector(`[data-card-id="${card.id}"]`);
				if (!toNode) continue;
				const to = point(node, toNode);
				for (const fromId of card.blockedBy) {
					const fromNode = node.querySelector(`[data-card-id="${fromId}"]`);
					if (!fromNode) continue;
					next.push({
						id: `${fromId}-${card.id}`,
						...curve(point(node, fromNode), to)
					});
				}
			}
			const nextSize = {
				width: Math.max(node.scrollWidth, node.clientWidth),
				height: Math.max(node.scrollHeight, node.clientHeight)
			};
			setSize((current) => current.width === nextSize.width && current.height === nextSize.height ? current : nextSize);
			if (sameLinks(linksRef.current, next)) return;
			linksRef.current = next;
			setLinks(next);
		}
		const frame = window.requestAnimationFrame(measure);
		window.addEventListener("resize", measure);
		scroller.addEventListener("scroll", measure, { passive: true });
		return () => {
			window.cancelAnimationFrame(frame);
			window.removeEventListener("resize", measure);
			scroller.removeEventListener("scroll", measure);
		};
	}, [
		cards,
		layoutKey,
		scrollerRef
	]);
	if (!links.length || !size.width) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: "block-links-svg pointer-events-none absolute top-0 left-0 z-20 overflow-hidden text-danger",
		width: size.width,
		height: size.height,
		viewBox: `0 0 ${size.width} ${size.height}`,
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("filter", {
			id: glowId,
			x: "-30%",
			y: "-50%",
			width: "160%",
			height: "200%",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feGaussianBlur", {
				stdDeviation: "2.2",
				result: "blur"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("feMerge", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feMergeNode", { in: "blur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feMergeNode", { in: "SourceGraphic" })] })]
		}) }), links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			filter: `url(#${glowId})`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: link.d,
					pathLength: 1,
					fill: "none",
					stroke: "currentColor",
					strokeOpacity: "0.18",
					strokeWidth: "9",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: link.d,
					pathLength: 1,
					className: "block-link-draw",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.6",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: link.d,
					pathLength: 1,
					className: "block-link-flow",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.6",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					className: "block-link-bead",
					r: "3.25",
					fill: "currentColor",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("animateMotion", {
						dur: "2.4s",
						repeatCount: "indefinite",
						rotate: "auto",
						path: link.d
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					className: "block-link-bead",
					r: "1.6",
					fill: "currentColor",
					fillOpacity: "0.7",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("animateMotion", {
						dur: "2.4s",
						begin: "1.2s",
						repeatCount: "indefinite",
						rotate: "auto",
						path: link.d
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					className: "block-link-pulse",
					cx: link.x1,
					cy: link.y1,
					r: "7",
					fill: "none",
					stroke: "currentColor",
					strokeOpacity: "0.35",
					strokeWidth: "1"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: link.x1,
					cy: link.y1,
					r: "3.25",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: link.x2,
					cy: link.y2,
					r: "3.25",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: link.x2,
					cy: link.y2,
					r: "1.4",
					className: "fill-bg-elevated"
				})
			]
		}, link.id))]
	});
}
function BlockPicker({ candidates, selected, onChange }) {
	if (!candidates.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-subtle",
		children: "No other cards in this tab to link."
	});
	function toggle(id) {
		onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Optionally pick what is blocking this card. Same tab only."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid max-h-52 gap-1 overflow-y-auto rounded-md bg-bg p-1 shadow-border",
			children: candidates.map((card) => {
				const on = selected.includes(card.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": on,
					onClick: () => toggle(card.id),
					className: cn("flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left transition-colors duration-150", on ? "bg-danger/12 text-fg" : "text-muted hover:bg-surface hover:text-fg"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						className: cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-xs shadow-border", on && "bg-danger text-accent-fg"),
						children: on ? "✓" : ""
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm font-medium",
							children: card.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block text-[0.65rem] tracking-wide text-subtle uppercase",
							children: columnMeta(card.columnId).title
						})]
					})]
				}) }, card.id);
			})
		})]
	});
}
function BlockReasonDialog({ open, card, candidates, onOpenChange, onConfirm }) {
	const [selected, setSelected] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!open || !card) return;
		setSelected(card.blockedBy);
	}, [open, card]);
	const options = candidates.filter((item) => item.id !== card?.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Mark as blocked?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: card ? `Optionally link what is blocking “${card.title}”. You can skip this.` : "Optionally link the cards that are blocking this work." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockPicker, {
				candidates: options,
				selected,
				onChange: setSelected
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				onClick: () => onOpenChange(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				onClick: () => onConfirm(selected),
				children: "Mark blocked"
			})] })
		] })
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-md bg-bg px-3 py-2 text-sm text-fg shadow-border outline-none transition-[box-shadow] duration-150 placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("text-sm font-medium text-fg", className),
	...props
}));
Label.displayName = Root.displayName;
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-28 w-full resize-y rounded-md bg-bg px-3 py-2.5 text-sm text-fg shadow-border outline-none transition-[box-shadow] duration-150 placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
function CardFormDialog({ open, state, candidates, onOpenChange, onSubmit }) {
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [blocked, setBlocked] = (0, import_react.useState)(false);
	const [urgent, setUrgent] = (0, import_react.useState)(false);
	const [blockedBy, setBlockedBy] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!open || !state) return;
		if (state.mode === "edit") {
			setTitle(state.card.title);
			setDescription(state.card.description);
			setBlocked(state.card.blocked);
			setUrgent(state.card.urgent);
			setBlockedBy(state.card.blockedBy);
		} else {
			setTitle("");
			setDescription("");
			setBlocked(false);
			setUrgent(false);
			setBlockedBy([]);
		}
	}, [open, state]);
	const columnTitle = state?.mode === "create" ? COLUMNS.find((column) => column.id === state.columnId)?.title : null;
	const excludeId = state?.mode === "edit" ? state.card.id : "";
	const options = candidates.filter((card) => card.id !== excludeId);
	function handleSubmit(event) {
		event.preventDefault();
		const nextTitle = title.trim();
		if (!nextTitle) return;
		onSubmit({
			title: nextTitle,
			description: description.trim(),
			blocked,
			urgent,
			blockedBy: blocked ? blockedBy : []
		});
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "grid gap-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: state?.mode === "edit" ? "Edit card" : "New card" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: state?.mode === "edit" ? "Update the title, notes, and flags. Changes save to this device." : `Add a card to ${columnTitle ?? "the board"}.` })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "card-title",
								children: "Title"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "card-title",
								value: title,
								onChange: (event) => setTitle(event.target.value),
								placeholder: "What needs to happen?",
								autoFocus: true,
								required: true,
								maxLength: 120
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "card-description",
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "card-description",
								value: description,
								onChange: (event) => setDescription(event.target.value),
								placeholder: "Optional context, links, or notes",
								maxLength: 600,
								onKeyDown: (event) => {
									if ((event.metaKey || event.ctrlKey) && event.key === "Enter") event.currentTarget.form?.requestSubmit();
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "text-sm font-medium text-fg",
								children: "Flags"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlagToggle, {
									pressed: urgent,
									onPressedChange: setUrgent,
									icon: TriangleAlert,
									label: "Urgent",
									tone: "urgent"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlagToggle, {
									pressed: blocked,
									onPressedChange: (next) => {
										setBlocked(next);
										if (!next) setBlockedBy([]);
									},
									icon: Ban,
									label: "Blocked",
									tone: "blocked"
								})]
							})]
						}),
						blocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Blocked by" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockPicker, {
								candidates: options,
								selected: blockedBy,
								onChange: setBlockedBy
							})]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: !title.trim(),
					children: state?.mode === "edit" ? "Save changes" : "Add card"
				})] })
			]
		}) })
	});
}
function FlagToggle({ pressed, onPressedChange, icon: Icon, label, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-pressed": pressed,
		onClick: () => onPressedChange(!pressed),
		className: cn("inline-flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium shadow-border transition-[color,background-color,box-shadow] duration-150", pressed && tone === "urgent" && "bg-urgent/15 text-urgent shadow-none", pressed && tone === "blocked" && "bg-danger/15 text-danger shadow-none", !pressed && "bg-bg text-muted hover:text-fg"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), label]
	});
}
var COPY = {
	jira: {
		title: "Jira link",
		description: "Paste the issue URL. It opens from the Jira button under this card.",
		label: "Jira URL",
		placeholder: "https://your-team.atlassian.net/browse/ABC-12"
	},
	pr: {
		title: "Pull request",
		description: "Paste the PR URL. It opens from the PR button under this card.",
		label: "PR URL",
		placeholder: "https://github.com/org/repo/pull/12"
	}
};
function CardLinkDialog({ open, state, onOpenChange, onSubmit }) {
	const [value, setValue] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open || !state) return;
		setValue(state.card[cardLinkKey(state.kind)]);
		setError("");
	}, [open, state]);
	const copy = state ? COPY[state.kind] : COPY.jira;
	function handleSubmit(event) {
		event.preventDefault();
		const parsed = parseExternalUrl(value);
		if (parsed === null) {
			setError("Enter a valid http or https link.");
			return;
		}
		onSubmit(parsed);
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "grid gap-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: copy.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: copy.description })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "card-link-url",
							children: copy.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "card-link-url",
							type: "text",
							inputMode: "url",
							autoComplete: "url",
							value,
							onChange: (event) => {
								setValue(event.target.value);
								setError("");
							},
							placeholder: copy.placeholder,
							autoFocus: true
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-danger",
							children: error
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [
					state?.card[cardLinkKey(state.kind)] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						className: "mr-auto",
						onClick: () => {
							onSubmit("");
							onOpenChange(false);
						},
						children: "Remove"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: !value.trim(),
						children: "Save link"
					})
				] })
			]
		}) })
	});
}
function CardLinkButtons({ card, onEditLink, onOpenDetails }) {
	const hasDetails = Boolean(card.details.trim()) || Object.keys(card.images).length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		onPointerDown: (event) => event.stopPropagation(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: (event) => {
				event.stopPropagation();
				onOpenDetails(card);
			},
			onPointerDown: (event) => event.stopPropagation(),
			"aria-label": `Details for ${card.title}`,
			className: cn("flex h-11 w-full items-center justify-center gap-1.5 border-t border-border text-xs font-semibold tracking-wide transition-[background-color,color] duration-150", hasDetails ? "bg-bg text-fg hover:bg-surface-hover" : "text-muted hover:bg-bg hover:text-fg"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }),
				"Details",
				hasDetails ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "size-1.5 rounded-full bg-accent",
					"aria-hidden": "true"
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 border-t border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkButton, {
				kind: "jira",
				href: card.jiraUrl,
				label: "Jira",
				onAdd: () => onEditLink(card, "jira")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkButton, {
				kind: "pr",
				href: card.prUrl,
				label: "PR",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitPullRequest, { className: "size-3.5" }),
				onAdd: () => onEditLink(card, "pr"),
				divided: true
			})]
		})]
	});
}
function LinkButton({ kind, href, label, icon, onAdd, divided }) {
	const linked = Boolean(href);
	function handleClick(event) {
		event.stopPropagation();
		if (!linked) {
			onAdd();
			return;
		}
		window.open(href, "_blank", "noopener,noreferrer");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: handleClick,
		onPointerDown: (event) => event.stopPropagation(),
		"aria-label": linked ? `Open ${label}` : `Add ${label} link`,
		title: linked ? href : `Add ${label} link`,
		className: cn("inline-flex h-11 items-center justify-center gap-1.5 text-xs font-semibold tracking-wide transition-[background-color,color] duration-150", divided && "border-l border-border", kind === "jira" && (linked ? "bg-jira text-jira-fg hover:bg-jira/90" : "bg-transparent text-jira hover:bg-jira/15"), kind === "pr" && (linked ? "bg-surface-hover text-fg" : "bg-transparent text-subtle hover:bg-bg hover:text-fg")),
		children: [icon, label]
	});
}
var DropdownMenu = Root2$1;
var DropdownMenuTrigger = Trigger;
var DropdownMenuPortal = Portal2$1;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 6, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
	ref,
	sideOffset,
	className: cn("z-50 min-w-40 overflow-hidden rounded-lg bg-bg-elevated p-1 shadow-lift data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2$1.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, variant = "default", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none select-none focus:bg-surface data-[disabled]:pointer-events-none data-[disabled]:opacity-40", variant === "destructive" ? "text-danger" : "text-fg", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
function CardFlags({ card }) {
	if (!card.urgent && !card.blocked) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
		className: "mt-3 flex flex-wrap gap-1.5",
		children: [card.urgent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "inline-flex items-center gap-1 rounded-full bg-urgent/15 px-2 py-0.5 text-xs font-medium text-urgent",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
				className: "size-3",
				"aria-hidden": "true"
			}), "Urgent"]
		}) : null, card.blocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "inline-flex items-center gap-1 rounded-full bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, {
				className: "size-3",
				"aria-hidden": "true"
			}), card.blockedBy.length ? `Blocked · ${card.blockedBy.length}` : "Blocked"]
		}) : null]
	});
}
function CardFace({ card, columnId, overlay, dragging, compact, onEdit, onDelete, onToggleFlag, onSendTo, onEditLink, onOpenDetails, onPrAlert }) {
	const previous = columnId ? adjacentColumn(columnId, -1) : null;
	const next = columnId ? adjacentColumn(columnId, 1) : null;
	const interactive = Boolean(onEdit && onDelete && onToggleFlag && onSendTo && onEditLink && onOpenDetails);
	const profileName = useProfileStore((state) => state.name);
	const setAssignee = useBoardStore((state) => state.setAssignee);
	const applyCard = useBoardStore((state) => state.applyCard);
	const inReview = columnId === "review";
	const prAlertOn = inReview && card.prAlert;
	async function handleAssignMe(event) {
		event.stopPropagation();
		if (!profileName) return;
		try {
			const result = await claimAssignee({ data: {
				cardId: card.id,
				name: profileName,
				token: getUnlockToken()
			} });
			if (result.ok) {
				applyCard(result.card);
				if (result.version) rememberServerVersion(result.version);
				toast.success(`Assigned to ${profileName}`);
				return;
			}
			if (result.reason === "taken" && result.card) {
				applyCard(result.card);
				toast.error(`This card already has a responsible: ${result.assignee}`);
				return;
			}
			toast.error("Could not assign this card.");
		} catch {
			toast.error("Could not assign this card.");
		}
	}
	function handleUnassign() {
		setAssignee(card.id, "");
		toast("Unassigned");
	}
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("kanban-card relative flex items-start gap-1 overflow-hidden rounded-md bg-surface px-2 py-1 shadow-card outline-none", "transition-[box-shadow,opacity] duration-200 ease-[var(--ease-smooth-out)]", !overlay && !dragging && "hover:shadow-lift", overlay && "kanban-overlay rotate-[1.5deg] scale-[1.03] shadow-lift", dragging && "opacity-30 shadow-border"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "min-w-0 flex-1 px-1 py-2 text-sm leading-snug font-medium wrap-break-word text-fg [overflow-wrap:anywhere]",
				children: card.title
			}),
			interactive && previous ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": `Send back to ${columnMeta(previous).title}`,
				onPointerDown: (event) => event.stopPropagation(),
				onClick: (event) => {
					event.stopPropagation();
					onSendTo?.(card, previous);
				},
				className: "relative grid size-9 shrink-0 place-items-center rounded-md text-subtle transition-colors duration-150 hover:bg-bg hover:text-fg after:absolute after:-inset-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
			}) : null,
			interactive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon-sm",
					className: "relative shrink-0 text-subtle hover:text-fg after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2",
					"aria-label": `Card actions for ${card.title}`,
					onPointerDown: (event) => event.stopPropagation(),
					onClick: (event) => event.stopPropagation(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						onSelect: () => onEdit?.(card),
						onPointerDown: (event) => event.stopPropagation(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "Edit"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						onSelect: () => onOpenDetails?.(card),
						onPointerDown: (event) => event.stopPropagation(),
						children: "Details"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						variant: "destructive",
						onSelect: () => onDelete?.(card),
						onPointerDown: (event) => event.stopPropagation(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Delete"]
					})
				]
			})] }) : null
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("kanban-card relative overflow-hidden rounded-lg bg-surface shadow-card outline-none", "transition-[background-color,box-shadow,transform,opacity] duration-200 ease-[var(--ease-smooth-out)]", !overlay && !dragging && !prAlertOn && "hover:shadow-lift", overlay && "kanban-overlay rotate-[1.5deg] scale-[1.03] shadow-lift", dragging && "opacity-30 shadow-border", prAlertOn && "pr-alert-card"),
		children: [
			inReview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-pressed": card.prAlert,
				"aria-label": "PR Alert",
				title: "PR Alert",
				onPointerDown: (event) => event.stopPropagation(),
				onClick: (event) => {
					event.stopPropagation();
					if (!interactive) return;
					onPrAlert?.(card);
				},
				className: cn("absolute top-0 right-3 z-10 flex h-11 w-8 items-start justify-center", "text-subtle transition-colors duration-200 ease-[var(--ease-smooth-out)]", card.prAlert ? "text-urgent" : "hover:text-muted"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					viewBox: "0 0 24 36",
					className: "h-9 w-6",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M3 0h18v32.5c0 .7-.8 1.1-1.4.7L12 26.2 4.4 33.2C3.8 33.6 3 33.2 3 32.5V0Z",
						className: card.prAlert ? "fill-urgent" : "fill-subtle"
					})
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("p-4", inReview && "pr-12"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "min-w-0 flex-1 text-sm leading-snug font-medium wrap-break-word text-fg [overflow-wrap:anywhere]",
							children: card.title
						}), interactive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "icon-sm",
									className: "relative -mt-1 -mr-1 shrink-0 text-subtle hover:text-fg after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2",
									"aria-label": `Card actions for ${card.title}`,
									onPointerDown: (event) => event.stopPropagation(),
									onClick: (event) => event.stopPropagation(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {})
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onSelect: () => onEdit?.(card),
										onPointerDown: (event) => event.stopPropagation(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "Edit"]
									}),
									previous ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onSelect: () => onSendTo?.(card, previous),
										onPointerDown: (event) => event.stopPropagation(),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }),
											"Send back to ",
											columnMeta(previous).title
										]
									}) : null,
									next ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onSelect: () => onSendTo?.(card, next),
										onPointerDown: (event) => event.stopPropagation(),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" }),
											"Advance to ",
											columnMeta(next).title
										]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										onSelect: () => onEditLink?.(card, "jira"),
										onPointerDown: (event) => event.stopPropagation(),
										children: "Jira link"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										onSelect: () => onEditLink?.(card, "pr"),
										onPointerDown: (event) => event.stopPropagation(),
										children: "PR link"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onSelect: () => onToggleFlag?.(card, "urgent"),
										onPointerDown: (event) => event.stopPropagation(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }), card.urgent ? "Clear urgent" : "Mark urgent"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onSelect: () => onToggleFlag?.(card, "blocked"),
										onPointerDown: (event) => event.stopPropagation(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "size-4" }), card.blocked ? "Clear blocked" : "Mark blocked"]
									}),
									card.assignee ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onSelect: handleUnassign,
										onPointerDown: (event) => event.stopPropagation(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4" }), "Unassign"]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										variant: "destructive",
										onSelect: () => onDelete?.(card),
										onPointerDown: (event) => event.stopPropagation(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Delete"]
									})
								]
							})] })
						}) : null]
					}),
					card.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed wrap-break-word text-muted [overflow-wrap:anywhere]",
						children: card.description
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFlags, { card }),
					card.assignee ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 flex items-center gap-2 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							className: "grid size-6 place-items-center rounded-full bg-bg text-[0.65rem] font-semibold tracking-wide text-fg",
							children: card.assignee.slice(0, 1).toUpperCase()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: card.assignee
						})]
					}) : interactive && profileName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onPointerDown: (event) => event.stopPropagation(),
						onClick: handleAssignMe,
						className: "relative mt-3 inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold tracking-wide text-muted transition-colors duration-150 hover:bg-bg hover:text-fg after:absolute after:-inset-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-3.5" }), "Assign me"]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-xs tracking-wide text-subtle tabular-nums",
						children: ["Duration ", card.duration ?? "—"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "min-w-0 font-mono text-xs tracking-wide text-subtle tabular-nums",
							children: formatDistanceToNowStrict(card.createdAt, { addSuffix: true })
						}), interactive && (previous || next) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 items-center",
							children: [previous ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": `Send back to ${columnMeta(previous).title}`,
								onPointerDown: (event) => event.stopPropagation(),
								onClick: (event) => {
									event.stopPropagation();
									onSendTo?.(card, previous);
								},
								className: "relative grid size-9 place-items-center rounded-md text-subtle transition-colors duration-150 hover:bg-bg hover:text-fg after:absolute after:-inset-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
							}) : null, next ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-label": `Advance to ${columnMeta(next).title}`,
								onPointerDown: (event) => event.stopPropagation(),
								onClick: (event) => {
									event.stopPropagation();
									onSendTo?.(card, next);
								},
								className: "relative inline-flex h-9 items-center gap-0.5 rounded-md px-1.5 text-xs font-medium text-muted transition-colors duration-150 hover:bg-bg hover:text-fg after:absolute after:-inset-1",
								children: [columnMeta(next).title, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" })]
							}) : null]
						}) : null]
					})
				]
			}),
			onEditLink && onOpenDetails ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardLinkButtons, {
				card,
				onEditLink,
				onOpenDetails
			}) : null
		]
	});
}
var KanbanCard = (0, import_react.memo)(function KanbanCard({ card, columnId, compact, onEdit, onDelete, onToggleFlag, onSendTo, onEditLink, onOpenDetails, onPrAlert, focused = false }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: card.id,
		data: {
			type: "card",
			cardId: card.id
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: setNodeRef,
		style: {
			transform: CSS.Transform.toString(transform),
			transition
		},
		...attributes,
		...listeners,
		"data-card-id": card.id,
		"data-focused": focused ? "true" : void 0,
		className: cn("cursor-grab touch-none active:cursor-grabbing rounded-lg", focused && "ring-2 ring-ring/80 ring-offset-2 ring-offset-bg"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFace, {
			card,
			columnId,
			dragging: isDragging,
			compact,
			onEdit,
			onDelete,
			onToggleFlag,
			onSendTo,
			onEditLink,
			onOpenDetails,
			onPrAlert
		})
	});
});
var OVERSCAN = 5;
function VirtualCardList({ count, estimate, enabled, children }) {
	const scroller = (0, import_react.useRef)(null);
	const [scrollTop, setScrollTop] = (0, import_react.useState)(0);
	const [height, setHeight] = (0, import_react.useState)(estimate * 8);
	(0, import_react.useEffect)(() => {
		const node = scroller.current;
		if (!node || !enabled) return;
		const onScroll = () => setScrollTop(node.scrollTop);
		const frame = window.requestAnimationFrame(() => {
			setHeight(node.clientHeight || estimate * 8);
		});
		node.addEventListener("scroll", onScroll, { passive: true });
		const observer = new ResizeObserver(() => {
			setHeight(node.clientHeight || estimate * 8);
		});
		observer.observe(node);
		return () => {
			window.cancelAnimationFrame(frame);
			node.removeEventListener("scroll", onScroll);
			observer.disconnect();
		};
	}, [enabled, estimate]);
	if (!enabled || count < 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "xl:h-full xl:min-h-0 xl:overflow-y-auto",
		children: children({
			start: 0,
			end: count
		})
	});
	const start = Math.max(0, Math.floor(scrollTop / estimate) - OVERSCAN);
	const visible = Math.ceil(height / estimate) + 10;
	const end = Math.min(count, start + visible);
	const padTop = start * estimate;
	const padBottom = Math.max(0, (count - end) * estimate);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: scroller,
		className: cn("max-h-[min(70vh,42rem)] overflow-y-auto overscroll-contain", "xl:h-full xl:max-h-none"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { height: padTop } }),
			children({
				start,
				end
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { height: padBottom } })
		]
	});
}
var DONE_PREVIEW = 3;
var TONE$1 = {
	backlog: "bg-backlog",
	planning: "bg-planning",
	todo: "bg-todo",
	doing: "bg-doing",
	review: "bg-review",
	done: "bg-done"
};
var KanbanColumn = (0, import_react.memo)(function KanbanColumn({ id, title, hint, empty, emptyHint, cards, itemIds, isOver, onAdd, onEdit, onDelete, onToggleFlag, onSendTo, onEditLink, onOpenDetails, onPrAlert, soundOn, onSoundToggle, virtualize = false, focusedCardId = null }) {
	const droppableData = (0, import_react.useMemo)(() => ({
		type: "column",
		columnId: id
	}), [id]);
	const { setNodeRef } = useDroppable({
		id: columnDroppableId(id),
		data: droppableData
	});
	const canAdd = columnAllowsCreate(id);
	const doneCompact = useProfileStore((state) => state.doneCompact);
	const setDoneCompact = useProfileStore((state) => state.setDoneCompact);
	const collapsed = id === "done" && doneCompact && cards.length > DONE_PREVIEW;
	const visibleCards = collapsed ? cards.slice(0, DONE_PREVIEW) : cards;
	const sortableIds = collapsed ? itemIds.slice(0, DONE_PREVIEW) : itemIds;
	const hiddenCount = cards.length - visibleCards.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: `column-${id}`,
		className: cn("flex w-[85vw] min-w-[85vw] shrink-0 flex-col rounded-xl bg-bg-elevated p-3 snap-center", "md:w-64 md:min-w-64", "xl:h-full xl:min-h-0 xl:w-auto xl:min-w-0 xl:flex-1 xl:snap-align-none", "transition-[box-shadow,background-color] duration-200 ease-[var(--ease-smooth-out)]", isOver ? "shadow-lift" : "shadow-border"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-start justify-between gap-3 px-1 pt-1 pb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-2 shrink-0 rounded-full", TONE$1[id]) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold tracking-tight text-fg",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-surface px-2 py-0.5 font-mono text-xs text-muted tabular-nums",
							children: cards.length
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 pl-4 text-xs text-subtle",
					children: hint
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1",
				children: [
					id === "review" && onSoundToggle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "switch",
						"aria-checked": soundOn,
						"aria-label": "Review sound",
						title: soundOn ? "Sound on" : "Sound off",
						onClick: onSoundToggle,
						className: "relative inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-muted transition-colors duration-150 hover:bg-surface hover:text-fg",
						children: [soundOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							className: cn("relative h-5 w-8 rounded-full shadow-border transition-colors duration-150", soundOn ? "bg-accent" : "bg-bg"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 left-0.5 size-4 rounded-full bg-surface-hover transition-transform duration-150", soundOn && "translate-x-3 bg-accent-fg") })
						})]
					}) : null,
					id === "done" && cards.length > DONE_PREVIEW ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-expanded": !doneCompact,
						"aria-label": doneCompact ? "Show all shipped cards" : "Compact shipped cards",
						onClick: () => setDoneCompact(!doneCompact),
						className: "relative inline-flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted transition-colors duration-150 hover:bg-surface hover:text-fg",
						children: [doneCompact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsDownUp, { className: "size-4" }), doneCompact ? "Show all" : "Compact"]
					}) : null,
					canAdd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "icon-sm",
						className: "relative -mr-1 text-muted hover:text-fg after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2",
						onClick: () => onAdd(id),
						"aria-label": `Add card to ${title}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
					}) : null
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: setNodeRef,
			className: cn("flex min-h-32 flex-1 flex-col gap-2.5 rounded-lg p-0.5 xl:min-h-0", id === "done" && "gap-1.5", isOver && "bg-surface/40"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VirtualCardList, {
					count: visibleCards.length,
					estimate: id === "done" ? 88 : 168,
					enabled: virtualize && !collapsed && visibleCards.length > 18,
					children: ({ start, end }) => {
						const slice = visibleCards.slice(start, end);
						const sliceIds = sortableIds.slice(start, end);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableContext, {
							items: sliceIds,
							strategy: verticalListSortingStrategy,
							children: slice.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanCard, {
								card,
								columnId: id,
								compact: id === "done",
								onEdit,
								onDelete,
								onToggleFlag,
								onSendTo,
								onEditLink,
								onOpenDetails,
								onPrAlert,
								focused: focusedCardId === card.id
							}, card.id))
						});
					}
				}),
				hiddenCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setDoneCompact(false),
					className: "flex h-11 items-center justify-center rounded-md text-xs font-medium text-muted transition-colors duration-150 hover:bg-surface hover:text-fg",
					children: [
						"+",
						hiddenCount,
						" more shipped"
					]
				}) : null,
				cards.length === 0 ? canAdd ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onAdd(id),
					className: "flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center transition-[border-color,color] duration-150 hover:border-border-strong hover:text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-subtle",
						children: empty
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 text-xs text-subtle",
						children: emptyHint
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-subtle",
						children: empty
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 text-xs text-subtle",
						children: emptyHint
					})]
				}) : null
			]
		})]
	});
});
function ThemeFormDialog({ open, state, onOpenChange, onSubmit }) {
	const [name, setName] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open || !state) return;
		setName(state.mode === "rename" ? state.name : "");
	}, [open, state]);
	function handleSubmit(event) {
		event.preventDefault();
		const next = name.trim();
		if (!next) return;
		onSubmit(next);
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "grid gap-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: state?.mode === "rename" ? "Rename theme" : "New theme" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: state?.mode === "rename" ? "This name is only a label. Cards in the theme stay put." : "Each theme has its own Backlog, Planning, To Do, Doing, Review, and Done columns." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "theme-name",
						children: "Name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "theme-name",
						value: name,
						onChange: (event) => setName(event.target.value),
						placeholder: "e.g. Product, Personal, Studio",
						autoFocus: true,
						required: true,
						maxLength: 40
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: !name.trim(),
					children: state?.mode === "rename" ? "Save name" : "Add theme"
				})] })
			]
		}) })
	});
}
var AlertDialog = Root2;
var AlertDialogPortal = Portal2;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
	ref,
	className: cn("fixed inset-0 z-50 bg-bg/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
AlertDialogOverlay.displayName = Overlay2.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("fixed top-1/2 left-1/2 z-50 grid w-[min(calc(100%-2rem),26rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-bg-elevated p-6 shadow-lift duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
	...props
})] }));
AlertDialogContent.displayName = Content2.displayName;
function AlertDialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5", className),
		...props
	});
}
function AlertDialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
var AlertDialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
	ref,
	className: cn("font-display text-xl font-medium tracking-tight text-fg", className),
	...props
}));
AlertDialogTitle.displayName = Title2.displayName;
var AlertDialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
	ref,
	className: cn("text-sm text-muted", className),
	...props
}));
AlertDialogDescription.displayName = Description2.displayName;
var AlertDialogAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
	ref,
	className: cn(buttonVariants({ variant: "destructive" }), className),
	...props
}));
AlertDialogAction.displayName = Action.displayName;
var AlertDialogCancel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
	ref,
	className: cn(buttonVariants({ variant: "ghost" }), className),
	...props
}));
AlertDialogCancel.displayName = Cancel.displayName;
function csvCell$1(value) {
	const text = value.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
	if (/[",\n]/.test(text)) return `"${text.replaceAll("\"", "\"\"")}"`;
	return text;
}
function slug(name) {
	return (name.trim() || "ledger").replace(/[^\w-]+/g, "-").slice(0, 40);
}
function downloadBoardJson(themes, activeThemeId) {
	const payload = {
		activeThemeId,
		themes: themes.map((theme) => ({
			id: theme.id,
			name: theme.name,
			notice: theme.notice,
			order: theme.order,
			whiteboard: stripWhiteboardDataUrls(theme.whiteboard),
			cards: Object.fromEntries(Object.values(theme.cards).map((card) => [card.id, {
				...card,
				images: Object.fromEntries(Object.entries(card.images).map(([id, src]) => [id, src.startsWith("data:") ? `asset:${id}` : src]))
			}]))
		}))
	};
	const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json;charset=utf-8" });
	triggerDownload(blob, `${slug("ledger-board")}.json`);
}
function downloadThemeCsv(theme) {
	const rows = [[
		"column",
		"title",
		"description",
		"assignee",
		"urgent",
		"blocked",
		"duration",
		"jira",
		"pr"
	].join(",")];
	for (const columnId of COLUMN_IDS) {
		const column = columnMeta(columnId).title;
		for (const id of theme.order[columnId]) {
			const card = theme.cards[id];
			if (!card) continue;
			rows.push([
				column,
				card.title,
				card.description,
				card.assignee,
				card.urgent ? "yes" : "",
				card.blocked ? "yes" : "",
				card.duration == null ? "" : String(card.duration),
				card.jiraUrl,
				card.prUrl
			].map(csvCell$1).join(","));
		}
	}
	if (rows.length <= 1) return 0;
	const blob = new Blob([`\uFEFF${rows.join("\n")}`], { type: "text/csv;charset=utf-8" });
	triggerDownload(blob, `${slug(theme.name)}.csv`);
	return rows.length - 1;
}
var HEADERS = [
	"title",
	"description",
	"details",
	"jira",
	"pr",
	"assignee"
];
function csvCell(value) {
	const text = value.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
	if (/[",\n]/.test(text)) return `"${text.replaceAll("\"", "\"\"")}"`;
	return text;
}
function fileName(themeName) {
	return `${themeName.trim() || "theme"}.csv`;
}
function doneCardsCsv(theme) {
	const rows = theme.order.done.map((id) => theme.cards[id]).filter((card) => Boolean(card)).map((card) => [
		card.title,
		card.description,
		card.details,
		card.jiraUrl,
		card.prUrl,
		card.assignee
	].map(csvCell).join(","));
	return [HEADERS.join(","), ...rows].join("\n");
}
function downloadDoneCsv(theme) {
	const count = theme.order.done.filter((id) => theme.cards[id]).length;
	if (!count) return 0;
	const csv = doneCardsCsv(theme);
	const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
	triggerDownload(blob, fileName(theme.name));
	return count;
}
var ROOM$1 = "ledger-here";
var TICK_MS = 4e3;
function encodeLabel(name, themeName) {
	return `${name.trim().slice(0, 28) || "Guest"} · ${themeName.trim().slice(0, 28) || "Board"}`.slice(0, 64);
}
function parseLabel(raw) {
	const split = raw.split(" · ");
	if (split.length >= 2) return {
		name: split[0].trim() || "Guest",
		themeName: split.slice(1).join(" · ").trim()
	};
	return {
		name: raw.trim() || "Guest",
		themeName: ""
	};
}
function usePresence({ name, themeName, enabled }) {
	const [selfId] = (0, import_react.useState)(() => `p-${Math.random().toString(36).slice(2, 10)}`);
	const [peers, setPeers] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!enabled) {
			setPeers([]);
			return;
		}
		let cancelled = false;
		let timer = 0;
		async function tick() {
			try {
				const params = new URLSearchParams({
					room: ROOM$1,
					peer: selfId,
					name: encodeLabel(name, themeName),
					since: "0"
				});
				const response = await fetch(`/api/rtc?${params}`);
				if (!response.ok || cancelled) return;
				const next = ((await response.json()).peers ?? []).filter((peer) => peer.id !== selfId).map((peer) => ({
					id: peer.id,
					...parseLabel(peer.name)
				}));
				if (!cancelled) setPeers(next);
			} catch {}
		}
		tick();
		timer = window.setInterval(() => void tick(), TICK_MS);
		return () => {
			cancelled = true;
			window.clearInterval(timer);
			fetch("/api/rtc", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					op: "leave",
					room: ROOM$1,
					peer: selfId
				}),
				keepalive: true
			}).catch(() => {});
		};
	}, [
		enabled,
		name,
		themeName,
		selfId
	]);
	return {
		selfId,
		peers
	};
}
function ThemeTabs() {
	const themes = useBoardStore((state) => state.themes);
	const activeThemeId = useBoardStore((state) => state.activeThemeId);
	const setActiveTheme = useBoardStore((state) => state.setActiveTheme);
	const addTheme = useBoardStore((state) => state.addTheme);
	const renameTheme = useBoardStore((state) => state.renameTheme);
	const deleteTheme = useBoardStore((state) => state.deleteTheme);
	const activeName = themes.find((theme) => theme.id === activeThemeId)?.name ?? "Board";
	const presence = usePresence({
		name: useProfileStore((state) => state.name) ?? "Guest",
		themeName: activeName,
		enabled: true
	});
	const [form, setForm] = (0, import_react.useState)(null);
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	function handleFormSubmit(name) {
		if (!form) return;
		if (form.mode === "create") {
			addTheme(name);
			toast.success("Theme added");
			return;
		}
		renameTheme(form.id, name);
		toast.success("Theme renamed");
	}
	function confirmDelete() {
		if (!pendingDelete) return;
		const name = pendingDelete.name;
		const removed = deleteTheme(pendingDelete.id);
		setPendingDelete(null);
		if (!removed) {
			toast.error("Keep at least one theme");
			return;
		}
		toast(`“${name}” deleted`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "tablist",
				"aria-label": "Themes",
				className: "board-scroller flex min-w-0 flex-1 items-center gap-1 overflow-x-auto",
				children: themes.map((theme) => {
					const selected = theme.id === activeThemeId;
					const count = themeCardCount(theme);
					const here = presence.peers.filter((peer) => peer.themeName === theme.name);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("flex shrink-0 items-center rounded-lg transition-[background-color,color,box-shadow] duration-150", selected ? "bg-surface text-fg shadow-border" : "text-muted hover:bg-surface/60 hover:text-fg"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "tab",
							"aria-selected": selected,
							id: `theme-tab-${theme.id}`,
							onClick: () => setActiveTheme(theme.id),
							className: "h-11 whitespace-nowrap px-3 text-left text-sm font-medium",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: theme.name }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 font-mono text-xs text-subtle tabular-nums",
									children: count
								}),
								here.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 inline-flex items-center",
									title: here.map((peer) => peer.name).join(", "),
									children: here.slice(0, 3).map((peer) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "-ml-1 grid size-5 place-items-center rounded-full bg-bg text-[0.6rem] font-semibold text-fg shadow-border first:ml-0",
										children: peer.name.slice(0, 1).toUpperCase()
									}, peer.id))
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								size: "icon-sm",
								className: cn("relative mr-1 size-9 text-subtle hover:text-fg after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2", !selected && "opacity-70"),
								"aria-label": `Theme actions for ${theme.name}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
							align: "start",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onSelect: () => setForm({
										mode: "rename",
										id: theme.id,
										name: theme.name
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "Rename"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onSelect: () => {
										try {
											const count = downloadDoneCsv(theme);
											if (!count) {
												toast.error("No cards in Done to download.");
												return;
											}
											toast.success(`Downloaded ${count} Done ${count === 1 ? "card" : "cards"}.`);
										} catch (error) {
											toast.error(errorMessage(error, "Could not download the CSV."));
										}
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download Done CSV"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onSelect: () => {
										try {
											const exported = downloadThemeCsv(theme);
											if (!exported) {
												toast.error("No cards in this theme to export.");
												return;
											}
											toast.success(`Downloaded ${exported} cards.`);
										} catch (error) {
											toast.error(errorMessage(error, "Could not export the CSV."));
										}
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export theme CSV"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									variant: "destructive",
									disabled: themes.length <= 1,
									onSelect: () => {
										if (themes.length <= 1) return;
										setPendingDelete(theme);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Delete"]
								})
							]
						})] })]
					}, theme.id);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "secondary",
				size: "icon",
				className: "shrink-0",
				onClick: () => setForm({ mode: "create" }),
				"aria-label": "Add theme",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeFormDialog, {
			open: form !== null,
			state: form,
			onOpenChange: (open) => {
				if (!open) setForm(null);
			},
			onSubmit: handleFormSubmit
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: pendingDelete !== null,
			onOpenChange: (open) => {
				if (!open) setPendingDelete(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete this theme?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: pendingDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				"Are you sure you want to delete “",
				pendingDelete.name,
				"”? All",
				" ",
				themeCardCount(pendingDelete),
				" ",
				themeCardCount(pendingDelete) === 1 ? "card" : "cards",
				" in this theme will be permanently removed. This cannot be undone."
			] }) : "Are you sure you want to delete this theme? All of its cards will be permanently removed." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep theme" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: confirmDelete,
				children: "Delete theme"
			})] })] })
		})
	] });
}
function ThemeTabsSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-11 gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-28 animate-pulse rounded-lg bg-surface" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-24 animate-pulse rounded-lg bg-surface/60" })]
	});
}
function NoticeBar() {
	const themeId = useBoardStore((state) => selectActiveTheme(state).id);
	const notice = useBoardStore((state) => selectActiveTheme(state).notice);
	const setThemeNotice = useBoardStore((state) => state.setThemeNotice);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)(notice);
	(0, import_react.useEffect)(() => {
		setOpen(false);
		setDraft((current) => current === notice ? current : notice);
	}, [themeId]);
	(0, import_react.useEffect)(() => {
		if (open) return;
		setDraft((current) => current === notice ? current : notice);
	}, [open, notice]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		if (draft === notice) return;
		const timer = window.setTimeout(() => {
			setThemeNotice(draft);
		}, 280);
		return () => window.clearTimeout(timer);
	}, [
		open,
		draft,
		notice,
		setThemeNotice
	]);
	const hasText = notice.trim().length > 0;
	const preview = notice.trim().split("\n")[0] ?? "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("shrink-0 overflow-hidden rounded-md bg-surface shadow-border", hasText && "notice-unread"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-expanded": open,
			"aria-controls": "theme-notice",
			onClick: () => setOpen((current) => !current),
			className: "flex min-h-11 w-full items-center gap-2 px-3 text-left",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "relative grid size-7 shrink-0 place-items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, {
						className: "size-4 text-muted",
						"aria-hidden": "true"
					}), hasText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "notice-unread-dot absolute top-0.5 right-0.5 size-2 rounded-full bg-urgent" }) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("shrink-0 text-xs font-medium tracking-wide uppercase", hasText ? "text-urgent" : "text-subtle"),
					children: "Notice"
				}),
				!open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1 truncate text-sm text-muted",
					children: hasText ? preview : "Add a note for this tab"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "min-w-0 flex-1" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
					className: cn("size-4 shrink-0 text-subtle transition-transform duration-150", open && "rotate-180"),
					"aria-hidden": "true"
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			id: "theme-notice",
			className: "px-3 pb-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: draft,
				onChange: (event) => setDraft(event.target.value),
				placeholder: "Write a note for this tab. Any text here keeps the cue visible.",
				maxLength: 2e3
			})
		}) : null]
	});
}
function WorkflowStrip({ counts, onSelect }) {
	const total = COLUMNS.reduce((sum, column) => sum + counts[column.id], 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "Project workflow",
		className: "board-scroller shrink-0 overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
			className: "flex min-w-max items-stretch",
			children: [COLUMNS.map((column, index) => {
				const count = counts[column.id];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center",
					children: [index > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						className: "mx-1 h-px w-3 shrink-0 bg-border sm:mx-1.5 sm:w-5"
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onSelect(column.id),
						className: cn("flex h-11 items-center gap-2 rounded-md px-2.5 text-left transition-[background-color,color] duration-150", "hover:bg-surface hover:text-fg", count > 0 ? "text-fg" : "text-subtle"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-medium tracking-wide",
							children: column.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-muted tabular-nums",
							children: count
						})]
					})]
				}, column.id);
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "ml-3 flex items-center pl-3 text-xs text-subtle",
				children: total === 0 ? "Empty board" : `${total} in flow`
			})]
		})
	});
}
function searchCards(themes, query) {
	const needle = query.trim().toLowerCase();
	if (!needle) return [];
	const hits = [];
	for (const theme of themes) for (const columnId of COLUMN_IDS) for (const id of theme.order[columnId]) {
		const card = theme.cards[id];
		if (!card) continue;
		if (card.title.toLowerCase().includes(needle) || card.description.toLowerCase().includes(needle) || card.assignee.toLowerCase().includes(needle)) hits.push({
			card,
			themeId: theme.id,
			themeName: theme.name,
			columnId
		});
		if (hits.length >= 40) return hits;
	}
	return hits;
}
function BoardSearch({ open, onOpenChange, onPick }) {
	const themes = useBoardStore((state) => state.themes);
	const [query, setQuery] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (open) setQuery("");
	}, [open]);
	const hits = (0, import_react.useMemo)(() => searchCards(themes, query), [themes, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "w-[min(calc(100%-2rem),34rem)] gap-0 overflow-hidden p-0 wide:w-[min(calc(100%-2rem),40rem)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "sr-only",
					children: "Search cards"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "sr-only",
					children: "Search by title, description, or assignee. Details and images stay out of the index."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e, {
					shouldFilter: false,
					label: "Search cards",
					loop: true,
					vimBindings: false,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 border-b border-border px-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							className: "size-4 shrink-0 text-subtle",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
							value: query,
							onValueChange: setQuery,
							placeholder: "Search titles and descriptions",
							className: "h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-subtle"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.List, {
						className: "max-h-80 overflow-y-auto p-2",
						children: [
							query.trim() && !hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.Empty, {
								className: "px-3 py-8 text-center text-sm text-muted",
								children: [
									"No cards match “",
									query.trim(),
									"”."
								]
							}) : null,
							!query.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "px-3 py-8 text-center text-sm text-subtle",
								children: [
									"Type to search this workspace. Shortcut",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
										className: "rounded-sm bg-surface px-1.5 font-mono text-xs text-muted",
										children: "/"
									})
								]
							}) : null,
							hits.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.Item, {
								value: hit.card.id,
								onSelect: () => {
									onPick(hit);
									onOpenChange(false);
								},
								className: "flex cursor-pointer flex-col gap-0.5 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-surface",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-fg",
									children: hit.card.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-subtle",
									children: [
										hit.themeName,
										" · ",
										columnMeta(hit.columnId).title,
										hit.card.assignee ? ` · ${hit.card.assignee}` : ""
									]
								})]
							}, `${hit.themeId}:${hit.card.id}`))
						]
					})]
				})
			]
		})
	});
}
var ROWS = [
	["/", "Search cards"],
	["C", "New card in Backlog"],
	["J / K", "Move focus down / up"],
	["Enter", "Open focused card"],
	["Z or ⌘Z", "Undo"],
	["⇧Z or ⌘⇧Z", "Redo"],
	["?", "This list"]
];
function ShortcutHelp({ open, onOpenChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Keyboard" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "These skip while you type in a field." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid gap-2",
			children: ROWS.map(([keys, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between gap-4 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
					className: "rounded-md bg-surface px-2 py-1 font-mono text-xs text-fg shadow-border",
					children: keys
				})]
			}, keys))
		})] })
	});
}
var audio = null;
function context() {
	if (typeof window === "undefined") return null;
	audio ??= new AudioContext();
	if (audio.state === "suspended") audio.resume();
	return audio;
}
function unlockReviewChime() {
	context();
}
function playPrAlertChime() {
	const ctx = context();
	if (!ctx) return;
	const now = ctx.currentTime;
	const master = ctx.createGain();
	master.gain.setValueAtTime(1e-4, now);
	master.gain.exponentialRampToValueAtTime(.06, now + .03);
	master.gain.exponentialRampToValueAtTime(1e-4, now + .7);
	master.connect(ctx.destination);
	for (const note of [{
		freq: 392,
		start: 0,
		duration: .28,
		type: "triangle"
	}, {
		freq: 493.88,
		start: .16,
		duration: .4,
		type: "sine"
	}]) {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = note.type;
		osc.frequency.setValueAtTime(note.freq, now + note.start);
		gain.gain.setValueAtTime(1e-4, now + note.start);
		gain.gain.exponentialRampToValueAtTime(1, now + note.start + .03);
		gain.gain.exponentialRampToValueAtTime(1e-4, now + note.start + note.duration);
		osc.connect(gain);
		gain.connect(master);
		osc.start(now + note.start);
		osc.stop(now + note.start + note.duration + .02);
	}
}
function playReviewChime() {
	const ctx = context();
	if (!ctx) return;
	const now = ctx.currentTime;
	const master = ctx.createGain();
	master.gain.setValueAtTime(1e-4, now);
	master.gain.exponentialRampToValueAtTime(.08, now + .02);
	master.gain.exponentialRampToValueAtTime(1e-4, now + .55);
	master.connect(ctx.destination);
	for (const note of [
		{
			freq: 523.25,
			start: 0,
			duration: .18
		},
		{
			freq: 659.25,
			start: .09,
			duration: .2
		},
		{
			freq: 783.99,
			start: .18,
			duration: .28
		}
	]) {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(note.freq, now + note.start);
		gain.gain.setValueAtTime(1e-4, now + note.start);
		gain.gain.exponentialRampToValueAtTime(1, now + note.start + .02);
		gain.gain.exponentialRampToValueAtTime(1e-4, now + note.start + note.duration);
		osc.connect(gain);
		gain.connect(master);
		osc.start(now + note.start);
		osc.stop(now + note.start + note.duration + .02);
	}
}
var ROOM = "ledger-review";
var ReviewLiveContext = (0, import_react.createContext)(null);
function slimCard(card) {
	return {
		...card,
		details: card.details.replace(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g, "").slice(0, 4e3),
		images: {}
	};
}
function isReviewMessage(value) {
	if (!value || typeof value !== "object" || !("type" in value)) return false;
	const message = value;
	if (message.type === "review-enter") return Boolean(message.card?.id);
	if (message.type === "review-leave") return typeof message.cardId === "string";
	if (message.type === "review-snapshot") return Array.isArray(message.cards);
	if (message.type === "pr-alert") return typeof message.cardId === "string" && typeof message.on === "boolean";
	return false;
}
function samePerson(left, right) {
	const a = left.trim().toLowerCase();
	const b = right.trim().toLowerCase();
	return Boolean(a) && a === b;
}
function pruneStampMap(map, now) {
	if (map.size < 40) return;
	for (const [key, at] of map) if (now - at > 3e4) map.delete(key);
}
function reviewIdsOf(themes) {
	return collectAllReviewCards(themes).map((card) => card.id);
}
function useReviewLiveSession(enabled) {
	const name = useProfileStore((state) => state.name) ?? "Guest";
	const soundOn = useProfileStore((state) => state.reviewSound);
	const p2p = useP2PRoom({
		room: ROOM,
		name,
		enabled
	});
	const prevPeers = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const soundOnRef = (0, import_react.useRef)(soundOn);
	soundOnRef.current = soundOn;
	const nameRef = (0, import_react.useRef)(name);
	nameRef.current = name;
	const lastEnterAt = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const lastAlertAt = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const queueRef = (0, import_react.useRef)([]);
	const joinedRef = (0, import_react.useRef)(false);
	joinedRef.current = p2p.joined;
	const skipPullChime = (0, import_react.useRef)(true);
	const prevReviewIds = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		const unlock = () => unlockReviewChime();
		window.addEventListener("pointerdown", unlock, { once: true });
		return () => window.removeEventListener("pointerdown", unlock);
	}, []);
	(0, import_react.useEffect)(() => {
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
				const existed = collectAllReviewCards(useBoardStore.getState().themes).some((card) => card.id === next.id);
				useBoardStore.getState().ingestReviewCard(next);
				if (!existed && soundOnRef.current) playReviewChime();
				return;
			}
			if (data.type === "pr-alert") {
				useBoardStore.getState().setCardPrAlert(data.cardId, data.on);
				if (data.on && samePerson(nameRef.current, data.assignee) && soundOnRef.current) playPrAlertChime();
				return;
			}
			const dest = data.dest && isColumnId(data.dest) && data.dest !== "review" ? data.dest : null;
			useBoardStore.getState().applyReviewLeave(data.cardId, dest);
		});
	}, [p2p.onMessage]);
	const reviewKey = useBoardStore((state) => state.themes.map((theme) => theme.order.review.join(",")).join("|"));
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		if (!p2p.joined) return;
		const queued = queueRef.current;
		if (!queued.length) return;
		queueRef.current = [];
		for (const message of queued) p2p.send(message);
	}, [p2p.joined, p2p.send]);
	const peerKey = p2p.peers.map((peer) => peer.id).join("|");
	(0, import_react.useEffect)(() => {
		const now = new Set(peerKey ? peerKey.split("|") : []);
		const added = [...now].filter((id) => !prevPeers.current.has(id));
		const remaining = [p2p.selfId, ...prevPeers.current].sort();
		if (added.length && remaining[0] === p2p.selfId) {
			const payload = {
				type: "review-snapshot",
				cards: collectAllReviewCards(useBoardStore.getState().themes).map(slimCard)
			};
			for (const id of added) p2p.send(payload, id);
		}
		prevPeers.current = now;
	}, [
		peerKey,
		p2p.selfId,
		p2p.send
	]);
	return (0, import_react.useMemo)(() => {
		const sendOrQueue = (message) => {
			if (joinedRef.current) p2p.send(message);
			else queueRef.current.push(message);
		};
		return {
			publishEnter(card) {
				const now = Date.now();
				pruneStampMap(lastEnterAt.current, now);
				if (now - (lastEnterAt.current.get(card.id) ?? 0) < 2500) return;
				lastEnterAt.current.set(card.id, now);
				sendOrQueue({
					type: "review-enter",
					card: slimCard(card)
				});
				if (soundOnRef.current) playReviewChime();
			},
			publishLeave(cardId, dest) {
				sendOrQueue({
					type: "review-leave",
					cardId,
					dest
				});
			},
			publishPrAlert(card, on) {
				const key = `${card.id}:${on ? "on" : "off"}`;
				const now = Date.now();
				pruneStampMap(lastAlertAt.current, now);
				if (now - (lastAlertAt.current.get(key) ?? 0) < 2500) return;
				lastAlertAt.current.set(key, now);
				sendOrQueue({
					type: "pr-alert",
					cardId: card.id,
					title: card.title,
					assignee: card.assignee,
					on
				});
				if (on && samePerson(nameRef.current, card.assignee) && soundOnRef.current) playPrAlertChime();
			}
		};
	}, [p2p.send]);
}
function ReviewLiveProvider({ children }) {
	const [armed, setArmed] = (0, import_react.useState)(false);
	const session = useReviewLiveSession(useBoardStore((state) => state.themes.some((theme) => theme.order.review.length > 0)) || armed);
	const value = (0, import_react.useMemo)(() => ({
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
		}
	}), [session]);
	return (0, import_react.createElement)(ReviewLiveContext.Provider, { value }, children);
}
function useReviewLive() {
	const context = (0, import_react.useContext)(ReviewLiveContext);
	if (context) return context;
	return {
		publishEnter() {},
		publishLeave() {},
		publishPrAlert() {}
	};
}
var BOARD_EVENT = {
	search: "ledger-search",
	undo: "ledger-undo",
	redo: "ledger-redo",
	help: "ledger-help"
};
function emitBoardEvent(type) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new Event(type));
}
function typingInField(target) {
	if (!(target instanceof HTMLElement)) return false;
	const tag = target.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}
var MAX = 40;
var past = [];
var future = [];
var prev = null;
var attached = false;
var status = {
	canUndo: false,
	canRedo: false
};
var listeners = /* @__PURE__ */ new Set();
function emit() {
	const next = {
		canUndo: past.length > 0,
		canRedo: future.length > 0
	};
	if (next.canUndo === status.canUndo && next.canRedo === status.canRedo) return;
	status = next;
	for (const listener of listeners) listener();
}
function snap(state) {
	return {
		themes: state.themes,
		activeThemeId: state.activeThemeId
	};
}
function subscribeHistory(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
function historyStatus() {
	return status;
}
function attachBoardHistory() {
	if (attached || typeof window === "undefined") return;
	attached = true;
	prev = snap(useBoardStore.getState());
	useBoardStore.subscribe((state) => {
		const next = snap(state);
		if (boardHistoryGate.skip) {
			prev = next;
			return;
		}
		if (prev && boardSignature(prev.themes, prev.activeThemeId) !== boardSignature(next.themes, next.activeThemeId)) {
			past.push(prev);
			if (past.length > MAX) past.shift();
			future = [];
			emit();
		}
		prev = next;
	});
}
function undoBoard() {
	if (!past.length) return false;
	const current = snap(useBoardStore.getState());
	const target = past.pop();
	future.push(current);
	boardHistoryGate.skip = true;
	useBoardStore.getState().replaceBoard(target.themes, target.activeThemeId);
	boardHistoryGate.skip = false;
	prev = snap(useBoardStore.getState());
	emit();
	return true;
}
function useHistoryStatus() {
	return (0, import_react.useSyncExternalStore)(subscribeHistory, historyStatus, () => status);
}
function redoBoard() {
	if (!future.length) return false;
	const current = snap(useBoardStore.getState());
	const target = future.pop();
	past.push(current);
	boardHistoryGate.skip = true;
	useBoardStore.getState().replaceBoard(target.themes, target.activeThemeId);
	boardHistoryGate.skip = false;
	prev = snap(useBoardStore.getState());
	emit();
	return true;
}
var CardDetailsDialog = (0, import_react.lazy)(() => import("./card-details-dialog-PkdB26_K.mjs").then((mod) => ({ default: mod.CardDetailsDialog })));
var WhiteboardCanvas = (0, import_react.lazy)(() => import("./whiteboard-canvas-DkDe5eQ2.mjs").then((mod) => ({ default: mod.WhiteboardCanvas })));
var POINTER_SENSOR = { activationConstraint: { distance: 6 } };
var TOUCH_SENSOR = { activationConstraint: {
	delay: 160,
	tolerance: 6
} };
var KEYBOARD_SENSOR = { coordinateGetter: sortableKeyboardCoordinates };
var dropAnimation = {
	duration: 240,
	easing: "cubic-bezier(0.22, 1, 0.36, 1)",
	sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.3" } } })
};
function KanbanBoard({ canvasOpen, onCanvasOpenChange }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [activeCard, setActiveCard] = (0, import_react.useState)(null);
	const [overColumn, setOverColumn] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(null);
	const [linkForm, setLinkForm] = (0, import_react.useState)(null);
	const [detailsCard, setDetailsCard] = (0, import_react.useState)(null);
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	const [pendingReview, setPendingReview] = (0, import_react.useState)(null);
	const [pendingPrAlert, setPendingPrAlert] = (0, import_react.useState)(null);
	const [pendingBlock, setPendingBlock] = (0, import_react.useState)(null);
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	const [helpOpen, setHelpOpen] = (0, import_react.useState)(false);
	const [focusedCardId, setFocusedCardId] = (0, import_react.useState)(null);
	const boardRef = (0, import_react.useRef)(null);
	const theme = useBoardStore(selectActiveTheme);
	const addCard = useBoardStore((state) => state.addCard);
	const updateCard = useBoardStore((state) => state.updateCard);
	const deleteCard = useBoardStore((state) => state.deleteCard);
	const moveCard = useBoardStore((state) => state.moveCard);
	const sendCardTo = useBoardStore((state) => state.sendCardTo);
	const toggleCardFlag = useBoardStore((state) => state.toggleCardFlag);
	const setCardLink = useBoardStore((state) => state.setCardLink);
	const setCardDetails = useBoardStore((state) => state.setCardDetails);
	const applyUrgencySort = useBoardStore((state) => state.applyUrgencySort);
	const setCardPrAlert = useBoardStore((state) => state.setCardPrAlert);
	const setCardBlock = useBoardStore((state) => state.setCardBlock);
	const reviewSound = useProfileStore((state) => state.reviewSound);
	const setReviewSound = useProfileStore((state) => state.setReviewSound);
	const { publishEnter, publishLeave, publishPrAlert } = useReviewLive();
	const cards = theme.cards;
	const order = theme.order;
	const candidates = (0, import_react.useMemo)(() => listThemeCards(theme), [theme]);
	const linkLayoutKey = (0, import_react.useMemo)(() => `${theme.id}:${COLUMN_IDS.map((id) => order[id].join(",")).join("|")}:${Object.values(cards).map((card) => `${card.id}:${card.blocked}:${card.blockedBy.join(",")}`).join("|")}`, [
		theme.id,
		order,
		cards
	]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const result = useBoardStore.persist.rehydrate();
		Promise.resolve(result).then(() => {
			if (cancelled) return;
			attachBoardHistory();
			setReady(true);
		});
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!focusedCardId) return;
		document.querySelector(`[data-card-id="${focusedCardId}"]`)?.scrollIntoView({
			block: "nearest",
			inline: "nearest"
		});
	}, [focusedCardId]);
	(0, import_react.useEffect)(() => {
		function onKey(event) {
			if (event.defaultPrevented) return;
			if (typingInField(event.target)) return;
			const meta = event.metaKey || event.ctrlKey;
			if (meta && event.key.toLowerCase() === "z") {
				event.preventDefault();
				if (event.shiftKey) {
					if (redoBoard()) toast("Redone");
				} else if (undoBoard()) toast("Undone");
				return;
			}
			if (meta && event.key.toLowerCase() === "y") {
				event.preventDefault();
				if (redoBoard()) toast("Redone");
				return;
			}
			if (searchOpen || helpOpen || form || detailsCard || linkForm || canvasOpen) {
				if (event.key === "Escape") {
					setSearchOpen(false);
					setHelpOpen(false);
				}
				return;
			}
			if (event.key === "/" && !event.shiftKey) {
				event.preventDefault();
				setSearchOpen(true);
				return;
			}
			if (event.key === "?") {
				event.preventDefault();
				setHelpOpen(true);
				return;
			}
			if (event.key.toLowerCase() === "c" && !meta) {
				event.preventDefault();
				setForm({
					mode: "create",
					columnId: "backlog"
				});
				return;
			}
			if (event.key.toLowerCase() === "z" && !meta) {
				event.preventDefault();
				if (undoBoard()) toast("Undone");
				return;
			}
			if (event.key.toLowerCase() === "u" && !meta) {
				event.preventDefault();
				if (undoBoard()) toast("Undone");
				return;
			}
			if (event.key.toLowerCase() === "r" && !meta && event.shiftKey) {
				event.preventDefault();
				if (redoBoard()) toast("Redone");
				return;
			}
			const ids = listThemeCards(selectActiveTheme(useBoardStore.getState())).map((card) => card.id);
			if (!ids.length) return;
			if (event.key === "j" || event.key === "ArrowDown") {
				event.preventDefault();
				setFocusedCardId((current) => {
					const index = current ? ids.indexOf(current) : -1;
					return ids[Math.min(ids.length - 1, index + 1)] ?? ids[0];
				});
				return;
			}
			if (event.key === "k" || event.key === "ArrowUp") {
				event.preventDefault();
				setFocusedCardId((current) => {
					const index = current ? ids.indexOf(current) : ids.length;
					return ids[Math.max(0, index - 1)] ?? ids[0];
				});
				return;
			}
			if (event.key === "Enter" && focusedCardId) {
				const card = selectActiveTheme(useBoardStore.getState()).cards[focusedCardId];
				if (card) {
					event.preventDefault();
					setDetailsCard(card);
				}
			}
		}
		function onSearch() {
			setSearchOpen(true);
		}
		function onUndo() {
			if (undoBoard()) toast("Undone");
		}
		function onRedo() {
			if (redoBoard()) toast("Redone");
		}
		function onHelp() {
			setHelpOpen(true);
		}
		window.addEventListener("keydown", onKey);
		window.addEventListener(BOARD_EVENT.search, onSearch);
		window.addEventListener(BOARD_EVENT.undo, onUndo);
		window.addEventListener(BOARD_EVENT.redo, onRedo);
		window.addEventListener(BOARD_EVENT.help, onHelp);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener(BOARD_EVENT.search, onSearch);
			window.removeEventListener(BOARD_EVENT.undo, onUndo);
			window.removeEventListener(BOARD_EVENT.redo, onRedo);
			window.removeEventListener(BOARD_EVENT.help, onHelp);
		};
	}, [
		searchOpen,
		helpOpen,
		form,
		detailsCard,
		linkForm,
		canvasOpen,
		focusedCardId
	]);
	const sensors = useSensors(useSensor(PointerSensor, POINTER_SENSOR), useSensor(TouchSensor, TOUCH_SENSOR), useSensor(KeyboardSensor, KEYBOARD_SENSOR));
	const columns = (0, import_react.useMemo)(() => COLUMNS.map((column) => ({
		...column,
		cards: order[column.id].map((id) => cards[id]).filter((card) => Boolean(card))
	})), [cards, order]);
	const counts = (0, import_react.useMemo)(() => Object.fromEntries(COLUMNS.map((column) => [column.id, order[column.id].length])), [order]);
	function resolveColumn(id) {
		if (!id) return null;
		return parseColumnId(id) ?? findColumnOf(order, id);
	}
	function handleDragStart(event) {
		const card = cards[String(event.active.id)];
		setActiveCard(card ?? null);
		setOverColumn(findColumnOf(order, String(event.active.id)));
	}
	function handleDragOver(event) {
		const overId = event.over?.id ? String(event.over.id) : null;
		const activeId = String(event.active.id);
		const nextColumn = resolveColumn(overId);
		const from = findColumnOf(order, activeId);
		if (from && nextColumn && !canEnterColumn(from, nextColumn)) {
			setOverColumn((current) => current === from ? current : from);
			return;
		}
		setOverColumn((current) => current === nextColumn ? current : nextColumn);
	}
	function handleDragEnd(event) {
		const overId = event.over?.id ? String(event.over.id) : null;
		const activeId = String(event.active.id);
		if (overId) {
			const current = selectActiveTheme(useBoardStore.getState());
			const from = findColumnOf(current.order, activeId);
			const to = resolveColumn(overId);
			const card = current.cards[activeId];
			if (card && from && to === "review" && from !== "review") setPendingReview({
				card,
				from
			});
			else if (from && to && !canEnterColumn(from, to)) toast.error("Cards reach Done from Review.");
			else if (from && to && from !== to) {
				moveCard(activeId, overId);
				if (card && from === "review") publishLeave(card.id, to);
			} else if (from && to && from === to && from !== "review") moveCard(activeId, overId);
		}
		applyUrgencySort();
		setActiveCard(null);
		setOverColumn(null);
	}
	function handleDragCancel() {
		applyUrgencySort();
		setActiveCard(null);
		setOverColumn(null);
	}
	function handleFormSubmit(values) {
		if (!form) return;
		if (form.mode === "create") {
			if (!columnMeta(form.columnId).allowsCreate) return;
			addCard(form.columnId, values.title, values.description, {
				blocked: values.blocked,
				urgent: values.urgent,
				blockedBy: values.blockedBy
			});
			toast.success("Card added");
			return;
		}
		updateCard(form.card.id, values);
		toast.success("Card updated");
	}
	const handleDelete = (0, import_react.useCallback)((card) => {
		setPendingDelete(card);
	}, []);
	const handleToggleFlag = (0, import_react.useCallback)((card, flag) => {
		if (flag === "blocked") {
			if (card.blocked) {
				setCardBlock(card.id, false, []);
				toast("Blocked cleared");
				return;
			}
			setPendingBlock(card);
			return;
		}
		toggleCardFlag(card.id, flag);
		const next = !card.urgent;
		toast(next ? "Marked urgent" : "Urgent cleared");
	}, [setCardBlock, toggleCardFlag]);
	const handleEditLink = (0, import_react.useCallback)((card, kind) => {
		setLinkForm({
			card,
			kind
		});
	}, []);
	function handleLinkSubmit(url) {
		if (!linkForm) return;
		setCardLink(linkForm.card.id, linkForm.kind, url);
		toast.success(url ? linkForm.kind === "jira" ? "Jira link saved" : "PR link saved" : linkForm.kind === "jira" ? "Jira link removed" : "PR link removed");
	}
	function handleDetailsSave(details, images) {
		if (!detailsCard) return;
		setCardDetails(detailsCard.id, details, images);
		toast.success("Details saved");
	}
	const handleSendTo = (0, import_react.useCallback)((card, columnId) => {
		const from = findColumnOf(selectActiveTheme(useBoardStore.getState()).order, card.id);
		if (!from) return;
		if (columnId === "review") {
			if (from === "review") return;
			setPendingReview({
				card,
				from
			});
			return;
		}
		if (!canEnterColumn(from, columnId)) {
			toast.error("Cards reach Done from Review.");
			return;
		}
		if (!sendCardTo(card.id, columnId)) return;
		if (from === "review") publishLeave(card.id, columnId);
		toast(`Moved to ${columnMeta(columnId).title}`);
		requestAnimationFrame(() => {
			document.getElementById(`column-${columnId}`)?.scrollIntoView({
				behavior: "smooth",
				inline: "center",
				block: "nearest"
			});
		});
	}, [publishLeave, sendCardTo]);
	function confirmReviewMove() {
		if (!pendingReview) return;
		const { card, from } = pendingReview;
		setPendingReview(null);
		if (from === "review") return;
		if (!sendCardTo(card.id, "review")) return;
		publishEnter(card);
		toast("Moved to Review");
		requestAnimationFrame(() => {
			document.getElementById("column-review")?.scrollIntoView({
				behavior: "smooth",
				inline: "center",
				block: "nearest"
			});
		});
	}
	function scrollToColumn(id) {
		document.getElementById(`column-${id}`)?.scrollIntoView({
			behavior: "smooth",
			inline: "center",
			block: "nearest"
		});
	}
	function confirmDelete() {
		if (!pendingDelete) return;
		const from = findColumnOf(order, pendingDelete.id);
		deleteCard(pendingDelete.id);
		if (from === "review") publishLeave(pendingDelete.id, null);
		toast("Card deleted");
		setPendingDelete(null);
	}
	function confirmPrAlert() {
		if (!pendingPrAlert) return;
		const next = !pendingPrAlert.prAlert;
		setCardPrAlert(pendingPrAlert.id, next);
		publishPrAlert({
			...pendingPrAlert,
			prAlert: next
		}, next);
		toast(next ? "PR Alert on" : "PR Alert cleared");
		setPendingPrAlert(null);
	}
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col gap-4 lg:gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeTabsSkeleton, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-full animate-pulse rounded-md bg-surface" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardSkeleton, {})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-4 lg:gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeTabs, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoticeBar, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex shrink-0 items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: canvasOpen ? "secondary" : "outline",
						onClick: () => onCanvasOpenChange(!canvasOpen),
						children: [canvasOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "size-4" }), canvasOpen ? "Show board" : "Open canvas"]
					})
				}),
				canvasOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-h-80 flex-1 flex-col xl:min-h-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
						fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-80 flex-1 animate-pulse rounded-xl bg-bg-elevated" }),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhiteboardCanvas, { onClose: () => onCanvasOpenChange(false) })
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowStrip, {
					counts,
					onSelect: scrollToColumn
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DndContext, {
					sensors,
					collisionDetection: closestCorners,
					onDragStart: handleDragStart,
					onDragOver: handleDragOver,
					onDragEnd: handleDragEnd,
					onDragCancel: handleDragCancel,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: boardRef,
						className: "board-scroller relative flex snap-x snap-mandatory items-start gap-3 overflow-x-auto pb-2 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200 xl:min-h-0 xl:flex-1 xl:items-stretch xl:gap-3 xl:overflow-x-hidden xl:snap-none wide:gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockLinks, {
							cards,
							layoutKey: linkLayoutKey,
							scrollerRef: boardRef
						}), columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanColumn, {
							id: column.id,
							title: column.title,
							hint: column.hint,
							empty: column.empty,
							emptyHint: column.emptyHint,
							cards: column.cards,
							itemIds: order[column.id],
							isOver: overColumn === column.id,
							onAdd: (columnId) => setForm({
								mode: "create",
								columnId
							}),
							onEdit: (card) => setForm({
								mode: "edit",
								card
							}),
							onDelete: handleDelete,
							onToggleFlag: handleToggleFlag,
							onSendTo: handleSendTo,
							onEditLink: handleEditLink,
							onOpenDetails: setDetailsCard,
							onPrAlert: setPendingPrAlert,
							soundOn: reviewSound,
							onSoundToggle: () => setReviewSound(!reviewSound),
							virtualize: !activeCard && !focusedCardId,
							focusedCardId
						}, column.id))]
					}, theme.id), typeof document !== "undefined" ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragOverlay, {
						dropAnimation,
						children: activeCard ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-[min(100vw-2.5rem,19.5rem)] xl:w-80",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFace, {
								card: activeCard,
								overlay: true,
								compact: findColumnOf(order, activeCard.id) === "done"
							})
						}) : null
					}), document.body) : null]
				})] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFormDialog, {
			open: form !== null,
			state: form,
			candidates,
			onOpenChange: (open) => {
				if (!open) setForm(null);
			},
			onSubmit: handleFormSubmit
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardLinkDialog, {
			open: linkForm !== null,
			state: linkForm,
			onOpenChange: (open) => {
				if (!open) setLinkForm(null);
			},
			onSubmit: handleLinkSubmit
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardSearch, {
			open: searchOpen,
			onOpenChange: setSearchOpen,
			onPick: (hit) => {
				useBoardStore.getState().setActiveTheme(hit.themeId);
				setFocusedCardId(hit.card.id);
				setDetailsCard(hit.card);
			}
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShortcutHelp, {
			open: helpOpen,
			onOpenChange: setHelpOpen
		}),
		detailsCard ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: null,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDetailsDialog, {
				open: true,
				card: detailsCard,
				onOpenChange: (open) => {
					if (!open) setDetailsCard(null);
				},
				onSave: handleDetailsSave
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockReasonDialog, {
			open: pendingBlock !== null,
			card: pendingBlock,
			candidates,
			onOpenChange: (open) => {
				if (!open) setPendingBlock(null);
			},
			onConfirm: (blockedBy) => {
				if (!pendingBlock) return;
				setCardBlock(pendingBlock.id, true, blockedBy);
				setPendingBlock(null);
				toast("Marked blocked");
			}
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: pendingDelete !== null,
			onOpenChange: (open) => {
				if (!open) setPendingDelete(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete this card?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: pendingDelete ? `“${pendingDelete.title}” will be removed from the board. This cannot be undone.` : "This card will be removed from the board." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep card" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: confirmDelete,
				children: "Delete"
			})] })] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: pendingReview !== null,
			onOpenChange: (open) => {
				if (!open) setPendingReview(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Send to Review?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: pendingReview ? `“${pendingReview.card.title}” will appear in Review for everyone, and the Review sound will play.` : "This card will appear in Review for everyone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: confirmReviewMove,
				children: "Send to Review"
			})] })] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: pendingPrAlert !== null,
			onOpenChange: (open) => {
				if (!open) setPendingPrAlert(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: pendingPrAlert?.prAlert ? "Clear PR Alert?" : "Turn on PR Alert?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: pendingPrAlert?.prAlert ? `“${pendingPrAlert.title}” will return to its normal state.` : pendingPrAlert?.assignee ? `“${pendingPrAlert.title}” will light up for everyone. ${pendingPrAlert.assignee} will hear a short alert.` : `“${pendingPrAlert?.title ?? "This card"}” will light up for everyone. Assign someone if they should hear the alert.` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: confirmPrAlert,
				children: pendingPrAlert?.prAlert ? "Clear alert" : "Turn on alert"
			})] })] })
		})
	] });
}
function BoardSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-start gap-3 overflow-hidden xl:min-h-0 xl:flex-1 xl:items-stretch",
		children: COLUMNS.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-72 w-[85vw] min-w-[85vw] shrink-0 animate-pulse rounded-xl bg-bg-elevated shadow-border md:h-80 md:w-64 md:min-w-64 xl:h-auto xl:min-h-0 xl:w-auto xl:flex-1" }, column.id))
	});
}
var FACES = [
	"1",
	"2",
	"3",
	"5",
	"8",
	"13"
];
function PokerLaunch({ onStart }) {
	const waiting = useBoardStore((state) => collectPlanningCards(state.themes).length);
	const [confirming, setConfirming] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "shrink-0 overflow-hidden rounded-xl bg-bg-elevated shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 xl:gap-4 xl:px-5 xl:py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2 rounded-full bg-planning",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.18em] text-subtle uppercase",
							children: "Planning poker"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display mt-2 text-2xl tracking-tight text-fg sm:text-3xl xl:mt-1 xl:text-xl",
						children: "Sit at the table"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-md text-sm leading-relaxed text-muted xl:hidden",
						children: "One shared room. Hidden votes, then a duration for every card in Planning."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-xs tracking-wide text-subtle tabular-nums",
						children: waiting === 0 ? "Nothing in Planning yet" : `${waiting} ${waiting === 1 ? "card" : "cards"} waiting`
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-start gap-4 sm:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex xl:hidden",
					"aria-hidden": "true",
					children: FACES.map((face, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 -ml-2 place-items-center rounded-md bg-surface font-display text-sm text-fg shadow-card first:ml-0",
						style: { transform: `rotate(${(index - 2.5) * 4}deg)` },
						children: face
					}, face))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					onClick: () => setConfirming(true),
					className: "h-11 px-5",
					children: ["Start planning poker", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: confirming,
			onOpenChange: setConfirming,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Start planning poker?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: waiting === 0 ? "The room will open now. Planning cards from every tab will land on the table as they appear." : `This opens the live room and loads ${waiting} ${waiting === 1 ? "card" : "cards"} from Planning across every tab. Votes stay hidden until everyone has played.` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Not now" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				className: cn(buttonVariants()),
				onClick: onStart,
				children: "Enter room"
			})] })] })
		})]
	});
}
var LABEL = {
	dark: "Dark",
	light: "Light",
	soft: "Soft"
};
var ICON = {
	dark: Moon,
	light: Sun,
	soft: Sunset
};
function ThemeSwitch() {
	const appearance = useProfileStore((state) => state.appearance);
	const setAppearance = useProfileStore((state) => state.setAppearance);
	function choose(next) {
		setAppearance(next);
		applyAppearance(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "radiogroup",
		"aria-label": "Appearance",
		className: "inline-flex rounded-lg bg-surface p-0.5 shadow-border",
		children: APPEARANCES.map((item) => {
			const Icon = ICON[item];
			const selected = item === appearance;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				role: "radio",
				"aria-checked": selected,
				onClick: () => choose(item),
				className: cn("inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors duration-150", selected ? "bg-bg-elevated text-fg shadow-border" : "text-muted hover:text-fg"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }), LABEL[item]]
			}, item);
		})
	});
}
var TONE = {
	backlog: "bg-backlog",
	planning: "bg-planning",
	todo: "bg-todo",
	doing: "bg-doing",
	review: "bg-review",
	done: "bg-done"
};
function SiteHeader() {
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const themeName = useBoardStore((state) => selectActiveTheme(state).name);
	const total = useBoardStore((state) => themeCardCount(selectActiveTheme(state)));
	const themes = useBoardStore((state) => state.themes);
	const activeThemeId = useBoardStore((state) => state.activeThemeId);
	const counts = (0, import_react.useMemo)(() => boardColumnCounts(themes), [themes]);
	const name = useProfileStore((state) => state.name);
	const history = useHistoryStatus();
	(0, import_react.useEffect)(() => {
		const finish = () => setHydrated(true);
		if (useBoardStore.persist.hasHydrated()) {
			finish();
			return;
		}
		return useBoardStore.persist.onFinishHydration(finish);
	}, []);
	function handleUndo() {
		if (undoBoard()) toast("Undone");
	}
	function handleRedo() {
		if (redoBoard()) toast("Redone");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border pb-4 lg:pb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeSwitch, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon-sm",
					"aria-label": "Search cards",
					title: "Search /",
					onClick: () => emitBoardEvent(BOARD_EVENT.search),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon-sm",
					"aria-label": "Undo",
					title: "Undo",
					disabled: !history.canUndo,
					onClick: handleUndo,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon-sm",
					"aria-label": "Redo",
					title: "Redo",
					disabled: !history.canRedo,
					onClick: handleRedo,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Redo2, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "Export",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						onSelect: () => {
							try {
								downloadBoardJson(themes, activeThemeId);
								toast.success("Downloaded the board JSON.");
							} catch (error) {
								toast.error(errorMessage(error, "Could not export the board."));
							}
						},
						children: "Export JSON"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						onSelect: () => {
							const theme = themes.find((item) => item.id === activeThemeId) ?? themes[0];
							if (!theme) return;
							try {
								const count = downloadThemeCsv(theme);
								if (!count) {
									toast.error("This theme has no cards to export.");
									return;
								}
								toast.success(`Downloaded ${count} cards.`);
							} catch (error) {
								toast.error(errorMessage(error, "Could not export the CSV."));
							}
						},
						children: "Export this theme CSV"
					})]
				})] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-wrap items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-2 rounded-md bg-surface py-1 pr-2 pl-2.5 shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "shrink-0 text-[0.65rem] font-medium tracking-[0.16em] text-subtle uppercase",
						children: "Overview"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex items-center gap-0.5 overflow-x-auto",
						children: COLUMNS.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex h-7 items-center gap-1.5 rounded-md px-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("size-1.5 shrink-0 rounded-full", TONE[column.id]),
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[0.65rem] font-medium text-muted",
									children: column.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-fg tabular-nums",
									children: hydrated ? counts[column.id] : "—"
								})
							]
						}) }, column.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-wide text-subtle tabular-nums",
					children: hydrated ? `${total} ${total === 1 ? "card" : "cards"} in ${themeName}` : "—"
				}),
				name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "flex h-9 items-center rounded-md bg-surface px-3 text-sm font-medium shadow-border",
					children: name
				}) : null
			]
		})]
	});
}
function SyncBanner() {
	const health = useSyncStatus((state) => state.health);
	const message = useSyncStatus((state) => state.message);
	if (health === "ok") return null;
	const offline = health === "offline";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		className: "flex flex-wrap items-center justify-between gap-3 rounded-lg bg-urgent/12 px-3 py-2.5 text-urgent shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex min-w-0 items-start gap-2 text-sm leading-snug",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "mt-0.5 size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: message || (offline ? "You are offline. Edits stay on this device." : "Could not save to the workspace.") })]
		}), offline ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			size: "sm",
			variant: "secondary",
			onClick: () => requestSyncRetry(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), "Retry"]
		})]
	});
}
function WelcomeScreen({ needName, requirePassword, bootError, onUnlocked, onRetry }) {
	const setName = useProfileStore((state) => state.setName);
	const [name, setNameValue] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	async function handleSubmit(event) {
		event.preventDefault();
		if (bootError) {
			onRetry?.();
			return;
		}
		const nextName = name.trim();
		if (needName && !nextName) return;
		if (requirePassword && !password) return;
		if (busy) return;
		setBusy(true);
		setError("");
		try {
			let token = getUnlockToken();
			if (requirePassword) {
				const unlocked = await unlockWorkspace({ data: { password } });
				if (!unlocked.ok) {
					setError("Wrong password.");
					setPassword("");
					return;
				}
				token = unlocked.token;
				setUnlockToken(token);
			}
			if (needName) {
				const saved = await saveProfile({ data: {
					deviceId: useProfileStore.getState().deviceId,
					name: nextName,
					token
				} });
				setName(saved.name ?? nextName);
			}
			onUnlocked();
		} catch (caught) {
			setError(errorMessage(caught, requirePassword ? "Could not unlock the workspace." : "Could not save your name."));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg px-4 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (event) => void handleSubmit(event),
			className: "w-full max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.18em] text-subtle uppercase",
					children: "Ledger"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-3 text-4xl leading-none tracking-tight sm:text-5xl",
					children: bootError ? "Could not open the board" : needName ? "Join the board" : "Unlock the board"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-sm text-sm leading-relaxed text-muted",
					children: bootError ? bootError : needName ? requirePassword ? "Enter your name and the shared workspace password." : "Just a name for this device. We will not ask again." : "This workspace is private. Enter the shared password to continue."
				}),
				bootError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "mt-6 w-full",
					disabled: busy,
					children: "Try again"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					needName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "profile-name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "profile-name",
							value: name,
							onChange: (event) => setNameValue(event.target.value),
							placeholder: "Your name",
							autoFocus: true,
							required: true,
							maxLength: 40,
							autoComplete: "name"
						})]
					}) : null,
					requirePassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `${needName ? "mt-4" : "mt-8"} grid gap-2`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "workspace-password",
							children: "Password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "workspace-password",
							type: "password",
							value: password,
							onChange: (event) => setPassword(event.target.value),
							placeholder: "Shared password",
							autoFocus: !needName,
							required: true,
							autoComplete: "current-password"
						})]
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-urgent",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "mt-6 w-full",
						disabled: needName && !name.trim() || requirePassword && !password || busy,
						children: "Continue"
					})
				] })
			]
		})
	});
}
function WelcomeSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-16 animate-pulse rounded-sm bg-surface" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-10 w-64 animate-pulse rounded-md bg-surface" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-4 w-48 animate-pulse rounded-sm bg-surface" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-8 h-11 w-full animate-pulse rounded-md bg-surface" })
			]
		})
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
var PlanningPoker = (0, import_react.lazy)(() => import("./planning-poker-B5MOZJ8X.mjs").then((mod) => ({ default: mod.PlanningPoker })));
function Home() {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [unlocked, setUnlocked] = (0, import_react.useState)(false);
	const [bootError, setBootError] = (0, import_react.useState)("");
	const [retry, setRetry] = (0, import_react.useState)(0);
	const [poker, setPoker] = (0, import_react.useState)(null);
	const [canvasOpen, setCanvasOpen] = (0, import_react.useState)(false);
	const name = useProfileStore((state) => state.name);
	const setName = useProfileStore((state) => state.setName);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function boot() {
			setBootError("");
			await Promise.resolve(useProfileStore.persist.rehydrate());
			const token = getUnlockToken();
			let ok = false;
			if (token) try {
				ok = (await checkUnlock({ data: { token } })).ok;
			} catch (error) {
				if (!cancelled) {
					setBootError(errorMessage(error, "Could not reach the workspace. Try again."));
					setReady(true);
				}
				return;
			}
			if (ok) {
				const profile = useProfileStore.getState();
				if (!profile.name && profile.deviceId) try {
					const remote = await loadProfile({ data: {
						deviceId: profile.deviceId,
						token
					} });
					if (!cancelled && remote.name) setName(remote.name);
				} catch {}
			}
			if (!cancelled) {
				setUnlocked(ok);
				setReady(true);
			}
		}
		boot();
		return () => {
			cancelled = true;
		};
	}, [setName, retry]);
	function startPoker() {
		const cards = planningDeck(useBoardStore.getState().themes);
		setPoker({ cards });
	}
	const exitPoker = (0, import_react.useCallback)(() => setPoker(null), []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WelcomeSkeleton, {});
	if (bootError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WelcomeScreen, {
		needName: false,
		requirePassword: false,
		bootError,
		onRetry: () => {
			setReady(false);
			setRetry((value) => value + 1);
		},
		onUnlocked: () => setUnlocked(true)
	});
	if (!unlocked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WelcomeScreen, {
		needName: !name,
		requirePassword: true,
		onUnlocked: () => setUnlocked(true)
	});
	if (!name) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WelcomeScreen, {
		needName: true,
		requirePassword: false,
		onUnlocked: () => setUnlocked(true)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-bg text-fg lg:h-dvh lg:overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ReviewLiveProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardSync, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-full min-h-0 w-full flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:gap-4 lg:px-8 lg:py-5 wide:px-10 qhd:px-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncBanner, {}),
				poker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1 overflow-y-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
						fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-80 animate-pulse rounded-xl bg-bg-elevated" }),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanningPoker, {
							name,
							initialCards: poker.cards,
							onExit: exitPoker
						})
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-h-0 flex-1 flex-col",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanBoard, {
						canvasOpen,
						onCanvasOpenChange: setCanvasOpen
					})
				}), canvasOpen ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PokerLaunch, { onStart: startPoker }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "shrink-0 text-center text-xs text-subtle lg:hidden",
					children: "Saved to the shared workspace."
				})] })] })
			]
		})] })
	});
}
//#endregion
export { fetchAssetRows as C, ensureAssets as S, useAssetGeneration as T, Dialog as _, VOTE_VALUES as a, DialogTitle as b, emptyVotes as c, isPokerState as d, isPokerVote as f, getUnlockToken as g, useP2PRoom as h, rememberServerVersion as i, everyoneVoted as l, themeDurationTotals as m, stashBoardAssets as n, averageVote as o, numericVotes as p, getServerVersion as r, durationOptions as s, routes_exports as t, formatPokerTxt as u, DialogContent as v, resolveAsset as w, assetIdFromSrc as x, DialogDescription as y };
