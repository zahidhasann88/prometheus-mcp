// Public Config shape. Kept separate from the Zod schema so consumers
// (tests, tool handlers) can import the type without pulling in zod.

export type AuthConfig =
  | { kind: "none" }
  | { kind: "bearer"; token: string }
  | { kind: "basic"; username: string; password: string };

export type Config = {
  baseUrl: string;
  timeoutMs: number;
  auth: AuthConfig;
};
