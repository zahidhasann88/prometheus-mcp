import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Config } from "../src/config/index.js";
import { PromError, PrometheusClient } from "../src/prometheus/index.js";

const baseCfg: Config = {
  baseUrl: "http://prom:9090",
  timeoutMs: 5000,
  auth: { kind: "none" },
};

function mockFetch(response: unknown, init: Partial<Response> = {}) {
  const fn = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(response), {
      status: init.status ?? 200,
      headers: { "content-type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("PrometheusClient", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("parses a successful instant query", async () => {
    mockFetch({
      status: "success",
      data: {
        resultType: "vector",
        result: [{ metric: { __name__: "up" }, value: [1700000000, "1"] }],
      },
    });

    const c = new PrometheusClient(baseCfg);
    const r = await c.query("up");
    expect(r.resultType).toBe("vector");
    if (r.resultType === "vector") {
      expect(r.result[0]?.value[1]).toBe("1");
    }
  });

  it("throws PromError on error envelope", async () => {
    mockFetch(
      { status: "error", errorType: "bad_data", error: "invalid PromQL" },
      { status: 400 },
    );
    const c = new PrometheusClient(baseCfg);
    await expect(c.query("garbage{")).rejects.toMatchObject({
      name: "PromError",
      errorType: "bad_data",
      httpStatus: 400,
    });
  });

  it("sends bearer auth header", async () => {
    const f = mockFetch({ status: "success", data: [] });
    const c = new PrometheusClient({
      ...baseCfg,
      auth: { kind: "bearer", token: "tok123" },
    });
    await c.listMetricNames();
    const call = f.mock.calls[0];
    expect(call).toBeDefined();
    const headers = call![1].headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer tok123");
  });

  it("sends basic auth header", async () => {
    const f = mockFetch({ status: "success", data: [] });
    const c = new PrometheusClient({
      ...baseCfg,
      auth: { kind: "basic", username: "u", password: "p" },
    });
    await c.listLabels();
    const call = f.mock.calls[0];
    const headers = call![1].headers as Record<string, string>;
    expect(headers["Authorization"]).toBe(
      "Basic " + Buffer.from("u:p").toString("base64"),
    );
  });

  it("posts to /api/v1/query with form body", async () => {
    const f = mockFetch({ status: "success", data: { resultType: "scalar", result: [0, "0"] } });
    const c = new PrometheusClient(baseCfg);
    await c.query("vector(1)", "1700000000");

    const [url, init] = f.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://prom:9090/api/v1/query");
    expect(init.method).toBe("POST");
    const body = init.body as string;
    expect(body).toContain("query=vector%281%29");
    expect(body).toContain("time=1700000000");
  });

  it("retries 5xx then succeeds", async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce(new Response("boom", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "success", data: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", f);

    const c = new PrometheusClient(baseCfg);
    const r = await c.listLabels();
    expect(r).toEqual([]);
    expect(f).toHaveBeenCalledTimes(2);
  });

  it("rejects series() with no selectors", async () => {
    const c = new PrometheusClient(baseCfg);
    await expect(c.series([])).rejects.toBeInstanceOf(PromError);
  });
});
