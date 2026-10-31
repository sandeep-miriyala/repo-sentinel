// The PWA manifest stays installable: required fields, both icon purposes, and every file it names exists.
import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "vitest";

const m = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));

test("has the fields browsers need to install it", () => {
  for (const k of ["id", "name", "short_name", "start_url", "scope", "display", "theme_color", "background_color", "lang"]) expect(m[k], k).toBeTruthy();
  expect(m.start_url.startsWith(m.scope)).toBe(true);
});

test("has 192 and 512 icons, plus a maskable one", () => {
  const sizes = m.icons.map((i: { sizes: string }) => i.sizes);
  expect(sizes).toContain("192x192");
  expect(sizes).toContain("512x512");
  expect(m.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBe(true);
});

test("every icon and screenshot file exists", () => {
  for (const f of [...m.icons, ...m.screenshots]) expect(existsSync(`public/${f.src}`), f.src).toBe(true);
});

test("screenshots cover phone and desktop, with labels", () => {
  const forms = m.screenshots.map((s: { form_factor: string }) => s.form_factor);
  expect(forms).toEqual(expect.arrayContaining(["wide", "narrow"]));
  for (const s of m.screenshots) expect(s.label).toBeTruthy();
});
