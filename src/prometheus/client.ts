import type { Config } from "../config/types.js";
import { PromError } from "./errors.js";
import { get } from "./http.js";
import type {
  PromAlert,
  PromQueryResult,
  PromTargets,
} from "./types.js";

// Typed wrapper around the Prometheus HTTP API v1.
// One thin method per endpoint — transport details live in `./http.ts`.
export class PrometheusClient {
  constructor(private readonly cfg: Config) {}

  // GET /api/v1/query
  query(promql: string, time?: string): Promise<PromQueryResult> {
    const params = new URLSearchParams({ query: promql });
    if (time) params.set("time", time);
    return get<PromQueryResult>(this.cfg, "/api/v1/query", params);
  }

  // GET /api/v1/query_range
  queryRange(
    promql: string,
    start: string,
    end: string,
    step: string,
  ): Promise<PromQueryResult> {
    const params = new URLSearchParams({ query: promql, start, end, step });
    return get<PromQueryResult>(this.cfg, "/api/v1/query_range", params);
  }

  // GET /api/v1/label/__name__/values — every metric name in the TSDB.
  listMetricNames(
    match?: string[],
    start?: string,
    end?: string,
  ): Promise<string[]> {
    const params = new URLSearchParams();
    for (const m of match ?? []) params.append("match[]", m);
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    return get<string[]>(this.cfg, "/api/v1/label/__name__/values", params);
  }

  // GET /api/v1/labels — every label key.
  listLabels(match?: string[]): Promise<string[]> {
    const params = new URLSearchParams();
    for (const m of match ?? []) params.append("match[]", m);
    return get<string[]>(this.cfg, "/api/v1/labels", params);
  }

  // GET /api/v1/series — series matching the selectors.
  async series(
    match: string[],
    start?: string,
    end?: string,
  ): Promise<Array<Record<string, string>>> {
    if (match.length === 0) {
      throw new PromError("series requires at least one match[] selector", 400);
    }
    const params = new URLSearchParams();
    for (const m of match) params.append("match[]", m);
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    return get<Array<Record<string, string>>>(this.cfg, "/api/v1/series", params);
  }

  // GET /api/v1/alerts — currently active alerts.
  alerts(): Promise<{ alerts: PromAlert[] }> {
    return get<{ alerts: PromAlert[] }>(
      this.cfg,
      "/api/v1/alerts",
      new URLSearchParams(),
    );
  }

  // GET /api/v1/targets — scrape target discovery state.
  targets(state?: "active" | "dropped" | "any"): Promise<PromTargets> {
    const params = new URLSearchParams();
    if (state) params.set("state", state);
    return get<PromTargets>(this.cfg, "/api/v1/targets", params);
  }
}
