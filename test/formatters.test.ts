import { describe, expect, it } from "vitest";
import {
  formatAlerts,
  formatMetricList,
  formatQueryResult,
  formatTargets,
} from "../src/formatters/index.js";

describe("formatters", () => {
  it("formats empty vectors", () => {
    expect(formatQueryResult({ resultType: "vector", result: [] })).toMatch(/empty/);
  });

  it("formats instant vector with labels", () => {
    const out = formatQueryResult({
      resultType: "vector",
      result: [
        { metric: { __name__: "up", job: "node" }, value: [1700000000, "1"] },
      ],
    });
    expect(out).toContain("up");
    expect(out).toContain('job="node"');
    expect(out).toContain("= 1");
  });

  it("formats matrix with samples", () => {
    const out = formatQueryResult({
      resultType: "matrix",
      result: [
        {
          metric: { __name__: "rate", job: "api" },
          values: [
            [1700000000, "0.5"],
            [1700000060, "0.6"],
          ],
        },
      ],
    });
    expect(out).toContain("range matrix");
    expect(out).toContain("0.5");
    expect(out).toContain("0.6");
  });

  it("truncates large metric lists", () => {
    const many = Array.from({ length: 250 }, (_, i) => `metric_${i}`);
    const out = formatMetricList(many);
    expect(out).toContain("250 metric(s)");
    expect(out).toContain("… and 50 more");
  });

  it("reports no alerts cleanly", () => {
    expect(formatAlerts([])).toMatch(/No active alerts/);
  });

  it("formats firing alerts", () => {
    const out = formatAlerts([
      {
        labels: { alertname: "HighCPU", instance: "node1" },
        annotations: { summary: "CPU > 90%" },
        state: "firing",
        activeAt: "2024-01-01T00:00:00Z",
        value: "92",
      },
    ]);
    expect(out).toContain("FIRING");
    expect(out).toContain("HighCPU");
    expect(out).toContain("CPU > 90%");
  });

  it("summarises target health", () => {
    const out = formatTargets({
      activeTargets: [
        {
          discoveredLabels: {},
          labels: {},
          scrapePool: "p",
          scrapeUrl: "http://x/metrics",
          globalUrl: "http://x/metrics",
          lastError: "",
          lastScrape: "",
          lastScrapeDuration: 0,
          health: "up",
        },
        {
          discoveredLabels: {},
          labels: {},
          scrapePool: "p",
          scrapeUrl: "http://y/metrics",
          globalUrl: "http://y/metrics",
          lastError: "connection refused",
          lastScrape: "",
          lastScrapeDuration: 0,
          health: "down",
        },
      ],
      droppedTargets: [],
    });
    expect(out).toContain("up: 1");
    expect(out).toContain("down: 1");
    expect(out).toContain("connection refused");
  });
});
