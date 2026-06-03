import { formatAlerts } from "../formatters/index.js";
import { fail, ok } from "../server/result.js";
import type { ToolRegistrar } from "./types.js";

export const registerGetAlertsTool: ToolRegistrar = (server, client) => {
  server.registerTool(
    "get_alerts",
    {
      title: "List active alerts",
      description: "Get currently firing and pending Prometheus alerts.",
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.alerts();
        return ok(formatAlerts(data.alerts), data);
      } catch (e) {
        return fail(e);
      }
    },
  );
};
