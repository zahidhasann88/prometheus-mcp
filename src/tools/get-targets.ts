import { z } from "zod";
import { formatTargets } from "../formatters/index.js";
import { fail, ok } from "../server/result.js";
import type { ToolRegistrar } from "./types.js";

const inputSchema = {
  state: z
    .enum(["active", "dropped", "any"])
    .optional()
    .describe("Filter by target state. Defaults to `any`."),
};

export const registerGetTargetsTool: ToolRegistrar = (server, client) => {
  server.registerTool(
    "get_targets",
    {
      title: "List scrape targets",
      description:
        "Get scrape target status. Useful for diagnosing 'why is metric X missing' " +
        "— a down target explains a lot.",
      inputSchema,
    },
    async ({ state }) => {
      try {
        const data = await client.targets(state);
        return ok(formatTargets(data), data);
      } catch (e) {
        return fail(e);
      }
    },
  );
};
