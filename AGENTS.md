# Stack

Vite + React SPA, deployed to Cloudflare Workers with Alchemy 2 (beta, Effect-based). `alchemy.run.ts` defines the stack; `worker/index.ts` is the Worker entry and hosts PartyServer rooms as Durable Objects. Alchemy's API changes between betas: check `node_modules/alchemy/src` rather than relying on memory or the website docs.
