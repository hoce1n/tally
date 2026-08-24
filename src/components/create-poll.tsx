import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEMPLATES, usePollStore } from "@/lib/poll-store";
import { cn } from "@/lib/utils";

type DraftOption = { key: string; value: string };

function blankOptions(): DraftOption[] {
  return [
    { key: "d1", value: "" },
    { key: "d2", value: "" },
  ];
}

export function CreatePoll() {
  const createPoll = usePollStore((s) => s.createPoll);
  const cancelCreate = usePollStore((s) => s.cancelCreate);
  const existingQuestion = usePollStore((s) => s.question);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<DraftOption[]>(blankOptions);
  const [error, setError] = useState<string | null>(null);

  const filled = useMemo(
    () => options.map((o) => o.value.trim()).filter(Boolean),
    [options],
  );

  function applyTemplate(index: number) {
    const t = TEMPLATES[index];
    if (!t) return;
    setQuestion(t.question);
    setOptions(
      t.options.map((value, i) => ({ key: `t-${index}-${i}`, value })),
    );
    setError(null);
  }

  function updateOption(key: string, value: string) {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, value } : o)));
  }

  function addOption() {
    if (options.length >= 8) return;
    setOptions((prev) => [
      ...prev,
      { key: `d-${prev.length}-${Date.now()}`, value: "" },
    ]);
  }

  function removeOption(key: string) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((o) => o.key !== key));
  }

  function onSubmit(e: FormEvent) {
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
    const unique = new Set(filled.map((v) => v.toLowerCase()));
    if (unique.size !== filled.length) {
      setError("Options need to be different.");
      return;
    }
    setError(null);
    createPoll(q, filled);
  }

  return (
    <form onSubmit={onSubmit} className="stagger-in flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            New poll
          </p>
          <h2 className="font-display mt-1 text-2xl leading-tight font-medium tracking-tight text-fg">
            Ask the room
          </h2>
        </div>
        {existingQuestion ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancelCreate}
            className="shrink-0"
          >
            <ArrowLeft />
            Back
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted">Start from a template</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t, i) => (
            <button
              key={t.question}
              type="button"
              onClick={() => applyTemplate(i)}
              className={cn(
                "pressable h-11 rounded-full border border-border bg-surface px-3 text-sm text-muted transition-[color,background-color,border-color] duration-quick ease-smooth-out",
                "hover:border-primary/40 hover:text-fg",
              )}
            >
              {t.question}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="poll-question">Question</Label>
        <Input
          id="poll-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What should we decide?"
          maxLength={120}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label>Options</Label>
        <ol className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <li key={opt.key} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-center font-medium text-subtle tabular-nums">
                {i + 1}
              </span>
              <Input
                value={opt.value}
                onChange={(e) => updateOption(opt.key, e.target.value)}
                placeholder={i === 0 ? "First choice" : "Another choice"}
                maxLength={60}
                autoComplete="off"
                aria-label={`Option ${i + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0 text-subtle hover:text-fg"
                onClick={() => removeOption(opt.key)}
                disabled={options.length <= 2}
                aria-label={`Remove option ${i + 1}`}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ol>
        <Button
          type="button"
          variant="outline"
          onClick={addOption}
          disabled={options.length >= 8}
          className="w-full border-dashed"
        >
          <Plus />
          Add option
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-fg" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full">
        Open the poll
      </Button>
    </form>
  );
}
