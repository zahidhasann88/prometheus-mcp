import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PrometheusClient } from "../prometheus/index.js";

// Every tool exports a `register(server, client)` that wires itself into the
// MCP server. Adding a new tool = new file + one line in tools/index.ts.
export type ToolRegistrar = (server: McpServer, client: PrometheusClient) => void;
