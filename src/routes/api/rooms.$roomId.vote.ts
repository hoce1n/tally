import { createFileRoute } from "@tanstack/react-router";
import { credentialsFrom, errorResponse, json, parseJson } from "@/lib/rooms/http.server";
import { publishRoomSnapshot } from "@/lib/rooms/realtime.server";
import { submitVote } from "@/lib/rooms/service.server";
import { roomSnapshotEvent, voteInput } from "@/lib/rooms/types";

async function post({
  request,
  params,
}: {
  request: Request;
  params: { roomId: string };
}): Promise<Response> {
  try {
    const input = await parseJson(request, voteInput);
    const snapshot = await submitVote(
      params.roomId,
      credentialsFrom(request).participantSecret,
      input.optionId,
    );
    await publishRoomSnapshot(roomSnapshotEvent(snapshot));
    return json(snapshot);
  } catch (error) {
    return errorResponse(error);
  }
}

export const Route = createFileRoute("/api/rooms/$roomId/vote")({
  server: { handlers: { POST: post } },
});
