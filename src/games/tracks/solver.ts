/**
 * Tracks' solver: the ladder `tracks.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`). The answer is
 * the edges between squares, each crossed by the track or not, and the
 * player's mark on a square, track or none, is the mark the description
 * keeps on the cells.
 *
 * One ladder serves the generator, which keeps a clue square only while the
 * ladder finishes the board at its tier and not below, so its verdict on
 * every intermediate board decides which puzzles exist; Solve; the mistake
 * check's answer; the difficulty probe; and the hint, which walks it from
 * the player's marks (`hint.ts`). No technique supposes anything, so a board
 * the ladder finishes has one answer.
 *
 * The game keeps upstream's flag word (`state.ts`), so a solve reads the
 * board's flags into the marks and writes what it settled back as flags,
 * which the generator's progress measure and the mistake check read.
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  type ReasonOf,
  runLadder,
  TIERS,
} from "../../engine/ladder-runtime.ts";
import { D, dirX, dirY, L, R, U } from "../../engine/square-edges.ts";
import {
  type Board,
  checkCompletion,
  E_NOTRACK,
  E_TRACK,
  inGrid,
  S_CLUE,
  S_ERROR,
  S_MARK,
  S_NOTRACK,
  S_TRACK,
  sEClear,
  sEDirs,
  sEFlags,
  sESet,
} from "./state.ts";
import * as tracks from "./tracks.compiled.ts";

/** What the description reads an edge the track crosses as, and one it does
 * not; a square's mark holds the same two values. */
export const TRACK = 1;
export const NONE = 2;
/** A square's mark that says nothing yet. */
const EITHER = rangeMask(TRACK, NONE);

/** The side an end leaves the board by, numbered as `step` numbers it. */
const STEP_OF: Readonly<Record<number, number>> = { [U]: 1, [D]: 2, [L]: 3, [R]: 4 };

const spaces = new Map<string, GridSpace>();

/** The space of a `w × h` board, built once a shape. */
function spaceOf(w: number, h: number): GridSpace {
  const key = `${w}x${h}`;
  let sp = spaces.get(key);
  if (sp === undefined) {
    sp = describedSpace(tracks.units, w, h);
    spaces.set(key, sp);
  }
  return sp;
}

/** The game's clue index of the space's line `L`: the space lists the rows
 * first, the game the columns. */
export const clueLine = (w: number, h: number, L: number): number =>
  L < h ? w + L : L - h;

/** An edge as the square it leaves and the side it leaves by: the square to
 * its left or above it, and `R` or `D`. */
export function edgeSide(
  sp: GridSpace,
  e: number,
): { x: number; y: number; dir: number } {
  const a = sp.edgeEnds[2 * e];
  const b = sp.edgeEnds[2 * e + 1];
  const i = Math.min(a, b);
  return { x: i % sp.w, y: (i / sp.w) | 0, dir: Math.abs(a - b) === 1 ? R : D };
}

/** The board as the description deals it: every line's count, and the two
 * squares the track leaves the board from, with the side. */
function dealtOf(b: Board): tracks.Dealt {
  const { w, h } = b;
  const lines = Array.from({ length: w + h }, (_, L) => L);
  return {
    count: clueList(
      lines,
      lines.map((L) => b.numbers[clueLine(w, h, L)]),
      w + h,
    ),
    end: clueList([b.rowS * w, (h - 1) * w + b.colS], [STEP_OF[L], STEP_OF[D]], w * h),
  };
}

/** Why one firing of the ladder holds: its technique and its binding, read
 * before the firing changes anything. */
export interface Fired {
  readonly kind: tracks.LadderId;
  readonly b: Readonly<Record<string, unknown>>;
}

const fired =
  <B extends object>(kind: tracks.LadderId): ReasonOf<B> =>
  (b): Fired => ({ kind, b: { ...(b as Record<string, unknown>) } });

/** The ladder over the dealt clues, each technique with its reason. */
function tracksLadder(dl: tracks.Dealt): Ladder {
  const rung = <B extends object>(
    kind: tracks.LadderId,
    run: (b: never, sp: GridSpace, cl: tracks.Dealt, fire: never) => number,
  ) =>
    compiledRung(
      run as Parameters<typeof compiledRung<B, tracks.Dealt>>[0],
      dl,
      fired<B>(kind),
    );
  return describedLadder(tracks, {
    oneWayIn: rung("oneWayIn", tracks.oneWayIn),
    bothSidesLeft: rung("bothSidesLeft", tracks.bothSidesLeft),
    clueFull: rung("clueFull", tracks.clueFull),
    clueExact: rung("clueExact", tracks.clueExact),
    closeLoop: rung("closeLoop", tracks.closeLoop),
    strand: rung("strand", tracks.strand),
    finishEarly: rung("finishEarly", tracks.finishEarly),
    looseEnd: rung("looseEnd", tracks.looseEnd),
    sharedFate: rung("sharedFate", tracks.sharedFate),
    sharedFateEmpties: rung("sharedFateEmpties", tracks.sharedFateEmpties),
    parity: rung("parity", tracks.parity),
  });
}

/** The techniques a hint asks before any other, and the one it asks only
 * where nothing else fires: a square's own sides are read before a clue is
 * counted, and the loose end's argument is a last resort, as upstream's
 * ladder ran them (`ladderWalk`'s roles). */
export const ROLES = {
  prerequisite: ["oneWayIn", "bothSidesLeft"],
  fallback: ["looseEnd"],
} as const satisfies Record<string, readonly tracks.LadderId[]>;

/** A board's ladder and what it reads the board as. */
export interface Kept {
  readonly sp: GridSpace;
  readonly dl: tracks.Dealt;
  readonly ladder: Ladder;
}

const ladders = new WeakMap<Int32Array, { key: string; kept: Kept }>();

/** The ladder of a board, kept per clue array while its numbers and ends are
 * the same: the generator solves many boards sharing one. */
export function ladderOf(b: Board): Kept {
  const key = `${b.w}x${b.h} ${b.rowS} ${b.colS} ${b.numbers.join(",")}`;
  const kept = ladders.get(b.numbers);
  if (kept !== undefined && kept.key === key) return kept.kept;
  const dl = dealtOf(b);
  const made: Kept = { sp: spaceOf(b.w, b.h), dl, ladder: tracksLadder(dl) };
  ladders.set(b.numbers, { key, kept: made });
  return made;
}

/** Fresh marks holding what the board's flags say: each edge crossed or not,
 * and each square marked track or none. */
export function marksOf(b: Board, sp: GridSpace): CellMarks {
  const grid = new Uint8Array(sp.edges.length);
  for (let e = 0; e < grid.length; e++) {
    const { x, y, dir } = edgeSide(sp, e);
    const f = sEFlags(b, x, y, dir);
    grid[e] = f & E_TRACK ? TRACK : f & E_NOTRACK ? NONE : 0;
  }
  const m = new CellMarks(sp, rangeMask(TRACK, NONE), grid, null, "edge", "cell");
  m.seed(grid);
  for (let c = 0; c < sp.cells.length; c++) {
    const f = b.sflags[c];
    m.edgeCands[c] = f & S_TRACK ? 1 << TRACK : f & S_NOTRACK ? 1 << NONE : EITHER;
  }
  return m;
}

/** Whether the marks hold the board's answer: the rails known are the whole
 * track, every edge left open being one it does not cross. */
export function finished(m: CellMarks, kept: Kept): boolean {
  const g = Uint8Array.from(m.grid, (v) => (v === 0 ? NONE : v));
  return tracks.isAnswer(g, kept.sp, kept.dl);
}

/**
 * Write what the marks settled back onto the board's flags, with what they
 * imply as upstream's ladder recorded it: a square with a rail holds track,
 * every side the track is known not to cross is crossed out, the board's
 * rim included where no end leaves it, and once the board is finished every
 * edge left open too.
 */
function writeBack(b: Board, m: CellMarks, kept: Kept, done: boolean): void {
  const { sp, dl } = kept;
  const { w, h } = b;
  for (let e = 0; e < m.grid.length; e++) {
    const { x, y, dir } = edgeSide(sp, e);
    const v = m.grid[e] === 0 && done ? NONE : m.grid[e];
    if (v === TRACK) sESet(b, x, y, dir, E_TRACK);
    else if (v === NONE) sESet(b, x, y, dir, E_NOTRACK);
  }
  for (let c = 0; c < sp.cells.length; c++) {
    if (tracks.drawn(m, sp, dl, c) > 0 || (m.edgeCands[c] & (1 << NONE)) === 0)
      b.sflags[c] |= S_TRACK;
    else if ((m.edgeCands[c] & (1 << TRACK)) === 0 || done) b.sflags[c] |= S_NOTRACK;
  }
  // Sides the track cannot cross that no mark says yet.
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const rails = sEDirs(b, x, y, E_TRACK);
      for (const d of [U, D, L, R]) {
        if (rails & d) continue;
        const nx = x + dirX(d);
        const ny = y + dirY(d);
        const j = ny * w + nx;
        if (
          !inGrid(b, nx, ny) ||
          b.sflags[i] & S_NOTRACK ||
          b.sflags[j] & S_NOTRACK ||
          countBits(rails) === 2 ||
          countBits(sEDirs(b, nx, ny, E_TRACK)) === 2
        )
          sESet(b, x, y, d, E_NOTRACK);
      }
    }
}

const countBits = (d: number): number =>
  (d & 1) + ((d >> 1) & 1) + ((d >> 2) & 1) + ((d >> 3) & 1);

/**
 * Run the ladder up to tier `diff` from the board's flags, and write what it
 * settled back onto them. Returns the verdict (`-1` inconsistent, `0` not
 * finished, `1` finished, so the board's one answer) and the highest tier
 * that fired.
 *
 * @param firings test seam: the runner tallies each technique's firings into
 *   it. Only `tracks-ladder.test.ts` passes one.
 */
export function tracksSolve(
  b: Board,
  diff: number,
  firings?: FiringTally,
): { ret: number; maxDiff: number } {
  const kept = ladderOf(b);
  const m = marksOf(b, kept.sp);
  const grades: Record<string, number> = {};
  const impossible = runLadder(
    m,
    ladderTechniques(m, kept.ladder.entries, { [TIERS]: diff }, grades),
    { firings },
  );
  const maxDiff = grades[TIERS] ?? 0;
  if (impossible) return { ret: -1, maxDiff };
  const done = finished(m, kept);
  writeBack(b, m, kept, done);
  if (done && !checkCompletion(b, false))
    throw new Error("tracks: the ladder finished a board the game does not");
  return { ret: done ? 1 : 0, maxDiff };
}

/**
 * A clues-only copy of a board with all non-clue square/edge marks stripped
 * (upstream `copy_and_strip`). Optionally flips one clue flag first
 * (`flipClueI`, an index into `w*h`, or −1). Used by the generator and by
 * `findMistakes` to re-solve from the givens alone.
 */
export function copyAndStrip(b: Board, flipClueI: number): Board {
  const { w, h } = b;
  const ret: Board = {
    w,
    h,
    sflags: Int32Array.from(b.sflags),
    numbers: b.numbers,
    rowS: b.rowS,
    colS: b.colS,
    numErrors: new Uint8Array(w + h),
  };
  if (flipClueI !== -1) ret.sflags[flipClueI] ^= S_CLUE;
  for (let i = 0; i < w * h; i++) {
    if (ret.sflags[i] & S_CLUE) continue;
    ret.sflags[i] &= ~(S_TRACK | S_NOTRACK | S_ERROR | S_MARK);
    const x = i % w;
    const y = Math.floor(i / w);
    for (let j = 0; j < 4; j++) {
      const f = 1 << j;
      const xx = x + dirX(f);
      const yy = y + dirY(f);
      if (!inGrid(b, xx, yy) || !(ret.sflags[yy * w + xx] & S_CLUE)) {
        sEClear(ret, x, y, f, E_TRACK);
        sEClear(ret, x, y, f, E_NOTRACK);
      }
    }
  }
  return ret;
}
