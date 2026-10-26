/**
 * Inertia — native TS port (upstream `puzzles/inertia.c`).
 *
 * Slide a ball around a grid collecting gems. The ball cannot stop where it
 * likes: once set off in one of eight directions it keeps going until a stop
 * square catches it or a wall blocks its way — and it dies on any mine it
 * touches.
 *
 * The deaths tally lives on the Ui rather than the state, so undo and redo can
 * neither rewind nor re-count a death.
 */

import { assertNever } from "../../engine/assert-never.ts";
import {
  type Game,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { coord, fromCoord } from "../../engine/geometry.ts";
import { nothingToDeduce } from "../../engine/hint-finishes.ts";
import { drag } from "../../engine/hint-gesture.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  cursorDelta,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MOD_NUM_KEYPAD,
  numpadDirection,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newInertiaDesc } from "./generator.ts";
import {
  hasNoSolution,
  hint,
  hintKeepTrack,
  INERTIA_RUNGS,
  type InertiaRung,
} from "./hint.ts";
import {
  animLength,
  BORDER,
  colors,
  computeSize,
  flashLength,
  type InertiaDrawState,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import { solveRoute } from "./solver.ts";
import {
  DIRECTIONS,
  DX,
  DY,
  decodeParams,
  defaultParams,
  encodeParams,
  type InertiaMove,
  type InertiaParams,
  type InertiaState,
  type InertiaUi,
  newState,
  PRESETS,
  paramConfig,
  slide,
  textFormat,
  validateParams,
  WALL,
} from "./state.ts";

// --- moves -----------------------------------------------------------

/** One slide, refused where the ball cannot go. */
function play(s: InertiaState, dir: number): InertiaState {
  if (dir < 0 || dir >= DIRECTIONS) throw new Error(`inertia: bad direction ${dir}`);
  if (s.dead) throw new Error("inertia: the ball is dead");
  if (s.board.at(s.px + DX[dir], s.py + DY[dir]) === WALL) {
    throw new Error("inertia: there's a wall in the way");
  }
  return slide(s, dir);
}

function executeMove(s: InertiaState, m: InertiaMove): InertiaState {
  if (m.type === "solution") {
    // The ball jumps to the route's end rather than animating one slide across
    // the board.
    return { ...m.route.reduce(play, s), distanceMoved: 0 };
  }
  if (m.type !== "move") return assertNever(m, "inertia: executeMove");
  return play(s, m.dir);
}

// --- input -----------------------------------------------------------

/**
 * The direction a key names, or -1: an arrow, or a digit read off the number
 * pad's own layout, which is the compass.
 *
 * Upstream accepts the digits only with the `MOD_NUM_KEYPAD` bit set, but a
 * numpad produces a digit only with Num Lock on, and a laptop may have no numpad
 * (docs/input.md § "The numeric keypad never arrives"). So the top row's
 * digits are read as the pad's: without them the four **diagonal** moves are
 * unreachable from the keyboard. Inertia binds no other digit, so nothing
 * collides.
 */
function keyDirection(button: number): number {
  const step = numpadDirection(button | MOD_NUM_KEYPAD) ?? cursorDelta(button);
  if (step === null) return -1;
  return DX.findIndex((dx, dir) => dx === step.dx && DY[dir] === step.dy);
}

/** The octant (0 = north, then clockwise) of an offset `dx`/`dy` from the ball:
 * `atan2(dx, -dy)` measures the angle clockwise from north. */
function octantFrom(dx: number, dy: number): number {
  const angle = (Math.atan2(dx, -dy) + Math.PI / 8) / (Math.PI / 4);
  return Math.floor(angle + 16) & 7;
}

/**
 * Where a swipe held at `p` is currently aimed, or -1 for "nowhere yet".
 *
 * Nowhere means one of two things: the pointer is still on the ball (so the
 * player has not committed to a direction — and dragging back onto the ball is
 * how they call the whole thing off), or it is aimed at a wall, which is not a
 * move the ball can make. Either way no arrow is drawn, which is the feedback.
 */
function aimedDirection(s: InertiaState, ts: number, p: Point): number {
  const dx = p.x - (coord(s.px, ts, BORDER) + ts / 2);
  const dy = p.y - (coord(s.py, ts, BORDER) + ts / 2);

  // Half a tile: the ball itself, plus a little forgiveness around it.
  if (Math.hypot(dx, dy) < ts / 2) return -1;

  const dir = octantFrom(dx, dy);
  return s.board.at(s.px + DX[dir], s.py + DY[dir]) === WALL ? -1 : dir;
}

function interpretMove(
  s: InertiaState,
  ui: InertiaUi,
  ds: InertiaDrawState,
  p: Point,
  button: number,
): InertiaMove | null | UiUpdate {
  const ts = ds.tileSize;
  let dir = -1;

  if (button === LEFT_BUTTON) {
    const cx = fromCoord(p.x, ts, BORDER);
    const cy = fromCoord(p.y, ts, BORDER);

    if (cx === s.px && cy === s.py) {
      // Pressing *on* the ball begins a swipe: hold it, drag out the way you
      // want to go, and let go. Upstream's only pointer aim is clicking a cell
      // in the right octant, which is fiddly with a finger.
      if (s.dead) return null;
      ui.aiming = true;
      ui.aimDir = -1;
      return UI_UPDATE;
    }

    // Clicking away from the ball: go toward the octant the click falls in.
    dir = octantFrom(cx - s.px, cy - s.py);
  } else if (button === LEFT_DRAG && ui.aiming) {
    const aimed = aimedDirection(s, ts, p);
    if (aimed === ui.aimDir) return null; // nothing to repaint
    ui.aimDir = aimed;
    return UI_UPDATE;
  } else if (button === LEFT_RELEASE && ui.aiming) {
    const aimed = ui.aimDir;
    ui.aiming = false;
    ui.aimDir = -1;
    // Released still on the ball (or aimed at a wall): the swipe is called off,
    // but the arrow has to come off the ball, so this is still a repaint.
    if (aimed < 0) return UI_UPDATE;
    ui.justMadeMove = true;
    return { type: "move", dir: aimed };
  } else {
    dir = keyDirection(button);
  }

  if (dir < 0 || s.dead) return null;
  if (s.board.at(s.px + DX[dir], s.py + DY[dir]) === WALL) return null;

  ui.justMadeMove = true;
  return { type: "move", dir };
}

// --- status bar ------------------------------------------------------

function statusbarText(s: InertiaState, ui: InertiaUi): string {
  let status = s.dead ? "DEAD!" : s.gems ? `Gems: ${s.gems}` : "";
  if (ui.deaths) status += `   Deaths: ${ui.deaths}`;
  return status;
}

// --- the game --------------------------------------------------------

export const inertiaGame: Game<
  InertiaParams,
  InertiaState,
  InertiaMove,
  InertiaUi,
  InertiaDrawState,
  unknown,
  unknown,
  InertiaRung
> = {
  id: "inertia",
  // A click and the swipe from the ball are the whole of the pointer input,
  // so a held finger aiming the swipe stays the swipe.
  ignoresSecondaryButton: true,

  defaultParams,
  presets() {
    return {
      title: "Inertia",
      submenu: PRESETS.map((p) => ({ params: { ...p } })),
    };
  },
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newInertiaDesc,
  newState,
  newUi: (): InertiaUi => ({
    deaths: 0,
    justMadeMove: false,
    justDied: false,
    animLength: 0,
    aiming: false,
    aimDir: -1,
  }),

  changedState(ui: InertiaUi, oldState: InertiaState | null, s: InertiaState): void {
    // Count a death only when the player just walked into it, on a board that
    // wasn't already finished — so redoing a suicide doesn't kill you twice,
    // and once you're done you can play about freely.
    if (oldState && !oldState.dead && s.dead && ui.justMadeMove && oldState.gems) {
      ui.deaths++;
      ui.justDied = true;
    } else {
      ui.justDied = false;
    }
    ui.justMadeMove = false;
  },

  interpretMove,
  executeMove,

  finishesByDeduction: nothingToDeduce,
  status: (s: InertiaState): GameStatus => (s.gems === 0 ? "solved" : "ongoing"),
  notApplicable: {
    findMistakes:
      "Any route that collects every gem wins, so there is no single answer to check a move against.",
  },

  solve(_orig: InertiaState, curr: InertiaState): SolveResult<InertiaMove> {
    const result = solveRoute(curr);
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true, move: { type: "solution", route: result.route } };
  },

  textFormat,
  statusbarText,

  hasNoSolution,

  // A nudge, not Solve: one slide at a time, and the midend does not count it
  // as using the solver.
  hint,
  hintRungs: INERTIA_RUNGS,
  hintMarks: {
    roles: {
      ring: "the way to slide: an arrow on the ball, ringed with it. The words name it by the way it points: north, north-east, east, south-east, south, south-west, west or north-west.",
      outline:
        "the gem the hint is working on, circled in a second color: *the outlined gem*, in its words. It stays circled through every slide the hint spends working toward it. When the ball can no longer reach some gems and there is no hint to give, those are circled instead (*the outlined gems*).",
    },
  },
  hintKeepTrack,
  // The swipe: hold the ball and drag it out along the arrow the hint draws.
  hintGesture(s, _ui, ds, m) {
    if (m.type !== "move") return [];
    const ts = ds.tileSize;
    const mid = (v: number) => coord(v, ts, BORDER) + Math.floor(ts / 2);
    const ball = { x: mid(s.px), y: mid(s.py) };
    return [drag(ball, { x: mid(s.px + DX[m.dir]), y: mid(s.py + DY[m.dir]) })];
  },

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
  animLength,
  flashLength,
  // A death is not a loss (the player undoes and plays on), yet nobody is
  // playing a dead ball, so the timer holds on it.
  timerHolds: (s: InertiaState): boolean => s.dead,
};

registerGame(inertiaGame);
