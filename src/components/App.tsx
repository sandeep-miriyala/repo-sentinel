// Repo Sentinel app: fetch the encrypted data, unlock it, show the dashboard.
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { decryptBlob, deriveKey, isBlob } from "../lib/crypto";
import { forgetKey, loadKey, saveKey } from "../lib/keystore";
import type { EncryptedBlob } from "../lib/types";
import { registerWebMcp } from "../lib/webmcp";
import Dashboard from "./Dashboard";
import LockScreen from "./LockScreen";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

export default function App({ base }: { base: string }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Sentinel base={base} />
    </QueryClientProvider>
  );
}

async function fetchBlob(url: string): Promise<EncryptedBlob | null> {
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: unknown = await res.json();
  if (!isBlob(json)) throw new Error("Unknown data format");
  return json;
}

function Sentinel({ base }: { base: string }) {
  const qc = useQueryClient();
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [checkedSaved, setCheckedSaved] = useState(false);

  const blob = useQuery({
    queryKey: ["blob"],
    queryFn: () => fetchBlob(`${base}data/data.enc`),
    refetchInterval: 5 * 60_000,
    refetchOnWindowFocus: true,
  });

  // A key remembered on this device for the current salt unlocks without asking.
  const salt = blob.data?.salt;
  useEffect(() => {
    if (!salt) return;
    let alive = true;
    loadKey(salt).then((k) => {
      if (!alive) return;
      if (k) setKey(k);
      setCheckedSaved(true);
    });
    return () => {
      alive = false;
    };
  }, [salt]);

  const data = useQuery({
    queryKey: ["data", blob.data?.iv, key],
    queryFn: () => decryptBlob(blob.data as EncryptedBlob, key as CryptoKey),
    enabled: !!blob.data && !!key,
    retry: false,
    staleTime: Infinity,
  });

  // A remembered key that no longer works (passphrase changed): forget it and ask again.
  useEffect(() => {
    if (data.isError) {
      forgetKey();
      setKey(null);
    }
  }, [data.isError]);

  useEffect(() => {
    if (data.data) return registerWebMcp(data.data);
  }, [data.data]);

  const unlock = async (passphrase: string, remember: boolean) => {
    const b = blob.data as EncryptedBlob;
    const k = await deriveKey(passphrase, b.salt, b.iter);
    await decryptBlob(b, k); // throws on a wrong passphrase
    if (remember) await saveKey(b.salt, k);
    setKey(k);
  };

  const lock = async () => {
    await forgetKey();
    setKey(null);
    qc.removeQueries({ queryKey: ["data"] });
  };

  if (blob.isPending || (blob.data && !checkedSaved)) return <Status title="Loading…" />;
  if (blob.isError) return <Status title="Could not load the dashboard data" detail={`${blob.error.message}. You may be offline; try again later.`} />;
  if (blob.data === null) return <Status title="No data yet" detail="repo-monitor has not published the first update. It runs every hour." />;
  if (!key || data.isError) return <LockScreen onUnlock={unlock} />;
  if (!data.data) return <Status title="Unlocking…" />;
  return <Dashboard data={data.data} onLock={lock} onRefresh={() => qc.invalidateQueries({ queryKey: ["blob"] })} refreshing={blob.isFetching} />;
}

function Status({ title, detail }: { title: string; detail?: string }) {
  return (
    <main id="main" className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      {detail && <p className="text-muted">{detail}</p>}
    </main>
  );
}
