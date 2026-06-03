import { LIMITS } from "./shared.js";

export function formatMetricList(names: string[]): string {
  if (names.length === 0) return "(no metrics found)";
  const head = names.slice(0, LIMITS.MAX_METRIC_NAMES).join("\n");
  const more =
    names.length > LIMITS.MAX_METRIC_NAMES
      ? `\n… and ${names.length - LIMITS.MAX_METRIC_NAMES} more`
      : "";
  return `${names.length} metric(s):\n${head}${more}`;
}

export function formatSeriesList(series: Array<Record<string, string>>): string {
  if (series.length === 0) return "(no series matched)";
  const head = series
    .slice(0, LIMITS.MAX_SERIES_ROWS)
    .map((s) => "  " + JSON.stringify(s))
    .join("\n");
  const more =
    series.length > LIMITS.MAX_SERIES_ROWS
      ? `\n  … and ${series.length - LIMITS.MAX_SERIES_ROWS} more`
      : "";
  return `${series.length} series:\n${head}${more}`;
}

export function formatLabelKeys(keys: string[]): string {
  return `${keys.length} label key(s):\n  ${keys.join(", ")}`;
}
