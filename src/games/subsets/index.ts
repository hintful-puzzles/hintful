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

import { fromCoord } from "../../engine/board/geometry.ts";
import { assertNever } from "../../engine/contract/assert-never.ts";
import {
  type DifficultyContract,
  difficultyItem,
} from "../../engine/contract/difficulty.ts";
import {
  type Game,
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  type MoveVerdict,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/contract/game.ts";
import {
  CONTRADICTION_UNLOCALIZED,
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/contract/hint-refusal.ts";
import {
  CELL,
  type MarkKind,
  type Sentence,
  so,
} from "../../engine/contract/hint-words.ts";
import { NO_SOLUTION } from "../../engine/contract/solve-failure.ts";
import type { GameStatus, Point } from "../../engine/contract/types.ts";
import { click, type PointerAction } from "../../engine/hint-gesture.ts";
import { judgeWalked } from "../../engine/move-judge.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  cursorDelta,
  isEraseKey,
  LEFT_BUTTON,
  newCursor,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { statedParts } from "../../engine/stated.ts";
import {
  ERASE_KEYS,
  interpretTargetVerbs,
  rulingOut,
  type TargetGeometry,
  type TargetVerbs,
  verbGesture,
} from "../../engine/target-verb.ts";
import * as subsets from "../../generated/games/subsets/subsets.compiled.ts";
import { newSubsetsDesc } from "./generator.ts";
import { SLOT, TALLY_SET } from "./hint-marks.ts";
import {
  colors,
  computeSize,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SubsetsDrawState,
} from "./render.ts";
import {
  bitList,
  boardMarks,
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
  ADJTHAN,
  CELL_HEIGHT,
  CELL_WIDTH,
  cloneState,
  DIFF_NAMES,
  decodeParams,
  defaultParams,
  encodeParams,
  menu,
  newState,
  type SubsetsMistake,
  type SubsetsMove,
  type SubsetsParams,
  type SubsetsState,
  type SubsetsUi,
  textFormat,
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

/** A point inside cell `pos`'s inspect icon: {@link iconHit}'s inverse. */
function iconPoint(pos: number, w: number, ts: number): Point {
  const bx = ((pos % w) * (CELL_WIDTH + 1) + 0.5) * ts;
  const by = (Math.floor(pos / w) * (CELL_HEIGHT + 1) + 0.5) * ts;
  return { x: Math.floor(bx + ts * 0.35), y: Math.floor(by - ts * 0.3) };
}

/** The middle of tally entry `value`: {@link tallyHit}'s inverse. */
function tallyPoint(value: number, h: number, ts: number): Point {
  const x = Math.floor(value / h);
  const y = value % h;
  return {
    x: x * (CELL_WIDTH + 1) * ts + Math.floor(CELL_WIDTH * ts * 0.75),
    y: Math.floor(y * 0.75 * ts) + (h + 2) * CELL_HEIGHT * ts,
  };
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
    // The board is inset by half a tile.
    const border = Math.floor(ts / 2);
    return slotAt(s, fromCoord(p.x, ts, border), fromCoord(p.y, ts, border));
  },
  pointAt(_s, ds, slot) {
    const ts = ds.tileSize;
    const half = Math.floor(ts / 2);
    return { x: half + slot.gx * ts + half, y: half + slot.gy * ts + half };
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
  sweep: {
    holds: (s, { pos, num }) =>
      s.known[pos] & (1 << num)
        ? "known"
        : s.mask[pos] & (1 << num)
          ? "unknown"
          : "cleared",
  },
  secondary: rulingOut({
    does: "rule it out of that cell's set, going round the other way",
    apply: setSlot((t) =>
      t === "unknown" ? "cleared" : t === "cleared" ? "known" : "unknown",
    ),
  }),
  keyOnly: [
    {
      does: "leave the letter under the cursor undecided",
      keys: ERASE_KEYS,
      apply: setSlot(() => "unknown"),
      pointer: { kind: "cycle", button: "primary" },
    },
  ],
};

/** A letter decided against the answer is undecided again, and a rule-out of
 * the answer's set taken off. A broken rule always holds one of those where
 * the answer is known, so only where it is not are the letters of every cell
 * a broken rule names undecided whole. */
function clearMistakes(
  state: SubsetsState,
  mistakes: readonly SubsetsMistake[],
): SubsetsMove[] {
  const unknown = (pos: number, bit: number): SubsetsMove => ({
    kind: "set",
    type: "unknown",
    pos,
    bit,
  });
  const byAnswer = mistakes.flatMap((m): SubsetsMove[] => {
    if (m.kind === "letter") return [unknown(m.pos, m.bit)];
    if (m.kind === "ruled")
      return [{ kind: "rule", pos: m.pos, value: m.value, on: false }];
    return [];
  });
  if (byAnswer.length > 0) return byAnswer;
  const cells = new Set<number>();
  for (const m of mistakes) {
    if (m.kind === "cell") cells.add(m.pos);
    else if (m.kind === "edge") {
      const { dx, dy } = ADJTHAN[m.dir];
      cells.add(m.pos);
      cells.add(m.pos + dy * state.w + dx);
    }
  }
  return [...cells]
    .filter((pos) => state.immutable[pos] === 0)
    .flatMap((pos) => Array.from({ length: state.n }, (_, bit) => unknown(pos, bit)));
}

function executeMove(state: SubsetsState, move: SubsetsMove): SubsetsState {
  if (move.kind === "solve") {
    const next = cloneState(state);
    for (let i = 0; i < next.w * next.h; i++) {
      next.known[i] = move.known[i];
      next.mask[i] = move.mask[i];
    }
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

  return next;
}

/** Solved exactly while every cell is decided and every relation holds. */
function status(s: SubsetsState): GameStatus {
  return subsetsValidate(s) === "complete" ? "solved" : "ongoing";
}

function solve(orig: SubsetsState): SolveResult<SubsetsMove> {
  const { solved, result } = solveCopy(orig);
  if (result === "invalid") return { ok: false, error: NO_SOLUTION };
  // The midend takes a Solve move only if it leaves the board solved, and
  // upstream's partial fill does not.
  if (result === "unfinished") return { ok: false, error: PUZZLE_NOT_REASONABLE };
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

/** Every rung a Subsets step can be: a rule-out a firing rests on, which is a
 * deduction of its own across a horseshoe, and the kinds of `SubsetsReason`
 * for the firing's letters. */
const SUBSETS_RUNGS = [
  "ruleOut",
  "arrowKnown",
  "arrowMask",
  "hiddenSingle",
  "collapse",
] as const;
type SubsetsRung = (typeof SUBSETS_RUNGS)[number];
type Step = HintStep<SubsetsMove, unknown, SubsetsRung>;

/** A set as the tally draws it, "{A,C}", or "the empty set". */
const setLabel = (value: number, n: number): string => {
  const letters = bitList(value, n).map((b) => LETTERS[b]);
  return letters.length ? `{${letters.join(",")}}` : "the empty set";
};

const LETTERS = ["A", "B", "C", "D"] as const;

/** What a step marks: a cell, a letter's slot in one (a point with its
 * letter), or a set in the tally. */
type Marked = Point | number;

/** The steps of `subsets.description.yaml`, spoken: a mark is drawn on a cell
 * unless its sort says otherwise, and a value is a set. */
const speak = (n: number) =>
  subsets.voice<Marked>({
    kind: CELL as MarkKind<Marked>,
    kinds: {
      slot: SLOT as MarkKind<Marked>,
      sets: TALLY_SET as MarkKind<Marked>,
    },
    value: (v) => setLabel(v, n),
  });

/** The tally's sets, as the stated sentence draws a term: its elements are
 * the sets' values, which a context over cells holds only as its own type. */
const OPEN_SET = TALLY_SET as unknown as MarkKind<Point>;

/** A rule-out step, read against `board`, the plan's board just before it, in
 * the `rel.support` kind's words. The horseshoe needs a strictly smaller set
 * at its subset end and a strictly bigger one at its superset end (the help
 * teaches why), so a set with no such partner among the outlined sets, which
 * are what the neighbor can still hold, cannot go here. */
function ruleOutStep(board: SubsetsState, rule: RuleOutMark): Step {
  const { n, w } = board;
  const target = pointOf(rule.pos, w);
  // The set ruled out is the action, boxed as such even where the neighbor
  // could hold it too.
  const sets = candidateSets(board, rule.why.via).filter((v) => v !== rule.value);
  const { look } = statedParts(
    subsets.STATED[rule.why.head ? "bigger" : "smaller"].step[0],
    {
      kind: CELL,
      at: (i): Point => pointOf(i, w),
      termKinds: { open: OPEN_SET },
      termAt: { open: (v) => v as unknown as Point },
      ring: [],
      marks: { stripes: [target] },
      terms: { partner: rule.why.via, open: sets },
      value: (v) => setLabel(v, n),
      struck: [rule.value],
    },
  );
  if (look === undefined) throw new Error("rel.support states no look");
  const words = so({
    look,
    move: speak(n).part("ruledOut", "move", {
      ring: [rule.value],
      terms: { set: rule.value },
    }),
  });
  return {
    move: { kind: "rule", pos: rule.pos, value: rule.value, on: true },
    rung: "ruleOut",
    explanation: words.text,
    words,
  };
}

/** Leg `k` of firing `d`, every narration being *attention → deduction →
 * action*: it rings the slot it decides and stripes the cell it fills, a
 * hidden single's one home as the reference aid spotlights it; an arrow
 * outlines the neighbor it reasons from, a placement the sets in the tally
 * that fit, and a collapse's lead the cell where its example set is placed. */
function legSentence(
  board: SubsetsState,
  d: SubsetsDeduction,
  k: number,
  exclusion: CollapseExclusion | null,
): Sentence {
  const pt = (i: number): Point => pointOf(i, board.w);
  const r = d.reason;
  const set = d.sets[k];
  const said = {
    ring: [{ ...pt(d.pos), bit: set.bit }],
    later: k > 0,
  };
  const terms = { letter: LETTERS[set.bit], known: set.type === "known" };
  const here = (cells: readonly number[]) => ({ here: cells.map(pt) });
  const voice = speak(board.n);
  switch (r.kind) {
    case "arrowKnown":
    case "arrowMask":
      return voice.sentence(r.kind, {
        ...said,
        terms,
        marks: {
          outline: { neighbor: [pt(r.kind === "arrowKnown" ? r.to : r.from)] },
          stripes: here([d.pos]),
        },
      });
    case "hiddenSingle": {
      const homes = candidateCells(board, r.value);
      return voice.sentence(r.kind, {
        ...said,
        terms,
        marks: {
          outline: { sets: [r.value] },
          stripes: here(homes.length ? homes : [d.pos]),
        },
      });
    }
    case "collapse": {
      // The example is said on the lead leg only, so only it outlines the
      // example's cell.
      const example = k === 0 ? exclusion : null;
      return voice.sentence(r.kind, {
        ...said,
        terms: { ...terms, plural: r.survivors.length > 1, set: example?.value ?? 0 },
        marks: {
          outline: { sets: r.survivors, blocker: example ? [pt(example.cell)] : [] },
          stripes: here([d.pos]),
        },
      });
    }
  }
}

/**
 * A firing (one deduction deciding a cell's letters) becomes one sub-goal
 * journey: first the rule-outs it rests on that the board does not show, one
 * step each, then its letters, leg 0 leading with the why and the rest as
 * per-slot legs. A collapse's lead also gives an example of a set that cannot
 * go there. Every step is read against `board`, the plan's board as that step
 * is shown, which this advances past the firing.
 */
function stepsForFiring(board: SubsetsState, d: SubsetsDeduction): Step[] {
  const steps: Step[] = [];
  for (const rule of d.marks) {
    steps.push(ruleOutStep(board, rule));
    board.ruledOut[rule.pos] |= 1 << rule.value;
  }
  const exclusion =
    d.reason.kind === "collapse"
      ? pickExclusion(board, d.pos, d.reason.survivors)
      : null;
  d.sets.forEach((set, k) => {
    const words = legSentence(board, d, k, exclusion);
    steps.push({
      move: { kind: "set", type: set.type, pos: d.pos, bit: set.bit },
      rung: d.reason.kind,
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

function hint(state: SubsetsState): HintResult<SubsetsMove, unknown, SubsetsRung> {
  const plan = deduceHintPlan(state);
  if (plan.status === "invalid") return { ok: false, error: CONTRADICTION_UNLOCALIZED };
  if (plan.deductions.length === 0) {
    return { ok: false, error: DEDUCTION_EXHAUSTED };
  }

  const board = cloneState(state);
  const steps = plan.deductions.flatMap((d) => stepsForFiring(board, d));
  return { ok: true, steps };
}

/** What Check & save says of the last move: a letter or a rule-out the
 * player marked. */
function judgeMove(before: SubsetsState, after: SubsetsState): MoveVerdict | null {
  return judgeWalked(before, after, boardMarks, (judging) => {
    deduceHintPlan(before, undefined, judging);
  });
}

/** A move completes the step iff it is exactly the hinted letter toggle
 * (position, letter and target tri-state all match) or the hinted rule-out;
 * anything else drops the plan to recompute. */
function hintKeepTrack(
  m: SubsetsMove,
  step: Step,
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

/** A letter is a press on its slot, by whichever button's cycle reaches the
 * step's type in one press. A rule-out is a press on the tally entry with the
 * cell in focus, which its inspect icon gives it; the focus the player had is
 * put back after. */
function hintGesture(
  s: SubsetsState,
  ui: SubsetsUi,
  ds: SubsetsDrawState,
  m: SubsetsMove,
): PointerAction[] {
  const ts = ds.tileSize;
  if (m.kind === "set") {
    const cellx = m.pos % s.w;
    const celly = Math.floor(m.pos / s.w);
    const slot = slotAt(
      s,
      cellx * (CELL_WIDTH + 1) + (m.bit % CELL_WIDTH),
      celly * (CELL_HEIGHT + 1) + Math.floor(m.bit / CELL_WIDTH),
    );
    if (slot === null) throw new Error(`subsets: no slot for ${JSON.stringify(m)}`);
    const left = targetVerbs.primary.apply(s, slot, ui);
    const reaches =
      typeof left === "object" && left?.kind === "set" && left.type === m.type;
    return verbGesture(
      targetVerbs,
      s,
      ds,
      ui,
      [slot],
      reaches ? "primary" : "secondary",
    );
  }
  if (m.kind !== "rule") throw new Error("subsets: a hint never solves");
  const before = ui.highlightCell;
  const out: PointerAction[] = [];
  if (before !== m.pos) out.push(click(iconPoint(m.pos, s.w, ts)));
  out.push(click(tallyPoint(m.value, s.h, ts)));
  if (before === m.pos) return out;
  // The icon of the cell in focus before, or this one's again to clear it; a
  // tally set in the spotlight comes back with a press on it.
  out.push(click(iconPoint(before ?? m.pos, s.w, ts)));
  if (ui.highlightSet !== null) out.push(click(tallyPoint(ui.highlightSet, s.h, ts)));
  return out;
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
  SubsetsMistake,
  unknown,
  SubsetsRung
> = {
  id: "subsets",
  hint: {
    // Touching the reference aid (tally / inspect icon / cursor) dismisses a
    // displayed hint, so the aid isn't suppressed by a still-active hint overlay.
    // Except on a rule-out step: following it by hand starts with the inspect
    // icon, which puts its cell in focus for the tally press that makes it.
    uiUpdateClears: (step) => step.move.kind !== "rule",
    plan: hint,
    judgeMove,
    rungs: SUBSETS_RUNGS,
    marks: {
      roles: {
        ring: "what the step decides: the one letter position it marks present or clears, which the sentence names by its letter, or, when it rules a whole set out of a cell, that cell and the set's entry in the tally.",
        outline:
          "what the step reasons from: the neighbor across a horseshoe, or the cell where a set is already placed, framed in a second color; and the sets it counts, such as the only ones that can still go in the cell, boxed in the tally in that color.",
        stripes:
          "the one cell a set still fits, when the sentence says the set can go nowhere else.",
      },
    },
    keepTrack: hintKeepTrack,
    gesture: hintGesture,
  },

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,

  // Upstream has no configure dialog: 4×4 over four letters is the only legal
  // board. The tier is the one axis this game *can* vary, so it is the whole
  // dialog.
  paramConfig: [difficultyItem(DIFF_NAMES, "diff")],

  newDesc: newSubsetsDesc,
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
  findMistakes,
  clearMistakes,
  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(subsetsGame);
