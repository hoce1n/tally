import { createFileRoute } from "@tanstack/react-router";
import { credentialsFrom, errorResponse, json, parseJson } from "@/lib/rooms/http.server";
import { publishRoomSnapshot } from "@/lib/rooms/realtime.server";
import { startVoting } from "@/lib/rooms/service.server";
import { hostCommandInput, roomSnapshotEvent } from "@/lib/rooms/types";

async function post({
  request,
  params,
}: {
  request: Request;
  params: { roomId: string };
}): Promise<Response> {
  try {
    const input = await parseJson(request, hostCommandInput);
    if (input.command !== "start_voting") return json({ error: "Unsupported room command." }, 422);
    const snapshot = await startVoting(params.roomId, credentialsFrom(request).hostSecret);
    await publishRoomSnapshot(roomSnapshotEvent(snapshot));
    return json(snapshot);
  } catch (error) {
    return errorResponse(error);
  }
}

export const Route = createFileRoute("/api/rooms/$roomId/commands")({
  server: { handlers: { POST: post } },
});
