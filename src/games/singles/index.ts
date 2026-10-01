/**
 * Singles (Hitori) — native TS port of `singles.c`. A grid of numbers in
 * which you blacken cells so that no number repeats among the remaining
 * (white) cells of any row or column, no two black cells are orthogonally
 * adjacent, and the white cells form one connected region. Left-click /
 * select toggles a cell black; right-click / select2 toggles a white mark
 * (circle); clicking a marked cell clears it. A click outside the grid
 * toggles the "show numbers on black squares" preference. Rule violations
 * are highlighted live; Check & Save additionally flags cells that
 * contradict the unique solution.
 */

import { assertNever, rejectMove } from "../../engine/assert-never.ts";
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
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { changedCells, trackTargets } from "../../engine/hint-track.ts";
import { CELL, type Narration } from "../../engine/hint-words.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { isMouseDown, newCursor, stripModifiers } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  interpretTargetVerbs,
  squareGrid,
  type TargetVerbs,
  verbGesture,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { newSinglesDesc } from "./generator.ts";
import { type Marked, say } from "./hint-text.ts";
import {
  border,
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SinglesDrawState,
} from "./render.ts";
import {
  CC_MARK_ERRORS,
  checkComplete,
  deduceHintPlan,
  type HintRecord,
  inGrid,
  OP_BLACK,
  type SinglesReason,
  solveSpecific,
} from "./solver.ts";
import {
  type CellValue,
  cloneState,
  DIFF_ANY,
  decodeParams,
  defaultParams,
  encodeParams,
  F_BLACK,
  F_CIRCLE,
  makeState,
  newState,
  paramConfig,
  type SinglesMove,
  type SinglesParams,
  type SinglesState,
  type SinglesUi,
  status,
  textFormat,
  validateDesc,
} from "./state.ts";

/** A cell whose mark contradicts the unique solution (Check & Save). */
export type SinglesMistake = Point;

const PRESET_SIZES = [5, 6, 8, 10, 12];

function presets(): PresetMenu<SinglesParams> {
  const submenu: PresetMenu<SinglesParams>[] = [];
  for (const d of PRESET_SIZES) {
    for (const diff of ["easy", "tricky"] as const) {
      submenu.push({ params: { w: d, h: d, diff } });
    }
  }
  return { title: "Singles", submenu };
}

function newUi(_state: SinglesState): SinglesUi {
  return { cursor: newCursor(), showBlackNums: false };
}

function changedState(
  ui: SinglesUi,
  oldState: SinglesState | null,
  newSt: SinglesState,
): void {
  if (oldState && !oldState.completed && newSt.completed) ui.cursor.visible = false;
}

/** Black out or circle square `{ x, y }`; either clears a square that is
 * already one or the other. */
function mark(value: "black" | "circle") {
  return (state: SinglesState, { x, y }: Point): SinglesMove => {
    const filled = state.flags[y * state.w + x] & (F_BLACK | F_CIRCLE);
    return { sets: [{ x, y, value: filled ? "empty" : value }] };
  };
}

const geometry = squareGrid<SinglesState, SinglesDrawState>({
  size: (s) => s,
  border,
  wrap: true,
});

const targetVerbs: TargetVerbs<
  SinglesState,
  SinglesUi,
  SinglesDrawState,
  Point,
  SinglesMove
> = {
  geometry,
  primary: { does: "black it out", apply: mark("black") },
  secondary: {
    does: "circle it, marking a square you are sure should not be blacked out",
    apply: mark("circle"),
  },
};

function interpretMove(
  state: SinglesState,
  ui: SinglesUi,
  ds: SinglesDrawState,
  p: Point,
  rawButton: number,
): SinglesMove | null | UiUpdate {
  // Any press outside the grid flips the "numbers on black squares" setting.
  if (
    isMouseDown(stripModifiers(rawButton)) &&
    geometry.pointerTarget(state, ds, p, ui) === null
  ) {
    ui.cursor.visible = false;
    ui.showBlackNums = !ui.showBlackNums;
    return UI_UPDATE;
  }
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

function executeMove(state: SinglesState, move: SinglesMove): SinglesState {
  // A move is a list of cell settings, not a union, so there is no discriminant
  // to narrow to `never`: check the one field the dispatch reads.
  if (!Array.isArray(move.sets)) rejectMove(move, "singles: executeMove");

  const next = cloneState(state);
  for (const { x, y, value } of move.sets) {
    if (!inGrid(next, x, y)) throw new Error("singles move out of bounds");
    const i = y * next.w + x;
    next.flags[i] &= ~(F_BLACK | F_CIRCLE);
    // `value` *is* a union, so an unrecognized one is rejected rather than
    // read as "empty".
    if (value === "black") next.flags[i] |= F_BLACK;
    else if (value === "circle") next.flags[i] |= F_CIRCLE;
    else if (value !== "empty") assertNever(value, `singles: executeMove (${x},${y})`);
  }
  if (move.solve) next.cheated = true;
  if (checkComplete(next, CC_MARK_ERRORS)) next.completed = true;
  return next;
}

/** The mark a player has put on cell `i`. */
function cellValue(s: SinglesState, i: number): CellValue {
  const f = s.flags[i];
  return f & F_BLACK ? "black" : f & F_CIRCLE ? "circle" : "empty";
}

/** The B/C/E diff between two states (upstream game_state_diff). */
function diffMove(src: SinglesState, dst: SinglesState): SinglesMove {
  const sets: SinglesMove["sets"] = [];
  for (let x = 0; x < dst.w; x++) {
    for (let y = 0; y < dst.h; y++) {
      const value = cellValue(dst, y * dst.w + x);
      if (cellValue(src, y * dst.w + x) !== value) sets.push({ x, y, value });
    }
  }
  return { sets, solve: true };
}

function solve(orig: SinglesState, curr: SinglesState): SolveResult<SinglesMove> {
  let solved = cloneState(curr);
  if (solveSpecific(solved, DIFF_ANY, false) > 0) {
    return { ok: true, move: diffMove(curr, solved) };
  }
  solved = cloneState(orig);
  if (solveSpecific(solved, DIFF_ANY, false) > 0) {
    return { ok: true, move: diffMove(curr, solved) };
  }
  return { ok: false, error: PUZZLE_NOT_REASONABLE };
}

function findMistakes(state: SinglesState): readonly SinglesMistake[] {
  const solved = makeState(state.w, state.h, state.nums);
  if (solveSpecific(solved, DIFF_ANY, false) <= 0) return [];
  const out: SinglesMistake[] = [];
  for (let i = 0; i < state.n; i++) {
    const pv = state.flags[i] & (F_BLACK | F_CIRCLE);
    if (!pv) continue; // undecided cells are never mistakes
    const sv = solved.flags[i] & (F_BLACK | F_CIRCLE);
    if (pv !== sv) out.push({ x: i % state.w, y: (i / state.w) | 0 });
  }
  return out;
}

// --- hint ------------------------------------------------------------------

/** Highlight data for a Singles hint step. `targets` are the cell(s) the
 * displayed deduction forces, each with the mark it forces; a firing that
 * forces several cells at once carries them all. `strand` is the distinct
 * corner cell a 2×2-corner deduction is protecting from being sealed off —
 * among the outlined cells, `redraw` draws it in its own color so the player
 * can tell the corner at risk apart from the matching numbers that share a
 * value. */
export interface SinglesHint {
  targets: { x: number; y: number; value: "black" | "circle" }[];
  strand: Point[];
}

/** What a step's sentence names. `evidence` are the deduction's premise
 * cells — `redraw` outlines an undecided one in the evidence color and a
 * decided black/circle cell, whose state *is* the reason, in that state's own
 * color. `line` is the row or column the sentence names ("in the line",
 * "shares a line with"), hatched; empty when it names none
 * (docs/games/hints.md § "Hatch the line the sentence names"). */
interface Named {
  targets: readonly Point[];
  evidence: Point[];
  strand: Point[];
  line: Point[];
}

/** The line two distinct cells share: a row when they share `y`, else a
 * column. */
function sharedLine(a: Point, b: Point, w: number, h: number): Point[] {
  if (a.y === b.y) return Array.from({ length: w }, (_, x) => ({ x, y: a.y }));
  return Array.from({ length: h }, (_, y) => ({ x: a.x, y }));
}

/** The one line a reason's sentence names, from the cells it names together. */
function namedLine(
  reason: SinglesReason,
  targets: readonly Point[],
  w: number,
  h: number,
): Point[] {
  if (reason.kind === "pair") return sharedLine(reason.pair[0], reason.pair[1], w, h);
  if (reason.kind === "sameLine") {
    // The circled cell rules its number out along its row and its column, so a
    // step's targets can lie in both: then the sentence names two lines, and a
    // hatch means one.
    const { circled } = reason;
    if (targets.every((t) => t.y === circled.y))
      return sharedLine(circled, targets[0], w, h);
    if (targets.every((t) => t.x === circled.x))
      return sharedLine(circled, targets[0], w, h);
  }
  return [];
}

const opValue = (op: number): "black" | "circle" =>
  op === OP_BLACK ? "black" : "circle";

const sameCell = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;

/** Narrate *why* the grouped firing forces its cell(s), naming the marks in
 * `named` and reading each number the sentence names off the board. The words
 * are [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(reason: SinglesReason, named: Named, state: SinglesState): Narration {
  const numAt = (c: Point): number => state.nums[c.y * state.w + c.x];
  const m: Marked = {
    targets: named.targets.map(({ x, y }) => ({ x, y })),
    evidence: named.evidence,
    strand: named.strand,
    line: named.line,
    num: numAt,
  };
  const targets = m.targets;
  switch (reason.kind) {
    case "sandwich":
      return say.sandwich(m, numAt(reason.ends[0]));
    case "pair":
      return say.pair(m, numAt(reason.pair[0]));
    case "corner4": {
      const [corner, side1, side2, inner] = reason.block;
      return say.corner4(m, numAt(corner), corner, [side1, side2], inner);
    }
    case "corner3": {
      // Branch A shades the corner itself; branch B the inner cell, to save
      // the (separately outlined) corner.
      const n = numAt(reason.matched[1]);
      const t = numAt(targets[0]);
      return targets.some((tg) => sameCell(tg, reason.corner))
        ? say.corner3Corner(m, t, n)
        : say.corner3Inner(m, t, n, numAt(reason.corner));
    }
    case "corner2": {
      const { corner, pair } = reason;
      const side = pair.find(
        (p) => Math.abs(p.x - corner.x) + Math.abs(p.y - corner.y) === 1,
      );
      if (!side) throw new Error("corner2: the pair has no square beside the corner");
      return say.corner2(m, pair, side, numAt(pair[0]), numAt(corner));
    }
    case "offset": {
      // quad = [A1, B1, A2, B2]: the A-pair shares one line, the B-pair the next.
      const [a1, b1, a2, b2] = reason.quad;
      return say.offset(
        m,
        [a1, a2],
        [b1, b2],
        numAt(a1),
        numAt(b1),
        a1.x === a2.x ? "column" : "row",
      );
    }
    case "adjBlack":
      return say.adjBlack(m);
    case "sameLine":
      return say.sameLine(m, numAt(targets[0]));
    case "boxedIn":
      return say.boxedIn(m, numAt(targets[0]));
    case "split":
      return say.split(m, numAt(targets[0]));
  }
}

/** The premise cells a reason reasons over (its visible evidence — the
 * cells that share a number, or the decided cell whose state is the
 * reason). The `strand` corner, when present, is surfaced separately. */
function evidenceOf(reason: SinglesReason): Point[] {
  switch (reason.kind) {
    case "sandwich":
      return reason.ends;
    case "pair":
      return reason.pair;
    case "corner4":
      return reason.block;
    case "corner3":
      return reason.matched;
    case "corner2":
      return reason.pair;
    case "offset":
      return reason.quad;
    case "adjBlack":
      return [reason.black];
    case "sameLine":
      return [reason.circled];
    case "boxedIn":
      return [reason.cell];
    case "split":
      return reason.neighbors;
  }
}

/** The corner cell a 2×2-corner deduction is protecting (drawn in the
 * distinct strand color), if any. */
function strandOf(reason: SinglesReason): Point[] {
  return reason.kind === "corner2" || reason.kind === "corner3" ? [reason.corner] : [];
}

/** Group the ordered records by firing (`group`) into one step each. A
 * firing's records are contiguous, so first-seen order keeps the plan's. */
function groupRecords(records: HintRecord[]): HintRecord[][] {
  const groups = new Map<number, HintRecord[]>();
  for (const r of records) {
    const g = groups.get(r.group);
    if (g) g.push(r);
    else groups.set(r.group, [r]);
  }
  return [...groups.values()];
}

function hint(state: SinglesState): HintResult<SinglesMove, SinglesHint> {
  const records = deduceHintPlan(state);
  if (records.length === 0) {
    return { ok: false, error: DEDUCTION_EXHAUSTED };
  }
  const key = (c: Point): number => c.y * state.w + c.x;
  const steps: HintStep<SinglesMove, SinglesHint>[] = groupRecords(records).map(
    (group) => {
      const reason = group[0].reason;
      const targets = group.map((r) => ({ x: r.x, y: r.y, value: opValue(r.op) }));
      const targetKey = new Set(targets.map(key));
      // The protected corner is drawn in its own color; keep it out of
      // both the targets and the matching-number evidence.
      const strand = strandOf(reason).filter((c) => !targetKey.has(key(c)));
      const strandKey = new Set(strand.map(key));
      const evidence = evidenceOf(reason).filter(
        (c) => !targetKey.has(key(c)) && !strandKey.has(key(c)),
      );
      const line = namedLine(reason, targets, state.w, state.h);
      const words = narrate(reason, { targets, evidence, strand, line }, state);
      return {
        move: { sets: targets.map((t) => ({ ...t })) },
        explanation: words.text,
        words,
        highlights: { targets, strand },
      };
    },
  );
  return { ok: true, steps };
}

/** Classify a player move by what it did to the board
 * (`engine/hint-track.ts`); a multi-cell step shrinks in place to the cells
 * still outstanding. */
function hintKeepTrack(
  m: SinglesMove,
  step: HintStep<SinglesMove, SinglesHint>,
  state: SinglesState,
): HintTrackVerdict {
  const hl = step.highlights;
  if (m.solve || !hl) return "off";
  const after = executeMove(state, m);
  const index = (c: Point): number => c.y * state.w + c.x;
  const { verdict, left } = trackTargets({
    targets: hl.targets,
    changes: changedCells(
      state.flags.length,
      (i) => cellValue(state, i),
      (i) => cellValue(after, i),
    ),
    key: (t) => index(t),
    want: (t): CellValue => t.value,
    holds: (t) => cellValue(after, index(t)) === t.value,
  });
  if (verdict === "onTrack") {
    step.move = { sets: left.map((t) => ({ ...t })) };
    step.highlights = { ...hl, targets: left };
    if (step.words) {
      const kept = new Set(left.map((t) => CELL.key(t)));
      step.words = step.words.narrow(
        (role, kind, key) => role !== "ring" || kind !== CELL.name || kept.has(key),
      );
      step.explanation = step.words.text;
    }
  }
  return verdict;
}

/** Singles' difficulty contract (`engine/difficulty.ts`). `solveSpecific`
 * returns > 0 when it solves; `newState` builds the board from the desc
 * alone, so no player mark reaches the verdict. `sneaky` is off — that is a
 * generator-side pre-pass, not a tier. */
const difficulty: DifficultyContract<SinglesParams> = {
  solveAtCap: (p, desc, cap) =>
    solveSpecific(newState(p, desc), cap, false) > 0 ? "solved" : "unsolved",
};

export const singlesGame: Game<
  SinglesParams,
  SinglesState,
  SinglesMove,
  SinglesUi,
  SinglesDrawState,
  SinglesMistake,
  SinglesHint
> = {
  id: "singles",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newSinglesDesc,
  validateDesc,
  newState,
  newUi,
  changedState,

  interpretMove,
  targetVerbs,
  executeMove,
  status,

  solve,
  difficulty,
  hint,
  hintMarks: {
    roles: {
      ring: "the square the step decides. It is drawn empty: the sentence says whether to shade it or circle it.",
      outline:
        "the squares the step reasons from, such as two matching numbers one square apart. One you have already shaded or circled is outlined in a color of its own, one for shaded and another for circled, and the corner a step keeps from being boxed in has a color of its own too.",
      stripes: 'the row or column the sentence calls "this row" or "this column".',
    },
  },
  hintKeepTrack,
  hintGesture: (s, ui, ds, m) =>
    m.sets.flatMap((t) =>
      verbGesture(
        targetVerbs,
        s,
        ds,
        ui,
        [t],
        t.value === "black" ? "primary" : "secondary",
      ),
    ),
  findMistakes,

  textFormat,

  prefs: [
    {
      kw: "show-black-nums",
      name: "Show numbers on black squares",
      type: "boolean",
      get: (ui) => ui.showBlackNums,
      set: (ui, v) => {
        ui.showBlackNums = v;
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

registerGame(singlesGame);
