/**
 * A line printed the moment it is reached, so a long run can be seen to move.
 *
 * Every tool here runs under vitest, which holds a file's `console` output
 * until the file ends and drops it from a passing file when the output is not
 * a terminal; a write to the process's own stream passes through as it comes
 * (vitest 5.0.5, 2026-11-19). `noConsole` in `biome.json` holds `research/`
 * to this.
 */
export function say(line: string): void {
  process.stderr.write(`${line}\n`);
}
