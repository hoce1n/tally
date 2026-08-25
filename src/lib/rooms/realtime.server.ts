import { Rest } from "ably";
import type { RoomSnapshotEvent } from "@/lib/rooms/types";

let client: Rest | null = null;

function ablyClient(): Rest | null {
  const key = process.env.ABLY_API_KEY?.trim();
  if (!key) return null;
  client ??= new Rest({ key });
  return client;
}

function roomChannel(roomId: string): string {
  return `room:${roomId}`;
}

export async function createRoomTokenRequest(roomId: string, clientId: string) {
  const ably = ablyClient();
  if (!ably) return null;
  return ably.auth.createTokenRequest({
    clientId,
    ttl: 60 * 60 * 1000,
    capability: JSON.stringify({ [roomChannel(roomId)]: ["subscribe"] }),
  });
}

export async function publishRoomSnapshot(event: RoomSnapshotEvent): Promise<void> {
  const ably = ablyClient();
  if (!ably) return;
  try {
    await ably.channels.get(roomChannel(event.roomId)).publish("room.snapshot", event);
  } catch (error) {
    // The database snapshot remains canonical; clients recover on reconnect via GET.
    console.error("[rooms] realtime publish failed", error);
  }
}
