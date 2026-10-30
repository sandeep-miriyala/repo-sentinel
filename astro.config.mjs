// Repo Sentinel: static site for GitHub Pages at https://sandeepmiriyala03.github.io/repo-sentinel/
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://sandeepmiriyala03.github.io",
  base: "/repo-sentinel/",
  output: "static",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
