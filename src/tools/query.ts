import { fail, ok } from "../server/result.js";
import { PromQLSchema, TimeSchema } from "../server/schemas.js";
import { formatQueryResult } from "../formatters/index.js";
import type { ToolRegistrar } from "./types.js";

const inputSchema = {
  promql: PromQLSchema.describe(
    "PromQL expression, e.g. `up` or `rate(http_requests_total[5m])`.",
  ),
  time: TimeSchema.optional().describe("Evaluation time. Defaults to now."),
};

export const registerQueryTool: ToolRegistrar = (server, client) => {
  server.registerTool(
    "query",
    {
      title: "Run an instant PromQL query",
      description:
        "Evaluate a PromQL expression at a single point in time. Returns the " +
        "current value(s) for the matching series. Use this for 'what is X right now'.",
      inputSchema,
    },
    async ({ promql, time }) => {
      try {
        const data = await client.query(promql, time);
        return ok(formatQueryResult(data), data);
      } catch (e) {
        return fail(e);
      }
    },
  );
};
