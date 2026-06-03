import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PrometheusClient } from "../prometheus/index.js";
import { registerGetAlertsTool } from "./get-alerts.js";
import { registerGetTargetsTool } from "./get-targets.js";
import { registerLabelsTool } from "./labels.js";
import { registerListMetricsTool } from "./list-metrics.js";
import { registerQueryRangeTool } from "./query-range.js";
import { registerQueryTool } from "./query.js";
import { registerSeriesTool } from "./series.js";
import type { ToolRegistrar } from "./types.js";

// All tools registered in declaration order. Add new tools here.
const REGISTRARS: ToolRegistrar[] = [
  registerQueryTool,
  registerQueryRangeTool,
  registerListMetricsTool,
  registerGetAlertsTool,
  registerGetTargetsTool,
  registerSeriesTool,
  registerLabelsTool,
];

export function registerAllTools(server: McpServer, client: PrometheusClient): void {
  for (const register of REGISTRARS) register(server, client);
}
