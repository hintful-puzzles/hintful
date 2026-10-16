/**
 * Every sentence Twiddle's hint speaks.
 *
 * Each step names the tile it is putting in place (the sentence's aim,
 * "Working on tile 7:"; on a rows-only board, where a row's tiles share its
 * number, "Working on the outlined 2:"), then the turn. A free turn, one that
 * moves no finished tile, says what it does for the tile. A turn of a run says
 * its part in the technique the run plays, as the help page names them: a
 * **tuck** (turn a block, turn another, turn the first back), a **cycle**
 * (turn a block, an overlapping one, the first back, the second back), a
 * cycle of two **small cycles**, **lining up** (turns that bring the tiles
 * into place for a cycle, undone at the end), a **twist**. Beside the part, it
 * says what the turn does that the board will show: finished tiles it lifts
 * out, finished tiles that come back, the tile landing. No turn says which turn
 * of the run it is: the hint's counter shows that. "In place" is the tile's
 * own square and, where orientation matters, upright; the help page says so.
 * Which part and which effects, `hint.ts` decides; this file decides only how
 * they read.
 *
 * The block to turn is what the step decides, so it is ringed; the tile the
 * step serves is outlined; finished tiles a turn lifts out, or that come back
 * on it, are striped.
 */

import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** A block, by the top-left square of the ones it turns. */
export const BLOCK: MarkKind<Point> = { name: "block", key: (p) => `${p.x},${p.y}` };

/** A tile, by the cell it stands on when the step is shown. */
export const TILE: MarkKind<number> = { name: "tile", key: (c) => `${c}` };

/** A finished tile a run takes out of place, by the cell it stands on when the
 * step is shown. */
export const LIFTED: MarkKind<number> = { name: "lifted", key: (c) => `${c}` };

/** The goal a step serves. */
export interface Goal {
  /** The cell the tile stands on now. */
  readonly at: number;
  /** The tile's number. */
  readonly number: number;
  /** Rows-only: every tile of a row carries its number, so the tile is named
   * by its outline, and it goes toward its row. */
  readonly rowsOnly: boolean;
}

/** The turn a step makes. */
export interface Turned {
  readonly block: Point;
  readonly clockwise: boolean;
}

/** The technique a run's lining up serves. */
export type Inner = "tuck" | "cycle" | "small cycles" | "twist" | "swap";

/** A run turn's part in its technique, as the words name it; `plain` where
 * the run has no technique to name (a searched run, or the rest of one the
 * player started, whose first turns the hint did not see). */
export type Part =
  | { readonly kind: "lineUp"; readonly inner: Inner; readonly undone: boolean }
  | { readonly kind: "lineBack" }
  | { readonly kind: "tuckLift" }
  | { readonly kind: "tuckMiddle"; readonly bringsIn: boolean }
  | { readonly kind: "tuckBack" }
  | { readonly kind: "cycleFirst" }
  | { readonly kind: "cycleSecond" }
  | { readonly kind: "firstBack" }
  | { readonly kind: "secondBack" }
  | { readonly kind: "small"; readonly which: 1 | 2; readonly back: boolean }
  | { readonly kind: "twist"; readonly back: boolean }
  /** The second quarter of a half turn: the same turn as the one before. */
  | { readonly kind: "again" }
  /** A swap's single turn, which the small sequences after it undo all but
   * two tiles of. */
  | { readonly kind: "swapStart" }
  | { readonly kind: "plain"; readonly searched: boolean };

/** What the turn does that the board will show, by the cells the tiles stand
 * on before it. */
export interface Effects {
  /** Finished tiles the turn first takes out of place. */
  readonly lifts: readonly number[];
  /** Finished tiles it puts back for the rest of the run. */
  readonly returns: readonly number[];
  /** The goal tile lands in place, for the rest of the run. */
  readonly lands: boolean;
  /** The goal tile moves without landing. */
  readonly carries: boolean;
}

/** The collection's limit on a step's sentence (`docs/hints.md` § "Keep the
 * narration terse"). */
const MAX_SENTENCE = 120;

const dir = (t: Turned): string => (t.clockwise ? "clockwise" : "anticlockwise");

/** "turn the ringed block clockwise", or by its part ("turn the first block
 * back clockwise"), the words naming the ring either way. */
const turnOf = (t: Turned, name = "the ringed block", back = false): Narration =>
  phrase`turn ${mark.as("ring", BLOCK, [t.block], name)} ${back ? "back " : ""}${dir(t)}`;

const aimOf = (g: Goal): Narration =>
  g.rowsOnly
    ? mark.the("outline", TILE, [g.at], `${g.number}`)
    : mark.as("outline", TILE, [g.at], `tile ${g.number}`);

const striped = (cells: readonly number[]): Narration =>
  mark.the("stripes", LIFTED, cells, "tile");

/** ", lifting the striped tiles", where the turn takes finished tiles out. */
const liftWords = (fx: Effects): Narration | string =>
  fx.lifts.length > 0 ? phrase`, lifting ${striped(fx.lifts)}` : "";

/** ": the striped tiles return and it is in place", what the turn completes. */
const doneWords = (fx: Effects): Narration | string => {
  const back =
    fx.returns.length > 0
      ? phrase`${striped(fx.returns)} ${fx.returns.length === 1 ? "returns" : "return"}`
      : null;
  if (back && fx.lands) return phrase`: ${back} and it is in place`;
  if (back) return phrase`: ${back}`;
  if (fx.lands) return ": it is in place";
  return "";
};

const INNER_WORDS: Record<Inner, string> = {
  tuck: "the tuck",
  cycle: "the cycle",
  "small cycles": "the small cycles",
  twist: "the twist",
  swap: "the swap",
};

/** The turn and its part, before the effects. */
function partWords(t: Turned, p: Part, fx: Effects): Narration {
  switch (p.kind) {
    case "lineUp":
      return phrase`${turnOf(t)} to line up ${INNER_WORDS[p.inner]}${liftWords(fx)}${p.undone && fx.lifts.length === 0 ? "; it turns back at the end" : ""}`;
    case "lineBack":
      return phrase`${turnOf(t, "the ringed block", true)} to undo the lining up`;
    case "tuckLift":
      return phrase`${turnOf(t)} to start a tuck${liftWords(fx)}`;
    case "tuckMiddle":
      return p.bringsIn
        ? phrase`${turnOf(t)}, so turning the first block back brings it in`
        : phrase`${turnOf(t)} before the first block turns back`;
    case "tuckBack":
      return phrase`${turnOf(t, "the first block", true)} to finish the tuck`;
    case "cycleFirst":
      return phrase`start a cycle: ${turnOf(t)}${liftWords(fx)}`;
    case "cycleSecond":
      return phrase`${turnOf(t)}, which overlaps the first block${liftWords(fx)}`;
    case "firstBack":
      // What returns, where the board shows it, says more than the rule.
      return fx.returns.length > 0 || fx.lands
        ? turnOf(t, "the first block", true)
        : phrase`${turnOf(t, "the first block", true)}: the tiles only it moved go home`;
    case "swapStart":
      return phrase`start a swap: ${turnOf(t)}${liftWords(fx)}`;
    case "secondBack":
      return phrase`${turnOf(t, "the second block", true)} to finish the cycle`;
    case "small":
      return phrase`${turnOf(t)}, ${p.back ? "undoing" : "part of"} the ${p.which === 1 ? "first" : "second"} small cycle${liftWords(fx)}`;
    case "twist":
      return p.back
        ? phrase`${turnOf(t)}, back the other way round the twist`
        : phrase`${turnOf(t)}, one way round a twist${liftWords(fx)}`;
    case "again":
      return phrase`${turnOf(t)} again, a half turn in all${liftWords(fx)}`;
    // No technique to name: what the turn does is all there is to say.
    case "plain":
      if (fx.lifts.length > 0)
        return phrase`${turnOf(t)} to lift ${striped(fx.lifts)} out for now`;
      if (fx.carries) return phrase`${turnOf(t)} to carry it on`;
      if (fx.lands && fx.returns.length === 0)
        return phrase`${turnOf(t)} to put it in place`;
      return p.searched
        ? phrase`${turnOf(t)}, a turn of a run found by search`
        : turnOf(t);
  }
}

/** Effects the part's own words did not already say. */
function tail(p: Part, fx: Effects): Narration | string {
  // A plain turn that only lands the tile said so as its purpose.
  if (
    p.kind === "plain" &&
    fx.lifts.length === 0 &&
    !fx.carries &&
    fx.returns.length === 0
  )
    return "";
  return doneWords(fx);
}

export const say = {
  /** A free turn that puts the tile in place. */
  home: (g: Goal, t: Turned): Sentence =>
    sentence({
      aim: aimOf(g),
      move: phrase`${turnOf(t)} to put it in place`,
      relation: { kind: "serves" },
    }),

  /** A free turn that carries the tile one turn nearer its place. */
  carry: (g: Goal, t: Turned): Sentence =>
    sentence({
      aim: aimOf(g),
      move: phrase`${turnOf(t)} to carry it toward ${g.rowsOnly ? "its row" : "its place"}`,
      relation: { kind: "serves" },
    }),

  /** A turn of a run, by its part in the run's technique and what it does. */
  runTurn: (g: Goal, t: Turned, p: Part, fx: Effects): Sentence => {
    const said = (e: Effects) =>
      sentence({
        aim: aimOf(g),
        move: phrase`${partWords(t, p, e)}${tail(p, e)}`,
        relation: { kind: "serves" },
      });
    const full = said(fx);
    // Where the part, the tiles coming back and the landing do not fit in a
    // glance, the landing is the one kept: the returning tiles are on the
    // board to see, and are not striped unless the words name them.
    return full.text.length <= MAX_SENTENCE || fx.returns.length === 0
      ? full
      : said({ ...fx, returns: [] });
  },
};
