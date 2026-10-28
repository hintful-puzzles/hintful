/**
 * Clusters — native TS port of `puzzles/unreleased/clusters.c`. Fill the grid
 * with tiles of two colors so that every plain tile touches **two or more**
 * tiles of its own color, and the given "dot" tiles touch exactly one (all
 * exactly-one tiles are given as dots — upstream's rule statement).
 * Left-click/-drag paints `F_COLOR_1` (cycling to `F_COLOR_0`, then clear);
 * right-click/-drag paints `F_COLOR_0`; a keyboard cursor places colors with Enter/Space/0/1/2/
 * backspace. Rule violations are shown live (upstream behavior), and Check &
 * Save additionally refuses to save while any violation stands
 * (`findMistakes`). The explained hint narrates the solver's proof by
 * contradiction: which rule the opposite coloring of the forced cell would
 * break.
 */

import { type Answer, solveFromAnswer } from "../../engine/answer-search.ts";
import { assertNever } from "../../engine/assert-never.ts";
import { entryMistakes } from "../../engine/entry-mistakes.ts";
import {
  type Game,
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import {
  CONTRADICTION_UNLOCALIZED,
  DEDUCTION_EXHAUSTED,
} from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  gridCursorMove,
  isCursorMove,
  isMouseDown,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  MOD_CTRL,
  MOD_SHFT,
  newCursor,
  RIGHT_BUTTON,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  buttonVerb,
  digitKey,
  ERASE_KEYS,
  interpretTargetVerbs,
  pressTarget,
  squareGrid,
  type TargetVerb,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newClustersDesc } from "./generator.ts";
import { colorName, say, type Tile } from "./hint-text.ts";
import {
  border,
  type ClustersDrawState,
  colors,
  computeSize,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  answerSearch,
  CLUSTERS_RUNGS,
  type ClustersDeduction,
  type ClustersRung,
  COMPLETE,
  clustersStatus,
  deduceHintPlan,
  findErrors,
  INVALID,
  solveGame,
} from "./solver.ts";
import {
  type ClustersFill,
  type ClustersMove,
  type ClustersParams,
  type ClustersState,
  type ClustersUi,
  COLMASK,
  cloneState,
  decodeParams,
  defaultParams,
  encodeParams,
  F_COLOR_0,
  F_COLOR_1,
  F_SINGLE,
  menu,
  newState,
  opposite,
  paramConfig,
  TIERS,
  textFormat,
  validateParams,
} from "./state.ts";

/** A tile the player placed in the color the answer does not give it. It need
 * break no rule, so it is not what the board frames live in red. */
export interface ClustersMistake {
  index: number;
}

function newUi(_state: ClustersState): ClustersUi {
  return { cursor: newCursor(), dragType: -1, drag: [] };
}

/** One step of a click's color cycle: empty, then `first`, then the other
 * color, then empty again. */
function cycleFill(old: number, first: ClustersFill): ClustersFill {
  if (old === 0) return first;
  return old & first ? opposite(first) : 0;
}

/** A verb that paints the square `fill(old)`, or means nothing on a given or
 * where the square would stay as it is — upstream's "don't put no-ops on the
 * undo chain". */
const paintWith =
  (fill: (old: number) => ClustersFill) =>
  (s: ClustersState, { x, y }: Point): ClustersMove | null => {
    const index = y * s.w + x;
    const old = s.grid[index];
    const to = fill(old);
    if (old & F_SINGLE || to === old) return null;
    return { kind: "paint", cells: [{ index, fill: to }] };
  };

type ClustersVerb = TargetVerb<ClustersState, ClustersUi, Point, ClustersMove>;
const FIRST = colorName(F_COLOR_1).only;
const SECOND = colorName(F_COLOR_0).only;
const firstVerb: ClustersVerb = {
  does: `color it ${FIRST} (click again for ${SECOND}, and again to clear it)`,
  apply: paintWith((old) => cycleFill(old, F_COLOR_1)),
};
const secondVerb: ClustersVerb = {
  does: `color it ${SECOND} (again for ${FIRST}, and again to clear it)`,
  apply: paintWith((old) => cycleFill(old, F_COLOR_0)),
};

const targetVerbs: TargetVerbs<
  ClustersState,
  ClustersUi,
  ClustersDrawState,
  Point,
  ClustersMove
> = {
  geometry: squareGrid({ size: (s) => s, border: (ts) => border(ts) }),
  primary: firstVerb,
  secondary: secondVerb,
  keyOnly: [
    {
      does: `color it ${FIRST}`,
      keys: [digitKey(1)],
      apply: paintWith(() => F_COLOR_1),
      pointer: { kind: "cycle", button: "primary" },
    },
    {
      does: `color it ${SECOND}`,
      keys: [digitKey(0), digitKey(2)],
      apply: paintWith(() => F_COLOR_0),
      pointer: { kind: "cycle", button: "secondary" },
    },
    {
      does: "clear it",
      keys: ERASE_KEYS,
      apply: paintWith(() => 0),
      pointer: { kind: "cycle", button: "primary" },
    },
  ],
};

function interpretMove(
  state: ClustersState,
  ui: ClustersUi,
  ds: ClustersDrawState,
  p: Point,
  rawButton: number,
): ClustersMove | null | UiUpdate {
  const { w, h, grid } = state;
  const shift = (rawButton & MOD_SHFT) !== 0;
  const control = (rawButton & MOD_CTRL) !== 0;
  const button = stripModifiers(rawButton);

  if (isMouseDown(button)) {
    ui.dragType = -1;
    ui.drag = [];
  }

  // --- the press and the drag: the square under the pointer ---
  if (isMouseDown(button) || isMouseDrag(button)) {
    const at = targetVerbs.geometry.pointerTarget(state, ds, p, ui);
    if (at === null) return null;
    pressTarget(targetVerbs, ui, at);
    const i = at.y * w + at.x;

    // A press picks the drag's color by cycling the pressed square.
    if (isMouseDown(button)) {
      const old = grid[i];
      if (button === LEFT_BUTTON) ui.dragType = cycleFill(old, F_COLOR_1);
      else if (button === RIGHT_BUTTON) ui.dragType = cycleFill(old, F_COLOR_0);
      else ui.dragType = 0;
      if (ui.dragType || old) ui.drag.push(i);
      return UI_UPDATE;
    }

    // A drag accretes squares onto the drag set.
    if (ui.dragType === -1) return null;
    if ((grid[i] & COLMASK) === ui.dragType || ui.drag.includes(i)) return null;
    ui.drag.push(i);
    return UI_UPDATE;
  }

  // --- the release: commit the drag as one paint move ---
  if (isMouseRelease(button) && ui.drag.length > 0) {
    const drag = ui.drag;
    ui.drag = [];
    // A press that never left its square is a click: its button's verb.
    const verb = buttonVerb(targetVerbs, button);
    if (verb && drag.length === 1) {
      const at = { x: drag[0] % w, y: Math.floor(drag[0] / w) };
      return verb.apply(state, at, ui) ?? UI_UPDATE;
    }
    // The press that started the drag picked its fill, and the drag is over:
    // a later press that lands off the grid then has nothing to end.
    const fill = ui.dragType as ClustersFill;
    ui.dragType = -1;
    const cells = drag
      .filter((i) => !(grid[i] & F_SINGLE)) // never overwrite a given
      .map((index) => ({ index, fill }));
    if (cells.length > 0) return { kind: "paint", cells };
    return UI_UPDATE;
  }

  // --- Shift/Ctrl with an arrow paints the squares the cursor leaves and
  // enters, where a bare arrow only moves it ---
  if (isCursorMove(button) && (shift || control)) {
    const ox = ui.cursor.x;
    const oy = ui.cursor.y;
    const moved = gridCursorMove(button, ui.cursor.x, ui.cursor.y, w, h);
    if (moved) {
      ui.cursor.x = moved.x;
      ui.cursor.y = moved.y;
    }
    ui.cursor.visible = true;

    // Shift = F_COLOR_0 ('A'), Ctrl = F_COLOR_1 ('B'), Shift+Ctrl = clear ('C').
    const fill: ClustersFill = shift && control ? 0 : control ? F_COLOR_1 : F_COLOR_0;
    const i1 = oy * w + ox;
    const i2 = ui.cursor.y * w + ui.cursor.x;
    // Skip a given, and any cell already in the target state (no-op).
    const inert = (i: number): boolean =>
      !!(grid[i] & F_SINGLE) ||
      (fill === F_COLOR_0 && !!(grid[i] & F_COLOR_0)) ||
      (fill === F_COLOR_1 && !!(grid[i] & F_COLOR_1)) ||
      (fill === 0 && grid[i] === 0);
    const cells: { index: number; fill: ClustersFill }[] = [];
    if (!inert(i1)) cells.push({ index: i1, fill });
    if (i1 !== i2 && !inert(i2)) cells.push({ index: i2, fill });
    if (cells.length > 0) return { kind: "paint", cells };
    return UI_UPDATE;
  }

  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

function executeMove(state: ClustersState, move: ClustersMove): ClustersState {
  const next = cloneState(state);
  const { grid } = next;
  if (move.kind === "solve") {
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] & F_SINGLE) continue; // keep givens
      grid[i] = move.fills[i];
    }
  } else if (move.kind === "paint") {
    for (const { index, fill } of move.cells) {
      if (grid[index] & F_SINGLE) continue; // never overwrite a given
      grid[index] = fill;
    }
  } else {
    return assertNever(move, "clusters: executeMove");
  }
  return next;
}

function status(s: ClustersState): GameStatus {
  return clustersStatus(s.grid, s.w, s.h) === COMPLETE ? "solved" : "ongoing";
}

/** The last board's answer, by its givens. A state keeps no part every state
 * of its board shares, which `answerCache` would key on, and an Unreasonable
 * board's search is too dear to run on every move the mistake check sees. */
let lastAnswer: { key: string; answer: Answer<Uint8Array> } | null = null;

/** The answer of `state`'s board, from its givens alone: only a given carries
 * `F_SINGLE`. The ladder finishes a board below Unreasonable at once. */
function answerOf(state: ClustersState): Answer<Uint8Array> {
  const { grid, w, h } = state;
  const givens = grid.map((tile) => (tile & F_SINGLE ? tile : 0));
  const key = `${w}x${h}:${givens.join(",")}`;
  if (lastAnswer?.key !== key) lastAnswer = { key, answer: answerSearch(givens, w, h) };
  return lastAnswer.answer;
}

function solve(orig: ClustersState): SolveResult<ClustersMove> {
  return solveFromAnswer(answerOf(orig), (grid) => ({
    kind: "solve",
    fills: Array.from(grid, (byte) => (byte & COLMASK) as ClustersFill),
  }));
}

function findMistakes(state: ClustersState): readonly ClustersMistake[] {
  const { grid, w, h } = state;
  const at = (index: number): ClustersMistake => ({ index });
  const answer = answerOf(state);
  // A board without one answer has none to compare with, and a broken rule
  // is then all there is to report.
  if (answer.kind !== "one") return findErrors(grid, w, h).map(at);
  const color = (tiles: Uint8Array): Uint8Array => tiles.map((tile) => tile & COLMASK);
  return entryMistakes(
    {
      answer: color(answer.solution),
      entry: color(grid),
      fixed: (i) => (grid[i] & F_SINGLE) !== 0,
    },
    at,
  );
}

// --- hint ------------------------------------------------------------------

/** What a Clusters hint step's marks carry beyond the cells its words name
 * (see the hint marks block in render.ts's palette): the tiles the step
 * reasons from, each framed thin where the words outline it. That is the tile
 * the refuted coloring would break, where it isn't the target itself, or the
 * two tiles whose counts a Normal step reads. No other premise needs a
 * highlight or a palette role: every tile the rules read sits orthogonally
 * adjacent to the target or to those, so it is already in view. */
export interface ClustersHintHighlights {
  outlined: Point[];
}

/** A tile the words name: where it is, its color and whether it is a dot. */
const tileAt = (grid: Uint8Array, w: number, i: number): Tile => ({
  at: { x: i % w, y: (i / w) | 0 },
  fill: (grid[i] & COLMASK) as ClustersFill,
  dot: (grid[i] & F_SINGLE) !== 0,
});

/** Narrate the step, ringing `target` and outlining the tiles it reasons
 * from. The words, and how each ties "this cell" to an outlined tile, are
 * [`hint-text.ts`](./hint-text.ts)'s. `grid` is the board the deduction read. */
function narrate(
  d: ClustersDeduction,
  target: Point,
  grid: Uint8Array,
  w: number,
): Sentence {
  const { reason } = d;
  if (reason.kind === "count")
    return say.count(d, target, tileAt(grid, w, reason.a), tileAt(grid, w, reason.b));
  const danger =
    reason.at.cell !== d.index
      ? { x: reason.at.cell % w, y: (reason.at.cell / w) | 0 }
      : null;
  return say.direct(d, { target, danger });
}

function buildHighlights(d: ClustersDeduction, w: number): ClustersHintHighlights {
  const pt = (i: number): Point => ({ x: i % w, y: (i / w) | 0 });
  const { reason } = d;
  if (reason.kind === "count") return { outlined: [pt(reason.a), pt(reason.b)] };
  return { outlined: reason.at.cell !== d.index ? [pt(reason.at.cell)] : [] };
}

function hint(
  state: ClustersState,
): HintResult<ClustersMove, ClustersHintHighlights, ClustersRung> {
  const plan = deduceHintPlan(state.grid, state.w, state.h);
  // INVALID means some tile already placed must be wrong, and hinting would
  // lead deeper in. `findMistakes` names that tile wherever the board has one
  // answer, so this is reached only on a board without one. A plan that stops
  // short is an Unreasonable board's, whose steps up to the stall are
  // deductions all the same: the midend hints only a board with no mistake.
  if (plan.verdict === INVALID) return { ok: false, error: CONTRADICTION_UNLOCALIZED };
  if (plan.deductions.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  // The board each step was found on, for the tiles its words name.
  const board = state.grid.slice();
  const steps: HintStep<ClustersMove, ClustersHintHighlights, ClustersRung>[] =
    plan.deductions.map((d) => {
      const highlights = buildHighlights(d, state.w);
      const target = { x: d.index % state.w, y: (d.index / state.w) | 0 };
      const words = narrate(d, target, board, state.w);
      board[d.index] = d.fill;
      return {
        move: { kind: "paint", cells: [{ index: d.index, fill: d.fill }] },
        rung: d.reason.kind,
        explanation: words.text,
        words,
        highlights,
      };
    });
  return { ok: true, steps };
}

/** A move completes the step iff it paints exactly the hinted cell with the
 * hinted color. A multi-cell drag (even one covering the target) changes
 * cells the plan didn't account for, so it drops the plan to recompute. */
function hintKeepTrack(
  m: ClustersMove,
  step: HintStep<ClustersMove>,
  _state: ClustersState,
): HintTrackVerdict {
  if (m.kind !== "paint" || step.move.kind !== "paint") return "off";
  if (m.cells.length !== 1) return "off";
  const want = step.move.cells[0];
  const got = m.cells[0];
  return got.index === want.index && got.fill === want.fill ? "completed" : "off";
}

/** A tap on each cell the step colors. */
function hintGesture(
  state: ClustersState,
  ui: ClustersUi,
  ds: ClustersDrawState,
  move: ClustersMove,
  step: HintStep<ClustersMove>,
): readonly PointerAction[] {
  if (move.kind !== "paint") return [];
  const { w } = state;
  const cells = move.cells.map(({ index }) => ({ x: index % w, y: (index / w) | 0 }));
  return verbClicks(
    targetVerbs,
    { executeMove, hintKeepTrack },
    state,
    ui,
    ds,
    step,
    cells,
  );
}

/** Clusters' difficulty contract (`engine/difficulty.ts`). Below Unreasonable
 * the tiers are nested rungs of one fixpoint (`maxdiff` 0 is `solverTry`
 * alone, 1 adds `solverCount`); Unreasonable is the search's one answer. */
const difficulty = TIERS.contract<ClustersParams, ClustersState>({
  newState,
  deductionFinishes: (s, cap) => solveGame(s.grid.slice(), s.w, s.h, cap) === COMPLETE,
  answerOf,
});

export const clustersGame: Game<
  ClustersParams,
  ClustersState,
  ClustersMove,
  ClustersUi,
  ClustersDrawState,
  ClustersMistake,
  ClustersHintHighlights,
  ClustersRung
> = {
  id: "clusters",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: (p, rng) => newClustersDesc(p, rng),
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  status,

  solve,
  difficulty,
  hint,
  hintMarks: {
    roles: {
      ring: "the square the step colors. It is drawn empty: the sentence says which color it must be.",
      outline:
        "the squares the step reasons from, each in a thin ring: the dot or square where the other color would break a rule, or, on Normal boards, the two whose counts the step reads.",
    },
  },
  hintRungs: CLUSTERS_RUNGS,
  hintKeepTrack,
  hintGesture,
  findMistakes,
  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(clustersGame);
