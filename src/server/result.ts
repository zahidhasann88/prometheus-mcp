import { log } from "../logger/index.js";
import { PromError } from "../prometheus/index.js";

// Standard tool-result shape. Every tool returns:
//   - `content[]`: human-readable text for the model
//   - `structuredContent.data` (optional): raw payload for programmatic consumers
//   - `isError`: true when something went wrong
export type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

export function ok(text: string, data?: unknown): ToolResult {
  const out: ToolResult = { content: [{ type: "text", text }] };
  if (data !== undefined) out.structuredContent = { data };
  return out;
}

export function fail(err: unknown): ToolResult {
  const msg =
    err instanceof PromError
      ? `Prometheus error${err.errorType ? ` (${err.errorType})` : ""}: ${err.message}`
      : err instanceof Error
        ? err.message
        : String(err);
  log.error("tool failed", { error: msg });
  return { content: [{ type: "text", text: msg }], isError: true };
}
