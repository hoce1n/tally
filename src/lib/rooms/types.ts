import { z } from "zod";

export const ROOM_STATUSES = ["gathering", "voting", "revealed", "resolved", "ended"] as const;

export type RoomStatus = (typeof ROOM_STATUSES)[number];

const normalizedLabel = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

export const createRoomInput = z
  .object({
    question: z.string().trim().min(1).max(140),
    options: z.array(z.string().trim().min(1).max(60)).min(2).max(5),
  })
  .superRefine(({ options }, ctx) => {
    const seen = new Set<string>();
    for (const [index, option] of options.entries()) {
      const normalized = normalizedLabel(option);
      if (seen.has(normalized)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Options need to be different.",
          path: ["options", index],
        });
      }
      seen.add(normalized);
    }
  });

export const voteInput = z.object({ optionId: z.string().min(1).max(100) });

export const hostCommandInput = z.object({ command: z.literal("start_voting") });

export type Viewer = {
  role: "host" | "participant" | "anonymous";
  hasVoted: boolean;
  votedOptionId?: string;
};

export type RoomOptionSnapshot = {
  id: string;
  label: string;
  voteCount?: number;
};

export type RoomSnapshot = {
  id: string;
  question: string;
  options: RoomOptionSnapshot[];
  status: RoomStatus;
  revision: number;
  joinedCount: number;
  submittedCount: number;
  expiresAt: string;
  viewer?: Viewer;
};

export type RoomSnapshotEvent = {
  type: "room.snapshot";
  roomId: string;
  revision: number;
  snapshot: Omit<RoomSnapshot, "viewer">;
};

export function roomSnapshotEvent(snapshot: RoomSnapshot): RoomSnapshotEvent {
  const { viewer: _viewer, ...publicSnapshot } = snapshot;
  return {
    type: "room.snapshot",
    roomId: snapshot.id,
    revision: snapshot.revision,
    snapshot: publicSnapshot,
  };
}

export type RoomCredentials = {
  participantSecret: string | null;
  hostSecret: string | null;
};
