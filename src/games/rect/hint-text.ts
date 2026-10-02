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
import type { RectFiring } from "./hint.ts";
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

export const say = {
  firing(s: RectState, f: RectFiring): Sentence {
    const at = (i: number): Point => ({ x: i % s.w, y: Math.floor(i / s.w) });
    if (f.kind === "line")
      return so({
        look: phrase`No rectangle can cover both ${mark.the("outline", CELL, f.squares.map(at), "square")}`,
        move: phrase`${mark.this("ring", LINE, [f.edge], "edge")} between them must be a line`,
      });

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
