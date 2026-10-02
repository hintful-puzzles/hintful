/**
 * Mathrax — native TS port of `puzzles/unreleased/mathrax.c` (© 2019 Lennard
 * Sprong). Fill an `o × o` grid with digits `1..o`, no repeat in any row or
 * column, so that every clue sitting on an interior grid intersection holds: an
 * arithmetic clue means the operation gives the same result on both diagonal
 * pairs, `=` means each diagonal pair is equal, and `E`/`O` mean all four
 * surrounding digits are even / odd.
 *
 * Controls follow the Solo/Keen family: left-click (or the cursor) highlights a
 * cell for a real entry, right-click toggles pencil mode, a digit enters or
 * pencil-toggles that value, and backspace/space/`0` clears. Contradictions
 * highlight red live; Check & Save additionally flags entries and notes that
 * contradict the unique solution.
 */

import { assertNever } from "../../engine/assert-never.ts";
import {
  adaptiveMarkAllMove,
  applyNoteMove,
  type CandidatePlanPrefs,
  candidateGesture,
  candidateHint,
  keepCandidateHintTrack,
  type Mark,
  refreshCandidateHintStep,
} from "../../engine/candidate-hint.ts";
import { runLatinCandidatePlan, valuesOf } from "../../engine/candidate-plan.ts";
import { type DifficultyContract, difficultyItem } from "../../engine/difficulty.ts";
import { entryMistakes, gridCell } from "../../engine/entry-mistakes.ts";
import {
  type Game,
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  type ParamConfigItem,
  type PresetMenu,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { markAllNow } from "../../engine/hint-gesture.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import {
  latinPremise,
  narrateLatinReason,
  type Premise,
} from "../../engine/hint-text.ts";
import type { Narration } from "../../engine/hint-words.ts";
import { digitKeyCode, digitKeys } from "../../engine/key-labels.ts";
import { rowColRegions } from "../../engine/latin-hint.ts";
import {
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
  gridCursorMove,
  isCursorMove,
  isEraseKey,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { SQUARE_GRID } from "../../engine/sections.ts";
import type { Point } from "../../engine/types.ts";
import { newMathraxDesc } from "./generator.ts";
import { say } from "./hint-text.ts";
import {
  colors,
  computeSize,
  FLASH_TIME,
  fromCoord,
  type MathraxDrawState,
  type MathraxHint,
  newDrawState,
  origin,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  type HintOp,
  type HintReason,
  mathraxSolve,
  recordMathraxDeductions,
  SOLVE_AMBIGUOUS,
  SOLVE_IMPOSSIBLE,
  SOLVE_UNIQUE,
} from "./solver.ts";
import {
  CLUE_EVN,
  cloneState,
  clueCells,
  clueIsParity,
  clueOpposite,
  clueType,
  DIFF_NAMES,
  DIFF_RECURSIVE,
  DIFF_TRICKY,
  decodeParams,
  defaultParams,
  diffFromLevel,
  diffLevel,
  diffToLevel,
  encodeParams,
  F_IMMUTABLE,
  type MathraxMove,
  type MathraxParams,
  type MathraxState,
  type MathraxUi,
  mathraxValidate,
  newState,
  newUi,
  OPTION_ADD,
  OPTION_DIV,
  OPTION_EQL,
  OPTION_MUL,
  OPTION_ODD,
  OPTION_SUB,
  OPTIONSMASK,
  status,
  validateParams,
} from "./state.ts";

/** A player marking that contradicts the unique solution:
 * - `"cell"` — a filled-in digit that is wrong;
 * - `"note"` — an empty cell whose non-empty pencil notes have crossed out the
 *   cell's solution digit
 *   (docs/games/mechanics.md § "Pencil marks: the full note-taking UX"). */
export interface MathraxMistake extends Point {
  kind: "cell" | "note";
}

// --- presets ---------------------------------------------------------------

const PRESETS: MathraxParams[] = [
  { o: 5, diff: "easy", options: OPTIONSMASK },
  { o: 5, diff: "normal", options: OPTIONSMASK },
  { o: 5, diff: "tricky", options: OPTIONSMASK },
  { o: 6, diff: "easy", options: OPTIONSMASK },
  { o: 6, diff: "normal", options: OPTIONSMASK },
  { o: 6, diff: "tricky", options: OPTIONSMASK },
  { o: 7, diff: "normal", options: OPTIONSMASK },
  { o: 8, diff: "normal", options: OPTIONSMASK },
  { o: 9, diff: "normal", options: OPTIONSMASK },
];

function presets(): PresetMenu<MathraxParams> {
  return {
    title: "Mathrax",
    submenu: PRESETS.map((p) => ({ params: p })),
  };
}

// --- input -----------------------------------------------------------------

function interpretMove(
  state: MathraxState,
  ui: MathraxUi,
  ds: MathraxDrawState,
  p: Point,
  rawButton: number,
): MathraxMove | null | UiUpdate {
  const o = state.params.o;
  const ts = ds.tileSize;
  const button = stripModifiers(rawButton);

  const gx = fromCoord(p.x, ts);
  const gy = fromCoord(p.y, ts);

  if (
    gx >= 0 &&
    gx < o &&
    gy >= 0 &&
    gy < o &&
    pressNoteTakingCell(ui, button, gx, gy, {
      canEnter: !(state.flags[gy * o + gx] & F_IMMUTABLE),
      canMark: state.grid[gy * o + gx] === 0,
    })
  ) {
    return UI_UPDATE;
  }

  if (isCursorMove(button)) {
    const moved = gridCursorMove(button, ui.cursor.x, ui.cursor.y, o, o);
    if (moved) {
      ui.cursor.x = moved.x;
      ui.cursor.y = moved.y;
    }
    ui.cursor.visible = true;
    ui.cursorFromKeyboard = true;
    return UI_UPDATE;
  }

  const toggled = toggleNoteTakingMode(ui, button);
  if (toggled) return toggled;

  // Digit entry. Space (`CURSOR_SELECT2`), backspace/delete and `0` clear;
  // upstream binds only `'\b'`, which this frontend never sends.
  const isClear = button === CURSOR_SELECT2 || isEraseKey(button);
  const c = isClear ? 0 : digitOf(button);
  if (ui.cursor.visible && c !== null) {
    const i = ui.cursor.y * o + ui.cursor.x;

    if (c > o) return null;
    // A filled square can't take a pencil mark (reachable via the cursor).
    if (ui.pencilMode && state.grid[i] !== 0) return null;
    // Re-entering the digit already there changes nothing.
    if (!ui.pencilMode && state.grid[i] === c) {
      if (ui.cursorFromKeyboard) return null;
      ui.cursor.visible = false;
      return UI_UPDATE;
    }
    if (state.flags[i] & F_IMMUTABLE) return null;

    releaseHighlightAfterEntry(ui);
    return ui.pencilMode
      ? { type: "set", x: ui.cursor.x, y: ui.cursor.y, n: c, pencil: true }
      : {
          type: "set",
          x: ui.cursor.x,
          y: ui.cursor.y,
          n: c,
          pencil: false,
          autoElim: ui.autoPencil,
        };
  }

  // 'M' / 'm': adaptive mark-all
  // (docs/games/mechanics.md § "Pencil marks: the full note-taking UX").
  // Mathrax's uniqueness regions are exactly the row and the column; a clue is
  // *not* one.
  if (button === 77 || button === 109) {
    return adaptiveMarkAllMove<MathraxMove>(state.grid, state.pencil, o, (x, y) =>
      rowColRegions(x, y, o),
    );
  }

  return null;
}

// --- moves -----------------------------------------------------------------

function executeMove(state: MathraxState, move: MathraxMove): MathraxState {
  const o = state.params.o;
  const next = cloneState(state);

  switch (move.type) {
    case "set": {
      const i = move.y * o + move.x;
      if (state.flags[i] & F_IMMUTABLE) throw new Error("mathrax: cell is a given");
      if (move.pencil) {
        if (move.n === 0) next.pencil[i] = 0;
        else next.pencil[i] ^= 1 << move.n;
      } else {
        next.grid[i] = move.n;
        if (move.autoElim && move.n > 0) {
          const bit = ~(1 << move.n);
          for (let k = 0; k < o; k++) {
            if (k !== move.x) next.pencil[move.y * o + k] &= bit;
            if (k !== move.y) next.pencil[k * o + move.x] &= bit;
          }
        }
      }
      // Upstream recomputes the live error flags after *both* a real entry and
      // a pencil change.
      mathraxValidate(o, next.grid, next.clues, next.flags);
      return next;
    }
    case "pencilAll":
    case "pencilStrike":
    case "pencilAdd":
      applyNoteMove(move, next.grid, next.pencil, o);
      return next;
    case "solve": {
      for (let i = 0; i < o * o; i++) {
        if (!(next.flags[i] & F_IMMUTABLE)) {
          next.grid[i] = move.grid[i];
          next.pencil[i] = 0;
        }
      }
      mathraxValidate(o, next.grid, next.clues, next.flags);
      return next;
    }
    default:
      return assertNever(move, "mathrax: executeMove");
  }
}

// --- solving ---------------------------------------------------------------

/** A fresh grid holding only the givens, for the solver to fill. */
const givens = (s: MathraxState): Uint8Array =>
  s.grid.map((d, i) => (s.flags[i] & F_IMMUTABLE ? d : 0));

/**
 * Solve from the givens alone into a fresh grid. Derives the answer from the
 * placed givens only — never from the player's notes, since a note can be wrong
 * and that is exactly what `findMistakes` is checking.
 *
 * `requireUnique` separates the two callers. `findMistakes` needs a *unique*
 * answer: with several solutions, a cell differing from the one we happened to
 * find is not a mistake. `solve` does not — any complete valid grid is a
 * legitimate answer to show, which keeps Solve working on the ambiguous boards
 * an upstream-generated `Recursive` game ID still describes (see the
 * divergence note in `generator.ts`).
 */
function solveFromGivens(
  state: MathraxState,
  requireUnique: boolean,
): Uint8Array | null {
  const grid = givens(state);
  const verdict = mathraxSolve(state.params.o, grid, state.clues, DIFF_RECURSIVE);
  const ok = requireUnique
    ? verdict === SOLVE_UNIQUE
    : verdict === SOLVE_UNIQUE || verdict === SOLVE_AMBIGUOUS;
  return ok ? grid : null;
}

function solve(orig: MathraxState): SolveResult<MathraxMove> {
  const soln = solveFromGivens(orig, false);
  if (!soln) return { ok: false, error: PUZZLE_NOT_REASONABLE };
  return { ok: true, move: { type: "solve", grid: Array.from(soln) } };
}

function findMistakes(state: MathraxState): readonly MathraxMistake[] {
  const o = state.params.o;
  const soln = solveFromGivens(state, true);
  if (!soln) return [];
  return entryMistakes(
    { answer: soln, entry: state.grid, notes: state.pencil },
    gridCell(o),
  );
}

// --- hint ------------------------------------------------------------------

/**
 * Why a strike is forced (docs/games/hints.md § "Writing the narration"):
 * indication, then reasoning, which the walk concludes with the move it makes.
 * `ns` is the struck value list. The words are
 * [`hint-text.ts`](./hint-text.ts)'s.
 *
 * **Which of the clue's two sentences it speaks is read off the working board,
 * not off the record.** The solver reaches a clue elimination either from a
 * partner whose candidates have collapsed to one or from its whole remaining
 * set, but what the *player* can check is whether a digit is written across the
 * clue — so the "and the 3 across it" sentence is spoken exactly when one is,
 * and the "nothing open across it" sentence otherwise. This is the rule
 * `latin-hint.ts` applies to a recorded `single`, aimed at a clue.
 */
function premise(
  reason: HintReason,
  marks: readonly Mark[],
  grid: ArrayLike<number>,
  o: number,
): Premise {
  const target = { x: marks[0].x, y: marks[0].y };
  switch (reason.kind) {
    case "clue": {
      // A clue's cells are what names it: an arithmetic clue constrains one
      // diagonal pair, an `E`/`O` clue all four cells around it, and either set
      // meets at exactly one intersection, so outlining them points at the clue
      // without the board having any way to mark the intersection itself.
      const { clue, cx, cy } = reason;
      if (clueIsParity(clue))
        return { premise: say.parity(clueType(clue) === CLUE_EVN, clueCells(cx, cy)) };
      const across = clueOpposite(cx, cy, target);
      const pair = [target, across];
      const v = grid[across.y * o + across.x];
      return v
        ? { premise: say.paired(clue, pair, target, v) }
        : { premise: say.open(clue, pair, valuesOf(marks)), named: true };
    }
    // The generic Latin arms (dup / set / forcing) read identically to Keen's
    // and Unequal's — narrated once, shared.
    default:
      return latinPremise(reason, marks);
  }
}

/** Why a placement is forced: always a generic single, since no clue places. */
function narrate(reason: HintReason, m: Mark, o: number): Narration {
  if (reason.kind === "clue") throw new Error("a clue deduction strikes");
  return narrateLatinReason(reason, m, o);
}

/** Build the hint plan by walking a working copy of the board the way a person
 * solves it (`runLatinCandidatePlan`), under the player's two pencil
 * preferences. */
function buildSteps(
  state: MathraxState,
  { autoClean, reading }: CandidatePlanPrefs,
): HintStep<MathraxMove, MathraxHint>[] {
  const o = state.params.o;
  const steps: HintStep<MathraxMove, MathraxHint>[] = [];
  const wGrid = Uint8Array.from(state.grid);
  // Deductive only: a guess is not a teachable note strike, so the recording
  // solve is capped below the recursive tier whatever the board's own tier is.
  const maxdiff = Math.min(diffToLevel(state.params.diff), DIFF_TRICKY);
  runLatinCandidatePlan<MathraxMove, MathraxHint, HintOp, HintReason>({
    w: o,
    steps,
    grid: wGrid,
    pencil: Int32Array.from(state.pencil),
    autoClean,
    reading,
    label: "mathrax hint plan",
    record: () => recordMathraxDeductions(o, state.clues, wGrid, maxdiff),
    placeWords: (m, reason) => ({ words: narrate(reason, m, o) }),
    strikeWords: (marks, reason) => premise(reason, marks, wGrid, o),
    notes: { noun: "number", placedVerb: "standing" },
  });
  return steps;
}

function hint(
  state: MathraxState,
  _aux?: string,
  ui?: MathraxUi,
): HintResult<MathraxMove, MathraxHint> {
  return candidateHint(state, ui ?? newUi(state), buildSteps);
}

/** Classify a player move against the displayed hint step (shared
 * candidate-elimination keep-track; `MathraxHint` is structurally
 * `CandidateHighlights`). */
function hintKeepTrack(
  m: MathraxMove,
  step: HintStep<MathraxMove, MathraxHint>,
  state: MathraxState,
): HintTrackVerdict {
  return keepCandidateHintTrack(m, step, state.pencil, state.params.o);
}

/** Re-validate a stored hint step against the current board before it is
 * (re-)displayed (shared "never show a stale step" guarantee). */
function refreshHintStep(
  step: HintStep<MathraxMove, MathraxHint>,
  state: MathraxState,
): HintStep<MathraxMove, MathraxHint> | null {
  return refreshCandidateHintStep(step, state.grid, state.pencil, state.params.o);
}

// --- the game --------------------------------------------------------------

/** The six clue-type checkboxes, in the Custom dialog's order. The `kw`s are
 * upstream's config-name slugs; `word` is how a params label names the type. */
const CLUE_OPTIONS: ReadonlyArray<{
  kw: string;
  name: string;
  word: string;
  bit: number;
  doc: string;
}> = [
  {
    kw: "addition-clues",
    name: "Addition clues",
    word: "addition",
    bit: OPTION_ADD,
    doc: "Allows clues with the addition operation to appear.",
  },
  {
    kw: "subtraction-clues",
    name: "Subtraction clues",
    word: "subtraction",
    bit: OPTION_SUB,
    doc: "Allows clues with the subtraction operation to appear. Note that clues with a difference of zero are covered by Equality clues instead.",
  },
  {
    kw: "multiplication-clues",
    name: "Multiplication clues",
    word: "multiplication",
    bit: OPTION_MUL,
    doc: "Allows clues with the multiplication operation to appear.",
  },
  {
    kw: "division-clues",
    name: "Division clues",
    word: "division",
    bit: OPTION_DIV,
    doc: "Allows clues with the division operation to appear. Note that clues with a ratio of one are covered by Equality clues instead.",
  },
  {
    kw: "equality-clues",
    name: "Equality clues",
    word: "equality",
    bit: OPTION_EQL,
    doc: "Allows clues with equality signs to appear.",
  },
  {
    kw: "even-odd-clues",
    name: "Even/odd clues",
    word: "even-odd",
    bit: OPTION_ODD,
    doc: "Allows Even clues and Odd clues to appear.",
  },
];

/** The clue types a label names: nothing when all are on, and otherwise
 * whichever of the enabled and disabled lists is shorter. The six checkboxes
 * are said as one phrase, so the first of them carries it. */
function clueWords(p: MathraxParams): string | null {
  const on = CLUE_OPTIONS.filter(({ bit }) => p.options & bit).map((c) => c.word);
  const off = CLUE_OPTIONS.filter(({ bit }) => !(p.options & bit)).map((c) => c.word);
  if (off.length === 0) return null;
  return on.length <= off.length ? `only ${on.join("/")}` : `no ${off.join("/")}`;
}

/** Mathrax's difficulty contract (`engine/difficulty.ts`). `mathraxSolve` has
 * its own four-way return (`SOLVE_IMPOSSIBLE` / `SOLVE_STUCK` / `SOLVE_UNIQUE` /
 * `SOLVE_AMBIGUOUS`) rather than the latin-family sentinels its solver is built
 * on, so it is read here and not by `latinVerdict`. The solve starts from the
 * board's givens: a blank grid would make every board unsolvable at every cap. */
const difficulty: DifficultyContract<MathraxParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    const ret = mathraxSolve(p.o, givens(s), s.clues, cap);
    if (ret === SOLVE_UNIQUE) return "solved";
    return ret === SOLVE_IMPOSSIBLE ? "impossible" : "unsolved";
  },
};

export const mathraxGame: Game<
  MathraxParams,
  MathraxState,
  MathraxMove,
  MathraxUi,
  MathraxDrawState,
  MathraxMistake,
  MathraxHint
> = {
  id: "mathrax",
  canMarkAll: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,

  paramConfig: [
    numberItem<MathraxParams>("size", "Size", "o", {
      doc: "Size of the grid in squares.",
      // One digit per cell.
      bounds: { min: 3, max: 9 },
      label: { slot: "size", words: squareSize("o") },
    }),
    difficultyItem(
      DIFF_NAMES,
      {
        get: (p: MathraxParams) => diffLevel(p.diff),
        set: (p: MathraxParams, tier: number) => {
          p.diff = diffFromLevel(tier);
        },
      },
      {
        doc: "A puzzle always needs the difficulty you chose; it will never be solvable by the techniques of the level below. At size 3 the grid is too small to tell some levels apart, so only Easy and Tricky are offered there.",
      },
    ),
    ...CLUE_OPTIONS.map(
      ({ kw, name, bit, doc }, i): ParamConfigItem<MathraxParams> => ({
        kw,
        name,
        type: "boolean",
        doc,
        ...(i === 0 ? { label: { slot: "tail", words: clueWords } } : {}),
        get: (p) => (p.options & bit) !== 0,
        set: (p, v) => {
          p.options = v ? p.options | bit : p.options & ~bit;
        },
      }),
    ),
  ],

  newDesc: (p, rng) => newMathraxDesc(p, rng),
  newState,
  newUi,

  interpretMove,
  executeMove,
  status,
  notApplicable: { transposeParams: SQUARE_GRID },

  solve,
  difficulty,
  findMistakes,
  hint,
  hintMarks: {
    roles: {
      ring: "the cell the step decides, or whose pencil marks it crosses out. The numbers it strikes are crossed through in their own color.",
      outline:
        "what the step reasons from: the cells a clue constrains (the diagonal pair it sits between, or all four around an E or O), the number just placed, the cells of a set, or the numbered cells of a chain, in the order it runs.",
      stripes: 'the row or column the sentence names: "in this row".',
    },
  },
  hintKeepTrack,
  hintGesture: (s, ui, ds, m) => {
    const ts = ds.tileSize;
    const mid = (v: number) => origin(ts) + v * ts + ((ts / 2) | 0);
    return candidateGesture(
      m,
      ui,
      (x, y) => ({ x: mid(x), y: mid(y) }),
      digitKeyCode,
      undefined,
      markAllNow(interpretMove, s, ui, ds),
    );
  },
  refreshHintStep,
  requestKeys: (p) => digitKeys(p.o),

  prefs: [
    autoPencilPref<MathraxUi>(
      "When you place a number, remove it from pencil marks in its row and column",
    ),
    stickyPencilPref<MathraxUi>(),
    pencilKeepHighlightPref<MathraxUi>(),
    candidateReadingPref<MathraxUi>(),
  ],

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  solvedFlash: () => FLASH_TIME,
};

registerGame(mathraxGame);
