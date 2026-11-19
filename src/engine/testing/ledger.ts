/**
 * The assertion every cross-game ledger makes: the games a guard found are
 * exactly the ones its table excuses. A plain `toEqual` fails with a diff of
 * ids, and a porter who has never seen the guard learns from it neither which
 * table to open nor what an entry says. This names both (`docs/testing.md`
 * § "How a cross-game guard finds its population").
 *
 * Dev/test-only; never imported by production code.
 */
import { expect } from "vitest";

export interface LedgerSite {
  /** The table's name, as it is written in the guard. */
  readonly table: string;
  /** The guard's file, from the repository root. */
  readonly file: string;
  /** What the guard found, as a plural noun phrase: "games whose solved
   * board no input breaks". */
  readonly found: string;
  /** What to do about a game found and not in the table: fix it, or add the
   * entry with what reason. */
  readonly add: string;
  /** An entry's value as it is written, where it is not a quoted reason:
   * `"<params>:<desc>"`. `null` where the table takes no new entry. */
  readonly value?: string | null;
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/** Assert `found` equal to the keys of `table`, failing with a message that
 * names the table, its file, the line to add and the line to remove. */
export function expectLedger(
  found: readonly string[],
  table: Readonly<Record<string, unknown>>,
  site: LedgerSite,
): void {
  const have = new Set(found);
  const listed = Object.keys(table);
  const missing = [...have].filter((id) => !(id in table)).sort();
  const stale = listed.filter((id) => !have.has(id)).sort();
  const lines: string[] = [];
  if (missing.length > 0) {
    const key = IDENTIFIER.test(missing[0]) ? missing[0] : JSON.stringify(missing[0]);
    const value = site.value === undefined ? '"<reason>"' : site.value;
    lines.push(
      `${site.found}, not in ${site.table} (${site.file}): ${missing.join(", ")}.`,
      value === null
        ? `  ${site.add}.`
        : `  Either ${site.add}; an entry is \`${key}: ${value},\`.`,
    );
  }
  if (stale.length > 0)
    lines.push(
      `In ${site.table} (${site.file}) but no longer among ${site.found}: ${stale.join(", ")}.`,
      "  Remove each one's line.",
    );
  expect(lines, `\n${lines.join("\n")}\n`).toEqual([]);
}
