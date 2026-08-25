import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { useRoomStore } from "./room-store.ts";

describe("room store realtime events", () => {
  it("ignores an older room event and keeps the viewer state local", () => {
    useRoomStore.setState({
      room: {
        id: "r_1",
        question: "Which option?",
        options: [{ id: "o_1", label: "Search" }],
        status: "voting",
        revision: 4,
        joinedCount: 2,
        submittedCount: 1,
        expiresAt: "2026-08-26T00:00:00.000Z",
        viewer: { role: "participant", hasVoted: true, votedOptionId: "o_1" },
      },
      lifecycle: "voting",
      network: "connected",
      error: null,
      isSubmittingVote: false,
    });

    useRoomStore.getState().applySnapshotEvent({
      type: "room.snapshot",
      roomId: "r_1",
      revision: 3,
      snapshot: {
        id: "r_1",
        question: "Which option?",
        options: [{ id: "o_1", label: "Search" }],
        status: "voting",
        revision: 3,
        joinedCount: 1,
        submittedCount: 0,
        expiresAt: "2026-08-26T00:00:00.000Z",
      },
    });

    const current = useRoomStore.getState().room;
    assert.equal(current?.revision, 4);
    assert.equal(current?.viewer?.votedOptionId, "o_1");
  });

  it("applies a newer room event without exposing another viewer's state", () => {
    useRoomStore.getState().applySnapshotEvent({
      type: "room.snapshot",
      roomId: "r_1",
      revision: 5,
      snapshot: {
        id: "r_1",
        question: "Which option?",
        options: [{ id: "o_1", label: "Search" }],
        status: "voting",
        revision: 5,
        joinedCount: 3,
        submittedCount: 2,
        expiresAt: "2026-08-26T00:00:00.000Z",
      },
    });

    const current = useRoomStore.getState().room;
    assert.equal(current?.revision, 5);
    assert.equal(current?.joinedCount, 3);
    assert.deepEqual(current?.viewer, {
      role: "participant",
      hasVoted: true,
      votedOptionId: "o_1",
    });
  });
});
