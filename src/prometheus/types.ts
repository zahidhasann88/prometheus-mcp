// Types mirror the Prometheus HTTP API v1 response envelope.
// Reference: https://prometheus.io/docs/prometheus/latest/querying/api/

export type PromValue = [number, string]; // [unix_ts, value as string]

export type PromInstantVector = {
  resultType: "vector";
  result: Array<{ metric: Record<string, string>; value: PromValue }>;
};

export type PromRangeVector = {
  resultType: "matrix";
  result: Array<{ metric: Record<string, string>; values: PromValue[] }>;
};

export type PromScalar = {
  resultType: "scalar";
  result: PromValue;
};

export type PromString = {
  resultType: "string";
  result: PromValue;
};

export type PromQueryResult =
  | PromInstantVector
  | PromRangeVector
  | PromScalar
  | PromString;

export type PromAlert = {
  labels: Record<string, string>;
  annotations: Record<string, string>;
  state: "pending" | "firing" | "inactive";
  activeAt: string;
  value: string;
};

export type PromTarget = {
  discoveredLabels: Record<string, string>;
  labels: Record<string, string>;
  scrapePool: string;
  scrapeUrl: string;
  globalUrl: string;
  lastError: string;
  lastScrape: string;
  lastScrapeDuration: number;
  health: "up" | "down" | "unknown";
};

export type PromTargets = {
  activeTargets: PromTarget[];
  droppedTargets: PromTarget[];
};

// HTTP envelope used by every Prometheus v1 endpoint.
export type Envelope<T> =
  | { status: "success"; data: T; warnings?: string[] }
  | { status: "error"; errorType: string; error: string };
