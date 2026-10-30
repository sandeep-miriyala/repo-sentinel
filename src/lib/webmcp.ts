// WebMCP: after unlocking, an AI agent in this browser can read the dashboard through tools.
// Read-only. Only registered when the browser offers document.modelContext.
import type { DashboardData } from "./types";

type Tool = { name: string; description: string; inputSchema: object; annotations?: object; execute: () => unknown };
type ModelContext = { registerTool: (t: Tool, o?: { signal?: AbortSignal }) => Promise<void> | void };

const text = (value: unknown) => ({ content: [{ type: "text", text: JSON.stringify(value) }] });

export function registerWebMcp(data: DashboardData): (() => void) | undefined {
  const mc = (document as Document & { modelContext?: ModelContext }).modelContext;
  if (!mc?.registerTool) return undefined;
  const controller = new AbortController();
  const tools: Tool[] = [
    { name: "get_status", description: "Summary: sites up, new stars, security issues, downloads, last update time.", inputSchema: { type: "object", properties: {} }, execute: () => text({ ...data.summary, generatedAt: data.generatedAt, alerts: data.alerts }) },
    { name: "list_sites", description: "Each monitored website with status, response time and uptime.", inputSchema: { type: "object", properties: {} }, execute: () => text(data.sites.map(({ history: _h, ...s }) => s)) },
    { name: "list_repos", description: "The owner's repositories with stars, forks, open issues and security state.", inputSchema: { type: "object", properties: {} }, execute: () => text(data.repos) },
    { name: "list_recent_activity", description: "Issues and pull requests changed in the last 7 days.", inputSchema: { type: "object", properties: {} }, execute: () => text(data.changes) },
  ];
  for (const t of tools) {
    try {
      void mc.registerTool({ ...t, annotations: { readOnlyHint: true } }, { signal: controller.signal });
    } catch {
      /* one tool failing is fine */
    }
  }
  return () => controller.abort();
}
