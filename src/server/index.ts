import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Config } from "../config/index.js";
import { log } from "../logger/index.js";
import { PrometheusClient } from "../prometheus/index.js";
import { registerAllTools } from "../tools/index.js";

const SERVER_INFO = { name: "prometheus-mcp", version: "0.1.0" };

export function buildServer(cfg: Config): McpServer {
  const client = new PrometheusClient(cfg);
  const server = new McpServer(SERVER_INFO, { capabilities: { tools: {} } });
  registerAllTools(server, client);
  return server;
}

export async function startServer(cfg: Config): Promise<void> {
  const server = buildServer(cfg);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log.info("prometheus-mcp ready", { baseUrl: cfg.baseUrl, auth: cfg.auth.kind });
}
