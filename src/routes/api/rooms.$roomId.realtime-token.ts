import { createFileRoute } from "@tanstack/react-router";
import { credentialsFrom, errorResponse, json } from "@/lib/rooms/http.server";
import { createRoomTokenRequest } from "@/lib/rooms/realtime.server";
import { requireHost, requireParticipant } from "@/lib/rooms/service.server";

async function post({
  request,
  params,
}: {
  request: Request;
  params: { roomId: string };
}): Promise<Response> {
  try {
    const credentials = credentialsFrom(request);
    let clientId: string;
    if (credentials.hostSecret) {
      const room = await requireHost(params.roomId, credentials.hostSecret);
      clientId = `host:${room.id}`;
    } else {
      const { session } = await requireParticipant(params.roomId, credentials.participantSecret);
      clientId = `participant:${session.id}`;
    }
    const tokenRequest = await createRoomTokenRequest(params.roomId, clientId);
    if (!tokenRequest)
      return json({ error: "Realtime is not configured for this environment." }, 503);
    return json(tokenRequest);
  } catch (error) {
    return errorResponse(error);
  }
}

export const Route = createFileRoute("/api/rooms/$roomId/realtime-token")({
  server: { handlers: { POST: post } },
});
