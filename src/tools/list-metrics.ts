import { z } from "zod";
import { formatMetricList } from "../formatters/index.js";
import { fail, ok } from "../server/result.js";
import type { ToolRegistrar } from "./types.js";

const inputSchema = {
  filter: z
    .string()
    .optional()
    .describe(
      "Case-insensitive substring filter applied to metric names client-side. " +
        "If omitted, returns all metrics.",
    ),
  match: z
    .array(z.string())
    .optional()
    .describe("Optional Prometheus series selectors to scope which metrics to list."),
};

export const registerListMetricsTool: ToolRegistrar = (server, client) => {
  server.registerTool(
    "list_metrics",
    {
      title: "List available metric names",
      description:
        "Discover what metrics this Prometheus instance has. Use a filter " +
        "substring to narrow down (e.g. 'http' to find HTTP-related metrics).",
      inputSchema,
    },
    async ({ filter, match }) => {
      try {
        const all = await client.listMetricNames(match);
        const filtered = filter
          ? all.filter((n) => n.toLowerCase().includes(filter.toLowerCase()))
          : all;
        return ok(formatMetricList(filtered), { metrics: filtered });
      } catch (e) {
        return fail(e);
      }
    },
  );
};
