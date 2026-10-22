/**
 * Pearl (Masyu) — native TS port of `pearl.c`. Draw one closed loop through
 * grid cells that turns a right angle at every black pearl (going straight on
 * at least one cell each side) and passes straight through every white pearl
 * (turning immediately before or after).
 *
 * The loop is drawn through the engine's line drawing
 * (`engine/line-drawing.ts`), saved as Pearl's own op pairs. `H` is not the
 * game's: the app reads it as Next hint.
 */

import { c2nUpper } from "../../engine/desc-alphabet.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
import type { Game, GamePref, SolveResult } from "../../engine/game.ts";
import { click, type PointerAction } from "../../engine/hint-gesture.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import { type EdgeChange, LINE, lineDrawing } from "../../engine/line-drawing.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { newCursor } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  D,
  dirX,
  dirY,
  type EdgeLayout,
  L,
  R,
  sideOf,
  squareEdges,
  U,
} from "../../engine/square-edges.ts";
import { newDesc } from "./generator.ts";
import {
  PEARL_RUNGS,
  type PearlHint,
  type PearlRung,
  pearlHint,
  pearlKeepTrack,
} from "./hint.ts";
import { executeMove, pearlLines, status } from "./moves.ts";
import {
  centeredCoord,
  colors,
  computeSize,
  GUI_MASYU,
  metrics,
  newDrawState,
  type PearlDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import { pearlSolve } from "./solver.ts";
import {
  DIFF_COUNT,
  decodeParams,
  defaultParams,
  encodeParams,
  newState,
  type PearlMove,
  type PearlOp,
  type PearlParams,
  type PearlState,
  type PearlUi,
  paramConfig,
  presets,
  textFormat,
  validateParams,
} from "./state.ts";

/** A wrong edge surfaced by `findMistakes`: a player line the unique solution
 * does not contain, or a cross on an edge it does. */
export interface PearlMistake {
  x: number;
  y: number;
  dir: number;
  cross: boolean;
}

function newUi(_state: PearlState): PearlUi {
  return { drag: null, cursor: newCursor(), guiStyle: GUI_MASYU };
}

/** The board's pixel layout, as `engine/square-edges.ts` aims at an edge in
 * it. */
function layout(ds: PearlDrawState): EdgeLayout {
  const m = metrics(ds.tileSize);
  return { tile: m.tile, border: m.border };
}

/** The move making `changes`: an op for the square either side of each edge,
 * a `flip` where a line is drawn or taken up and a `mark` where a cross is. */
function opsOf(state: PearlState, changes: readonly EdgeChange[]): PearlMove {
  const g = squareEdges(state.w, state.h);
  const ops: PearlOp[] = [];
  for (const { edge, mark } of changes) {
    const kind =
      mark === LINE || pearlLines.mark(state, edge) === LINE ? "flip" : "mark";
    for (const i of [g.a[edge], g.b[edge]])
      ops.push({
        kind,
        l: 1 << sideOf(g, edge, i),
        x: i % state.w,
        y: Math.floor(i / state.w),
      });
  }
  return { ops };
}

const input = lineDrawing<PearlState, PearlUi, PearlDrawState, PearlMove>(pearlLines, {
  layout,
  move: opsOf,
});

/** The right button's drag, which crosses every edge it passes. */
export const crossDrag = input.crossDrag;

/** One tap per edge, inside one of its squares, off center toward that edge:
 * the primary button draws the line, the secondary the cross. A step's ops
 * come in pairs, one for each square either side of the edge. */
function hintGesture(
  _state: PearlState,
  _ui: PearlUi,
  ds: PearlDrawState,
  move: PearlMove,
): readonly PointerAction[] {
  const m = metrics(ds.tileSize);
  const off = ((3 * m.tile) / 8) | 0;
  const out: PointerAction[] = [];
  for (let i = 0; i < move.ops.length; i += 2) {
    const op = move.ops[i];
    if (op.kind !== "line" && op.kind !== "mark") continue;
    const at = {
      x: centeredCoord(op.x, m) + dirX(op.l) * off,
      y: centeredCoord(op.y, m) + dirY(op.l) * off,
    };
    out.push(click(at, op.kind === "line" ? "primary" : "secondary"));
  }
  return out;
}

function solve(
  orig: PearlState,
  curr: PearlState,
  aux?: string,
): SolveResult<PearlMove> {
  const w = curr.w;
  const sz = w * curr.h;
  const solvedLines = orig.lines.slice();

  if (aux) {
    for (let i = 0; i < sz; i++) {
      // A nibble of direction bits: `0`–`9`, then `A`–`F`. `aux` is written by
      // `newDesc` in this process and never saved, so a bad nibble is a broken
      // encoder rather than a bad input.
      const v = i < aux.length ? c2nUpper(aux[i]) : null;
      if (v === null || v > 15) throw new Error(`pearl: aux has no nibble at ${i}`);
      solvedLines[i] = v;
    }
  } else if (pearlSolve(w, curr.h, curr.clues, solvedLines, DIFF_COUNT, false) < 1) {
    // Upstream retries from the original state, but the two share their clues,
    // so the retry could only repeat this verdict.
    return { ok: false, error: PUZZLE_NOT_REASONABLE };
  }

  const ops: PearlOp[] = [{ kind: "solve" }];
  for (let i = 0; i < sz; i++)
    if (curr.lines[i] !== solvedLines[i])
      ops.push({ kind: "replace", l: solvedLines[i], x: i % w, y: (i / w) | 0 });
  return { ok: true, move: { ops } };
}

/** Boards are uniquely solvable by default: re-solve from the clues and flag
 * every player line the unique solution does not contain, and every cross on an
 * edge it does (each a definite mistake). The crosses matter because the hint
 * reasons from them. A non-uniquely-solvable board yields no mistakes. */
function findMistakes(state: PearlState): readonly PearlMistake[] {
  const { w, h } = state;
  const sol = new Uint8Array(w * h);
  if (pearlSolve(w, h, state.clues, sol, DIFF_COUNT, false) !== 1) return [];
  const out: PearlMistake[] = [];
  for (let i = 0; i < w * h; i++) {
    const extra = state.lines[i] & ~sol[i] & (R | U | L | D);
    const crossed = state.marks[i] & sol[i] & (R | U | L | D);
    for (let d = 1; d <= 8; d += d) {
      if (extra & d) out.push({ x: i % w, y: (i / w) | 0, dir: d, cross: false });
      if (crossed & d) out.push({ x: i % w, y: (i / w) | 0, dir: d, cross: true });
    }
  }
  return out;
}

const prefs: GamePref<PearlUi>[] = [
  {
    kw: "appearance",
    name: "Puzzle appearance",
    type: "choices",
    choices: ["Traditional", "Loopy-style"],
    get: (ui) => ui.guiStyle,
    set: (ui, v) => {
      ui.guiStyle = v;
    },
  },
];

/** `pearlSolve` returns 0 inconsistent, 1 unique, 2 ambiguous. */
const difficulty: DifficultyContract<PearlParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    const ret = pearlSolve(p.w, p.h, s.clues, new Uint8Array(p.w * p.h), cap, false);
    return ret === 1 ? "solved" : ret === 0 ? "impossible" : "unsolved";
  },
};

export const pearlGame: Game<
  PearlParams,
  PearlState,
  PearlMove,
  PearlUi,
  PearlDrawState,
  PearlMistake,
  PearlHint,
  PearlRung
> = {
  id: "pearl",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc,
  newState,
  newUi,

  interpretMove: input.interpretMove,
  executeMove,
  status,

  solve,
  difficulty,
  findMistakes,
  hint: pearlHint,
  hintMarks: {
    roles: {
      ring: "the edges the step decides: a line from a square's center to its edge means the loop must go through that edge, and a cross on an edge means it can't. The sentence calls one “this edge”, or names the pearl or square whose edges they are.",
      outline:
        "the squares the step reasons from: the pearl or square it is about, the squares beside a pearl, or a stretch of loop drawn so far.",
    },
  },
  hintRungs: PEARL_RUNGS,
  hintKeepTrack: pearlKeepTrack,
  hintGesture,

  textFormat,

  prefs,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
};

registerGame(pearlGame);
