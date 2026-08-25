import { createFileRoute } from "@tanstack/react-router";
import { errorResponse, json, parseJson } from "@/lib/rooms/http.server";
import { publishRoomSnapshot } from "@/lib/rooms/realtime.server";
import { createRoom } from "@/lib/rooms/service.server";
import { createRoomInput, roomSnapshotEvent } from "@/lib/rooms/types";

async function post({ request }: { request: Request }): Promise<Response> {
  try {
    const input = await parseJson(request, createRoomInput);
    const created = await createRoom(input);
    await publishRoomSnapshot(roomSnapshotEvent(created.room));
    return json(created, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export const Route = createFileRoute("/api/rooms/")({
  server: { handlers: { POST: post } },
});
