import { z } from "zod";
import { bearerToken } from "@/lib/rooms/secrets.server";
import { RoomError } from "@/lib/rooms/service.server";
import type { RoomCredentials } from "@/lib/rooms/types";

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

export function credentialsFrom(request: Request): RoomCredentials {
  return {
    participantSecret: bearerToken(request),
    hostSecret: request.headers.get("x-tally-host-key"),
  };
}

export async function parseJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new RoomError(400, "A JSON request body is required.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    throw new RoomError(422, parsed.error.issues[0]?.message ?? "Invalid request.");
  return parsed.data;
}

export function errorResponse(error: unknown): Response {
  if (error instanceof RoomError) return json({ error: error.message }, error.status);
  console.error("[rooms] request failed", error);
  return json({ error: "The room could not be updated." }, 500);
}
