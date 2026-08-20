import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { g as require_jsx_runtime } from "../_libs/@excalidraw/excalidraw+[...].mjs";
import { G as useBoardStore } from "./kanban-CtoXHh96.mjs";
import { U as ArrowLeft, j as Download } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as errorMessage, m as triggerDownload, n as Button, s as cn } from "./router-YokSpP1N.mjs";
import { t as MarkdownPreview } from "./markdown-preview-DR8VLGva.mjs";
import { a as VOTE_VALUES, c as emptyVotes, d as isPokerState, f as isPokerVote, h as useP2PRoom, l as everyoneVoted, m as themeDurationTotals, o as averageVote, p as numericVotes, s as durationOptions, u as formatPokerTxt } from "./routes-COmF4DMp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/planning-poker-B5MOZJ8X.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var POKER_ROOM = "ledger-poker";
function PlanningPoker({ name, initialCards, onExit }) {
	const p2p = useP2PRoom({
		room: POKER_ROOM,
		name
	});
	const setCardDuration = useBoardStore((state) => state.setCardDuration);
	const commitPokerResults = useBoardStore((state) => state.commitPokerResults);
	const [seeding, setSeeding] = (0, import_react.useState)(() => initialCards.length > 0);
	const [state, setState] = (0, import_react.useState)(() => initialCards.length ? {
		hostId: "pending",
		cards: initialCards,
		index: 0,
		phase: "voting",
		votes: {}
	} : null);
	const stateRef = (0, import_react.useRef)(state);
	stateRef.current = state;
	const players = (0, import_react.useMemo)(() => [{
		id: p2p.selfId,
		name
	}, ...p2p.peers.map((peer) => ({
		id: peer.id,
		name: peer.name || "Guest"
	}))], [
		name,
		p2p.peers,
		p2p.selfId
	]);
	const playerIds = players.map((player) => player.id);
	(0, import_react.useEffect)(() => {
		if (!seeding) return;
		setState((current) => {
			if (!current || current.hostId === p2p.selfId) return current;
			return {
				...current,
				hostId: p2p.selfId
			};
		});
	}, [seeding, p2p.selfId]);
	(0, import_react.useEffect)(() => {
		if (1 + p2p.peers.length <= 10) return;
		const ids = [p2p.selfId, ...p2p.peers.map((peer) => peer.id)].sort();
		if (ids[ids.length - 1] !== p2p.selfId) return;
		toast.error("This room is full (10 people).");
		onExit();
	}, [
		onExit,
		p2p.peers.length,
		p2p.selfId
	]);
	const playerKey = playerIds.join("|");
	(0, import_react.useEffect)(() => {
		const ids = playerKey ? playerKey.split("|") : [];
		setState((current) => {
			if (!current || current.phase === "done") return current;
			const nextVotes = { ...emptyVotes(ids) };
			let changed = Object.keys(current.votes).length !== ids.length;
			for (const id of ids) {
				if (current.votes[id] != null) nextVotes[id] = current.votes[id];
				if (current.votes[id] !== nextVotes[id]) changed = true;
			}
			const shouldReveal = everyoneVoted(nextVotes, ids);
			if (!changed && (!shouldReveal || current.phase === "reveal")) return current;
			return {
				...current,
				votes: nextVotes,
				phase: shouldReveal ? "reveal" : current.phase
			};
		});
	}, [playerKey]);
	(0, import_react.useEffect)(() => {
		return p2p.onMessage((from, data) => {
			if (!data || typeof data !== "object" || !("type" in data)) return;
			const message = data;
			if (message.type === "sync" && isPokerState(message.state)) {
				setSeeding(false);
				setState(message.state);
				return;
			}
			if (message.type === "vote" && isPokerVote(message.value)) {
				setState((current) => {
					if (!current) return current;
					return applyVote(current, from, message.cardId, message.value, playerIdsRef.current);
				});
				return;
			}
			if (message.type === "pick") {
				setState((current) => {
					if (!current) return current;
					return applyPick(current, message.cardId, message.duration, playerIdsRef.current);
				});
				if (message.duration > 0) setCardDuration(message.cardId, message.duration);
			}
			if (message.type === "commit") {
				commitPokerResults(message.cards);
				toast.success("Planning cards moved to To Do");
			}
		});
	}, [
		p2p.onMessage,
		setCardDuration,
		commitPokerResults
	]);
	const playerIdsRef = (0, import_react.useRef)(playerIds);
	playerIdsRef.current = playerIds;
	(0, import_react.useEffect)(() => {
		if (!p2p.joined) return;
		const current = stateRef.current;
		if (!current || current.phase === "done") return;
		p2p.send({
			type: "sync",
			state: {
				...current,
				hostId: current.hostId === "pending" ? p2p.selfId : current.hostId
			}
		});
	}, [
		p2p.joined,
		p2p.peers.length,
		p2p.selfId,
		p2p.send
	]);
	const card = state?.cards[state.index] ?? null;
	const myVote = state ? state.votes[p2p.selfId] ?? null : null;
	const numbers = state ? numericVotes(state.votes) : [];
	const average = averageVote(numbers);
	const options = average == null ? [] : durationOptions(average);
	const votedCount = state ? players.filter((player) => state.votes[player.id] != null).length : 0;
	function vote(value) {
		if (!state || !card || state.phase !== "voting") return;
		setState((current) => {
			if (!current) return current;
			return applyVote(current, p2p.selfId, card.id, value, playerIds);
		});
		p2p.send({
			type: "vote",
			cardId: card.id,
			value
		});
	}
	function pick(duration) {
		if (!state || !card || state.phase !== "reveal") return;
		setCardDuration(card.id, duration);
		setState((current) => {
			if (!current) return current;
			return applyPick(current, card.id, duration, playerIds);
		});
		p2p.send({
			type: "pick",
			cardId: card.id,
			duration
		});
	}
	function pickNextWithoutDuration() {
		if (!state || !card || state.phase !== "reveal") return;
		setState((current) => {
			if (!current) return current;
			return applyPick(current, card.id, null, playerIds);
		});
		p2p.send({
			type: "pick",
			cardId: card.id,
			duration: -1
		});
	}
	function download() {
		if (!state) return;
		try {
			commitPokerResults(state.cards);
			p2p.send({
				type: "commit",
				cards: state.cards
			});
			const blob = new Blob([formatPokerTxt(state.cards)], { type: "text/plain;charset=utf-8" });
			triggerDownload(blob, "planning-poker.txt");
			toast.success("Durations saved. Planning cards moved to To Do.");
		} catch (error) {
			toast.error(errorMessage(error, "Could not download the planning list."));
		}
	}
	const revealed = state?.phase === "reveal";
	const done = state?.phase === "done";
	const themeTotals = done && state ? themeDurationTotals(state.cards) : [];
	const grandTotal = themeTotals.reduce((sum, group) => sum + group.total, 0);
	const progress = state && state.cards.length ? Math.min(1, (done ? state.cards.length : state.index) / state.cards.length) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
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
								className: "font-display mt-1 text-3xl tracking-tight text-fg sm:text-4xl",
								children: done ? "The table is clear" : "The table"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: done ? "Durations are ready to save." : state && card ? `${card.themeName} · ${state.index + 1} of ${state.cards.length}` : "Waiting for Planning cards"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "secondary",
						onClick: onExit,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Back to board"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-px overflow-hidden rounded-full bg-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-planning transition-[width] duration-300 ease-[var(--ease-smooth-out)]",
						style: { width: `${Math.round(progress * 100)}%` }
					})
				})]
			}),
			!state ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid min-h-72 place-items-center rounded-xl bg-bg-elevated p-8 text-center shadow-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl tracking-tight text-fg",
						children: "Hold the seats"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-sm text-sm text-muted",
						children: "Planning cards will land here as soon as someone at the table shares them."
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerRail, {
					players,
					votes: {},
					revealed: false,
					selfId: p2p.selfId
				})]
			}) : done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 rounded-xl bg-bg-elevated p-5 shadow-border sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "max-w-md text-sm text-muted",
							children: [
								state.cards.length,
								" ",
								state.cards.length === 1 ? "card" : "cards",
								" estimated. Download moves them from Planning to To Do."
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							onClick: download,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download list"]
						})]
					}),
					themeTotals.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
						children: [themeTotals.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-surface px-4 py-3 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs font-medium tracking-wide text-subtle uppercase",
									children: group.themeName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display mt-1 text-3xl tabular-nums text-fg",
									children: group.total
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted",
									children: [
										group.counted,
										" ",
										group.counted === 1 ? "estimate" : "estimates"
									]
								})
							]
						}, group.themeId)), themeTotals.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-bg px-4 py-3 shadow-border sm:col-span-2 lg:col-span-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-wide text-subtle uppercase",
									children: "All tabs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display mt-1 text-3xl tabular-nums text-fg",
									children: grandTotal
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: "Sum of every estimate"
								})
							]
						}) : null]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "grid gap-2",
						children: state.cards.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-baseline justify-between gap-4 rounded-lg bg-surface px-4 py-3 shadow-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "wrap-break-word text-sm font-medium text-fg [overflow-wrap:anywhere]",
									children: item.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-subtle",
									children: item.themeName
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "shrink-0 font-display text-xl tabular-nums text-fg",
								children: [item.duration ?? "—", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 font-sans text-xs text-subtle",
									children: index + 1
								})]
							})]
						}, item.id))
					})
				]
			}) : card ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "min-h-80 overflow-hidden rounded-xl bg-bg-elevated shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 border-b border-border px-5 py-3 sm:px-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.16em] text-subtle uppercase",
							children: card.themeName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs text-subtle tabular-nums",
							children: [
								votedCount,
								"/",
								players.length,
								" voted"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-h-[28rem] overflow-y-auto p-5 sm:p-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-3xl leading-tight tracking-tight text-fg wrap-break-word [overflow-wrap:anywhere] sm:text-4xl",
								children: card.title
							}),
							card.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-2xl text-base leading-relaxed wrap-break-word text-muted [overflow-wrap:anywhere]",
								children: card.description
							}) : null,
							card.details.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6 border-t border-border pt-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownPreview, {
									markdown: card.details,
									images: card.images
								})
							}) : null
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerRail, {
					players,
					votes: state.votes,
					revealed,
					selfId: p2p.selfId
				})]
			}) : null,
			state && card && state.phase === "voting" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-bg-elevated p-4 shadow-border sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Your estimate stays hidden until everyone has voted."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [VOTE_VALUES.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => vote(value),
						className: cn("grid h-16 w-12 place-items-center rounded-lg font-display text-xl shadow-card transition-[background-color,color,transform] duration-150", myVote === value ? "bg-accent text-accent-fg" : "bg-surface text-fg hover:-translate-y-0.5 hover:bg-surface-hover"),
						children: value
					}, value)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => vote("skip"),
						className: cn("inline-flex h-16 items-center rounded-lg px-5 text-sm font-medium shadow-card transition-[background-color,color] duration-150", myVote === "skip" ? "bg-accent text-accent-fg" : "bg-surface text-muted hover:bg-surface-hover hover:text-fg"),
						children: "Skip"
					})]
				})]
			}) : null,
			state && card && revealed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-bg-elevated p-4 shadow-border sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.16em] text-subtle uppercase",
						children: "Revealed"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: average == null ? "Everyone skipped. Leave duration empty, or pick one." : "Choose a duration for this card."
					})] }), average != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-5xl leading-none tracking-tight tabular-nums text-fg",
						children: average.toFixed(1)
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [options.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => pick(value),
						className: cn("grid h-14 min-w-14 place-items-center rounded-lg px-4 font-display text-xl shadow-card transition-[background-color,color] duration-150", value === Math.round(average ?? value) ? "bg-accent text-accent-fg" : "bg-surface text-fg hover:bg-surface-hover"),
						children: value
					}, value)), average == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: pickNextWithoutDuration,
						children: "Skip card"
					}) : null]
				})]
			}) : null
		]
	});
}
function PlayerRail({ players, votes, revealed, selfId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "grid content-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.16em] text-subtle uppercase",
				children: "Seats"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-xs text-subtle tabular-nums",
				children: [
					players.length,
					"/",
					10
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid gap-2",
			children: players.map((player) => {
				const voteValue = votes[player.id] ?? null;
				const placed = voteValue != null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 rounded-lg bg-surface px-3 py-2.5 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							className: cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold tracking-wide", placed ? "bg-accent text-accent-fg" : "bg-bg text-muted"),
							children: player.name.slice(0, 1).toUpperCase()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-sm font-medium text-fg",
								children: [player.name, player.id === selfId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1.5 text-xs font-normal text-subtle",
									children: "you"
								}) : null]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: placed ? revealed ? "Voted" : "In" : "Waiting"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "shrink-0 font-display text-xl tabular-nums text-fg",
							children: voteLabel(voteValue, revealed)
						})
					]
				}, player.id);
			})
		})]
	});
}
function voteLabel(vote, revealed) {
	if (vote == null) return "—";
	if (!revealed) return "•";
	return vote === "skip" ? "Skip" : String(vote);
}
function applyVote(state, playerId, cardId, value, playerIds) {
	const current = state.cards[state.index];
	if (!current || current.id !== cardId || state.phase !== "voting") return state;
	const votes = {
		...state.votes,
		[playerId]: value
	};
	if (everyoneVoted(votes, playerIds)) return {
		...state,
		votes,
		phase: "reveal"
	};
	return {
		...state,
		votes
	};
}
function applyPick(state, cardId, duration, playerIds) {
	if (state.phase !== "reveal") return state;
	const current = state.cards[state.index];
	if (!current || current.id !== cardId) return state;
	const resolved = duration != null && duration > 0 ? duration : null;
	const cards = state.cards.map((item) => item.id === cardId ? {
		...item,
		duration: resolved
	} : item);
	const nextIndex = state.index + 1;
	if (nextIndex >= cards.length) return {
		...state,
		cards,
		index: nextIndex,
		phase: "done",
		votes: {}
	};
	return {
		...state,
		cards,
		index: nextIndex,
		phase: "voting",
		votes: emptyVotes(playerIds)
	};
}
//#endregion
export { PlanningPoker };
