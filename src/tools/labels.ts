import { z } from "zod";
import { formatLabelKeys } from "../formatters/index.js";
import { fail, ok } from "../server/result.js";
import type { ToolRegistrar } from "./types.js";

const inputSchema = {
  match: z
    .array(z.string())
    .optional()
    .describe("Optional series selectors to scope which label keys are returned."),
};

export const registerLabelsTool: ToolRegistrar = (server, client) => {
  server.registerTool(
    "labels",
    {
      title: "List label keys",
      description: "List every label key present in the TSDB (optionally scoped by match[]).",
      inputSchema,
    },
    async ({ match }) => {
      try {
        const data = await client.listLabels(match);
        return ok(formatLabelKeys(data), { labels: data });
      } catch (e) {
        return fail(e);
      }
    },
  );
};
