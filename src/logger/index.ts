// Structured logger that writes to STDERR.
//
// IMPORTANT: MCP stdio transport reserves stdout for JSON-RPC frames.
// Any `console.log` would corrupt the protocol stream. All diagnostics go
// to stderr via this module.

import { shouldLog, type Level } from "./level.js";

function emit(level: Level, msg: string, fields?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;
  const record = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...(fields ?? {}),
  };
  process.stderr.write(JSON.stringify(record) + "\n");
}

export const log = {
  debug: (msg: string, fields?: Record<string, unknown>) => emit("debug", msg, fields),
  info: (msg: string, fields?: Record<string, unknown>) => emit("info", msg, fields),
  warn: (msg: string, fields?: Record<string, unknown>) => emit("warn", msg, fields),
  error: (msg: string, fields?: Record<string, unknown>) => emit("error", msg, fields),
};
