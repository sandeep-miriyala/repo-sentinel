// "ఈ వారం ఏమైంది?": Chrome's built-in, on-device AI (Prompt API). Nothing leaves the device.
// Shown only where the browser offers it.
import { useEffect, useId, useState, type FormEvent } from "react";
import type { DashboardData } from "../lib/types";

type LM = {
  availability: (o?: object) => Promise<"unavailable" | "downloadable" | "downloading" | "available">;
  create: (o: object) => Promise<{ prompt: (q: string) => Promise<string>; destroy?: () => void }>;
};
const lm = (): LM | undefined => (globalThis as { LanguageModel?: LM }).LanguageModel;

function context(d: DashboardData): string {
  return JSON.stringify({
    sites: d.sites.map((s) => ({ host: s.host, ok: s.ok, status: s.status, uptime: s.uptime })),
    repos: d.repos.map((r) => ({ name: r.name, stars: r.stars, newStars: r.starsDelta, issues: r.openIssues })),
    changes: d.changes.map((c) => ({ repo: c.repo, kind: c.kind, title: c.title, by: c.by, state: c.state })),
    security: d.security.map((s) => ({ repo: s.repo, severity: s.severity, what: s.what })),
    downloads: d.downloads,
    xerj: d.xerj && { corpora: d.xerj.corpora, stars: d.xerj.stars },
    generatedAt: d.generatedAt,
  });
}

export default function AskAI({ data }: { data: DashboardData }) {
  const [ready, setReady] = useState<"checking" | "yes" | "no">("checking");
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const id = useId();

  useEffect(() => {
    const api = lm();
    if (!api) return setReady("no");
    api.availability().then((a) => setReady(a === "unavailable" ? "no" : "yes"), () => setReady("no"));
  }, []);

  const ask = async (e: FormEvent) => {
    e.preventDefault();
    const api = lm();
    if (!api || !q.trim()) return;
    setBusy(true);
    setAnswer("");
    try {
      const session = await api.create({
        initialPrompts: [
          {
            role: "system",
            content: `You answer questions about the owner's websites and GitHub repos. Reply briefly in Telugu (technical words may stay English). Use only this data:\n${context(data)}`,
          },
        ],
      });
      setAnswer(await session.prompt(q));
      session.destroy?.();
    } catch {
      setAnswer("On-device AI could not answer this time.");
    } finally {
      setBusy(false);
    }
  };

  if (ready !== "yes") {
    return ready === "no" ? <p className="text-xs text-muted">Ask questions here in desktop Chrome with built-in AI. Everything else works in any browser.</p> : null;
  }
  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={ask} className="flex flex-wrap gap-2">
        <label htmlFor={id} className="sr-only">
          Ask about this week
        </label>
        <input
          id={id}
          lang="te"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ఈ వారం ఏమైంది?"
          className="min-h-11 min-w-0 flex-[1_1_260px] rounded-lg border border-slate-400 px-3 text-base"
        />
        <button type="submit" disabled={busy} className="min-h-11 rounded-lg bg-accent px-5 font-semibold text-white disabled:opacity-60">
          {busy ? "Thinking…" : "Ask"}
        </button>
      </form>
      <p aria-live="polite" lang="te" className="whitespace-pre-wrap leading-7">
        {answer}
      </p>
      <p className="text-xs text-muted">Answered by Chrome's built-in AI on this device. Nothing is sent anywhere.</p>
    </div>
  );
}
