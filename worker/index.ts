import { Schema } from "effect";
import { getServerByName, routePartykitRequest } from "partyserver";
import {
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  RoomCode,
} from "@/lib/room-protocol";
import type { WorkerEnv } from "../alchemy.run";

export { Room } from "./room";

const randomCode = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(ROOM_CODE_LENGTH));
  return Array.from(
    bytes,
    (b) => ROOM_CODE_ALPHABET[b % ROOM_CODE_ALPHABET.length],
  ).join("");
};

const clientIp = (request: Request) =>
  request.headers.get("cf-connecting-ip") ?? "unknown";

// Picks a free code; with 160k codes a handful of tries is plenty
async function createRoom(request: Request, env: WorkerEnv) {
  // Each room is a Durable Object with storage, so stop scripts from minting them in bulk
  const { success } = await env.RoomCreationLimit.limit({
    key: clientIp(request),
  });
  if (!success)
    return new Response("Too many rooms created. Try again in a minute.", {
      status: 429,
    });

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const room = await getServerByName(env.Room, code);
    if (await room.claim()) return Response.json({ code });
  }
  return new Response("No free room codes, try again", { status: 503 });
}

const ROOM_PATH = /^\/parties\/room\/([^/]+)\/?$/;
const isRoomCode = Schema.is(RoomCode);

// Only real room codes reach a Durable Object, and an IP can only try so many a minute:
// the code space is small, so unthrottled attempts could find every live room
async function connectToRoom(
  request: Request,
  env: WorkerEnv,
  pathname: string,
) {
  const code = ROOM_PATH.exec(pathname)?.[1];
  if (!code || !isRoomCode(code))
    return new Response("Not found", { status: 404 });

  const { success } = await env.RoomConnectLimit.limit({
    key: clientIp(request),
  });
  if (!success)
    return new Response(
      "Too many connection attempts. Try again in a minute.",
      { status: 429 },
    );

  return (
    (await routePartykitRequest(request, env)) ??
    new Response("Not found", { status: 404 })
  );
}

// Static assets are served before this runs; only /api/* and /parties/:party/:room reach it
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/rooms" && request.method === "POST")
      return createRoom(request, env);
    if (url.pathname.startsWith("/parties/"))
      return connectToRoom(request, env, url.pathname);
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<WorkerEnv>;
