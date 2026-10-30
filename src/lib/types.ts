// Shape of the decrypted dashboard data (written by repo-monitor, sentinel/dashboard.py).
export type EncryptedBlob = { v: 1; alg: string; kdf: string; iter: number; salt: string; iv: string; ct: string };

export type SiteRow = {
  host: string; url: string; ok: boolean; status: number; error: string | null; ms: number;
  uptime: number | null; history: number[];
};
export type RepoRow = {
  name: string; private: boolean; stars: number; forks: number; openIssues: number; starsDelta: number;
  security: { serious: number; secrets: number; dependabot: number | null } | null; url: string;
};
export type ChangeRow = { repo: string; kind: "Issue" | "PR"; number: number; title: string; state: string; by: string; url: string; updatedAt: string };
export type SecurityRow = { repo: string; kind: "dependabot" | "secret"; severity: string; what: string | null; summary: string; url: string };
export type Downloads = Record<"npm" | "pypi", Record<string, { week: number | null; history: number[] }>>;

export type DashboardData = {
  v: 1;
  user: string;
  generatedAt: string;
  summary: { sitesUp: number; sitesTotal: number; changes: number | null; newStarsThisWeek: number; securityIssues: number | null; npmWeek: number };
  alerts: string[];
  ai: { text: string; model: string | null; at: string } | null;
  sites: SiteRow[];
  repos: RepoRow[];
  changes: ChangeRow[];
  security: SecurityRow[];
  downloads: Downloads;
  xerj: { ok: boolean; url: string; corpora: number | null; found: string[] | null; stars: number | null } | null;
};
