// Shared helpers + display limits used across formatters.
// Truncation is INTENTIONAL — Claude doesn't need 10k samples to reason about
// a trend, and over-long tool results burn context.

export const LIMITS = {
  MAX_SERIES: 50,
  MAX_SAMPLES: 20,
  MAX_METRIC_NAMES: 200,
  MAX_SERIES_ROWS: 20,
  MAX_DOWN_TARGETS: 30,
} as const;

export function labels(m: Record<string, string>): string {
  const entries = Object.entries(m).map(([k, v]) => `${k}="${v}"`);
  return `{${entries.join(", ")}}`;
}

export function unixToIso(ts: number): string {
  return new Date(ts * 1000).toISOString();
}

export function truncationHint(total: number, shown: number, noun: string): string {
  return total > shown ? `\n  … and ${total - shown} more ${noun} (truncated)` : "";
}
