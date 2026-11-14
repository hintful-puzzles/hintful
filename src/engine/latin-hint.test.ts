/** Shared Latin-family hint helpers: a hidden single's line, and the
 * row/column games' shared narration. */
import { describe, expect, it } from "vitest";
import { candidateConclusions, latinPremise, narrateLatinReason } from "./hint-text.ts";
import { markKeys, type Narration } from "./hint-words.ts";
import { hiddenSingleLine } from "./latin-hint.ts";

describe("hiddenSingleLine", () => {
  it("returns the whole row or column", () => {
    expect(hiddenSingleLine("row", 2, 4)).toEqual([
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
    ]);
    expect(hiddenSingleLine("col", 1, 4)).toEqual([
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
    ]);
  });
});

describe("narrateLatinReason and latinPremise (shared row/column-game narration)", () => {
  const keys = (n: Narration): string[] => [...markKeys(n.refs)].sort();

  it("narrates each generic placement arm with the shared wording, bound to its marks", () => {
    const single = narrateLatinReason({ kind: "single" }, { x: 1, y: 2, n: 3 }, 4);
    expect(single.text).toBe(
      "Every other number has been ruled out in this square, so it can only be 3.",
    );
    expect(keys(single)).toEqual(["ring|cell|1,2"]);
    const hidden = narrateLatinReason(
      { kind: "hiddenSingle", n: 2, line: "col", index: 1 },
      { x: 1, y: 0, n: 2 },
      3,
    );
    expect(hidden.text).toBe(
      "No other square in this column can be 2, so this square must be 2.",
    );
    // "this column" stripes the whole column; "this square" rings the one.
    expect(keys(hidden)).toEqual([
      "ring|cell|1,0",
      "stripes|cell|1,0",
      "stripes|cell|1,1",
      "stripes|cell|1,2",
    ]);
    expect(() =>
      narrateLatinReason({ kind: "dup", n: 1, px: 0, py: 0 }, { x: 0, y: 0, n: 1 }, 3),
    ).toThrow(/latinPremise/);
  });

  it("gives each generic strike arm a premise the walk concludes", () => {
    const struck = (...ns: number[]) => ns.map((n) => ({ x: 2, y: 2, n }));
    const dup = latinPremise({ kind: "dup", n: 1, px: 0, py: 2 }, struck(1));
    expect(dup.premise.text).toBe(
      "The 1 just placed can't repeat in its row and column",
    );
    // The value just placed is outlined: it is what the cull reasons from.
    expect(keys(dup.premise)).toEqual(["outline|cell|0,2"]);
    expect(dup.where).toBe("from the other squares");
    const set = latinPremise(
      {
        kind: "set",
        cells: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
      },
      struck(3, 2, 3),
    );
    expect(set.premise.text).toBe(
      "The outlined squares already account for 2 and 3 between them",
    );
    expect(() => latinPremise({ kind: "single" }, struck(3))).toThrow(
      /narrateLatinReason/,
    );
  });

  it("concludes by the move: a strike, a placement, or the values left", () => {
    const say = candidateConclusions({ value: String });
    // The reference names the struck values, a value struck in two cells
    // once, and what follows it says they go.
    const said = (ns: number[], how: Parameters<typeof say.strike>[0]): string => {
      const { what, after } = say.strike(how);
      return `[${what(ns)}] ${after}`;
    };
    expect(said([4, 2, 4], {})).toBe("[2 and 4] must go");
    expect(said([3], {})).toBe("[the 3] must go");
    expect(said([5], { where: "from the other cells" })).toBe(
      "[the 5] must go from the other cells",
    );
    expect(said([5], { where: "beyond that" })).toBe("[the 5 beyond that] must go");
    expect(said([1, 2], { struck: "its identity marks" })).toBe(
      "[its identity marks] must go",
    );
    expect(say.place(3)).toBe("must be 3");
    expect(say.keep([1, 5])).toBe("can only be 1 or 5");
  });
});
