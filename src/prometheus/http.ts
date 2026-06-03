import type { Config } from "../config/types.js";
import { log } from "../logger/index.js";
import { applyAuth } from "./auth.js";
import { PromError } from "./errors.js";
import type { Envelope } from "./types.js";

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = 250;

// Transport layer for the Prometheus HTTP API v1. Handles auth, timeout via
// AbortController, retries on 5xx with linear backoff, and unwraps the
// `{status, data}` envelope into either the data or a PromError.
//
// POST + form body is used so long PromQL queries don't blow URL length limits.
export async function get<T>(
  cfg: Config,
  path: string,
  params: URLSearchParams,
): Promise<T> {
  const url = `${cfg.baseUrl}${path}`;
  const body = params.toString();
  const headers = baseHeaders();
  applyAuth(cfg.auth, headers);

  let lastErr: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

    try {
      log.debug("prometheus request", { url, attempt, body_size: body.length });
      const res = await fetch(url, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });

      // 5xx → retry with backoff. 4xx → fail fast (won't get better).
      if (res.status >= 500 && attempt < MAX_ATTEMPTS) {
        const text = await res.text().catch(() => "");
        lastErr = new PromError(
          `Prometheus ${res.status}: ${text.slice(0, 200)}`,
          res.status,
        );
        log.warn("prometheus 5xx, retrying", { status: res.status, attempt });
        await sleep(BACKOFF_MS * attempt);
        continue;
      }

      const json = (await res.json()) as Envelope<T>;
      if (json.status === "error") {
        throw new PromError(json.error, res.status, json.errorType);
      }
      if (!res.ok) {
        throw new PromError(`HTTP ${res.status}`, res.status);
      }
      return json.data;
    } catch (err) {
      if (err instanceof PromError) throw err;
      if ((err as { name?: string }).name === "AbortError") {
        throw new PromError(`Request timed out after ${cfg.timeoutMs}ms`, 408);
      }
      lastErr = err;
      if (attempt >= MAX_ATTEMPTS) {
        throw new PromError(
          `Prometheus request failed: ${(err as Error).message}`,
          0,
        );
      }
      log.warn("prometheus request error, retrying", {
        attempt,
        error: (err as Error).message,
      });
      await sleep(BACKOFF_MS * attempt);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("unreachable");
}

function baseHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "User-Agent": "prometheus-mcp/0.1",
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
