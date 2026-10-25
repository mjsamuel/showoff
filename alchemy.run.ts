import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import type { Room } from "./worker/room";

// The Vite build serves the SPA as static assets; worker/index.ts handles
// everything else and hosts the PartyServer rooms as Durable Objects
export const Website = Cloudflare.Website.Vite(
  "Website",
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;
    return {
      main: "worker/index.ts",
      assets: {
        notFoundHandling: "single-page-application",
        runWorkerFirst: ["/api/*", "/parties/*"],
      },
      env: {
        // partyserver routes /parties/room/:id to this binding by its kebab-cased name
        Room: Cloudflare.DurableObject<Room>("Room"),
        // Rooms created per client IP, shared by every stage
        RoomCreationLimit: Cloudflare.RateLimit("RoomCreationLimit", {
          namespaceId: 2001,
          simple: { limit: 10, period: 60 },
        }),
        // Room connection attempts per client IP, also shared by every stage: room for a
        // whole session reconnecting on one wifi, but slow going for anyone scanning codes
        RoomConnectLimit: Cloudflare.RateLimit("RoomConnectLimit", {
          namespaceId: 2002,
          simple: { limit: 100, period: 60 },
        }),
      },
      // Only prod owns the real hostnames; www 301s to the apex before the Worker runs
      domain:
        stage === "prod"
          ? { name: "showoff.gg", redirects: ["www.showoff.gg"] }
          : undefined,
    };
  }),
);

export type WorkerEnv = Cloudflare.InferEnv<typeof Website>;

export default Alchemy.Stack(
  "Showoff",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const site = yield* Website;
    return { url: site.url };
  }),
);
