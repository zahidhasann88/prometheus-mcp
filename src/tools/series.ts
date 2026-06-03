import { z } from "zod";
import { formatSeriesList } from "../formatters/index.js";
import { fail, ok } from "../server/result.js";
import { TimeSchema } from "../server/schemas.js";
import type { ToolRegistrar } from "./types.js";

const inputSchema = {
  match: z
    .array(z.string())
    .min(1)
    .describe("One or more Prometheus series selectors, e.g. `up{job=\"node\"}`."),
  start: TimeSchema.optional(),
  end: TimeSchema.optional(),
};

export const registerSeriesTool: ToolRegistrar = (server, client) => {
  server.registerTool(
    "series",
    {
      title: "Find series matching selectors",
      description:
        "Return the full label set for every series that matches the given " +
        "selector(s). Useful for exploring label cardinality.",
      inputSchema,
    },
    async ({ match, start, end }) => {
      try {
        const data = await client.series(match, start, end);
        return ok(formatSeriesList(data), { series: data });
      } catch (e) {
        return fail(e);
      }
    },
  );
};
