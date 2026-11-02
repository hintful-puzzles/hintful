/**
 * Sticks' solver: the ladder `sticks.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`), the answer check
 * its rules compile to, and the search beneath the ladder.
 *
 * Every technique is upstream's one (`sticks_try`): suppose a line in a blank
 * square and see a number broken at once, so the square's line runs the other
 * way. The description states each way a number breaks as its own technique,
 * a `with` premise read on the marks with nothing propagated: a block with
 * too many lines or too few open sides, a line too long, a line carrying two
 * numbers, and a line left no room to reach its number.
 *
 * Beneath the ladder, a search by trial and error over it
 * ({@link searchAnswers}) counts a board's answers. It is what an
 * Unreasonable board is dealt by, and what Solve and the mistake check know
 * the answer from at either tier. The hint never runs it.
 *
 * The live error overlay ({@link findLiveErrors}) stays the game's own: it
 * judges a board still being filled, which no rule of the answer says.
 */
import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import {
  clueAt,
  clueList,
  describedSpace,
  type GridSpace,
  stretch,
} from "../../engine/describe-runtime.ts";
import { Dsf } from "../../engine/dsf.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  ladderWalk,
  runLadder,
  type Taken,
  TIERS,
} from "../../engine/ladder-runtime.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import {
  F_BLOCK,
  F_HOR,
  F_VER,
  type SticksLine,
  type SticksMistake,
  type SticksState,
} from "./state.ts";
import * as sticks from "./sticks.compiled.ts";

/** What the description reads a square as holding: a line across, a line up
 * and down, or a block. */
const ACROSS = 1;
const DOWN = 2;
const BLOCK = 3;

/** A board as its blocks, lines and numbers: a state, or a board being dealt. */
interface Board {
  w: number;
  h: number;
  grid: Uint8Array;
  numbers: Int16Array;
}

/**
 * *Why* a square's line cannot run one way: the number the supposed line
 * would break, its value, and the cells the argument reasons over, which are
 * the hint's evidence area, so the picture cannot disagree with the words.
 * One variant a technique.
 */
export type SticksReason =
  /** The number's line would run longer than it. */
  | { kind: "tooLong"; clue: number; value: number; size: number; segment: number[] }
  /** The number's line could no longer stretch far enough to reach it. */
  | { kind: "unreachable"; clue: number; value: number; max: number; span: number[] }
  /** One line would carry two numbers. */
  | { kind: "twoClues"; clues: number[]; segment: number[] }
  /** A block would gain more lines than it counts. */
  | { kind: "overConnected"; clue: number; value: number; lines: number[] }
  /**
   * A block would lose a side it still needed a line from. `open` is every
   * side a line could still reach it from once the square is closed: one
   * already carrying a line counts, an off-board or block side does not.
   */
  | { kind: "starved"; clue: number; value: number; open: number[] };

/** One forced square with the reason that forces it. */
export interface SticksFiring {
  index: number;
  to: Exclude<SticksLine, "none">;
  reason: SticksReason;
}

/** The values the description reads off a grid of flag bytes. */
function valuesOf(grid: Uint8Array): Uint8Array {
  return grid.map((cell) =>
    cell & F_BLOCK ? BLOCK : cell & F_HOR ? ACROSS : cell & F_VER ? DOWN : 0,
  );
}

/** The board as the description deals it: its blocks, the numbers on its
 * lines and the numbers on its blocks. */
function dealtOf({ w, h, grid, numbers }: Board): sticks.Dealt {
  const blocks: number[] = [];
  const lengths: number[] = [];
  const lengthValues: number[] = [];
  const joins: number[] = [];
  const joinValues: number[] = [];
  for (let c = 0; c < w * h; c++) {
    const block = (grid[c] & F_BLOCK) !== 0;
    if (block) blocks.push(c);
    if (numbers[c] === -1) continue;
    (block ? joins : lengths).push(c);
    (block ? joinValues : lengthValues).push(numbers[c]);
  }
  return {
    block: clueList(blocks, new Array<number>(blocks.length).fill(0), w * h),
    length: clueList(lengths, lengthValues, w * h),
    joins: clueList(joins, joinValues, w * h),
  };
}

/** The space a board's ladder runs on. */
function sticksSpace(w: number, h: number): GridSpace {
  return describedSpace(sticks.units, w, h);
}

/** The marks over `values`, every blank square open both ways. */
function sticksMarks(sp: GridSpace, dl: sticks.Dealt, values: Uint8Array): CellMarks {
  const m = new CellMarks(sp, ~0, values);
  // A square holds a line or a block, never both, so the seed cannot clash.
  m.seed(values, (c) => sticks.domainOf(sp, dl, c));
  return m;
}

/** The value square `x` holds with `c` supposed to hold `a`. */
const held = (m: CellMarks, c: number, a: number, x: number): number =>
  x === c ? a : m.value(x);

/** The squares of the line square `k` holds a line along, the way it runs:
 * its row for a line across, its column for one up and down. */
function lineOf(sp: GridSpace, k: number, d: number): readonly number[] {
  return sp.lineCells[d === ACROSS ? sp.rowOf[k] : sp.colOf[k]];
}

/** The line through square `k`, with `c` supposed to hold `a`: the
 * description's `stick(k)`. */
function stickUnder(m: CellMarks, k: number, c: number, a: number): number[] {
  const d = held(m, c, a, k);
  if (d !== ACROSS && d !== DOWN) return [];
  const L = lineOf(m.sp, k, d);
  return [
    ...stretch(
      L,
      k,
      L.filter((x) => held(m, c, a, x) === d),
    ),
  ];
}

/** The squares numbered square `k`'s line can still reach, with `c`
 * supposed to hold `a`: the description's `reach(k)`, as squares. */
function reachUnder(
  m: CellMarks,
  dl: sticks.Dealt,
  k: number,
  c: number,
  a: number,
): number[] {
  const d = held(m, c, a, k);
  if (d !== ACROSS && d !== DOWN) return [];
  const L = lineOf(m.sp, k, d);
  const free = (x: number): boolean =>
    clueAt(dl.block, x) < 0 &&
    (!(x === c || m.known(x)) || held(m, c, a, x) === d) &&
    stretch(
      L,
      x,
      L.filter((z) => held(m, c, a, z) === d || z === x),
    ).every((y) => y === k || clueAt(dl.length, y) < 0);
  return [...stretch(L, k, L.filter(free))];
}

/** Whether square `p`'s line runs into block `b` beside it, with `c`
 * supposed to hold `a` where they are given. */
function meets(m: CellMarks, p: number, b: number, c = -1, a = 0): boolean {
  const { sp } = m;
  const v = held(m, c, a, p);
  return (
    (v === ACROSS && sp.rowOf[p] === sp.rowOf[b]) ||
    (v === DOWN && sp.colOf[p] === sp.colOf[b])
  );
}

/** The ladder over the dealt board, each technique with its reason: built
 * from the binding and the square placed, on the marks before the firing.
 * The square's line was supposed the other way. */
function sticksLadder(dl: sticks.Dealt): Ladder {
  return describedLadder(sticks, {
    overConnected: compiledRung(
      sticks.overConnected,
      dl,
      ({ b, n }, c, to, m): SticksReason => ({
        kind: "overConnected",
        clue: b,
        value: n,
        // On the supposed board, so the square's own line is among them.
        lines: m.sp.adj4[b].filter((p) => meets(m, p, b, c, 3 - to)),
      }),
    ),
    tooLong: compiledRung(sticks.tooLong, dl, ({ k, v }, c, to, m): SticksReason => {
      const segment = stickUnder(m, k, c, 3 - to);
      return { kind: "tooLong", clue: k, value: v, size: segment.length, segment };
    }),
    twoClues: compiledRung(sticks.twoClues, dl, ({ k }, c, to, m): SticksReason => {
      const segment = stickUnder(m, k, c, 3 - to);
      const clues = segment.filter((x) => clueAt(dl.length, x) >= 0);
      return { kind: "twoClues", clues, segment };
    }),
    starved: compiledRung(
      sticks.starved,
      dl,
      ({ b, n }, c, _to, m): SticksReason => ({
        kind: "starved",
        clue: b,
        value: n,
        open: m.sp.adj4[b].filter(
          (p) => p !== c && clueAt(dl.block, p) < 0 && (!m.known(p) || meets(m, p, b)),
        ),
      }),
    ),
    unreachable: compiledRung(
      sticks.unreachable,
      dl,
      ({ k, v }, c, to, m): SticksReason => {
        const span = reachUnder(m, dl, k, c, 3 - to);
        return { kind: "unreachable", clue: k, value: v, max: span.length, span };
      },
    ),
  });
}

/** Run the ladder on `m` to a fixpoint and say what it reached. */
function deduce(m: CellMarks, ladder: Ladder, dl: sticks.Dealt): Deduced {
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: 0 }, {});
  if (runLadder(m, techniques)) return "contradiction";
  if (m.grid.includes(0)) return "stuck";
  return sticks.isAnswer(m.grid, m.sp, dl) ? "solved" : "contradiction";
}

/** Whether the ladder alone finishes the board from its blocks and numbers.
 * The lines `grid` holds are not read. */
export function deductionFinishes(board: Board): boolean {
  const dl = dealtOf(board);
  const blocks = valuesOf(board.grid.map((cell) => cell & F_BLOCK));
  const m = sticksMarks(sticksSpace(board.w, board.h), dl, blocks);
  return deduce(m, sticksLadder(dl), dl) === "solved";
}

/** Whether a state's lines are an answer to its board, by the rules the
 * description compiles to. */
export function isSolved(state: SticksState): boolean {
  return sticks.isAnswer(
    valuesOf(state.grid),
    sticksSpace(state.w, state.h),
    dealtOf(state),
  );
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a board's answers; the one answer is the
 * grid with every white square's line. */
export type SticksAnswer = Answer<Uint8Array>;

/**
 * The positions a search may try before it gives up, each one a blank square
 * assumed to hold a line one way and the deduction run from it.
 *
 * It decides which Unreasonable boards exist: a board that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a board's answers up to two, by trial and error over the ladder:
 * where it stops, take the first blank square and assume its line runs
 * across, and then up and down. `grid` is read for its blocks only.
 */
export function searchAnswers(
  board: Board,
  budget: number = SEARCH_BUDGET,
): SticksAnswer {
  const dl = dealtOf(board);
  const ladder = sticksLadder(dl);
  const sp = sticksSpace(board.w, board.h);
  return searchBoard<CellMarks, Uint8Array>({
    start: sticksMarks(sp, dl, valuesOf(board.grid.map((cell) => cell & F_BLOCK))),
    deduce: (m) => deduce(m, ladder, dl),
    assume(m) {
      const at = m.grid.indexOf(0);
      if (at < 0) return [];
      return [ACROSS, DOWN].map((d) => {
        const sub = new CellMarks(sp, m.domain, m.grid.slice());
        sub.cands.set(m.cands);
        sub.place(at, d);
        return sub;
      });
    },
    solution: (m) =>
      Uint8Array.from(m.grid, (d) =>
        d === BLOCK ? F_BLOCK : d === ACROSS ? F_HOR : F_VER,
      ),
    budget,
  });
}

/** Keyed on a state's clues, which every state of a game shares. */
const answers = answerCache<Int16Array, Uint8Array>();

/** What a search of a state's blocks and clues established about their
 * answers. The player's lines are not read. */
export function answerOf(state: SticksState): SticksAnswer {
  return answers(state.numbers, () => searchAnswers(state));
}

// --- the hint's walk ---------------------------------------------------------

/** The cells a reason's premise reads: its clues and the line or lines its
 * supposition broke. */
function readsOf(reason: SticksReason): number[] {
  switch (reason.kind) {
    case "tooLong":
      return [reason.clue, ...reason.segment];
    case "unreachable":
      return [reason.clue, ...reason.span];
    case "twoClues":
      return [...reason.clues, ...reason.segment];
    case "overConnected":
      return [reason.clue, ...reason.lines];
    case "starved":
      return [reason.clue, ...reason.open];
  }
}

/** The squares a firing decides, each with its reason, in the order the
 * technique found them. */
function firingOf({ facts, reasons }: Taken): SticksFiring[] {
  const out: SticksFiring[] = [];
  for (let i = 0; i < facts.length; i += 3)
    out.push({
      index: facts[i + 1],
      to: facts[i + 2] === ACROSS ? "hor" : "ver",
      reason: reasons[i / 3] as SticksReason,
    });
  return out;
}

/** Runaway/UX cap on plan length — the player rarely follows more than a few
 * steps before diverging, and a recompute yields the next batch. */
const HINT_PLAN_MAX = 40;

/**
 * The ordered plan from the player's own board: one entry a firing, each
 * holding the squares one number decides by one rule, the firing that carries
 * on from the squares the last decided first (`ladderWalk`). The caller
 * guarantees the board agrees with the unique answer, so every move is
 * correct.
 */
export function deduceSticksPlan(state: SticksState): SticksFiring[][] {
  const dl = dealtOf(state);
  const m = sticksMarks(sticksSpace(state.w, state.h), dl, valuesOf(state.grid));
  m.budget = stepBudget("sticks hint");
  const walk = ladderWalk(m, sticksLadder(dl).entries, { [TIERS]: 0 }, (f) => [
    ...(f.reasons as SticksReason[]).flatMap(readsOf),
    ...firingOf(f).map((g) => g.index),
  ]);
  const plan: SticksFiring[][] = [];
  while (plan.length < HINT_PLAN_MAX) {
    const taken = walk.next();
    if (taken === null || taken === "contradiction") break;
    plan.push(firingOf(taken));
  }
  return plan;
}

/**
 * Flag every white cell whose placed line contradicts the board's one
 * answer, which the search found at either tier
 * (docs/solver-and-generator.md § "The solvable-game contract"). A
 * *missing* line is merely incomplete, never a mistake. Returns `[]` where
 * the search did not prove there is exactly one.
 */
export function findMistakes(state: SticksState): SticksMistake[] {
  const { w, h } = state;
  const answer = answerOf(state);
  if (answer.kind !== "one") return [];
  const solved = answer.solution;
  const mistakes: SticksMistake[] = [];
  for (let i = 0; i < w * h; i++) {
    const placed = state.grid[i] & (F_HOR | F_VER);
    if (!placed || state.grid[i] & F_BLOCK) continue;
    if (placed !== (solved[i] & (F_HOR | F_VER))) mistakes.push({ index: i });
  }
  return mistakes;
}

// --- the live error overlay --------------------------------------------------

/**
 * Merge adjacent same-orientation line cells into segments; when `lengths`
 * is given, record each segment's clue cell (`-1` none, `-2` duplicate).
 */
export function sticksMakeDsf(
  grid: Uint8Array,
  numbers: Int16Array | null,
  w: number,
  h: number,
  dsf: Dsf,
  lengths: Int32Array | null,
): void {
  const s = w * h;
  if (lengths) lengths.fill(-1);
  dsf.reinit();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (x < w - 1 && grid[i] & F_HOR && grid[i + 1] & F_HOR) dsf.merge(i, i + 1);
      if (y < h - 1 && grid[i] & F_VER && grid[i + w] & F_VER) dsf.merge(i, i + w);
    }
  }
  if (lengths && numbers) {
    for (let i = 0; i < s; i++) {
      if (numbers[i] !== -1) {
        const c = dsf.canonify(i);
        lengths[c] = lengths[c] !== -1 ? -2 : i;
      }
    }
  }
}

/**
 * The most cells the segment through clue cell `idx` could ever span, across
 * or down: walk both ways past blanks and lines that way until a block, a
 * line the other way, a cell owned by a different clue, or a cell beside a
 * line owned by one. It is the ladder's `reach`, read on the board as it is.
 */
function maxSize(
  grid: Uint8Array,
  w: number,
  h: number,
  dsf: Dsf,
  lengths: Int32Array,
  idx: number,
  across: boolean,
): number {
  const along = across ? F_HOR : F_VER;
  const other = across ? F_VER : F_HOR;
  const pos = across ? idx % w : Math.floor(idx / w);
  const size = across ? w : h;
  const at = (p: number): number => (across ? idx - (idx % w) + p : (idx % w) + p * w);
  const owner = (p: number): number => lengths[dsf.canonify(at(p))];
  let ret = 1;
  for (let action = -1; action < 2; action += 2) {
    for (let p = pos + action; p >= 0 && p < size; p += action) {
      if (grid[at(p)] & (F_BLOCK | other)) break;
      if (owner(p) !== -1 && owner(p) !== idx) break;
      const next = p + action;
      if (
        next >= 0 &&
        next < size &&
        grid[at(next)] & along &&
        owner(next) !== -1 &&
        owner(next) !== idx
      )
        break;
      ret++;
    }
  }
  return ret;
}

/**
 * The clue cells currently violating a constraint, the live red-number
 * highlight (upstream's `F_ERROR` bit, from `sticks_validate`, recomputed
 * pure per frame): a block with more lines than its number or fewer sides
 * left to take them, a line with two numbers, a line longer than its number,
 * or one too short that can no longer reach it.
 */
export function findLiveErrors(state: SticksState): number[] {
  const { grid, numbers, w, h } = state;
  const dsf = new Dsf(w * h);
  const lengths = new Int32Array(w * h);
  sticksMakeDsf(grid, numbers, w, h, dsf, lengths);
  const errors: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!grid[i] || numbers[i] === -1) continue;
      if (grid[i] & F_BLOCK) {
        // `conn` lines run into the block; `other` sides never can (an edge,
        // a block, or a line the other way).
        let conn = 0;
        let other = 0;
        if (x === 0 || grid[i - 1] & (F_VER | F_BLOCK)) other++;
        if (x === w - 1 || grid[i + 1] & (F_VER | F_BLOCK)) other++;
        if (y === 0 || grid[i - w] & (F_HOR | F_BLOCK)) other++;
        if (y === h - 1 || grid[i + w] & (F_HOR | F_BLOCK)) other++;
        if (x !== 0 && grid[i - 1] & F_HOR) conn++;
        if (x !== w - 1 && grid[i + 1] & F_HOR) conn++;
        if (y !== 0 && grid[i - w] & F_VER) conn++;
        if (y !== h - 1 && grid[i + w] & F_VER) conn++;
        if (conn > numbers[i] || other > 4 - numbers[i]) errors.push(i);
        continue;
      }
      const c = dsf.canonify(i);
      // -2: two clues on one segment. A clued cell's own segment always has
      // a clue, so -1 is unreachable here.
      if (lengths[c] < 0) {
        errors.push(i);
        continue;
      }
      const size = dsf.size(c);
      const target = numbers[lengths[c]];
      if (
        size > target ||
        (size < target &&
          maxSize(grid, w, h, dsf, lengths, i, (grid[i] & F_HOR) !== 0) < target)
      )
        errors.push(i);
    }
  }
  return errors;
}
