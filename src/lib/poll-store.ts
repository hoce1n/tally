import { create } from "zustand";

export type PollOption = {
  id: string;
  label: string;
  votes: number;
};

export type View = "create" | "room";

export type PollTemplate = {
  question: string;
  options: string[];
};

export const TEMPLATES: PollTemplate[] = [
  {
    question: "Where should Friday land?",
    options: [
      "A long lunch",
      "Leave at four",
      "Work from a cafe",
      "Cancel the meeting",
    ],
  },
  {
    question: "Best way to spend a Sunday",
    options: [
      "Slow breakfast",
      "A long walk",
      "Catch up on sleep",
      "Cook for someone",
    ],
  },
  {
    question: "Pick the snack",
    options: ["Salted chips", "Dark chocolate", "Fruit, actually", "Leftover pizza"],
  },
];

const DEFAULT_OPTIONS: PollOption[] = [
  { id: "opt-lunch", label: "A long lunch", votes: 12 },
  { id: "opt-four", label: "Leave at four", votes: 19 },
  { id: "opt-cafe", label: "Work from a cafe", votes: 8 },
  { id: "opt-cancel", label: "Cancel the meeting", votes: 15 },
];

type PollState = {
  view: View;
  question: string;
  options: PollOption[];
  votedId: string | null;
  live: boolean;
  createPoll: (question: string, labels: string[]) => void;
  vote: (id: string) => void;
  resetVotes: () => void;
  openCreate: () => void;
  cancelCreate: () => void;
  setLive: (live: boolean) => void;
  tickLiveVote: () => void;
};

function newOption(label: string, votes = 0): PollOption {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `opt-${Math.random().toString(36).slice(2, 10)}`;
  return { id, label, votes };
}

export const usePollStore = create<PollState>((set, get) => ({
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
      live: false,
    });
  },

  vote: (id) => {
    const { votedId, options } = get();
    if (votedId) return;
    if (!options.some((o) => o.id === id)) return;
    set({
      votedId: id,
      live: true,
      options: options.map((o) =>
        o.id === id ? { ...o, votes: o.votes + 1 } : o,
      ),
    });
  },

  resetVotes: () => {
    set((s) => ({
      votedId: null,
      live: false,
      options: s.options.map((o) => ({ ...o, votes: 0 })),
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
    const target = options[index];
    if (!target) return;
    set({
      options: options.map((o, i) =>
        i === index ? { ...o, votes: o.votes + 1 } : o,
      ),
    });
  },
}));

export function totalVotes(options: PollOption[]): number {
  return options.reduce((sum, o) => sum + o.votes, 0);
}

export function percentOf(votes: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((votes / total) * 100);
}
