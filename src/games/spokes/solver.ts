/**
 * Spokes' solver: the ladder `spokes.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`), the answer
 * check its rules compile to, and the search beneath the ladder.
 *
 * The answer is on the links between hubs, side by side and corner to
 * corner (the space's edges, `edges: king`), each a line or none; a mark, a
 * spoke a hole hides and a link no line will take are all "none".
 *
 * The ladder runs to a fixpoint ({@link spokesSolve}), which is how the
 * generator grades a board below Unreasonable. Beneath it a search by trial
 * and error ({@link searchAnswer}) counts a board's answers to two, which
 * grades Unreasonable and serves Solve and the mistake check. A hint walks
 * the same ladder one firing at a time ({@link spokesWalk}).
 */

import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers,
} from "../../engine/answer-search.ts";
import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
} from "../../engine/describe-runtime.ts";
import { spokenOf } from "../../engine/described-hint.ts";
import type { DifficultyVerdict } from "../../engine/difficulty.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  type Taken,
  TIERS,
} from "../../engine/ladder-runtime.ts";
import * as spokes from "./spokes.compiled.ts";
import {
  DIFF_HARD,
  DIFF_TRICKY,
  getSpoke,
  SPOKE_DIRS,
  SPOKE_EMPTY,
  SPOKE_HIDDEN,
  SPOKE_LINE,
  SPOKE_MARKED,
  type SpokesBoard,
  type SpokesSpokeRef,
} from "./state.ts";

/** What the description reads a link as holding. */
const LINED = 1;
const NONE = 2;

/** What each technique says, as the hint's sentences read it. */
export type SpokesSays = spokes.SaysById;

/** The rungs, easiest first: the ladder's techniques. */
export const SPOKES_RUNGS = spokes.ladder.map((e) => e.id);
export type SpokesRung = spokes.LadderId;

/** How a tried link breaks the board at once: a hub left too few spokes
 * for its number, or a group of hubs closed off from the rest. */
export type SpokesBreakKind = "starved" | "sealed";

/**
 * One firing: one rung reaching one conclusion, with everything the hint
 * needs to narrate and highlight it. `forced` is the spokes it decides, each
 * by its canonical end (`dir < 4`); `evidenceHubs` are the hubs whose
 * number or lines are the argument.
 */
export interface SpokesFiring {
  kind: SpokesRung;
  forced: SpokesSpokeRef[];
  evidenceHubs: number[];
  /** A Check's: the spoke tried, the other way from what it is forced to. */
  hypothesis?: SpokesSpokeRef;
  /** `spareBreaks`': the hub that the rule-out leaves no spoke to spare,
   * which takes all its others. */
  filled?: number;
  /** A Check's: how the trial breaks the board, at `evidenceHubs` (after
   * `filled`). */
  breakKind?: SpokesBreakKind;
}

// --- the board as the description reads it -----------------------------------

/** A board size's space, and the game's direction for each of its links,
 * read from the link's first square. */
interface Geometry {
  sp: GridSpace;
  dirOf: Int8Array;
}

let lastGeometry: Geometry | null = null;
function geometryOf(w: number, h: number): Geometry {
  if (lastGeometry?.sp.w === w && lastGeometry.sp.h === h) return lastGeometry;
  const sp = describedSpace(spokes.units, w, h, [], spokes.edgeGeometry);
  const dirOf = new Int8Array(sp.edges.length);
  for (const e of sp.edges) {
    const a = sp.edgeEnds[2 * e];
    const b = sp.edgeEnds[2 * e + 1];
    const dx = (b % w) - (a % w);
    const dy = ((b / w) | 0) - ((a / w) | 0);
    dirOf[e] = SPOKE_DIRS.findIndex((d) => d.dx === dx && d.dy === dy);
  }
  lastGeometry = { sp, dirOf };
  return lastGeometry;
}

/** The spoke a link is, by its first square. */
function spokeOf(geo: Geometry, e: number, state: number): SpokesSpokeRef {
  return { index: geo.sp.edgeEnds[2 * e], dir: geo.dirOf[e], state };
}

/**
 * The holes no diagonal runs past (a board ID's `X`): a hole whose two
 * squares beside it, corner to corner from each other, are hubs with the
 * spoke between them hidden. The state keeps only the hidden spokes, and a
 * hole whose neighbors leave no such pair says nothing a block would.
 */
function blocksOf(board: SpokesBoard, geo: Geometry): number[] {
  const { sp } = geo;
  const out: number[] = [];
  for (const c of sp.cells) {
    if (board.numbers[c] !== 0) continue;
    const beside = sp.adj4[c];
    const blocked = beside.some((a) =>
      beside.some((b) => {
        const e = sp.edgeOf(a, b);
        return (
          a < b &&
          e >= 0 &&
          board.numbers[a] > 0 &&
          board.numbers[b] > 0 &&
          getSpoke(board.spokes[a], geo.dirOf[e]) === SPOKE_HIDDEN
        );
      }),
    );
    if (blocked) out.push(c);
  }
  return out;
}

/** The board as the description deals it: a number on each hub, and the
 * holes no diagonal runs past. */
function dealtOf(board: SpokesBoard, geo: Geometry): spokes.Dealt {
  const n = board.numbers.length;
  const at: number[] = [];
  const v: number[] = [];
  board.numbers.forEach((k, c) => {
    if (k <= 0) return;
    at.push(c);
    v.push(k);
  });
  const blocks = blocksOf(board, geo);
  return {
    number: clueList(at, v, n),
    block: clueList(
      blocks,
      blocks.map(() => 1),
      n,
    ),
  };
}

/** A board the ladder works on: the marks, and what it reads them by. */
interface Deduction {
  board: SpokesBoard;
  geo: Geometry;
  dl: spokes.Dealt;
  m: CellMarks;
  ladder: Ladder;
}

/** The marks the board's spokes hold as the description reads them: a line,
 * or none for a mark or a hidden spoke, and nothing for an open one. */
function deduction(board: SpokesBoard): Deduction {
  const geo = geometryOf(board.w, board.h);
  const dl = dealtOf(board, geo);
  const grid = new Uint8Array(geo.sp.edges.length);
  for (const e of geo.sp.edges) {
    const s = getSpoke(board.spokes[geo.sp.edgeEnds[2 * e]], geo.dirOf[e]);
    if (s !== SPOKE_EMPTY) grid[e] = s === SPOKE_LINE ? LINED : NONE;
  }
  const m = new CellMarks(geo.sp, (1 << LINED) | (1 << NONE), grid, null, "edge");
  m.seed(grid);
  return { board, geo, dl, m, ladder: spokesLadder(dl) };
}

/** A copy of `d` that shares no marks with it, for a search to assume on. */
function copied(d: Deduction): Deduction {
  const m = new CellMarks(d.m.sp, d.m.domain, d.m.grid.slice(), null, "edge");
  m.cands.set(d.m.cands);
  return { ...d, m };
}

/** How many lines each square has on `grid`. */
function linesOf(sp: GridSpace, grid: ArrayLike<number>, c: number): number {
  let n = 0;
  for (const e of sp.cellEdges[c]) if (grid[e] === LINED) n++;
  return n;
}

/** Whether some hub still lacks a line it takes. */
function unfinished(d: Deduction): boolean {
  const { sp } = d.geo;
  for (const c of sp.cells)
    if (linesOf(sp, d.m.grid, c) < d.board.numbers[c]) return true;
  return false;
}

/** Whether `grid`'s lines, every other link taking none, answer the board. */
function answers(geo: Geometry, dl: spokes.Dealt, grid: ArrayLike<number>): boolean {
  const g = Uint8Array.from(grid, (v) => (v === LINED ? LINED : NONE));
  return spokes.isAnswer(g, geo.sp, dl);
}

/** Where the ladder left the marks, it having found nothing inconsistent. */
function verdictOf(d: Deduction): Deduced {
  if (unfinished(d)) return "stuck";
  return answers(d.geo, d.dl, d.m.grid) ? "solved" : "contradiction";
}

/** Run the ladder on `d` to a fixpoint at `cap` and say what it reached. */
function deduce(d: Deduction, cap: number, firings?: FiringTally): Deduced {
  const { m, ladder } = d;
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: cap }, {}),
    { firings },
  );
  return impossible ? "contradiction" : verdictOf(d);
}

// --- what a tried link breaks --------------------------------------------------

/**
 * How lines on `tried`, read on `grid`, break the board at once near the
 * hubs `changed`, whose lines they change: a hub there or beside one left
 * too few links for its number, else the group a changed hub is in closed
 * off with every hub of it full. The words a Check's hint needs, read as the
 * description's `brokenH` reads them; `null` where nothing breaks.
 */
function breakOf(
  sp: GridSpace,
  takes: ArrayLike<number>,
  grid: ArrayLike<number>,
  tried: readonly number[],
  changed: readonly number[],
): { kind: SpokesBreakKind; hubs: number[] } | null {
  const on = (e: number): boolean => grid[e] === LINED || tried.includes(e);
  const lines = (c: number): number => sp.cellEdges[c].filter(on).length;
  const spare = (c: number): boolean => lines(c) < takes[c];
  const live = (c: number, k: number): boolean => {
    const e = sp.cellEdges[c][k];
    const x = sp.crossing[e];
    return (
      grid[e] === 0 &&
      !tried.includes(e) &&
      spare(c) &&
      spare(sp.edgeAdj[c][k]) &&
      !(x >= 0 && on(x))
    );
  };
  const short = (c: number): boolean => {
    if (!spare(c)) return false;
    let ways = 0;
    for (let k = 0; k < sp.edgeAdj[c].length; k++) if (live(c, k)) ways++;
    return ways < takes[c] - lines(c);
  };
  const near = [...new Set(changed.flatMap((c) => [c, ...sp.adj8[c]]))].sort(
    (a, b) => a - b,
  );
  const starved = near.find(short);
  if (starved !== undefined) return { kind: "starved", hubs: [starved] };
  let hubs = 0;
  for (const c of sp.cells) if (takes[c] > 0) hubs++;
  for (const c of changed) {
    const group = [c];
    for (let i = 0; i < group.length; i++)
      sp.cellEdges[group[i]].forEach((e, k) => {
        const q = sp.edgeAdj[group[i]][k];
        if (on(e) && !group.includes(q)) group.push(q);
      });
    const held = group.filter((x) => takes[x] > 0);
    if (group.every((x) => !spare(x)) && held.length < hubs)
      return { kind: "sealed", hubs: held.sort((a, b) => a - b) };
  }
  return null;
}

/** The ladder over the dealt board. */
function spokesLadder(dl: spokes.Dealt): Ladder {
  return describedLadder(spokes, {
    saturation: compiledRung(spokes.saturation, dl),
    twoOnes: compiledRung(spokes.twoOnes, dl),
    exhaustion: compiledRung(spokes.exhaustion, dl),
    lineBreaks: compiledRung(spokes.lineBreaks, dl),
    spareBreaks: compiledRung(spokes.spareBreaks, dl),
  });
}

// --- solving -----------------------------------------------------------------

/** How many positions {@link searchAnswer} may try on a board that arrives
 * by its ID. A board the generator deals needs far fewer: every removal it
 * keeps is proved within `DEALING_BUDGET`. */
const ANSWER_BUDGET = 5000;

/** The positions a stuck one divides into: a link both of whose hubs still
 * take a line and that crosses no line, as a line and as none. A stuck board
 * has one, or a short hub would have no link left, which `saturation`
 * refuses. */
function assumeLink(d: Deduction): Deduction[] {
  const { sp } = d.geo;
  const takes = d.board.numbers;
  const spare = (c: number): boolean => linesOf(sp, d.m.grid, c) < takes[c];
  for (const e of sp.edges) {
    const x = sp.crossing[e];
    if (
      d.m.known(e) ||
      (x >= 0 && d.m.grid[x] === LINED) ||
      !spare(sp.edgeEnds[2 * e]) ||
      !spare(sp.edgeEnds[2 * e + 1])
    )
      continue;
    return [LINED, NONE].map((v) => {
      const next = copied(d);
      next.m.place(e, v);
      return next;
    });
  }
  return [];
}

/** The board's answers from its clues alone, counted to two by trial and
 * error over the whole ladder. The answer is a value for each link. */
function searchAnswer(board: SpokesBoard, budget = ANSWER_BUDGET): Answer<Uint8Array> {
  return searchAnswers<Deduction, Uint8Array>({
    start: deduction(cleared(board)),
    deduce: (d) => deduce(d, DIFF_TRICKY),
    assume: assumeLink,
    solution: (d) => Uint8Array.from(d.m.grid, (v) => (v === LINED ? LINED : NONE)),
    budget,
  });
}

/** `board` with every spoke it can hold open: its clues and holes alone. */
function cleared(board: SpokesBoard): SpokesBoard {
  // Each two-bit spoke that is not hidden (0) becomes empty (1).
  const spokesNow = board.spokes.map((hub) => (hub | (hub >>> 1)) & 0x5555);
  return { w: board.w, h: board.h, numbers: board.numbers, spokes: spokesNow };
}

/** Each board's answer, by its clues, which every state of a board shares. */
const answerOf = answerCache<Int8Array, SpokesBoard>();

/** The board's answer, as a board with every link a line or a mark, which
 * Solve and the mistake check go by. */
export function spokesAnswer(board: SpokesBoard): Answer<SpokesBoard> {
  return answerOf(board.numbers, () => {
    const answer = searchAnswer(board);
    if (answer.kind !== "one") return answer;
    return { kind: "one", solution: boardOf(board, answer.solution) };
  });
}

/** `board`'s spokes set to `grid`'s values: a line, a mark where it holds
 * none, and open where it holds nothing; a hidden spoke stays hidden. */
function boardOf(board: SpokesBoard, grid: ArrayLike<number>): SpokesBoard {
  const geo = geometryOf(board.w, board.h);
  const out: SpokesBoard = { ...board, spokes: board.spokes.slice() };
  for (const e of geo.sp.edges) {
    const a = geo.sp.edgeEnds[2 * e];
    const b = geo.sp.edgeEnds[2 * e + 1];
    const d = geo.dirOf[e];
    if (getSpoke(out.spokes[a], d) === SPOKE_HIDDEN) continue;
    const s =
      grid[e] === LINED ? SPOKE_LINE : grid[e] === NONE ? SPOKE_MARKED : SPOKE_EMPTY;
    out.spokes[a] = (out.spokes[a] & ~(3 << (d * 2))) | (s << (d * 2));
    const back = d ^ 4;
    out.spokes[b] = (out.spokes[b] & ~(3 << (back * 2))) | (s << (back * 2));
  }
  return out;
}

/**
 * Grade `board` from its clues at tier `cap`: the ladder to a fixpoint below
 * Unreasonable, and at Unreasonable the search, solved where it finds one
 * answer. `budget` bounds the search; a deal asks within `DEALING_BUDGET`.
 */
export function spokesSolve(
  board: SpokesBoard,
  cap: number,
  opts: { budget?: number; firings?: FiringTally } = {},
): DifficultyVerdict {
  if (cap >= DIFF_HARD) {
    const answer = searchAnswer(board, opts.budget);
    return answer.kind === "one"
      ? "solved"
      : answer.kind === "none"
        ? "impossible"
        : "unsolved";
  }
  const reached = deduce(deduction(cleared(board)), cap, opts.firings);
  return reached === "contradiction"
    ? "impossible"
    : reached === "solved"
      ? "solved"
      : "unsolved";
}

/** Whether the player's lines solve the board: every hub has its number,
 * no two diagonals cross, and the hubs are one group. Marks play no part. */
export function spokesSolved(board: SpokesBoard): boolean {
  const geo = geometryOf(board.w, board.h);
  const grid = new Uint8Array(geo.sp.edges.length);
  for (const e of geo.sp.edges)
    if (getSpoke(board.spokes[geo.sp.edgeEnds[2 * e]], geo.dirOf[e]) === SPOKE_LINE)
      grid[e] = LINED;
  return answers(geo, dealtOf(board, geo), grid);
}

// --- the hint's walk ---------------------------------------------------------

/** A firing's reason, before its forced spokes are known. */
type SpokesReason = Omit<SpokesFiring, "forced">;

/**
 * Why a taken firing decided what it did, from the terms its technique says
 * and, for a Check, from the links as they stood (`grid`) when it fired: what
 * the lines it tried break is read off them.
 */
function reasonOf(d: Deduction, taken: Taken, grid: ArrayLike<number>): SpokesReason {
  const { sp } = d.geo;
  const { terms } = spokenOf<SpokesSays[SpokesRung]>(taken).says;
  // What a Check's trial breaks, which a firing of it must break.
  const broken = (
    tried: readonly number[],
    changed: readonly number[],
  ): { kind: SpokesBreakKind; hubs: number[] } => {
    const got = breakOf(sp, d.board.numbers, grid, tried, changed);
    if (got === null)
      throw new Error("spokes: a Check fired where its trial breaks nothing");
    return got;
  };
  switch (taken.entry.id as SpokesRung) {
    case "saturation": {
      const { c } = terms as SpokesSays["saturation"]["terms"];
      return { kind: "saturation", evidenceHubs: [c] };
    }
    case "twoOnes": {
      const { a, b } = terms as SpokesSays["twoOnes"]["terms"];
      return { kind: "twoOnes", evidenceHubs: [a, b] };
    }
    case "exhaustion": {
      const { c } = terms as SpokesSays["exhaustion"]["terms"];
      return { kind: "exhaustion", evidenceHubs: [c] };
    }
    case "lineBreaks": {
      const { e, a, b } = terms as SpokesSays["lineBreaks"]["terms"];
      const why = broken([e], [a, b]);
      return {
        kind: "lineBreaks",
        evidenceHubs: why.hubs,
        hypothesis: spokeOf(d.geo, e, SPOKE_LINE),
        breakKind: why.kind,
      };
    }
    case "spareBreaks": {
      const { c, y, H } = terms as SpokesSays["spareBreaks"]["terms"];
      const ends = H.map((e) =>
        sp.edgeEnds[2 * e] === c ? sp.edgeEnds[2 * e + 1] : sp.edgeEnds[2 * e],
      );
      const why = broken(H, [c, ...ends]);
      return {
        kind: "spareBreaks",
        evidenceHubs: [...new Set([c, ...why.hubs])],
        hypothesis: spokeOf(d.geo, sp.edgeOf(c, y), SPOKE_MARKED),
        filled: c,
        breakKind: why.kind,
      };
    }
  }
}

/** A taken firing in the game's terms: its reason, and the spokes it set. The
 * firing has been made, so the links it set are read as open for its reason. */
function firingOf(d: Deduction, taken: Taken): SpokesFiring {
  const before = d.m.grid.slice();
  for (let i = 0; i < taken.facts.length; i += 3) before[taken.facts[i + 1]] = 0;
  const forced: SpokesSpokeRef[] = [];
  for (let i = 0; i < taken.facts.length; i += 3)
    forced.push(
      spokeOf(
        d.geo,
        taken.facts[i + 1],
        taken.facts[i + 2] === LINED ? SPOKE_LINE : SPOKE_MARKED,
      ),
    );
  return { ...reasonOf(d, taken, before), forced };
}

/** What the hint's steps are built from besides the technique's terms. */
export interface SpokesWalkContext {
  /** Whether every hub has its lines. */
  complete(): boolean;
  /** A taken firing in the game's terms. */
  firing(taken: Taken): SpokesFiring;
  /** The hubs a firing's premise reads, which the walk continues from. */
  reads(taken: Taken): number[];
}

/**
 * The ladder over the player's board, for the engine's hint to walk
 * (`engine/described-edge-hint.ts`), up to Normal: the search beneath is not a
 * deduction, so the plan stops where the ladder does and the hint says so. A
 * player follows the hubs: a firing reads the hubs it argues from and the ends
 * of the spokes it decides.
 */
export function spokesWalk(board: SpokesBoard): {
  marks: CellMarks;
  entries: Ladder["entries"];
  ctx: SpokesWalkContext;
} {
  const d = deduction(board);
  const { sp } = d.geo;
  return {
    marks: d.m,
    entries: d.ladder.entries,
    ctx: {
      complete: () => !unfinished(d),
      firing: (taken) => firingOf(d, taken),
      // Read before the firing is made, on the links as they stand.
      reads: (taken) => {
        const out = [...reasonOf(d, taken, d.m.grid).evidenceHubs];
        for (let i = 0; i < taken.facts.length; i += 3) {
          const e = taken.facts[i + 1];
          out.push(sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]);
        }
        return out;
      },
    },
  };
}
