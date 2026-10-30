export const num = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("en-IN"));

export function ago(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 90) return "just now";
  const m = Math.round(s / 60);
  if (m < 90) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 36) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}

export function ist(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export function siteStatus(s: { ok: boolean; status: number; error: string | null; ms: number }): string {
  if (s.ok) return s.ms > 5000 ? "Slow" : "Up";
  if (s.error === "timeout") return "No answer";
  if (s.error) return "Unreachable";
  return `HTTP ${s.status}`;
}
