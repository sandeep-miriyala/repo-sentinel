// Proves the browser can read what the Python backend writes.
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { decryptBlob, deriveKey, isBlob } from "./crypto";

const blob = JSON.parse(readFileSync("tests/fixtures/sample.enc.json", "utf8"));
const plain = JSON.parse(readFileSync("tests/fixtures/sample.json", "utf8"));

test("recognises the encrypted file", () => {
  expect(isBlob(blob)).toBe(true);
  expect(isBlob({ hello: 1 })).toBe(false);
});

test("decrypts data written by repo-monitor (Python)", async () => {
  const key = await deriveKey("correct horse battery staple", blob.salt, blob.iter);
  expect(await decryptBlob(blob, key)).toEqual(plain);
});

test("wrong passphrase fails", async () => {
  const key = await deriveKey("wrong passphrase here", blob.salt, blob.iter);
  await expect(decryptBlob(blob, key)).rejects.toBeTruthy();
});

test("tampered data fails", async () => {
  const key = await deriveKey("correct horse battery staple", blob.salt, blob.iter);
  const ct = blob.ct.slice(0, 10) + (blob.ct[10] === "A" ? "B" : "A") + blob.ct.slice(11);
  await expect(decryptBlob({ ...blob, ct }, key)).rejects.toBeTruthy();
});
