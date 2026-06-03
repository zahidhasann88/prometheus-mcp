import { log } from "../logger/index.js";

// Wires up the process-wide signal + uncaught-exception handlers.
// Kept in its own module so index.ts stays declarative.
export function installLifecycleHandlers(): void {
  process.on("SIGINT", () => {
    log.info("received SIGINT, exiting");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    log.info("received SIGTERM, exiting");
    process.exit(0);
  });

  process.on("uncaughtException", (err) => {
    log.error("uncaught exception", { error: err.message, stack: err.stack });
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    log.error("unhandled rejection", { error: String(reason) });
    process.exit(1);
  });
}

// Report a configuration error in a human-readable way to stderr and exit 1.
export function exitOnConfigError(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`prometheus-mcp: configuration error\n${msg}\n`);
  process.exit(1);
}
