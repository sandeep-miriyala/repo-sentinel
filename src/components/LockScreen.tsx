import { useId, useState, type FormEvent } from "react";
import { ShieldIcon } from "./icons";

export default function LockScreen({ onUnlock }: { onUnlock: (passphrase: string, remember: boolean) => Promise<void> }) {
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const errId = useId();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pass) return;
    setBusy(true);
    setError("");
    try {
      await onUnlock(pass, remember);
    } catch {
      setError("That passphrase did not unlock the data. Check it and try again.");
      setBusy(false);
    }
  };

  return (
    <main id="main" className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-line bg-card p-8 shadow-sm" aria-describedby={error ? errId : undefined}>
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-ink text-emerald-300">
            <ShieldIcon />
          </span>
          <div>
            <h1 className="text-xl font-bold">Repo Sentinel</h1>
            <p className="text-sm text-muted">This dashboard is locked.</p>
          </div>
        </div>
        <label htmlFor="pass" className="mb-2 block text-sm font-semibold">
          Passphrase
        </label>
        <input
          id="pass"
          type="password"
          autoComplete="current-password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          aria-invalid={!!error}
          className="mb-4 min-h-11 w-full rounded-lg border border-slate-400 px-3 text-base"
          required
        />
        <label className="mb-6 flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-5" />
          Remember on this device
        </label>
        <button type="submit" disabled={busy} className="min-h-11 w-full rounded-lg bg-accent px-4 font-semibold text-white disabled:opacity-60">
          {busy ? "Unlocking…" : "Unlock"}
        </button>
        <p id={errId} role="alert" className="mt-4 min-h-6 text-sm font-semibold text-bad">
          {error}
        </p>
        <p className="mt-2 text-xs text-muted">
          The data is encrypted with AES-256-GCM and decrypted only in your browser. The passphrase is never sent or stored.
        </p>
      </form>
    </main>
  );
}
