import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const CI = Boolean(process.env.CI);
const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "@/src": srcDir },
  },
  test: {
    environment: "jsdom",
    globals: true,
    hideSkippedTests: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    outputFile: CI ? "./test-results.json" : undefined,
    reporters: CI ? ["github-actions", "json"] : ["default"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
