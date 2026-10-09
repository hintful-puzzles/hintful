/**
 * **A departure from a shared role is stated at the assignment.**
 *
 * The audit found seventeen games with seventeen "deliberately different"
 * cursors and read that as seventeen decisions; it was one decision plus a
 * handful of collisions, and only some of the collisions said so. This guard
 * reads every game's palette source and, for each slot whose *name* says what it
 * means — a cursor, a held or dragged item, a hint mark, a mistake — requires
 * either the shared role or a reason on the assignment line or the line above
 * it.
 *
 * Keyed on the slot's index name because that is the only shape a palette
 * assignment has: `out[COL_CURSOR] = X` carries its meaning in `COL_CURSOR` and
 * nowhere else. A game that names a cursor slot something without "CURSOR" in it
 * is not seen here: that is a naming question, not a color one.
 *
 * Three meanings the palette has a role for are left out, because no slot name
 * says them. `COL_DONE` is a retired clue in Towers and the rim of the solved
 * flash in Spokes; `COL_CORRECT` is a finished region in Rect and half of
 * Guess's `COL_CORRECTPLACE`, a feedback peg; and a black or a white piece is
 * `COL_BLACK` in one game and `COL_MINE` in the next. A check keyed on those
 * names would ask a reason of an assignment that departs from nothing.
 */
import { describe, expect, it } from "vitest";
import { registeredGameIds } from "../registry.ts";
import { colorToOKLCH } from "../testing/oklch.ts";
import type { Color } from "../types.ts";
import "../../games/index.ts";
import * as colors from "./colors.ts";
import * as palette from "./palette.ts";

const sourceModules = import.meta.glob<string>("../../games/**/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** A meaning, the slot names that say it, and the role(s) that cover it. */
const ROLES: Record<string, { slot: RegExp; roles: readonly string[] }> = {
  cursor: { slot: /CURSOR/, roles: ["CURSOR"] },
  held: { slot: /HELD/, roles: ["HELD"] },
  // A drag's origin is the thing picked up, so HELD covers a DRAG slot too.
  drag: { slot: /DRAG/, roles: ["DRAG_ADD", "DRAG_REMOVE", "HELD"] },
  hint: {
    slot: /HINT/,
    roles: [
      "HINT_ACTION",
      "HINT_EVIDENCE",
      "HINT_EVIDENCE_WASH",
      "HINT_BLACKREF",
      "HINT_WHITEREF",
    ],
  },
  mistake: { slot: /ERR|MISTAKE|WRONG/, roles: ["ERROR", "ERROR_TEXT", "ERROR_WASH"] },
};

interface Assignment {
  file: string;
  slot: string;
  value: string;
  line: number;
  explained: boolean;
}

/** `out[COL_X] = value;` / `ret[COL_X] = value;` — a palette assignment. */
const ASSIGNMENT =
  /^\s*(?:out|ret|colors|palette)\[(COL_[A-Z0-9_]+)\]\s*=\s*(.+?);\s*(\/\/.*)?$/;

/** `value, // COL_X ...` — the positional form five games use (Bridges,
 * Fifteen, Sixteen, Pegs, Untangle), where the slot is named in the trailing
 * comment. That comment is the *label*, not a reason: only text beyond the
 * label counts as one. */
const POSITIONAL = /^\s*([^/]+?),\s*\/\/\s*(?:\d+\s+)?(COL_[A-Z0-9_]+)(.*)$/;

function assignments(): Assignment[] {
  const found: Assignment[] = [];
  for (const [file, source] of Object.entries(sourceModules)) {
    if (file.endsWith(".test.ts")) continue;
    const lines = source.split("\n");
    lines.forEach((text, i) => {
      const previous = lines[i - 1] ?? "";
      const previousIsComment = /^\s*\/\//.test(previous) || /\*\/\s*$/.test(previous);
      const m = ASSIGNMENT.exec(text);
      if (m) {
        const [, slot, value, trailing] = m;
        const explained =
          trailing !== undefined || previousIsComment || /\/\*/.test(text);
        found.push({ file, slot, value, line: i + 1, explained });
        return;
      }
      const p = POSITIONAL.exec(text);
      if (p) {
        const [, value, slot, rest] = p;
        const explained =
          /\S/.test(rest.replace(/^\s*(\(.*?\))?\s*$/, "")) || previousIsComment;
        found.push({ file, slot, value: value.trim(), line: i + 1, explained });
      }
    });
  }
  return found;
}

describe("a departure from a shared role is stated at the assignment", () => {
  const all = assignments();
  const byRole = Object.entries(ROLES).map(([meaning, { slot, roles }]) => ({
    meaning,
    roles,
    slots: all.filter((a) => slot.test(a.slot)),
  }));

  it("finds the game sources and the meaningful slots at all", () => {
    // An unmatched glob yields `{}` and every assertion below passes over
    // nothing. Every registered game contributes at least one assignment,
    // including the ones that build their palette positionally, which the
    // first shape alone could not see.
    const games = new Set(all.map((a) => a.file.split("/")[3]));
    expect([...games].sort()).toEqual(registeredGameIds().sort());
    // Each meaning is found under its slot name, and found holding its role:
    // a name that matched nothing, or a value the comparison below could not
    // recognize, would leave that meaning unchecked or every game in breach.
    for (const { meaning, roles, slots } of byRole)
      expect(
        slots.some((a) => roles.includes(a.value)),
        `no ${meaning} slot holds its role`,
      ).toBe(true);
  });

  it("gives no mark the hue of a pair color the same board paints", () => {
    // The pair keeps off the hues of the *shared* marks (`palette.test.ts`),
    // and a departure can put a mark back on one: a purple cursor ring on the
    // purple wash of a finished region stands a hue of nothing apart from it.
    // So a game that takes the pair, a role defined over it or one of its
    // washes gives no slot named for a mark a color in either of its hues.
    const hue = (c: Color): number => colorToOKLCH(c)[2];
    const pairHued = Object.entries(colors)
      .filter(
        (entry): entry is [string, Color] =>
          Array.isArray(entry[1]) &&
          entry[1].length === 3 &&
          entry[1].every((channel) => typeof channel === "number"),
      )
      .filter(([, color]) => colors.TWO.some((member) => hue(member) === hue(color)))
      .map(([name]) => name);
    // Vacuity: the pair's own two names are among them.
    expect(pairHued.length).toBeGreaterThanOrEqual(colors.TWO.length);
    const overPair = Object.entries(palette)
      .filter(([, value]) =>
        [...colors.TWO, ...colors.TWO_WASH].some((member) => member === value),
      )
      .map(([name]) => name);
    expect(overPair).toContain("REGION_DONE");
    const takesPair = new RegExp(
      `\\b(${["TWO", "TWO_WASH", ...overPair].join("|")})\\b`,
    );

    const marks = Object.values(ROLES).map(({ slot }) => slot);
    const swallowed = all
      .filter((a) => marks.some((slot) => slot.test(a.slot)))
      .filter((a) => pairHued.includes(a.value))
      .filter((a) => {
        const game = a.file.split("/")[3];
        return Object.entries(sourceModules).some(
          ([file, source]) =>
            file.split("/")[3] === game &&
            !file.endsWith(".test.ts") &&
            takesPair.test(source.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, "")),
        );
      });
    expect(
      swallowed.map(
        (a) => `${a.file.replace("../../games/", "")}:${a.line} ${a.slot} = ${a.value}`,
      ),
    ).toEqual([]);
  });

  it.each(byRole)("$meaning: the role, or a reason", ({ roles, slots }) => {
    const unexplained = slots.filter(
      (a) => !roles.some((r) => a.value === r) && !a.explained,
    );
    expect(
      unexplained.map(
        (a) => `${a.file.replace("../../games/", "")}:${a.line} ${a.slot} = ${a.value}`,
      ),
    ).toEqual([]);
  });
});
