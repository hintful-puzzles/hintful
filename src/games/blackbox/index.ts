/**
 * Black Box: locate the hidden balls in a `w`×`h` arena by firing lasers
 * from the surrounding range and reading how they hit (`H`), reflect
 * (`R`), or exit (matched entry/exit numbers). Mark guessed balls,
 * optionally lock cells/rows/columns, then verify: a wrong verify shows
 * one piece of evidence and asks again; a right one wins. The laser
 * physics and the verify logic live in `state.ts`; this file is the
 * `Game` glue, input mapping, and the move executor.
 */

import { assertNever } from "../../engine/assert-never.ts";
import {
  type Game,
  type HintStep,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import {
  dimensionParamConfig,
  parseConfigInt,
  transposeDimensions,
} from "../../engine/params.ts";
import { gridCursorMove, LEFT_RELEASE, newCursor } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { MULTIPLE_SOLUTIONS } from "../../engine/solve-failure.ts";
import {
  interpretTargetVerbs,
  type TargetGeometry,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { answerCount, newDesc } from "./answer.ts";
import { hint, hintKeepTrack } from "./hint.ts";
import { HINT_MARKS } from "./hint-text.ts";
import {
  animLength,
  type BlackboxDrawState,
  borderFor,
  colors,
  computeSize,
  flashLength,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  BALL_CORRECT,
  BALL_GUESS,
  BALL_LOCK,
  type BlackboxMove,
  type BlackboxParams,
  type BlackboxState,
  type BlackboxUi,
  ballsText,
  canReveal,
  checkGuesses,
  cloneState,
  decodeParams,
  defaultParams,
  encodeParams,
  fireLaser,
  grid2range,
  gridGet,
  gridIdx,
  LASER_EMPTY,
  LASER_OMITTED,
  LASER_WRONG,
  newState,
  presets,
  range2grid,
  revealAnswer,
  status,
  validateParams,
} from "./state.ts";

// --- UI ----------------------------------------------------------------

function newUi(_state: BlackboxState): BlackboxUi {
  return {
    flashLaserno: LASER_EMPTY,
    errors: 0,
    newmove: false,
    cursor: newCursor(1, 1),
    flashLaser: 0,
  };
}

/** Upstream `game_changed_state`: a `justwrong` state reached by an
 * actual move (not an undo) bumps the session error counter. */
function changedState(
  ui: BlackboxUi,
  _oldState: BlackboxState | null,
  state: BlackboxState,
): void {
  if (state.justwrong && ui.newmove) ui.errors++;
  ui.newmove = false;
}

// --- input ------------------------------------------------------------

/** Pixel → grid cell, truncating toward zero like upstream's `FROMDRAW`, so
 * a click in the left/top border margin folds onto cell 0 (where `(0,0)`
 * is the reveal button). */
function fromDraw(px: number, ts: number): number {
  return Math.trunc((px - borderFor(ts)) / ts);
}

function interpretMove(
  state: BlackboxState,
  ui: BlackboxUi,
  ds: BlackboxDrawState,
  p: Point,
  button: number,
): BlackboxMove | null | UiUpdate {
  // The flash a click starts lasts while the button is held.
  if (button === LEFT_RELEASE) {
    ui.flashLaser = 0;
    return UI_UPDATE;
  }
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, button);
}

const interior = (s: BlackboxState, { x, y }: Point) =>
  x >= 1 && x <= s.w && y >= 1 && y <= s.h;

/** Whether `(x, y)` on the `(w+2) × (h+2)` grid is anywhere to aim: the box,
 * an entry point around its edge, or the corner's "I'm done" button while it
 * shows. */
function onTarget(s: BlackboxState, t: Point): boolean {
  if (t.x === 0 && t.y === 0) return canReveal(s);
  return interior(s, t) || grid2range(s.w, s.h, t.x, t.y) !== null;
}

/**
 * A target is a square of the box, an entry point around its edge, or the
 * corner button. The cursor walks the `(w+2) × (h+2)` grid, never onto a
 * corner but the button's, and only while the button shows.
 */
const geometry: TargetGeometry<BlackboxState, BlackboxUi, BlackboxDrawState, Point> = {
  noun: "square",
  pointerTarget(s, ds, p) {
    const t = { x: fromDraw(p.x, ds.tileSize), y: fromDraw(p.y, ds.tileSize) };
    return onTarget(s, t) ? t : null;
  },
  pointAt(_s, ds, t) {
    const ts = ds.tileSize;
    const mid = (v: number) => borderFor(ts) + v * ts + Math.floor(ts / 2);
    return { x: mid(t.x), y: mid(t.y) };
  },
  cursorTarget: (s, ui) =>
    onTarget(s, ui.cursor) ? { x: ui.cursor.x, y: ui.cursor.y } : null,
  parkCursor(ui, t) {
    ui.cursor.x = t.x;
    ui.cursor.y = t.y;
  },
  moveCursor(s, ui, button) {
    // An edge no-op leaves the cursor in place but still reveals it and
    // repaints.
    const to = gridCursorMove(button, ui.cursor.x, ui.cursor.y, s.w + 2, s.h + 2) ?? {
      x: ui.cursor.x,
      y: ui.cursor.y,
    };
    const corner = (to.x === 0 || to.x === s.w + 1) && (to.y === 0 || to.y === s.h + 1);
    if (corner && !(to.x === 0 && to.y === 0 && canReveal(s))) return false;
    ui.cursor.x = to.x;
    ui.cursor.y = to.y;
    ui.cursor.visible = true;
    return true;
  },
};

/** A move the player made, as opposed to one on a revealed board, which only
 * the flash of a laser can change; `newmove` lets `changedState` count a wrong
 * guess once. */
function played(
  s: BlackboxState,
  ui: BlackboxUi,
  move: BlackboxMove,
): BlackboxMove | null {
  if (s.reveal) return null;
  ui.newmove = true;
  return move;
}

const targetVerbs: TargetVerbs<
  BlackboxState,
  BlackboxUi,
  BlackboxDrawState,
  Point,
  BlackboxMove
> = {
  geometry,
  primary: {
    does:
      "send a beam into the box from a square around its edge, or place or " +
      "remove a guessed ball on a square inside it",
    apply(s, t, ui) {
      if (t.x === 0 && t.y === 0) {
        if (ui.cursor.visible) {
          ui.cursor.x = 1;
          ui.cursor.y = 1;
        }
        return played(s, ui, { type: "reveal" });
      }
      if (interior(s, t))
        return gridGet(s, t.x, t.y) & BALL_LOCK
          ? null
          : played(s, ui, { type: "toggleBall", x: t.x, y: t.y });
      const rangeno = grid2range(s.w, s.h, t.x, t.y) ?? LASER_EMPTY;
      if (s.reveal && s.exits[rangeno] === LASER_EMPTY) return null;
      // A click's flash lasts while the button is held, a key's for a moment;
      // the model shows the cursor exactly when a key is driving.
      ui.flashLaserno = rangeno;
      ui.flashLaser = ui.cursor.visible ? 2 : 1;
      if (s.exits[rangeno] !== LASER_EMPTY) return UI_UPDATE; // re-flash
      return played(s, ui, { type: "fire", rangeno });
    },
  },
  secondary: {
    does:
      "mark a square inside the box as definitely known, so it takes no ball, " +
      "or a square around the edge to mark the whole row or column it looks into",
    apply(s, t, ui) {
      if (t.x === 0 && t.y === 0) return null;
      if (interior(s, t)) return played(s, ui, { type: "toggleLock", x: t.x, y: t.y });
      return t.y === 0 || t.y > s.h
        ? played(s, ui, { type: "toggleColumnLock", x: t.x })
        : played(s, ui, { type: "toggleRowLock", y: t.y });
    },
  },
};

// --- moves ------------------------------------------------------------

/** Lock every cell of a row or column, or unlock them all if more than half
 * are locked already. */
function toggleLineLock(grid: Int32Array, cells: number[]): void {
  const unlock = cells.filter((i) => grid[i] & BALL_LOCK).length > cells.length / 2;
  for (const i of cells) grid[i] = unlock ? grid[i] & ~BALL_LOCK : grid[i] | BALL_LOCK;
}

function executeMove(from: BlackboxState, m: BlackboxMove): BlackboxState {
  const ret = cloneState(from);

  // Leaving a `justwrong` state clears the one-error highlight.
  if (ret.justwrong) {
    ret.justwrong = false;
    for (let i = 0; i < ret.nlasers; i++) {
      if (ret.exits[i] !== LASER_EMPTY) ret.exits[i] &= ~(LASER_OMITTED | LASER_WRONG);
    }
  }

  if (m.type === "solve") {
    revealAnswer(ret);
    return ret;
  }

  if (from.reveal) throw new Error("No moves once the answer is revealed");

  switch (m.type) {
    case "toggleBall": {
      if (m.x < 1 || m.y < 1 || m.x > ret.w || m.y > ret.h)
        throw new Error("Ball toggle outside arena");
      const idx = gridIdx(ret.w, m.x, m.y);
      ret.nguesses += ret.grid[idx] & BALL_GUESS ? -1 : 1;
      ret.grid[idx] ^= BALL_GUESS;
      break;
    }
    case "fire": {
      if (m.rangeno < 0 || m.rangeno >= ret.nlasers)
        throw new Error("Laser index out of range");
      if (ret.exits[m.rangeno] !== LASER_EMPTY) throw new Error("Laser already fired");
      fireLaser(ret, m.rangeno);
      break;
    }
    case "reveal": {
      if (ret.nguesses < ret.minballs || ret.nguesses > ret.maxballs)
        throw new Error("Ball count out of range to reveal");
      checkGuesses(ret);
      break;
    }
    case "toggleLock": {
      if (m.x < 1 || m.y < 1 || m.x > ret.w || m.y > ret.h)
        throw new Error("Lock toggle outside arena");
      ret.grid[gridIdx(ret.w, m.x, m.y)] ^= BALL_LOCK;
      break;
    }
    case "toggleColumnLock": {
      if (m.x < 1 || m.x > ret.w) throw new Error("Column out of range");
      const cells = Array.from({ length: ret.h }, (_, y) => gridIdx(ret.w, m.x, y + 1));
      toggleLineLock(ret.grid, cells);
      break;
    }
    case "toggleRowLock": {
      if (m.y < 1 || m.y > ret.h) throw new Error("Row out of range");
      const cells = Array.from({ length: ret.w }, (_, x) => gridIdx(ret.w, x + 1, m.y));
      toggleLineLock(ret.grid, cells);
      break;
    }
    default:
      return assertNever(m, "blackbox: executeMove");
  }

  return ret;
}

// --- mistakes ---------------------------------------------------------

/** A guess on a square with no ball, and a square marked known that holds
 * one. Every board has one answer (`answer.ts`), so these are exactly the
 * marks no finish could keep. */
function findMistakes(s: BlackboxState): readonly Point[] {
  if (s.reveal) return [];
  const out: Point[] = [];
  for (let y = 1; y <= s.h; y++)
    for (let x = 1; x <= s.w; x++) {
      const v = gridGet(s, x, y);
      const ball = (v & BALL_CORRECT) !== 0;
      if ((v & BALL_GUESS && !ball) || (v & BALL_LOCK && ball)) out.push({ x, y });
    }
  return out;
}

// --- hint -------------------------------------------------------------

/** A click on the square the step's move acts on: a box square, a laser's
 * range square, or the corner button. */
function hintGesture(
  state: BlackboxState,
  ui: BlackboxUi,
  ds: BlackboxDrawState,
  move: BlackboxMove,
  step: HintStep<BlackboxMove>,
): readonly PointerAction[] {
  let target: Point;
  if (move.type === "toggleBall" || move.type === "toggleLock")
    target = { x: move.x, y: move.y };
  else if (move.type === "fire")
    target = range2grid(state.w, state.h, move.rangeno) as Point;
  else if (move.type === "reveal") target = { x: 0, y: 0 };
  else return [];
  return verbClicks(targetVerbs, { executeMove, hintKeepTrack }, state, ui, ds, step, [
    target,
  ]);
}

// --- status bar -------------------------------------------------------

function statusbarText(state: BlackboxState, ui: BlackboxUi): string {
  let buf: string;
  if (state.reveal) {
    // A reveal is a win, which the engine's own words announce.
    buf = "";
  } else if (state.justwrong) {
    buf = "Wrong! Guess again.";
  } else if (state.nguesses > state.maxballs) {
    buf = `${state.nguesses - state.maxballs} too many balls marked.`;
  } else if (state.nguesses >= state.minballs) {
    buf = "Click button to verify guesses.";
  } else if (state.maxballs === state.minballs) {
    buf = `Balls marked: ${state.nguesses} / ${state.minballs}`;
  } else {
    buf = `Balls marked: ${state.nguesses} / ${state.minballs}-${state.maxballs}.`;
  }
  if (ui.errors) buf += ` (${ui.errors} error${ui.errors > 1 ? "s" : ""})`;
  return buf;
}

// --- Game object ------------------------------------------------------

export const blackboxGame: Game<
  BlackboxParams,
  BlackboxState,
  BlackboxMove,
  BlackboxUi,
  BlackboxDrawState,
  Point
> = {
  id: "blackbox",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig: [
    ...dimensionParamConfig<BlackboxParams>({
      doc: "Size of the box in squares.",
      bounds: { min: 2, max: 255 },
    }),
    {
      // Upstream's single "No. of balls" string, `N` or `N-M`. A garbled
      // field parses to 0, which validateParams rejects with its message.
      kw: "no-of-balls",
      name: "No. of balls",
      type: "string",
      doc: "How many balls are hidden. Give a single number, or a range such as <code>3-6</code> for a number picked at random from that range, which you then have to find out as you play. There must be at least one ball, and fewer balls than squares.",
      label: {
        slot: "tail",
        words: (p) => `${ballsText(p)} ${ballsText(p) === "1" ? "ball" : "balls"}`,
      },
      get: ballsText,
      set: (p, v) => {
        const dash = v.indexOf("-");
        if (dash >= 0) {
          p.minballs = parseConfigInt(v.slice(0, dash));
          p.maxballs = parseConfigInt(v.slice(dash + 1));
        } else {
          p.minballs = p.maxballs = parseConfigInt(v);
        }
      },
    },
  ],

  newDesc,
  newState,
  newUi,
  changedState,

  targetVerbs,
  interpretMove,
  executeMove,
  status,
  findMistakes,

  solve(orig: BlackboxState) {
    // A board the lasers cannot pin down has no single answer to show, and
    // saying so is what keeps such a board from loading (`loadDesc`). A count
    // past its budget settles nothing, so the board is taken as it comes.
    if (answerCount(orig) === 2) return { ok: false, error: MULTIPLE_SOLUTIONS };
    // The real balls, guessed and revealed: upstream's Solve revealed them
    // beside the player's guesses, scored as a loss.
    return { ok: true, move: { type: "solve" } };
  },

  hint,
  hintMarks: HINT_MARKS,
  hintKeepTrack,
  hintGesture,

  statusbarText,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
  animLength,
  flashLength,
};

registerGame(blackboxGame);
