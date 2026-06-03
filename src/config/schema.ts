import { z } from "zod";

// Env schema. Validated once at startup so the server fails fast and loud
// instead of breaking on the first tool call.
export const EnvSchema = z
  .object({
    PROMETHEUS_URL: z
      .string({ required_error: "PROMETHEUS_URL is required" })
      .url("PROMETHEUS_URL must be a valid URL (e.g. http://localhost:9090)"),
    PROMETHEUS_BEARER_TOKEN: z.string().min(1).optional(),
    PROMETHEUS_USERNAME: z.string().min(1).optional(),
    PROMETHEUS_PASSWORD: z.string().min(1).optional(),
    PROMETHEUS_TIMEOUT_MS: z.coerce.number().int().positive().max(600_000).default(30_000),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  })
  .superRefine((env, ctx) => {
    const hasUser = !!env.PROMETHEUS_USERNAME;
    const hasPass = !!env.PROMETHEUS_PASSWORD;
    if (hasUser !== hasPass) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PROMETHEUS_USERNAME and PROMETHEUS_PASSWORD must be set together",
      });
    }
    if (env.PROMETHEUS_BEARER_TOKEN && (hasUser || hasPass)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use either bearer token OR basic auth, not both",
      });
    }
  });

export type Env = z.infer<typeof EnvSchema>;
