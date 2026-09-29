/**
 * Keen (KenKen / Inshi No Heya) — native TS port of `keen.c`. Fill a `w × w`
 * grid with digits `1..w` so every row and column holds each digit once, and so
 * each arithmetic cage's digits satisfy its clue (target value + operation).
 * Left-click / cursor select highlights a cell for a real entry; right-click /
 * select2 highlights it for a pencil mark (or toggles sticky pencil mode); a
 * digit enters (or pencil-toggles) that value; backspace/space clears. Rule
 * violations highlight live; Check & Save additionally flags cells that
 * contradict the unique solution.
 */

import { assertNever } from "../../engine/assert-never.ts";
import {
  adaptiveMarkAllMove,
  applyNoteMove,
  type CandidatePlanPrefs,
  candidateHint,
  keepCandidateHintTrack,
  type Mark,
  refreshCandidateHintStep,
} from "../../engine/candidate-hint.ts";
import { runLatinCandidatePlan, valuesOf } from "../../engine/candidate-plan.ts";
import { digitValue } from "../../engine/decimal.ts";
import { type DifficultyContract, difficultyItem } from "../../engine/difficulty.ts";
import { entryMistakes, gridCell } from "../../engine/entry-mistakes.ts";
import { winFlash } from "../../engine/flash.ts";
import {
  type Game,
  type HintStep,
  type PresetMenu,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import {
  latinPremise,
  narrateLatinReason,
  type Premise,
} from "../../engine/hint-text.ts";
import type { Narration } from "../../engine/hint-words.ts";
import { digitKeys } from "../../engine/key-labels.ts";
import { latinVerdict } from "../../engine/latin.ts";
import { rowColRegions } from "../../engine/latin-hint.ts";
import {
  noOpEntryResult,
  pressNoteTakingCell,
  releaseHighlightAfterEntry,
  toggleNoteTakingMode,
} from "../../engine/note-taking-cell.ts";
import { numberItem, squareSize } from "../../engine/params.ts";
import {
  autoPencilPref,
  candidateReadingPref,
  pencilKeepHighlightPref,
  stickyPencilPref,
} from "../../engine/pencil-prefs.ts";
import {
  CURSOR_SELECT2,
  digitOf,
  isCursorMove,
  isEraseKey,
  moveCursor,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { SQUARE_GRID } from "../../engine/sections.ts";
import type { KeyLabel, Point } from "../../engine/types.ts";
import { newKeenDesc } from "./generator.ts";
import { say } from "./hint-text.ts";
import {
  colors,
  computeSize,
  FLASH_TIME,
  fromCoord,
  type KeenDrawState,
  type KeenHint,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  DIFF_AMBIGUOUS,
  DIFF_IMPOSSIBLE,
  type HintOp,
  type HintReason,
  recordKeenDeductions,
  solveKeen,
} from "./solver.ts";
import {
  checkErrors,
  cloneState,
  DIFF_EXTREME,
  DIFF_NAMES,
  DIFF_UNREASONABLE,
  decodeParams,
  defaultParams,
  diffFromLevel,
  diffToLevel,
  encodeParams,
  type KeenMove,
  type KeenParams,
  type KeenState,
  type KeenUi,
  newState,
  newUi,
  status,
  validateDesc,
} from "./state.ts";

/** A player marking that contradicts the unique solution:
 * - `"cell"` — a filled-in digit that is wrong;
 * - `"note"` — an empty cell whose non-empty pencil notes have crossed out the
 *   cell's solution digit. */
export interface KeenMistake {
  kind: "cell" | "note";
  x: number;
  y: number;
}

const PRESETS: KeenParams[] = [
  { w: 4, diff: "easy", multiplicationOnly: false },
  { w: 5, diff: "easy", multiplicationOnly: false },
  { w: 5, diff: "easy", multiplicationOnly: true },
  { w: 6, diff: "easy", multiplicationOnly: false },
  { w: 6, diff: "normal", multiplicationOnly: false },
  { w: 6, diff: "normal", multiplicationOnly: true },
  { w: 6, diff: "hard", multiplicationOnly: false },
  { w: 6, diff: "extreme", multiplicationOnly: false },
  { w: 6, diff: "unreasonable", multiplicationOnly: false },
  { w: 9, diff: "normal", multiplicationOnly: false },
];

function presets(): PresetMenu<KeenParams> {
  return {
    title: "Keen",
    submenu: PRESETS.map((p) => ({ params: p })),
  };
}

function inGrid(w: number, x: number, y: number): boolean {
  return x >= 0 && x < w && y >= 0 && y < w;
}

function interpretMove(
  state: KeenState,
  ui: KeenUi,
  ds: KeenDrawState,
  p: Point,
  rawButton: number,
): KeenMove | null | UiUpdate {
  const w = state.params.w;
  const ts = ds.tileSize;
  const button = stripModifiers(rawButton);

  const tx = fromCoord(p.x, ts);
  const ty = fromCoord(p.y, ts);

  if (
    inGrid(w, tx, ty) &&
    pressNoteTakingCell(ui, button, tx, ty, {
      canEnter: true, // Keen has no immutable givens
      canMark: state.grid[ty * w + tx] === 0,
    })
  ) {
    return UI_UPDATE;
  }

  if (isCursorMove(button)) {
    ui.cursorFromKeyboard = true;
    return moveCursor(ui.cursor, button, w, w) ? UI_UPDATE : null;
  }

  const toggled = toggleNoteTakingMode(ui, button);
  if (toggled) return toggled;

  const isClear = button === CURSOR_SELECT2 || isEraseKey(button);
  const n = isClear ? 0 : digitOf(button);
  if (ui.cursor.visible && n !== null && n <= w) {
    const i = ui.cursor.y * w + ui.cursor.x;

    // Can't pencil-mark a filled square (reachable only via the cursor).
    if (ui.pencilMode && state.grid[i]) return null;

    // No-op: setting a square to what it already holds (and no pencil marks).
    if ((!ui.pencilMode || n === 0) && state.grid[i] === n && state.pencil[i] === 0)
      return noOpEntryResult(ui);

    const pencil = ui.pencilMode && n > 0;
    releaseHighlightAfterEntry(ui);
    return pencil
      ? { type: "set", x: ui.cursor.x, y: ui.cursor.y, n, pencil }
      : {
          type: "set",
          x: ui.cursor.x,
          y: ui.cursor.y,
          n,
          pencil,
          autoElim: ui.autoPencil,
        };
  }

  // 'M' / 'm': fill all pencil marks, then (on a fully-noted board) clean the
  // obvious row/column candidates. Keen cages are arithmetic, NOT uniqueness
  // regions, so a legal cage duplicate is never struck.
  if (button === 77 || button === 109)
    return adaptiveMarkAllMove<KeenMove>(state.grid, state.pencil, w, (x, y) =>
      rowColRegions(x, y, w),
    );

  return null;
}

function executeMove(state: KeenState, move: KeenMove): KeenState {
  const w = state.params.w;
  const next = cloneState(state);

  switch (move.type) {
    case "set": {
      const i = move.y * w + move.x;
      if (move.pencil && move.n > 0) {
        next.pencil[i] ^= 1 << move.n;
      } else {
        next.grid[i] = move.n;
        next.pencil[i] = 0;
        if (move.autoElim && move.n > 0) {
          const bit = ~(1 << move.n);
          for (let k = 0; k < w; k++) {
            if (k !== move.x) next.pencil[move.y * w + k] &= bit;
            if (k !== move.y) next.pencil[k * w + move.x] &= bit;
          }
        }
        if (!next.completed && !checkErrors(next)) next.completed = true;
      }
      return next;
    }
    case "pencilAll":
    case "pencilStrike":
    case "pencilAdd":
      applyNoteMove(move, next.grid, next.pencil, w);
      return next;
    case "solve": {
      for (let i = 0; i < w * w; i++) {
        next.grid[i] = move.grid[i];
        next.pencil[i] = 0;
      }
      next.completed = true;
      next.cheated = true;
      return next;
    }
    default:
      return assertNever(move, "keen: executeMove");
  }
}

function changedState(ui: KeenUi, _old: KeenState | null, newSt: KeenState): void {
  const w = newSt.params.w;
  if (
    ui.cursor.visible &&
    ui.pencilMode &&
    !ui.cursorFromKeyboard &&
    newSt.grid[ui.cursor.y * w + ui.cursor.x] !== 0
  ) {
    ui.cursor.visible = false;
  }
}

function solve(orig: KeenState, _curr: KeenState, aux?: string): SolveResult<KeenMove> {
  const w = orig.params.w;
  if (aux) {
    const grid: number[] = [];
    for (let i = 0; i < w * w; i++) {
      // `aux` is written by `newDesc` in this process and never read from a
      // save, so a non-digit here is a broken encoder rather than a bad input.
      const digit = digitValue(aux[i + 1]);
      if (digit === null) return { ok: false, error: "invalid char in aux" };
      grid[i] = digit;
    }
    return { ok: true, move: { type: "solve", grid } };
  }
  const soln = new Uint8Array(w * w);
  const ret = solveKeen(w, orig.clues, soln, DIFF_UNREASONABLE);
  if (ret === DIFF_IMPOSSIBLE)
    return { ok: false, error: "No solution exists for this puzzle" };
  if (ret === DIFF_AMBIGUOUS)
    return { ok: false, error: "Multiple solutions exist for this puzzle" };
  return { ok: true, move: { type: "solve", grid: Array.from(soln) } };
}

function findMistakes(state: KeenState): readonly KeenMistake[] {
  const w = state.params.w;
  // The solution is derived from the cage clue structure only (Keen has no
  // givens) — never from the player's notes (a note can be wrong; that is what
  // we are checking).
  const soln = new Uint8Array(w * w);
  const ret = solveKeen(w, state.clues, soln, DIFF_UNREASONABLE);
  if (ret === DIFF_IMPOSSIBLE || ret === DIFF_AMBIGUOUS) return [];
  return entryMistakes(
    { answer: soln, entry: state.grid, notes: state.pencil },
    gridCell(w),
  );
}

// --- hint ------------------------------------------------------------------

/** Why a strike is forced (docs/games/hints.md § "Writing the narration"):
 * indication, then reasoning, which the walk concludes. `ns` is the struck value
 * list. Cage deductions name the cage by its clue; the generic Latin arms read
 * identically to Unequal's, narrated once, shared. The words are
 * [`hint-text.ts`](./hint-text.ts)'s. */
function premise(reason: HintReason, marks: readonly Mark[]): Premise {
  const ns = valuesOf(marks);
  switch (reason.kind) {
    case "cage":
      return {
        premise: say.cage(reason.cells, reason.op, reason.value, ns, marks[0]),
        named: true,
      };
    case "cageLine":
      return {
        premise: say.cageLine(
          reason.cells,
          reason.op,
          reason.value,
          ns[0],
          reason.horizontal,
        ),
      };
    default:
      return latinPremise(reason, marks);
  }
}

/** Why a placement is forced: always a generic single, since no cage deduction
 * places. */
function narrate(reason: HintReason, m: Mark, w: number): Narration {
  if (reason.kind === "cage" || reason.kind === "cageLine")
    throw new Error(`a ${reason.kind} deduction strikes`);
  return narrateLatinReason(reason, m, w);
}

/** What a cage deduction reads beyond the marks its words name: what the cage
 * can still hold is what its cells can, so they are all read. */
function reasonReads(reason: HintReason): { reads?: Point[] } {
  return reason.kind === "cage" || reason.kind === "cageLine"
    ? { reads: reason.cells }
    : {};
}

/** Build the hint plan by walking a working copy of the board the way a person
 * solves it (`runLatinCandidatePlan`), under the player's two pencil
 * preferences. */
function buildSteps(
  state: KeenState,
  { autoClean, reading }: CandidatePlanPrefs,
): HintStep<KeenMove, KeenHint>[] {
  const w = state.params.w;
  const steps: HintStep<KeenMove, KeenHint>[] = [];
  const wGrid = Int8Array.from(state.grid);
  const maxdiff = Math.min(diffToLevel(state.params.diff), DIFF_EXTREME);
  runLatinCandidatePlan<KeenMove, KeenHint, HintOp, HintReason>({
    w,
    steps,
    grid: wGrid,
    pencil: Int32Array.from(state.pencil),
    autoClean,
    reading,
    label: "keen hint plan",
    record: () => recordKeenDeductions(w, state.clues, Uint8Array.from(wGrid), maxdiff),
    placeWords: (m, reason) => ({ words: narrate(reason, m, w) }),
    strikeWords: (marks, reason) => ({
      ...premise(reason, marks),
      ...reasonReads(reason),
    }),
    // A cage's narration is about "this cell", with the whole cage hatched on
    // every leg, so a firing is one leg per cell.
    strikeAxis: (op) => op.y * w + op.x,
    notes: { noun: "number", placedVerb: "standing" },
  });
  return steps;
}

/** Keen's difficulty contract (`engine/difficulty.ts`). `solveKeen` follows the
 * shared latin-family return convention — the difficulty reached, or one of
 * `latin.ts`'s sentinels — so `latinVerdict` reads it. Keen has no givens: the
 * solution comes from the cage clues alone. */
const difficulty: DifficultyContract<KeenParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    const w = s.params.w;
    return latinVerdict(solveKeen(w, s.clues, new Uint8Array(w * w), cap));
  },
};

export const keenGame: Game<
  KeenParams,
  KeenState,
  KeenMove,
  KeenUi,
  KeenDrawState,
  KeenMistake,
  KeenHint
> = {
  id: "keen",
  canMarkAll: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  paramConfig: [
    numberItem<KeenParams>("grid-size", "Grid size", "w", {
      doc: "Width and height of the grid, which is also the largest number in it.",
      // One digit per cell.
      bounds: { min: 3, max: 9 },
      label: { slot: "size", words: squareSize("w") },
    }),
    difficultyItem(DIFF_NAMES, {
      get: (p: KeenParams) => diffToLevel(p.diff),
      set: (p: KeenParams, tier: number) => {
        p.diff = diffFromLevel(tier);
      },
    }),
    {
      kw: "multiplication-only",
      name: "Multiplication only",
      type: "boolean",
      doc: "When enabled, every cage's clue is a product: no sums, differences or ratios.",
      label: {
        slot: "tail",
        words: (p) => (p.multiplicationOnly ? "multiplication only" : null),
      },
      get: (p) => p.multiplicationOnly,
      set: (p, v) => {
        p.multiplicationOnly = v;
      },
    },
  ],

  newDesc: newKeenDesc,
  validateDesc,
  newState,
  newUi,
  changedState,

  interpretMove,
  executeMove,
  status,
  notApplicable: { transposeParams: SQUARE_GRID },

  solve,
  difficulty,
  hint: (state, _aux, ui) =>
    candidateHint(state, ui ?? newUi(state), findMistakes, buildSteps),
  hintMarks: {
    roles: {
      ring: "the cell the step is about: the number to enter there, or the pencil marks to cross out, which are shown with a line through them.",
      outline:
        "what the step reasons from: cells that between them already account for the numbers being crossed out, the number just placed, or a chain of cells with two numbers left each, numbered in the order the sentence reads them.",
      stripes:
        'the cage, row or column the sentence names: "this cage", "this row" or "this column".',
    },
  },
  // The shared candidate-elimination keep-track and stale-step check;
  // `KeenHint` is structurally `CandidateHighlights`.
  hintKeepTrack: (m, step, state) =>
    keepCandidateHintTrack(m, step, state.pencil, state.params.w),
  refreshHintStep: (step, state) =>
    refreshCandidateHintStep(step, state.grid, state.pencil, state.params.w),
  findMistakes,
  requestKeys: (p): KeyLabel[] => digitKeys(p.w),

  prefs: [
    autoPencilPref<KeenUi>(
      "When you place a number, remove it from pencil marks in its row and column",
    ),
    stickyPencilPref<KeenUi>(),
    pencilKeepHighlightPref<KeenUi>(),
    candidateReadingPref<KeenUi>(),
  ],

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  flashLength: (from, to) => winFlash(from, to, FLASH_TIME),
};

registerGame(keenGame);
