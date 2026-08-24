import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as require_jsx_runtime, r as Slot, t as Root } from "../_libs/@radix-ui/react-label+[...].mjs";
import { a as PenLine, i as Plus, n as Trash2, o as Check, r as RotateCcw, s as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-rFPwyFyX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("pressable inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-[color,background-color,opacity,box-shadow,scale] duration-quick ease-smooth-out focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:opacity-90",
			secondary: "border border-border bg-surface-2 text-fg hover:bg-surface",
			ghost: "text-muted hover:bg-surface-2 hover:text-fg",
			outline: "border border-border bg-transparent text-fg hover:bg-surface-2"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 rounded-sm px-3",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		"data-slot": "input",
		className: cn("h-11 w-full min-w-0 rounded-md border border-border bg-surface-2 px-3 text-base text-fg outline-none transition-[border-color,box-shadow] duration-quick ease-smooth-out placeholder:text-subtle", "focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40", "disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		"data-slot": "label",
		className: cn("text-sm font-medium text-muted select-none", className),
		...props
	});
}
var TEMPLATES = [
	{
		question: "Where should Friday land?",
		options: [
			"A long lunch",
			"Leave at four",
			"Work from a cafe",
			"Cancel the meeting"
		]
	},
	{
		question: "Best way to spend a Sunday",
		options: [
			"Slow breakfast",
			"A long walk",
			"Catch up on sleep",
			"Cook for someone"
		]
	},
	{
		question: "Pick the snack",
		options: [
			"Salted chips",
			"Dark chocolate",
			"Fruit, actually",
			"Leftover pizza"
		]
	}
];
var DEFAULT_OPTIONS = [
	{
		id: "opt-lunch",
		label: "A long lunch",
		votes: 12
	},
	{
		id: "opt-four",
		label: "Leave at four",
		votes: 19
	},
	{
		id: "opt-cafe",
		label: "Work from a cafe",
		votes: 8
	},
	{
		id: "opt-cancel",
		label: "Cancel the meeting",
		votes: 15
	}
];
function newOption(label, votes = 0) {
	return {
		id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `opt-${Math.random().toString(36).slice(2, 10)}`,
		label,
		votes
	};
}
var usePollStore = create((set, get) => ({
	view: "room",
	question: TEMPLATES[0].question,
	options: DEFAULT_OPTIONS,
	votedId: null,
	live: false,
	createPoll: (question, labels) => {
		const trimmed = labels.map((l) => l.trim()).filter(Boolean);
		set({
			view: "room",
			question: question.trim(),
			options: trimmed.map((label) => newOption(label, 0)),
			votedId: null,
			live: false
		});
	},
	vote: (id) => {
		const { votedId, options } = get();
		if (votedId) return;
		if (!options.some((o) => o.id === id)) return;
		set({
			votedId: id,
			live: true,
			options: options.map((o) => o.id === id ? {
				...o,
				votes: o.votes + 1
			} : o)
		});
	},
	resetVotes: () => {
		set((s) => ({
			votedId: null,
			live: false,
			options: s.options.map((o) => ({
				...o,
				votes: 0
			}))
		}));
	},
	openCreate: () => set({ view: "create" }),
	cancelCreate: () => {
		if (get().question) set({ view: "room" });
	},
	setLive: (live) => set({ live }),
	tickLiveVote: () => {
		const { options, live } = get();
		if (!live || options.length === 0) return;
		const index = Math.floor(Math.random() * options.length);
		if (!options[index]) return;
		set({ options: options.map((o, i) => i === index ? {
			...o,
			votes: o.votes + 1
		} : o) });
	}
}));
function totalVotes(options) {
	return options.reduce((sum, o) => sum + o.votes, 0);
}
function percentOf(votes, total) {
	if (total <= 0) return 0;
	return Math.round(votes / total * 100);
}
function blankOptions() {
	return [{
		key: "d1",
		value: ""
	}, {
		key: "d2",
		value: ""
	}];
}
function CreatePoll() {
	const createPoll = usePollStore((s) => s.createPoll);
	const cancelCreate = usePollStore((s) => s.cancelCreate);
	const existingQuestion = usePollStore((s) => s.question);
	const [question, setQuestion] = (0, import_react.useState)("");
	const [options, setOptions] = (0, import_react.useState)(blankOptions);
	const [error, setError] = (0, import_react.useState)(null);
	const filled = (0, import_react.useMemo)(() => options.map((o) => o.value.trim()).filter(Boolean), [options]);
	function applyTemplate(index) {
		const t = TEMPLATES[index];
		if (!t) return;
		setQuestion(t.question);
		setOptions(t.options.map((value, i) => ({
			key: `t-${index}-${i}`,
			value
		})));
		setError(null);
	}
	function updateOption(key, value) {
		setOptions((prev) => prev.map((o) => o.key === key ? {
			...o,
			value
		} : o));
	}
	function addOption() {
		if (options.length >= 8) return;
		setOptions((prev) => [...prev, {
			key: `d-${prev.length}-${Date.now()}`,
			value: ""
		}]);
	}
	function removeOption(key) {
		if (options.length <= 2) return;
		setOptions((prev) => prev.filter((o) => o.key !== key));
	}
	function onSubmit(e) {
		e.preventDefault();
		const q = question.trim();
		if (q.length < 3) {
			setError("Write a question first.");
			return;
		}
		if (filled.length < 2) {
			setError("Add at least two options.");
			return;
		}
		if (new Set(filled.map((v) => v.toLowerCase())).size !== filled.length) {
			setError("Options need to be different.");
			return;
		}
		setError(null);
		createPoll(q, filled);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit,
		className: "stagger-in flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-muted uppercase",
					children: "New poll"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display mt-1 text-2xl leading-tight font-medium tracking-tight text-fg",
					children: "Ask the room"
				})] }), existingQuestion ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					onClick: cancelCreate,
					className: "shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {}), "Back"]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium text-muted",
					children: "Start from a template"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: TEMPLATES.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => applyTemplate(i),
						className: cn("pressable h-11 rounded-full border border-border bg-surface px-3 text-sm text-muted transition-[color,background-color,border-color] duration-quick ease-smooth-out", "hover:border-primary/40 hover:text-fg"),
						children: t.question
					}, t.question))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "poll-question",
					children: "Question"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "poll-question",
					value: question,
					onChange: (e) => setQuestion(e.target.value),
					placeholder: "What should we decide?",
					maxLength: 120,
					autoComplete: "off"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Options" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "flex flex-col gap-2",
						children: options.map((opt, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-6 shrink-0 text-center font-medium text-subtle tabular-nums",
									children: i + 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: opt.value,
									onChange: (e) => updateOption(opt.key, e.target.value),
									placeholder: i === 0 ? "First choice" : "Another choice",
									maxLength: 60,
									autoComplete: "off",
									"aria-label": `Option ${i + 1}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "icon",
									className: "size-11 shrink-0 text-subtle hover:text-fg",
									onClick: () => removeOption(opt.key),
									disabled: options.length <= 2,
									"aria-label": `Remove option ${i + 1}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
								})
							]
						}, opt.key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						onClick: addOption,
						disabled: options.length >= 8,
						className: "w-full border-dashed",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "Add option"]
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg",
				role: "alert",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				size: "lg",
				className: "w-full",
				children: "Open the poll"
			})
		]
	});
}
function PollRoom() {
	const question = usePollStore((s) => s.question);
	const options = usePollStore((s) => s.options);
	const votedId = usePollStore((s) => s.votedId);
	const live = usePollStore((s) => s.live);
	const vote = usePollStore((s) => s.vote);
	const resetVotes = usePollStore((s) => s.resetVotes);
	const openCreate = usePollStore((s) => s.openCreate);
	const setLive = usePollStore((s) => s.setLive);
	const tickLiveVote = usePollStore((s) => s.tickLiveVote);
	const revealed = votedId !== null;
	const total = totalVotes(options);
	const leadVotes = Math.max(0, ...options.map((o) => o.votes));
	const leaders = options.filter((o) => o.votes === leadVotes && leadVotes > 0);
	const uniqueLeadId = leaders.length === 1 ? leaders[0]?.id : null;
	(0, import_react.useEffect)(() => {
		if (!live || !revealed) return;
		let timer;
		const loop = () => {
			const wait = 1200 + Math.random() * 1400;
			timer = window.setTimeout(() => {
				tickLiveVote();
				loop();
			}, wait);
		};
		loop();
		return () => window.clearTimeout(timer);
	}, [
		live,
		revealed,
		tickLiveVote
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "stagger-in flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-wide text-muted uppercase",
							children: "Live poll"
						}), revealed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setLive(!live),
							"aria-pressed": live,
							className: cn("pressable inline-flex h-11 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-[color,background-color,border-color] duration-quick ease-smooth-out", live ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-surface text-muted hover:text-fg"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("size-1.5 rounded-full", live ? "live-dot bg-primary" : "bg-subtle"),
								"aria-hidden": true
							}), live ? "Live" : "Paused"]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl leading-tight font-medium tracking-tight text-fg sm:text-4xl",
						children: question
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted tabular-nums",
						"aria-live": "polite",
						children: revealed ? `${total} ${total === 1 ? "vote" : "votes"}` : "One vote each. Results fill in after you choose."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "stagger-in flex flex-col gap-3",
				role: "list",
				children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionCard, {
					option,
					total,
					revealed,
					selected: votedId === option.id,
					leading: uniqueLeadId === option.id && revealed,
					disabled: revealed,
					onVote: () => vote(option.id)
				}) }, option.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "secondary",
					className: "flex-1",
					onClick: resetVotes,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {}), "Reset votes"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					className: "flex-1",
					onClick: openCreate,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, {}), "New poll"]
				})]
			})
		]
	});
}
function OptionCard({ option, total, revealed, selected, leading, disabled, onVote }) {
	const pct = percentOf(option.votes, total);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onVote,
		disabled,
		"aria-pressed": selected,
		"aria-label": revealed ? `${option.label}, ${pct} percent, ${option.votes} votes` : option.label,
		className: cn("pressable group flex w-full flex-col gap-3 rounded-lg border bg-surface p-4 text-left transition-[border-color,background-color,opacity,box-shadow] duration-fast ease-smooth-out", "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none", selected ? "border-primary bg-surface-2" : "border-border hover:border-primary/35 hover:bg-surface-2", disabled && !selected && "cursor-not-allowed opacity-70", disabled && selected && "cursor-default"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex min-w-0 items-center gap-2 text-base font-medium text-fg",
					children: [selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-3",
							strokeWidth: 3
						})
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0",
						children: option.label
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("shrink-0 text-sm font-medium tabular-nums transition-opacity duration-fast ease-smooth-out", revealed ? "opacity-100 text-fg" : "opacity-0"),
					children: [pct, "%"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-2 w-full overflow-hidden rounded-full bg-border",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("bar-fill h-full w-full rounded-full", selected || leading ? "bg-primary" : "bg-lead/80"),
					style: { ["--bar-pct"]: revealed ? pct / 100 : 0 }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex items-center justify-between text-xs text-muted tabular-nums transition-opacity duration-fast ease-smooth-out", revealed ? "opacity-100" : "hidden"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						option.votes,
						" ",
						option.votes === 1 ? "vote" : "votes"
					] }),
					leading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-primary",
						children: "Leading"
					}) : null,
					selected && !leading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-primary",
						children: "Your vote"
					}) : null
				]
			})
		]
	});
}
function TallyApp() {
	const view = usePollStore((s) => s.view);
	const openCreate = usePollStore((s) => s.openCreate);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "page-shell flex justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full max-w-lg flex-col gap-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl tracking-tight text-fg italic",
					children: "Tally"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Ask. Vote. Watch it move."
				})] }), view === "room" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: openCreate,
					className: "pressable inline-flex h-11 items-center text-sm font-medium text-muted transition-colors duration-quick ease-smooth-out hover:text-fg",
					children: "New poll"
				}) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "rounded-2xl border border-border bg-surface p-4 sm:p-5",
				children: view === "create" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatePoll, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PollRoom, {})
			})]
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TallyApp, {});
}
//#endregion
export { Home as component };
