/**
 * Solo (Sudoku) — native TS port of `solo.c`. Fill a `cr × cr` grid (`cr = c·r`)
 * with digits `1..cr` so every row, column and sub-block holds each digit once;
 * variants add irregular (jigsaw) blocks, two main diagonals (X), and digit-sum
 * cages (killer). Left-click / cursor-select highlights a cell for a real entry;
 * right-click / select2 highlights it for a pencil mark (or toggles sticky
 * pencil mode); a digit enters (or pencil-toggles) that value; backspace/space
 * clears. Duplicate digits and over-full cages highlight live; Check & Save
 * additionally flags cells that contradict the unique solution.
 */

import { assertNever } from "../../engine/assert-never.ts";
import {
  adaptiveMarkAllMove,
  type CandidatePlanPrefs,
  candidateHint,
  keepCandidateHintTrack,
  refreshCandidateHintStep,
} from "../../engine/candidate-hint.ts";
import { runCandidatePlan, valuesOf } from "../../engine/candidate-plan.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
import { winFlash } from "../../engine/flash.ts";
import {
  type Game,
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  type PresetMenu,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { digitKeys } from "../../engine/key-labels.ts";
import { forcingChainArea, type SingleWhy } from "../../engine/latin-hint.ts";
import {
  noOpEntryResult,
  pressNoteTakingCell,
  releaseHighlightAfterEntry,
  toggleNoteTakingMode,
} from "../../engine/note-taking-cell.ts";
import type { OrderedCell } from "../../engine/overlay-sidecar.ts";
import { parseConfigInt } from "../../engine/params.ts";
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
import type { ConfigValues, KeyLabel, Point, Size } from "../../engine/types.ts";
import { newSoloDesc } from "./generator.ts";
import { regionName, say } from "./hint-text.ts";
import {
  colors,
  computeSize,
  FLASH_TIME,
  fromCoord,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SoloDrawState,
  type SoloHint,
} from "./render.ts";
import {
  type HintOp,
  recordSoloDeductions,
  type SoloReason,
  type SoloRegion,
  solveSolo,
} from "./solver.ts";
import {
  checkValid,
  cloneState,
  DIFF_AMBIGUOUS,
  DIFF_BLOCK,
  DIFF_EXTREME,
  DIFF_IMPOSSIBLE,
  DIFF_INTERSECT,
  DIFF_KINTERSECT,
  DIFF_KMINMAX,
  DIFF_NAMES,
  DIFF_RECURSIVE,
  DIFF_SET,
  DIFF_SIMPLE,
  decodeParams,
  defaultParams,
  diag0,
  diag1,
  encodeParams,
  newState,
  newUi,
  onDiag0,
  onDiag1,
  type SoloMistake,
  type SoloMove,
  type SoloParams,
  type SoloState,
  type SoloUi,
  SYMM_NONE,
  SYMM_ROT2,
  status as soloStatus,
  validateDesc,
  validateParams,
} from "./state.ts";

/** Upstream's `game_presets`, with its non-`SLOW_SYSTEM` entries always shown. */
function presets(): PresetMenu<SoloParams> {
  // The title is derived from the params, so the menu names a tier exactly as
  // the Custom dialog does. The shape is upstream's: size (or jigsaw), then the
  // tier, then the X marker; a Killer preset is named for its mode, which is
  // what distinguishes it from the plain preset at the same tier.
  const P = (
    c: number,
    r: number,
    symm: number,
    diff: number,
    kdiff: number,
    xtype: boolean,
    killer: boolean,
  ): PresetMenu<SoloParams> => {
    const size = r === 1 ? `${c} Jigsaw` : `${c}x${r}`;
    const title = killer
      ? `${size} Killer`
      : `${size} ${DIFF_NAMES[diff]}${xtype ? " X" : ""}`;
    return { title, params: { c, r, symm, diff, kdiff, xtype, killer } };
  };
  const K = DIFF_KMINMAX;
  const submenu = [
    P(2, 2, SYMM_ROT2, DIFF_BLOCK, K, false, false),
    P(2, 3, SYMM_ROT2, DIFF_SIMPLE, K, false, false),
    // Upstream offers the 6×6 board at one tier. Size and difficulty are
    // independent axes and a player who prefers the small grid should be able
    // to pick both; these two generate and grade honestly at this size, which
    // was measured rather than assumed. A 6×6 has fewer places to hide a `set`
    // deduction than a 9×9, so Hard costs the generator roughly fifty times
    // what 3x3 Hard does — a retry count, not a defect.
    P(2, 3, SYMM_ROT2, DIFF_INTERSECT, K, false, false),
    P(2, 3, SYMM_ROT2, DIFF_SET, K, false, false),
    P(3, 3, SYMM_ROT2, DIFF_BLOCK, K, false, false),
    P(3, 3, SYMM_ROT2, DIFF_SIMPLE, K, false, false),
    P(3, 3, SYMM_ROT2, DIFF_SIMPLE, K, true, false),
    P(3, 3, SYMM_ROT2, DIFF_INTERSECT, K, false, false),
    P(3, 3, SYMM_ROT2, DIFF_SET, K, false, false),
    P(3, 3, SYMM_ROT2, DIFF_SET, K, true, false),
    P(3, 3, SYMM_ROT2, DIFF_EXTREME, K, false, false),
    P(3, 3, SYMM_ROT2, DIFF_RECURSIVE, K, false, false),
    P(3, 3, SYMM_NONE, DIFF_BLOCK, DIFF_KINTERSECT, false, true),
    P(9, 1, SYMM_ROT2, DIFF_SIMPLE, K, false, false),
    P(9, 1, SYMM_ROT2, DIFF_SIMPLE, K, true, false),
    P(9, 1, SYMM_ROT2, DIFF_SET, K, false, false),
    P(3, 4, SYMM_ROT2, DIFF_SIMPLE, K, false, false),
    P(4, 4, SYMM_ROT2, DIFF_SIMPLE, K, false, false),
  ];
  return { title: "Solo", submenu };
}

function inGrid(cr: number, x: number, y: number): boolean {
  return x >= 0 && x < cr && y >= 0 && y < cr;
}

function interpretMove(
  state: SoloState,
  ui: SoloUi,
  ds: SoloDrawState,
  p: Point,
  rawButton: number,
): SoloMove | null | UiUpdate {
  const cr = state.cr;
  const ts = ds.tileSize;
  const button = stripModifiers(rawButton);

  const tx = fromCoord(p.x, ts);
  const ty = fromCoord(p.y, ts);

  if (
    inGrid(cr, tx, ty) &&
    pressNoteTakingCell(ui, button, tx, ty, {
      canEnter: !state.immutable[ty * cr + tx],
      canMark: state.grid[ty * cr + tx] === 0,
    })
  ) {
    return UI_UPDATE;
  }

  if (isCursorMove(button)) {
    ui.cursorFromKeyboard = true;
    return moveCursor(ui.cursor, button, cr, cr) ? UI_UPDATE : null;
  }

  const toggled = toggleNoteTakingMode(ui, button);
  if (toggled) return toggled;

  // A digit key (1..9 then a..z / A..Z for orders > 9), or a clear.
  let n = -1;
  const digit = digitOf(button);
  if (digit !== null && digit <= cr) n = digit;
  else if (button >= 97 && button <= 122 && button - 97 + 10 <= cr)
    n = button - 97 + 10;
  else if (button >= 65 && button <= 90 && button - 65 + 10 <= cr) n = button - 65 + 10;
  else if (button === CURSOR_SELECT2 || isEraseKey(button)) n = 0;

  if (ui.cursor.visible && n >= 0) {
    const i = ui.cursor.y * cr + ui.cursor.x;

    // Can't overwrite a given (reachable only via the cursor).
    if (state.immutable[i]) return null;
    // Can't pencil-mark a filled square (reachable only via the cursor).
    if (ui.pencilMode && state.grid[i]) return null;

    // No-op: re-entering the value the cell already holds (or clearing an empty
    // cell) with no pencil marks to wipe.
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
  // obvious candidates already placed in one of the cell's `regionsOf` regions
  // — the basic-region opening, in one press.
  if (button === 77 || button === 109)
    return adaptiveMarkAllMove<SoloMove>(state.grid, state.pencil, cr, (x, y) =>
      regionsOf(state, x, y),
    );

  return null;
}

/** Strike digit `n` from the pencil marks of every cell sharing one of
 * {@link regionsOf}'s regions with `(x, y)` — auto-pencil cleanup on a real
 * placement. */
function autoEliminate(state: SoloState, x: number, y: number, n: number): void {
  const cell = y * state.cr + x;
  for (const { cells } of regionsOf(state, x, y))
    for (const c of cells) if (c !== cell) state.pencil[c] &= ~(1 << n);
}

function executeMove(state: SoloState, move: SoloMove): SoloState {
  const cr = state.cr;
  const next = cloneState(state);

  switch (move.type) {
    case "set": {
      const i = move.y * cr + move.x;
      if (move.pencil && move.n > 0) {
        next.pencil[i] ^= 1 << move.n;
      } else {
        next.grid[i] = move.n;
        next.pencil[i] = 0;
        if (move.autoElim && move.n > 0) autoEliminate(next, move.x, move.y, move.n);
        if (!next.completed && isComplete(next)) next.completed = true;
      }
      return next;
    }
    case "pencilAll": {
      // Bits 1..cr set (digit n ⇒ bit 1<<n).
      const all = ((1 << (cr + 1)) - (1 << 1)) | 0;
      // Additive — fill only note-less empty cells, never reset a narrowed one:
      // `candidate-hint.ts`'s `adaptiveMarkAll` § "The additive rule, stated once".
      for (let i = 0; i < cr * cr; i++) {
        if (!next.grid[i] && next.pencil[i] === 0) next.pencil[i] = all;
      }
      return next;
    }
    case "pencilStrike": {
      for (const { x, y, n } of move.marks) next.pencil[y * cr + x] &= ~(1 << n);
      return next;
    }
    case "pencilAdd": {
      for (const { x, y, n } of move.marks) next.pencil[y * cr + x] |= 1 << n;
      return next;
    }
    case "solve": {
      for (let i = 0; i < cr * cr; i++) {
        next.grid[i] = move.grid[i];
        next.pencil[i] = 0;
      }
      next.completed = true;
      next.cheated = true;
      return next;
    }
    default:
      return assertNever(move, "solo: executeMove");
  }
}

/** `check_valid` over the working grid (every region complete, cages sum). */
function isComplete(state: SoloState): boolean {
  return checkValid(state.cr, state.blocks, state.killerData, state.xtype, state.grid);
}

function solve(orig: SoloState, _curr: SoloState, aux?: string): SolveResult<SoloMove> {
  const cr = orig.cr;
  if (aux) {
    // aux is `encodeSolveMove`'s "S<n>,<n>,…", comma-separated because a cell
    // reaches 16 at 4x4; it is not upstream's one-character-per-cell form. A
    // malformed aux falls through to re-deriving the answer from the givens.
    const grid = aux.slice(1).split(",").map(Number);
    if (
      grid.length === cr * cr &&
      grid.every((v) => Number.isInteger(v) && v >= 1 && v <= cr)
    )
      return { ok: true, move: { type: "solve", grid } };
  }
  const { diff, grid } = solveSolo(givensOnly(orig), DIFF_RECURSIVE, DIFF_KINTERSECT);
  if (diff === DIFF_IMPOSSIBLE)
    return { ok: false, error: "No solution exists for this puzzle" };
  if (diff === DIFF_AMBIGUOUS)
    return { ok: false, error: "Multiple solutions exist for this puzzle" };
  return { ok: true, move: { type: "solve", grid: Array.from(grid) } };
}

/** A copy of `state` with every non-given cell cleared (so the solver works
 * from the puzzle's fixed clues, never the player's entries/notes). */
function givensOnly(state: SoloState): SoloState {
  const s = cloneState(state);
  for (let i = 0; i < s.cr * s.cr; i++) {
    if (!s.immutable[i]) s.grid[i] = 0;
    s.pencil[i] = 0;
  }
  return s;
}

function findMistakes(state: SoloState): readonly SoloMistake[] {
  const cr = state.cr;
  // The solution is derived from the givens (+ cage clues) only — never from the
  // player's notes (a note can be wrong; that is what we are checking).
  const { diff, grid: soln } = solveSolo(
    givensOnly(state),
    DIFF_RECURSIVE,
    DIFF_KINTERSECT,
  );
  if (diff === DIFF_IMPOSSIBLE || diff === DIFF_AMBIGUOUS) return [];
  const out: SoloMistake[] = [];
  for (let i = 0; i < cr * cr; i++) {
    if (state.immutable[i]) continue;
    if (state.grid[i]) {
      if (state.grid[i] !== soln[i])
        out.push({ kind: "cell", x: i % cr, y: (i / cr) | 0 });
    } else if (state.pencil[i] !== 0 && !(state.pencil[i] & (1 << soln[i]))) {
      out.push({ kind: "note", x: i % cr, y: (i / cr) | 0 });
    }
  }
  return out;
}

// --- hint ------------------------------------------------------------------

/** The cells of `region`, as indices in order along it. */
function cellsOf(region: SoloRegion, state: SoloState): number[] {
  const cr = state.cr;
  const line = (cell: (k: number) => number): number[] =>
    Array.from({ length: cr }, (_, k) => cell(k));
  switch (region.kind) {
    case "row":
      return line((k) => region.index * cr + k);
    case "col":
      return line((k) => k * cr + region.index);
    case "block":
      return state.blocks.blocks[region.index];
    case "diag0":
      return line((k) => diag0(k, cr));
    case "diag1":
      return line((k) => diag1(k, cr));
  }
}

/** A region's cells as points — for evidence shading. */
function regionCells(region: SoloRegion, state: SoloState): Point[] {
  const cr = state.cr;
  return cellsOf(region, state).map((c) => ({ x: c % cr, y: (c / cr) | 0 }));
}

/** A region a digit may not repeat in. The ones holding every digit are tagged
 * for naming a hidden single; a killer cage is not one, so it has no tag — and
 * `SoloRegion` must not grow an arm for it, because the narration and evidence
 * switches over `SoloRegion` are exhaustive and may never see a cage. The
 * **reader's** word for the region therefore rides here instead, on every arm:
 * a region added to {@link regionsOf} cannot compile without saying what a
 * sentence citing it calls it. */
type SoloCellRegion =
  | { cells: number[]; holdsEvery: true; region: SoloRegion; name: string }
  | { cells: number[]; holdsEvery: false; name: string };

/** The regions of cell `(x, y)`, in narration-preference order: row, column,
 * sub-block, the X diagonals it lies on, then its killer cage. A cage forbids
 * repeats without having to hold every digit. Auto-pencil, Mark-all and the
 * hint all read this one list, so none of them leaves a cage-mate's note
 * standing that the solver has struck. */
export function regionsOf(state: SoloState, x: number, y: number): SoloCellRegion[] {
  const cr = state.cr;
  const cell = y * cr + x;
  const whole: SoloRegion[] = [
    { kind: "row", index: y },
    { kind: "col", index: x },
    { kind: "block", index: state.blocks.whichblock[cell] },
  ];
  if (state.xtype && onDiag0(cell, cr)) whole.push({ kind: "diag0" });
  if (state.xtype && onDiag1(cell, cr)) whole.push({ kind: "diag1" });
  const regions: SoloCellRegion[] = whole.map((region) => ({
    cells: cellsOf(region, state),
    holdsEvery: true,
    region,
    name: regionName(region),
  }));
  const killer = state.killerData;
  if (killer) {
    const cage = killer.kblocks.whichblock[cell];
    regions.push({
      cells: killer.kblocks.blocks[cage],
      holdsEvery: false,
      name: "cage",
    });
  }
  return regions;
}

/** The names of the regions {@link regionsOf} returns for `(x, y)`, or of every
 * region on the board when `at` is omitted — what a sentence about a repeat
 * cites. Read off the regions themselves, so a region added to `regionsOf` is
 * named by the sentences the moment it exists.
 *
 * Names rather than regions are what dedup here: a cell on both X diagonals
 * declares two regions and the sentence says "diagonal" once. And the
 * `at`-less call is the union over the board rather than one cell's answer,
 * because `say.cleanObvious` speaks for every cell at once — a cell off the
 * diagonals must still be told its notes were cleaned against them. */
export function noRepeatRegionNames(state: SoloState, at?: Point): string[] {
  const cr = state.cr;
  const names = new Set<string>();
  const add = (x: number, y: number): void => {
    for (const region of regionsOf(state, x, y)) names.add(region.name);
  };
  if (at) add(at.x, at.y);
  else for (let y = 0; y < cr; y++) for (let x = 0; x < cr; x++) add(x, y);
  return [...names];
}

/** The reason a single of `n` narrates as, once `availablePlacements` has
 * re-derived *why* it is forced from the working board (the recorded `place`
 * carries a bare `single`, conflating naked and hidden singles): a naked single
 * (the cell's notes collapsed to one), a note-less cell whose regions hold every
 * other digit, or a hidden single in a row/column/sub-block/diagonal. */
function soloSingleReason(
  n: number,
  why: SingleWhy<{ region: SoloRegion }>,
): SoloReason {
  switch (why.kind) {
    case "naked":
      return { kind: "single" };
    case "regionsFull":
      return { kind: "regionsFull" };
    case "hidden":
      return { kind: "hiddenSingle", n, region: why.region.region };
  }
}

/** Narrate *why* a firing is forced (docs/games/hints.md § "Writing the narration"): indication → reasoning →
 * necessity-voice conclusion. `ns` is the struck value list (a placement passes
 * its single digit); `at` is the cell the step acts on (a strike's first). */
function narrate(
  reason: SoloReason,
  ns: number[],
  state: SoloState,
  at: Point,
): string {
  switch (reason.kind) {
    case "single":
      return say.single(ns[0]);
    case "regionsFull":
      return say.regionsFull(ns[0], noRepeatRegionNames(state, at));
    case "hiddenSingle":
      return say.hiddenSingle(reason.region, reason.n);
    case "dup":
      return say.dup(
        reason.n,
        noRepeatRegionNames(state, { x: reason.px, y: reason.py }),
      );
    case "intersect":
      return say.intersect(reason.confined, reason.target, reason.n);
    case "set":
      return say.set(reason.region ?? null, ns);
    case "forcing":
      return say.forcing(reason, ns[0], reason.shares, reason.lastShares);
    case "cageSingle":
      return say.cageSingle(ns[0]);
    case "cageIntersect":
      return say.cageIntersect(reason.region, (state.cr * (state.cr + 1)) / 2, ns[0]);
    case "cageMinMax":
      return say.cageMinMax(reason.clue, ns);
    case "cageSums":
      return say.cageSums(reason.clue, ns);
  }
}

/** What a step marks: the cells it outlines `COL_HINT_CELL`, and the line it
 * hatches when its sentence names a row, column or diagonal as "this row"
 * (docs/games/hints.md § "Hatch the line the sentence names"). */
interface SoloMarks {
  area: OrderedCell[];
  hatch?: Point[];
  /** The cells whose candidates the step rests on beyond `area`. */
  reads?: Point[];
}

/** A region the sentence names as its subject ("in this row", "this block"),
 * hatched whatever its shape. */
function namedRegion(region: SoloRegion, state: SoloState): SoloMarks {
  return { area: [], hatch: regionCells(region, state) };
}

/** The deduction's marks for a strike. */
function reasonMarks(reason: SoloReason, state: SoloState): SoloMarks {
  switch (reason.kind) {
    case "intersect":
      return namedRegion(reason.confined, state);
    // The set's own cells are what the sentence points at, inside the region
    // it names when it names one — see `say.set`.
    case "set":
      return reason.region
        ? { area: reason.cells, hatch: regionCells(reason.region, state) }
        : { area: reason.cells };
    case "cageIntersect":
      return namedRegion(reason.region, state);
    // "This killer cage": the cage is the hatch. What its sum leaves a cell
    // depends on what its other cells can still be, so those are read too.
    case "cageMinMax":
    case "cageSums":
      return { area: [], hatch: reason.cells, reads: reason.cells };
    case "cageSingle":
      return { area: [], hatch: reason.cells };
    // A forcing chain names the cells it ran through, **numbered**, so the
    // narration can cite them and the player can walk it.
    case "forcing":
      return { area: forcingChainArea(reason) };
    // A placement's cull shades the value that forces it.
    case "dup":
      return { area: [{ x: reason.px, y: reason.py }] };
    default:
      return { area: [] };
  }
}

/** A placement's marks: a hidden single hatches the region it reasons over, as
 * does a deduced extra-cage (the region whose total the sentence counts down)
 * and a killer placement its cage; a naked single needs none. */
function placementMarks(reason: SoloReason, state: SoloState): SoloMarks {
  if (reason.kind === "hiddenSingle" || reason.kind === "cageIntersect")
    return namedRegion(reason.region, state);
  if (reason.kind === "cageSingle") return { area: [], hatch: reason.cells };
  return { area: [] };
}

/** Build the hint plan by walking a working copy of the board the way a person
 * solves it (`runCandidatePlan`). */
function buildSteps(
  state: SoloState,
  { autoClean, reading }: CandidatePlanPrefs,
): HintStep<SoloMove, SoloHint>[] {
  const cr = state.cr;
  const steps: HintStep<SoloMove, SoloHint>[] = [];
  const wGrid = Int8Array.from(state.grid);
  const maxdiff = Math.min(state.params.diff, DIFF_EXTREME);
  const maxkdiff = state.params.kdiff;
  runCandidatePlan<SoloMove, SoloHint, HintOp, SoloReason, SoloCellRegion>({
    w: cr,
    steps,
    grid: wGrid,
    pencil: Int32Array.from(state.pencil),
    autoClean,
    reading,
    label: "solo hint plan",
    record: () => recordSoloDeductions({ ...state, grid: wGrid }, maxdiff, maxkdiff),
    regionsOf: (x, y) => regionsOf(state, x, y),
    singleReason: soloSingleReason,
    placeWords: (m, reason) => ({
      explanation: narrate(reason, [m.n], state, m),
      ...placementMarks(reason, state),
    }),
    strikeWords: (marks, reason) => ({
      explanation: narrate(
        reason,
        reason.kind === "intersect" ? [reason.n] : valuesOf(marks),
        state,
        marks[0],
      ),
      ...reasonMarks(reason, state),
    }),
    // A digit confined to one region crosses that digit from several cells in
    // one sentence; every other firing's narration is about "this cell", so a
    // multi-digit strike never shows a value crossed in the wrong place.
    strikeAxis: (op) => (op.reason.kind === "intersect" ? null : op.y * cr + op.x),
    notes: {
      populate: say.populate,
      cleanObvious: say.cleanObvious(noRepeatRegionNames(state)),
      note: (cell, values, every) =>
        say.note(values, every, noRepeatRegionNames(state, cell)),
    },
  });
  return steps;
}

function hint(
  state: SoloState,
  _aux?: string,
  ui?: SoloUi,
): HintResult<SoloMove, SoloHint> {
  return candidateHint(state, ui ?? newUi(state), findMistakes, buildSteps);
}

/** Classify a player move against the displayed hint step (shared
 * candidate-elimination keep-track; `SoloHint` is structurally
 * `CandidateHighlights`). */
function hintKeepTrack(
  m: SoloMove,
  step: HintStep<SoloMove, SoloHint>,
  state: SoloState,
): HintTrackVerdict {
  return keepCandidateHintTrack(m, step, state.pencil, state.cr);
}

/** Re-validate a stored hint step against the current board before (re-)display
 * (shared "never show a stale step" guarantee). */
function refreshHintStep(
  step: HintStep<SoloMove, SoloHint>,
  state: SoloState,
): HintStep<SoloMove, SoloHint> | null {
  return refreshCandidateHintStep(step, state.grid, state.pencil, state.cr);
}

/** Solo's difficulty contract (`engine/difficulty.ts`). `solveSolo` reports the
 * difficulty reached or `DIFF_IMPOSSIBLE` / `DIFF_AMBIGUOUS`. Its `DIFF_*`
 * family has eight members and only six are tiers — `DIFF_AMBIGUOUS` and
 * `DIFF_IMPOSSIBLE` are verdicts — which is the clearest case in the collection
 * for declaring the tier list rather than counting constants. The killer cap is
 * left at its default: the tier being varied is the ordinary deduction ladder. */
const difficulty: DifficultyContract<SoloParams> = {
  tierOf: (p) => p.diff,
  withTier: (p, tier) => ({ ...p, diff: tier }),
  solveAtCap: (p, desc, cap) => {
    const { diff } = solveSolo(givensOnly(newState(p, desc)), cap, DIFF_KINTERSECT);
    if (diff === DIFF_IMPOSSIBLE) return "impossible";
    return diff === DIFF_AMBIGUOUS ? "unsolved" : "solved";
  },
};

export const soloGame: Game<
  SoloParams,
  SoloState,
  SoloMove,
  SoloUi,
  SoloDrawState,
  SoloMistake
> = {
  id: "solo",
  wantsStatusbar: false,
  isTimed: false,
  canSolve: true,
  canFormatAsText: false,
  canMarkAll: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  // Keys match the custom `solo` describeConfig in augmentation.ts. Upstream's
  // `custom_params` reads columns and rows, then folds jigsaw (`c *= r; r = 1`),
  // so the `jigsaw` item MUST come after the column/row items: the midend
  // applies `set`s in array order and jigsaw's setter reads the new `c`/`r`. A
  // jigsaw board is stored `r === 1, c === order`; unchecking jigsaw leaves c/r
  // as they are, as upstream does.
  paramConfig: [
    {
      kw: "columns-of-sub-blocks",
      name: "Columns of sub-blocks",
      type: "string",
      get: (p) => String(p.c),
      set: (p, v) => {
        p.c = parseConfigInt(v);
      },
    },
    {
      kw: "rows-of-sub-blocks",
      name: "Rows of sub-blocks",
      type: "string",
      get: (p) => String(p.r),
      set: (p, v) => {
        p.r = parseConfigInt(v);
      },
    },
    {
      kw: "x",
      name: '"X" (require every number in each main diagonal)',
      type: "boolean",
      get: (p) => p.xtype,
      set: (p, v) => {
        p.xtype = v;
      },
    },
    {
      kw: "jigsaw",
      name: "Jigsaw (irregularly shaped sub-blocks)",
      type: "boolean",
      get: (p) => p.r === 1,
      set: (p, v) => {
        if (v) {
          p.c *= p.r;
          p.r = 1;
        }
      },
    },
    {
      kw: "killer",
      name: "Killer (digit sums)",
      type: "boolean",
      get: (p) => p.killer,
      set: (p, v) => {
        p.killer = v;
      },
    },
    {
      kw: "symmetry",
      name: "Symmetry",
      type: "choices",
      choices: [
        "None",
        "2-way rotation",
        "4-way rotation",
        "2-way mirror",
        "2-way diagonal mirror",
        "4-way mirror",
        "4-way diagonal mirror",
        "8-way mirror",
      ],
      get: (p) => p.symm,
      set: (p, v) => {
        p.symm = v;
      },
    },
    {
      kw: "difficulty",
      name: "Difficulty",
      type: "choices",
      choices: [...DIFF_NAMES],
      get: (p) => p.diff,
      set: (p, v) => {
        p.diff = v;
      },
    },
  ],
  describeParams: (p): ConfigValues => ({
    "columns-of-sub-blocks": p.c,
    "rows-of-sub-blocks": p.r,
    jigsaw: p.r === 1,
    killer: p.killer,
    x: p.xtype,
    difficulty: p.diff,
    symmetry: p.symm,
  }),

  newDesc: newSoloDesc,
  validateDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  status: soloStatus,

  solve,
  difficulty,
  hint,
  hintKeepTrack,
  refreshHintStep,
  findMistakes,
  requestKeys: (p): KeyLabel[] => digitKeys(p.c * p.r),

  prefs: [
    // Named by the relation, not by a list: Solo's regions depend on the mode
    // (X adds the diagonals, Killer the cage), and a list here would be a
    // second statement of `regionsOf` that no board makes true at once.
    autoPencilPref<SoloUi>(
      "When you place a number, remove it from the pencil marks it rules out",
    ),
    stickyPencilPref<SoloUi>(),
    pencilKeepHighlightPref<SoloUi>(),
    candidateReadingPref<SoloUi>(),
  ],

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize: (p: SoloParams, ts: number): Size => computeSize(p.c * p.r, ts),
  newDrawState,
  redraw,

  animLength: () => 0,
  flashLength: (from, to) => winFlash(from, to, FLASH_TIME),
};

registerGame(soloGame);
