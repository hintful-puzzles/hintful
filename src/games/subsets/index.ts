/**
 * Subsets — native TS port of `puzzles/unreleased/subsets.c` (Lennard
 * Sprong's implementation of Inaba Naoki's puzzle).
 *
 * Place every set over an `n`-letter universe into the grid exactly once. A
 * horseshoe arrow points from a superset to a subset it contains, and *all*
 * valid arrows are shown — so a missing arrow between two neighbors is
 * itself a constraint (neither contains the other).
 *
 * Input targets one letter slot of a cell: left-click / Enter cycles it
 * unknown → present → absent, right-click / Space cycles the other way, and
 * Backspace resets it to unknown; a keyboard cursor walks the
 * slots, skipping the gaps between cell blocks. The tally band below the grid
 * is the reference aid, and with a cell in focus it is also where a set is
 * ruled out of that cell; the keyboard cursor walks down into it.
 *
 * Upstream locks the board to one configuration (4×4, four letters — the only
 * size where the sixteen possible sets exactly fill the sixteen cells), so the
 * only choice is how deep the deductions go: two tiers, one preset each, and a
 * Custom dialog offering the tier alone.
 */

import { assertNever } from "../../engine/assert-never.ts";
import { type DifficultyContract, difficultyItem } from "../../engine/difficulty.ts";
import { winFlash } from "../../engine/flash.ts";
import {
  type Game,
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import {
  CONTRADICTION_UNLOCALIZED,
  commonHintRefusal,
  DEDUCTION_EXHAUSTED,
} from "../../engine/hint-refusal.ts";
import { phrase } from "../../engine/hint-words.ts";
import {
  BACKSPACE,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  cursorDelta,
  DELETE,
  isEraseKey,
  LEFT_BUTTON,
  newCursor,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  interpretTargetVerbs,
  type TargetGeometry,
  type TargetVerbs,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { newSubsetsDesc } from "./generator.ts";
import { type LegMarks, say } from "./hint-text.ts";
import {
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SubsetsDrawState,
} from "./render.ts";
import {
  type CollapseExclusion,
  candidateCells,
  candidateSets,
  deduceHintPlan,
  findMistakes,
  pickExclusion,
  type RuleOutMark,
  type SubsetsDeduction,
  solveCopy,
  subsetsSolveGame,
  subsetsValidate,
} from "./solver.ts";
import {
  ALL_BITS,
  CELL_HEIGHT,
  CELL_WIDTH,
  cloneState,
  DIFF_NAMES,
  decodeParams,
  defaultParams,
  encodeParams,
  newState,
  presets,
  type SubsetsMistake,
  type SubsetsMove,
  type SubsetsParams,
  type SubsetsState,
  type SubsetsUi,
  status,
  textFormat,
  validateDesc,
  validateParams,
} from "./state.ts";

function newUi(_state: SubsetsState): SubsetsUi {
  return {
    cursor: newCursor(),
    highlightSet: null,
    highlightCell: null,
    tallyCursor: null,
  };
}

/** The cell whose inspect icon a pointer is over, or null. The icon is a badge
 * in the margin just *above* the cell block (see render.ts) — outside the block
 * so it clearly belongs to the whole cell, not one slot — clicked to light that
 * cell's still-possible sets in the tally without editing anything.
 *
 * The tap target is a strip spanning the block's top edge: it can't grow down
 * into the block (that would steal slot taps) or right past the block's mid-line
 * (a horseshoe sits there), so it is widened along the top instead to reach a
 * touch-reasonable size within the available margin. */
function iconHit(p: Point, w: number, h: number, ts: number): number | null {
  const cw = CELL_WIDTH;
  const ch = CELL_HEIGHT;
  for (let cellx = 0; cellx < w; cellx++) {
    for (let celly = 0; celly < h; celly++) {
      const bx = (cellx * (cw + 1) + 0.5) * ts;
      const by = (celly * (ch + 1) + 0.5) * ts;
      if (
        p.x >= bx - ts * 0.15 &&
        p.x < bx + ts * 0.9 &&
        p.y >= by - ts * 0.55 &&
        p.y < by
      )
        return celly * w + cellx;
    }
  }
  return null;
}

/** The tally-band set-value under a pointer, or null. Mirrors the tally layout
 * in render.ts (each entry drawn in a `2·ts × 0.75·ts` box). */
function tallyHit(p: Point, w: number, h: number, ts: number): number | null {
  const cw = CELL_WIDTH;
  const ch = CELL_HEIGHT;
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const tx = x * (cw + 1) * ts + Math.floor(cw * ts * 0.75);
      const ty = Math.floor(y * 0.75 * ts) + (h + 2) * ch * ts;
      if (
        p.x >= tx - ts &&
        p.x < tx + ts &&
        p.y >= ty - ts * 0.375 &&
        p.y < ty + ts * 0.375
      )
        return x * h + y;
    }
  }
  return null;
}

type SlotType = "known" | "unknown" | "cleared";

/**
 * A press on tally entry `value`. With an undecided cell in focus the tally is
 * that cell's list of sets, so the press rules `value` out of it or takes the
 * rule-out back; otherwise (no cell in focus, or a decided one with nothing
 * left to rule out) it spotlights where `value` can go, as it always has.
 */
function pressTally(
  state: SubsetsState,
  ui: SubsetsUi,
  value: number,
): SubsetsMove | UiUpdate {
  const cell = ui.highlightCell;
  if (cell !== null && state.known[cell] !== state.mask[cell]) {
    return {
      kind: "rule",
      pos: cell,
      value,
      on: !(state.ruledOut[cell] & (1 << value)),
    };
  }
  ui.highlightSet = ui.highlightSet === value ? null : value;
  ui.highlightCell = null;
  return UI_UPDATE;
}

/** The cell under the keyboard cursor. */
const cursorCell = (ui: SubsetsUi, w: number): number =>
  Math.floor(ui.cursor.y / (CELL_HEIGHT + 1)) * w +
  Math.floor(ui.cursor.x / (CELL_WIDTH + 1));

/** Arrow keys while the cursor is in the tally band: move between entries,
 * and leave for the grid's bottom row from the band's top row. */
function moveInTally(
  ui: SubsetsUi,
  dx: number,
  dy: number,
  w: number,
  h: number,
): UiUpdate {
  const at = ui.tallyCursor ?? 0;
  const col = Math.floor(at / h);
  const row = at % h;
  if (dy < 0 && row === 0) {
    ui.tallyCursor = null;
    ui.highlightCell = cursorCell(ui, w);
    ui.highlightSet = null;
    return UI_UPDATE;
  }
  const c = Math.max(0, Math.min(w - 1, col + dx));
  const r = Math.max(0, Math.min(h - 1, row + dy));
  ui.tallyCursor = c * h + r;
  return UI_UPDATE;
}

function interpretMove(
  state: SubsetsState,
  ui: SubsetsUi,
  ds: SubsetsDrawState,
  p: Point,
  rawButton: number,
): SubsetsMove | null | UiUpdate {
  const { w, h } = state;
  const button = stripModifiers(rawButton);
  const ts = ds.tileSize;

  // --- reference aid, both directions are mutually exclusive (selecting one
  // clears the other). A cell's top-left inspect icon lights its still-possible
  // sets in the tally; a tally set lights its still-legal cells. ------------
  if (button === LEFT_BUTTON) {
    const cell = iconHit(p, w, h, ts);
    if (cell !== null) {
      ui.highlightCell = ui.highlightCell === cell ? null : cell;
      ui.highlightSet = null;
      return UI_UPDATE;
    }
    const cn = tallyHit(p, w, h, ts);
    if (cn !== null) return pressTally(state, ui, cn);
  }

  // --- the keyboard in the tally band: arrows move, select presses --------
  if (ui.tallyCursor !== null) {
    const delta = cursorDelta(button);
    if (delta) return moveInTally(ui, delta.dx, delta.dy, w, h);
    if (button === CURSOR_SELECT || button === CURSOR_SELECT2)
      return pressTally(state, ui, ui.tallyCursor);
    if (isEraseKey(button)) {
      // Erase takes a rule-out back, and only that.
      const cell = ui.highlightCell;
      const value = ui.tallyCursor;
      if (cell === null || !(state.ruledOut[cell] & (1 << value))) return null;
      return { kind: "rule", pos: cell, value, on: false };
    }
  }

  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

/** A letter's slot in one cell: its cell `pos` and letter `num`, and `(gx,
 * gy)`, where it sits on the virtual slot grid the cursor walks. */
interface Slot {
  pos: number;
  num: number;
  gx: number;
  gy: number;
}

/** The slot at virtual slot-grid `(gx, gy)`, or `null` off the grid or on the
 * gap between two cells. */
function slotAt(s: SubsetsState, gx: number, gy: number): Slot | null {
  const cw = CELL_WIDTH;
  const ch = CELL_HEIGHT;
  const cellx = Math.floor(gx / (cw + 1));
  const celly = Math.floor(gy / (ch + 1));
  const numx = gx % (cw + 1);
  const numy = gy % (ch + 1);
  if (gx < 0 || gy < 0 || cellx >= s.w || celly >= s.h) return null;
  if (numx >= cw || numy >= ch) return null;
  return { pos: celly * s.w + cellx, num: numy * cw + numx, gx, gy };
}

/**
 * A target is one letter's slot in one cell. The cursor walks the slots,
 * skipping the gap rows and columns between cells, and down past the grid's
 * bottom row it enters the tally band (an arm of the game's own), where it
 * rests on no slot.
 */
const geometry: TargetGeometry<SubsetsState, SubsetsUi, SubsetsDrawState, Slot> = {
  noun: "letter",
  pointerTarget(s, ds, p) {
    const ts = ds.tileSize;
    if (p.x < ts / 2 || p.y < ts / 2) return null;
    // Upstream FROM_COORD: the board is inset by half a tile.
    const gx = Math.floor((p.x - Math.floor(ts / 2)) / ts);
    const gy = Math.floor((p.y - Math.floor(ts / 2)) / ts);
    return slotAt(s, gx, gy);
  },
  cursorTarget: (s, ui) =>
    ui.tallyCursor === null ? slotAt(s, ui.cursor.x, ui.cursor.y) : null,
  parkCursor(ui, slot) {
    ui.cursor.x = slot.gx;
    ui.cursor.y = slot.gy;
    ui.tallyCursor = null;
  },
  moveCursor(s, ui, button) {
    const delta = cursorDelta(button);
    if (delta === null) return false;
    const cw = CELL_WIDTH;
    const ch = CELL_HEIGHT;
    const gw = s.w * (cw + 1) - 1;
    const gh = s.h * (ch + 1) - 1;
    // Down from the grid's bottom row enters the tally band below it, keeping
    // the cell in focus, so its sets can be ruled out from the keyboard.
    if (delta.dy > 0 && ui.cursor.visible && ui.cursor.y === gh - 1) {
      ui.tallyCursor = Math.floor(ui.cursor.x / (cw + 1)) * s.h;
      return true;
    }
    // Upstream repeats move_cursor while the cursor rests on a gap row or
    // column between cell blocks; gaps never touch the clamped edges, so
    // this always terminates.
    do {
      ui.cursor.x = Math.max(0, Math.min(gw - 1, ui.cursor.x + delta.dx));
      ui.cursor.y = Math.max(0, Math.min(gh - 1, ui.cursor.y + delta.dy));
      ui.cursor.visible = true;
    } while (ui.cursor.x % (cw + 1) === cw || ui.cursor.y % (ch + 1) === ch);
    // Reverse aid: the cursor cell's still-possible sets light up in the tally.
    ui.highlightCell = cursorCell(ui, s.w);
    ui.highlightSet = null;
    return true;
  },
};

/** Move `slot` on from its current type by `next`; a given letter never moves,
 * and a verb that leaves the type as it is makes no move. */
function setSlot(next: (old: SlotType) => SlotType) {
  return (s: SubsetsState, { pos, num }: Slot): SubsetsMove | null => {
    const bit = 1 << num;
    if (s.immutable[pos] & bit) return null;
    const old: SlotType =
      s.known[pos] & bit ? "known" : s.mask[pos] & bit ? "unknown" : "cleared";
    const type = next(old);
    return type === old ? null : { kind: "set", type, pos, bit: num };
  };
}

const targetVerbs: TargetVerbs<
  SubsetsState,
  SubsetsUi,
  SubsetsDrawState,
  Slot,
  SubsetsMove
> = {
  geometry,
  primary: {
    does:
      "add it to that cell's set; again to rule it out, and a third time to leave " +
      "it undecided",
    apply: setSlot((t) =>
      t === "unknown" ? "known" : t === "known" ? "cleared" : "unknown",
    ),
  },
  secondary: {
    does: "rule it out of that cell's set, going round the other way",
    apply: setSlot((t) =>
      t === "unknown" ? "cleared" : t === "cleared" ? "known" : "unknown",
    ),
  },
  keyOnly: [
    {
      does: "leave the number under the cursor undecided",
      keys: [
        { codes: [BACKSPACE], name: "Backspace" },
        { codes: [DELETE], name: "Delete" },
      ],
      apply: setSlot(() => "unknown"),
    },
  ],
};

function executeMove(state: SubsetsState, move: SubsetsMove): SubsetsState {
  if (move.kind === "solve") {
    const next = cloneState(state);
    for (let i = 0; i < next.w * next.h; i++) {
      next.known[i] = move.known[i];
      next.mask[i] = move.mask[i];
    }
    // Deliberate divergence, per docs/games/solver-and-generator.md
    // § "Solve and the generator's aux": upstream's 'S' branch skips the
    // completion check and never sets `cheated`, leaving a solved board
    // "ongoing" for ever. The collection's solve move completes the game
    // (solved-with-help) and marks it cheated so the win flash doesn't fire.
    // Not byte-match surface: the desc differential never runs executeMove.
    if (subsetsValidate(next) === "complete") next.completed = true;
    next.cheated = next.completed;
    return next;
  }
  if (move.kind === "rule") {
    const { pos, value } = move;
    if (pos < 0 || pos >= state.w * state.h || value < 0 || value >= 1 << state.n)
      throw new Error("subsets: rule-out out of range");
    const next = cloneState(state);
    if (move.on) next.ruledOut[pos] |= 1 << value;
    else next.ruledOut[pos] &= ~(1 << value);
    return next;
  }
  // Before the range checks: a missing `pos` makes `pos < 0` and `pos >= n`
  // *both* false, so a foreign move would pass them as an unchanged board.
  if (move.kind !== "set") return assertNever(move, "subsets: executeMove");

  const { pos, bit } = move;
  if (pos < 0 || pos >= state.w * state.h)
    throw new Error("subsets: move position out of range");
  if (bit < 0 || bit >= state.n) throw new Error("subsets: move letter out of range");
  if (state.immutable[pos] & (1 << bit))
    throw new Error("subsets: cannot change a given slot");

  const next = cloneState(state);
  const b = 1 << bit;
  switch (move.type) {
    case "known":
      next.known[pos] |= b;
      next.mask[pos] |= b;
      break;
    case "cleared":
      next.known[pos] &= ~b;
      next.mask[pos] &= ~b;
      break;
    case "unknown":
      next.known[pos] &= ~b;
      next.mask[pos] |= b;
      break;
    default:
      return assertNever(move.type, "subsets: executeMove set");
  }

  if (subsetsValidate(next) === "complete") next.completed = true;
  return next;
}

function solve(orig: SubsetsState): SolveResult<SubsetsMove> {
  const { solved, result } = solveCopy(orig);
  if (result === "invalid") return { ok: false, error: "Puzzle is invalid." };
  // An unfinished solve still emits the partial deduction (upstream).
  return {
    ok: true,
    move: {
      kind: "solve",
      known: Array.from(solved.known),
      mask: Array.from(solved.mask),
    },
  };
}

// --- hint -------------------------------------------------------------------

const pointOf = (i: number, w: number): Point => ({ x: i % w, y: Math.floor(i / w) });

/** A rule-out step, read against `board`, the plan's board just before it. */
function ruleOutStep(board: SubsetsState, mark: RuleOutMark): HintStep<SubsetsMove> {
  const target = pointOf(mark.pos, board.w);
  const via = pointOf(mark.why.via, board.w);
  // The set ruled out is the action, boxed as such even where the neighbor
  // could hold it too.
  const sets = candidateSets(board, mark.why.via).filter((v) => v !== mark.value);
  const words = say.ruleOut(mark, board.n, target, via, sets);
  return {
    move: { kind: "rule", pos: mark.pos, value: mark.value, on: true },
    explanation: words.text,
    words,
  };
}

/** What leg `k` of a firing marks, every narration being *attention →
 * deduction → action*: the slot it decides (the action), a neighbor cell it
 * reasons from, the sets it counts in the tally (a collapse's surviving
 * candidates, or the placed set), and a hidden single's one home, spotlit as
 * the player-facing reference aid spotlights it. */
function legMarks(
  state: SubsetsState,
  d: SubsetsDeduction,
  exclusion: CollapseExclusion | null,
  k: number,
): LegMarks {
  const w = state.w;
  const pt = (i: number): Point => pointOf(i, w);
  const r = d.reason;
  // Arrows point at a neighbor *cell*; a placement points at the *set* in the
  // tally; a hidden single also *spotlights* where the set can go (its one
  // home). A collapse's lead outlines the excluded competitor's blocker cell,
  // so "the outlined cell" in the "why not …" clause has a referent; the legs
  // after it do not say that clause, so they do not draw its cell.
  const cells: number[] =
    r.kind === "arrowKnown"
      ? [r.to]
      : r.kind === "arrowMask"
        ? [r.from]
        : exclusion && k === 0
          ? [blockerCell(exclusion)]
          : [];
  const sets =
    r.kind === "hiddenSingle" ? [r.value] : r.kind === "collapse" ? r.survivors : [];
  const spotlight =
    r.kind === "hiddenSingle" ? candidateCells(state, r.value).map(pt) : [];
  return {
    slot: { ...pt(d.pos), bit: d.sets[k].bit },
    cells: cells.map(pt),
    sets,
    spotlight,
  };
}

/** The cell whose rule keeps a collapse's excluded competitor out. */
const blockerCell = (ex: CollapseExclusion): number =>
  ex.block.kind === "placed" ? ex.block.cell : ex.block.neighbor;

/**
 * A firing (one deduction deciding a cell's letters) becomes one sub-goal
 * journey: first the rule-outs it rests on that the board does not show, one
 * step each, then its letters, leg 0 leading with the why and the rest as
 * per-slot legs. A collapse's lead also gets a "why not X" clause. Every step
 * is read against `board`, the plan's board as that step is shown, which this
 * advances past the firing.
 */
function stepsForFiring(
  board: SubsetsState,
  d: SubsetsDeduction,
): HintStep<SubsetsMove>[] {
  const steps: HintStep<SubsetsMove>[] = [];
  for (const mark of d.marks) {
    steps.push(ruleOutStep(board, mark));
    board.ruledOut[mark.pos] |= 1 << mark.value;
  }
  const exclusion =
    d.reason.kind === "collapse"
      ? pickExclusion(board, d.pos, d.reason.survivors)
      : null;
  d.sets.forEach((set, k) => {
    const leg = say.leg(d, k, legMarks(board, d, exclusion, k));
    const words =
      k === 0 && exclusion
        ? phrase`${leg}${say.exclusion(exclusion, board.n, pointOf(blockerCell(exclusion), board.w))}`
        : leg;
    steps.push({
      move: { kind: "set", type: set.type, pos: d.pos, bit: set.bit },
      explanation: words.text,
      words,
    });
  });
  for (const set of d.sets) {
    const b = 1 << set.bit;
    board.known[d.pos] =
      set.type === "known" ? board.known[d.pos] | b : board.known[d.pos] & ~b;
    board.mask[d.pos] =
      set.type === "known" ? board.mask[d.pos] | b : board.mask[d.pos] & ~b;
  }
  return steps.map((step, k) => (k > 0 ? { ...step, continuesPrevious: true } : step));
}

function hint(state: SubsetsState): HintResult<SubsetsMove> {
  const refusal = commonHintRefusal(state.completed, findMistakes(state).length);
  if (refusal) return refusal;

  // A mark can be wrong without yet breaking a local rule (a letter the unique
  // solution excludes). The solution is derivable from the givens, so compare
  // and refuse honestly rather than hint on into a doomed position.
  const { solved, result } = solveCopy(state);
  if (result === "complete") {
    for (let i = 0; i < state.w * state.h; i++) {
      // `solved` reset non-givens and re-derived them; every letter the player
      // has decided (marked or cleared) must agree with the solution.
      const decided = state.known[i] | (ALL_BITS(state.n) & ~state.mask[i]);
      if ((state.known[i] ^ solved.known[i]) & decided)
        return { ok: false, error: CONTRADICTION_UNLOCALIZED };
    }
  }

  const plan = deduceHintPlan(state);
  if (plan.status === "invalid") return { ok: false, error: CONTRADICTION_UNLOCALIZED };
  if (plan.deductions.length === 0) {
    return { ok: false, error: DEDUCTION_EXHAUSTED };
  }

  const board = cloneState(state);
  const steps = plan.deductions.flatMap((d) => stepsForFiring(board, d));
  return { ok: true, steps };
}

/** A move completes the step iff it is exactly the hinted letter toggle
 * (position, letter and target tri-state all match) or the hinted rule-out;
 * anything else drops the plan to recompute. */
function hintKeepTrack(
  m: SubsetsMove,
  step: HintStep<SubsetsMove>,
  _state: SubsetsState,
): HintTrackVerdict {
  const s = step.move;
  if (m.kind === "set" && s.kind === "set")
    return m.pos === s.pos && m.bit === s.bit && m.type === s.type
      ? "completed"
      : "off";
  if (m.kind === "rule" && s.kind === "rule")
    return m.pos === s.pos && m.value === s.value && m.on === s.on
      ? "completed"
      : "off";
  return "off";
}

function flashLength(
  from: SubsetsState,
  to: SubsetsState,
  _dir: number,
  _ui: SubsetsUi,
): number {
  return winFlash(from, to, FLASH_TIME);
}

/** The cross-game difficulty contract: declaring it enrolls Subsets in the
 * shared cap-monotonicity and tier-reachability guards. `solveAtCap` rebuilds
 * the board from its desc — never from a live state — because
 * `subsetsSolveGame` resets and mutates what it is given. */
const difficulty: DifficultyContract<SubsetsParams> = {
  solveAtCap: (p, desc, cap) => {
    const result = subsetsSolveGame(newState(p, desc), cap);
    return result === "complete"
      ? "solved"
      : result === "invalid"
        ? "impossible"
        : "unsolved";
  },
};

export const subsetsGame: Game<
  SubsetsParams,
  SubsetsState,
  SubsetsMove,
  SubsetsUi,
  SubsetsDrawState,
  SubsetsMistake
> = {
  id: "subsets",
  // Touching the reference aid (tally / inspect icon / cursor) dismisses a
  // displayed hint, so the aid isn't suppressed by a still-active hint overlay.
  // Unconditional: Subsets' hint marks no square the player types into, so
  // there is no follow-by-hand flow to keep the explanation up for (contrast
  // Crossing, which answers per step).
  uiUpdateClearsHint: () => true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,

  // Upstream has no configure dialog: 4×4 over four letters is the only legal
  // board. The tier is the one axis this game *can* vary, so it is the whole
  // dialog.
  paramConfig: [difficultyItem(DIFF_NAMES, "diff")],

  newDesc: newSubsetsDesc,
  validateDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  status,
  notApplicable: {
    transposeParams:
      "There is one board, a square grid of the sixteen sets, so it is the same shape either way round.",
  },

  solve,
  difficulty,
  hint,
  hintMarks: {
    roles: {
      ring: "what the step decides: the one letter position it marks present or clears, which the sentence names by its letter, or, when it rules a whole set out of a cell, that cell and the set's entry in the tally.",
      outline:
        "what the step reasons from: the neighbor across a horseshoe, or the cell where a set is already placed, framed in a second color; and the sets it counts, such as the only ones that can still go in the cell, boxed in the tally in that color.",
      stripes:
        "the one cell a set still fits, when the sentence says the set can go nowhere else.",
    },
  },
  hintKeepTrack,
  findMistakes,
  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  flashLength,
};

registerGame(subsetsGame);
