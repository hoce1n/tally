import { Check, PenLine, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  percentOf,
  totalVotes,
  usePollStore,
  type PollOption,
} from "@/lib/poll-store";
import { cn } from "@/lib/utils";

export function PollRoom() {
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

  useEffect(() => {
    if (!live || !revealed) return;
    let timer: number;
    const loop = () => {
      const wait = 1200 + Math.random() * 1400;
      timer = window.setTimeout(() => {
        tickLiveVote();
        loop();
      }, wait);
    };
    loop();
    return () => window.clearTimeout(timer);
  }, [live, revealed, tickLiveVote]);

  return (
    <div className="flex flex-col gap-6">
      <header className="stagger-in flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            Live poll
          </p>
          {revealed ? (
            <button
              type="button"
              onClick={() => setLive(!live)}
              aria-pressed={live}
              className={cn(
                "pressable inline-flex h-11 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-[color,background-color,border-color] duration-quick ease-smooth-out",
                live
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-surface text-muted hover:text-fg",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  live ? "live-dot bg-primary" : "bg-subtle",
                )}
                aria-hidden
              />
              {live ? "Live" : "Paused"}
            </button>
          ) : null}
        </div>
        <h2 className="font-display text-3xl leading-tight font-medium tracking-tight text-fg sm:text-4xl">
          {question}
        </h2>
        <p
          className="text-sm text-muted tabular-nums"
          aria-live="polite"
        >
          {revealed
            ? `${total} ${total === 1 ? "vote" : "votes"}`
            : "One vote each. Results fill in after you choose."}
        </p>
      </header>

      <ul className="stagger-in flex flex-col gap-3" role="list">
        {options.map((option) => (
          <li key={option.id}>
            <OptionCard
              option={option}
              total={total}
              revealed={revealed}
              selected={votedId === option.id}
              leading={uniqueLeadId === option.id && revealed}
              disabled={revealed}
              onVote={() => vote(option.id)}
            />
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={resetVotes}
        >
          <RotateCcw />
          Reset votes
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={openCreate}
        >
          <PenLine />
          New poll
        </Button>
      </div>
    </div>
  );
}

function OptionCard({
  option,
  total,
  revealed,
  selected,
  leading,
  disabled,
  onVote,
}: {
  option: PollOption;
  total: number;
  revealed: boolean;
  selected: boolean;
  leading: boolean;
  disabled: boolean;
  onVote: () => void;
}) {
  const pct = percentOf(option.votes, total);

  return (
    <button
      type="button"
      onClick={onVote}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={
        revealed
          ? `${option.label}, ${pct} percent, ${option.votes} votes`
          : option.label
      }
      className={cn(
        "pressable group flex w-full flex-col gap-3 rounded-lg border bg-surface p-4 text-left transition-[border-color,background-color,opacity,box-shadow] duration-fast ease-smooth-out",
        "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
        selected
          ? "border-primary bg-surface-2"
          : "border-border hover:border-primary/35 hover:bg-surface-2",
        disabled && !selected && "cursor-not-allowed opacity-70",
        disabled && selected && "cursor-default",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-base font-medium text-fg">
          {selected ? (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg">
              <Check className="size-3" strokeWidth={3} />
            </span>
          ) : null}
          <span className="min-w-0">{option.label}</span>
        </span>
        <span
          className={cn(
            "shrink-0 text-sm font-medium tabular-nums transition-opacity duration-fast ease-smooth-out",
            revealed ? "opacity-100 text-fg" : "opacity-0",
          )}
        >
          {pct}%
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-border"
        aria-hidden
      >
        <div
          className={cn(
            "bar-fill h-full w-full rounded-full",
            selected || leading ? "bg-primary" : "bg-lead/80",
          )}
          style={{ ["--bar-pct" as string]: revealed ? pct / 100 : 0 }}
        />
      </div>

      <div
        className={cn(
          "flex items-center justify-between text-xs text-muted tabular-nums transition-opacity duration-fast ease-smooth-out",
          revealed ? "opacity-100" : "hidden",
        )}
      >
        <span>
          {option.votes} {option.votes === 1 ? "vote" : "votes"}
        </span>
        {leading ? <span className="text-primary">Leading</span> : null}
        {selected && !leading ? <span className="text-primary">Your vote</span> : null}
      </div>
    </button>
  );
}
