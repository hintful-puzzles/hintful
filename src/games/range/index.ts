/**
 * Range (Kurodoko / Kuromasu) — native TS port of `range.c`. Numbered
 * clues state how many white squares are visible from them in a straight
 * line (counting the clue once); paint squares black so no two blacks
 * touch, the whites stay connected, and every clue is satisfied.
 *
 * Left-click / select cycles a non-clue cell empty → black → white →
 * empty; right-click / select2 cycles the other way. White is the
 * player's optional "this is white" dot. Errors (rule violations) are
 * highlighted live; Check & Save additionally flags cells that
 * contradict the unique solution.
 */

import { rejectMove } from "../../engine/assert-never.ts";
import {
  type Game,
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  cursorDelta,
  MOD_SHFT,
  newCursor,
  showCursor,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import {
  interpretTargetVerbs,
  squareGrid,
  type TargetVerbs,
  verbGesture,
} from "../../engine/target-verb.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { type Marked, say } from "./hint-text.ts";
import {
  border,
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  type RangeDrawState,
  redraw,
} from "./render.ts";
import {
  DC,
  DR,
  deduceHintPlan,
  findErrors,
  fullSolve,
  generateGrid,
  type HintReason,
} from "./solver.ts";
import {
  BLACK,
  type Cell,
  cellValueToGrid,
  cloneState,
  decodeParams,
  defaultParams,
  EMPTY,
  encodeDesc,
  encodeParams,
  gridValueToCell,
  idx,
  newState,
  outOfBounds,
  paramConfig,
  presets,
  type RangeCellValue,
  type RangeMove,
  type RangeParams,
  type RangeState,
  type RangeUi,
  textFormat,
  validateParams,
  WHITE,
} from "./state.ts";

export type RangeMistake = Cell;

function newUi(_state: RangeState): RangeUi {
  return { cursor: newCursor() };
}

/** The forward (right-button) cycle; a backward step is two forward ones. */
const CYCLE: RangeCellValue[] = ["empty", "white", "black"];

/** The mark a non-clue cell becomes under a forward or backward cycle. */
function cycle(cell: number, forwards: boolean): RangeCellValue {
  const i = CYCLE.indexOf(gridValueToCell(cell));
  return CYCLE[(i + (forwards ? 1 : 2)) % 3];
}

/** Cycle the non-clue square `{ x, y }` one way round. The cursor is (x, y),
 * transposed from Range's own `(r, c)` here (see `RangeUi`). */
function cycleAt(forwards: boolean) {
  return (state: RangeState, { x: c, y: r }: Point): RangeMove | null => {
    const cell = state.grid[idx(r, c, state.w)];
    if (cell > 0) return null; // clue cell — inert
    return { sets: [{ r, c, value: cycle(cell, forwards) }] };
  };
}

const targetVerbs: TargetVerbs<RangeState, RangeUi, RangeDrawState, Point, RangeMove> =
  {
    geometry: squareGrid({ size: (s) => s, border }),
    primary: { does: "color it black", apply: cycleAt(false) },
    secondary: {
      does: "mark it with a dot, if you know it should not be black",
      apply: cycleAt(true),
    },
  };

function interpretMove(
  state: RangeState,
  ui: RangeUi,
  ds: RangeDrawState,
  p: Point,
  rawButton: number,
): RangeMove | null | UiUpdate {
  const { w, h, grid } = state;
  const delta = cursorDelta(stripModifiers(rawButton));
  if (delta && rawButton & MOD_SHFT) {
    // A shifted arrow *dots* the cells it passes, which is too much to do to
    // a player who cannot yet see the cursor — that one still only reveals.
    if (showCursor(ui.cursor)) return UI_UPDATE;
    const dr = delta.dy;
    const dc = delta.dx;
    const preR = ui.cursor.y;
    const preC = ui.cursor.x;
    const doPre = grid[idx(preR, preC, w)] === EMPTY;
    if (outOfBounds(ui.cursor.y + dr, ui.cursor.x + dc, w, h)) {
      return doPre ? { sets: [{ r: preR, c: preC, value: "white" }] } : null;
    }
    ui.cursor.y += dr;
    ui.cursor.x += dc;
    const doPost = grid[idx(ui.cursor.y, ui.cursor.x, w)] === EMPTY;
    const sets: RangeMove["sets"] = [];
    if (doPre) sets.push({ r: preR, c: preC, value: "white" });
    if (doPost) sets.push({ r: ui.cursor.y, c: ui.cursor.x, value: "white" });
    return sets.length > 0 ? { sets } : UI_UPDATE;
  }
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

function executeMove(state: RangeState, move: RangeMove): RangeState {
  // A move is a list of cell settings, not a union, so there is no discriminant
  // to narrow to `never`: check the one field the dispatch reads. (The `value`
  // inside each setting *is* a union — `cellValueToGrid` asserts on it.)
  if (!Array.isArray(move.sets)) rejectMove(move, "range: executeMove");

  const next = cloneState(state);
  for (const { r, c, value } of move.sets) {
    if (outOfBounds(r, c, next.w, next.h)) throw new Error("Range move out of bounds");
    const cell = idx(r, c, next.w);
    if (next.grid[cell] > 0) throw new Error("Range move targets a clue cell");
    next.grid[cell] = cellValueToGrid(value);
  }
  return next;
}

/** Solved: every cell decided and every rule met. */
function status(s: RangeState): GameStatus {
  return findErrors(s.grid, s.w, s.h) ? "ongoing" : "solved";
}

/** Strip the player's marks, leaving the initial clue grid. */
function clueGrid(state: RangeState): Int8Array {
  const g = state.grid.slice();
  for (let i = 0; i < g.length; i++) {
    if (g[i] <= 0) g[i] = EMPTY;
  }
  return g;
}

function solve(orig: RangeState, _curr: RangeState): SolveResult<RangeMove> {
  const solution = fullSolve(clueGrid(orig), orig.w, orig.h);
  if (!solution) return { ok: false, error: NO_SOLUTION };
  const sets: RangeMove["sets"] = [];
  for (let r = 0; r < orig.h; r++) {
    for (let c = 0; c < orig.w; c++) {
      const v = solution[idx(r, c, orig.w)];
      if (v <= 0) sets.push({ r, c, value: gridValueToCell(v) });
    }
  }
  return { ok: true, move: { solve: true, sets } };
}

function findMistakes(state: RangeState): readonly RangeMistake[] {
  const solution = fullSolve(clueGrid(state), state.w, state.h);
  if (!solution) return [];
  const out: RangeMistake[] = [];
  for (let r = 0; r < state.h; r++) {
    for (let c = 0; c < state.w; c++) {
      const cell = idx(r, c, state.w);
      const v = state.grid[cell];
      // Only a decided mark can be a mistake; clues and undecided cells never are.
      if ((v === BLACK || v === WHITE) && solution[cell] !== v) out.push({ r, c });
    }
  }
  return out;
}

// --- hint ------------------------------------------------------------------

/** Plan data for a Range hint step: the cell the deduction forces and the
 * mark it forces, which keep-track compares a move against. The marks are the
 * step's words'. */
export interface RangeHint {
  target: { r: number; c: number; value: RangeCellValue };
}

/** A cell already known to be white: the player's white mark, or a clue
 * (clues are implicitly white). Mirrors the solver's RUN_WHITE mask. */
function knownWhite(v: number): boolean {
  return v === WHITE || v > 0;
}

/** The cells a clue currently *sees*: itself plus the run of known-white
 * cells in each of the four directions, stopping at the first undecided
 * or black cell (or the edge). This is exactly the count the run-length
 * rules reason about, made visible. */
function lineOfSight(
  grid: Int8Array,
  w: number,
  h: number,
  cr: number,
  cc: number,
): Cell[] {
  const cells = [{ r: cr, c: cc }];
  for (let j = 0; j < 4; j++) {
    let r = cr + DR[j];
    let c = cc + DC[j];
    while (!outOfBounds(r, c, w, h) && knownWhite(grid[idx(r, c, w)])) {
      cells.push({ r, c });
      r += DR[j];
      c += DC[j];
    }
  }
  return cells;
}

/** The straight line from a clue toward a target it must reach: the clue
 * plus every cell between it and the target (target excluded — that one
 * is the COL_HINT cell). Clue and target are collinear by construction. */
function reachLine(cr: number, cc: number, tr: number, tc: number): Cell[] {
  const cells = [{ r: cr, c: cc }];
  const dr = Math.sign(tr - cr);
  const dc = Math.sign(tc - cc);
  let r = cr + dr;
  let c = cc + dc;
  while (r !== tr || c !== tc) {
    cells.push({ r, c });
    r += dr;
    c += dc;
  }
  return cells;
}

/** The non-black orthogonal neighbors of a cell — the cells a cut at
 * this cell would risk isolating from each other. The connectedness rule
 * treats every non-black cell as part of the one white group, so these
 * include undecided cells, not only cells already marked white. */
function nonBlackNeighbors(
  grid: Int8Array,
  w: number,
  h: number,
  cr: number,
  cc: number,
): Cell[] {
  const out: Cell[] = [];
  for (let j = 0; j < 4; j++) {
    const r = cr + DR[j];
    const c = cc + DC[j];
    if (!outOfBounds(r, c, w, h) && grid[idx(r, c, w)] !== BLACK) out.push({ r, c });
  }
  return out;
}

const pointOf = (cell: Cell): Point => ({ x: cell.c, y: cell.r });

/** Narrate *why* the move is forced, per the deduction rule, naming the marks
 * `m`. The words, and the tie each carries from the ringed cell to the
 * evidence, are [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(reason: HintReason, m: Marked): Sentence {
  switch (reason.kind) {
    case "adjacency":
      return say.adjacency(m);
    case "satisfied":
      return say.satisfied(m, reason.n);
    case "overrun":
      return say.overrun(m, reason.n);
    case "reach":
      return say.reach(m, reason.n);
    case "connect":
      return say.connect(m);
  }
}

/** What a forced move's words mark: the area to outline (the clue's line of
 * sight, for `reach` its other arms, or the non-black cells a cut would
 * isolate), any black premise cell, the run and the clue, derived from the
 * deduction's reason. `grid` is the solver's working grid with this move
 * already applied, so the target is never part of its own area: a black
 * target cannot be in a line of sight, and a `reach` target, which can, is
 * taken out of it. */
function markedOf(
  grid: Int8Array,
  w: number,
  h: number,
  reason: HintReason,
  target: Cell,
): Marked {
  const marked = (m: {
    area?: Cell[];
    blacks?: Cell[];
    run?: Cell[];
    clue?: Cell;
  }): Marked => ({
    target: pointOf(target),
    area: (m.area ?? []).map(pointOf),
    blacks: (m.blacks ?? []).map(pointOf),
    run: (m.run ?? []).map(pointOf),
    clue: m.clue ? pointOf(m.clue) : null,
  });
  switch (reason.kind) {
    case "adjacency":
      return marked({ blacks: [reason.from] });
    case "satisfied":
    case "overrun":
      return marked({
        area: lineOfSight(grid, w, h, reason.clue.r, reason.clue.c),
        clue: reason.clue,
      });
    case "reach": {
      // The run the narration names is the path from the clue to this target,
      // striped even where it is not yet white; what the clue already sees
      // along its other arms is outlined, as the reason the run must go on.
      const { r, c } = reason.clue;
      const run = reachLine(r, c, target.r, target.c);
      const onRun = new Set(run.map((cell) => idx(cell.r, cell.c, w)));
      const area = lineOfSight(grid, w, h, r, c).filter(
        (cell) =>
          !onRun.has(idx(cell.r, cell.c, w)) &&
          (cell.r !== target.r || cell.c !== target.c),
      );
      return marked({ area, run, clue: reason.clue });
    }
    case "connect":
      return marked({ area: nonBlackNeighbors(grid, w, h, target.r, target.c) });
  }
}

function hint(state: RangeState): HintResult<RangeMove, RangeHint> {
  const plan = deduceHintPlan(state.grid, state.w, state.h);
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  const steps: HintStep<RangeMove, RangeHint>[] = plan.map((m) => {
    const value = gridValueToCell(m.value);
    const target = { r: m.r, c: m.c, value };
    const words = narrate(
      m.reason,
      markedOf(m.grid, state.w, state.h, m.reason, target),
    );
    return {
      move: { sets: [{ r: m.r, c: m.c, value }] },
      explanation: words.text,
      words,
      highlights: { target },
    };
  });
  return { ok: true, steps };
}

/** A move completes the hint step iff it sets the hinted cell to the
 * hinted value; anything else drops the plan to recompute. */
function hintKeepTrack(
  m: RangeMove,
  step: HintStep<RangeMove, RangeHint>,
  _state: RangeState,
): HintTrackVerdict {
  const t = step.highlights?.target;
  if (m.solve || !t) return "off";
  const last = m.sets.findLast((s) => s.r === t.r && s.c === t.c);
  return last?.value === t.value ? "completed" : "off";
}

export const rangeGame: Game<
  RangeParams,
  RangeState,
  RangeMove,
  RangeUi,
  RangeDrawState,
  RangeMistake,
  RangeHint
> = {
  id: "range",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: (p, rng) => ({ desc: encodeDesc(p.w * p.h, generateGrid(p, rng)) }),
  newState,
  newUi,

  interpretMove,
  targetVerbs,
  executeMove,
  status,

  solve,
  hint,
  hintMarks: {
    roles: {
      ring: "the cell the step decides.",
      outline:
        "what the step reasons from: the cells a clue already sees, the cells around one that black would cut off, or a black square beside it, which takes a doubled outline. The clue the step counts from has its number drawn in the hint color.",
      stripes:
        "the run a clue has to see along, from the clue as far as the ringed cell.",
    },
  },
  hintKeepTrack,
  hintGesture: (s, ui, ds, m) => {
    const [{ r, c, value }] = m.sets;
    // The cycle has three states, so a left click reaches one of the other two
    // and a right click the other.
    const back = cycle(s.grid[idx(r, c, s.w)], false) === value;
    const target = { x: c, y: r };
    return verbGesture(
      targetVerbs,
      s,
      ds,
      ui,
      [target],
      back ? "primary" : "secondary",
    );
  },
  findMistakes,

  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  solvedFlash: () => FLASH_TIME,
};

registerGame(rangeGame);
