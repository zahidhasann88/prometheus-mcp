import type { PromQueryResult } from "../prometheus/index.js";
import { LIMITS, labels, truncationHint, unixToIso } from "./shared.js";

export function formatQueryResult(r: PromQueryResult): string {
  switch (r.resultType) {
    case "scalar":
    case "string":
      return formatPoint(r);
    case "vector":
      return formatVector(r);
    case "matrix":
      return formatMatrix(r);
  }
}

function formatPoint(r: { resultType: "scalar" | "string"; result: [number, string] }): string {
  const [ts, v] = r.result;
  return `${r.resultType} @ ${unixToIso(ts)}: ${v}`;
}

function formatVector(r: {
  resultType: "vector";
  result: Array<{ metric: Record<string, string>; value: [number, string] }>;
}): string {
  if (r.result.length === 0) return "(empty vector — query returned no series)";
  const shown = r.result.slice(0, LIMITS.MAX_SERIES);
  const lines = shown.map((s) => {
    const [ts, v] = s.value;
    return `  ${labels(s.metric)} = ${v}  @ ${unixToIso(ts)}`;
  });
  return (
    `instant vector: ${r.result.length} series\n` +
    lines.join("\n") +
    truncationHint(r.result.length, LIMITS.MAX_SERIES, "series")
  );
}

function formatMatrix(r: {
  resultType: "matrix";
  result: Array<{ metric: Record<string, string>; values: Array<[number, string]> }>;
}): string {
  if (r.result.length === 0) return "(empty matrix — query returned no series)";
  const shownSeries = r.result.slice(0, LIMITS.MAX_SERIES);

  const blocks = shownSeries.map((s) => {
    const samples = s.values.slice(0, LIMITS.MAX_SAMPLES);
    const sampleLines = samples.map(([ts, v]) => `    ${unixToIso(ts)}  ${v}`).join("\n");
    const moreSamples =
      s.values.length > LIMITS.MAX_SAMPLES
        ? `\n    … +${s.values.length - LIMITS.MAX_SAMPLES} more samples`
        : "";
    return `  ${labels(s.metric)}\n${sampleLines}${moreSamples}`;
  });

  return (
    `range matrix: ${r.result.length} series\n` +
    blocks.join("\n") +
    truncationHint(r.result.length, LIMITS.MAX_SERIES, "series")
  );
}
