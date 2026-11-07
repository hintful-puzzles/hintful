/**
 * The words of Rectangles' hint. A clue is named by its number ("the 6"); the
 * rectangle a step draws is ringed, the clues and squares it reasons from are
 * outlined, and the squares another clue is sure to cover are striped.
 */

import {
  CELL,
  derived,
  mark,
  Narration,
  phrase,
  pronoun,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { LINE, RECTANGLE } from "./hint-marks.ts";
import type { RectReason } from "./solver.ts";
import { HIDDEN, type RectState } from "./state.ts";

/** "a", "a or b", "a, b or c". */
function joinOr(parts: readonly Narration[]): Narration {
  if (parts.length === 0) return Narration.plain("");
  const [first, ...rest] = parts;
  return rest.reduce(
    (acc, p, i) =>
      i === rest.length - 1 ? phrase`${acc} or ${p}` : phrase`${acc}, ${p}`,
    first,
  );
}

const SHAPE_WORDS = ["", "square", "tall", "wide"];

/** A clue as it reads on the board, for "the …": its number ("6"), after its
 * shape where it names one ("square 4"); without a number, its shape and
 * "clue" ("tall clue"), or the question mark a plain one shows ("? clue"),
 * since a bare "?" reads in a sentence as a stray symbol. */
function clueName(s: RectState, clue: number): string {
  const n = s.grid[clue];
  const shape = SHAPE_WORDS[s.shapes[clue]];
  if (n === HIDDEN) return `${shape || "?"} clue`;
  return shape ? `${shape} ${n}` : String(n);
}

/** "a", "a and b", "a, b and c". */
function joinAnd(parts: readonly string[]): string {
  return parts.length < 2
    ? parts.join("")
    : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * Why the clues with fits across an edge cannot cross it: "Only the outlined 4
 * can cross this edge, and it would take the striped square the 21 always
 * covers". Several clues share one clause, since a clause each runs to a
 * paragraph.
 */
function crossings(s: RectState, f: Extract<RectReason, { kind: "line" }>): Narration {
  const at = (i: number): Point => ({ x: i % s.w, y: Math.floor(i / s.w) });
  // "Only these can cross" is a claim about every other clue's fits.
  const named = (clues: readonly number[]): Narration =>
    derived(
      mark.as(
        "outline",
        CELL,
        clues.map(at),
        `the outlined ${joinAnd(clues.map((c) => clueName(s, c)))}`,
      ),
    );
  const { takes, owners, misses } = f;
  const several = f.clues.length > 1;
  const why: Narration[] = [];
  if (takes.length > 0) {
    const striped = derived(
      several
        ? mark.as("stripes", CELL, takes.map(at), "striped square")
        : mark.the("stripes", CELL, takes.map(at), "square"),
    );
    // The clue that covers it is outlined beside the one crossing, so its
    // value names it, "other" where the two read alike, and "outlined" where
    // it shows no number: "the wide clue" could be any wide clue.
    const crosser = clueName(s, f.clues[0]);
    const ownerName = (c: number): string => {
      const name = clueName(s, c);
      if (name === crosser) return `other ${crosser}`;
      return s.grid[c] === HIDDEN ? `outlined ${name}` : name;
    };
    const owner = mark.as(
      "outline",
      CELL,
      owners.map(at),
      several ? "another outlined clue" : `the ${joinAnd(owners.map(ownerName))}`,
    );
    why.push(
      several
        ? phrase`take ${owner}'s ${striped}`
        : phrase`take ${striped} ${owner} always ${owners.length > 1 ? "cover" : "covers"}`,
    );
  }
  if (misses.length > 0) {
    const missed = derived(
      several
        ? mark.as("outline", CELL, misses.map(at), "an outlined square")
        : mark.the("outline", CELL, misses.map(at), "square"),
      "each",
    );
    // Missing a square is a reason only because no other clue can cover it,
    // so the words say so.
    why.push(phrase`miss ${missed} only it reaches`);
  }
  const edge = mark.this("ring", LINE, [f.edge], "edge");
  return phrase`Only ${named(f.clues)} can cross ${edge}, and ${several ? "each" : "it"} would ${joinOr(why)}`;
}

export const say = {
  firing(s: RectState, f: RectReason): Sentence {
    const at = (i: number): Point => ({ x: i % s.w, y: Math.floor(i / s.w) });
    if (f.kind === "line")
      return so({ look: crossings(s, f), move: phrase`the edge is a line` });
    const n = clueName(s, f.clue);
    const rect = mark.this(
      "ring",
      RECTANGLE,
      [f.rect],
      f.rect.w * f.rect.h === 1 ? "square" : "rectangle",
    );
    switch (f.kind) {
      case "fit": {
        if (s.grid[f.clue] === 1)
          return so({
            look: phrase`A 1 needs no other square`,
            move: phrase`${rect} is its whole rectangle`,
          });
        const why: Narration[] = [];
        if (f.offBoard) why.push(Narration.plain("run off the board"));
        if (f.blockers.length > 0)
          why.push(
            phrase`take in ${mark.the("outline", CELL, f.blockers.map(at), "clue")}`,
          );
        if (f.crossesLine) why.push(Narration.plain("cross a line"));
        if (f.leavesOut)
          why.push(Narration.plain("leave out part of the rectangle drawn round it"));
        return so({
          look: phrase`Elsewhere the ${n} would ${joinOr(why)}`,
          move: phrase`only ${rect} fits`,
        });
      }
      case "boxed":
        return so({
          look: phrase`Lines close ${rect} round the ${n} alone`,
          move: phrase`it is the ${n}'s whole rectangle`,
        });
      case "reach":
        return so({
          look: phrase`No other clue can reach ${derived(mark.the("outline", CELL, [at(f.square)], "square"))}`,
          follows: phrase`the ${n} must cover it`,
          move: phrase`${rect} is the only way it can`,
        });
      case "overlap": {
        const core = f.core.map(at);
        return so({
          look: phrase`Wherever ${mark.the("outline", CELL, [at(f.other)], clueName(s, f.other))} goes, it covers ${derived(mark.the("stripes", CELL, core, "square"))}`,
          // Two clues that read alike are this one and the outlined other.
          follows: phrase`the ${n === clueName(s, f.other) ? "other " : ""}${n} can't use ${pronoun(CELL, core)}`,
          move: phrase`${rect} is all it has left`,
        });
      }
      case "starve": {
        const why: Narration[] = [];
        if (f.starved.length > 0)
          why.push(
            phrase`${derived(mark.the("outline", CELL, f.starved.map(at), "clue"), "each")} no room`,
          );
        // A square is stranded because no clue keeps a fit over it once this
        // one goes elsewhere: "no cover" says nothing is left to cover it,
        // where "uncovered" said only how it would end.
        if (f.stranded.length > 0)
          why.push(
            phrase`${derived(mark.the("outline", CELL, f.stranded.map(at), "square"), "each")} no cover`,
          );
        // Both reasons in one sentence have to fit the length a step is held
        // to (`hint-quality.test.ts`), so each is a few words.
        return so({
          look: phrase`Elsewhere the ${n} would leave ${joinOr(why)}`,
          move: phrase`it must take ${rect}`,
        });
      }
    }
  },
};
