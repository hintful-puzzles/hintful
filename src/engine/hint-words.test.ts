import { describe, expect, it } from "vitest";
import {
  CELL,
  type MarkKind,
  type MarkRef,
  mark,
  markKeys,
  Narration,
  NOTE,
  phrase,
  pronoun,
  whole,
} from "./hint-words.ts";

const keysOf = (refs: readonly MarkRef[]): string[] => [...markKeys(refs)].sort();

describe("the falsifier's six forms, each without an escape", () => {
  it("deixis: 'this cell' promises a ring, and agrees in number", () => {
    const one = phrase`so ${mark.this("ring", CELL, [{ x: 1, y: 2 }], "cell")} must be 3.`;
    expect(one.text).toBe("so this cell must be 3.");
    expect(keysOf(one.refs)).toEqual(["ring|cell|1,2"]);

    const two = mark.this(
      "ring",
      CELL,
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      "cell",
    );
    expect(two.text).toBe("these cells");
  });

  it("quantifiers: a singular determiner keeps the noun singular", () => {
    const tiles = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
    ];
    expect(mark.the("outline", CELL, tiles, "tile", "either").text).toBe(
      "either outlined tile",
    );
    expect(mark.the("outline", CELL, tiles, "tile").text).toBe("the outlined tiles");
  });

  it("agreement: the pronoun counts the units a noun counts", () => {
    const notes = [
      { x: 2, y: 2, n: 1 },
      { x: 2, y: 2, n: 4 },
    ];
    expect(pronoun(NOTE, notes)).toBe("it");
    expect(pronoun(NOTE, [...notes, { x: 3, y: 2, n: 1 }])).toBe("them");
    expect(mark.this("ring", NOTE, notes, "cell").text).toBe("this cell");
  });

  it("parenthetical references name the role in brackets", () => {
    const n = phrase`Clue 2 is met by ${mark.paren("outline", CELL, [{ x: 0, y: 1 }], "its bulbs")}.`;
    expect(n.text).toBe("Clue 2 is met by its bulbs (outlined).");
    expect(keysOf(n.refs)).toEqual(["outline|cell|0,1"]);
  });

  it("continuation legs are narrations of their own", () => {
    const edge: MarkKind<{ i: number }> = { name: "edge", key: (e) => String(e.i) };
    const leg = phrase`…and ${mark.this("ring", edge, [{ i: 7 }], "edge")} must be a wall too.`;
    expect(leg.text).toBe("…and this edge must be a wall too.");
    expect(keysOf(leg.refs)).toEqual(["ring|edge|7"]);
  });

  it("the composed premise-so-conclusion sentence carries both halves' marks", () => {
    const cage = [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
    ];
    const premise = phrase`No way to make ${mark.this("stripes", whole(CELL), cage, "cage")} sum to 7 puts 2 in ${mark.this("ring", CELL, [{ x: 0, y: 0 }], "cell")}`;
    const conclusion = mark.as(
      "ring",
      NOTE,
      [{ x: 0, y: 0, n: 2 }],
      "we must cross out the 2",
    );
    const sentence = phrase`${premise}, so ${conclusion}.`;
    expect(sentence.text).toBe(
      "No way to make this cage sum to 7 puts 2 in this cell, so we must cross out the 2.",
    );
    expect(keysOf(sentence.refs)).toEqual([
      "ring|cell|0,0",
      "ring|note|0,0:2",
      "stripes|cell|0,0",
      "stripes|cell|0,1",
    ]);
  });
});

describe("the literal words may not say what a reference must", () => {
  it("refuses deixis and every mark adjective in a literal", () => {
    expect(() => phrase`In this row, 3 goes here.`).toThrow(/"this"/);
    expect(() => phrase`The striped row is full.`).toThrow(/striped/);
    expect(() => phrase`The shaded squares are dark.`).toThrow(/shaded/);
    expect(() => Narration.plain("these cells")).toThrow(/these/);
  });

  it("lints interpolated strings too, so an unconverted helper cannot slip in", () => {
    const helper = "in this cell";
    expect(() => phrase`2 goes ${helper}.`).toThrow(/"this"/);
  });

  it("refuses a reference that says another role's adjective (the Boats defect)", () => {
    const row = [{ x: 0, y: 3 }];
    expect(() => mark.as("ring", CELL, row, "the striped row")).toThrow(
      /ring reference/,
    );
    expect(mark.as("stripes", CELL, row, "the striped row").text).toBe(
      "the striped row",
    );
  });

  it("does not mistake a word containing a keyword for it", () => {
    expect(phrase`Thistles and outlinedness.`.text).toBe("Thistles and outlinedness.");
  });
});

describe("narrow", () => {
  const notes = [
    { x: 0, y: 0, n: 2 },
    { x: 0, y: 0, n: 4 },
  ];
  const conclusion = mark.as(
    "ring",
    NOTE,
    notes,
    (ms) => `we must cross out ${ms.map((m) => m.n).join(" and ")}`,
  );
  const sentence = phrase`${mark.this("ring", NOTE, notes, "cell").capitalized()} loses them, so ${conclusion}.`;

  it("re-renders the words a reference builds from its elements", () => {
    const narrowed = sentence.narrow((_r, _k, key) => key !== "0,0:2");
    expect(sentence.text).toBe("This cell loses them, so we must cross out 2 and 4.");
    expect(narrowed.text).toBe("This cell loses them, so we must cross out 4.");
    expect(keysOf(narrowed.refs)).toEqual(["ring|note|0,0:4"]);
  });

  it("keeps an emptied reference's words and drops its mark", () => {
    const empty = sentence.narrow(() => false);
    expect(empty.text).toBe(sentence.text);
    expect(empty.refs).toEqual([]);
  });
});
