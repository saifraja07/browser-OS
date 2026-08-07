import { COMMANDS } from './commands.js';

/** Splits a command line into tokens, respecting simple double-quoted strings. */
export function tokenize(line) {
  const tokens = [];
  const regex = /"([^"]*)"|(\S+)/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    tokens.push(match[1] ?? match[2]);
  }
  return tokens;
}

/**
 * Executes a raw command line against the given context.
 * Returns an array of output lines. Never throws — errors are returned
 * as a single-element array prefixed for the UI to style as an error,
 * distinguished via the `isError` flag on the result.
 */
export async function executeLine(line, ctx) {
  const trimmed = line.trim();
  if (!trimmed) return { lines: [], isError: false };

  const [name, ...args] = tokenize(trimmed);
  const command = COMMANDS[name];

  if (!command) {
    return { lines: [`command not found: ${name} (try "help")`], isError: true };
  }

  try {
    const lines = await command.run(args, ctx);
    return { lines: lines ?? [], isError: false };
  } catch (err) {
    return { lines: [err.message ?? String(err)], isError: true };
  }
}
