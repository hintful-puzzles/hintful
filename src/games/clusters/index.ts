/**
 * Clusters — native TS port of `puzzles/unreleased/clusters.c`. Fill the grid
 * with red and blue tiles so that every plain tile touches **two or more**
 * tiles of its own color, and the given "dot" tiles touch exactly one (all
 * exactly-one tiles are given as dots — upstream's rule statement).
 * Left-click/-drag paints blue (cycling to red, then clear); right-click/-drag
 * paints red; a keyboard cursor places colors with Enter/Space/0/1/2/
 * backspace. Rule violations are shown live (upstream behavior), and Check &
 * Save additionally refuses to save while any violation stands
 * (`findMistakes`). The explained hint narrates the solver's proof by
 * contradiction: which rule the opposite coloring of the forced cell would
 * break.
 */

import { assertNever } from "../../engine/assert-never.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
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
import type { Narration } from "../../engine/hint-words.ts";
import type { OrderedCell } from "../../engine/overlay-sidecar.ts";
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
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
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
import { type Marked, say } from "./hint-text.ts";
import {
  border,
  type ClustersDrawState,
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  type ClustersDeduction,
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
  newState,
  opposite,
  paramConfig,
  presets,
  textFormat,
  validateDesc,
  validateParams,
} from "./state.ts";

/** A cell that breaks a rule in the current state — identical to what the
 * board draws live in red. */
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
const blueVerb: ClustersVerb = {
  does: "color it blue (click again for red, and again to clear it)",
  apply: paintWith((old) => cycleFill(old, F_COLOR_1)),
};
const redVerb: ClustersVerb = {
  does: "color it red (again for blue, and again to clear it)",
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
  primary: blueVerb,
  secondary: redVerb,
  keyOnly: [
    {
      does: "color it blue",
      keys: [digitKey(1)],
      apply: paintWith(() => F_COLOR_1),
      pointer: { kind: "cycle", button: "primary" },
    },
    {
      does: "color it red",
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
    // The press that started the drag picked its fill.
    const fill = ui.dragType as ClustersFill;
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

    // Shift = red ('A'), Ctrl = blue ('B'), Shift+Ctrl = clear ('C').
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

function solve(orig: ClustersState): SolveResult<ClustersMove> {
  const grid = orig.grid.slice();
  // Always the deepest rung: Solve and the hint are "try as hard as you can",
  // where the tier the board was *generated* at is irrelevant — an Easy board
  // is solved by the easy rung anyway, and running the lookahead over it costs
  // only the time it takes to find nothing left to do.
  solveGame(grid, orig.w, orig.h, 1);
  if (clustersStatus(grid, orig.w, orig.h) === INVALID) {
    return { ok: false, error: NO_SOLUTION };
  }
  const fills: ClustersFill[] = Array.from(
    grid,
    (byte) => (byte & COLMASK) as ClustersFill,
  );
  return { ok: true, move: { kind: "solve", fills } };
}

function findMistakes(state: ClustersState): readonly ClustersMistake[] {
  return findErrors(state.grid, state.w, state.h).map((index) => ({ index }));
}

// --- hint ------------------------------------------------------------------

/** What a Clusters hint step's marks carry beyond the cells its words name
 * (see the COL_HINT block in render.ts). `danger` is the tile the refuted
 * coloring would break — the one element the narration calls "outlined" —
 * when that isn't the target itself; `chain` is a lookahead firing's what-if
 * walk, each cell marked with the color the hypothesis would force it to. The
 * renderer paints either only where the words outline it, and reads it from
 * here because a danger tile can also be a link of the chain, and the words
 * name that square once. No other premise needs a highlight or a palette
 * role: every tile the three local rules read sits orthogonally adjacent to
 * the target or the danger tile, so it is already in view. */
export interface ClustersHintHighlights {
  danger?: Point;
  /** `order` is the link's 1-based place in the chain, drawn as an ordinal
   * (`drawHintOrdinal`). Explicit rather than the array index because the
   * narration cites it: it is data the renderer reads, not a positional
   * convention two files have to agree about. */
  chain: (OrderedCell & { fill: ClustersFill })[];
}

/** Narrate the proof by contradiction, ringing `target` and outlining the
 * cells `hl` carries. The words, and how each ties "this cell" to the
 * outlined tile, are [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(
  d: ClustersDeduction,
  target: Point,
  hl: ClustersHintHighlights,
): Narration {
  const m: Marked = { target, danger: hl.danger ?? null, chain: hl.chain };
  return d.reason.kind === "chain" ? say.chain(d, m) : say.direct(d, m);
}

function buildHighlights(d: ClustersDeduction, w: number): ClustersHintHighlights {
  const pt = (i: number): Point => ({ x: i % w, y: (i / w) | 0 });
  const at = d.reason.at;
  return {
    danger: at.cell !== d.index ? pt(at.cell) : undefined,
    chain:
      d.reason.kind === "chain"
        ? d.reason.steps.map((s, k) => ({ ...pt(s.index), fill: s.fill, order: k + 1 }))
        : [],
  };
}

function hint(state: ClustersState): HintResult<ClustersMove, ClustersHintHighlights> {
  // A board `findMistakes` passes can still be inconsistent without any one cell
  // being provably wrong, and that is answered with `CONTRADICTION_UNLOCALIZED`
  // below.
  const plan = deduceHintPlan(state.grid, state.w, state.h);
  // COMPLETE certifies the position (the error rules are monotone, so a wrong
  // tile can never extend to a zero-error grid); anything else means some
  // tile already placed must be wrong, and hinting would lead deeper in.
  if (plan.verdict === INVALID) return { ok: false, error: CONTRADICTION_UNLOCALIZED };
  if (plan.verdict !== COMPLETE || plan.deductions.length === 0) {
    return { ok: false, error: DEDUCTION_EXHAUSTED };
  }
  const steps: HintStep<ClustersMove, ClustersHintHighlights>[] = plan.deductions.map(
    (d) => {
      const highlights = buildHighlights(d, state.w);
      const target = { x: d.index % state.w, y: (d.index / state.w) | 0 };
      const words = narrate(d, target, highlights);
      return {
        move: { kind: "paint", cells: [{ index: d.index, fill: d.fill }] },
        explanation: words.text,
        words,
        highlights,
      };
    },
  );
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

/** Clusters' difficulty contract (`engine/difficulty.ts`). The two tiers are
 * nested rungs of one fixpoint (`maxdiff` 0 is `solverTry` alone, ≥ 1 adds
 * `solverRecurse`), which is why `solvableAtExactlyTier` asks the cheap rung
 * first — the deeper solve resumes from that same fixpoint. */
const difficulty: DifficultyContract<ClustersParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    const grid = s.grid.slice();
    const ret = solveGame(grid, s.w, s.h, cap);
    return ret === COMPLETE ? "solved" : ret === INVALID ? "impossible" : "unsolved";
  },
};

export const clustersGame: Game<
  ClustersParams,
  ClustersState,
  ClustersMove,
  ClustersUi,
  ClustersDrawState,
  ClustersMistake,
  ClustersHintHighlights
> = {
  id: "clusters",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: (p, rng) => newClustersDesc(p, rng),
  validateDesc,
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
      ring: "the square the step colors. It is drawn in purple, never blue, so it cannot be mistaken for a painted square: the sentence says which color it must be.",
      outline:
        "the squares the step reasons from. A double orange ring is on the dot or square where the other color would break a rule. On Normal boards, numbered outlined squares, each holding a small square of red or blue, show what supposing the other color would force, in order, and to which color: they are only a supposition, and nothing is placed there.",
    },
  },
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
  solvedFlash: () => FLASH_TIME,
};

registerGame(clustersGame);
