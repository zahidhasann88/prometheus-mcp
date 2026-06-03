#!/usr/bin/env node
import { exitOnConfigError, installLifecycleHandlers } from "./bootstrap/lifecycle.js";
import { loadConfig } from "./config/index.js";
import { log } from "./logger/index.js";
import { startServer } from "./server/index.js";

async function main(): Promise<void> {
  let cfg;
  try {
    cfg = loadConfig();
  } catch (err) {
    exitOnConfigError(err);
  }
  installLifecycleHandlers();
  await startServer(cfg);
}

main().catch((err) => {
  log.error("fatal", { error: (err as Error).message, stack: (err as Error).stack });
  process.exit(1);
});
