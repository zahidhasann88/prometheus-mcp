import { z } from "zod";

// Shared Zod fragments reused across tool input schemas.

// Prometheus accepts RFC3339 timestamps or unix seconds (with optional decimals).
export const TimeSchema = z
  .string()
  .min(1)
  .describe("RFC3339 timestamp (2024-01-15T10:00:00Z) or unix seconds (1705312800).");

// Step is `<float>` seconds or a duration string like `15s`, `1m`, `5m`, `1h`.
export const StepSchema = z
  .string()
  .regex(
    /^\d+(\.\d+)?(ms|s|m|h|d|w|y)?$/,
    "step must be seconds or a duration like 15s, 1m, 5m, 1h",
  );

export const PromQLSchema = z
  .string()
  .min(1, "PromQL expression cannot be empty")
  .max(10_000, "PromQL expression too large");
