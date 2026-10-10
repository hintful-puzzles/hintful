/**
 * Flip: pressing a square flips a set of squares, given by a per-square matrix
 * over GF(2); the puzzle is won when every square is lit. Upstream's `flip.c`,
 * ported idiomatically rather than line for line.
 */

import { assertNever } from "../../engine/assert-never.ts";
import { type DescParse, descValue } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { nothingToDeduce } from "../../engine/hint-finishes.ts";
import {
  dimensionParamConfig,
  type Game,
  type ParamConfigItem,
  registerGame,
  type SolveResult,
  type UiUpdate,
} from "../../engine/index.ts";
import { AREA_TOO_LARGE, transposeDimensions } from "../../engine/params.ts";
import { dims, letters, paramsCodec } from "../../engine/params-codec.ts";
import { newCursor } from "../../engine/pointer.ts";
import { randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { RULESET_KW, rulesetItem } from "../../engine/ruleset.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import {
  interpretTargetVerbs,
  squareGrid,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { genCrossesMatrix, genRandomMatrix } from "./generator.ts";
import { FLIP_RUNGS, type FlipRung, hint, hintKeepTrack } from "./hint.ts";
import {
  ANIM_TIME,
  border,
  colors,
  computeSize,
  FLASH_FRAME,
  type FlipDrawState,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import { hasAnswer, shortestAnswer } from "./solver.ts";
import {
  encodeBitmap,
  type FlipMove,
  type FlipParams,
  type FlipState,
  type FlipUi,
  type MatrixType,
  readBitmap,
} from "./state.ts";

export type { FlipMove, FlipParams, FlipState, FlipUi };

/** Upstream's `INT_MAX`, for the overflow guards in `validateParams`. */
const INT_MAX = 2147483647;

// --- params ---------------------------------------------------------

function defaultParams(): FlipParams {
  return { w: 5, h: 5, matrixType: "crosses" };
}

const paramConfig: ParamConfigItem<FlipParams>[] = [
  ...dimensionParamConfig<FlipParams>({
    doc: "Size of the grid in squares.",
    bounds: { min: 1 },
  }),
  rulesetItem<FlipParams>(
    [
      {
        name: "Crosses",
        rule: "Pressing a square flips it and the squares directly above, below and to either side of it.",
      },
      {
        name: "Random",
        rule: "Pressing a square flips it and a selection of the eight squares around it. Every square has a selection of its own, which the diagram in the square shows.",
      },
    ],
    {
      get: (p) => (p.matrixType === "crosses" ? 0 : 1),
      set: (p, v) => {
        p.matrixType = v === 0 ? "crosses" : "random";
      },
    },
  ),
];

/** `WxH`, plus the generator-only shape letter. A missing or unknown letter
 * leaves the default, Crosses. */
const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  letters(paramConfig, RULESET_KW, ["c", "r"], { full: true }),
]);

// --- input ----------------------------------------------------------

/** Flip square `{ x, y }`. A square with an empty matrix row flips nothing
 * (upstream's MOVE_NO_EFFECT), so it makes no move. */
function flipAt(s: FlipState, { x, y }: Point): FlipMove | null {
  const wh = s.w * s.h;
  const i = y * s.w + x;
  return s.matrix.subarray(i * wh, (i + 1) * wh).includes(1)
    ? { kind: "flip", x, y }
    : null;
}

const targetVerbs: TargetVerbs<FlipState, FlipUi, FlipDrawState, Point, FlipMove> = {
  geometry: squareGrid({ size: (s) => s, border }),
  primary: { does: "flip it and some of its neighbors", apply: flipAt },
};

// --- desc -----------------------------------------------------------

/** The toggle matrix, then the starting lights: two hex bitmaps, comma-separated. */
function parseDesc(
  p: FlipParams,
  desc: string,
): DescParse<{ matrix: Uint8Array; grid: Uint8Array }> {
  const wh = p.w * p.h;
  return readDesc(desc, (r) => {
    const matrix = readBitmap(r, wh * wh);
    r.expect(",");
    const grid = readBitmap(r, wh);
    r.end();
    return { matrix, grid };
  });
}

function executeMove(from: FlipState, move: FlipMove): FlipState {
  const { w, h } = from;
  const wh = w * h;
  if (move.kind === "solution") {
    const grid = from.grid.slice();
    let moves = from.moves;
    for (let i = 0; i < wh; i++) {
      if (!move.mask[i]) continue;
      for (let j = 0; j < wh; j++) grid[j] ^= from.matrix[i * wh + j];
      moves++;
    }
    return { ...from, grid, moves };
  }
  if (move.kind !== "flip") return assertNever(move, "flip: executeMove");

  const { x, y } = move;
  if (x < 0 || x >= w || y < 0 || y >= h) {
    throw new Error(`Flip: move out of range (${x},${y})`);
  }
  const grid = from.grid.slice();
  const i = y * w + x;
  for (let j = 0; j < wh; j++) grid[j] ^= from.matrix[i * wh + j];
  return { ...from, grid, moves: from.moves + 1 };
}

// --- the Game -------------------------------------------------------

export const flipGame: Game<
  FlipParams,
  FlipState,
  FlipMove,
  FlipUi,
  FlipDrawState,
  unknown,
  unknown,
  FlipRung
> = {
  id: "flip",
  // Flipping a cell is the only gesture; the secondary button has no meaning,
  // so a touch player's held press must not be promoted into one.
  ignoresSecondaryButton: true,
  preferredTileSize: PREFERRED_TILE_SIZE,

  defaultParams,

  presets() {
    const mk = (w: number, h: number, matrixType: MatrixType) => ({
      params: { w, h, matrixType },
    });
    return {
      title: "Flip",
      submenu: [
        mk(3, 3, "crosses"),
        mk(4, 4, "crosses"),
        mk(5, 5, "crosses"),
        mk(3, 3, "random"),
        mk(4, 4, "random"),
        mk(5, 5, "random"),
      ],
    };
  },

  encodeParams,
  decodeParams,

  validateParams(p): string | null {
    if (p.w > (INT_MAX - 3) / p.h) {
      return AREA_TOO_LARGE;
    }
    const wh = p.w * p.h;
    if (wh > (INT_MAX - 3) / wh) {
      return "Width times height is too large.";
    }
    return null;
  },

  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc(p, rng) {
    const { w, h } = p;
    const wh = w * h;
    const matrix =
      p.matrixType === "crosses" ? genCrossesMatrix(w, h) : genRandomMatrix(w, h, rng);

    // Random soluble starting lights: choosing equiprobably from the
    // input space and pushing through the matrix is equiprobable over
    // the image space (flip.c's vector-space argument).
    const grid = new Uint8Array(wh);
    const attempt = retryLimit("flip: a grid with a light on");
    do {
      attempt();
      grid.fill(0);
      for (let i = 0; i < wh; i++) {
        if (randomUpto(rng, 2)) {
          for (let j = 0; j < wh; j++) grid[j] ^= matrix[i * wh + j];
        }
      }
    } while (!grid.includes(1));

    return { desc: `${encodeBitmap(matrix, wh * wh)},${encodeBitmap(grid, wh)}` };
  },

  newState(p, desc): FlipState {
    const { matrix, grid } = descValue(parseDesc(p, desc));
    return {
      w: p.w,
      h: p.h,
      matrix,
      grid,
      moves: 0,
    };
  },

  newUi(): FlipUi {
    return { cursor: newCursor() };
  },

  newDrawState,
  colors,
  computeSize,
  redraw,

  targetVerbs,

  interpretMove(s, ui, ds, point, button): FlipMove | null | UiUpdate {
    return interpretTargetVerbs(targetVerbs, s, ui, ds, point, button);
  },

  executeMove,

  finishesByDeduction: nothingToDeduce,
  hasNoSolution: (s) => !hasAnswer(s),
  /** Every square is lit. */
  status(s) {
    return s.grid.every((v) => v === 0) ? "solved" : "ongoing";
  },

  notApplicable: {
    findMistakes:
      "Pressing a square twice undoes it, and the order of presses never matters, so no press can be wrong, only unneeded.",
  },

  solve(_orig, curr): SolveResult<FlipMove> {
    const answer = shortestAnswer(curr);
    if (!answer) return { ok: false, error: NO_SOLUTION };
    return { ok: true, move: { kind: "solution", mask: Array.from(answer.presses) } };
  },

  hint,
  hintRungs: FLIP_RUNGS,
  hintMarks: {
    roles: {
      ring: "the square to press.",
      outline:
        "the unlit squares the press is for: the ones only it can still light, no square further on flipping them, or on the last press every unlit square left.",
      stripes: "the other squares that press flips, unlit or lit.",
    },
  },
  hintKeepTrack,
  hintGesture: (s, ui, ds, m, step) => {
    if (m.kind !== "flip") throw new Error("flip: a hint only presses a square");
    return verbClicks(targetVerbs, { executeMove, hintKeepTrack }, s, ui, ds, step, [
      { x: m.x, y: m.y },
    ]);
  },

  textFormat(s): string {
    const { w, h } = s;
    const wh = w * h;
    const cw = 4;
    const ch = 4;
    const gw = w * cw + 2;
    const gh = h * ch + 1;
    const len = gw * gh;
    const board = new Array<string>(len).fill(" ");
    const RIGHT = 1;
    const DOWN = gw;
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const cell = r * ch * gw + c * cw;
        const center = cell + ((ch / 2) | 0) * DOWN + ((cw / 2) | 0) * RIGHT;
        const flip = s.grid[r * w + c] & 1 ? "#" : ".";
        for (let dy = -1 + (r === 0 ? 1 : 0); dy <= 1 - (r === h - 1 ? 1 : 0); dy++) {
          for (let dx = -1 + (c === 0 ? 1 : 0); dx <= 1 - (c === w - 1 ? 1 : 0); dx++) {
            if (s.matrix[(r * w + c) * wh + ((r + dy) * w + c + dx)]) {
              board[center + dy * DOWN + dx * RIGHT] = flip;
            }
          }
        }
        board[cell] = "+";
        for (let dx = 1; dx < cw; dx++) board[cell + dx * RIGHT] = "-";
        for (let dy = 1; dy < ch; dy++) board[cell + dy * DOWN] = "|";
      }
      board[r * ch * gw + gw - 2] = "+";
      board[r * ch * gw + gw - 1] = "\n";
      for (let dy = 1; dy < ch; dy++) {
        board[r * ch * gw + gw - 2 + dy * DOWN] = "|";
        board[r * ch * gw + gw - 1 + dy * DOWN] = "\n";
      }
    }
    for (let k = 0; k < gw - 2; k++) board[len - gw + k] = "-";
    for (let c = 0; c <= w; c++) board[len - gw + cw * c] = "+";
    board[len - 1] = "\n";
    return board.join("");
  },

  statusbarText(s): string {
    return `Moves: ${s.moves}`;
  },

  animLength() {
    return ANIM_TIME;
  },

  solvedFlash(s) {
    return FLASH_FRAME * (Math.max(((s.w + 1) / 2) | 0, ((s.h + 1) / 2) | 0) + 1);
  },
};

registerGame(flipGame);
