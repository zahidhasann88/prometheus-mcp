import type { PromTarget, PromTargets } from "../prometheus/index.js";
import { LIMITS } from "./shared.js";

export function formatTargets(t: PromTargets): string {
  const summary = summarize(t);
  const downLines = t.activeTargets
    .filter((x) => x.health !== "up")
    .slice(0, LIMITS.MAX_DOWN_TARGETS)
    .map(formatDownTarget);

  return downLines.length > 0
    ? `${summary}\n\nproblem targets:\n${downLines.join("\n")}`
    : summary;
}

function summarize(t: PromTargets): string {
  const up = t.activeTargets.filter((x) => x.health === "up").length;
  const down = t.activeTargets.filter((x) => x.health === "down").length;
  const unknown = t.activeTargets.filter((x) => x.health === "unknown").length;
  return `targets — up: ${up}  down: ${down}  unknown: ${unknown}  dropped: ${t.droppedTargets.length}`;
}

function formatDownTarget(x: PromTarget): string {
  const head = `  [${x.health}] ${x.scrapeUrl}  pool=${x.scrapePool}`;
  return x.lastError ? `${head}\n    error: ${x.lastError}` : head;
}
