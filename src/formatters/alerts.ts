import type { PromAlert } from "../prometheus/index.js";
import { labels } from "./shared.js";

export function formatAlerts(alerts: PromAlert[]): string {
  if (alerts.length === 0) return "✅ No active alerts.";
  const lines = alerts.map(formatAlert);
  return `${alerts.length} alert(s):\n${lines.join("\n")}`;
}

function formatAlert(a: PromAlert): string {
  const name = a.labels["alertname"] ?? "(unnamed)";
  const summary = a.annotations["summary"] ?? a.annotations["description"] ?? "";
  return (
    `  [${a.state.toUpperCase()}] ${name}  ${labels(a.labels)}\n` +
    `    activeAt: ${a.activeAt}  value: ${a.value}\n` +
    `    ${summary}`
  );
}
