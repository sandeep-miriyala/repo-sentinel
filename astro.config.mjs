// Repo Sentinel: static site for GitHub Pages at https://sandeep-miriyala.github.io/repo-sentinel/
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://sandeep-miriyala.github.io",
  base: "/repo-sentinel/",
  output: "static",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
