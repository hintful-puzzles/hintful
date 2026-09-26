/**
 * Group — a Latin-square puzzle played on a group's Cayley table: fill the grid
 * so it is a valid group multiplication table (Latin **and** associative).
 *
 * Port of `puzzles/unfinished/group.c`. The solver rides on the shared
 * `engine/latin.ts` (see `solver.ts`); this module is the Game glue — params,
 * move interpretation/execution, the two Group-specific visual aids (row/column
 * reorder + subgroup dividers) and the diagonal multifill, `findMistakes` for
 * Check & Save, and the config/pref forms.
 */

import { assertNever } from "../../engine/assert-never.ts";
import {
  adaptiveMarkAllMove,
  type CandidateMoveAdapter,
  type CandidatePlanPrefs,
  candidateHint,
  firstUnreflectedPlaceIndex,
  keepCandidateHintTrack,
  type Mark,
  refreshCandidateHintStep,
} from "../../engine/candidate-hint.ts";
import {
  type Firing,
  type RungContext,
  runLatinCandidatePlan,
  valuesOf,
} from "../../engine/candidate-plan.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
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
import {
  latinPremise,
  narrateLatinReason,
  type Premise,
} from "../../engine/hint-text.ts";
import { clearKey } from "../../engine/key-labels.ts";
import { DIFF_AMBIGUOUS, DIFF_IMPOSSIBLE, latinVerdict } from "../../engine/latin.ts";
import {
  availablePlacements,
  genericLatinArea,
  rowColRegions,
  type SingleReason,
  singleReasonOf,
} from "../../engine/latin-hint.ts";
import {
  pressNoteTakingCell,
  releaseHighlightAfterEntry,
  toggleNoteTakingMode,
} from "../../engine/note-taking-cell.ts";
import type { OrderedCell } from "../../engine/overlay-sidecar.ts";
import { parseConfigInt } from "../../engine/params.ts";
import {
  candidateReadingPref,
  pencilKeepHighlightPref,
} from "../../engine/pencil-prefs.ts";
import {
  CURSOR_SELECT2,
  gridCursorMove,
  isCursorMove,
  isEraseKey,
  isMouseDown,
  isMouseDrag,
  isMouseRelease,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { ConfigValues, KeyLabel, Point, Size } from "../../engine/types.ts";
import { newGameDesc } from "./generator.ts";
import { groupVocab, say } from "./hint-text.ts";
import {
  colors,
  computeSize,
  flashLength,
  fromCoord,
  type GroupDrawState,
  type GroupHint,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  type HintOp,
  type HintReason,
  recordGroupDeductions,
  solveGroup,
} from "./solver.ts";
import {
  checkErrors,
  cloneState,
  DIFF_EXTREME,
  DIFF_NAMES,
  DIFF_UNREASONABLE,
  decodeParams,
  defaultParams,
  encodeParams,
  fromChar,
  type GroupMistake,
  type GroupMove,
  type GroupParams,
  type GroupState,
  type GroupUi,
  isChar,
  moveInSequence,
  newState,
  newUi,
  PRESETS,
  presetName,
  status,
  textFormat,
  toChar,
  validateDesc,
  validateParams,
} from "./state.ts";

function presets(): PresetMenu<GroupParams> {
  return {
    title: "Group",
    submenu: PRESETS.map((p) => ({ title: presetName(p), params: { ...p } })),
  };
}

function requestKeys(p: GroupParams): KeyLabel[] {
  const keys: KeyLabel[] = [];
  for (let i = 0; i < p.w; i++) {
    const ch = toChar(i + 1, p.id);
    keys.push({ button: ch.charCodeAt(0), label: ch });
  }
  keys.push(clearKey);
  return keys;
}

// --- input (interpret_move) ------------------------------------------------

function interpretMove(
  state: GroupState,
  ui: GroupUi,
  ds: GroupDrawState,
  point: Point,
  buttonRaw: number,
): GroupMove | null | UiUpdate {
  const w = state.w;
  const ts = ds.tileSize;
  const button = stripModifiers(buttonRaw);

  const tx = fromCoord(point.x, ts);
  const ty = fromCoord(point.y, ts);

  if (ui.drag) {
    if (isMouseDrag(button)) {
      const tcoord = (ui.drag & ~4) === 1 ? ty : tx;
      ui.drag |= 4; // some movement has happened
      if (tcoord >= 0 && tcoord < w) {
        ui.dragpos = tcoord;
        return UI_UPDATE;
      }
    } else if (isMouseRelease(button)) {
      if (ui.drag & 4) {
        ui.drag = 0; // end drag
        if (state.sequence[ui.dragpos] === ui.dragnum) return UI_UPDATE; // no-op
        return { type: "reorder", num: ui.dragnum, pos: ui.dragpos };
      }
      ui.drag = 0; // end 'drag' (a click on a header edge = divider toggle)
      if (ui.edgepos > 0 && ui.edgepos < w) {
        return {
          type: "divider",
          i: state.sequence[ui.edgepos - 1],
          j: state.sequence[ui.edgepos],
        };
      }
      return UI_UPDATE;
    }
  } else if (isMouseDown(button)) {
    if (tx >= 0 && tx < w && ty >= 0 && ty < w) {
      // Group's highlight lives in *element* space — `ui.cursor` holds the
      // element a row/column stands for, not its screen position — because the
      // player can reorder the table under it. The multifill anchor is the
      // display position, which is why the game keeps both.
      const cx = state.sequence[tx];
      const cy = state.sequence[ty];
      const press = pressNoteTakingCell(ui, button, cx, cy, {
        canEnter: !state.immutable[cy * w + cx],
        canMark: state.grid[cy * w + cx] === 0,
      });
      if (press !== null) {
        if (press === "moved") {
          ui.ohx = tx;
          ui.ohy = ty;
          ui.odx = 0;
          ui.ody = 0;
          ui.odn = 1;
        }
        return UI_UPDATE;
      }
    } else if (tx >= 0 && tx < w && ty === -1) {
      // Click on the top legend row: start dragging a column.
      ui.drag = 2;
      ui.dragnum = state.sequence[tx];
      ui.dragpos = tx;
      ui.edgepos = fromCoord(point.x + Math.trunc(ts / 2), ts);
      return UI_UPDATE;
    } else if (ty >= 0 && ty < w && tx === -1) {
      // Click on the left legend column: start dragging a row.
      ui.drag = 1;
      ui.dragnum = state.sequence[ty];
      ui.dragpos = ty;
      ui.edgepos = fromCoord(point.y + Math.trunc(ts / 2), ts);
      return UI_UPDATE;
    }
  } else if (isMouseDrag(button)) {
    // Diagonal multifill selection from the highlighted square.
    if (
      !ui.pencilMode &&
      tx >= 0 &&
      tx < w &&
      ty >= 0 &&
      ty < w &&
      Math.abs(tx - ui.ohx) === Math.abs(ty - ui.ohy)
    ) {
      ui.odn = Math.abs(tx - ui.ohx) + 1;
      ui.odx = tx < ui.ohx ? -1 : 1;
      ui.ody = ty < ui.ohy ? -1 : 1;
    } else {
      ui.odx = 0;
      ui.ody = 0;
      ui.odn = 1;
    }
    return UI_UPDATE;
  }

  if (isCursorMove(button)) {
    // The cursor moves in display space; hx/hy track the element there.
    let cx = state.sequence.indexOf(ui.cursor.x);
    let cy = state.sequence.indexOf(ui.cursor.y);
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    const moved = gridCursorMove(button, cx, cy, w, w, false);
    if (moved) {
      cx = moved.x;
      cy = moved.y;
    }
    ui.cursor.x = state.sequence[cx];
    ui.cursor.y = state.sequence[cy];
    ui.cursor.visible = true;
    ui.cursorFromKeyboard = true;
    ui.ohx = cx;
    ui.ohy = cy;
    ui.odx = 0;
    ui.ody = 0;
    ui.odn = 1;
    return UI_UPDATE;
  }

  const toggled = toggleNoteTakingMode(ui, button);
  if (toggled) return toggled;

  // Uppercase 'M' (the Mark-all toolbar button, ASCII 77): fill every empty cell
  // with all candidate marks, then clean the obvious row/column culls — the
  // populate step the hint teaches. Only *uppercase* M is intercepted, because
  // Group's elements are the letters a–z, so lowercase 'm' (109) is element 13
  // for w ≥ 13 and must still enter that value.
  if (button === 77)
    return adaptiveMarkAllMove<GroupMove>(state.grid, state.pencil, w, (x, y) =>
      rowColRegions(x, y, w),
    );

  if (
    ui.cursor.visible &&
    ((isChar(button) && fromChar(button, state.id) <= w) ||
      button === CURSOR_SELECT2 ||
      isEraseKey(button))
  ) {
    let n = fromChar(button, state.id);
    if (button === CURSOR_SELECT2 || isEraseKey(button)) n = 0;

    const cells: Point[] = [];
    for (let i = 0; i < ui.odn; i++) {
      const x = state.sequence[ui.ohx + i * ui.odx];
      const y = state.sequence[ui.ohy + i * ui.ody];
      const index = y * w + x;
      // Can't pencil-mark a filled square.
      if (ui.pencilMode && state.grid[index]) return null;
      // Can't touch an immutable square — unless setting it to what it holds
      // (so a multifill can cross an already-correct immutable cell).
      if (!(!ui.pencilMode && state.grid[index] === n) && state.immutable[index])
        return null;
      cells.push({ x, y });
    }

    const type = ui.pencilMode && n > 0 ? "pencil" : "set";
    // Hide a mouse-generated highlight after a keypress, unless a pencil change
    // and the keep-highlight preference is set.
    releaseHighlightAfterEntry(ui);
    return { type, cells, n };
  }

  return null;
}

// --- move execution (execute_move) -----------------------------------------

function executeMove(from: GroupState, move: GroupMove): GroupState {
  const w = from.w;
  const a = w * w;

  switch (move.type) {
    case "solve": {
      const ret = cloneState(from);
      ret.completed = true;
      ret.cheated = true;
      ret.grid.set(move.grid);
      ret.pencil.fill(0);
      return ret;
    }
    case "set":
    case "pencil": {
      const ret = cloneState(from);
      const n = move.n;
      for (const c of move.cells) {
        if (c.x < 0 || c.x >= w || c.y < 0 || c.y >= w) throw new Error("bad move");
        const idx = c.y * w + c.x;
        if (from.immutable[idx] && !(move.type === "set" && from.grid[idx] === n))
          throw new Error("bad move");
        if (move.type === "pencil" && n > 0) {
          ret.pencil[idx] ^= 1 << n;
        } else {
          ret.grid[idx] = n;
          ret.pencil[idx] = 0;
        }
      }
      if (!ret.completed && !checkErrors(ret)) ret.completed = true;
      return ret;
    }
    case "reorder": {
      const ret = cloneState(from);
      moveInSequence(from.sequence, move.num, move.pos, ret.sequence);
      // Eliminate dividers no longer between the same two adjacent elements.
      for (let x = 0; x < w; x++) {
        const el = ret.sequence[x];
        const nxt = x + 1 < w ? ret.sequence[x + 1] : -1;
        if (ret.dividers[el] !== nxt) ret.dividers[el] = -1;
      }
      return ret;
    }
    case "divider": {
      const ret = cloneState(from);
      ret.dividers[move.i] = ret.dividers[move.i] === move.j ? -1 : move.j;
      return ret;
    }
    case "pencilAll": {
      const ret = cloneState(from);
      const all = (1 << (w + 1)) - (1 << 1); // bits 1..w set
      // Additive — fill only note-less empty cells, never reset a narrowed one:
      // `candidate-hint.ts`'s `adaptiveMarkAll` § "The additive rule, stated once".
      for (let i = 0; i < a; i++) {
        if (!ret.grid[i] && ret.pencil[i] === 0) ret.pencil[i] = all;
      }
      return ret;
    }
    case "pencilStrike": {
      const ret = cloneState(from);
      for (const { x, y, n } of move.marks) ret.pencil[y * w + x] &= ~(1 << n);
      return ret;
    }
    case "pencilAdd": {
      const ret = cloneState(from);
      for (const { x, y, n } of move.marks) ret.pencil[y * w + x] |= 1 << n;
      return ret;
    }
    default:
      return assertNever(move, "group: executeMove");
  }
}

// --- Ui reconciliation (game_changed_state) --------------------------------

function changedState(
  ui: GroupUi,
  oldState: GroupState | null,
  newState: GroupState,
): void {
  const w = newState.w;

  // Cancel a pencil highlight on a square that just became filled.
  if (
    ui.cursor.visible &&
    ui.pencilMode &&
    !ui.cursorFromKeyboard &&
    newState.grid[ui.cursor.y * w + ui.cursor.x] !== 0
  ) {
    ui.cursor.visible = false;
  }

  if (ui.cursor.visible && ui.odn > 1 && oldState) {
    // Reordering within a multifill selection cancels it entirely.
    for (let i = 0; i < ui.odn; i++) {
      if (
        oldState.sequence[ui.ohx + i * ui.odx] !==
          newState.sequence[ui.ohx + i * ui.odx] ||
        oldState.sequence[ui.ohy + i * ui.ody] !==
          newState.sequence[ui.ohy + i * ui.ody]
      ) {
        ui.cursor.visible = false;
        break;
      }
    }
  } else if (
    ui.cursor.visible &&
    (newState.sequence[ui.ohx] !== ui.cursor.x ||
      newState.sequence[ui.ohy] !== ui.cursor.y)
  ) {
    // Reordering the row/column of the selection moves the selection with it.
    for (let i = 0; i < w; i++) {
      if (newState.sequence[i] === ui.cursor.x) ui.ohx = i;
      if (newState.sequence[i] === ui.cursor.y) ui.ohy = i;
    }
  }
}

// --- solve + findMistakes --------------------------------------------------

function solve(
  orig: GroupState,
  _curr: GroupState,
  aux?: string,
): SolveResult<GroupMove> {
  const w = orig.w;
  const a = w * w;
  if (aux) {
    const grid: number[] = [];
    for (let i = 0; i < a; i++) grid[i] = fromChar(aux.charCodeAt(i + 1), orig.id);
    return { ok: true, move: { type: "solve", grid } };
  }
  const soln = orig.grid.slice();
  const ret = solveGroup(soln, w, DIFF_UNREASONABLE);
  if (ret === DIFF_IMPOSSIBLE)
    return { ok: false, error: "No solution exists for this puzzle" };
  if (ret === DIFF_AMBIGUOUS)
    return { ok: false, error: "Multiple solutions exist for this puzzle" };
  return { ok: true, move: { type: "solve", grid: Array.from(soln) } };
}

/** Flag every user entry that contradicts the unique solution (re-solved from
 * the givens only), for Check & Save. */
function findMistakes(state: GroupState): readonly GroupMistake[] {
  const w = state.w;
  const a = w * w;
  const soln = new Uint8Array(a);
  for (let i = 0; i < a; i++) if (state.immutable[i]) soln[i] = state.grid[i];
  const ret = solveGroup(soln, w, DIFF_UNREASONABLE);
  if (ret === DIFF_IMPOSSIBLE || ret === DIFF_AMBIGUOUS) return [];

  const out: GroupMistake[] = [];
  for (let i = 0; i < a; i++) {
    if (state.immutable[i]) continue;
    if (state.grid[i] && state.grid[i] !== soln[i])
      out.push({ x: i % w, y: (i / w) | 0 });
  }
  return out;
}

// --- hint ------------------------------------------------------------------

/** The reasons a hint step narrates: the Group-specific deductions, the generic
 * Latin reasons, and the naked/hidden/forced classification a placement's `single`
 * reason is re-derived into. */
type NarratableReason = HintReason | SingleReason;

/** Narrate *why* a placement is forced (docs/games/hints.md § "Writing the
 * narration"). `n` is the value placed. The generic Latin arms go to
 * `narrateLatinReason` under {@link groupVocab}; only Group's own placing
 * techniques are chosen here. `identityFill`'s continuation legs are narrated
 * by `buildSteps`' `placeWords`. The words are [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(reason: NarratableReason, n: number, id: boolean): string {
  const ch = (v: number): string => toChar(v, id);
  switch (reason.kind) {
    case "associativity":
      return say.associativity({
        A: ch(reason.a),
        B: ch(reason.b),
        C: ch(reason.c),
        ab: ch(reason.ab),
        bc: ch(reason.bc),
        v: ch(reason.v),
        knownLeft: reason.knownLeft,
      });
    case "identityFill":
      return say.identityFill(
        ch(reason.a),
        ch(reason.b),
        reason.prod === reason.a,
        ch(n),
      );
    case "identityElim":
      throw new Error("an identity elimination strikes");
    default:
      return narrateLatinReason(reason, n, groupVocab(id));
  }
}

/** Why a strike is forced, which the walk concludes with the move it makes.
 * `ns` is the struck values. */
function premise(reason: NarratableReason, ns: number[], id: boolean): Premise {
  const ch = (v: number): string => toChar(v, id);
  switch (reason.kind) {
    case "identityElim":
      return {
        premise: say.identityElim(
          ch(reason.elem),
          ch(reason.other),
          ch(reason.product),
          reason.left,
        ),
        struck: say.identityMarks,
      };
    case "associativity":
    case "identityFill":
      throw new Error(`a ${reason.kind} deduction places`);
    default:
      return latinPremise(reason, ns, groupVocab(id));
  }
}

/** The premise cells a step shades `COL_HINT_CELL` as evidence: associativity's
 * three known products; an identity fill's / identity elimination's revealing
 * cell. The generic culls have no clean local area (the struck notes carry the
 * premise), and a hidden single's line is the row/column preset's, which shades
 * it over whatever this returns. */
function reasonArea(reason: NarratableReason): OrderedCell[] {
  switch (reason.kind) {
    case "associativity":
      return [reason.abCell, reason.bcCell, reason.thirdCell];
    case "identityFill":
      return [{ x: reason.viaX, y: reason.viaY }];
    case "identityElim":
      return [{ x: reason.wx, y: reason.wy }];
    default:
      return genericLatinArea(reason);
  }
}

/** Build the hint plan by walking a working copy of the board the way a person
 * solves it (`runLatinCandidatePlan`), placement-first: Group's own rung teaches a
 * placement the solver makes before any elimination (associativity, an identity
 * row and column, or a single the board already shows) with no notes at all,
 * so notes are penciled in only when an elimination needs them. Group has no
 * auto-pencil, so every placement teaches its row/column cull: a later single
 * is narrated from the notes, and a cull skipped here would leave it resting on
 * strikes the board does not show. Capped below recursion (a guess is not
 * teachable). */
function buildSteps(
  state: GroupState,
  { reading }: CandidatePlanPrefs,
): HintStep<GroupMove, GroupHint>[] {
  const w = state.w;
  const id = state.id;
  const steps: HintStep<GroupMove, GroupHint>[] = [];
  const wGrid = Uint8Array.from(state.grid);
  const wPen = Int32Array.from(state.pencil);
  const maxdiff = Math.min(state.diff, DIFF_EXTREME);
  const regions = (x: number, y: number) => rowColRegions(x, y, w);
  type Legs = Firing<GroupMove, GroupHint, NarratableReason>;

  /** A placement's firing. Learning the identity forces every empty cell of its
   * row and column at once, so those placements are one journey, not `2w − 1`
   * hints, with the revealing cell shaded on every leg. */
  const placing = (m: Mark, reason: NarratableReason, ops: readonly HintOp[]): Legs => {
    if (reason.kind !== "identityFill") return [{ place: m, reason }];
    const group = ops.find(
      (op) => op.kind === "place" && op.x === m.x && op.y === m.y,
    )?.group;
    return ops
      .filter(
        (op) =>
          op.kind === "place" && op.group === group && wGrid[op.y * w + op.x] === 0,
      )
      .map((op) => ({ place: op, reason: op.reason }));
  };
  // A placement of Group's own that is the solver's immediate next deduction
  // (nothing precedes it in solver order). `ops.length > 0` is load-bearing:
  // `firstUnreflectedPlaceIndex` returns `ops.length` for "no placement", which
  // is 0 when `ops` is empty, and that is ordinary on an Unreasonable board,
  // whose rungs the cap withholds. Any associativity placement is available once
  // the three products it reads are all on the board, since those are its whole
  // premise. Before the notes are set up, so is any recorded single the player
  // can read off the board; once they are, singles wait behind the strikes.
  const leads = ({ ops, populated, shown }: RungContext<HintOp>): Legs[] => {
    const out: Legs[] = [];
    // A *single* never leads: whether the board shows it is the question
    // `availablePlacements` answers below, and a lead would have to assert it.
    // A single resting on a strike the board still shows (a stale note the
    // player left: place an element without culling your own notes, which is
    // Group's default, then ask for a hint) is not readable yet, and asserting
    // it threw. Found by `hint-resume.test.ts` once its Latin block walked 8x8
    // Tricky rather than the first preset; that walk follows one leg of each
    // journey, which is exactly the player who takes the placement and leaves
    // its cull.
    const lead =
      ops.length > 0 &&
      firstUnreflectedPlaceIndex(ops, wGrid, w) === 0 &&
      ops[0].reason.kind !== "single";
    if (lead) out.push(placing(ops[0], ops[0].reason, ops));
    for (const op of ops)
      if (
        (op !== ops[0] || !lead) &&
        op.kind === "place" &&
        op.reason.kind === "associativity" &&
        wGrid[op.y * w + op.x] === 0 &&
        reasonArea(op.reason).every((p) => wGrid[p.y * w + p.x] !== 0)
      )
        out.push(placing(op, op.reason, ops));
    if (!populated)
      for (const { op, why } of availablePlacements(
        ops,
        wGrid,
        shown,
        w,
        regions,
        false,
        { written: wPen },
      ))
        if (why.kind !== "recorded")
          out.push(placing(op, singleReasonOf(op.n, why), ops));
    return out;
  };

  runLatinCandidatePlan<GroupMove, GroupHint, HintOp, NarratableReason>({
    w,
    steps,
    grid: wGrid,
    pencil: wPen,
    moves: groupCandidateMoves,
    autoClean: false,
    reading,
    label: "group hint plan",
    record: () => recordGroupDeductions(wGrid, w, maxdiff),
    placeWords: (m, reason, continues) => ({
      explanation:
        continues && reason.kind === "identityFill"
          ? say.identityFillNext(toChar(m.n, id))
          : narrate(reason, m.n, id),
      area: reasonArea(reason),
    }),
    strikeWords: (marks, reason) => ({
      ...premise(reason, valuesOf(marks), id),
      area: reasonArea(reason),
    }),
    notes: { noun: "element", placedVerb: "placed", value: (n) => toChar(n, id) },
    rungs: [leads],
    placement: placing,
  });
  return steps;
}

function hint(
  state: GroupState,
  _aux?: string,
  ui?: GroupUi,
): HintResult<GroupMove, GroupHint> {
  return candidateHint(state, ui ?? newUi(state), findMistakes, buildSteps);
}

/**
 * How Group's `Move` union reads as the shared candidate shapes: its `set` /
 * `pencil` carry a *cell list* (for the diagonal multifill) rather than an
 * `x`/`y` pair, so a hint's single-cell move is `cells[0]` and a real multifill
 * is off-plan. Everything else is the shared mechanics.
 */
const groupCandidateMoves: CandidateMoveAdapter<GroupMove> = {
  read: (m) => {
    if ((m.type === "set" || m.type === "pencil") && m.n > 0 && m.cells.length === 1) {
      const { x, y } = m.cells[0];
      return { type: "set", x, y, n: m.n, pencil: m.type === "pencil" };
    }
    if (m.type === "pencilAll") return { type: "pencilAll" };
    if (m.type === "pencilStrike") return { type: "pencilStrike", marks: [...m.marks] };
    if (m.type === "pencilAdd") return { type: "pencilAdd", marks: [...m.marks] };
    return null;
  },
  strike: (marks) => ({ type: "pencilStrike", marks }),
  add: (marks) => ({ type: "pencilAdd", marks }),
  place: (x, y, n) => ({ type: "set", cells: [{ x, y }], n }),
};

/** Classify a player move against the displayed hint step (the engine's
 * keep-track contract). `state` is the PRE-move board. */
function hintKeepTrack(
  m: GroupMove,
  step: HintStep<GroupMove, GroupHint>,
  state: GroupState,
): HintTrackVerdict {
  return keepCandidateHintTrack(m, step, state.pencil, state.w, groupCandidateMoves);
}

/** Re-validate a stored hint step against the current board before it is
 * (re-)displayed (the engine's "never show a stale step" guarantee). */
function refreshHintStep(
  step: HintStep<GroupMove, GroupHint>,
  state: GroupState,
): HintStep<GroupMove, GroupHint> | null {
  return refreshCandidateHintStep(
    step,
    state.grid,
    state.pencil,
    state.w,
    groupCandidateMoves,
  );
}

// --- config / params summary -----------------------------------------------

function describeParams(p: GroupParams): ConfigValues {
  // Keys match the `group` template in `puzzle/augmentation.ts`.
  return { "grid-size": String(p.w), difficulty: p.diff, "show-identity": p.id };
}

/** Group's difficulty contract (`engine/difficulty.ts`). `solveGroup` follows
 * the shared latin-family return convention — the difficulty reached, or one of
 * `latin.ts`'s sentinels — so `latinVerdict` reads it. */
const difficulty: DifficultyContract<GroupParams> = {
  tierOf: (p) => p.diff,
  withTier: (p, tier) => ({ ...p, diff: tier }),
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    return latinVerdict(solveGroup(s.grid.slice(), s.w, cap));
  },
};

export const groupGame: Game<
  GroupParams,
  GroupState,
  GroupMove,
  GroupUi,
  GroupDrawState,
  GroupMistake
> = {
  id: "group",
  canMarkAll: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig: [
    {
      kw: "size",
      name: "Grid size",
      type: "string",
      get: (p) => String(p.w),
      set: (p, v) => {
        p.w = parseConfigInt(v);
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
    {
      kw: "show-identity",
      name: "Show identity",
      type: "boolean",
      get: (p) => p.id,
      set: (p, v) => {
        p.id = v;
      },
    },
  ],
  describeParams,

  newDesc: newGameDesc,
  validateDesc,
  newState,
  newUi,
  changedState,

  interpretMove,
  executeMove,
  status,

  solve,
  difficulty,
  hint,
  hintKeepTrack,
  refreshHintStep,
  findMistakes,
  requestKeys,
  textFormat,

  prefs: [pencilKeepHighlightPref<GroupUi>(), candidateReadingPref<GroupUi>()],

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize: (p: GroupParams, ts: number): Size => computeSize(p.w, ts),
  newDrawState,
  redraw,

  animLength: () => 0,
  flashLength,
};

registerGame(groupGame);
