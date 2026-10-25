import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["__tests__/unit/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "e2e",
          include: ["__tests__/e2e/**/*.test.ts"],
          globalSetup: ["__tests__/e2e/global-setup.ts"],
          testTimeout: 30_000,
        },
      },
    ],
  },
});
