import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/index.js";

describe("loadConfig", () => {
  it("requires PROMETHEUS_URL", () => {
    expect(() => loadConfig({})).toThrow(/PROMETHEUS_URL/);
  });

  it("rejects malformed URLs", () => {
    expect(() => loadConfig({ PROMETHEUS_URL: "not-a-url" })).toThrow(/valid URL/);
  });

  it("strips trailing slash", () => {
    const cfg = loadConfig({ PROMETHEUS_URL: "http://prom:9090/" });
    expect(cfg.baseUrl).toBe("http://prom:9090");
  });

  it("defaults to no auth", () => {
    const cfg = loadConfig({ PROMETHEUS_URL: "http://prom:9090" });
    expect(cfg.auth).toEqual({ kind: "none" });
  });

  it("parses bearer token", () => {
    const cfg = loadConfig({
      PROMETHEUS_URL: "http://prom:9090",
      PROMETHEUS_BEARER_TOKEN: "abc",
    });
    expect(cfg.auth).toEqual({ kind: "bearer", token: "abc" });
  });

  it("parses basic auth", () => {
    const cfg = loadConfig({
      PROMETHEUS_URL: "http://prom:9090",
      PROMETHEUS_USERNAME: "u",
      PROMETHEUS_PASSWORD: "p",
    });
    expect(cfg.auth).toEqual({ kind: "basic", username: "u", password: "p" });
  });

  it("rejects basic auth with only username", () => {
    expect(() =>
      loadConfig({
        PROMETHEUS_URL: "http://prom:9090",
        PROMETHEUS_USERNAME: "u",
      }),
    ).toThrow(/together/);
  });

  it("rejects mixing bearer and basic", () => {
    expect(() =>
      loadConfig({
        PROMETHEUS_URL: "http://prom:9090",
        PROMETHEUS_BEARER_TOKEN: "abc",
        PROMETHEUS_USERNAME: "u",
        PROMETHEUS_PASSWORD: "p",
      }),
    ).toThrow(/either bearer/);
  });

  it("coerces timeout", () => {
    const cfg = loadConfig({
      PROMETHEUS_URL: "http://prom:9090",
      PROMETHEUS_TIMEOUT_MS: "5000",
    });
    expect(cfg.timeoutMs).toBe(5000);
  });
});
