// Decrypt the dashboard data in the browser (Web Crypto). Format: repo-monitor sentinel/crypto.py
import type { DashboardData, EncryptedBlob } from "./types";

const bytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export function isBlob(x: unknown): x is EncryptedBlob {
  const b = x as EncryptedBlob;
  return !!b && b.v === 1 && b.alg === "AES-256-GCM" && b.kdf === "PBKDF2-SHA256" && typeof b.ct === "string";
}

/** PBKDF2-SHA256 → AES-256-GCM key. Not extractable: it can be stored in IndexedDB but never read back as bytes. */
export async function deriveKey(passphrase: string, saltB64: string, iterations: number): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: bytes(saltB64), iterations },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
}

/** Throws if the key is wrong or the data was changed. */
export async function decryptBlob(blob: EncryptedBlob, key: CryptoKey): Promise<DashboardData> {
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(blob.iv) }, key, bytes(blob.ct));
  return JSON.parse(new TextDecoder().decode(plain)) as DashboardData;
}
