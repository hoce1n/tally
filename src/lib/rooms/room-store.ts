import { Realtime, type TokenRequest } from "ably";
import { create } from "zustand";
import type { RoomCredentials, RoomSnapshot, RoomSnapshotEvent } from "@/lib/rooms/types";

const participantKey = (roomId: string) => `tally:room:${roomId}:participant`;
const hostKey = (roomId: string) => `tally:room:${roomId}:host`;

let realtime: Realtime | null = null;
let subscribedRoomId: string | null = null;

function readCredentials(roomId: string): RoomCredentials {
  if (typeof window === "undefined") return { participantSecret: null, hostSecret: null };
  return {
    participantSecret: window.localStorage.getItem(participantKey(roomId)),
    hostSecret: window.localStorage.getItem(hostKey(roomId)),
  };
}

function storeCredentials(roomId: string, credentials: Partial<RoomCredentials>): void {
  if (typeof window === "undefined") return;
  if (credentials.participantSecret) {
    window.localStorage.setItem(participantKey(roomId), credentials.participantSecret);
  }
  if (credentials.hostSecret) {
    window.localStorage.setItem(hostKey(roomId), credentials.hostSecret);
  }
}

function authHeaders(roomId: string): HeadersInit {
  const credentials = readCredentials(roomId);
  const headers: Record<string, string> = {};
  if (credentials.participantSecret)
    headers.authorization = `Bearer ${credentials.participantSecret}`;
  if (credentials.hostSecret) headers["x-tally-host-key"] = credentials.hostSecret;
  return headers;
}

async function requestJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, init);
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "The room could not be updated.");
  return body;
}

type NetworkState = "connecting" | "connected" | "reconnecting" | "offline";
type ClientLifecycle =
  "loading-room" | "gathering" | "voting" | "revealed" | "resolved" | "ended" | "expired";

type RoomStore = {
  room: RoomSnapshot | null;
  lifecycle: ClientLifecycle;
  network: NetworkState;
  error: string | null;
  isSubmittingVote: boolean;
  hydrateRoom: (roomId: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  startVoting: () => Promise<void>;
  submitVote: (optionId: string) => Promise<void>;
  applySnapshotEvent: (event: RoomSnapshotEvent) => void;
  connectRealtime: () => void;
  disconnectRealtime: () => void;
};

function lifecycleFor(room: RoomSnapshot): ClientLifecycle {
  if (new Date(room.expiresAt).getTime() <= Date.now()) return "expired";
  return room.status;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  room: null,
  lifecycle: "loading-room",
  network: "offline",
  error: null,
  isSubmittingVote: false,

  hydrateRoom: async (roomId) => {
    set({ lifecycle: "loading-room", error: null });
    try {
      const room = await requestJson<RoomSnapshot>(`/api/rooms/${roomId}`, {
        headers: authHeaders(roomId),
      });
      set({ room, lifecycle: lifecycleFor(room), error: null });
      get().connectRealtime();
    } catch (error) {
      const message = error instanceof Error ? error.message : "The room could not be loaded.";
      set({ error: message, lifecycle: message.includes("expired") ? "expired" : "ended" });
    }
  },

  joinRoom: async (roomId) => {
    const existing = readCredentials(roomId);
    try {
      const result = await requestJson<{ room: RoomSnapshot; participantSecret: string | null }>(
        `/api/rooms/${roomId}/join`,
        { method: "POST", headers: authHeaders(roomId) },
      );
      storeCredentials(roomId, {
        participantSecret: result.participantSecret ?? existing.participantSecret,
      });
      const room = await requestJson<RoomSnapshot>(`/api/rooms/${roomId}`, {
        headers: authHeaders(roomId),
      });
      set({ room, lifecycle: lifecycleFor(room), error: null });
      get().connectRealtime();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "The room could not be joined." });
    }
  },

  startVoting: async () => {
    const room = get().room;
    if (!room) return;
    try {
      const next = await requestJson<RoomSnapshot>(`/api/rooms/${room.id}/commands`, {
        method: "POST",
        headers: { ...authHeaders(room.id), "content-type": "application/json" },
        body: JSON.stringify({ command: "start_voting" }),
      });
      set({ room: next, lifecycle: lifecycleFor(next), error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Voting could not be started." });
    }
  },

  submitVote: async (optionId) => {
    const room = get().room;
    if (!room || get().isSubmittingVote) return;
    set({ isSubmittingVote: true, error: null });
    try {
      const next = await requestJson<RoomSnapshot>(`/api/rooms/${room.id}/vote`, {
        method: "POST",
        headers: { ...authHeaders(room.id), "content-type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      set({ room: next, lifecycle: lifecycleFor(next) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Your vote could not be saved." });
    } finally {
      set({ isSubmittingVote: false });
    }
  },

  applySnapshotEvent: (event) => {
    const current = get().room;
    if (!current || event.roomId !== current.id || event.revision <= current.revision) return;
    const viewer = current.viewer;
    const room = { ...event.snapshot, ...(viewer ? { viewer } : {}) };
    set({ room, lifecycle: lifecycleFor(room) });
  },

  connectRealtime: () => {
    const room = get().room;
    if (!room || typeof window === "undefined") return;
    if (subscribedRoomId === room.id && realtime) return;
    get().disconnectRealtime();
    set({ network: "connecting" });

    const roomId = room.id;
    const client = new Realtime({
      authCallback: (_params, callback) => {
        void requestJson<TokenRequest>(`/api/rooms/${roomId}/realtime-token`, {
          method: "POST",
          headers: authHeaders(roomId),
        })
          .then((tokenRequest) => callback(null, tokenRequest))
          .catch((error: unknown) => {
            set({ network: "offline" });
            callback(
              error instanceof Error ? error.message : "Realtime authentication failed.",
              null,
            );
          });
      },
    });
    realtime = client;
    subscribedRoomId = roomId;
    const channel = client.channels.get(`room:${roomId}`);
    channel.subscribe("room.snapshot", (message) => {
      const event = message.data as RoomSnapshotEvent;
      if (event?.type === "room.snapshot") get().applySnapshotEvent(event);
    });
    client.connection.on("connected", () => set({ network: "connected" }));
    client.connection.on("disconnected", () => set({ network: "reconnecting" }));
    client.connection.on("failed", () => set({ network: "offline" }));
    client.connection.on("suspended", () => {
      set({ network: "reconnecting" });
      void get().hydrateRoom(roomId);
    });
  },

  disconnectRealtime: () => {
    realtime?.close();
    realtime = null;
    subscribedRoomId = null;
    set({ network: "offline" });
  },
}));

export function saveCreatedRoomCredentials(
  roomId: string,
  participantSecret: string,
  hostSecret: string,
): void {
  storeCredentials(roomId, { participantSecret, hostSecret });
}

export function captureHostSecretFromFragment(roomId: string): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const hostSecret = params.get("host");
  if (!hostSecret) return;
  storeCredentials(roomId, { hostSecret });
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}
