import { useEffect, useState } from "react";
import { ago, ist, num, siteStatus } from "../lib/format";
import type { DashboardData } from "../lib/types";
import AskAI from "./AskAI";
import { AlertIcon, DownloadIcon, LockIcon, RefreshIcon, ShieldIcon, SparkIcon } from "./icons";
import ReposTable from "./ReposTable";
import Sparkline from "./Sparkline";

type InstallEvent = Event & { prompt: () => Promise<void> };

function useInstall() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  useEffect(() => {
    const on = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallEvent);
    };
    addEventListener("beforeinstallprompt", on);
    return () => removeEventListener("beforeinstallprompt", on);
  }, []);
  return evt ? () => evt.prompt().finally(() => setEvt(null)) : null;
}

const card = "rounded-2xl border border-line bg-card p-5";
const btn = "inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold";

export default function Dashboard({ data, onLock, onRefresh, refreshing }: { data: DashboardData; onLock: () => void; onRefresh: () => void; refreshing: boolean }) {
  const install = useInstall();
  const down = data.sites.filter((s) => !s.ok);
  const s = data.summary;
  const tiles = [
    { label: "Sites", value: `${s.sitesUp} / ${s.sitesTotal}`, note: down.length ? `${down.length} down` : "all up", tone: down.length ? "text-bad" : "text-ok" },
    { label: "Issues / PRs", value: num(s.changes), note: "since last report", tone: "text-ink" },
    { label: "New stars", value: `+${s.newStarsThisWeek}`, note: "this week", tone: s.newStarsThisWeek ? "text-ok" : "text-ink" },
    { label: "Security", value: s.securityIssues == null ? "—" : String(s.securityIssues), note: s.securityIssues == null ? "add MONITOR_TOKEN" : s.securityIssues ? "need action" : "no serious alerts", tone: s.securityIssues ? "text-bad" : "text-ok" },
    { label: "npm / week", value: num(s.npmWeek), note: "downloads", tone: "text-ink" },
  ];

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-ink text-slate-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-emerald-300">
              <ShieldIcon />
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Repo Sentinel</h1>
              <p className="text-sm text-slate-300">
                {data.user} · updated {ago(data.generatedAt)} ({ist(data.generatedAt)} IST)
              </p>
            </div>
          </div>
          <nav aria-label="Dashboard actions" className="flex flex-wrap gap-2">
            <button type="button" onClick={onRefresh} className={`${btn} border border-slate-600`} aria-busy={refreshing}>
              <RefreshIcon />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button type="button" onClick={onLock} className={`${btn} border border-slate-600`}>
              <LockIcon />
              Lock
            </button>
            {install && (
              <button type="button" onClick={install} className={`${btn} bg-emerald-400 text-emerald-950`}>
                <DownloadIcon />
                Install app
              </button>
            )}
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        {down.length > 0 && (
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-bad-bg px-4 py-3 text-red-900">
            <span className="text-bad">
              <AlertIcon />
            </span>
            <strong>
              {down.length} site{down.length > 1 ? "s" : ""} down:
            </strong>
            <span>{down.map((d) => `${d.host} (${siteStatus(d)})`).join(", ")}</span>
            <a href="#sites-h" className="ml-auto font-semibold text-red-900 underline">
              View
            </a>
          </div>
        )}

        <section aria-label="Summary" className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4">
          {tiles.map((t) => (
            <div key={t.label} className={`${card} flex flex-col gap-1`}>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t.label}</span>
              <span className={`text-3xl font-bold tracking-tight ${t.tone}`}>{t.value}</span>
              <span className="text-sm text-muted">{t.note}</span>
            </div>
          ))}
        </section>

        <section aria-labelledby="ai-h" className={`${card} flex flex-col gap-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="ai-h" className="flex items-center gap-2 text-lg font-bold">
              <span className="text-accent">
                <SparkIcon />
              </span>
              AI summary
            </h2>
            {data.ai && <span className="rounded-full bg-accent-bg px-3 py-1 text-xs font-semibold text-blue-900">GitHub Models · {ist(data.ai.at)}</span>}
          </div>
          <p lang="te" className="leading-8">
            {data.ai?.text ?? "The next 8-hour report will add an AI summary here."}
          </p>
          <AskAI data={data} />
        </section>

        <section aria-labelledby="sites-h" className={card}>
          <h2 id="sites-h" className="mb-3 text-lg font-bold">
            Websites
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th scope="col" className="border-b border-line px-2 py-2">Site</th>
                  <th scope="col" className="border-b border-line px-2 py-2">Status</th>
                  <th scope="col" className="border-b border-line px-2 py-2 text-right">Response</th>
                  <th scope="col" className="border-b border-line px-2 py-2 text-right">Uptime</th>
                  <th scope="col" className="border-b border-line px-2 py-2">Last {Math.max(...data.sites.map((x) => x.history.length), 0)} checks</th>
                </tr>
              </thead>
              <tbody>
                {data.sites.map((site) => (
                  <tr key={site.host} className="border-b border-slate-100">
                    <td className="px-2 py-2.5 font-mono text-[13px]">
                      <a href={site.url} className="text-ink hover:underline">
                        {site.host}
                      </a>
                    </td>
                    <td className="px-2 py-2.5">
                      <span className={`inline-flex items-center gap-2 font-semibold ${site.ok ? "text-ok" : "text-bad"}`}>
                        <span aria-hidden="true" className={`size-2 rounded-full ${site.ok ? "bg-emerald-600" : "bg-red-600"}`} />
                        {siteStatus(site)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{site.ok ? `${(site.ms / 1000).toFixed(1)} s` : "—"}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{site.uptime == null ? "—" : `${site.uptime}%`}</td>
                    <td className="px-2 py-2.5">
                      <div role="img" aria-label={`${site.host}: ${site.history.filter(Boolean).length} of ${site.history.length} checks up`} className="flex gap-[3px]">
                        {site.history.map((h, i) => (
                          <span key={i} className={`h-5 w-2 rounded-sm ${h ? "bg-emerald-500" : "bg-red-500"}`} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-wrap items-start gap-6">
          <ReposTable repos={data.repos} />

          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
            <section aria-labelledby="dl-h" className={`${card} flex flex-col gap-4`}>
              <h2 id="dl-h" className="text-lg font-bold">
                Downloads / week
              </h2>
              {(["npm", "pypi"] as const).flatMap((kind) =>
                Object.entries(data.downloads[kind]).map(([pkg, d]) => (
                  <div key={kind + pkg}>
                    <div className="text-sm font-semibold">
                      {kind === "npm" ? "npm" : "PyPI"} · {pkg}
                    </div>
                    <div className="text-3xl font-bold tracking-tight">{num(d.week)}</div>
                    <Sparkline values={d.history} label={`${pkg} weekly downloads, last ${d.history.length} reports: ${d.history.join(", ")}`} color={kind === "npm" ? "#1d4ed8" : "#b45309"} />
                  </div>
                )),
              )}
              <p className="text-xs text-muted">Counts include bots and CI.</p>
            </section>

            {data.xerj && (
              <section aria-labelledby="xerj-h" className={`${card} flex flex-col gap-2`}>
                <h2 id="xerj-h" className="text-lg font-bold">
                  XERJ Corpus Hub
                </h2>
                {data.xerj.ok ? (
                  <div className="flex gap-8">
                    <div>
                      <div className="text-3xl font-bold">{data.xerj.corpora}</div>
                      <div className="text-sm text-muted">corpora listed</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{num(data.xerj.stars)}</div>
                      <div className="text-sm text-muted">stars</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted">The XERJ page could not be read this time.</p>
                )}
                <a href={data.xerj.url} className="text-sm font-semibold text-accent underline">
                  Open contributor page
                </a>
              </section>
            )}
          </div>
        </div>

        {data.security.length > 0 && (
          <section aria-labelledby="sec-h" className={card}>
            <h2 id="sec-h" className="mb-3 text-lg font-bold text-bad">
              Security: action needed
            </h2>
            <ul className="flex flex-col gap-2">
              {data.security.map((x) => (
                <li key={x.url} className="flex flex-wrap gap-x-3 gap-y-1">
                  <strong>{x.repo}</strong>
                  <span className="font-semibold text-bad">{x.kind === "secret" ? "Leaked secret" : x.severity}</span>
                  <span>{x.what}</span>
                  <span className="text-muted">{x.summary}</span>
                  <a href={x.url} className="font-semibold text-accent underline">
                    Open
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="act-h" className={card}>
          <h2 id="act-h" className="mb-3 text-lg font-bold">
            Recent activity <span className="text-sm font-normal text-muted">(7 days)</span>
          </h2>
          {data.changes.length === 0 ? (
            <p className="text-muted">No new issues or pull requests.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-100">
              {data.changes.map((c) => (
                <li key={c.url} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{c.kind}</span>
                  <a href={c.url} className="font-semibold text-ink hover:underline">
                    {c.title}
                  </a>
                  <span className="text-sm text-muted">
                    {c.repo} #{c.number} · @{c.by} · {c.state} · {ago(c.updatedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="flex flex-wrap justify-between gap-3 border-t border-line pt-4 text-sm text-muted">
          <span>Updated hourly by GitHub Actions · encrypted data · works offline</span>
          <span>WebMCP tools: get_status, list_sites, list_repos, list_recent_activity</span>
        </footer>
      </main>
    </div>
  );
}
