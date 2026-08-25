import { createFileRoute } from "@tanstack/react-router";
import { credentialsFrom, errorResponse, json } from "@/lib/rooms/http.server";
import { joinRoom } from "@/lib/rooms/service.server";
import { publishRoomSnapshot } from "@/lib/rooms/realtime.server";
import { roomSnapshotEvent } from "@/lib/rooms/types";

async function post({
  request,
  params,
}: {
  request: Request;
  params: { roomId: string };
}): Promise<Response> {
  try {
    const credentials = credentialsFrom(request);
    const joined = await joinRoom(params.roomId, credentials.participantSecret);
    await publishRoomSnapshot(roomSnapshotEvent(joined.room));
    return json(joined);
  } catch (error) {
    return errorResponse(error);
  }
}

export const Route = createFileRoute("/api/rooms/$roomId/join")({
  server: { handlers: { POST: post } },
});
