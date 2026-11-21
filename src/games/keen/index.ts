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

import { assertNever } from "../../engine/contract/assert-never.ts";
import type { DifficultyContract } from "../../engine/contract/difficulty.ts";
import {
  type Game,
  type HintStep,
  type PresetBoards,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/contract/game.ts";
import { CELL, type Sentence } from "../../engine/contract/hint-words.ts";
import { SQUARE_GRID } from "../../engine/contract/sections.ts";
import {
  MULTIPLE_SOLUTIONS,
  NO_SOLUTION,
} from "../../engine/contract/solve-failure.ts";
import type { KeyLabel, Point } from "../../engine/contract/types.ts";
import { digitValue } from "../../engine/game-id/decimal.ts";
import {
  adaptiveMarkAllMove,
  applyNoteMove,
  type CandidatePlanPrefs,
  candidateGesture,
  candidateHint,
  keepCandidateHintTrack,
  type Mark,
  refreshCandidateHintStep,
  valuesOf,
} from "../../engine/hint/candidate-hint.ts";
import { candidateJudge } from "../../engine/hint/candidate-judge.ts";
import {
  type CandidateRung,
  type Firing,
  LATIN_RUNGS,
  type PlanRung,
  runLatinCandidatePlan,
  strikesOf,
  techniqueRung,
} from "../../engine/hint/candidate-plan.ts";
import {
  clearEntries,
  entryMistakes,
  gridCell,
  revealEntry,
  setMoves,
} from "../../engine/hint/entry-mistakes.ts";
import {
  type LatinVocab,
  latinPremise,
  narrateLatinReason,
  type Premise,
} from "../../engine/hint/hint-text.ts";
import { rowColRegions } from "../../engine/hint/latin-hint.ts";
import {
  byCell,
  latinNotesLadder,
  latinStrikeRungs,
} from "../../engine/hint/latin-notes.ts";
import {
  autoPencilPref,
  candidateReadingPref,
  pencilKeepHighlightPref,
  stickyPencilPref,
} from "../../engine/hint/pencil-prefs.ts";
import { statedParts } from "../../engine/hint/stated.ts";
import { digitKeyCode, digitKeys } from "../../engine/input/key-labels.ts";
import {
  CURSOR_SELECT2,
  digitOf,
  isCursorMove,
  isEraseKey,
  moveCursor,
  stripModifiers,
} from "../../engine/input/pointer.ts";
import {
  noOpEntryResult,
  pressNoteTakingCell,
  releaseHighlightAfterEntry,
  toggleNoteTakingMode,
} from "../../engine/mechanics/note-taking-cell.ts";
import { registerGame } from "../../engine/midend/registry.ts";
import type {
  Firing as LadderFiring,
  Said,
} from "../../engine/solve/ladder-runtime.ts";
import { latinVerdict } from "../../engine/solve/latin.ts";
import * as keen from "../../generated/games/keen/keen.compiled.ts";
import { newKeenDesc } from "./generator.ts";
import {
  colors,
  computeSize,
  coord,
  fromCoord,
  type KeenDrawState,
  type KeenHint,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  cageCells,
  DIFF_AMBIGUOUS,
  DIFF_IMPOSSIBLE,
  type HintReason,
  keenLadder,
  solveKeen,
} from "./solver.ts";
import {
  type Cages,
  cagesOf,
  cloneState,
  DIFF_HARD,
  DIFF_UNREASONABLE,
  decodeParams,
  defaultParams,
  diffToLevel,
  encodeParams,
  type KeenMove,
  type KeenParams,
  type KeenState,
  type KeenUi,
  newState,
  newUi,
  paramConfig,
  rules,
  status,
  validateParams,
} from "./state.ts";

const { WORDS } = keen;

/** Keen's numbers print as numbers. */
const KEEN_VOCAB: LatinVocab = { noun: "number", cell: WORDS.cell, value: String };

/** A player marking that contradicts the unique solution:
 * - `"cell"` — a filled-in digit that is wrong;
 * - `"note"` — an empty cell whose non-empty pencil notes have crossed out the
 *   cell's solution digit. */
export interface KeenMistake {
  kind: "cell" | "note";
  x: number;
  y: number;
}

// 6x6 is the one size at every tier. The others have a line each, which
// keeps the list short, and the last is the one multiplication-only board.
const menu: PresetBoards<KeenParams> = {
  boards: [4, 5, 6, 9].map((w) => ({ w, diff: "easy", multiplicationOnly: false })),
  tiers: ({ w }) => {
    if (w === 6) return null;
    const level = diffToLevel(w === 9 ? "normal" : "easy");
    return [level, level];
  },
  variants: [{ w: 6, diff: "normal", multiplicationOnly: true }],
};

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

  return null;
}

/** Fill all pencil marks, then (on a fully-noted board) clean the obvious
 * row/column candidates. Keen cages are arithmetic, NOT uniqueness regions, so
 * a legal cage duplicate is never struck. */
function markAll(state: KeenState): KeenMove | null {
  const w = state.params.w;
  return adaptiveMarkAllMove<KeenMove>(state.grid, state.pencil, w, (x, y) =>
    rowColRegions(x, y, w),
  );
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
      if (digit === null) throw new Error(`keen: aux has ${aux[i + 1]} at ${i + 1}`);
      grid[i] = digit;
    }
    return { ok: true, move: { type: "solve", grid } };
  }
  const soln = new Uint8Array(w * w);
  const ret = solveKeen(w, orig.clues, soln, DIFF_UNREASONABLE);
  if (ret === DIFF_IMPOSSIBLE) return { ok: false, error: NO_SOLUTION };
  if (ret === DIFF_AMBIGUOUS) return { ok: false, error: MULTIPLE_SOLUTIONS };
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

/** Why a strike is forced (docs/hints.md § "Writing the narration"):
 * indication, then reasoning, which the walk concludes. `ns` is the struck value
 * list. Cage deductions name the cage by its clue; the generic Latin arms read
 * identically to Unequal's, narrated once, shared. The words are
 * [`hint-text.ts`](./hint-text.ts)'s. */
function premise(reason: HintReason, marks: readonly Mark[]): Premise {
  switch (reason.kind) {
    case "cage":
    case "cageLine": {
      const { look } = statedParts(reason.clause, {
        kind: CELL,
        // The only element a clause rings is the struck cell, the note the
        // walk strikes, which its highlight names.
        at: (): Point => marks[0],
        ring: [],
        marks: { stripes: reason.cells },
        terms: reason.terms,
        value: KEEN_VOCAB.value,
        noun: WORDS.cell,
        struck: valuesOf(marks),
      });
      if (look === undefined) throw new Error(`${reason.kind} states no look`);
      return { premise: look };
    }
    default:
      return latinPremise(reason, marks, KEEN_VOCAB);
  }
}

/** Why a placement is forced: always a generic single, since no cage deduction
 * places. */
function narrate(reason: HintReason, m: Mark, w: number): Sentence {
  if (reason.kind === "cage" || reason.kind === "cageLine")
    throw new Error(`a ${reason.kind} deduction strikes`);
  return narrateLatinReason(reason, m, w, KEEN_VOCAB);
}

/** What a cage deduction reads beyond the marks its words name: what the cage
 * can still hold is what its cells can, so they are all read. */
function reasonReads(reason: HintReason): { reads?: Point[] } {
  return reason.kind === "cage" || reason.kind === "cageLine"
    ? { reads: reason.cells }
    : {};
}

/** A cage firing as legs, a cell each: a cage's narration is about "this
 * cell", with the whole cage hatched on every leg. A line firing says its
 * line, and the rows are numbered before the columns. */
function cageLegs(
  id: "cageEasy" | "cage" | "cageLine",
  f: LadderFiring,
  w: number,
  cages: Cages,
): Firing<KeenMove, KeenHint, HintReason> {
  const strikes = strikesOf(f, w);
  if (id === "cageLine") {
    const { says } = f.reasons[0] as Said<unknown, keen.CageLineSays>;
    const reason: HintReason = {
      kind: "cageLine",
      cells: cageCells(cages, says.terms.r, w),
      clause: keen.STATED.cageLine.step[says.wording],
      terms: says.terms,
    };
    return byCell(strikes).map((strike) => ({ strike, reason }));
  }
  // The cage's two techniques say the same, each in its own module's words.
  const { says } = f.reasons[0] as Said<unknown, keen.CageSays | keen.CageEasySays>;
  const cells = cageCells(cages, says.terms.r, w);
  const facts = keen.STATED[id].fact;
  return byCell(strikes).map((strike) => {
    const fact = says.facts[strikes.indexOf(strike[0])];
    const reason: HintReason = {
      kind: "cage",
      cells,
      clause: facts[fact.wording],
      terms: { ...says.terms, ...fact.terms },
    };
    return { strike, reason };
  });
}

/** Every rung a Keen step can be: the Latin family's, and the two cage kinds
 * of `KeenReason`. */
export const KEEN_RUNGS = [...LATIN_RUNGS, "cage", "cageLine"] as const;
export type KeenRung = (typeof KEEN_RUNGS)[number];

/** Build the hint plan by walking a working copy of the board the way a person
 * solves it (`runLatinCandidatePlan`), under the player's two pencil
 * preferences. */
function buildSteps(
  state: KeenState,
  { autoClean, reading, judging }: CandidatePlanPrefs,
): HintStep<KeenMove, KeenHint, KeenRung>[] {
  const w = state.params.w;
  const steps: HintStep<KeenMove, KeenHint, PlanRung<HintReason>>[] = [];
  const wGrid = Int8Array.from(state.grid);
  const cages = cagesOf(w, state.clues);
  const on = latinNotesLadder(
    keenLadder(cages),
    w,
    wGrid,
    Math.min(diffToLevel(state.params.diff), DIFF_HARD),
  );
  type Rung = CandidateRung<KeenMove, KeenHint, HintReason>;
  const cageRung = (id: "cageEasy" | "cage" | "cageLine"): Rung =>
    techniqueRung(on, id, (f) => cageLegs(id, f, w, cages));
  runLatinCandidatePlan<KeenMove, KeenHint, HintReason>({
    w,
    steps,
    grid: wGrid,
    pencil: Int32Array.from(state.pencil),
    autoClean,
    reading,
    judging,
    label: "keen hint plan",
    placeWords: (m, reason) => ({ words: narrate(reason, m, w) }),
    strikeWords: (marks, reason) => ({
      ...premise(reason, marks),
      ...reasonReads(reason),
    }),
    rungs: [
      cageRung("cageEasy"),
      cageRung("cage"),
      cageRung("cageLine"),
      ...latinStrikeRungs<KeenMove, KeenHint, HintReason>(on, w, byCell),
    ],
    notes: { noun: "number", placedVerb: "standing", cell: WORDS.cell },
  });
  return steps;
}

/** Keen's difficulty contract (`engine/contract/difficulty.ts`). `solveKeen` follows the
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
  KeenHint,
  KeenRung
> = {
  id: "keen",
  markAll,

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig,

  newDesc: newKeenDesc,
  newState,
  newUi,
  changedState,

  interpretMove,
  executeMove,
  status,
  notApplicable: { transposeParams: SQUARE_GRID },

  solve,
  rules,
  difficulty,
  hint: {
    plan: (state, _aux, ui) => candidateHint(state, ui ?? newUi(state), buildSteps),
    judgeMove: (before, after, ui) =>
      candidateJudge(before, after, ui ?? newUi(before), buildSteps, keen.NAMES),
    rungs: KEEN_RUNGS,
    marks: {
      roles: {
        ring: "the cell the step fills in with a number.",
        strike: "the pencil marks the step crosses out.",
        outline:
          "what the step reasons from: “this cell”, whose pencil marks it crosses out, cells that between them already account for the numbers being crossed out, the number just placed, or “the middle cell” a step weighs and the cells it reads.",
        stripes:
          'the cage, row or column the sentence names: "this cage", "this row" or "this column". Or the several rows or columns it names together, such as "these 2 columns", where one number fits only the outlined cells.',
      },
    },
    // The shared candidate-elimination keep-track and stale-step check;
    // `KeenHint` is structurally `CandidateHighlights`.
    keepTrack: (m, step, state) =>
      keepCandidateHintTrack(m, step, state.pencil, state.params.w),
    gesture: (s, ui, ds, m) => {
      const ts = ds.tileSize;
      const mid = (v: number) => coord(v, ts) + ((ts / 2) | 0);
      return candidateGesture(
        m,
        ui,
        (x, y) => ({ x: mid(x), y: mid(y) }),
        digitKeyCode,
        undefined,
        markAll(s),
      );
    },
    refreshStep: (step, state) =>
      refreshCandidateHintStep(step, state.grid, state.pencil, state.params.w),
  },
  findMistakes,
  clearMistakes: (_state, mistakes) => clearEntries(setMoves, mistakes),
  revealOne: (state, solved) =>
    revealEntry(setMoves, state.grid, solved.grid, state.params.w),
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
};

registerGame(keenGame);
