import { assertNever } from "../../engine/assert-never.ts";
import { completionStatus } from "../../engine/completion-status.ts";
import type {
  Game,
  HintResult,
  HintStep,
  HintTrackVerdict,
  UiUpdate,
} from "../../engine/game.ts";
import { GAME_OVER, NO_MOVE_WORTH_MAKING } from "../../engine/hint-refusal.ts";
import {
  dimensionParamConfig,
  numberItem,
  transposeDimensions,
} from "../../engine/params.ts";
import { newCursor } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  interpretTargetVerbs,
  squareGrid,
  type TargetVerbs,
  verbGesture,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import {
  colors,
  computeSize,
  DEFEAT_FLASH_FRAME,
  type FloodDrawState,
  joinedBy,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  VICTORY_FLASH_FRAME,
} from "./render.ts";
import { completed, fill, solveMoves } from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  FILLX,
  FILLY,
  type FloodMove,
  type FloodParams,
  type FloodState,
  type FloodUi,
  MAXCOLORS,
  newDesc,
  newState,
  presets,
  status,
  textFormat,
  validateDesc,
  validateParams,
} from "./state.ts";

// --- move logic -------------------------------------------------------

/** Apply `fills` in turn to a copy of the grid, advancing the move count. */
function applyFills(state: FloodState, fills: readonly number[]): FloodState {
  const grid = Uint8Array.from(state.grid);
  const queue = new Int32Array(state.w * state.h);
  for (const c of fills) fill(state.w, state.h, grid, FILLX, FILLY, c, queue);
  const moves = state.moves + fills.length;
  return { ...state, grid, moves, completed: completed(grid) };
}

export function executeMove(state: FloodState, move: FloodMove): FloodState {
  if (move.type === "solve") {
    // Snap to solved: the hint plan is the step-by-step experience, so Solve
    // just completes the board.
    if (state.completed) throw new Error("Puzzle is already solved");
    const fills = solveMoves(state.w, state.h, state.grid, state.colors);
    return { ...applyFills(state, fills), cheated: true };
  }
  if (move.type !== "fill") return assertNever(move, "flood: executeMove");

  const corner = state.grid[FILLY * state.w + FILLX];
  if (
    move.color < 0 ||
    move.color >= state.colors ||
    move.color === corner ||
    state.completed
  ) {
    throw new Error(`Illegal flood fill with color ${move.color}`);
  }
  return applyFills(state, [move.color]);
}

// --- UI / input -------------------------------------------------------

function newUi(_state: FloodState): FloodUi {
  return { cursor: newCursor(FILLX, FILLY) };
}

/** Flood-fill from the corner with the color of square `{ x, y }`. A completed
 * grid is one color, so it offers no fill. */
function fillWith(state: FloodState, { x, y }: Point): FloodMove | null {
  const color = state.grid[y * state.w + x];
  return color === state.grid[FILLY * state.w + FILLX] ? null : { type: "fill", color };
}

const targetVerbs: TargetVerbs<FloodState, FloodUi, FloodDrawState, Point, FloodMove> =
  {
    geometry: squareGrid({ size: (s) => s, border: (ts) => Math.floor(ts / 2) }),
    primary: {
      does: "flood-fill the top left corner with that square's color",
      apply: fillWith,
    },
  };

function interpretMove(
  state: FloodState,
  ui: FloodUi,
  ds: FloodDrawState,
  p: Point,
  button: number,
): FloodMove | null | UiUpdate {
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, button);
}

// --- status bar -------------------------------------------------------

/** Upstream's status line: the outcome, then the move count. */
function statusbarText(state: FloodState, _ui: FloodUi): string {
  const count = `${state.moves} / ${state.movelimit} moves`;
  const s = status(state);
  if (s === "lost") return `FAILED! ${count}`;
  return completionStatus(s === "solved", state.cheated, count);
}

// --- hint -------------------------------------------------------------

/** The solver's whole remaining fill sequence, one narrated step per fill.
 * Returning the full plan rather than one step keeps the hint banner
 * populated through an auto-hint run. */
function hint(state: FloodState): HintResult<FloodMove> {
  // Flooded past the move limit: the status is lost, and no fill is legal.
  if (state.completed) return { ok: false, error: GAME_OVER };
  const moves = solveMoves(state.w, state.h, state.grid, state.colors);
  if (moves.length === 0) return { ok: false, error: NO_MOVE_WORTH_MAKING };
  // Each step's dots are read off the board it is shown on: the one the
  // fills before it leave.
  let board = state;
  const { w } = state;
  const steps = moves.map((color): HintStep<FloodMove> => {
    const joined = joinedBy(board, color).map((i) => ({
      x: i % w,
      y: Math.floor(i / w),
    }));
    const words = say.fill(color, joined);
    board = applyFills(board, [color]);
    return { move: { type: "fill", color }, explanation: words.text, words };
  });
  return { ok: true, steps };
}

/** A player fill of the step's color completes it (the plan advances);
 * anything else deviates and drops the plan. */
function hintKeepTrack(
  m: FloodMove,
  step: HintStep<FloodMove>,
  _state: FloodState,
): HintTrackVerdict {
  if (m.type !== "fill" || step.move.type !== "fill") return "off";
  return m.color === step.move.color ? "completed" : "off";
}

// --- flash ------------------------------------------------------------

/** Upstream's `game_flash_length`: leaving the ongoing state flashes the
 * victory rainbow on a win or the defeat blink on a loss. An auto-solve
 * jumps straight to "Auto-solved" with no flash. */
function flashLength(
  oldState: FloodState,
  newState: FloodState,
  dir: number,
  _ui: FloodUi,
): number {
  if (dir !== 1 || newState.cheated) return 0;
  const now = status(newState);
  if (status(oldState) !== "ongoing" || now === "ongoing") return 0;
  if (now === "lost") return DEFEAT_FLASH_FRAME * 3;
  const frames = newState.w + newState.h + newState.colors - 2;
  return VICTORY_FLASH_FRAME * frames;
}

// --- Game object ------------------------------------------------------

export const floodGame: Game<
  FloodParams,
  FloodState,
  FloodMove,
  FloodUi,
  FloodDrawState
> = {
  id: "flood",
  // Choosing a color is the only gesture; the secondary button has no
  // meaning, so a touch player's held press must not be promoted into one.
  ignoresSecondaryButton: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig: [
    ...dimensionParamConfig<FloodParams>({
      doc: "Size of the grid in squares. The grid must have at least two squares.",
      bounds: { min: 1 },
    }),
    numberItem<FloodParams>("colors", "Colors", "colors", {
      doc: "How many different colors the grid is filled with.",
      bounds: { min: 3, max: MAXCOLORS },
      label: { slot: "tail", words: (p) => `${p.colors} colors` },
    }),
    numberItem<FloodParams>(
      "extra-moves-permitted",
      "Extra moves permitted",
      "leniency",
      {
        doc: "How much slack the move limit gives you. The game plays the board through itself when it deals it, and the limit is the number of fills it took plus this many. At 0 you have to match or beat the game's own count.",
        bounds: { min: 0 },
        label: {
          slot: "tail",
          words: (p) => (p.leniency > 0 ? `${p.leniency} extra moves` : null),
        },
      },
    ),
  ],

  newDesc,
  validateDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  status,
  notApplicable: {
    findMistakes:
      "Any sequence of floods that fills the grid within the move limit wins, so there is no single answer to check a move against.",
  },

  solve() {
    return { ok: true, move: { type: "solve" as const } };
  },

  hint,
  hintMarks: {
    roles: {
      ring: "what the step decides: a black dot on every square the named color's fill would join to your region, so you can see what it gains.",
    },
  },
  hintKeepTrack,
  hintGesture: (s, ui, ds, m) => {
    if (m.type !== "fill") throw new Error("flood: a hint only fills");
    // One of the squares the step dots, which the fill it names would join;
    // any square of that color makes the same fill.
    const joined = joinedBy(s, m.color);
    const i = joined.length > 0 ? joined[0] : s.grid.indexOf(m.color);
    if (i < 0) throw new Error(`flood: no square shows color ${m.color}`);
    const at = { x: i % s.w, y: Math.floor(i / s.w) };
    return verbGesture(targetVerbs, s, ds, ui, [at]);
  },

  textFormat,
  statusbarText,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  flashLength,
};

registerGame(floodGame);
