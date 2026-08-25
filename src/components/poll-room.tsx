import { Check, Copy, LoaderCircle, Radio, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { captureHostSecretFromFragment, useRoomStore } from "@/lib/rooms/room-store";
import { cn } from "@/lib/utils";

export function PollRoom({ roomId }: { roomId: string }) {
  const room = useRoomStore((state) => state.room);
  const lifecycle = useRoomStore((state) => state.lifecycle);
  const network = useRoomStore((state) => state.network);
  const error = useRoomStore((state) => state.error);
  const isSubmittingVote = useRoomStore((state) => state.isSubmittingVote);
  const joinRoom = useRoomStore((state) => state.joinRoom);
  const startVoting = useRoomStore((state) => state.startVoting);
  const submitVote = useRoomStore((state) => state.submitVote);
  const disconnectRealtime = useRoomStore((state) => state.disconnectRealtime);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    captureHostSecretFromFragment(roomId);
    void joinRoom(roomId);
    return () => disconnectRealtime();
  }, [disconnectRealtime, joinRoom, roomId]);

  async function copyRoomLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/r/${roomId}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  if (!room && lifecycle === "loading-room") {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
        <LoaderCircle className="size-5 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-muted">Opening the room…</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
        <p className="font-display text-2xl text-fg">This room is unavailable.</p>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          {error ?? "It may have ended or expired."}
        </p>
        <Button type="button" variant="outline" onClick={() => window.location.assign("/")}>
          Create a room
        </Button>
      </div>
    );
  }

  const isHost = room.viewer?.role === "host";
  const hasVoted = room.viewer?.hasVoted ?? false;
  const waiting = room.status === "gathering";
  const voting = room.status === "voting";

  return (
    <div className="flex flex-col gap-6">
      <header className="stagger-in flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            {waiting ? "Gathering the room" : voting ? "Voting is open" : "Room ended"}
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span
              className={cn(
                "size-1.5 rounded-full",
                network === "connected" ? "bg-primary" : "bg-subtle",
              )}
              aria-hidden
            />
            {network === "connected"
              ? "Connected"
              : network === "offline"
                ? "Live updates unavailable"
                : network === "reconnecting"
                  ? "Reconnecting"
                  : "Connecting"}
          </span>
        </div>
        <h1 className="font-display text-3xl leading-tight font-medium tracking-tight text-fg sm:text-4xl">
          {room.question}
        </h1>
        <p className="text-sm leading-relaxed text-muted" aria-live="polite">
          {waiting
            ? `${room.joinedCount} ${room.joinedCount === 1 ? "person is" : "people are"} here. ${isHost ? "Share the room, then open voting." : "Waiting for the host to open voting."}`
            : voting
              ? hasVoted
                ? "Your vote is in. Results will appear when the host reveals the room."
                : "Choose once. The room will reveal together."
              : "This room is no longer accepting votes."}
        </p>
      </header>

      {waiting ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-2 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-fg">
            <Users className="size-4 text-primary" />
            {room.joinedCount} in the room
          </div>
          <p className="text-sm leading-relaxed text-muted">
            Invite the people making this decision. No account is needed to join.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => void copyRoomLink()}
            >
              <Copy />
              {copied ? "Link copied" : "Copy room link"}
            </Button>
            {isHost ? (
              <Button type="button" className="flex-1" onClick={() => void startVoting()}>
                <Radio />
                Start voting
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {voting ? (
        <ul className="stagger-in flex flex-col gap-3" role="list">
          {room.options.map((option) => {
            const selected = room.viewer?.votedOptionId === option.id;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => void submitVote(option.id)}
                  disabled={hasVoted || isSubmittingVote}
                  aria-pressed={selected}
                  className={cn(
                    "pressable flex w-full items-center justify-between gap-3 rounded-lg border bg-surface p-4 text-left transition-[border-color,background-color,opacity,box-shadow] duration-fast ease-smooth-out",
                    "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
                    selected
                      ? "border-primary bg-surface-2"
                      : "border-border hover:border-primary/35 hover:bg-surface-2",
                    (hasVoted || isSubmittingVote) && !selected && "cursor-not-allowed opacity-65",
                  )}
                >
                  <span className="min-w-0 text-base font-medium text-fg">{option.label}</span>
                  {selected ? (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {error ? (
        <p className="text-sm text-fg" role="alert">
          {error}
        </p>
      ) : null}

      <footer className="border-t border-border pt-4 text-xs text-muted">
        {room.submittedCount} {room.submittedCount === 1 ? "vote" : "votes"} submitted · one vote
        per browser session
      </footer>
    </div>
  );
}
