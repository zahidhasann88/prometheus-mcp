// Barrel — single import surface for the Prometheus module.
export { PrometheusClient } from "./client.js";
export { PromError } from "./errors.js";
export type {
  PromAlert,
  PromInstantVector,
  PromQueryResult,
  PromRangeVector,
  PromScalar,
  PromString,
  PromTarget,
  PromTargets,
  PromValue,
} from "./types.js";
