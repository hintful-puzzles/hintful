/**
 * Every sentence Untangle's hint speaks.
 *
 * Which sentence a step gets is `hint.ts`'s to decide from what it measured;
 * this file decides only how it reads. The counts are the game's own exact
 * crossing test, taken on the board the step applies to, and are written as
 * numerals so a sentence never mixes "12" with "three".
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`). A step decides a move, so the point it moves and
 * the spot it moves it to are ringed, whatever their glyph, and so are the
 * other points a journey will move next ("these points", "the others"). The crossings
 * the move clears are what it measures, so they are outlined.
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
import type { RationalPoint } from "./state.ts";

/** A point of the graph, by index. */
export const VERTEX: MarkKind<number> = { name: "point", key: (v) => `${v}` };

/** The spot a step moves its point to. */
export const SPOT: MarkKind<RationalPoint> = {
  name: "spot",
  key: (p) => `${p.x}/${p.d},${p.y}/${p.d}`,
};

/** A crossing of two lines, where it is drawn. `lines` names the pair, which
 * is what tells two crossings apart: a line through another's end crosses
 * both lines there, at one spot, and the sentence counts both. */
export type Crossing = Point & { readonly lines: string };

export const CROSSING: MarkKind<Crossing> = {
  name: "crossing",
  key: (c) => c.lines,
};

/** What one step marks: the point it moves, where to, the crossings of that
 * point's lines the move clears, and, on a journey, the points still to move. */
export interface UntangleMarks {
  vertex: number;
  to: RationalPoint;
  cleared: readonly Crossing[];
  marked: readonly number[];
}

const thisPoint = (m: UntangleMarks): Narration =>
  mark.this("ring", VERTEX, [m.vertex], "point");

const here = (m: UntangleMarks): Narration => mark.as("ring", SPOT, [m.to], "here");

/** All of a point's crossings, cleared: the words count them. */
function allCleared(m: UntangleMarks, before: number): Narration {
  const words =
    before === 1
      ? "its only crossing"
      : before === 2
        ? "both of its crossings"
        : `all ${before} of its crossings`;
  return mark.as("outline", CROSSING, m.cleared, words);
}

/** ", clearing the outlined ones", when the move clears some of the point's
 * crossings without clearing them all. */
const clearing = (m: UntangleMarks): Narration | string =>
  m.cleared.length
    ? phrase`, clearing ${mark.the("outline", CROSSING, m.cleared, ["one", "ones"])}`
    : "";

/** What a journey leg does to its point's crossings, in a clause. A leg that
 * clears some of them counts the ones it clears rather than the totals, which
 * leaves the first leg's two sentences room to fit. */
function change(m: UntangleMarks, before: number, after: number): Narration {
  if (after === 0)
    return before === 0
      ? phrase`its lines stay clear`
      : phrase`it clears ${allCleared(m, before)}`;
  if (after < before && m.cleared.length) {
    const k = m.cleared.length;
    return phrase`it clears ${mark.the("outline", CROSSING, m.cleared, ["one", "ones"], k === 1 ? "the" : `the ${k}`)}, leaving ${after}`;
  }
  const counts =
    after < before
      ? `it cuts its crossings from ${before} to ${after}`
      : after === before
        ? `it keeps its crossings at ${before}`
        : `it raises its crossings from ${before} to ${after}`;
  return phrase`${counts}${clearing(m)}`;
}

/** The move every step makes: its point, to its spot. */
const moveIt = (m: UntangleMarks, point: Narration = thisPoint(m)): Narration =>
  phrase`move ${point} ${here(m)}`;

// No move is forced in Untangle, so every step is narrated by its effect on
// the point's crossings, which is what the hint measured.
export const say = {
  /** A move that leaves the point's lines in fewer crossings than before. */
  clear: (m: UntangleMarks, before: number, after: number): Sentence =>
    sentence({
      move: moveIt(m),
      relation: {
        kind: "effect",
        effect:
          after > 0
            ? phrase`it cuts its crossings from ${before} to ${after}${clearing(m)}`
            : phrase`it clears ${allCleared(m, before)}`,
      },
    }),

  /**
   * A move taken when the search found none that removes a crossing: what it
   * does to the point's own crossings (never fewer — that would be `clear`),
   * and, when the very next step removes some, how many. Only what the player
   * can see on the board: the solved layout the move heads for is not.
   */
  rearrange: (
    m: UntangleMarks,
    before: number,
    after: number,
    opens: number | null,
  ): Sentence => {
    const what =
      after === before
        ? before === 0
          ? "keeps its lines clear"
          : `keeps its crossings at ${before}`
        : `raises its crossings from ${before} to ${after}`;
    const effect = phrase`it ${what}${clearing(m)}`;
    // The payoff, when there is one, is the reason for the move; without one,
    // the reason is that nothing better was found.
    return opens === null
      ? sentence({
          look: phrase`No one move removes a crossing`,
          move: moveIt(m),
          relation: { kind: "effect", effect },
        })
      : sentence({
          move: moveIt(m),
          relation: {
            kind: "effect",
            effect: phrase`${effect}, but frees a move that removes ${opens}`,
          },
        });
  },

  /**
   * A leg of a journey that moves several marked points so that none of their
   * lines crosses anything. The first leg says what the whole journey does —
   * clears every crossing on the board, or every crossing the marked points
   * are in — and each leg what its own move does to its point's crossings,
   * which may rise on the way while the other marked points are still to move.
   */
  journey: (
    m: UntangleMarks,
    leg: number,
    legs: number,
    finishes: boolean,
    before: number,
    after: number,
  ): Sentence => {
    const effect = change(m, before, after);
    const point = (words: string): Narration =>
      mark.as("ring", VERTEX, [m.vertex], words);
    if (leg === 0) {
      const all = mark.as(
        "ring",
        VERTEX,
        [m.vertex, ...m.marked],
        `these ${legs} points`,
      );
      const does = finishes ? "clears every crossing" : "clears all their crossings";
      // Short forms ("these 3 points", "goes here"): the first leg carries two
      // sentences, and they keep it within a glance.
      return sentence({
        look: phrase`Moving ${all} ${does}`,
        move: phrase`${point("this one")} goes ${here(m)}`,
        relation: { kind: "sequence", at: "first", effect },
      });
    }
    return m.marked.length === 0
      ? sentence({
          move: phrase`${point("this point")} goes ${here(m)}`,
          relation: { kind: "sequence", at: "last", effect },
        })
      : sentence({
          move: phrase`${point("this point")} goes ${here(m)}, before ${mark.as("ring", VERTEX, m.marked, "the others")}`,
          relation: { kind: "sequence", at: "next", effect },
        });
  },
};
