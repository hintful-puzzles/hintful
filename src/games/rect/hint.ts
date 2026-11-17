/**
 * Rectangles' hint: the next rectangle, or line, that the board forces, as
 * the ladder `rect.description.yaml` states walks to it (`hintWalk`).
 *
 * The walk reads only what the player can see: their lines, and the inside of
 * each rectangle they drew round a clue (`readClaims`), which says those
 * squares are the clue's. A step draws a clue's rectangle, a line round it and
 * none inside, or one line; a line is the one notation the game has for "this
 * placement is out", and every later step rereads the lines.
 */

import { assertNever } from "../../engine/assert-never.ts";
import { describedEdgeHint, type Fired } from "../../engine/described-edge-hint.ts";
import { spokenOf } from "../../engine/described-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { CELL, type MarkKind, type Sentence } from "../../engine/hint-words.ts";
import type { CellMarks, Ladder, Taken } from "../../engine/ladder-runtime.ts";
import type { Point, Rect } from "../../engine/types.ts";
import * as rect from "../../generated/games/rect/rect.compiled.ts";
import { LINE, RECTANGLE, type RectEdge } from "./hint-marks.ts";
import { executeMove, isSolved, readClaims } from "./moves.ts";
import {
  deduction,
  HINT_TIER,
  lineOf,
  type RectReason,
  type RectRung,
  readsOf,
  reasonOf,
  spaceOf,
  WALL,
} from "./solver.ts";
import { HIDDEN, type RectMove, type RectState } from "./state.ts";

export type { RectRung } from "./solver.ts";

/** A step's highlights: nothing but the move's own data, which keep-track and
 * refresh compare against. The marks are the words' (`stepMarks`). */
export type RectHint = null;

/** What the player's marks say of each edge, as the description reads it: a
 * line, none inside a rectangle drawn round a clue, or 0 where neither. */
function marksOf(s: RectState): Uint8Array {
  const sp = spaceOf(s.w, s.h);
  const claims = readClaims(s);
  const g = new Uint8Array(sp.edges.length);
  for (const e of sp.edges) {
    const { edge, x, y } = lineOf(sp, e);
    const p = sp.edgeEnds[2 * e];
    const q = sp.edgeEnds[2 * e + 1];
    if ((edge === "h" ? claims.hedge : claims.vedge)[y * s.w + x]) g[e] = WALL;
    else if (claims.owner[p] >= 0 && claims.owner[p] === claims.owner[q]) g[e] = 2;
  }
  return g;
}

/** Does a line of these run through the inside of `r`? */
function crossesLine(s: RectState, r: Rect): boolean {
  const { w } = s;
  for (let y = r.y; y < r.y + r.h; y++)
    for (let x = r.x + 1; x < r.x + r.w; x++) if (s.vedge[y * w + x]) return true;
  for (let y = r.y + 1; y < r.y + r.h; y++)
    for (let x = r.x; x < r.x + r.w; x++) if (s.hedge[y * w + x]) return true;
  return false;
}

/** Are all four sides of `r` drawn? */
function isDrawn(s: RectState, r: Rect): boolean {
  const { w, h } = s;
  for (let y = r.y; y < r.y + r.h; y++) {
    if (r.x > 0 && !s.vedge[y * w + r.x]) return false;
    if (r.x + r.w < w && !s.vedge[y * w + r.x + r.w]) return false;
  }
  for (let x = r.x; x < r.x + r.w; x++) {
    if (r.y > 0 && !s.hedge[r.y * w + x]) return false;
    if (r.y + r.h < h && !s.hedge[(r.y + r.h) * w + x]) return false;
  }
  return true;
}

/** Whether `f` changes the board: a rectangle or a line the player has not
 * already drawn. A side of a rectangle that may still grow is not a line to
 * the walk, so a firing can prove one the player drew. */
function drawsSomething(s: RectState, f: RectReason): boolean {
  if (f.kind === "line")
    return !(f.edge.edge === "h" ? s.hedge : s.vedge)[f.edge.y * s.w + f.edge.x];
  return !(isDrawn(s, f.rect) && !crossesLine(s, f.rect));
}

/** The move a firing makes. */
function moveOf(f: RectReason): RectMove {
  if (f.kind === "line") return { type: "edge", ...f.edge };
  return { type: "rect", erasing: false, ...f.rect };
}

const SHAPE_WORDS = ["", "square", "tall", "wide"];

/** The clue at square `clue` as it reads on the board, for "the …": its
 * number ("6"), after its shape where it names one ("square 4"); without a
 * number, its shape and "clue" ("tall clue"), or the question mark a plain one
 * shows ("? clue"), since a bare "?" reads in a sentence as a stray symbol. */
function clueName(s: RectState, clue: number): string {
  const n = s.grid[clue];
  const shape = SHAPE_WORDS[s.shapes[clue]];
  if (n === HIDDEN) return `${shape || "?"} clue`;
  return shape ? `${shape} ${n}` : String(n);
}

/** What a step's marks are drawn on: squares, and the rectangle or edge it
 * draws. */
type Element = Point | Rect | RectEdge;
const KINDS = {
  rectangle: RECTANGLE as MarkKind<Element>,
  line: LINE as MarkKind<Element>,
};

/** The sentence of a firing's reason: the steps `rect.description.yaml`
 * declares, whose number terms are clues by square, printed by name. */
function sayReason(s: RectState, f: RectReason): Sentence {
  const speak = rect.voice<Element>({
    kind: CELL as MarkKind<Element>,
    kinds: KINDS,
    value: (clue) => clueName(s, clue),
  });
  const at = (i: number): Point => ({ x: i % s.w, y: Math.floor(i / s.w) });
  if (f.kind === "line") {
    const several = f.clues.length > 1;
    const owner = f.owners.length === 1 ? f.owners[0] : null;
    return speak.sentence("line", {
      ring: [f.edge],
      terms: {
        crossers: f.clues,
        owners: f.owners,
        several,
        many: f.takes.length > 1,
        // Two clues that read alike are the crossing one and its "other".
        same:
          !several && owner !== null && clueName(s, owner) === clueName(s, f.clues[0]),
        hidden: f.owners.some((c) => s.grid[c] === HIDDEN),
      },
      marks: {
        outline: {
          crossers: f.clues.map(at),
          owners: f.owners.map(at),
          missed: f.misses.map(at),
        },
        stripes: { taken: f.takes.map(at) },
      },
    });
  }
  const ring = [f.rect];
  const q = f.clue;
  const one = f.rect.w * f.rect.h === 1;
  switch (f.kind) {
    case "fit": {
      if (s.grid[q] === 1) return speak.sentence("fitOne", { ring });
      const why =
        (f.offBoard ? 1 : 0) | (f.crossesLine ? 2 : 0) | (f.leavesOut ? 4 : 0);
      return speak.sentence("fit", {
        ring,
        terms: { q, one, why, more: why !== 0 && (why & (why - 1)) !== 0 },
        marks: { outline: { blockers: f.blockers.map(at) } },
      });
    }
    case "boxed":
      return speak.sentence("boxed", { ring, terms: { q, one } });
    case "reach":
      return speak.sentence("reach", {
        ring,
        terms: { q, one },
        marks: { outline: { square: [at(f.square)] } },
      });
    case "overlap":
      return speak.sentence("overlap", {
        ring,
        terms: {
          q,
          p: f.other,
          same: clueName(s, q) === clueName(s, f.other),
          one,
          several: f.core.length > 1,
        },
        marks: { outline: { other: [at(f.other)] }, stripes: { core: f.core.map(at) } },
      });
    case "starve":
      return speak.sentence("starve", {
        ring,
        terms: { q, one },
        marks: {
          outline: { clues: f.starved.map(at), squares: f.stranded.map(at) },
        },
      });
  }
}

/** What each technique says, as the hint's sentences read it. */
type RectSays = rect.SaysById;

/** What the walk reads a firing by: the board as the plan's steps have drawn
 * it, and the marks. */
interface RectWalkContext {
  board: RectState;
  dl: rect.Dealt;
  marks: CellMarks;
}

/** What a sentence is told of its step: why the firing holds. */
interface RectMarked {
  reason: RectReason;
}

/** Why a taken firing drew what it did, from the edges as they stood before
 * it: `grid`. */
function reasonBefore(
  taken: Taken,
  ctx: RectWalkContext,
  grid: ArrayLike<number>,
): RectReason {
  const { says } = spokenOf<{ terms: rect.SaysById[RectRung]["terms"] }>(taken);
  return reasonOf(
    { sp: ctx.marks.sp, grid },
    ctx.dl,
    taken.entry.id as RectRung,
    says.terms,
  );
}

/** A firing's step: the rectangle or line it draws on the walk's board. A
 * rectangle the player drew already, proved whole, or a side of one proved a
 * line, is no step: nothing is left to draw. */
function stepOf(
  fired: Fired<RectSays[keyof RectSays], RectWalkContext>,
): { move: RectMove; highlights: RectHint; marked: RectMarked }[] {
  const { taken, ctx, marks: m } = fired;
  // The edges as they stood before the firing: every edge it sets was open.
  const before = Uint8Array.from(m.grid);
  for (let i = 0; i < taken.facts.length; i += 3) before[taken.facts[i + 1]] = 0;
  const reason = reasonBefore(taken, ctx, before);
  if (!drawsSomething(ctx.board, reason)) return [];
  const move = moveOf(reason);
  ctx.board = executeMove(ctx.board, move);
  return [{ move, highlights: null, marked: { reason } }];
}

/** The ladder over the player's lines, and the inside of each rectangle they
 * drew round a clue. */
function rectWalk(state: RectState): {
  marks: CellMarks;
  entries: Ladder["entries"];
  ctx: RectWalkContext;
} {
  const { m, ladder, dl } = deduction(state.w, state.h, state, marksOf(state));
  return { marks: m, entries: ladder.entries, ctx: { board: state, dl, marks: m } };
}

/**
 * The plan from the player's lines to the end, a step per rectangle or line.
 * Stops where the ladder runs out.
 */
export const rectHint = describedEdgeHint<
  RectState,
  RectMove,
  RectHint,
  RectMarked,
  RectWalkContext,
  RectSays,
  RectRung
>({
  name: "rect hint",
  walk: rectWalk,
  tiers: { lowest: () => HINT_TIER, count: HINT_TIER + 1 },
  done: (_marks, ctx) => isSolved(ctx.board),
  reads: (taken, ctx) =>
    readsOf(ctx.marks.sp, reasonBefore(taken, ctx, ctx.marks.grid)),
  step: stepOf,
  // Every technique's sentence is a declared step: why each other rectangle
  // fails is the game's reading of the board (`reasonOf`), and a clue is
  // named as the board draws it, which no binding's term says.
  say: (_spoken, { reason }, state) => sayReason(state, reason),
});

/**
 * The step is done when the player's move leaves exactly the lines the step's
 * own move would, however they were drawn (a drag, or the sides one at a
 * time). A move that changes only lines the step would change, and changes
 * them the same way, is on track. `state` is the board before the move.
 */
export function rectKeepTrack(
  m: RectMove,
  step: HintStep<RectMove, RectHint>,
  state: RectState,
): HintTrackVerdict {
  const planned = executeMove(state, step.move);
  const after = executeMove(state, m);
  let done = true;
  let moved = false;
  let astray = false;
  const pairs: [Uint8Array, Uint8Array, Uint8Array][] = [
    [state.hedge, after.hedge, planned.hedge],
    [state.vedge, after.vedge, planned.vedge],
  ];
  for (const [before, now, want] of pairs)
    for (let i = 0; i < before.length; i++) {
      if (now[i] !== want[i]) done = false;
      if (now[i] === before[i]) continue;
      if (now[i] === want[i]) moved = true;
      else astray = true;
    }
  if (done) return "completed";
  return moved && !astray ? "onTrack" : "off";
}

/** A stored step whose lines are already on the board is resolved. */
export function rectRefreshStep(
  step: HintStep<RectMove, RectHint, RectRung>,
  state: RectState,
): HintStep<RectMove, RectHint, RectRung> | null {
  const m = step.move;
  switch (m.type) {
    case "rect":
      return isDrawn(state, m) && !crossesLine(state, m) ? null : step;
    case "edge":
      return (m.edge === "h" ? state.hedge : state.vedge)[m.y * state.w + m.x]
        ? null
        : step;
    // A step draws a rectangle or a line; it never solves or resizes.
    case "solve":
    case "resize":
      return step;
    default:
      return assertNever(m, "rect hint refresh");
  }
}
