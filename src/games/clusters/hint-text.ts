/**
 * Every sentence Clusters' hint speaks, and the words inside them.
 *
 * The description's `says` decides which sentence and with what values
 * (`clusters.description.yaml`); this file decides only how it reads. Each is a
 * proof by contradiction: premise, the rule the refuted color breaks,
 * conclusion in the necessity voice (docs/hints.md § "Necessity for
 * deductions, imperative for moves"). Every word that points at the board is a
 * reference to the mark it points at (`engine/hint-words.ts`): the cell the
 * step colors is ringed, the tile the refuted color would break is outlined,
 * and so are the two tiles a count reads.
 *
 * **Where a second mark is on the board, "this cell" is tied to it by geometry**,
 * because beside an outlined tile a bare "this cell" points at neither. Not by
 * color (*"the cell marked purple"*): `hints.md` forbids color as the only cue,
 * and a sentence naming a hue is wrong the moment the scheme flips or the reader
 * is color-blind. A refutation only ever breaks the colored cell or one of its
 * four orthogonal neighbors, so on every branch below the outlined tile is
 * literally *this cell's neighbor*, and the sentence says so.
 *
 * The two arms that break the cell itself have no second mark, so "this cell"
 * is unambiguous there and a disambiguating phrase would be noise.
 */

import type { ColorWord } from "../../engine/color/color-word.ts";
import { TWO_NAMES } from "../../engine/color/colors.ts";
import type { FiringSpoken } from "../../engine/described-firing-hint.ts";
import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { SaysById } from "./clusters.compiled.ts";
import { type ClustersFill, pairIndex } from "./state.ts";

/** A tile a count reads: where it is, its color and whether it is a dot. */
interface Tile {
  at: Point;
  fill: ClustersFill;
  dot: boolean;
}

/** The word for a color: the palette's, so it is the color the piece is. */
export const colorName = (fill: ClustersFill): ColorWord => TWO_NAMES[pairIndex(fill)];

/** A count in words, so it does not read as a coordinate. */
const COUNTS = ["no", "one", "two", "three", "four"] as const;

/** A tile by its color and kind: "red dot", "blue tile". */
const kindOf = (t: Tile): string =>
  `${colorName(t.fill).only} ${t.dot ? "dot" : "tile"}`;

type Spoken<K extends keyof SaysById> = FiringSpoken<SaysById[K]>;

/**
 * A Normal firing: tile `b`'s count over the squares it shares with tile `a`
 * settles `a`'s other empty neighbors, this cell among them. Both tiles are
 * outlined and told apart by color and kind, or, where those agree, by order
 * ("the other"); "this cell" is tied to them as one of `a`'s neighbors the
 * shared squares leave out. `most` is how many of the shared squares may take
 * `a`'s color, where the count says it.
 */
function count(s: Spoken<"countFull"> | Spoken<"countShort">): Sentence {
  const { terms: t } = s;
  const a: Tile = { at: s.at(t.a), fill: t.aValue as ClustersFill, dot: t.aDot === 1 };
  const b: Tile = { at: s.at(t.b), fill: t.bValue as ClustersFill, dot: t.bDot === 1 };
  const ca = colorName(a.fill);
  const same = kindOf(a) === kindOf(b);
  const noun = a.dot ? "dot" : "tile";
  const tileA = (words: string) => mark.as("outline", CELL, [a.at], words);
  const tileB = (words: string) => mark.as("outline", CELL, [b.at], words);
  const move = phrase`${mark.this("ring", CELL, s.targets, "square")} must be ${colorName(t.fill as ClustersFill)}`;
  // "Also touch" and "beside" are the squares the two share.
  if (!("most" in t)) {
    const other = same ? `the other outlined ${noun}` : `the outlined ${kindOf(b)}`;
    return so({
      look: phrase`${tileA(`the outlined ${kindOf(a)}`)}'s last ${ca} must also touch ${tileB(other)}`,
      move,
    });
  }
  const most = t.most === 0 ? "no" : `at most ${COUNTS[t.most]}`;
  const first = same ? `one outlined ${kindOf(b)}` : `the outlined ${kindOf(b)}`;
  const second = same ? "the other" : `the outlined ${kindOf(a)}`;
  return so({
    look: phrase`${tileB(first)} allows ${most} ${ca} beside ${tileA(second)}`,
    move,
  });
}

/** A refutation: the refuted color breaks a rule at once, at this cell or at
 * the tile beside it (the one outlined). */
function refute(s: Spoken<"refute">): Sentence {
  const f = colorName(s.terms.fill as ClustersFill);
  const t = colorName(s.terms.refuted as ClustersFill);
  const thisCell: Narration = mark.this("ring", CELL, s.targets, "square");
  const itMust = phrase`it must be ${f}`;
  const thisMust = phrase`${thisCell} must be ${f}`;
  if (s.arm === "selfSurrounded") {
    return so({
      look: phrase`Every neighbor of ${thisCell} is ${f}. As ${t}, it could never touch another ${t} tile`,
      move: itMust,
    });
  }
  if (s.arm === "selfReach") {
    // An empty cell is never a dot. Count- and edge-neutral: at a corner the
    // board edge does part of the hemming, and "at most one" stays honest when
    // one open neighbor remains.
    return so({
      look: phrase`If ${thisCell} were ${t}, at most one neighbor could ever match it, but it needs to touch two`,
      move: itMust,
    });
  }
  if (s.arm === "dotOvercount") {
    // "its one" carries the rule (a dot touches exactly one tile of its color),
    // and the rule itself is the help's to state.
    return so({
      look: phrase`${mark.the("outline", CELL, s.outline, `${t.only} dot`)} beside ${thisCell} already touches its one ${t} tile`,
      move: thisMust,
    });
  }
  const neighbor = mark.as(
    "outline",
    CELL,
    s.outline,
    `its outlined ${f.only} neighbor`,
  );
  if (s.arm === "nearSurrounded") {
    return so({
      look: phrase`Painting ${thisCell} ${t} would seal ${neighbor} off from its own color`,
      move: thisMust,
    });
  }
  return so({
    look: phrase`If ${thisCell} were ${t}, ${neighbor} could never touch two ${f} tiles`,
    move: thisMust,
  });
}

/** Each technique's sentence, from what its description says of a firing
 * (`engine/described-firing-hint.ts`). */
export const sentences = { refute, countFull: count, countShort: count };

/** The game's sentence builders (`hint-text-convention.test.ts`: every text
 * module exports its sentences as `say`). */
export const say = { refute, count };
