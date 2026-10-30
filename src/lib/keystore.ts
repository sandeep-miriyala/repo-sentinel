// "Remember on this device": keeps the derived, non-extractable CryptoKey in IndexedDB.
// The passphrase itself is never stored. Every call is wrapped: storage can be blocked.
const DB = "repo-sentinel";
const STORE = "keys";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveKey(salt: string, key: CryptoKey): Promise<void> {
  try {
    const db = await open();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ salt, key }, "key");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* not remembered; unlocking still works */
  }
}

export async function loadKey(salt: string): Promise<CryptoKey | null> {
  try {
    const db = await open();
    const rec = await new Promise<{ salt: string; key: CryptoKey } | undefined>((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).get("key");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return rec && rec.salt === salt ? rec.key : null;
  } catch {
    return null;
  }
}

export async function forgetKey(): Promise<void> {
  try {
    const db = await open();
    db.transaction(STORE, "readwrite").objectStore(STORE).delete("key");
  } catch {
    /* nothing stored */
  }
}
