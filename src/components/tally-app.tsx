import { CreatePoll } from "@/components/create-poll";
import { PollRoom } from "@/components/poll-room";
import { usePollStore } from "@/lib/poll-store";

export function TallyApp() {
  const view = usePollStore((s) => s.view);
  const openCreate = usePollStore((s) => s.openCreate);

  return (
    <div className="page-shell flex justify-center px-4">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-xl tracking-tight text-fg italic">
              Tally
            </p>
            <p className="text-sm text-muted">Ask. Vote. Watch it move.</p>
          </div>
          {view === "room" ? (
            <button
              type="button"
              onClick={openCreate}
              className="pressable inline-flex h-11 items-center text-sm font-medium text-muted transition-colors duration-quick ease-smooth-out hover:text-fg"
            >
              New poll
            </button>
          ) : null}
        </header>

        <main className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          {view === "create" ? <CreatePoll /> : <PollRoom />}
        </main>
      </div>
    </div>
  );
}
