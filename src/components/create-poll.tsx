import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveCreatedRoomCredentials } from "@/lib/rooms/room-store";
import type { RoomSnapshot } from "@/lib/rooms/types";
import { cn } from "@/lib/utils";

type DraftOption = { key: string; value: string };

type PollTemplate = { question: string; options: string[] };

const TEMPLATES: PollTemplate[] = [
  {
    question: "Where should Friday land?",
    options: ["A long lunch", "Leave at four", "Work from a cafe", "Cancel the meeting"],
  },
  {
    question: "Best way to spend a Sunday",
    options: ["Slow breakfast", "A long walk", "Catch up on sleep", "Cook for someone"],
  },
  {
    question: "Pick the snack",
    options: ["Salted chips", "Dark chocolate", "Fruit, actually", "Leftover pizza"],
  },
];

function blankOptions(): DraftOption[] {
  return [
    { key: "d1", value: "" },
    { key: "d2", value: "" },
  ];
}

export function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<DraftOption[]>(blankOptions);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filled = useMemo(() => options.map((o) => o.value.trim()).filter(Boolean), [options]);

  function applyTemplate(index: number) {
    const template = TEMPLATES[index];
    if (!template) return;
    setQuestion(template.question);
    setOptions(template.options.map((value, i) => ({ key: `t-${index}-${i}`, value })));
    setError(null);
  }

  function updateOption(key: string, value: string) {
    setOptions((previous) =>
      previous.map((option) => (option.key === key ? { ...option, value } : option)),
    );
  }

  function addOption() {
    if (options.length >= 5) return;
    setOptions((previous) => [
      ...previous,
      { key: `d-${previous.length}-${Date.now()}`, value: "" },
    ]);
  }

  function removeOption(key: string) {
    if (options.length <= 2) return;
    setOptions((previous) => previous.filter((option) => option.key !== key));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setError("Write a question first.");
      return;
    }
    if (filled.length < 2) {
      setError("Add at least two options.");
      return;
    }
    if (
      new Set(filled.map((value) => value.replace(/\s+/g, " ").toLocaleLowerCase())).size !==
      filled.length
    ) {
      setError("Options need to be different.");
      return;
    }

    setError(null);
    setIsCreating(true);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion, options: filled }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        roomId?: string;
        room?: RoomSnapshot;
        participantSecret?: string;
        hostSecret?: string;
      };
      if (!response.ok || !body.roomId || !body.participantSecret || !body.hostSecret) {
        throw new Error(body.error ?? "The room could not be created.");
      }
      saveCreatedRoomCredentials(body.roomId, body.participantSecret, body.hostSecret);
      window.location.assign(`/r/${body.roomId}#host=${encodeURIComponent(body.hostSecret)}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The room could not be created.");
      setIsCreating(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="stagger-in flex flex-col gap-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted uppercase">New room</p>
        <h2 className="font-display mt-1 text-2xl leading-tight font-medium tracking-tight text-fg">
          Ask the room
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          One question. A handful of choices. A room that decides together.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted">Start from a template</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((template, index) => (
            <button
              key={template.question}
              type="button"
              onClick={() => applyTemplate(index)}
              className={cn(
                "pressable h-11 rounded-full border border-border bg-surface px-3 text-sm text-muted transition-[color,background-color,border-color] duration-quick ease-smooth-out",
                "hover:border-primary/40 hover:text-fg",
              )}
            >
              {template.question}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="poll-question">Question</Label>
        <Input
          id="poll-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="What should we decide?"
          maxLength={140}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label>Options</Label>
        <ol className="flex flex-col gap-2">
          {options.map((option, index) => (
            <li key={option.key} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-center font-medium text-subtle tabular-nums">
                {index + 1}
              </span>
              <Input
                value={option.value}
                onChange={(event) => updateOption(option.key, event.target.value)}
                placeholder={index === 0 ? "First choice" : "Another choice"}
                maxLength={60}
                autoComplete="off"
                aria-label={`Option ${index + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0 text-subtle hover:text-fg"
                onClick={() => removeOption(option.key)}
                disabled={options.length <= 2}
                aria-label={`Remove option ${index + 1}`}
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
          disabled={options.length >= 5}
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

      <Button type="submit" size="lg" className="w-full" disabled={isCreating}>
        {isCreating ? "Opening room…" : "Open the room"}
      </Button>
    </form>
  );
}
