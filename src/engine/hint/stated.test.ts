import { describe, expect, it } from "vitest";
import { ColorWord } from "../color/color-word.ts";
import { CELL, type MarkKind, markKeys, stepMarks } from "../contract/hint-words.ts";
import type { Point } from "../contract/types.ts";
import { PAIR_NAMES, SHADED_NAME, UNSHADED_NAME } from "../render/piece.ts";
import { type StatedContext, statedParts, statedSentence } from "./stated.ts";
import { parseClause } from "./stated-clauses.ts";
import { type StepClause, stepVoice } from "./step-voice.ts";

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

  it("names a piece term by the pair's word for its shape, and a count in words", () => {
    const s = statedSentence(
      {
        look: "{outline: the outlined {n: dotted {piece one} | {piece one}}} allows at most {spelled n} {piece n}s",
        move: "go",
      },
      cx({ piece: (k) => (k === 2 ? 0 : 1) }),
    );
    // One word in every scheme, at the top of a clause and inside a reference.
    expect(s.textIn("light")).toBe(
      `The outlined ${PAIR_NAMES[0]} allows at most three ${PAIR_NAMES[1]}s, so go.`,
    );
    expect(s.textIn("dark")).toBe(s.textIn("light"));
  });

  it("says a count past ten as its numeral, and refuses a piece the game gives none", () => {
    expect(
      statedSentence(
        { look: "{spelled n} bulbs", move: "go" },
        cx({ terms: { n: 12 } }),
      ).text,
    ).toBe("12 bulbs, so go.");
    expect(() =>
      statedSentence({ look: "the {piece n} bulb", move: "go" }, cx()),
    ).toThrow(/game's pieces/);
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

  it("lists the forms whose bit a term has set, and draws a term's elements on a kind of its own", () => {
    const say = (flags: number): string =>
      statedSentence(
        {
          look: "it would {or flags: close a loop | cut a square off | join them}",
          move: "go",
        },
        cx({ terms: { flags } }),
      ).text;
    expect(say(0b001)).toBe("It would close a loop, so go.");
    expect(say(0b101)).toBe("It would close a loop or join them, so go.");
    expect(say(0b111)).toBe(
      "It would close a loop, cut a square off or join them, so go.",
    );
    expect(() => parseClause("{or flags: a | {n}}")).toThrow(/no or of a term/);
    const edge: MarkKind<number> = { name: "edge", key: String };
    const s = statedSentence(
      { look: "weigh {outline tried: the outlined edges}", move: "go" },
      {
        ...cx(),
        termKinds: { tried: edge as unknown as MarkKind<Point> },
        termAt: { tried: (i) => i as unknown as Point },
        terms: { tried: [7, 9] },
      },
    );
    expect(stepMarks({ words: s }).of("outline", edge)).toEqual([7, 9]);
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

  it("says the verb a square takes a value by, and be otherwise", () => {
    const say = (be?: string): string =>
      statedSentence({ look: "{ring} can only {be} {n}", move: "go" }, cx({ be })).text;
    expect(say()).toBe("These squares can only be v3, so go.");
    expect(say("point")).toBe("These squares can only point v3, so go.");
  });

  it("keeps a value that is a color word one, so each scheme names it", () => {
    const words = [new ColorWord("sand", "slate"), new ColorWord("teal")];
    const s = statedSentence(
      { look: "{ring} hold {struck}", move: "{ring} must be {n}" },
      cx({ value: (n) => words[n % 2], struck: [3, 2], terms: { n: 2 } }),
    );
    expect(s.textIn("light")).toBe(
      "These squares hold sand and teal, so these squares must be sand.",
    );
    expect(s.textIn("dark")).toBe(
      "These squares hold slate and teal, so these squares must be slate.",
    );
    // Inside a word a color cannot change by scheme, so it is refused.
    expect(() =>
      statedSentence(
        { look: "{ring} hold {a n}", move: "go" },
        cx({ value: (n) => words[n % 2], terms: { n: 2 } }),
      ),
    ).toThrow(/slot of its own/);
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

  it("says a step's values as a list, and counts them in a count form", () => {
    const say = (vs: readonly number[]): string =>
      statedSentence(
        { look: "only {vs} {vs: is | are} left", move: "pencil {vs: it | them} in" },
        cx({ terms: { vs } }),
      ).text;
    expect(say([2])).toBe("Only v2 is left, so pencil it in.");
    expect(say([1, 2, 4])).toBe("Only v1, v2 and v4 are left, so pencil them in.");
  });

  it("says a step's values as alternatives with {either}", () => {
    const say = (vs: readonly number[]): string =>
      statedSentence({ move: "it can only be {either vs}" }, cx({ terms: { vs } }))
        .text;
    expect(say([2])).toBe("It can only be v2.");
    expect(say([1, 2, 4])).toBe("It can only be v1, v2 or v4.");
    expect(() =>
      statedSentence({ move: "{either n}" }, cx({ terms: { n: 1 } })),
    ).toThrow(/no values term/);
  });

  it("says a list of words a game supplies as they are, as a list or alternatives", () => {
    const say = (ws: readonly string[]): string =>
      statedSentence(
        { look: "only {ws} {ws: fits | fit}", move: "it is {either ws}" },
        cx({ terms: { ws } }),
      ).text;
    expect(say(["FRIDGE"])).toBe("Only FRIDGE fits, so it is FRIDGE.");
    expect(say(["BEAR", "STAR"])).toBe(
      "Only BEAR and STAR fit, so it is BEAR or STAR.",
    );
  });

  it("says how a move answers its look, a bare move or an evident look alone, and an aim served unless judged", () => {
    expect(
      statedSentence(
        { look: "{outline} is in danger", answers: "One way to avoid it", move: "go" },
        cx(),
      ).text,
    ).toBe("The outlined square is in danger. One way to avoid it: go.");
    expect(statedSentence({ move: "go" }, cx()).text).toBe("Go.");
    // A look alone is evident: the ring says the move.
    const evident = statedSentence({ look: "{outline} fits into {ring}" }, cx());
    expect(evident.text).toBe("The outlined square fits into these squares.");
    expect(evident.form).toEqual({ unshaped: "evident" });
    expect(
      statedSentence({ aim: "{outline}", look: "it is far", move: "go" }, cx()).text,
    ).toBe("Working on the outlined square: it is far. Go.");
    expect(
      statedSentence({ aim: "{outline}", look: "it is far", move: "go" }, cx(), null, {
        kind: "forced",
      }).text,
    ).toBe("Working on the outlined square: it is far, so go.");
    expect(
      statedSentence({ look: "to clear {outline}", move: "go" }, cx(), null, {
        kind: "sequence",
        at: "next",
      }).text,
    ).toBe("Next, to clear the outlined square, go.");
    // A sequence's leg keeps its stated effect, said after the move.
    const last = statedSentence({ move: "go", effect: "that ends it" }, cx(), null, {
      kind: "sequence",
      at: "last",
    });
    const alone = statedSentence({ move: "go", effect: "that ends it" }, cx());
    expect(last.text).toContain("ends it");
    expect(last.text).not.toBe(alone.text);
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

  it("says a later leg's `later` as its move in place of `move`, and a first leg ignores it", () => {
    const clauses = {
      look: "{outline} is shaded",
      move: "{ring} must be {n}",
      again: "{outline} is shaded again",
      later: "{ring} must be {n} too",
    };
    const first = statedSentence(clauses, cx({ later: false })).text;
    expect(first).toContain("must be v3.");
    expect(first).not.toContain("too");
    const later = statedSentence(clauses, cx({ later: true })).text;
    expect(later).toContain("must be v3 too");
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

  it("counts a derived reference of each element as a fact apiece", () => {
    const two = cx({ marks: { outline: [at(1), at(2)] } });
    const said = (look: string): number => statedParts({ look }, two).look?.depth ?? -1;
    expect(said("{derived outline: the outlined squares} have no room")).toBe(1);
    expect(said("{derived each outline: the outlined squares} have no room")).toBe(2);
  });

  it("refuses literal words that only a reference may say", () => {
    expect(() => statedParts({ look: "this square is full" }, cx())).toThrow();
  });
});

describe("a step's clause term", () => {
  const steps = {
    reason: {
      ring: "cell",
      clauses: [{ move: "touch {outline clue: the {n} {where}}" }],
      when: [null],
    },
    main: {
      ring: "cell",
      spoken: ["why"],
      clauses: [{ look: "{ring} can't both {why}", move: "it must go" }],
      when: [null],
    },
  } as const;
  type S = {
    reason: {
      ring: "cell";
      terms: { n: number; where: "above" | "below" };
      marks: { outline: { clue: readonly Point[] } };
    };
    main: {
      ring: "cell";
      terms: { why: StepClause<S, "reason", Point> };
      marks: Record<string, never>;
    };
  };
  const speak = stepVoice<S, Point>(steps, { kind: CELL, value: String });

  it("is the named step's move, said in place with its references", () => {
    const s = speak.sentence("main", {
      ring: [at(5)],
      terms: {
        why: {
          step: "reason",
          said: {
            terms: { n: 1, where: "above" },
            marks: { outline: { clue: [at(2)] } },
          },
        },
      },
    });
    expect(s.text).toBe("This square can't both touch the 1 above, so it must go.");
    expect([...markKeys(s.refs)].sort()).toEqual(["outline|cell|2,0", "ring|cell|1,1"]);
  });
});

describe("a step's clauses term", () => {
  const steps = {
    reason: {
      ring: "cell",
      clauses: [{ move: "{outline clue: the {n}}" }],
      when: [null],
    },
    main: {
      ring: "cell",
      spoken: ["near"],
      clauses: [{ look: "{ring} must touch {near}", move: "it must go" }],
      when: [null],
    },
  } as const;
  type S = {
    reason: {
      ring: "cell";
      terms: { n: number };
      marks: { outline: { clue: readonly Point[] } };
    };
    main: {
      ring: "cell";
      terms: { near: readonly StepClause<S, "reason", Point>[] };
      marks: Record<string, never>;
    };
  };
  const speak = stepVoice<S, Point>(steps, { kind: CELL, value: String });
  const reason = (n: number, x: number): StepClause<S, "reason", Point> => ({
    step: "reason",
    said: { terms: { n }, marks: { outline: { clue: [at(x)] } } },
  });

  it("says each named step's move as a list, with its references", () => {
    const s = speak.sentence("main", {
      ring: [at(5)],
      terms: { near: [reason(1, 0), reason(2, 1), reason(3, 2)] },
    });
    expect(s.text).toBe(
      "This square must touch the 1, the 2 and the 3, so it must go.",
    );
    expect([...markKeys(s.refs)].sort()).toEqual([
      "outline|cell|0,0",
      "outline|cell|1,0",
      "outline|cell|2,0",
      "ring|cell|1,1",
    ]);
  });

  it("says one alone", () => {
    const s = speak.sentence("main", {
      ring: [at(5)],
      terms: { near: [reason(4, 0)] },
    });
    expect(s.text).toBe("This square must touch the 4, so it must go.");
  });
});

describe("a step that strikes notes and states no move", () => {
  const steps = {
    ringed: {
      ring: "cell",
      clauses: [{ look: "{outline} leaves no room for {struckOr} in {ring}" }],
      when: [null],
    },
    leg: {
      ring: "cell",
      clauses: [
        {
          look: "{outline: this clue} leaves no room for {struckOr} in {stripes: this {noun}}",
          again: "{outline: the same clue}",
        },
      ],
      when: [null],
    },
    bare: { ring: "cell", clauses: [{ look: "None are left" }], when: [null] },
  } as const;
  type Step = {
    ring: "cell";
    terms: Record<string, never>;
    marks: { outline?: readonly Point[]; stripes?: readonly Point[] };
  };
  type S = { ringed: Step; leg: Step; bare: Step };
  const NAMES = ["", "ghost", "vampire"];
  const digits = stepVoice<S, Point>(steps, { kind: CELL, value: String });
  const monsters = stepVoice<S, Point>(steps, {
    kind: CELL,
    value: (n) => NAMES[n],
    // A note's `n` is a bit, as Undead's are.
    noteValue: (bit) => (bit === 1 ? 1 : 2),
  });
  const notes = (p: Point, ns: readonly number[]) => ns.map((n) => ({ ...p, n }));

  it("closes on the struck notes by value, a list of numerals bare", () => {
    const one = digits.sentence("ringed", {
      ring: [at(5)],
      marks: { outline: [at(1)] },
      strikes: notes(at(5), [3]),
    });
    expect(one.text).toBe(
      "The outlined square leaves no room for 3 in this square, so the 3 must go.",
    );
    expect([...markKeys(one.refs)]).toContain("strike|note|1,1:3");
    const two = digits.sentence("ringed", {
      ring: [at(5)],
      strikes: notes(at(5), [5, 3]),
    });
    expect(two.text).toContain("so 3 and 5 must go.");
  });

  it("names words as the struck marks, and the values by the voice's noteValue", () => {
    const s = monsters.sentence("ringed", {
      ring: [at(5)],
      strikes: notes(at(5), [1, 4]),
    });
    expect(s.text).toContain("no room for ghost or vampire");
    expect(s.text).toContain("so the struck ghost and vampire must go.");
  });

  it("says where the notes are when no reference names their squares alone", () => {
    const s = monsters.sentence("bare", {
      ring: [at(5)],
      strikes: [...notes(at(5), [1]), ...notes(at(6), [1])],
    });
    expect(s.text).toBe(
      "None are left, so the struck ghosts in these squares must go.",
    );
    expect([...markKeys(s.refs)]).toEqual(
      expect.arrayContaining(["stripes|cell|1,1", "stripes|cell|2,1"]),
    );
  });

  it("does not say where after a reference to their square, and says it with 'too' on a later leg", () => {
    const said = {
      ring: [at(5)],
      // The outline covers the struck square among others, which names it
      // no more than the board around it does.
      marks: { outline: [at(1), at(5)], stripes: [at(5)] },
      strikes: notes(at(5), [1]),
    };
    expect(monsters.sentence("leg", said).text).toBe(
      "This clue leaves no room for ghost in this square, so the struck ghost must go.",
    );
    expect(monsters.sentence("leg", { ...said, later: true }).text).toBe(
      "…and the struck ghost in this square must go too, for the same clue.",
    );
  });
});
