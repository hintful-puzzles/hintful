/**
 * Cube: roll a regular polyhedron around a tiled arena, collecting paint
 * from the blue grid squares onto the solid's faces. Idiomatic TS port of
 * `puzzles/cube.c`.
 *
 * Cube is a route puzzle: no roll is wrong, only longer, so there is no
 * mistake-checking and no text format. Its hint plans a line of rolls by
 * search (`solver.ts`, `hint.ts`). The hard part is the 3-D geometry (in
 * `solids.ts`) and the two grid topologies (`grid.ts`); a roll is `roll.ts`.
 * State carries only key-point indices + a roll angle + paint; the
 * transformed geometry is re-derived each frame in `render.ts`.
 */

import type { Game, UiUpdate } from "../../engine/game.ts";
import { nothingToDeduce } from "../../engine/hint-finishes.ts";
import { click } from "../../engine/hint-gesture.ts";
import { numberItem } from "../../engine/params.ts";
import {
  cursorDelta,
  LEFT_BUTTON,
  MOD_MASK,
  MOD_NUM_KEYPAD,
  numpadDirection,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newDesc } from "./generator.ts";
import { Direction } from "./grid.ts";
import { CUBE_RUNGS, hint, hintKeepTrack } from "./hint.ts";
import {
  type CubeDrawState,
  colors,
  computeSize,
  newDrawState,
  PREFERRED_TILE_SIZE,
  ROLLTIME,
  redraw,
} from "./render.ts";
import { allFacesPainted, DIR_CHARS, executeMove, findMoveDest } from "./roll.ts";
import {
  type CubeMove,
  type CubeParams,
  type CubeState,
  decodeParams,
  defaultParams,
  encodeParams,
  hasPresetSize,
  newState,
  presets,
  validateParams,
} from "./state.ts";

/** Cube has no per-game UI state (upstream's `new_ui` returns NULL). */
export type CubeUi = Record<string, never>;

// --- input ------------------------------------------------------------

function newUi(_state: CubeState): CubeUi {
  return {};
}

/** The roll a key's step asks for, by `dy + 1` then `dx + 1`. No key steps
 * nowhere, so the middle is never read. */
const STEP_DIRECTIONS: readonly (readonly Direction[])[] = [
  [Direction.UpLeft, Direction.Up, Direction.UpRight],
  [Direction.Left, Direction.Left, Direction.Right],
  [Direction.DownLeft, Direction.Down, Direction.DownRight],
];

function interpretMove(
  state: CubeState,
  _ui: CubeUi,
  ds: CubeDrawState,
  p: Point,
  rawButton: number,
): CubeMove | null | UiUpdate {
  const button = rawButton & (~MOD_MASK | MOD_NUM_KEYPAD);

  let direction: Direction;
  const step = numpadDirection(button) ?? cursorDelta(button);
  if (step) direction = STEP_DIRECTIONS[step.dy + 1][step.dx + 1];
  else if (button === LEFT_BUTTON) {
    const dir = directionFromClick(state, ds, p);
    if (dir === null) return null;
    direction = dir;
  } else return null;

  const sq = state.grid[state.current];
  const mask = sq.directions[direction];
  if (mask === 0) return null;

  // Translate a diagonal direction into the orthogonal one with the same
  // edge mask.
  if (direction > Direction.Down) {
    let found = -1;
    for (let i = Direction.Left; i <= Direction.Down; i++) {
      if (sq.directions[i] === mask) {
        found = i;
        break;
      }
    }
    if (found < 0) return null;
    direction = found;
  }

  if (!findMoveDest(state, direction)) return null;
  return { dir: DIR_CHARS[direction] };
}

/** Pick a roll direction from a left-click bearing relative to the
 * current square's center. Mirrors the `LEFT_BUTTON` branch of
 * `interpret_move`. Returns null for a dead-center click. */
function directionFromClick(
  state: CubeState,
  ds: CubeDrawState,
  p: Point,
): Direction | null {
  const sq = state.grid[state.current];
  const cx = Math.trunc(sq.x * ds.tileSize) + ds.ox;
  const cy = Math.trunc(sq.y * ds.tileSize) + ds.oy;
  if (p.x === cx && p.y === cy) return null;

  const angle = Math.atan2(p.y - cy, p.x - cx);
  const PI = Math.PI;

  if (sq.npoints === 4) {
    // Square: quarters split at the 45° diagonals.
    if (Math.abs(angle) > (3 * PI) / 4) return Direction.Left;
    if (Math.abs(angle) < PI / 4) return Direction.Right;
    return angle > 0 ? Direction.Down : Direction.Up;
  }
  if (sq.directions[Direction.Up] === 0) {
    // Up-pointing triangle: three 120° arcs (no UP).
    if (angle < -PI / 2 || angle > (5 * PI) / 6) return Direction.Left;
    if (angle > PI / 6) return Direction.Down;
    return Direction.Right;
  }
  // Down-pointing triangle (no DOWN).
  if (angle > PI / 2 || angle < (-5 * PI) / 6) return Direction.Left;
  if (angle < -PI / 6) return Direction.Up;
  return Direction.Right;
}

// --- status bar -------------------------------------------------------

function statusbarText(state: CubeState): string {
  return `Moves: ${state.movecount}`;
}

/** A roll moves paint between a square and a face and never makes or loses
 * any, so a board is finished only by exactly a solid's worth of paint. */
function hasNoSolution(state: CubeState): boolean {
  const paint = (cells: ArrayLike<number>) =>
    Array.from(cells).reduce((n, c) => n + (c ? 1 : 0), 0);
  return paint(state.blue) + paint(state.faceColors) !== state.faceColors.length;
}

function status(state: CubeState): GameStatus {
  return allFacesPainted(state) ? "solved" : "ongoing";
}

// --- Game object ------------------------------------------------------

export const cubeGame: Game<CubeParams, CubeState, CubeMove, CubeUi, CubeDrawState> = {
  id: "cube",
  // Rolling the cube is the only gesture; the secondary button has no meaning,
  // so a touch player's held press must not be promoted into one.
  ignoresSecondaryButton: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig: [
    {
      kw: "type-of-solid",
      name: "Type of solid",
      type: "choices",
      choices: ["Tetrahedron", "Cube", "Octahedron", "Icosahedron"],
      doc: "Which solid you roll: a <em>Tetrahedron</em>, a <em>Cube</em>, an <em>Octahedron</em> or an <em>Icosahedron</em>. The cube rolls on a grid of squares; the other three roll on a grid of triangles. There are always as many painted squares as the solid has faces.",
      label: { slot: "kind" },
      get: (p) => p.solid,
      set: (p, v) => {
        p.solid = v;
      },
    },
    numberItem<CubeParams>("width-top", "Width / top", "d1", {
      doc: "For the cube, the width of the grid in squares. For the other solids, the grid is a patch of triangles (six-sided, or a single large triangle when the other number is 0), and this sets the length of its top edge.",
      bounds: { min: 0 },
      label: {
        slot: "size",
        words: (p) => (hasPresetSize(p) ? null : `${p.d1}x${p.d2}`),
      },
    }),
    numberItem<CubeParams>("height-bottom", "Height / bottom", "d2", {
      doc: "For the cube, the height of the grid in squares. For the other solids, this sets the length of the patch's bottom edge. On a grid of squares both numbers must be at least 2; on a grid of triangles one of them may be 0, as long as the other is not. Either way the grid needs room for every painted square with a square to spare for the solid to start on.",
      bounds: { min: 0 },
    }),
  ],

  newDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  finishesByDeduction: nothingToDeduce,
  hasNoSolution,
  status,
  notApplicable: {
    findMistakes:
      "Every position of the solid is a step on the way to the answer, so no roll can be wrong, only longer.",
  },

  hint,
  hintRungs: CUBE_RUNGS,
  hintMarks: {
    roles: {
      ring: "the square to roll onto, in the hint's color.",
      outline:
        "the painted square the hint is working toward, in a second color: *the outlined square*, in its words. It stays outlined through every roll on the way to it.",
    },
  },
  hintKeepTrack,
  // A tap on the square the roll lands on, which `directionFromClick` reads
  // as a roll toward it.
  hintGesture(s, _ui, ds, m) {
    const roll = findMoveDest(s, DIR_CHARS.indexOf(m.dir));
    if (!roll) return [];
    const sq = s.grid[roll.dest];
    return [
      click({
        x: Math.trunc(sq.x * ds.tileSize) + ds.ox,
        y: Math.trunc(sq.y * ds.tileSize) + ds.oy,
      }),
    ];
  },

  statusbarText,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => ROLLTIME,
};

registerGame(cubeGame);
