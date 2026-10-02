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
  type Relation,
  type Said,
  sentence,
  so,
  unshaped,
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
    expect(() => phrase`The highlighted squares are dark.`).toThrow(/highlighted/);
    // A shading genre's cell state, not a mark (hint-words.ts's retired list).
    expect(phrase`The cell must be shaded.`.text).toBe("The cell must be shaded.");
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
    // Naming a note names the cell it is drawn in.
    expect(keysOf(narrowed.refs)).toEqual(["ring|cell|0,0", "ring|note|0,0:4"]);
  });

  it("keeps an emptied reference's words and drops its mark", () => {
    const empty = sentence.narrow(() => false);
    expect(empty.text).toBe(sentence.text);
    expect(empty.refs).toEqual([]);
  });
});

describe("a sentence is its parts, joined in the relation's words", () => {
  const cell = mark.this("ring", CELL, [{ x: 1, y: 1 }], "cell");
  const clue = mark.the("outline", CELL, [{ x: 0, y: 0 }], "clue");
  const look = phrase`${clue} has all its walls`;
  const move = phrase`${cell} must be open`;
  const rivals = mark.the("stripes", CELL, [{ x: 2, y: 2 }], "jump");

  it("forced: 'so', or 'so … :' over what follows from the look", () => {
    expect(so({ look, move }).text).toBe(
      "The outlined clue has all its walls, so this cell must be open.",
    );
    expect(so({ look, follows: phrase`nothing more can reach it`, move }).text).toBe(
      "The outlined clue has all its walls, so nothing more can reach it: this cell must be open.",
    );
  });

  it("each other relation has its one form", () => {
    const go = phrase`jump ${cell}`;
    const danger = phrase`${rivals} would cut it off`;
    const said = (relation: Relation, parts: Partial<Said> = {}): string =>
      sentence({ look: danger, move: go, relation, ...parts }).text;
    expect(said({ kind: "oneOf" })).toBe(
      "The striped jump would cut it off. One of them: jump this cell.",
    );
    expect(said({ kind: "answers", how: "One way to save it" })).toBe(
      "The striped jump would cut it off. One way to save it: jump this cell.",
    );
    expect(said({ kind: "effect", effect: phrase`it clears two crossings` })).toBe(
      "The striped jump would cut it off. Jump this cell: it clears two crossings.",
    );
    expect(
      said({ kind: "effect", effect: phrase`it clears two` }, { look: undefined }),
    ).toBe("Jump this cell: it clears two.");
    expect(said({ kind: "sequence", at: "first" })).toBe(
      "The striped jump would cut it off. First, jump this cell.",
    );
    expect(
      said({ kind: "sequence", at: "next" }, { look: phrase`to clear ${rivals}` }),
    ).toBe("Next, to clear the striped jump, jump this cell.");
    expect(said({ kind: "sequence", at: "last" }, { look: undefined })).toBe(
      "Last, jump this cell.",
    );
    expect(said({ kind: "again", basis: clue }, { look: undefined })).toBe(
      "…and jump this cell, for the outlined clue.",
    );
    expect(said({ kind: "serves" }, { look: undefined, aim: phrase`tile 3` })).toBe(
      "Working on tile 3: jump this cell.",
    );
  });

  it("carries every part's marks", () => {
    expect(keysOf(so({ look, move }).refs)).toEqual([
      "outline|cell|0,0",
      "ring|cell|1,1",
    ]);
  });

  it("refuses parts its relation cannot join", () => {
    expect(() => sentence({ move, relation: { kind: "forced" } })).toThrow(
      /needs a look/,
    );
    expect(() => sentence({ move, relation: { kind: "serves" } })).toThrow(
      /needs an aim/,
    );
    expect(() =>
      sentence({ look, move, relation: { kind: "again", basis: clue } }),
    ).toThrow(/first leg's/);
  });

  it("keeps its form through a narrow and a capitalization", () => {
    const s = sentence({ look, move, relation: { kind: "forced", rivals: "lost" } });
    expect(s.narrow(() => false).form).toEqual({ relation: "forced", rivals: "lost" });
    expect(s.capitalized().form).toEqual(s.form);
    expect(unshaped(move, "bare").narrow(() => true).form).toEqual({
      unshaped: "bare",
    });
  });

  it("leaves the move to the board with a ring on the whole move", () => {
    const s = sentence({
      look: phrase`${clue} is alone`,
      move: mark.move("go back for it"),
      relation: { kind: "answers", how: "So" },
    });
    expect(keysOf(s.refs)).toContain("ring|move|move");
  });
});
