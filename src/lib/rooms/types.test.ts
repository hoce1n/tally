import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRoomInput, roomSnapshotEvent } from "./types.ts";

describe("room input validation", () => {
  it("normalizes valid room input", () => {
    const parsed = createRoomInput.parse({
      question: " Which problem should we solve? ",
      options: ["Onboarding", "Search"],
    });
    assert.equal(parsed.question, "Which problem should we solve?");
    assert.deepEqual(parsed.options, ["Onboarding", "Search"]);
  });

  it("rejects duplicate options after whitespace and case normalization", () => {
    const result = createRoomInput.safeParse({
      question: "Which option?",
      options: ["Search", "  search  "],
    });
    assert.equal(result.success, false);
  });

  it("keeps viewer state out of published snapshot events", () => {
    const event = roomSnapshotEvent({
      id: "r_1",
      question: "Which option?",
      options: [{ id: "o_1", label: "Search" }],
      status: "voting",
      revision: 3,
      joinedCount: 2,
      submittedCount: 1,
      expiresAt: "2026-08-26T00:00:00.000Z",
      viewer: { role: "participant", hasVoted: true, votedOptionId: "o_1" },
    });
    assert.deepEqual(event, {
      type: "room.snapshot",
      roomId: "r_1",
      revision: 3,
      snapshot: {
        id: "r_1",
        question: "Which option?",
        options: [{ id: "o_1", label: "Search" }],
        status: "voting",
        revision: 3,
        joinedCount: 2,
        submittedCount: 1,
        expiresAt: "2026-08-26T00:00:00.000Z",
      },
    });
  });
});
