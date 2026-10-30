import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: {
    serviceWorkers: "block", // let page.route() see data requests
    baseURL: "http://localhost:4321/repo-sentinel/",
    launchOptions: process.env.CHROME ? { executablePath: process.env.CHROME } : {},
  },
  webServer: { command: "npx astro preview --port 4321 --ignore-lock", url: "http://localhost:4321/repo-sentinel/", reuseExistingServer: true },
});
