/**
 * Every sentence Singles' hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads. Every sentence names the
 * numbers involved rather than "this square / its other neighbor", because
 * concrete values read far clearer, and leads with the spotted pattern before
 * the deduction. A blacked-out square is "black", the word the help defines:
 * "shaded" would name a mark (`engine/hint-words.ts` retires it).
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the squares the step decides are ringed, the
 * squares it reasons from are outlined, and so is the corner a corner rule
 * keeps from being boxed in, told apart from the matching numbers by its noun
 * ("the corner 4") as its mark is by its color. A reference to the ringed
 * squares renders from its elements, so a step the player has partly made
 * reads right for what is left (`Narration.narrow`).
 */

import { joinNums } from "../../engine/hint-text.ts";
import { CELL, mark, type Narration, phrase, whole } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** What a step marks, and the number each square shows. */
export interface Marked {
  targets: readonly Point[];
  evidence: readonly Point[];
  strand: readonly Point[];
  line: readonly Point[];
  num(p: Point): number;
}

const same = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;

/** Words for the ringed squares, one form for one square and one for several. */
const ringed = (
  m: Marked,
  one: (n: number) => string,
  many: (els: readonly Point[]) => string,
): Narration =>
  mark.as("ring", CELL, m.targets, (els) =>
    els.length > 1 ? many(els) : one(m.num(els[0])),
  );

/** "it" or "they" for the ringed squares. */
const they = (m: Marked): Narration =>
  ringed(
    m,
    () => "it",
    () => "they",
  );

const outlined = (cells: readonly Point[], n: number): Narration =>
  mark.the("outline", CELL, cells, String(n));

const thisLine = (m: Marked): Narration =>
  mark.this(
    "stripes",
    whole(CELL),
    m.line,
    m.line[0]?.y === m.line[1]?.y ? "row" : "column",
  );

export const say = {
  // Name the spotted pattern (two equal numbers one square apart) before the
  // deduction — and name the *values* (the square's locator), not "two
  // matching numbers".
  /** Two `n`s one square apart, with the ringed square between them. */
  sandwich: (m: Marked, n: number): Narration =>
    phrase`${outlined(m.evidence, n).capitalized()} sit one square apart, so one of them must be black: ${ringed(
      m,
      (b) => `the ${b} between them`,
      () => "the squares between them",
    )} must be white.`,

  /** A touching pair of `n`s: every other `n` in their line is ringed. */
  pair: (m: Marked, n: number): Narration =>
    phrase`${outlined(m.evidence, n).capitalized()} touch, so one of them stays white and uses up the ${n} in ${thisLine(m)}: ${mark.the("ring", CELL, m.targets, String(n))} must be black.`,

  // All four share a number, so a diagonal pair must be black (two black
  // cells, never adjacent). At a *grid* corner the corner cell's only
  // neighbors are the two sides, so blacking out the side diagonal would
  // strand the corner white — the same box-in argument as corner3. Either end
  // of that diagonal may already be black, and is then outlined, not ringed.
  corner4: (
    m: Marked,
    n: number,
    corner: Point,
    sides: Point[],
    inner: Point,
  ): Narration => {
    const decides = (p: Point): boolean => m.targets.some((t) => same(t, p));
    const cornerRef = decides(corner)
      ? mark.this("ring", CELL, [corner], `corner ${n}`)
      : mark.the("outline", CELL, [corner], `corner ${n}`);
    const innerWords = `${n} diagonally inside`;
    const black = !decides(corner)
      ? mark.as("ring", CELL, [inner], `the ${innerWords}`)
      : decides(inner)
        ? phrase`it and ${mark.as("ring", CELL, [inner], `the ${innerWords}`)}`
        : "it";
    const like = decides(inner)
      ? ""
      : phrase`, like ${mark.the("outline", CELL, [inner], innerWords)}`;
    return phrase`${cornerRef.capitalized()} matches ${mark.the("outline", CELL, sides, "neighbor", "both its")}; keeping it white would make both black and box it in, so ${black} must be black${like}.`;
  },

  // Name the referent explicitly ("the corner") so it never reads as the
  // matching number.
  /** The corner `t` itself matches both neighboring `n`s. */
  corner3Corner: (m: Marked, t: number, n: number): Narration =>
    phrase`${mark.this("ring", CELL, m.targets, `corner ${t}`).capitalized()} matches ${mark.the("outline", CELL, m.evidence, String(n), "both")}; keeping it white would make both black and box it in, so it must be black.`,

  /** The inner `t` matches the two `n`s flanking the corner `c`. */
  corner3Inner: (m: Marked, t: number, n: number, c: number): Narration =>
    phrase`${mark.this("ring", CELL, m.targets, `inner ${t}`).capitalized()} matches ${mark.the("outline", CELL, m.evidence, String(n), "both")} flanking ${mark.the("outline", CELL, m.strand, `corner ${c}`)}; keeping it white would make both black and box the corner in, so it must be black.`,

  // Indication-first: open on the spotted pattern — a touching pair of equal
  // numbers at a grid corner — then run the proof-by-contradiction arc with
  // concrete numbers: the move we rule out (blacking out the target) → its
  // consequence (the corner's neighbor black, the corner boxed in) → the
  // deduction. The pair is (corner, side) or (side, inner), so it always sits
  // in the corner block, and `side` is the member beside the corner either way.
  /** A touching pair of `p`s at the corner `c`, `side` the one beside it. */
  corner2: (
    m: Marked,
    pair: readonly Point[],
    side: Point,
    p: number,
    c: number,
  ): Narration =>
    phrase`${mark.as("outline", CELL, pair, `A touching pair of ${p}s`)} sits at the corner, so one of them must be black. Blacking out ${mark.this("ring", CELL, m.targets, String(m.num(m.targets[0])))} would force ${mark.as("outline", CELL, [side], `the ${p} beside the corner`)} black too, leaving ${mark.as("outline", CELL, m.strand, `the corner ${c}`)} boxed in, so it must stay white.`,

  // The A-pair (n) shares one line, the B-pair (k) the next. Lead with the
  // *indication* — the spotted pattern, a pair of n in one line and a pair of
  // k in the next — so the player learns to recognize it, then give the
  // consequence. The pairs can sit ANYWHERE along those lines, so never say
  // "overlap"/"between them"; "lined up so that" + the marks carry the exact
  // arrangement. (Article-free — "one of the Ns" sidesteps "a 4" vs "an 8".)
  /** A pair of `n`s (`a`) in one `line` and a pair of `k`s (`b`) in the next. */
  offset: (
    m: Marked,
    a: readonly Point[],
    b: readonly Point[],
    n: number,
    k: number,
    line: "row" | "column",
  ): Narration => {
    const first = mark.as("outline", CELL, a, `a pair of ${n}s`);
    const second = mark.as(
      "outline",
      CELL,
      b,
      n === k ? "another pair" : `a pair of ${k}s`,
    );
    const forced =
      n === k ? `two of the ${n}s` : `one of the ${n}s and one of the ${k}s`;
    return phrase`There's ${first} in one ${line} and ${second} in the next, lined up so that blacking out ${ringed(
      m,
      (v) => `the ringed ${v}`,
      () => "either ringed square",
    )} would force ${forced} to be black next to each other, and black squares can't touch. So ${ringed(
      m,
      () => "it",
      () => "both",
    )} must be white.`;
  },

  // The forced squares are a black square's neighbors — their values are
  // unrelated to the deduction (it's pure adjacency), but still name them so
  // the player knows which squares without hunting the marks. The group can
  // hold mixed/repeated values, so list them all.
  adjBlack: (m: Marked): Narration =>
    phrase`${ringed(
      m,
      (v) => `This ${v} touches`,
      (els) => `These squares (${joinNums(els.map(m.num))}) touch`,
    )} ${mark.paren("outline", CELL, m.evidence, "a black square")}, and black squares can't touch, so ${they(m)} must be white.`,

  // The forced square(s) and the outlined white square all show the same
  // number — that duplicate is the whole reason — so name it. A line is
  // striped only when every forced square shares it with the white square.
  /** Copies of `t` share a line with the outlined white `t`. */
  sameLine: (m: Marked, t: number): Narration =>
    phrase`${ringed(
      m,
      () => `This ${t} shares`,
      () => `These ${t}s share`,
    )} ${m.line.length > 0 ? thisLine(m) : "a line"} with ${mark.the("outline", CELL, m.evidence, `white ${t}`)}, which already uses that number, so ${they(m)} must be black.`,

  boxedIn: (m: Marked, v: number): Narration =>
    phrase`${mark.this("ring", CELL, m.targets, String(v)).capitalized()} is ${mark.the("outline", CELL, m.evidence, "white square")}'s last neighbor that isn't black, so it must be white to keep that square joined.`,

  split: (m: Marked, v: number): Narration =>
    phrase`Blacking out ${mark.this("ring", CELL, m.targets, String(v))} would cut some of ${mark.the("outline", CELL, m.evidence, "square")} off from the rest of the white region, so it must be white.`,
};
