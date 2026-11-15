import { describe, expect, it } from "vitest";
import { ColorWord } from "./color/color-word.ts";
import { CELL, type MarkKind, stepMarks } from "./hint-words.ts";
import { SHADED_NAME, UNSHADED_NAME } from "./piece.ts";
import { type StatedContext, statedParts, statedSentence } from "./stated.ts";
import type { Point } from "./types.ts";

const W = 4;
const at = (c: number): Point => ({ x: c % W, y: (c / W) | 0 });
const cx = (over: Partial<StatedContext<Point>> = {}): StatedContext<Point> => ({
  kind: CELL,
  at,
  ring: [at(5), at(6)],
  marks: { outline: [at(1)], stripes: [at(4), at(5), at(6), at(7)] },
  terms: { n: 3, pair: [9, 10], one: 2 },
  value: (n) => `v${n}`,
  shows: (p) => p.y * W + p.x,
  ...over,
});

describe("a stated clause", () => {
  it("says a number term as the board draws it, and the lexicon's words", () => {
    const s = statedSentence(
      {
        look: "{outline} needs {n} {shaded} {nouns}",
        move: "{ring} must be {unshaded}",
      },
      cx(),
    );
    expect(s.text).toBe(
      `The outlined square needs v3 ${SHADED_NAME} squares, so these squares must be ${UNSHADED_NAME}.`,
    );
  });

  it("says how cells share a unit in the game's words, and in line otherwise", () => {
    const say = (alongside?: string): string =>
      statedSentence(
        { look: "{outline} is {alongside} {ring}", move: "go" },
        cx({ alongside }),
      ).text;
    expect(say()).toBe("The outlined square is in line with these squares, so go.");
    expect(say("in a block with")).toBe(
      "The outlined square is in a block with these squares, so go.",
    );
  });

  it("says a reference where a flag chooses it, and not the one it does not", () => {
    const say = (yes: boolean): string =>
      statedSentence(
        { look: "{if flag: {outline} sits | {ring} stand}", move: "go" },
        cx({ terms: { flag: yes } }),
      ).text;
    expect(say(true)).toBe("The outlined square sits, so go.");
    expect(say(false)).toBe("These squares stand, so go.");
  });

  it("takes the longest form of a fit that keeps the sentence in its limit", () => {
    // The sentence is the padding, a space, the form and ", so go." (120 at most).
    const said = (padding: number): string =>
      statedSentence(
        { look: `${"x".repeat(padding)} {fit: aaaa | bb | c}`, move: "go" },
        cx(),
      ).text;
    expect(said(5)).toContain(" aaaa,");
    expect(said(107)).toContain(" aaaa,");
    expect(said(108)).toContain(" bb,");
    expect(said(110)).toContain(" c,");
    // None fits: the last form is said whatever its length.
    expect(said(119)).toContain(" c,");
    // Every fit of a sentence takes the same turn.
    expect(
      statedSentence(
        {
          look: `${"x".repeat(104)} {fit: aaaa | bb | c} {fit: dddd | ee | f}`,
          move: "go",
        },
        cx(),
      ).text,
    ).toContain(" bb ee,");
  });

  it("names the struck values each once, as all of them or as alternatives", () => {
    const say = (clause: string): string =>
      statedSentence({ look: clause, move: "go" }, cx({ struck: [3, 1, 3, 2] })).text;
    expect(say("with {struck}")).toBe("With v1, v2 and v3, so go.");
    expect(say("with {struckOr}")).toBe("With v1, v2 or v3, so go.");
  });

  it("names a color term in the game's color word, and a count in words", () => {
    const colors = [
      new ColorWord("gray"),
      new ColorWord("gray"),
      new ColorWord("purple"),
      new ColorWord("yellow", "brown"),
    ];
    const s = statedSentence(
      {
        look: "{outline: the outlined {color one} {n: dot | tile}} allows at most {spelled n} {color n}",
        move: "go",
      },
      cx({ color: (k) => colors[k] }),
    );
    // A color at the top of a clause follows the scheme; inside a reference's
    // words it is the one word it has.
    expect(s.textIn("light")).toBe(
      "The outlined purple tile allows at most three yellow, so go.",
    );
    expect(s.textIn("dark")).toBe(
      "The outlined purple tile allows at most three brown, so go.",
    );
  });

  it("says a count past ten as its numeral, and refuses a color the game gives none", () => {
    expect(
      statedSentence(
        { look: "{spelled n} bulbs", move: "go" },
        cx({ terms: { n: 12 } }),
      ).text,
    ).toBe("12 bulbs, so go.");
    expect(() =>
      statedSentence({ look: "the {color n} bulb", move: "go" }, cx()),
    ).toThrow(/game's colors/);
  });

  it("says a value with its article, and a count as a numeral where the board draws a value another way", () => {
    const say = (n: number, letter: number): string =>
      statedSentence(
        {
          look: "it holds {a letter} and {numeral n} of {outline: {a letter}}",
          move: "go",
        },
        cx({
          terms: { n, letter },
          value: (v) => String.fromCharCode(65 + v),
        }),
      ).text;
    expect(say(3, 0)).toBe("It holds an A and 3 of an A, so go.");
    expect(say(12, 3)).toBe("It holds a D and 12 of a D, so go.");
  });

  it("draws the ring on a kind of its own", () => {
    const edge: MarkKind<string> = { name: "edge", key: (e) => e };
    const s = statedSentence(
      { look: "it sits by {ring: this edge | these edges}", move: "go" },
      {
        ...cx(),
        placing: undefined,
        consequences: [],
        ringKind: edge,
        ring: ["a", "b"],
      },
    );
    expect(s.text).toBe("It sits by these edges, so go.");
    expect(stepMarks({ words: s }).of("ring", edge)).toEqual(["a", "b"]);
  });

  it("counts a reference's live elements, so a narrowed reference re-counts", () => {
    const s = statedSentence(
      { look: "it needs {ring: 1 more bulb | {live} more bulbs}", move: "go" },
      cx(),
    );
    expect(s.text).toBe("It needs 2 more bulbs, so go.");
    const one = statedSentence(
      { look: "it needs {ring: 1 more bulb | {live} more bulbs}", move: "go" },
      cx({ ring: [at(5)] }),
    );
    expect(one.text).toBe("It needs 1 more bulb, so go.");
  });

  it("names a value in the game's word, and a number otherwise", () => {
    const say = (valueNoun?: string): string =>
      statedSentence(
        { look: "No other {valueNoun} is left in {ring}", move: "go" },
        cx({ valueNoun }),
      ).text;
    expect(say()).toBe("No other number is left in these squares, so go.");
    expect(say("letter")).toBe("No other letter is left in these squares, so go.");
  });

  it("takes the form a flag term holds, in a clause and inside a reference's words", () => {
    const say = (one: boolean, two: boolean): string =>
      statedSentence(
        {
          look: "{outline: the {if one: lone | plain} square} is {if two: full | {if one: part | empty}}",
          move: "{ring} must go",
        },
        cx({ terms: { one, two } }),
      ).text;
    expect(say(true, true)).toBe("The lone square is full, so these squares must go.");
    expect(say(false, false)).toBe(
      "The plain square is empty, so these squares must go.",
    );
    expect(say(true, false)).toBe("The lone square is part, so these squares must go.");
    expect(() => statedSentence({ look: "{if n: a | b}", move: "x" }, cx())).toThrow(
      /no flag term/,
    );
  });

  it("takes the one form of a count term where it is 1, and says an effect as the move's relation", () => {
    const say = (left: number): string =>
      statedSentence(
        {
          move: "go",
          effect: "it can be out in {left: 1 move | {left} moves}",
        },
        cx({ terms: { left }, value: String }),
      ).text;
    expect(say(1)).toBe("Go: it can be out in 1 move.");
    expect(say(3)).toBe("Go: it can be out in 3 moves.");
    expect(say(0)).toBe("Go: it can be out in 0 moves.");
    expect(() =>
      statedSentence({ move: "x", effect: "{n: a | b}" }, cx({ terms: { n: true } })),
    ).toThrow(/no count term/);
  });

  it("says a later leg's `again` after its move in place of look and follows, and a first leg ignores it", () => {
    const clauses = {
      look: "{outline} is shaded",
      follows: "{ring} would clash",
      move: "{ring} must be {n}",
      again: "{outline} is shaded again",
    };
    const first = statedSentence(clauses, cx({ later: false }));
    expect(first.text).toContain("is shaded, so");
    expect(first.text).toContain("would clash");
    const later = statedSentence(clauses, cx({ later: true }));
    expect(later.text).not.toContain("would clash");
    expect(later.text).toContain("is shaded again");
    expect(later.text.indexOf("must be v3")).toBeLessThan(
      later.text.indexOf("is shaded"),
    );
  });

  it("names the squares a step places by value, and those its placing techniques follow with, and drops a `has` with none", () => {
    const placing = (n: number): Point[] => (n === 1 ? [at(5)] : [at(6), at(7)]);
    const say = (consequences: Point[]): string =>
      statedSentence(
        {
          look: "x",
          move: "{ring 1} holds a boat, {ring 2: the water} is beside it{has 2+then: , with {ring 2+then: its water}}{has then: , and {ring then: more}}",
        },
        cx({ placing, consequences }),
      ).text;
    expect(say([])).toBe(
      "X, so this square holds a boat, the water is beside it, with its water.",
    );
    expect(say([at(8)])).toBe(
      "X, so this square holds a boat, the water is beside it, with its water, and more.",
    );
    expect(() => statedSentence({ move: "{ring 2}" }, cx())).toThrow(/places/);
  });

  it("takes the one form or the several from the reference's live elements", () => {
    const s = statedSentence(
      {
        look: "{outline} is full",
        move: "{ring: the {each} beside it | the squares beside it ({each})} must go",
      },
      cx(),
    );
    expect(s.text).toBe(
      "The outlined square is full, so the squares beside it (5 and 6) must go.",
    );
    const narrowed = s.narrow((role, _, key) => role !== "ring" || key !== "1,1");
    expect(narrowed.text).toBe(
      "The outlined square is full, so the 6 beside it must go.",
    );
  });

  it("references a term's elements in a role, and draws a strand as an outline", () => {
    const { look } = statedParts(
      {
        look: "{outline pair: the outlined pair} and {strand one: the outlined corner}",
      },
      cx({ terms: { pair: [9, 10], one: 2 }, marks: { strand: [at(2)] } }),
    );
    expect(look?.text).toBe("The outlined pair and the outlined corner");
    const marks = stepMarks({ words: look });
    const outlined = marks.of("outline", CELL).map((p) => p.y * W + p.x);
    expect(outlined.sort((a, b) => a - b)).toEqual([2, 9, 10]);
  });

  it("names stripes by the game's unit, as one thing", () => {
    const { look } = statedParts(
      { look: "{stripes} is full" },
      cx({ unit: (els) => (els.every((p) => p.y === els[0].y) ? "row" : "column") }),
    );
    expect(look?.text).toBe("This row is full");
  });

  it("refuses a slot that names nothing it was given", () => {
    expect(() => statedParts({ look: "{m} is it" }, cx())).toThrow(/\{m\}/);
    expect(() => statedParts({ look: "{outline m} is it" }, cx())).toThrow(
      /names no element term/,
    );
  });

  it("draws a reference on the kind of the sort it names, where a role marks several", () => {
    const FACE: MarkKind<number> = { name: "clue", key: String };
    const DOT: MarkKind<number> = { name: "dot", key: String };
    const { look } = statedParts(
      { look: "{outline face: this {n}} and {outline cell: the outlined dot}" },
      {
        kind: FACE,
        kinds: { face: FACE, cell: DOT },
        at: (i) => i,
        ring: [],
        marks: { outline: { face: [4], cell: [7, 8] } },
        terms: { n: 3 },
        value: (n) => `${n}`,
      },
    );
    expect(look?.text).toBe("This 3 and the outlined dot");
    const marks = stepMarks({ words: look });
    expect(marks.of("outline", FACE)).toEqual([4]);
    expect(marks.of("outline", DOT)).toEqual([7, 8]);
  });

  it("refuses a reference that names no sort of a role of several", () => {
    const FACE: MarkKind<number> = { name: "clue", key: String };
    const several = {
      kind: FACE,
      kinds: { face: FACE },
      at: (i: number) => i,
      ring: [],
      marks: { outline: { face: [4] } },
      terms: {},
      value: (n: number) => `${n}`,
    };
    expect(() => statedParts({ look: "{outline} is it" }, several)).toThrow(
      /names no sort/,
    );
    expect(() => statedParts({ look: "{outline cell} is it" }, several)).toThrow(
      /names no sort/,
    );
  });

  it("counts a derived reference as a fact the board does not show", () => {
    const parts = statedParts(
      { look: "{derived stripes: the same region} and {outline} agree" },
      cx(),
    );
    expect(parts.look?.text).toBe("The same region and the outlined square agree");
    expect(parts.look?.depth).toBe(1);
    expect(
      statedParts({ look: "{stripes: it} and {outline} agree" }, cx()).look?.depth,
    ).toBe(0);
    expect(() => statedParts({ look: "{derived n} is it" }, cx())).toThrow(
      /no derived reference/,
    );
  });

  it("refuses literal words that only a reference may say", () => {
    expect(() => statedParts({ look: "this square is full" }, cx())).toThrow();
  });
});
