/**
 * Twiddle: a grid of numbered tiles, where one click rotates an `n×n`
 * subsquare 90°. Solved when the numbers read in non-decreasing row-major
 * order (and, when orientable, every tile is upright). Port of upstream
 * `twiddle.c`, holding numbers and orientations in separate arrays rather
 * than its packed `value*4 + orient`.
 */

import { assertNever } from "../../engine/assert-never.ts";
import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import type { Game, UiUpdate } from "../../engine/game.ts";
import {
  dimensionParamConfig,
  numberItem,
  transposeDimensions,
} from "../../engine/params.ts";
import { MOD_MASK, MOD_NUM_KEYPAD, newCursor } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  interpretTargetVerbs,
  squareGrid,
  type TargetVerbs,
} from "../../engine/target-verb.ts";
import type { Color, Point } from "../../engine/types.ts";
import {
  animLength,
  border,
  buildColors,
  computeSize,
  FLASH_FRAME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type TwiddleDrawState,
} from "./render.ts";
import {
  decodeParams,
  defaultParams,
  doRotate,
  encodeParams,
  newDesc,
  newState,
  presets,
  status,
  type TwiddleMove,
  type TwiddleParams,
  type TwiddleState,
  type TwiddleUi,
  textFormat,
  validateParams,
} from "./state.ts";

// Char codes for the corner-rotation keys.
const KEY_a = 0x61;
const KEY_A = 0x41;
const KEY_b = 0x62;
const KEY_B = 0x42;
const KEY_c = 0x63;
const KEY_C = 0x43;
const KEY_d = 0x64;
const KEY_D = 0x44;

// --- ui ---------------------------------------------------------------

function newUi(_state: TwiddleState): TwiddleUi {
  return { cursor: newCursor() };
}

// --- input ------------------------------------------------------------

function rotateMove(x: number, y: number, dir: 1 | -1): TwiddleMove {
  return { type: "rotate", x, y, dir };
}

/** A target is a block, named by its top-left square: the cursor moves over the
 * `(w-n+1) × (h-n+1)` block origins, and a click lands on the block whose
 * *center* it is nearest, which is why the inset grows by (n-1) half-tiles. */
const targetVerbs: TargetVerbs<
  TwiddleState,
  TwiddleUi,
  TwiddleDrawState,
  Point,
  TwiddleMove
> = {
  geometry: {
    ...squareGrid<TwiddleState, TwiddleDrawState>({
      size: (s) => ({ w: s.w - s.n + 1, h: s.h - s.n + 1 }),
      border: (ts, s) => border(ts) + ((s.n - 1) * ts) / 2,
    }),
    noun: "block",
  },
  primary: {
    does: "rotate it anticlockwise",
    apply: (_s, { x, y }) => rotateMove(x, y, 1),
  },
  secondary: {
    does: "rotate it clockwise",
    apply: (_s, { x, y }) => rotateMove(x, y, -1),
  },
};

function interpretMove(
  state: TwiddleState,
  ui: TwiddleUi,
  ds: TwiddleDrawState,
  p: Point,
  rawButton: number,
): TwiddleMove | null | UiUpdate {
  return (
    fixedBlockKey(state, rawButton) ??
    interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton)
  );
}

/**
 * The keys that turn a block wherever the cursor is: letters a–d and numpad
 * 7/9/1/3 turn a corner block (a capital turns it back); numpad 8/2/4/6/5 turn
 * the block exactly midway along an edge, or at the center, when there is one.
 */
function fixedBlockKey(state: TwiddleState, rawButton: number): TwiddleMove | null {
  const { w, h, n } = state;
  // Every modifier but the numpad bit (so not `stripModifiers`): the keypad
  // rotations need it.
  const button = rawButton & (~MOD_MASK | MOD_NUM_KEYPAD);
  if (button === KEY_a || button === KEY_A || button === (MOD_NUM_KEYPAD | 0x37)) {
    return rotateMove(0, 0, button === KEY_A ? -1 : 1);
  }
  if (button === KEY_b || button === KEY_B || button === (MOD_NUM_KEYPAD | 0x39)) {
    return rotateMove(w - n, 0, button === KEY_B ? -1 : 1);
  }
  if (button === KEY_c || button === KEY_C || button === (MOD_NUM_KEYPAD | 0x31)) {
    return rotateMove(0, h - n, button === KEY_C ? -1 : 1);
  }
  if (button === KEY_d || button === KEY_D || button === (MOD_NUM_KEYPAD | 0x33)) {
    return rotateMove(w - n, h - n, button === KEY_D ? -1 : 1);
  }
  if (button === (MOD_NUM_KEYPAD | 0x38) && (w - n) % 2 === 0) {
    return rotateMove((w - n) / 2, 0, 1);
  }
  if (button === (MOD_NUM_KEYPAD | 0x32) && (w - n) % 2 === 0) {
    return rotateMove((w - n) / 2, h - n, 1);
  }
  if (button === (MOD_NUM_KEYPAD | 0x34) && (h - n) % 2 === 0) {
    return rotateMove(0, (h - n) / 2, 1);
  }
  if (button === (MOD_NUM_KEYPAD | 0x36) && (h - n) % 2 === 0) {
    return rotateMove(w - n, (h - n) / 2, 1);
  }
  if (button === (MOD_NUM_KEYPAD | 0x35) && (w - n) % 2 === 0 && (h - n) % 2 === 0) {
    return rotateMove((w - n) / 2, (h - n) / 2, 1);
  }

  return null;
}

// --- move execution ---------------------------------------------------

export function executeMove(from: TwiddleState, move: TwiddleMove): TwiddleState {
  if (move.type === "solve") {
    // Sort the numbers and clear the orientations. Solve counts as one move;
    // that the solver was used is the engine's to say.
    return {
      ...from,
      numbers: Int32Array.from(from.numbers).sort(),
      orient: new Uint8Array(from.numbers.length),
      moveCount: from.moveCount + 1,
    };
  }
  if (move.type !== "rotate") return assertNever(move, "twiddle: executeMove");

  const { w, h, n } = from;
  if (move.x < 0 || move.y < 0 || move.x > w - n || move.y > h - n) {
    throw new Error(`Illegal twiddle rotation at (${move.x}, ${move.y})`);
  }

  const numbers = Int32Array.from(from.numbers);
  const orient = Uint8Array.from(from.orient);
  doRotate(numbers, orient, w, n, from.orientable, move.x, move.y, move.dir);

  return {
    ...from,
    numbers,
    orient,
    moveCount: from.moveCount + 1,
    lastX: move.x,
    lastY: move.y,
    lastR: move.dir,
  };
}

// --- status bar -------------------------------------------------------

function statusbarText(state: TwiddleState, _ui: TwiddleUi): string {
  let s = `Moves: ${state.moveCount}`;
  if (state.movetarget) s += ` (target ${state.movetarget})`;
  return s;
}

// --- colors ----------------------------------------------------------

function colors(defaultBackground: Color): Color[] {
  const { background, highlight, lowlight } = mkhighlight(defaultBackground);
  return buildColors(background, highlight, lowlight);
}

// --- Game object ------------------------------------------------------

export const twiddleGame: Game<
  TwiddleParams,
  TwiddleState,
  TwiddleMove,
  TwiddleUi,
  TwiddleDrawState
> = {
  id: "twiddle",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig: [
    ...dimensionParamConfig<TwiddleParams>({
      doc: "Size of the grid in squares. Neither may be smaller than the rotating block.",
    }),
    numberItem<TwiddleParams>("rotating-block-size", "Rotating block size", "n", {
      doc: "How many squares wide the block you turn is. A block of even size turns about the corner point at its center, and an odd one about its center square; that is where you click.",
      bounds: { min: 2 },
      label: {
        slot: "tail",
        words: (p) => (p.n === 2 ? null : `rotating ${p.n}x${p.n} blocks`),
      },
    }),
    {
      kw: "one-number-per-row",
      name: "One number per row",
      type: "boolean",
      doc: "Every square in a row carries the same number, the row's own, so the puzzle is solved when each row holds only its own number and it doesn't matter which of those squares goes where.",
      label: { slot: "kind", words: (p) => (p.rowsonly ? "rows only" : null) },
      get: (p) => p.rowsonly,
      set: (p, v) => {
        p.rowsonly = v;
      },
    },
    {
      kw: "orientation-matters",
      name: "Orientation matters",
      type: "boolean",
      doc: "The 'orientable' mode: each square turns with its block, and must also end up the right way round.",
      label: { slot: "kind", words: (p) => (p.orientable ? "orientable" : null) },
      get: (p) => p.orientable,
      set: (p, v) => {
        p.orientable = v;
      },
    },
    numberItem<TwiddleParams>(
      "number-of-shuffling-moves",
      "Number of shuffling moves",
      "movetarget",
      {
        doc: "How many random turns shuffle the grid. At 0 the game chooses a long shuffle; any other number shuffles exactly that many turns, and the status bar shows that number as your target beside the count of your moves.",
        bounds: { min: 0 },
        label: {
          slot: "tail",
          words: (p) => (p.movetarget === 0 ? null : `${p.movetarget} shuffles`),
        },
      },
    ),
  ],

  newDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  status,
  notApplicable: {
    findMistakes:
      "Every arrangement of the tiles is a step on the way to the answer, so no move can be wrong, only longer.",
  },

  solve: () => ({ ok: true, move: { type: "solve" } }),

  textFormat,
  statusbarText,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: (_a, b) => animLength(b.n),
  solvedFlash: () => 2 * FLASH_FRAME,
};

registerGame(twiddleGame);
