import { EnvSchema, type Env } from "./schema.js";
import type { AuthConfig, Config } from "./types.js";

export type { AuthConfig, Config } from "./types.js";

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed: Env = EnvSchema.parse(env);

  // Strip trailing slash so we can do `${baseUrl}/api/v1/...` cleanly.
  const baseUrl = parsed.PROMETHEUS_URL.replace(/\/+$/, "");

  return {
    baseUrl,
    timeoutMs: parsed.PROMETHEUS_TIMEOUT_MS,
    auth: resolveAuth(parsed),
  };
}

function resolveAuth(env: Env): AuthConfig {
  if (env.PROMETHEUS_BEARER_TOKEN) {
    return { kind: "bearer", token: env.PROMETHEUS_BEARER_TOKEN };
  }
  if (env.PROMETHEUS_USERNAME && env.PROMETHEUS_PASSWORD) {
    return {
      kind: "basic",
      username: env.PROMETHEUS_USERNAME,
      password: env.PROMETHEUS_PASSWORD,
    };
  }
  return { kind: "none" };
}
