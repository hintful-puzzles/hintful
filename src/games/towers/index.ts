/**
 * Towers (Skyscrapers) — native TS port of `towers.c`. Fill a `w × w` grid so
 * every row and column holds each height `1..w` once, and so each outside clue
 * equals the number of towers visible from that edge (a taller tower hides
 * every shorter one behind it). Left-click / cursor select highlights a cell
 * for a real entry; right-click / select2 highlights it for a pencil mark; a
 * digit enters (or pencil-toggles) that height; a click or shift/ctrl-cursor
 * on an outside clue strikes it through. Rule violations highlight live; Check
 * & Save additionally flags cells that contradict the unique solution.
 */

import { assertNever } from "../../engine/assert-never.ts";
import {
  adaptiveMarkAllMove,
  availableStrikes,
  candidateHint,
  emitObviousCleanStep,
  keepCandidateHintTrack,
  lazyPopulate,
  type Mark,
  nakedSingles,
  populateThenClean,
  refreshCandidateHintStep,
  regionDuplicateMarks,
  runCandidatePlan,
} from "../../engine/candidate-hint.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
import { winFlash } from "../../engine/flash.ts";
import {
  type Game,
  type HintStep,
  type PresetMenu,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import type { FrontierCandidate } from "../../engine/hint-frontier.ts";
import { digitKeys, pencilModeKey } from "../../engine/key-labels.ts";
import { latinVerdict } from "../../engine/latin.ts";
import {
  availablePlacements,
  forcingChainArea,
  hiddenSingleLine,
  rowColRegions,
  singleReasonOf,
} from "../../engine/latin-hint.ts";
import {
  noOpEntryResult,
  pressNoteTakingCell,
  releaseHighlightAfterEntry,
  toggleNoteTakingMode,
} from "../../engine/note-taking-cell.ts";
import type { OrderedCell } from "../../engine/overlay-sidecar.ts";
import {
  autoPencilPref,
  pencilKeepHighlightPref,
  stickyPencilPref,
} from "../../engine/pencil-prefs.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT2,
  CURSOR_UP,
  digitOf,
  isCursorMove,
  isEraseKey,
  LEFT_BUTTON,
  MOD_CTRL,
  MOD_SHFT,
  moveCursor,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { Point } from "../../engine/types.ts";
import { newTowersDesc } from "./generator.ts";
import { say } from "./hint-text.ts";
import {
  colors,
  computeSize,
  coord,
  FLASH_TIME,
  fromCoord,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type TowersDrawState,
  type TowersHint,
  x3d,
  y3d,
} from "./render.ts";
import {
  DIFF_AMBIGUOUS,
  DIFF_IMPOSSIBLE,
  type HintOp,
  type HintReason,
  recordTowersDeductions,
  solveTowers,
} from "./solver.ts";
import {
  checkErrors,
  cloneState,
  clueIndex,
  cluePos,
  DIFF_EXTREME,
  DIFF_UNREASONABLE,
  decodeParams,
  defaultParams,
  diffFromLevel,
  diffName,
  diffToLevel,
  encodeParams,
  isClue,
  lineCells,
  newState,
  newUi,
  paramConfig,
  status,
  type TowersMove,
  type TowersParams,
  type TowersState,
  type TowersUi,
  textFormat,
  validateDesc,
  validateParams,
} from "./state.ts";

/** A player marking that contradicts the unique solution:
 * - `"cell"` — a filled-in tower whose height is wrong;
 * - `"note"` — an empty cell whose (non-empty) pencil notes have crossed out
 *   the cell's solution height (a note is a first-class marking — striking the
 *   correct candidate is a mistake exactly as a wrong tower is). */
export interface TowersMistake {
  kind: "cell" | "note";
  x: number;
  y: number;
}

const PRESETS: TowersParams[] = [
  { w: 4, diff: "easy" },
  { w: 5, diff: "easy" },
  { w: 5, diff: "hard" },
  { w: 6, diff: "easy" },
  { w: 6, diff: "hard" },
  { w: 6, diff: "extreme" },
  { w: 6, diff: "unreasonable" },
];

function presets(): PresetMenu<TowersParams> {
  return {
    title: "Towers",
    submenu: PRESETS.map((p) => ({
      title: `${p.w}x${p.w} ${diffName(p.diff)}`,
      params: p,
    })),
  };
}

function inGrid(w: number, x: number, y: number): boolean {
  return x >= 0 && x < w && y >= 0 && y < w;
}

function interpretMove(
  state: TowersState,
  ui: TowersUi,
  ds: TowersDrawState,
  p: Point,
  rawButton: number,
): TowersMove | null | UiUpdate {
  const w = state.w;
  const ts = ds.tileSize;
  const shiftOrCtrl = (rawButton & (MOD_SHFT | MOD_CTRL)) !== 0;
  const button = stripModifiers(rawButton);

  let tx = fromCoord(p.x, ts);
  let ty = fromCoord(p.y, ts);

  if (ui.threeD) {
    // A click may land on a tower protruding up-left from a neighboring cell;
    // check the tops of nearby towers and retarget if so.
    for (let dy = 0; dy <= 1; dy++) {
      for (let dx = 0; dx >= -1; dx--) {
        const cx = tx + dx;
        const cy = ty + dy;
        if (!inGrid(w, cx, cy)) continue;
        const height = state.grid[cy * w + cx];
        const bx = coord(cx, ts);
        const by = coord(cy, ts);
        const ox = bx + x3d(height, w, ts);
        const oy = by - y3d(height, w, ts);
        if (
          // on the top face?
          (p.x - ox >= 0 && p.x - ox < ts && p.y - oy >= 0 && p.y - oy < ts) ||
          // in the triangle between the top-left corners?
          (ox > bx &&
            p.x >= bx &&
            p.x <= ox &&
            p.y <= by &&
            (by - p.y) * (ox - bx) <= (by - oy) * (p.x - bx)) ||
          // in the triangle between the bottom-right corners?
          (ox > bx &&
            p.x >= bx + ts &&
            p.x <= ox + ts &&
            p.y >= oy + ts &&
            (by - p.y + ts) * (ox - bx) >= (by - oy) * (p.x - bx - ts))
        ) {
          tx = cx;
          ty = cy;
        }
      }
    }
  }

  if (inGrid(w, tx, ty)) {
    if (
      pressNoteTakingCell(ui, button, tx, ty, {
        canEnter: !state.immutable[ty * w + tx],
        canMark: state.grid[ty * w + tx] === 0,
      })
    ) {
      return UI_UPDATE;
    }
  } else if (button === LEFT_BUTTON) {
    if (isClue(state, tx, ty)) {
      return { type: "clueDone", index: clueIndex(tx, ty, w) };
    }
  }

  if (isCursorMove(button)) {
    if (shiftOrCtrl) {
      let cx = ui.cursor.x;
      let cy = ui.cursor.y;
      if (button === CURSOR_LEFT) cx = -1;
      else if (button === CURSOR_RIGHT) cx = w;
      else if (button === CURSOR_UP) cy = -1;
      else if (button === CURSOR_DOWN) cy = w;
      if (isClue(state, cx, cy))
        return { type: "clueDone", index: clueIndex(cx, cy, w) };
      return null;
    }
    ui.cursorFromKeyboard = true;
    return moveCursor(ui.cursor, button, w, w) ? UI_UPDATE : null;
  }

  const toggled = toggleNoteTakingMode(ui, button);
  if (toggled) return toggled;

  const isClear = button === CURSOR_SELECT2 || isEraseKey(button);
  const n = isClear ? 0 : digitOf(button);
  if (ui.cursor.visible && n !== null && n <= w) {
    const i = ui.cursor.y * w + ui.cursor.x;

    // Can't pencil-mark a filled square; can't touch an immutable one.
    if (ui.pencilMode && state.grid[i]) return null;
    if (state.immutable[i]) return null;

    // No-op: setting a square to what it already holds (and no pencil marks).
    if ((!ui.pencilMode || n === 0) && state.grid[i] === n && state.pencil[i] === 0)
      return noOpEntryResult(ui);

    const pencil = ui.pencilMode && n > 0;
    releaseHighlightAfterEntry(ui);
    // Auto-pencil applies only to a real placement, not a pencil toggle.
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
  // obvious row/column candidates — the basic-region opening, in one press.
  if (button === 77 || button === 109)
    return adaptiveMarkAllMove<TowersMove>(state.grid, state.pencil, w, (x, y) =>
      rowColRegions(x, y, w),
    );

  return null;
}

function executeMove(state: TowersState, move: TowersMove): TowersState {
  const w = state.w;
  const next = cloneState(state);

  switch (move.type) {
    case "set": {
      const i = move.y * w + move.x;
      if (state.immutable[i]) throw new Error("towers: move into an immutable cell");
      if (move.pencil && move.n > 0) {
        next.pencil[i] ^= 1 << move.n;
      } else {
        next.grid[i] = move.n;
        next.pencil[i] = 0;
        // Auto-pencil: striking the placed height from the rest of its row and
        // column keeps the player's notes tidy without manual cleanup.
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
    case "clueDone": {
      next.cluesDone[move.index] = next.cluesDone[move.index] ? 0 : 1;
      return next;
    }
    case "pencilAll": {
      const all = (1 << (w + 1)) - (1 << 1);
      // Additive — fill only note-less empty cells, never reset a narrowed one:
      // `candidate-hint.ts`'s `adaptiveMarkAll` § "The additive rule, stated once".
      for (let i = 0; i < w * w; i++) {
        if (!next.grid[i] && next.pencil[i] === 0) next.pencil[i] = all;
      }
      return next;
    }
    case "pencilStrike": {
      // Clear each named candidate bit; clearing an absent bit is a no-op, so
      // the move is idempotent (a re-applied hint never re-adds a candidate).
      for (const { x, y, n } of move.marks) next.pencil[y * w + x] &= ~(1 << n);
      return next;
    }
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
      return assertNever(move, "towers: executeMove");
  }
}

function changedState(
  ui: TowersUi,
  _old: TowersState | null,
  newSt: TowersState,
): void {
  const w = newSt.w;
  if (
    ui.cursor.visible &&
    ui.pencilMode &&
    !ui.cursorFromKeyboard &&
    newSt.grid[ui.cursor.y * w + ui.cursor.x] !== 0
  ) {
    ui.cursor.visible = false;
  }
}

function solve(
  orig: TowersState,
  _curr: TowersState,
  aux?: string,
): SolveResult<TowersMove> {
  const w = orig.w;
  if (aux) {
    const grid = Array.from({ length: w * w }, (_, i) => Number(aux[i + 1]));
    return { ok: true, move: { type: "solve", grid } };
  }
  const soln = Uint8Array.from(orig.immutable);
  const ret = solveTowers(w, orig.clues, soln, DIFF_UNREASONABLE);
  if (ret === DIFF_IMPOSSIBLE)
    return { ok: false, error: "No solution exists for this puzzle" };
  if (ret === DIFF_AMBIGUOUS)
    return { ok: false, error: "Multiple solutions exist for this puzzle" };
  return { ok: true, move: { type: "solve", grid: Array.from(soln) } };
}

function findMistakes(state: TowersState): readonly TowersMistake[] {
  const w = state.w;
  // The solution is derived from the placed givens/entries only — never from
  // the player's notes (a note can be wrong; that is what we are checking).
  const soln = Uint8Array.from(state.immutable);
  const ret = solveTowers(w, state.clues, soln, DIFF_UNREASONABLE);
  if (ret === DIFF_IMPOSSIBLE || ret === DIFF_AMBIGUOUS) return [];
  const out: TowersMistake[] = [];
  for (let i = 0; i < w * w; i++) {
    if (state.immutable[i]) continue; // givens are always correct
    if (state.grid[i]) {
      // A filled cell whose height contradicts the unique solution.
      if (state.grid[i] !== soln[i])
        out.push({ kind: "cell", x: i % w, y: (i / w) | 0 });
    } else if (state.pencil[i] !== 0 && !(state.pencil[i] & (1 << soln[i]))) {
      // An empty cell whose non-empty notes have crossed out the correct
      // height. (Notes carrying extra, non-solution candidates are fine — that
      // is ordinary mid-solve state.)
      out.push({ kind: "note", x: i % w, y: (i / w) | 0 });
    }
  }
  return out;
}

// --- hint ------------------------------------------------------------------

/** Narrate *why* a firing is forced, per the technique that fired — leading
 * with the spotted indication, then the reasoning, then a necessity-voice
 * conclusion (docs/games/hints.md § "Writing the narration"). `n` is the placed height for a placement;
 * `continues` (a journey continuation leg) gets a terser line that doesn't
 * restate the premise the journey's first leg already gave. The words are
 * [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(reason: HintReason, n: number, continues = false): string {
  switch (reason.kind) {
    case "fullLine":
      return say.fullLine(reason.clueVal, n, continues);
    case "tallestNearest":
      return say.tallestNearest(n);
    case "facing":
      return say.facing(n);
    case "lineFull":
      return say.lineFull(reason.clueVal, n);
    case "lowerBound":
      return say.lowerBound(reason.clueVal, n);
    case "arrangement":
      return say.arrangement(reason.clueVal, n);
    case "dup":
      return say.dup(reason.n);
    case "single":
      return say.single(n);
    case "hiddenSingle":
      return say.hiddenSingle(reason.line, n);
    case "set":
      return say.set(n);
    case "forcing":
      return say.forcing(reason, n, reason.shares);
  }
}

/** The deduction's evidence area to shade: a Towers clue technique shows the
 * driving clue cell(s) *and* the whole line of sight they reason along, so the
 * player can see exactly which clue the hint is about; the generic Latin
 * techniques have no clean local area (the struck notes carry the premise). */
function reasonArea(reason: HintReason, w: number): OrderedCell[] {
  switch (reason.kind) {
    case "facing":
      // A facing pair names two clues at opposite ends of the same line.
      return [
        cluePos(reason.clue, w),
        cluePos(reason.clue2, w),
        ...lineCells(reason.clue, w),
      ];
    case "fullLine":
    case "tallestNearest":
    case "lineFull":
    case "lowerBound":
    case "arrangement":
      return [cluePos(reason.clue, w), ...lineCells(reason.clue, w)];
    case "hiddenSingle":
      return hiddenSingleLine(reason.line, reason.index, w);
    // A forcing chain names the cells it ran through, **numbered**, so the
    // narration can cite them and the player can walk it.
    case "forcing":
      return forcingChainArea(reason);
    default:
      return [];
  }
}

/** The clue-deduction strikes a plan could take now (`availableStrikes`: live
 * in the working notes, and resting on nothing an earlier firing has yet to
 * strike). `dup` strikes are excluded — those are placement bookkeeping,
 * handled at placement time, not a deduction to teach.
 *
 * Each returned strike groups only the marks of its firing that share the
 * **same struck height** — because the narration names that height ("a tower of
 * height 5 can't go here"). A firing that rules out *several* heights (a clue's
 * lower-bound rule can strike both 4 and 5 along its line) would otherwise be
 * shown as one step crossing out 4 *and* 5 while the text mentions only one,
 * which reads as a bug. The remaining heights of the same firing come back on
 * the next call and are emitted as continuation legs of one journey (the caller
 * links them by `group`). */
function clueStrikes(
  ops: HintOp[],
  wGrid: Uint8Array,
  wPen: Int32Array,
  w: number,
): { marks: Mark[]; reason: HintReason; group: number }[] {
  const reads = (live: readonly HintOp[]): Point[] => [
    ...reasonArea(live[0].reason, w),
    ...live.map((op) => ({ x: op.x, y: op.y })),
  ];
  return availableStrikes(ops, wGrid, wPen, w, reads).map((live) => {
    const height = live[0].n;
    const same = live.filter((op) => op.n === height);
    return {
      marks: same.map((op) => ({ x: op.x, y: op.y, n: op.n })),
      reason: same[0].reason,
      group: same[0].group,
    };
  });
}

/** Emit a placement step and apply it to the working board, striking the placed
 * height from the rest of its row and column. With auto-pencil on (`autoClean`)
 * that cleanup is silent (the placement's own `autoElim` does it on the real
 * board); with it off the cleanup becomes an explicit `pencilStrike` journey
 * continuation, so the player is taught the eliminations they must make by hand. */
function emitPlacement(
  steps: HintStep<TowersMove, TowersHint>[],
  wGrid: Uint8Array,
  wPen: Int32Array,
  w: number,
  x: number,
  y: number,
  n: number,
  reason: HintReason,
  autoClean: boolean,
  continues = false,
): void {
  steps.push({
    move: { type: "set", x, y, n, pencil: false, autoElim: autoClean },
    explanation: narrate(reason, n, continues),
    highlights: { area: reasonArea(reason, w), targets: [{ x, y }], marks: [] },
    continuesPrevious: continues,
  });
  wGrid[y * w + x] = n;
  wPen[y * w + x] = 0;

  const dupMarks = regionDuplicateMarks(
    wGrid,
    wPen,
    x,
    y,
    n,
    w,
    rowColRegions(x, y, w),
  );
  for (const m of dupMarks) wPen[m.y * w + m.x] &= ~(1 << n);

  if (!autoClean && dupMarks.length > 0) {
    steps.push({
      move: { type: "pencilStrike", marks: dupMarks },
      explanation: narrate({ kind: "dup", n, px: x, py: y }, 0),
      highlights: {
        area: [],
        targets: dupMarks.map((m) => ({ x: m.x, y: m.y })),
        marks: dupMarks,
      },
      continuesPrevious: true,
    });
  }
}

/** An extreme clue that forces (part of) a line outright — the cleanest
 * deduction on the board, so the planner surfaces it before anything else:
 *   - clue == w: the line sees every tower, so it must climb `1..w` from the
 *     clue (cell nearest = 1, farthest = w) — returns every still-empty cell
 *     with its forced height, to be placed as one ordered journey;
 *   - clue == 1: the line sees only the tallest, so height w must stand next to
 *     the clue — returns that single cell.
 * The board is mistake-free when the planner runs (`hint` refuses otherwise), so
 * any already-filled cell in such a line is guaranteed to match. Returns every
 * applicable clue, full lines first. */
function extremeClueLines(
  clues: Int32Array,
  wGrid: Uint8Array,
  w: number,
): { reason: HintReason; cells: Mark[] }[] {
  const out: { reason: HintReason; cells: Mark[] }[] = [];
  for (let c = 0; c < 4 * w; c++) {
    if (clues[c] !== w) continue;
    const line = lineCells(c, w);
    const cells: Mark[] = [];
    for (let i = 0; i < w; i++) {
      if (wGrid[line[i].y * w + line[i].x] === 0)
        cells.push({ x: line[i].x, y: line[i].y, n: i + 1 });
    }
    if (cells.length > 0)
      out.push({ reason: { kind: "fullLine", clue: c, clueVal: w }, cells });
  }
  for (let c = 0; c < 4 * w; c++) {
    if (clues[c] !== 1) continue;
    const cell = lineCells(c, w)[0];
    if (wGrid[cell.y * w + cell.x] === 0)
      out.push({
        reason: { kind: "tallestNearest", clue: c, clueVal: 1 },
        cells: [{ x: cell.x, y: cell.y, n: w }],
      });
  }
  return out;
}

/** Build the hint plan by walking a working copy of the board the way a person
 * solves it: of the firings available, the one continuing from the plan's
 * latest steps (`HintFrontier`), and failing that a naked single first, else a
 * forced extreme-clue line, else a clue elimination, else a forced placement
 * (populating notes lazily, after the note-free forced placements and before the
 * first elimination needs them).
 * `autoClean` (the auto-pencil preference) decides whether a placement's trivial
 * row/column note eliminations are silent or taught. */
function buildSteps(
  state: TowersState,
  autoClean: boolean,
): HintStep<TowersMove, TowersHint>[] {
  const w = state.w;
  const steps: HintStep<TowersMove, TowersHint>[] = [];
  const wGrid = Uint8Array.from(state.grid);
  const wPen = Int32Array.from(state.pencil);
  const maxdiff = Math.min(diffToLevel(state.diff), DIFF_EXTREME);

  // Populate notes lazily: the forced placements below (extreme-clue lines,
  // facing pairs) need no notes, so an empty board opens straight on them rather
  // than on a "pencil everything in" step. We only fill notes the moment an
  // elimination actually needs something to cross out.
  const pop = lazyPopulate<TowersMove, TowersHint>(
    state,
    wGrid,
    wPen,
    w,
    steps,
    say.populate,
  );

  let ops = recordTowersDeductions(w, state.clues, wGrid, maxdiff);
  // The firing whose strike the previous step emitted, so a same-firing strike
  // of a *different* height continues the journey rather than reading as a new,
  // unrelated hint. `-1` = no strike pending (a placement resets it, since a new
  // `ops` recording restarts group numbering).
  let lastStrikeGroup = -1;
  const place = (m: Mark, reason: HintReason, continues = false) =>
    emitPlacement(steps, wGrid, wPen, w, m.x, m.y, m.n, reason, autoClean, continues);
  const placing = (m: Mark, reason: HintReason, reads: Point[]): FrontierCandidate => ({
    reads,
    take: () => {
      place(m, reason);
      ops = recordTowersDeductions(w, state.clues, wGrid, maxdiff);
      lastStrikeGroup = -1;
    },
  });

  // 1. A naked single — the next move a human makes. (On an unpopulated board
  //    there are no notes, so none fire here and we fall through to the
  //    note-free extreme-clue lines.)
  const singles = () =>
    nakedSingles(wGrid, wPen, w).map((ns) => placing(ns, { kind: "single" }, [ns]));

  // 2. An extreme clue forcing (part of) a line outright — the cleanest move
  //    that needs no notes, so an empty board opens on it. clue == w fills the
  //    whole line 1..w in order as one journey; clue == 1 places the tallest
  //    tower next to the clue.
  const lines = () =>
    extremeClueLines(state.clues, wGrid, w).map(
      (forced): FrontierCandidate => ({
        reads: reasonArea(forced.reason, w),
        take: () => {
          for (const [j, c] of forced.cells.entries()) place(c, forced.reason, j > 0);
          ops = recordTowersDeductions(w, state.clues, wGrid, maxdiff);
          lastStrikeGroup = -1;
        },
      }),
    );

  // 3. The extreme-clue lines are done — pencil in the notes now (once), so
  //    the eliminations below have something to cross out and are taught
  //    rather than skipped in favor of bare placements. Then, once notes exist
  //    (just populated, or already present), bulk-clear the obvious candidates
  //    in one step — the adaptive Mark-all second press — so the walk teaches
  //    the real deductions, not the trivial row/column culls one placement at a
  //    time.
  const setUp = populateThenClean(pop, () =>
    emitObviousCleanStep(
      steps,
      wGrid,
      wPen,
      w,
      (x, y) => rowColRegions(x, y, w),
      say.cleanObvious,
    ),
  );

  // 4. The clue eliminations (the deductions worth teaching). One firing
  //    that rules out several heights is emitted as one journey: the first
  //    height unflagged, each further height a `continuesPrevious` leg.
  const strikes = () =>
    clueStrikes(ops, wGrid, wPen, w).map(
      (strike): FrontierCandidate => ({
        reads: reasonArea(strike.reason, w),
        take: () => {
          steps.push({
            move: { type: "pencilStrike", marks: strike.marks },
            explanation: narrate(strike.reason, strike.marks[0].n),
            highlights: {
              area: reasonArea(strike.reason, w),
              targets: strike.marks.map((m) => ({ x: m.x, y: m.y })),
              marks: strike.marks,
            },
            continuesPrevious: strike.group === lastStrikeGroup,
          });
          for (const m of strike.marks) wPen[m.y * w + m.x] &= ~(1 << m.n);
          lastStrikeGroup = strike.group;
        },
      }),
    );

  // 5. The forced placements (facing clue, or a cube collapse the notes lag).
  // A generic `single`'s *why* (naked vs hidden single) is re-derived from the
  // working board, since the recorded reason conflates the two and would
  // mis-narrate a hidden single. A clue-driven placement keeps its reason.
  const places = (nothingEarlier: boolean) =>
    availablePlacements(
      ops,
      wGrid,
      wPen,
      w,
      (x, y) => rowColRegions(x, y, w),
      nothingEarlier,
    ).map(({ op, why }) => {
      const reason = why.kind === "recorded" ? op.reason : singleReasonOf(op.n, why);
      return placing(op, reason, [op, ...reasonArea(reason, w)]);
    });

  // Stops when nothing fires (e.g. an Unreasonable board now needing a guess).
  runCandidatePlan({
    w,
    steps,
    finished: () => !wGrid.includes(0),
    label: "towers hint plan",
    cap: w * w * w * 4 + 4,
    opening: [singles, lines],
    setUp,
    rungs: [singles, lines, strikes, places],
  });
  return steps;
}

/** Towers' difficulty contract (`engine/difficulty.ts`). `solveTowers` follows
 * the shared latin-family return convention — the difficulty reached, or one of
 * `latin.ts`'s sentinels — so `latinVerdict` reads it. The solver is seeded from
 * the immutable givens, never the player's grid. */
const difficulty: DifficultyContract<TowersParams> = {
  tierOf: (p) => diffToLevel(p.diff),
  withTier: (p, tier) => ({ ...p, diff: diffFromLevel(tier) }),
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    return latinVerdict(solveTowers(s.w, s.clues, Uint8Array.from(s.immutable), cap));
  },
};

export const towersGame: Game<
  TowersParams,
  TowersState,
  TowersMove,
  TowersUi,
  TowersDrawState,
  TowersMistake
> = {
  id: "towers",
  wantsStatusbar: false,
  isTimed: false,
  canSolve: true,
  canFormatAsText: true,
  canMarkAll: true, // handles 'M' (pencilAll) in interpretMove

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig,
  // Keys match the `towers` config template in augmentation.ts: `grid-size` is
  // the value, `difficulty` the zero-based label index.
  describeParams: (p) => ({
    "grid-size": String(p.w),
    difficulty: diffToLevel(p.diff),
  }),

  newDesc: newTowersDesc,
  validateDesc,
  newState,
  newUi,
  changedState,

  interpretMove,
  executeMove,
  status,

  solve,
  difficulty,
  hint: (state, _aux, ui) => candidateHint(state, ui ?? null, findMistakes, buildSteps),
  hintKeepTrack: (m, step: HintStep<TowersMove, TowersHint>, state) =>
    keepCandidateHintTrack(m, step, state.pencil, state.w),
  refreshHintStep: (step: HintStep<TowersMove, TowersHint>, state) =>
    refreshCandidateHintStep(step, state.grid, state.pencil, state.w),
  findMistakes,
  requestKeys: (p) => [...digitKeys(p.w), pencilModeKey],
  textFormat,

  prefs: [
    autoPencilPref<TowersUi>(
      "When you place a tower, remove that number from pencil marks in its row and column",
    ),
    stickyPencilPref<TowersUi>(),
    pencilKeepHighlightPref<TowersUi>(),
    {
      kw: "appearance",
      name: "Puzzle appearance",
      type: "choices",
      choices: ["2D", "3D"],
      get: (ui) => (ui.threeD ? 1 : 0),
      set: (ui, v) => {
        ui.threeD = v === 1;
      },
    },
  ],

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  flashLength: (from, to) => winFlash(from, to, FLASH_TIME),
};

registerGame(towersGame);
