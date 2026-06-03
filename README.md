# prometheus-mcp

> An [MCP](https://modelcontextprotocol.io) server that lets Claude (or any MCP-compatible client) write and run PromQL against Prometheus.

[![Node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js)](https://nodejs.org)
[![MCP](https://img.shields.io/badge/MCP-1.x-blue)](https://modelcontextprotocol.io)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Stop context-switching between Claude and Grafana. Ask "what's the 95th-percentile request latency on the checkout service over the last hour?" and let the model compose the PromQL, run it, and reason about the result.

---

## Features

- **Run PromQL** — instant queries (`query`) and range queries (`query_range`).
- **Discover metrics** — `list_metrics`, `labels`, `series` for cardinality exploration.
- **Alerts & targets** — `get_alerts` and `get_targets` for instant ops context.
- **Read-only by design** — there is no write/admin tool. Safe to point at production.
- **Auth-flexible** — none, Bearer token, or HTTP Basic via environment variables.
- **Typed + tested** — strict TypeScript, Zod-validated inputs, Vitest test suite.
- **One-command demo** — `docker compose up` boots Prometheus + node-exporter for instant trying.

---

## Tools

| Tool           | Purpose                                                                     |
| -------------- | --------------------------------------------------------------------------- |
| `query`        | Evaluate PromQL at a single point in time (default: now).                   |
| `query_range`  | Evaluate PromQL over a `[start, end]` range at `step` resolution.           |
| `list_metrics` | List metric names, with optional substring filter and selector scoping.     |
| `get_alerts`   | All currently firing / pending alerts.                                      |
| `get_targets`  | Scrape target health — what's `up`, what's `down`, what went wrong.         |
| `series`       | Return full label sets for series matching one or more selectors.           |
| `labels`       | List label keys present in the TSDB (optionally scoped by selectors).       |

Every tool returns **both** a human-readable summary (for the model to reason over) and a `structuredContent.data` payload (the raw Prometheus JSON, for programmatic consumers).

---

## Quickstart

### 1. Install

```bash
git clone https://github.com/zahidhasann88/prometheus-mcp.git
cd prometheus-mcp
npm install
npm run build
```

### 2. Boot a local Prometheus (optional — for the demo)

```bash
docker compose up -d prometheus node-exporter
# Prometheus UI: http://localhost:9090
```

### 3. Wire it into Claude Desktop

Add this block to `claude_desktop_config.json` (location varies by OS — see the [Claude Desktop docs](https://modelcontextprotocol.io/quickstart/user)):

```json
{
  "mcpServers": {
    "prometheus": {
      "command": "node",
      "args": ["/absolute/path/to/prometheus-mcp/dist/index.js"],
      "env": {
        "PROMETHEUS_URL": "http://localhost:9090"
      }
    }
  }
}
```

Restart Claude Desktop. Ask: *"What's the CPU usage on my node-exporter target right now?"*

---

## Configuration

All configuration is via environment variables — see [`.env.example`](.env.example).

| Variable                  | Required | Default | Notes                                                      |
| ------------------------- | -------- | ------- | ---------------------------------------------------------- |
| `PROMETHEUS_URL`          | ✅       | —       | Base URL, e.g. `http://localhost:9090`.                    |
| `PROMETHEUS_BEARER_TOKEN` | —        | —       | Bearer auth (Grafana Cloud, AMP). Mutually exclusive with basic. |
| `PROMETHEUS_USERNAME`     | —        | —       | Basic auth username (must pair with `_PASSWORD`).          |
| `PROMETHEUS_PASSWORD`     | —        | —       | Basic auth password.                                       |
| `PROMETHEUS_TIMEOUT_MS`   | —        | `30000` | Per-request timeout.                                       |
| `LOG_LEVEL`               | —        | `info`  | `debug` \| `info` \| `warn` \| `error` (stderr).            |

Config errors fail fast at startup with a readable message — no surprises mid-session.

---

## Development

```bash
npm run dev      # tsx watch on src/index.ts
npm run build    # tsc → dist/
npm run test     # vitest run
npm run lint     # tsc --noEmit
```

The MCP server speaks JSON-RPC over **stdio** — all diagnostic logs go to **stderr** so they never corrupt the protocol stream.

### Manual smoke test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
# (set PROMETHEUS_URL in the inspector's env panel)
```

---

## Docker

Run the server itself in a container:

```bash
docker build -t prometheus-mcp .
docker run --rm -i \
  -e PROMETHEUS_URL=http://host.docker.internal:9090 \
  prometheus-mcp
```

Or use the demo stack — Prometheus, node-exporter, and the MCP server, all wired together:

```bash
docker compose up -d
```

---

## Security model

This server is **deliberately read-only**. It exposes no admin, lifecycle, or TSDB-mutating endpoints — even if the Prometheus instance has them enabled. If you give the model a token, it can only *read*.

Recommendations:

- **Scope your tokens** — point at a Prometheus read replica or a frontend like Cortex with a read-only API key.
- **Don't bake secrets into source** — pass `PROMETHEUS_BEARER_TOKEN` via the MCP client's `env` block, environment, or a secret manager.
- **Use TLS** — the client honours `https://` URLs and standard Node TLS verification.

---

## Architecture

```
src/
├── index.ts            # entrypoint (~20 LOC)
├── bootstrap/          # process lifecycle: signals, uncaught errors, config-error reporter
├── config/             # env → typed Config (Zod schema, auth resolver)
├── logger/             # structured JSON logger → stderr (level-filtered)
├── prometheus/         # API v1 client — types, errors, auth, http transport, client
├── formatters/         # one file per response shape (query, metrics, alerts, targets)
├── server/             # buildServer/startServer, shared Zod schemas, ToolResult helpers
└── tools/              # one file per MCP tool — pluggable ToolRegistrar contract
```

Design principles:
1. **Fail fast at the edge** — config errors surface at boot, input errors surface in the tool response.
2. **Stdout is sacred** — only protocol frames; logs always go to stderr.
3. **Two-channel output** — every tool emits both prose (for the model) and structured JSON (for code).
4. **No silent truncation** — when output is capped, the count of dropped items is shown.
5. **One responsibility per file** — every file is small and focused. Adding a new tool = new file in `tools/` + one line in `tools/index.ts`.

---

## References

- [Prometheus HTTP API](https://prometheus.io/docs/prometheus/latest/querying/api/)
- [Model Context Protocol spec](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

---

## License

MIT © Zahid Hasan
