/**
 * Ball Sort: pour the balls between tubes until every tube is empty or full
 * of one color. A pour moves the top run of one color, as much of it as fits,
 * onto a ball of its color or into an empty tube.
 *
 * A game of this app's own (`add-ball-sort`); the owner's decisions are in
 * that change's proposal and the session's in its design. This file is the
 * `Game` object and its input; the rules are the description's, the search
 * [`solver.ts`](./solver.ts), the board [`state.ts`](./state.ts).
 */

import type { SolveResult } from "../../engine/contract/game.ts";
import type { Point } from "../../engine/contract/types.ts";
import { nothingToDeduce } from "../../engine/hint-finishes.ts";
import { drag } from "../../engine/hint-gesture.ts";
import {
  type Game,
  registerGame,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/index.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
} from "../../engine/pointer.ts";
import { solveBySearch } from "../../engine/search-outcome.ts";
import {
  interpretTargetVerbs,
  pressTarget,
  type TargetVerbs,
} from "../../engine/target-verb.ts";
import { newDesc } from "./generator.ts";
import {
  BALLSORT_RUNGS,
  type BallsortRung,
  hasNoSolution,
  hint,
  hintKeepTrack,
} from "./hint.ts";
import { HINT_MARKS } from "./kinds.ts";
import {
  type BallsortDrawState,
  colors,
  computeSize,
  newDrawState,
  POUR_SECONDS,
  PREFERRED_TILE_SIZE,
  redraw,
  rowsFor,
  tubeCenter,
  tubeUnder,
} from "./render.ts";
import { findFinish } from "./solver.ts";
import {
  type BallsortMove,
  type BallsortParams,
  type BallsortPour,
  type BallsortState,
  type BallsortUi,
  decodeParams,
  defaultParams,
  deserializeMove,
  encodeParams,
  heightOf,
  legalPour,
  menu,
  newState,
  newUi,
  paramConfig,
  poured,
  serializeMove,
  sortedBoard,
  status,
  textFormat,
  validateParams,
} from "./state.ts";

export type { BallsortMove, BallsortParams, BallsortState, BallsortUi };

// --- input ------------------------------------------------------------------

/** The cursor's step for an arrow: along a row of tubes, or to the row above
 * or below. */
function cursorStep(s: BallsortState, button: number): number {
  const perRow = Math.ceil(s.w / rowsFor(s.w, s.h));
  if (button === CURSOR_LEFT) return -1;
  if (button === CURSOR_RIGHT) return 1;
  if (button === CURSOR_UP) return -perRow;
  if (button === CURSOR_DOWN) return perRow;
  return 0;
}

/**
 * A tube is the target, and a pour is picked in two parts (`docs/input.md` §
 * "A move picked in parts"): the first tap picks up a tube's top run, the
 * second pours it into the tapped tube. A tap on the tube picked up puts it
 * down; a tap where it cannot pour picks that tube up instead, or puts the
 * run down where that tube is empty.
 */
const verbs: TargetVerbs<
  BallsortState,
  BallsortUi,
  BallsortDrawState,
  number,
  BallsortMove
> = {
  geometry: {
    noun: "tube",
    pointerTarget: (s, ds, p) => tubeUnder(s, ds.tileSize, p),
    pointAt: (s, ds, t) => tubeCenter(s, ds.tileSize, t),
    cursorTarget: (_s, ui) => ui.cursor.x,
    parkCursor: (ui, t) => {
      ui.cursor.x = t;
      ui.cursor.y = 0;
    },
    moveCursor(s, ui, button) {
      const step = cursorStep(s, button);
      if (step === 0) return false;
      const shown = ui.cursor.visible;
      ui.cursor.visible = true;
      const next = ui.cursor.x + step;
      if (next < 0 || next >= s.w) return !shown;
      ui.cursor.x = next;
      return true;
    },
  },
  primary: {
    does: "pick up its top balls, or pour the balls you picked up into it",
    apply(s, t, ui) {
      const held = ui.held;
      if (held === t) {
        ui.held = null;
        return UI_UPDATE;
      }
      if (held !== null) {
        const m: BallsortPour = { type: "pour", from: held, to: t };
        if (legalPour(s, m) !== null) return m;
      }
      if (heightOf(s, t) === 0) {
        if (held === null) return null;
        ui.held = null;
        return UI_UPDATE;
      }
      ui.held = t;
      return UI_UPDATE;
    },
  },
};

/** How far, in pixels, a press travels before it is a drag. */
const dragFrom = (ts: number): number => Math.max(4, Math.floor(ts / 4));

function interpretMove(
  s: BallsortState,
  ui: BallsortUi,
  ds: BallsortDrawState,
  p: Point,
  button: number,
): BallsortMove | UiUpdate | null {
  const ts = ds.tileSize;
  if (button === LEFT_BUTTON) {
    const t = tubeUnder(s, ts, p);
    if (t === null) {
      // A press on the board around the tubes puts down what was picked up.
      if (ui.held === null) return null;
      ui.held = null;
      return UI_UPDATE;
    }
    // A press could be a tap or a drag, so it decides on the release
    // (`docs/input.md` § "A button with two meanings resolves on the release").
    // With nothing picked up, both pick up this tube's run, so the press
    // lifts it at once and the finger going down is answered.
    pressTarget(verbs, ui, t);
    const lifted = ui.held === null && heightOf(s, t) > 0;
    if (lifted) ui.held = t;
    ui.drag = {
      from: t,
      pressX: p.x,
      pressY: p.y,
      x: p.x,
      y: p.y,
      moved: false,
      lifted,
    };
    return UI_UPDATE;
  }
  if (isMouseDrag(button) && ui.drag) {
    const d = ui.drag;
    const far = Math.hypot(p.x - d.pressX, p.y - d.pressY) >= dragFrom(ts);
    // A drag carries a run, so one from an empty tube stays a press.
    if (!d.moved && far && heightOf(s, d.from) > 0) {
      d.moved = true;
      ui.held = null;
    }
    d.x = p.x;
    d.y = p.y;
    return UI_UPDATE;
  }
  if (isMouseRelease(button) && ui.drag) {
    const d = ui.drag;
    ui.drag = null;
    if (!d.moved) {
      if (d.lifted) return UI_UPDATE;
      return verbs.primary.apply(s, d.from, ui) ?? UI_UPDATE;
    }
    const t = tubeUnder(s, ts, p);
    if (t === null || t === d.from) return UI_UPDATE;
    const m: BallsortPour = { type: "pour", from: d.from, to: t };
    return legalPour(s, m) === null ? UI_UPDATE : m;
  }
  return interpretTargetVerbs(verbs, s, ui, ds, p, button);
}

// --- moves ------------------------------------------------------------------

function executeMove(s: BallsortState, m: BallsortMove): BallsortState {
  if (m.type === "solve") return sortedBoard(s, m.tubes);
  return poured(s, m);
}

/** What is picked up names a tube by what it held, and a changed board need
 * not hold it there, so nothing picked up or dragged survives a change. */
function changedState(
  ui: BallsortUi,
  _old: BallsortState | null,
  _next: BallsortState,
): void {
  ui.held = null;
  ui.drag = null;
}

/** The sorted board of a shortest line from the player's position, else from
 * the board as dealt. */
function solve(orig: BallsortState, curr: BallsortState): SolveResult<BallsortMove> {
  return solveBySearch(orig, curr, findFinish, (from, line) => {
    let at = from;
    for (const m of line) at = poured(at, m);
    const tubes = Array.from(
      { length: at.w },
      (_, t) => at.ball[(at.h - 1) * at.w + t],
    );
    return { type: "solve", tubes };
  });
}

/** One pour flies; anything else (a Solve) appears at once. */
function animLength(a: BallsortState, b: BallsortState): number {
  let lost = 0;
  let gained = 0;
  for (let t = 0; t < a.w; t++) {
    const d = heightOf(b, t) - heightOf(a, t);
    if (d < 0) lost++;
    if (d > 0) gained++;
  }
  return lost === 1 && gained === 1 ? POUR_SECONDS : 0;
}

// --- register ---------------------------------------------------------------

export const ballsortGame: Game<
  BallsortParams,
  BallsortState,
  BallsortMove,
  BallsortUi,
  BallsortDrawState,
  unknown,
  unknown,
  BallsortRung
> = {
  id: "ballsort",
  // A press and its release are the whole game, and the secondary button
  // has nothing of its own to do.
  ignoresSecondaryButton: true,

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig,

  newDesc,
  newState,
  newUi,

  targetVerbs: verbs,
  changedState,
  interpretMove,
  executeMove,
  finishesByDeduction: nothingToDeduce,
  status,
  notApplicable: {
    findMistakes:
      "Any order of pours that sorts the tubes wins, so there is no single answer to check a pour against.",
    transposeParams:
      "Tubes stand upright and fill from the bottom, so a board turned on its side would be a different puzzle; the tubes reflow into rows to fit instead.",
  },

  solve,
  hasNoSolution,
  hint: {
    plan: hint,
    marks: HINT_MARKS,
    rungs: BALLSORT_RUNGS,
    keepTrack: hintKeepTrack,
    // The drag a player makes: the run picked up out of one tube and dropped
    // on the other, whatever was picked up before.
    gesture(s, _ui, ds, m) {
      if (m.type !== "pour") return [];
      return [
        drag(tubeCenter(s, ds.tileSize, m.from), tubeCenter(s, ds.tileSize, m.to)),
      ];
    },
  },

  textFormat,
  moveCodec: { serialize: serializeMove, deserialize: deserializeMove },

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
  animLength,
};

registerGame(ballsortGame);
