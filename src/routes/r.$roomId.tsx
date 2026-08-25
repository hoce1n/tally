import { createFileRoute } from "@tanstack/react-router";
import { PollRoom } from "@/components/poll-room";

export const Route = createFileRoute("/r/$roomId")({
  component: SharedRoomPage,
});

function SharedRoomPage() {
  const { roomId } = Route.useParams();
  return (
    <div className="page-shell flex justify-center px-4">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <a href="/" className="font-display text-xl tracking-tight text-fg italic">
            Tally
          </a>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Shared room</p>
        </header>
        <main className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <PollRoom roomId={roomId} />
        </main>
      </div>
    </div>
  );
}
