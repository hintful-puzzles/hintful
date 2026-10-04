/**
 * The words of Rectangles' hint. A clue is named by its number ("the 6"); the
 * rectangle a step draws is ringed, the clues and squares it reasons from are
 * outlined, and the squares another clue is sure to cover are striped.
 */

import {
  CELL,
  mark,
  Narration,
  phrase,
  pronoun,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { Crossing, RectFiring } from "./hint.ts";
import { LINE, RECTANGLE } from "./hint-marks.ts";
import type { RectState } from "./state.ts";

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

/** "a", "a and b", "a, b and c". */
function joinAnd(parts: readonly string[]): string {
  return parts.length < 2
    ? parts.join("")
    : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * Why the clues with fits across an edge cannot cross it: "Only the outlined 4
 * could cross this edge, and it would take the striped square, which the
 * outlined 21 covers wherever it goes". Several clues share one clause, since
 * a clause each runs to a paragraph.
 */
function crossings(s: RectState, f: Extract<RectFiring, { kind: "line" }>): Narration {
  const at = (i: number): Point => ({ x: i % s.w, y: Math.floor(i / s.w) });
  const named = (clues: readonly number[]): Narration =>
    mark.as(
      "outline",
      CELL,
      clues.map(at),
      `the outlined ${joinAnd(clues.map((c) => String(s.grid[c])))}`,
    );
  const union = (pick: (c: Crossing) => readonly number[]): number[] => [
    ...new Set(f.across.flatMap(pick)),
  ];
  const takes = union((c) => c.takes);
  const owners = union((c) => c.owners);
  const misses = union((c) => c.misses);
  const several = f.across.length > 1;
  const why: Narration[] = [];
  if (takes.length > 0) {
    const striped = several
      ? mark.as("stripes", CELL, takes.map(at), "a striped square")
      : mark.the("stripes", CELL, takes.map(at), "square");
    const owned = several
      ? phrase`${mark.as("outline", CELL, owners.map(at), "another outlined clue")} covers wherever it goes`
      : phrase`${named(owners)} ${owners.length > 1 ? "cover wherever they go" : "covers wherever it goes"}`;
    why.push(phrase`take ${striped}, which ${owned}`);
  }
  if (misses.length > 0) {
    const missed = several
      ? mark.as("outline", CELL, misses.map(at), "an outlined square")
      : mark.the("outline", CELL, misses.map(at), "square");
    why.push(phrase`miss ${missed}, which no other clue reaches`);
  }
  const edge = mark.this("ring", LINE, [f.edge], "edge");
  return phrase`Only ${named(f.across.map((c) => c.clue))} could cross ${edge}, and ${several ? "each" : "it"} would ${joinOr(why)}`;
}

export const say = {
  firing(s: RectState, f: RectFiring): Sentence {
    const at = (i: number): Point => ({ x: i % s.w, y: Math.floor(i / s.w) });
    if (f.kind === "line")
      return so({ look: crossings(s, f), move: phrase`the edge must be a line` });
    const n = s.grid[f.clue];
    const rect = mark.this(
      "ring",
      RECTANGLE,
      [f.rect],
      n === 1 ? "square" : "rectangle",
    );
    switch (f.kind) {
      case "fit": {
        if (n === 1)
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
        return so({
          look: phrase`Elsewhere the ${n} would ${joinOr(why)}`,
          move: phrase`only ${rect} fits`,
        });
      }
      case "reach":
        return so({
          look: phrase`No other clue can reach ${mark.the("outline", CELL, [at(f.square)], "square")}`,
          follows: phrase`the ${n} must cover it`,
          move: phrase`${rect} is the only way it can`,
        });
      case "overlap": {
        const core = f.core.map(at);
        return so({
          look: phrase`Wherever ${mark.the("outline", CELL, [at(f.other)], String(s.grid[f.other]))} goes, it covers ${mark.the("stripes", CELL, core, "square")}`,
          follows: phrase`the ${n} can't use ${pronoun(CELL, core)}`,
          move: phrase`it fits only ${rect}`,
        });
      }
      case "starve": {
        const why: Narration[] = [];
        if (f.starved.length > 0)
          why.push(
            phrase`leave ${mark.the("outline", CELL, f.starved.map(at), "clue")} no room`,
          );
        if (f.stranded.length > 0)
          why.push(
            phrase`leave ${mark.the("outline", CELL, f.stranded.map(at), "square")} out of every rectangle`,
          );
        return so({
          look: phrase`Anywhere else, the ${n} would ${joinOr(why)}`,
          move: phrase`it must take ${rect}`,
        });
      }
    }
  },
};
