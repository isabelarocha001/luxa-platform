/**
 * Structured logger for Luxa API routes and server code.
 *
 * Usage:
 *   const log = logger("create-subscription");
 *   log.info("start", { handle, userId });
 *   log.error("failed", { err: message });
 *
 * Never log: card data, client_secret, API keys, passwords.
 * See docs/DEVELOPMENT.md §4.
 */

type Fields = Record<string, unknown>;

function safeFields(fields?: Fields): Fields | undefined {
  if (!fields) return undefined;
  const out: Fields = {};
  for (const [k, v] of Object.entries(fields)) {
    const key = k.toLowerCase();
    if (
      key.includes("secret") ||
      key.includes("password") ||
      key.includes("card") ||
      key.includes("cvc") ||
      key.includes("authorization")
    ) {
      out[k] = "[redacted]";
      continue;
    }
    out[k] = v;
  }
  return out;
}

function line(
  level: string,
  scope: string,
  message: string,
  fields?: Fields,
) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    scope,
    message,
    ...safeFields(fields),
  };
  const text = JSON.stringify(payload);
  if (level === "error") console.error(text);
  else if (level === "warn") console.warn(text);
  else console.log(text);
}

export function logger(scope: string) {
  return {
    info: (message: string, fields?: Fields) =>
      line("info", scope, message, fields),
    warn: (message: string, fields?: Fields) =>
      line("warn", scope, message, fields),
    error: (message: string, fields?: Fields) =>
      line("error", scope, message, fields),
  };
}
