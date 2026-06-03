import type { AuthConfig } from "../config/types.js";

// Mutates `headers` in place with the appropriate Authorization header (if any).
export function applyAuth(
  auth: AuthConfig,
  headers: Record<string, string>,
): void {
  switch (auth.kind) {
    case "bearer":
      headers["Authorization"] = `Bearer ${auth.token}`;
      return;
    case "basic": {
      const creds = `${auth.username}:${auth.password}`;
      headers["Authorization"] = `Basic ${Buffer.from(creds).toString("base64")}`;
      return;
    }
    case "none":
      return;
  }
}
