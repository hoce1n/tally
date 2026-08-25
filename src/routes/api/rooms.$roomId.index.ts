import { createFileRoute } from "@tanstack/react-router";
import { credentialsFrom, errorResponse, json } from "@/lib/rooms/http.server";
import { getRoomSnapshot } from "@/lib/rooms/service.server";

async function get({
  request,
  params,
}: {
  request: Request;
  params: { roomId: string };
}): Promise<Response> {
  try {
    return json(await getRoomSnapshot(params.roomId, credentialsFrom(request)));
  } catch (error) {
    return errorResponse(error);
  }
}

export const Route = createFileRoute("/api/rooms/$roomId/")({
  server: { handlers: { GET: get } },
});
