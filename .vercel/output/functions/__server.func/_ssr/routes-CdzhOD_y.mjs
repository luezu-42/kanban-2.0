import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as require_jsx_runtime, a as Overlay2, c as Title2, d as DialogContent$1, f as DialogDescription$1, h as DialogTitle$1, i as Description2, l as Dialog$1, m as DialogPortal$1, n as Cancel, o as Portal2, p as DialogOverlay$1, r as Content2, s as Root2, t as Action, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { C as require_react_dom, _ as CSS, a as PointerSensor, c as defaultDropAnimationSideEffects, g as useSensors, h as useSensor, i as KeyboardSensor, m as useDroppable, n as DragOverlay, o as TouchSensor, s as closestCorners, t as DndContext } from "../_libs/@dnd-kit/core+[...].mjs";
import { a as Pencil, i as Plus, o as Ellipsis, r as Trash2, t as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as cn, n as authClient, o as signOut, r as buttonVariants, t as Button } from "./client-CVXOLij-.mjs";
import { a as verticalListSortingStrategy, i as useSortable, n as arrayMove, r as sortableKeyboardCoordinates, t as SortableContext } from "../_libs/dnd-kit__sortable.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { t as formatDistanceToNowStrict } from "../_libs/date-fns.mjs";
import { a as Trigger, i as Root2$1, n as Item2, r as Portal2$1, t as Content2$1 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CdzhOD_y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
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
var COLUMN_IDS = [
	"todo",
	"doing",
	"done"
];
var COLUMNS = [
	{
		id: "todo",
		title: "To Do",
		hint: "Queued work"
	},
	{
		id: "doing",
		title: "Doing",
		hint: "In motion"
	},
	{
		id: "done",
		title: "Done",
		hint: "Shipped"
	}
];
var COLUMN_PREFIX = "column:";
function columnDroppableId(id) {
	return `${COLUMN_PREFIX}${id}`;
}
function parseColumnId(id) {
	if (id.startsWith("column:")) {
		const raw = id.slice(7);
		return isColumnId(raw) ? raw : null;
	}
	return isColumnId(id) ? id : null;
}
function isColumnId(id) {
	return COLUMN_IDS.includes(id);
}
function findColumnOf(order, cardId) {
	for (const columnId of COLUMN_IDS) if (order[columnId].includes(cardId)) return columnId;
	return null;
}
function card(title, description, createdAt) {
	return {
		id: crypto.randomUUID(),
		title,
		description,
		createdAt
	};
}
function seedBoard() {
	const now = Date.now();
	const queued = card("Scope the Q3 launch", "Outline milestones, owners, and the first public cut.", now - 936e5);
	const quotes = card("Collect three testimonials", "Reach out to early users for short, specific quotes.", now - 648e5);
	const onboarding = card("Polish the onboarding flow", "Tighten first-run copy and cut one unnecessary step.", now - 216e5);
	const standUp = card("Stand up the board", "Columns, cards, and local persistence are live.", now - 144e6);
	const type = card("Lock the type pairing", "Newsreader for the masthead, Figtree for the interface.", now - 1296e5);
	return {
		cards: {
			[queued.id]: queued,
			[quotes.id]: quotes,
			[onboarding.id]: onboarding,
			[standUp.id]: standUp,
			[type.id]: type
		},
		order: {
			todo: [queued.id, quotes.id],
			doing: [onboarding.id],
			done: [standUp.id, type.id]
		}
	};
}
var emptyOrder = () => ({
	todo: [],
	doing: [],
	done: []
});
var useBoardStore = create()(persist((set, get) => ({
	...seedBoard(),
	addCard: (columnId, title, description) => {
		const next = card(title.trim(), description.trim(), Date.now());
		set((state) => ({
			cards: {
				...state.cards,
				[next.id]: next
			},
			order: {
				...state.order,
				[columnId]: [next.id, ...state.order[columnId]]
			}
		}));
		return next.id;
	},
	updateCard: (id, title, description) => {
		set((state) => {
			const existing = state.cards[id];
			if (!existing) return state;
			return { cards: {
				...state.cards,
				[id]: {
					...existing,
					title: title.trim(),
					description: description.trim()
				}
			} };
		});
	},
	deleteCard: (id) => {
		set((state) => {
			const { [id]: _removed, ...cards } = state.cards;
			const order = { ...state.order };
			for (const columnId of COLUMN_IDS) order[columnId] = order[columnId].filter((cardId) => cardId !== id);
			return {
				cards,
				order
			};
		});
	},
	moveCard: (activeId, overId) => {
		if (activeId === overId) return;
		const { order } = get();
		const from = findColumnOf(order, activeId);
		const overColumn = parseColumnId(overId);
		const to = overColumn ?? findColumnOf(order, overId);
		if (!from || !to) return;
		if (from === to) {
			const ids = order[from];
			const oldIndex = ids.indexOf(activeId);
			const newIndex = overColumn ? ids.length - 1 : ids.indexOf(overId);
			if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;
			set({ order: {
				...order,
				[from]: arrayMove(ids, oldIndex, newIndex)
			} });
			return;
		}
		const fromIds = order[from].filter((id) => id !== activeId);
		const toIds = order[to].filter((id) => id !== activeId);
		const insertAt = overColumn ? toIds.length : Math.max(toIds.indexOf(overId), 0);
		toIds.splice(insertAt, 0, activeId);
		set({ order: {
			...order,
			[from]: fromIds,
			[to]: toIds
		} });
	}
}), {
	name: "ledger-kanban-v1",
	storage: createJSONStorage(() => localStorage),
	skipHydration: true,
	partialize: (state) => ({
		cards: state.cards,
		order: state.order
	}),
	merge: (persisted, current) => {
		const raw = persisted;
		if (!raw || !raw.cards || !raw.order) return current;
		return {
			...current,
			cards: raw.cards,
			order: {
				...emptyOrder(),
				...raw.order
			}
		};
	}
}));
function CardFormDialog({ open, state, onOpenChange, onSubmit }) {
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open || !state) return;
		if (state.mode === "edit") {
			setTitle(state.card.title);
			setDescription(state.card.description);
		} else {
			setTitle("");
			setDescription("");
		}
	}, [open, state]);
	const columnTitle = state?.mode === "create" ? COLUMNS.find((column) => column.id === state.columnId)?.title : null;
	function handleSubmit(event) {
		event.preventDefault();
		const nextTitle = title.trim();
		if (!nextTitle) return;
		onSubmit(nextTitle, description.trim());
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "grid gap-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: state?.mode === "edit" ? "Edit card" : "New card" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: state?.mode === "edit" ? "Update the title and notes. Changes save to this device." : `Add a card to ${columnTitle ?? "the board"}.` })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					})]
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
function CardFace({ card, overlay, dragging, onEdit, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("kanban-card relative rounded-lg bg-surface p-4 shadow-card outline-none", "transition-[box-shadow,transform,opacity] duration-200 ease-[var(--ease-smooth-out)]", !overlay && !dragging && "hover:shadow-lift", overlay && "kanban-overlay rotate-[1.5deg] scale-[1.03] shadow-lift", dragging && "opacity-30 shadow-border"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm leading-snug font-medium text-fg",
					children: card.title
				}), onEdit && onDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						onSelect: () => onEdit(card),
						onPointerDown: (event) => event.stopPropagation(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "Edit"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						variant: "destructive",
						onSelect: () => onDelete(card),
						onPointerDown: (event) => event.stopPropagation(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Delete"]
					})]
				})] }) : null]
			}),
			card.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted",
				children: card.description
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-xs tracking-wide text-subtle tabular-nums",
				children: formatDistanceToNowStrict(card.createdAt, { addSuffix: true })
			})
		]
	});
}
function KanbanCard({ card, onEdit, onDelete }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: card.id,
		data: {
			type: "card",
			card
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
		className: "cursor-grab touch-none active:cursor-grabbing",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFace, {
			card,
			dragging: isDragging,
			onEdit,
			onDelete
		})
	});
}
var TONE = {
	todo: "bg-todo",
	doing: "bg-doing",
	done: "bg-done"
};
function KanbanColumn({ id, title, hint, cards, isOver, onAdd, onEdit, onDelete }) {
	const { setNodeRef } = useDroppable({
		id: columnDroppableId(id),
		data: {
			type: "column",
			columnId: id
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("flex min-h-88 w-[85vw] min-w-[85vw] shrink-0 flex-col rounded-xl bg-bg-elevated p-3 snap-center", "md:w-auto md:min-w-0", "transition-[box-shadow,background-color] duration-200 ease-[var(--ease-smooth-out)]", isOver ? "shadow-lift" : "shadow-border"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-start justify-between gap-3 px-1 pt-1 pb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-2 shrink-0 rounded-full", TONE[id]) }),
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
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "icon-sm",
				className: "relative -mr-1 text-muted hover:text-fg after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2",
				onClick: () => onAdd(id),
				"aria-label": `Add card to ${title}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: setNodeRef,
			className: cn("flex min-h-40 flex-1 flex-col gap-2.5 rounded-lg p-0.5", isOver && "bg-surface/40"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableContext, {
				items: cards.map((card) => card.id),
				strategy: verticalListSortingStrategy,
				children: cards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanCard, {
					card,
					onEdit,
					onDelete
				}, card.id))
			}), cards.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onAdd(id),
				className: "flex min-h-28 flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 text-center transition-[border-color,color] duration-150 hover:border-border-strong hover:text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-subtle",
					children: "Nothing here yet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 text-xs text-subtle",
					children: "Add a card"
				})]
			}) : null]
		})]
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
var dropAnimation = {
	duration: 240,
	easing: "cubic-bezier(0.22, 1, 0.36, 1)",
	sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.3" } } })
};
function KanbanBoard() {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [activeCard, setActiveCard] = (0, import_react.useState)(null);
	const [overColumn, setOverColumn] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(null);
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	const cards = useBoardStore((state) => state.cards);
	const order = useBoardStore((state) => state.order);
	const addCard = useBoardStore((state) => state.addCard);
	const updateCard = useBoardStore((state) => state.updateCard);
	const deleteCard = useBoardStore((state) => state.deleteCard);
	const moveCard = useBoardStore((state) => state.moveCard);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const result = useBoardStore.persist.rehydrate();
		Promise.resolve(result).then(() => {
			if (!cancelled) setReady(true);
		});
		return () => {
			cancelled = true;
		};
	}, []);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: {
		delay: 160,
		tolerance: 6
	} }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
	const columns = (0, import_react.useMemo)(() => COLUMNS.map((column) => ({
		...column,
		cards: order[column.id].map((id) => cards[id]).filter((card) => Boolean(card))
	})), [cards, order]);
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
		setOverColumn(nextColumn);
		if (!overId || !nextColumn) return;
		const from = findColumnOf(order, activeId);
		if (!from || from === nextColumn) return;
		moveCard(activeId, overId);
	}
	function handleDragEnd(event) {
		const overId = event.over?.id ? String(event.over.id) : null;
		const activeId = String(event.active.id);
		if (overId) {
			const from = findColumnOf(useBoardStore.getState().order, activeId);
			const to = resolveColumn(overId);
			if (from && to && from === to) moveCard(activeId, overId);
		}
		setActiveCard(null);
		setOverColumn(null);
	}
	function handleDragCancel() {
		setActiveCard(null);
		setOverColumn(null);
	}
	function handleFormSubmit(title, description) {
		if (!form) return;
		if (form.mode === "create") {
			addCard(form.columnId, title, description);
			toast.success("Card added");
			return;
		}
		updateCard(form.card.id, title, description);
		toast.success("Card updated");
	}
	function handleDelete(card) {
		setPendingDelete(card);
	}
	function confirmDelete() {
		if (!pendingDelete) return;
		deleteCard(pendingDelete.id);
		toast("Card deleted");
		setPendingDelete(null);
	}
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardSkeleton, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DndContext, {
			sensors,
			collisionDetection: closestCorners,
			onDragStart: handleDragStart,
			onDragOver: handleDragOver,
			onDragEnd: handleDragEnd,
			onDragCancel: handleDragCancel,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "board-scroller flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:snap-none md:grid-cols-3 md:overflow-visible md:pb-0",
				children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanColumn, {
					id: column.id,
					title: column.title,
					hint: column.hint,
					cards: column.cards,
					isOver: overColumn === column.id,
					onAdd: (columnId) => setForm({
						mode: "create",
						columnId
					}),
					onEdit: (card) => setForm({
						mode: "edit",
						card
					}),
					onDelete: handleDelete
				}, column.id))
			}), typeof document !== "undefined" ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragOverlay, {
				dropAnimation,
				children: activeCard ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-[min(100vw-2.5rem,19.5rem)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFace, {
						card: activeCard,
						overlay: true
					})
				}) : null
			}), document.body) : null]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFormDialog, {
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
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete this card?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: pendingDelete ? `“${pendingDelete.title}” will be removed from the board. This cannot be undone.` : "This card will be removed from the board." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep card" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: confirmDelete,
				children: "Delete"
			})] })] })
		})
	] });
}
function BoardSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-3 overflow-hidden md:grid md:grid-cols-3",
		children: COLUMNS.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-88 w-[85vw] min-w-[85vw] shrink-0 animate-pulse rounded-xl bg-bg-elevated shadow-border md:w-auto md:min-w-0" }, column.id))
	});
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled (default) -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
function SiteHeader() {
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const total = useBoardStore((state) => state.order.todo.length + state.order.doing.length + state.order.done.length);
	(0, import_react.useEffect)(() => {
		const finish = () => setHydrated(true);
		if (useBoardStore.persist.hasHydrated()) {
			finish();
			return;
		}
		return useBoardStore.persist.onFinishHydration(finish);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.18em] text-subtle uppercase",
					children: "Project board"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-1 text-4xl leading-none tracking-tight text-fg sm:text-5xl",
					children: "Ledger"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-md text-sm text-muted",
					children: "Drag cards between columns. Everything stays on this device."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs tracking-wide text-subtle tabular-nums",
				children: hydrated ? `${total} ${total === 1 ? "card" : "cards"}` : "—"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})]
		})]
	});
}
function AuthSlot() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-28 animate-pulse rounded-md bg-surface" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: "inline-flex h-11 items-center rounded-md px-4 text-sm font-medium text-muted transition-[color,background-color] duration-150 hover:bg-surface hover:text-fg",
		children: "Sign in"
	});
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-11 items-center gap-2 rounded-md bg-surface py-1 pr-2 pl-1.5 shadow-border",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "size-8 rounded-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-8 place-items-center rounded-full bg-accent/15 text-sm font-medium text-fg",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "max-w-28 truncate text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void signOut(),
				className: "px-1 text-sm text-muted transition-colors duration-150 hover:text-fg",
				children: "Sign out"
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanBoard, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-xs text-subtle",
					children: "Saved automatically on this device."
				})
			]
		})
	});
}
//#endregion
export { Home as component };
