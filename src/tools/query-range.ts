import { fail, ok } from "../server/result.js";
import { PromQLSchema, StepSchema, TimeSchema } from "../server/schemas.js";
import { formatQueryResult } from "../formatters/index.js";
import type { ToolRegistrar } from "./types.js";

const inputSchema = {
  promql: PromQLSchema.describe("PromQL expression to evaluate over a range."),
  start: TimeSchema.describe("Range start timestamp."),
  end: TimeSchema.describe("Range end timestamp."),
  step: StepSchema.describe("Resolution step, e.g. `15s`, `1m`, `5m`."),
};

export const registerQueryRangeTool: ToolRegistrar = (server, client) => {
  server.registerTool(
    "query_range",
    {
      title: "Run a range PromQL query",
      description:
        "Evaluate a PromQL expression over a time range. Returns a matrix of " +
        "samples — use this to plot, find spikes, or look at trends.",
      inputSchema,
    },
    async ({ promql, start, end, step }) => {
      try {
        const data = await client.queryRange(promql, start, end, step);
        return ok(formatQueryResult(data), data);
      } catch (e) {
        return fail(e);
      }
    },
  );
};
