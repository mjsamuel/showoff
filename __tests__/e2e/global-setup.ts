import { spawn, execSync, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import puppeteer, { type Browser } from "puppeteer";
import type { TestProject } from "vitest/node";

const PORT = 3099;
const BASE_URL = `http://localhost:${PORT}`;

declare module "vitest" {
  export interface ProvidedContext {
    baseUrl: string;
    wsEndpoint: string;
  }
}

function isPortInUse(port: number) {
  return new Promise<boolean>((resolve) => {
    const probe = createServer()
      .once("error", () => resolve(true))
      .once("listening", () => probe.close(() => resolve(false)))
      .listen(port);
  });
}

// Polls until our server answers, failing fast if it exits (e.g. EADDRINUSE)
async function waitForServer(
  url: string,
  server: ChildProcess,
  timeoutMs = 60_000,
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (server.exitCode !== null || server.signalCode !== null) {
      throw new Error(
        `vite preview exited (${server.exitCode ?? server.signalCode}) before serving ${url}`,
      );
    }
    try {
      // A server that accepts but never responds must not outlast the deadline
      const signal = AbortSignal.timeout(Math.max(1, deadline - Date.now()));
      if ((await fetch(url, { signal })).ok) return;
    } catch {
      // Not listening yet, or timed out
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

// Vitest's stack-trace formatting currently crashes on globalSetup errors
// ("code.charCodeAt is not a function"), hiding the cause, so print it first
export default async function setup(project: TestProject) {
  try {
    return await start(project);
  } catch (error) {
    console.error(
      `\n[e2e setup] ${error instanceof Error ? error.message : error}\n`,
    );
    throw error;
  }
}

// Builds and serves the app, then shares one headless browser with every e2e test
async function start(project: TestProject) {
  // Anything already on the port would answer the readiness check in place of our build
  if (await isPortInUse(PORT)) {
    throw new Error(
      `Port ${PORT} is already in use; stop whatever is serving ${BASE_URL} and retry`,
    );
  }

  execSync("pnpm build", { stdio: "inherit" });

  // Own process group so teardown also stops anything the preview server spawns
  const server: ChildProcess = spawn(
    "node_modules/.bin/vite",
    ["preview", "--port", String(PORT), "--strictPort"],
    {
      stdio: "inherit",
      detached: true,
    },
  );
  const stopServer = () => {
    if (server.pid && server.exitCode === null)
      process.kill(-server.pid, "SIGTERM");
  };

  // Vitest only gets the teardown if setup returns, so clean up here on failure
  let browser: Browser;
  try {
    await waitForServer(BASE_URL, server);
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
  } catch (error) {
    stopServer();
    throw error;
  }

  project.provide("baseUrl", BASE_URL);
  project.provide("wsEndpoint", browser.wsEndpoint());

  return async () => {
    try {
      await browser.close();
    } finally {
      stopServer();
    }
  };
}
