# Showoff

Showoff is a game created for cardists to test their skill and knowledge in cardistry!

Each turn draws a category (and sometimes a modifier); the player has to perform a move that fits or lose a life. Play on one device, or create a room so everyone follows along on their own.

### Rooms

Hit **Create room** in the sidebar and share the 4-letter code (or the invite link from **Invite**). Everyone in the room sees the same cards.

- Anyone can draw the next turn or adjust lives; only the host changes settings. Two players tapping **Next turn** at once draw one turn, not two.
- A dropped or reloaded device rejoins with the same seat and lives.
- If the host drops, the longest-seated connected player takes over.
- Rooms are forgotten an hour after everyone leaves.
- Abuse limits: 10 new rooms per minute per IP, 100 connection attempts per minute per IP, 40 connections per room, and 10 messages a second per player (more closes it).

## Tech Stack

- **Vite 8** single-page app, **React 19**
- **Effect 4** — game logic (`Random` service), `Schema`-validated settings and room messages, and atoms for state (`@effect/atom-react`)
- **Tailwind CSS v4** + **shadcn/ui** components
- **Cloudflare Workers** — deployed with [Alchemy](https://alchemy.run); [PartyServer](https://github.com/cloudflare/partykit/tree/main/packages/partyserver) rooms on Durable Objects

Playing on one device runs fully client-side. In a room, the `Room` Durable Object draws the challenges with the same game logic and broadcasts each change. Settings persist in `localStorage` via `KeyValueStore`, decoded with `Schema` (invalid values fall back to defaults).

## Project Structure

```
index.html                  # Metadata, icons, pre-paint theme script
alchemy.run.ts              # Cloudflare stack: Vite site + Room Durable Object + rate limits
worker/
  index.ts                  # Worker entry: POST /api/rooms, routes /parties/room/:code to rooms
  room.ts                   # Room Durable Object (PartyServer): sockets, limits, persistence
src/
  main.tsx                  # Font, global CSS, mounts App
  components/
    app.tsx                 # Sidebar + board layout
    game-provider.tsx       # Local game or room session, behind one useGame() context
    board.tsx               # Challenge cards + Next turn / Add modifier
    sidebar/                # Room controls, players and lives, settings, rules
    room/room-dialog.tsx    # Create / join a room
    ui/                     # shadcn/ui primitives
  hooks/use-game.ts         # The Game interface both modes provide
  lib/
    types.ts                # Schemas: settings, prompts, challenges
    game-logic.ts           # Effect-based draws: nextTurn, addModifier, no-repeat deck
    store.ts                # Atoms: persisted settings, local game and players, actions
    room-protocol.ts        # Schemas for room messages, shared by browser and Worker
    room-logic.ts           # Pure room state machine: join, host handover, turns, views
    room-store.ts           # Atoms: player identity, room URL (/room/ABCD), live socket
    data.json               # Categories and modifiers
__tests__/
  unit/                     # game-logic, store, room-logic
  e2e/                      # Puppeteer against a production build
```

## Development

```sh
pnpm install
pnpm dev         # Alchemy dev: Vite + the Worker and Room Durable Object locally
pnpm dev:web     # Vite only (rooms won't connect)
pnpm lint
pnpm test        # Unit tests
pnpm test:e2e    # Builds, serves with vite preview, drives it with Puppeteer
pnpm build       # Typecheck app + worker, then vite build
```

## Deployment

`.github/workflows/deploy.yml` deploys `main` to the `prod` stage at [showoff.gg](https://showoff.gg) (`www.showoff.gg` redirects to it), and each same-repo PR to a `pr-<number>` preview stage that is destroyed when the PR closes. It needs a `CLOUDFLARE_API_TOKEN` secret and a `CLOUDFLARE_ACCOUNT_ID` variable on the repository.

To deploy by hand:

```sh
pnpm run deploy --stage prod
```
