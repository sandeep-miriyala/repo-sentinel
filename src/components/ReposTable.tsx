// Repos table: TanStack Table v9 for sorting; the filter box narrows rows before the table.
import { createColumnHelper, createSortedRowModel, rowSortingFeature, sortFn_alphanumeric, sortFn_basic, tableFeatures, useTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { RepoRow } from "../lib/types";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
});
const helper = createColumnHelper<typeof features, RepoRow>();

function SecurityBadge({ sec }: { sec: RepoRow["security"] }) {
  if (!sec) return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">n/a</span>;
  if (sec.secrets) return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-900">{sec.secrets} leaked secret{sec.secrets > 1 ? "s" : ""}</span>;
  if (sec.serious) return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-900">{sec.serious} serious</span>;
  return <span className="rounded-full bg-ok-bg px-2.5 py-0.5 text-xs font-bold text-emerald-900">OK</span>;
}

const columns = helper.columns([
  helper.accessor("name", {
    header: "Repo",
    sortFn: "alphanumeric",
    cell: (c) => (
      <a href={c.row.original.url} className="font-semibold text-ink underline-offset-2 hover:underline">
        {c.getValue()}
        {c.row.original.private && <span className="ml-2 rounded-full border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-muted">private</span>}
      </a>
    ),
  }),
  helper.accessor("stars", {
    header: "Stars",
    sortFn: "basic",
    sortDescFirst: true,
    cell: (c) => (
      <span className="tabular-nums">
        {c.getValue()}
        {c.row.original.starsDelta > 0 && <span className="ml-1 font-semibold text-ok">+{c.row.original.starsDelta}</span>}
      </span>
    ),
  }),
  helper.accessor("forks", { header: "Forks", sortFn: "basic", sortDescFirst: true, cell: (c) => <span className="tabular-nums">{c.getValue()}</span> }),
  helper.accessor("openIssues", { header: "Open issues", sortFn: "basic", sortDescFirst: true, cell: (c) => <span className="tabular-nums">{c.getValue()}</span> }),
  helper.accessor((r) => (r.security ? r.security.secrets * 100 + r.security.serious : -1), {
    id: "security",
    header: "Security",
    sortFn: "basic",
    sortDescFirst: true,
    cell: (c) => <SecurityBadge sec={c.row.original.security} />,
  }),
]);

const RIGHT = new Set(["stars", "forks", "openIssues"]);

export default function ReposTable({ repos }: { repos: RepoRow[] }) {
  const [filter, setFilter] = useState("");
  const data = useMemo(() => repos.filter((r) => r.name.toLowerCase().includes(filter.trim().toLowerCase())), [repos, filter]);
  const table = useTable({ features, columns, data, initialState: { sorting: [{ id: "stars", desc: true }] } });

  return (
    <section aria-labelledby="repos-h" className="min-w-0 flex-[999_1_560px] rounded-2xl border border-line bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="repos-h" className="text-lg font-bold">
          Repos <span className="text-sm font-normal text-muted">({repos.length})</span>
        </h2>
        <label className="flex items-center gap-2 text-sm text-muted">
          Filter
          <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="repo name" className="min-h-10 w-44 rounded-lg border border-slate-400 px-3 text-sm text-ink" />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((g) => (
              <tr key={g.id}>
                {g.headers.map((h) => {
                  const sorted = h.column.getIsSorted();
                  return (
                    <th
                      key={h.id}
                      scope="col"
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}
                      className={`border-b border-line px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted ${RIGHT.has(h.column.id) ? "text-right" : "text-left"}`}
                    >
                      <button type="button" onClick={h.column.getToggleSortingHandler()} className="inline-flex min-h-8 items-center gap-1 uppercase">
                        <table.FlexRender header={h} />
                        <span aria-hidden="true">{sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : ""}</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className={`px-2 py-2.5 ${RIGHT.has(cell.column.id) ? "text-right" : ""}`}>
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-2 py-6 text-center text-muted">
                  No repo matches “{filter}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
