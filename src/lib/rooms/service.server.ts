import { getSql } from "@/lib/db";
import {
  createId,
  createOpaqueSecret,
  hashSecret,
  secretMatches,
} from "@/lib/rooms/secrets.server";
import type { RoomCredentials, RoomSnapshot, RoomStatus, Viewer } from "@/lib/rooms/types";

const DAY_MS = 24 * 60 * 60 * 1000;

type RoomRow = {
  id: string;
  host_secret_hash: string;
  question: string;
  status: RoomStatus;
  revision: number;
  expires_at: Date | string;
};

type OptionRow = { id: string; label: string; ordinal: number };
type CountRow = { joined_count: number; submitted_count: number };
type SessionRow = { id: string; vote_option_id: string | null };

export class RoomError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "RoomError";
  }
}

function expiresAtIso(value: Date | string): string {
  return new Date(value).toISOString();
}

async function fetchRoom(roomId: string): Promise<RoomRow> {
  const sql = await getSql();
  const rows = await sql.query<RoomRow>(
    `select id, host_secret_hash, question, status, revision, expires_at
     from rooms where id = $1`,
    [roomId],
  );
  const room = rows[0];
  if (!room) throw new RoomError(404, "Room not found.");
  return room;
}

async function ensureLiveRoom(room: RoomRow): Promise<void> {
  if (new Date(room.expires_at).getTime() > Date.now()) return;
  const sql = await getSql();
  await sql.query(
    `update rooms
       set status = 'ended', ended_at = coalesce(ended_at, now()), updated_at = now()
     where id = $1 and status <> 'ended'`,
    [room.id],
  );
  throw new RoomError(410, "This room has expired.");
}

async function viewerFor(room: RoomRow, credentials: RoomCredentials): Promise<Viewer | undefined> {
  if (credentials.participantSecret) {
    const sql = await getSql();
    const hash = hashSecret(credentials.participantSecret);
    const rows = await sql.query<SessionRow>(
      `select id, vote_option_id
       from room_participant_sessions
       where room_id = $1 and secret_hash = $2`,
      [room.id, hash],
    );
    const session = rows[0];
    if (session) {
      return {
        role:
          credentials.hostSecret && secretMatches(credentials.hostSecret, room.host_secret_hash)
            ? "host"
            : "participant",
        hasVoted: session.vote_option_id !== null,
        ...(session.vote_option_id ? { votedOptionId: session.vote_option_id } : {}),
      };
    }
  }

  if (credentials.hostSecret && secretMatches(credentials.hostSecret, room.host_secret_hash)) {
    return { role: "host", hasVoted: false };
  }

  return undefined;
}

export async function requireHost(roomId: string, hostSecret: string | null): Promise<RoomRow> {
  if (!hostSecret) throw new RoomError(401, "A host key is required.");
  const room = await fetchRoom(roomId);
  await ensureLiveRoom(room);
  if (!secretMatches(hostSecret, room.host_secret_hash)) {
    throw new RoomError(403, "The host key is not valid for this room.");
  }
  return room;
}

export async function requireParticipant(
  roomId: string,
  participantSecret: string | null,
): Promise<{ room: RoomRow; session: SessionRow }> {
  if (!participantSecret) throw new RoomError(401, "A participant session is required.");
  const room = await fetchRoom(roomId);
  await ensureLiveRoom(room);
  const sql = await getSql();
  const rows = await sql.query<SessionRow>(
    `select id, vote_option_id
     from room_participant_sessions
     where room_id = $1 and secret_hash = $2`,
    [room.id, hashSecret(participantSecret)],
  );
  const session = rows[0];
  if (!session) throw new RoomError(401, "The participant session is not valid for this room.");
  return { room, session };
}

export async function getRoomSnapshot(
  roomId: string,
  credentials: RoomCredentials = { participantSecret: null, hostSecret: null },
): Promise<RoomSnapshot> {
  const room = await fetchRoom(roomId);
  await ensureLiveRoom(room);
  const sql = await getSql();
  const [options, counts, viewer] = await Promise.all([
    sql.query<OptionRow>(
      `select id, label, ordinal from room_options where room_id = $1 order by ordinal asc`,
      [room.id],
    ),
    sql.query<CountRow>(
      `select count(*)::integer as joined_count,
              count(vote_option_id)::integer as submitted_count
       from room_participant_sessions where room_id = $1`,
      [room.id],
    ),
    viewerFor(room, credentials),
  ]);
  const aggregate = counts[0] ?? { joined_count: 0, submitted_count: 0 };

  return {
    id: room.id,
    question: room.question,
    options: options.map((option) => ({ id: option.id, label: option.label })),
    status: room.status,
    revision: room.revision,
    joinedCount: Number(aggregate.joined_count),
    submittedCount: Number(aggregate.submitted_count),
    expiresAt: expiresAtIso(room.expires_at),
    ...(viewer ? { viewer } : {}),
  };
}

export async function createRoom(input: { question: string; options: string[] }) {
  const sql = await getSql();
  const roomId = createId("r");
  const hostSecret = createOpaqueSecret();
  const participantSecret = createOpaqueSecret();
  const expiresAt = new Date(Date.now() + DAY_MS).toISOString();

  await sql.query(
    `insert into rooms (id, host_secret_hash, question, expires_at)
     values ($1, $2, $3, $4)`,
    [roomId, hashSecret(hostSecret), input.question.trim(), expiresAt],
  );

  for (const [ordinal, label] of input.options.entries()) {
    await sql.query(
      `insert into room_options (id, room_id, ordinal, label)
       values ($1, $2, $3, $4)`,
      [createId("o"), roomId, ordinal, label.trim()],
    );
  }

  await sql.query(
    `insert into room_participant_sessions (id, room_id, secret_hash)
     values ($1, $2, $3)`,
    [createId("ps"), roomId, hashSecret(participantSecret)],
  );

  const room = await getRoomSnapshot(roomId, { participantSecret, hostSecret });
  return { roomId, room, participantSecret, hostSecret };
}

export async function joinRoom(roomId: string, participantSecret: string | null) {
  const room = await fetchRoom(roomId);
  await ensureLiveRoom(room);
  const sql = await getSql();

  if (participantSecret) {
    const updated = await sql.query<SessionRow>(
      `update room_participant_sessions
       set last_seen_at = now()
       where room_id = $1 and secret_hash = $2
       returning id, vote_option_id`,
      [room.id, hashSecret(participantSecret)],
    );
    if (!updated[0])
      throw new RoomError(401, "The participant session is not valid for this room.");
    return {
      room: await getRoomSnapshot(roomId, { participantSecret, hostSecret: null }),
      participantSecret: null,
    };
  }

  const freshSecret = createOpaqueSecret();
  await sql.query(
    `insert into room_participant_sessions (id, room_id, secret_hash)
     values ($1, $2, $3)`,
    [createId("ps"), room.id, hashSecret(freshSecret)],
  );
  await sql.query(`update rooms set revision = revision + 1, updated_at = now() where id = $1`, [
    room.id,
  ]);
  return {
    room: await getRoomSnapshot(roomId, { participantSecret: freshSecret, hostSecret: null }),
    participantSecret: freshSecret,
  };
}

export async function startVoting(
  roomId: string,
  hostSecret: string | null,
): Promise<RoomSnapshot> {
  await requireHost(roomId, hostSecret);
  const sql = await getSql();
  const transitioned = await sql.query<RoomRow>(
    `update rooms
       set status = 'voting', voting_started_at = now(), revision = revision + 1, updated_at = now()
     where id = $1 and status = 'gathering' and expires_at > now()
     returning id, host_secret_hash, question, status, revision, expires_at`,
    [roomId],
  );
  if (!transitioned[0])
    throw new RoomError(409, "Voting has already started or this room is no longer active.");
  return getRoomSnapshot(roomId, { participantSecret: null, hostSecret });
}

export async function submitVote(
  roomId: string,
  participantSecret: string | null,
  optionId: string,
): Promise<RoomSnapshot> {
  const { room } = await requireParticipant(roomId, participantSecret);
  const sql = await getSql();

  const accepted = await sql.query<SessionRow>(
    `update room_participant_sessions as session
       set vote_option_id = $1, voted_at = now(), last_seen_at = now()
      where session.room_id = $2
        and session.secret_hash = $3
        and session.vote_option_id is null
        and exists (
          select 1 from rooms
          where id = $2 and status = 'voting' and expires_at > now()
        )
        and exists (
          select 1 from room_options where id = $1 and room_id = $2
        )
      returning session.id, session.vote_option_id`,
    [optionId, roomId, hashSecret(participantSecret ?? "")],
  );

  if (!accepted[0]) {
    const option = await sql.query<{ id: string }>(
      `select id from room_options where id = $1 and room_id = $2`,
      [optionId, roomId],
    );
    if (!option[0]) throw new RoomError(422, "That option does not belong to this room.");
    if (room.status !== "voting") throw new RoomError(409, "Voting is not open.");
    throw new RoomError(409, "This participant session has already voted.");
  }

  await sql.query(
    `update rooms set revision = revision + 1, updated_at = now()
     where id = $1 and status = 'voting' and expires_at > now()`,
    [roomId],
  );

  return getRoomSnapshot(roomId, { participantSecret, hostSecret: null });
}
