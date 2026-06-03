export type Level = "debug" | "info" | "warn" | "error";

export const ORDER: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export function currentLevel(): Level {
  const raw = (process.env.LOG_LEVEL ?? "info").toLowerCase();
  if (raw in ORDER) return raw as Level;
  return "info";
}

export function shouldLog(level: Level): boolean {
  return ORDER[level] >= ORDER[currentLevel()];
}
