import { CreatePoll } from "@/components/create-poll";

export function TallyApp() {
  return (
    <div className="page-shell flex justify-center px-4">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-xl tracking-tight text-fg italic">Tally</p>
            <p className="text-sm text-muted">Ask. Vote. Watch it move.</p>
          </div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Live room</p>
        </header>
        <main className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <CreatePoll />
        </main>
      </div>
    </div>
  );
}
