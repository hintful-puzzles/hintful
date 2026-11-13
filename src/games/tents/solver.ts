/**
 * Tents' solver: the ladder `tents.description.yaml` states, compiled, on the
 * engine's marks and runner (`engine/ladder-runtime.ts`): a value a square
 * (a tent, grass or a tree), and on each tent the player's link to its tree,
 * a mark naming one tree.
 *
 * One ladder serves the generator, which keeps a board only where the ladder
 * finishes it at its tier and not at the tier below, so its verdict on every
 * board decides which puzzles exist (the frozen differential holds those
 * verdicts to upstream's); Solve; the mistake check's answer; the difficulty
 * probe; and the hint, which walks it from the player's squares and links
 * ({@link tentsHintWalk}). Finished means every square decided and every tent
 * linked, as upstream's was.
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
  MARK,
  PLACE,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import { spokenOf, techniqueOf } from "../../engine/described-hint.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Firing,
  keptRung,
  type Ladder,
  type LadderEntry,
  ladderTechniques,
  type Rung,
  runLadder,
  type Said,
  type Taken,
  TIERS,
} from "../../engine/ladder-runtime.ts";
import type { GameStatus } from "../../engine/types.ts";
import {
  BLANK,
  DX,
  DY,
  FLIP,
  MAXDIR,
  N,
  NONTENT,
  TENT,
  type TentsState,
  TREE,
} from "./state.ts";
import * as tents from "./tents.compiled.ts";

/** The description's values: a tent, grass and a tree. */
const D_TENT = 1;
const D_GRASS = 2;
const D_TREE = 3;

/** A square's value as the game stores it, by the description's. */
const GAME_VALUE = [BLANK, TENT, NONTENT, TREE];
/** A square's value as the description reads it, by the game's. */
const DESC_VALUE = [0, D_TREE, D_TENT, D_GRASS];

export interface SolveResult {
  ret: number;
  soln: Int8Array;
  /** Per square, the direction of the tree or tent it is tied to, or `N`. */
  links: Int8Array;
}

/** The rungs a step can be, cheapest first: the ladder's techniques. */
export const TENTS_RUNGS = tents.ladder.map((e) => e.id);
export type TentsRung = tents.LadderId;

/** Why a hint firing holds. Squares are indices; the rest of what a sentence
 * cites is read off the board the firing found. */
export type TentsReason =
  /** Blank squares beside no tree at all. */
  | { kind: "noTree"; squares: readonly number[] }
  /** Blank squares every tree beside which already has its tent. */
  | { kind: "treesDone"; squares: readonly number[] }
  /** The blank squares round one tent. */
  | { kind: "nextToTent"; tent: number; squares: readonly number[] }
  /** A tree with one square left that could hold its tent. */
  | { kind: "treeSingle"; tree: number; square: number }
  /** A tree whose two squares left sit round a corner, and the square between
   * them, diagonal to the tree. */
  | { kind: "treeDiagonal"; tree: number; pair: [number, number]; square: number }
  /** A row or column's count, over its own squares (`line` is the clue index:
   * columns first). */
  | { kind: "lineCount"; line: number }
  /** A row or column's count, over the lines either side of it. */
  | { kind: "lineNeighbors"; line: number }
  /** A tent every other tree beside which already has its tent. `serves` is
   * on a link the hint draws: what the firing it was drawn for reads. */
  | { kind: "tentLink"; tent: number; tree: number; serves?: readonly number[] }
  /** A tree whose one remaining square holds a tent. */
  | { kind: "treeLink"; tree: number; tent: number; serves?: readonly number[] };

// --- the board as the description reads it --------------------------------

const spaces = new Map<string, GridSpace>();

/** The space of a `w × h` board, built once a shape. */
function spaceOf(w: number, h: number): GridSpace {
  const key = `${w}x${h}`;
  let sp = spaces.get(key);
  if (sp === undefined) {
    sp = describedSpace(tents.units, w, h);
    spaces.set(key, sp);
  }
  return sp;
}

/** The game's clue index of the space's line `L`: the space lists the rows
 * first, the game the columns. */
const clueLine = (w: number, h: number, L: number): number => (L < h ? w + L : L - h);

/** The board as the description deals it: a tree on each square that has
 * one, and every row's and column's count. */
function dealtOf(
  w: number,
  h: number,
  grid: Int8Array,
  numbers: Int32Array,
): tents.Dealt {
  const trees: number[] = [];
  grid.forEach((v, i) => {
    if (v === TREE) trees.push(i);
  });
  const lines = Array.from({ length: w + h }, (_, L) => L);
  return {
    tree: clueList(
      trees,
      trees.map(() => 0),
      w * h,
    ),
    count: clueList(
      lines,
      lines.map((L) => numbers[clueLine(w, h, L)]),
      w + h,
    ),
  };
}

/** What a firing of a technique speaks of, as the reason the hint's words
 * read: the squares its terms name, as the game numbers them. `serves` is
 * on a link the hint draws for another firing (see {@link linkFor}). */
export function reasonOf(
  b: Board,
  kind: keyof tents.SaysById,
  said: Said<unknown, tents.SaysById[keyof tents.SaysById]> & {
    serves?: readonly number[];
  },
): TentsReason {
  const { serves } = said;
  const tree = (q: number): number => b.dl.tree.at[q];
  const terms = said.says.terms;
  switch (kind) {
    case "tentLink": {
      const { c, K } = terms as tents.SaysById["tentLink"]["terms"];
      return { kind, tent: c, tree: tree(K[0]), serves };
    }
    case "treeLink": {
      const { q, x } = terms as tents.SaysById["treeLink"]["terms"];
      return { kind, tree: tree(q), tent: x, serves };
    }
    case "noTree":
      return { kind, squares: (terms as tents.SaysById["noTree"]["terms"]).S };
    case "treesDone":
      return { kind, squares: (terms as tents.SaysById["treesDone"]["terms"]).S };
    case "nextToTent": {
      const { t, S } = terms as tents.SaysById["nextToTent"]["terms"];
      return { kind, tent: t, squares: S };
    }
    case "treeSingle": {
      const { q, R } = terms as tents.SaysById["treeSingle"]["terms"];
      return { kind, tree: tree(q), square: R[0] };
    }
    case "treeDiagonal": {
      const { q, a, b: other, z } = terms as tents.SaysById["treeDiagonal"]["terms"];
      return { kind, tree: tree(q), pair: [a, other], square: z };
    }
    case "lineCount":
    case "lineNeighbors": {
      const { L } = terms as tents.SaysById["lineCount"]["terms"];
      return { kind, line: clueLine(b.w, b.h, L) };
    }
  }
}

/** The ladder over the dealt board: each technique as the description states
 * it, a firing recording what it says. */
function tentsLadder(dl: tents.Dealt): Ladder {
  return describedLadder(tents, {
    tentLink: compiledRung(tents.tentLink, dl),
    noTree: compiledRung(tents.noTree, dl),
    treesDone: compiledRung(tents.treesDone, dl),
    nextToTent: compiledRung(tents.nextToTent, dl),
    treeSingle: compiledRung(tents.treeSingle, dl),
    treeLink: compiledRung(tents.treeLink, dl),
    treeDiagonal: compiledRung(tents.treeDiagonal, dl),
    lineCount: compiledRung(tents.lineCount, dl),
    lineNeighbors: compiledRung(tents.lineNeighbors, dl),
  });
}

/** A board's space, deal and ladder. */
export interface Board {
  readonly w: number;
  readonly h: number;
  readonly sp: GridSpace;
  readonly dl: tents.Dealt;
  readonly ladder: Ladder;
}

function boardOf(w: number, h: number, grid: Int8Array, numbers: Int32Array): Board {
  const dl = dealtOf(w, h, grid, numbers);
  return { w, h, sp: spaceOf(w, h), dl, ladder: tentsLadder(dl) };
}

/** Fresh marks holding the game's squares `grid` and, on each tent, the tree
 * `links` ties it to. False where they clash with the board's trees. */
function marksOf(
  b: Board,
  grid: Int8Array,
  links: Int8Array | null,
): { m: CellMarks; ok: boolean } {
  const values = Uint8Array.from(grid, (v) => DESC_VALUE[v]);
  const m = new CellMarks(b.sp, rangeMask(D_TENT, D_TREE), values);
  const ok = m.seed(values, (c) => tents.domainOf(b.sp, b.dl, c));
  if (links) m.marked.set(namesOf(b, grid, links));
  return { m, ok };
}

/** Each tent's tree, as the clue the mark names, from the game's links;
 * `-1` elsewhere. */
function namesOf(b: Board, grid: Int8Array, links: Int8Array): Int32Array {
  const names = new Int32Array(grid.length).fill(-1);
  for (let i = 0; i < grid.length; i++) {
    const d = links[i];
    if (grid[i] !== TENT || d === N) continue;
    names[i] = b.dl.tree.byAt[i + DY(d) * b.w + DX(d)];
  }
  return names;
}

/** The direction from square `a` to its neighbor `b`. */
function dirBetween(w: number, a: number, b: number): number {
  for (let d = 1; d < MAXDIR; d++) if (a + DY(d) * w + DX(d) === b) return d;
  throw new Error("tents: squares not side by side");
}

/** The game's squares and links that the description's `grid` and `marked`
 * (the marks', or a copy of them) hold. */
function gameOf(
  b: Board,
  grid: ArrayLike<number>,
  marked: ArrayLike<number>,
): { soln: Int8Array; links: Int8Array } {
  const soln = Int8Array.from(grid, (v) => GAME_VALUE[v]);
  const links = new Int8Array(soln.length).fill(N);
  Array.from(marked).forEach((q, i) => {
    if (q < 0) return;
    const t = b.dl.tree.at[q];
    const d = dirBetween(b.w, i, t);
    links[i] = d;
    links[t] = FLIP(d);
  });
  return { soln, links };
}

/** Every square decided and every tent linked. */
function complete(m: CellMarks): boolean {
  for (let i = 0; i < m.grid.length; i++) {
    if (m.grid[i] === 0) return false;
    if (m.grid[i] === D_TENT && m.marked[i] < 0) return false;
  }
  return true;
}

/**
 * Run the ladder up to tier `diff` (none at all below Easy) from the trees
 * alone: 0 where it found the board inconsistent, 1 where it finished it, 2
 * where it stopped short.
 *
 * @param firings the census sink, forwarded to the runner; only
 *   `tents-ladder.test.ts` passes one.
 */
export function tentsSolve(
  w: number,
  h: number,
  grid: Int8Array,
  numbers: Int32Array,
  diff: number,
  firings?: FiringTally,
): SolveResult {
  const b = boardOf(w, h, grid, numbers);
  const { m, ok } = marksOf(b, grid, null);
  const impossible =
    !ok ||
    runLadder(m, ladderTechniques(m, b.ladder.entries, { [TIERS]: diff }, {}), {
      firings,
    });
  const ret = impossible
    ? 0
    : !complete(m)
      ? 2
      : tents.isAnswer(m.grid, b.sp, b.dl)
        ? 1
        : 0;
  return { ret, ...gameOf(b, m.grid, m.marked) };
}

/** Whether the squares `grid` are an answer to the board: the description's
 * rules, compiled. A square left open is grass, since the tents alone are the
 * answer, and links are the player's notes and play no part. */
export function isSolved(
  w: number,
  h: number,
  grid: Int8Array,
  numbers: Int32Array,
): boolean {
  const b = boardOf(w, h, grid, numbers);
  return tents.isAnswer(
    Uint8Array.from(grid, (v) => (v === BLANK ? D_GRASS : DESC_VALUE[v])),
    b.sp,
    b.dl,
  );
}

/** Solved where the player's squares are an answer. */
export function status(state: TentsState): GameStatus {
  const { w, h, grid, numbers } = state;
  return isSolved(w, h, grid, numbers) ? "solved" : "ongoing";
}

// --- the hint's walk ---------------------------------------------------------

/** The squares round square `i`, it included. */
function round(sp: GridSpace, i: number): number[] {
  return [i, ...sp.adj4[i]];
}

/**
 * The squares a firing's premise reads, which a hint plan continues from:
 * what its sentence points at, and the squares round the tree or tent it
 * turns on, whose decisions are why it fires.
 */
function premise(b: Board, r: TentsReason): number[] {
  const { sp, w, h } = b;
  switch (r.kind) {
    case "noTree":
      return [...r.squares];
    case "treesDone":
      return r.squares.flatMap((i) =>
        round(sp, i).filter((j) => j === i || b.dl.tree.byAt[j] >= 0),
      );
    case "nextToTent":
      return [r.tent, ...r.squares];
    case "treeSingle":
      return round(sp, r.tree);
    case "treeDiagonal":
      return [...round(sp, r.tree), r.square];
    case "lineCount":
    case "lineNeighbors":
      return r.line < w
        ? Array.from({ length: h }, (_, k) => r.line + k * w)
        : Array.from({ length: w }, (_, k) => (r.line - w) * w + k);
    case "tentLink":
      return [...round(sp, r.tent), r.tree];
    case "treeLink":
      return [...round(sp, r.tree), r.tent];
  }
}

/** A copy of `m` that shares no marks with it, for trying a link. */
function copied(m: CellMarks): CellMarks {
  const c = new CellMarks(m.sp, m.domain, m.grid.slice());
  c.cands.set(m.cands);
  c.marked.set(m.marked);
  return c;
}

/**
 * Read onto `m`, holding the links `drawn`, the links the board shows at a
 * glance given those: a tent is a tree's when that tree is the only one beside
 * it not drawn to another tent, or when it is the only square beside the tree
 * that is open or an undrawn tent. The two link techniques, run once on the
 * drawn links alone: a pairing that needs another pairing read first is not on
 * the board, and the hint draws it. False where the board contradicts itself.
 */
function readLinks(m: CellMarks, drawn: Int32Array, rungs: Board["ladder"]): boolean {
  m.marked.set(drawn);
  m.placed++;
  const read: Firing[] = [];
  for (const entry of rungs.entries) {
    if (entry.id !== "tentLink" && entry.id !== "treeLink") continue;
    const found = entry.run.firings?.(m) ?? [];
    if (found === "contradiction") return false;
    read.push(...found);
  }
  const named = new Set<number>();
  for (let c = 0; c < drawn.length; c++) if (drawn[c] >= 0) named.add(drawn[c]);
  for (const f of read)
    for (let i = 0; i < f.facts.length; i += 3) {
      const [c, q] = [f.facts[i + 1], f.facts[i + 2]];
      if (m.marked[c] === q) continue;
      // One tree, two tents, or the reverse.
      if (m.marked[c] >= 0 || named.has(q)) return false;
      m.markAt(c, q);
      named.add(q);
    }
  return true;
}

/** The player's board as the hint reads it: their squares, their links and
 * the links the board shows at a glance ({@link readLinks}). Null where it
 * contradicts itself. */
function seenMarks(
  w: number,
  h: number,
  grid: Int8Array,
  numbers: Int32Array,
  links: Int8Array,
): { b: Board; m: CellMarks } | null {
  const b = boardOf(w, h, grid, numbers);
  const { m, ok } = marksOf(b, grid, null);
  if (!ok || !readLinks(m, namesOf(b, grid, links), b.ladder)) return null;
  return { b, m };
}

/** The squares and links a hint reads off the player's board, theirs and
 * those it shows at a glance; null where it contradicts itself. */
export function seenBoard(
  state: TentsState,
): { soln: Int8Array; links: Int8Array } | null {
  const seen = seenMarks(state.w, state.h, state.grid, state.numbers, state.links);
  return seen && gameOf(seen.b, seen.m.grid, seen.m.marked);
}

/** Whether technique `id` fires on the player's board as a hint reads it. */
export function firesOn(state: TentsState, id: tents.LadderId): boolean {
  const seen = seenMarks(state.w, state.h, state.grid, state.numbers, state.links);
  if (seen === null) throw new Error("tents: the board contradicts itself");
  const found = seen.b.ladder.entries.find((e) => e.id === id)?.run.firings(seen.m);
  return found !== undefined && found !== "contradiction" && found.length > 0;
}

/**
 * A rung of the hint's own that draws a link only for a step that rests on
 * it. The links the board shows are read before every firing
 * ({@link readLinks}), so the link techniques are left with pairings one
 * reading deeper, which the player cannot see until one is drawn. Drawing them
 * as they are found would ask for links nothing uses. So a link is offered
 * where, with it drawn, one of the techniques `then` fires, and what that
 * firing reads is what the link serves; with `anyway`, where none does, the
 * first link is offered alone, since a chain two links long is still a chain
 * the ladder would follow.
 */
function linkFor(
  b: Board,
  drawn: Int32Array,
  then: readonly string[],
  anyway: boolean,
): Rung {
  const byId = new Map(b.ladder.entries.map((e) => [e.id, e.run]));
  const rungOf = (id: string): Rung => {
    const r = byId.get(id);
    if (r === undefined) throw new Error(`tents: no technique ${id}`);
    return r;
  };
  const fires = (trial: CellMarks): number[] | null => {
    for (const id of then) {
      const found = rungOf(id).firings(trial);
      if (found === "contradiction" || found.length === 0) continue;
      return premise(
        b,
        reasonOf(
          b,
          id as keyof tents.SaysById,
          found[0].reasons[0] as Said<unknown, never>,
        ),
      );
    }
    return null;
  };
  return keptRung(
    { tentLink: rungOf("tentLink"), treeLink: rungOf("treeLink") },
    (m, { facts, reasons }) => {
      const trial = copied(m);
      const trialDrawn = drawn.slice();
      trialDrawn[facts[1]] = facts[2];
      if (!readLinks(trial, trialDrawn, b.ladder)) return null;
      const serves = fires(trial);
      return serves === null ? null : [{ ...reasons[0], serves }];
    },
    anyway,
  );
}

/** The techniques that place a square, easiest first: what a link is drawn
 * for before the line counts are tried. */
const NEAR = ["noTree", "treesDone", "nextToTent", "treeSingle", "treeDiagonal"];
const LINES = ["lineCount", "lineNeighbors"];

/**
 * The hint's ladder: the techniques that place a square, in the ladder's
 * order, with its two link techniques replaced by one that draws a link only
 * for a step that rests on it ({@link linkFor}): first for one of the near
 * techniques, before the line counts are tried, then for any.
 */
function hintEntries(b: Board, drawn: Int32Array): LadderEntry[] {
  const byId = new Map(b.ladder.entries.map((e) => [e.id, e]));
  const entry = (id: string): LadderEntry => {
    const e = byId.get(id);
    if (e === undefined) throw new Error(`tents: no technique ${id}`);
    return e;
  };
  const drawFor = (id: string, then: readonly string[], anyway: boolean) => ({
    id,
    tier: 0,
    run: linkFor(b, drawn, then, anyway),
  });
  return [
    ...NEAR.map(entry),
    drawFor("linkForNear", NEAR, false),
    ...LINES.map(entry),
    drawFor("linkForAny", [...NEAR, ...LINES], true),
  ];
}

/** What the hint's walk reads a firing by: the board, and the links the player
 * has drawn or the hint has drawn so far, each tent's tree as a clue (`-1`
 * where none). */
export interface TentsWalkContext {
  b: Board;
  drawn: Int32Array;
}

/**
 * What the hint walks, from the player's squares and links: the marks, the
 * ladder's entries (its two link techniques swapped for the hint's own,
 * {@link hintEntries}) and the walk's context. Null where the squares clash
 * with the board's trees.
 *
 * **Before every firing the links are read afresh** ({@link settleLinks}), so
 * no firing rests on a pairing the board does not show. A pairing the ladder
 * needs beyond that becomes a link the hint draws, and from then on it is on
 * the board.
 */
export function tentsWalk(state: TentsState): {
  marks: CellMarks;
  entries: LadderEntry[];
  ctx: TentsWalkContext;
} | null {
  const { w, h, grid, numbers, links } = state;
  const b = boardOf(w, h, grid, numbers);
  const { m, ok } = marksOf(b, grid, null);
  if (!ok) return null;
  const drawn = namesOf(b, grid, links);
  return { marks: m, entries: hintEntries(b, drawn), ctx: { b, drawn } };
}

/** Read the links the board shows onto the marks, before a firing is taken:
 * false where the board contradicts itself. */
export function settleLinks(m: CellMarks, { b, drawn }: TentsWalkContext): boolean {
  return readLinks(m, drawn, b.ladder);
}

/** The squares a firing's premise reads, which the walk continues from. */
export function readsOf(b: Board, taken: Taken): number[] {
  return premise(
    b,
    reasonOf(b, techniqueOf(taken) as keyof tents.SaysById, spokenOf(taken)),
  );
}

/**
 * The squares and links a firing writes: its facts' squares, a link's tree as
 * well as its tent, and where the firing a link was drawn for reads (the link
 * is for that firing, which is where the work goes next).
 */
export function writesOf(b: Board, taken: Taken): number[] {
  const out: number[] = [];
  for (let i = 0; i < taken.facts.length; i += 3) {
    const at = taken.facts[i + 1];
    out.push(at);
    if (taken.facts[i] === MARK) out.push(b.dl.tree.at[taken.facts[i + 2]]);
  }
  const r = reasonOf(b, techniqueOf(taken) as keyof tents.SaysById, spokenOf(taken));
  if ((r.kind === "tentLink" || r.kind === "treeLink") && r.serves)
    out.push(...r.serves);
  return out;
}

/** The board as it stood just before a firing, which is what its sentence
 * describes: the squares and links the marks hold, with the firing's own facts
 * undone (each was made on an open square, and a link on a tent with none). */
export function boardBefore(
  b: Board,
  m: CellMarks,
  taken: Taken,
): { soln: Int8Array; links: Int8Array } {
  const grid = m.grid.slice();
  const marked = m.marked.slice();
  for (let i = 0; i < taken.facts.length; i += 3) {
    if (taken.facts[i] === PLACE) grid[taken.facts[i + 1]] = 0;
    else marked[taken.facts[i + 1]] = -1;
  }
  return gameOf(b, grid, marked);
}

/** What a firing decides: the squares it fills, with their values as the game
 * stores them, and the links it makes (a tent and its tree's square). */
export function decidedBy(
  b: Board,
  taken: Taken,
): { cells: { i: number; v: number }[]; links: { tent: number; tree: number }[] } {
  const cells: { i: number; v: number }[] = [];
  const links: { tent: number; tree: number }[] = [];
  for (let i = 0; i < taken.facts.length; i += 3) {
    const at = taken.facts[i + 1];
    const n = taken.facts[i + 2];
    if (taken.facts[i] === PLACE) cells.push({ i: at, v: GAME_VALUE[n] });
    else links.push({ tent: at, tree: b.dl.tree.at[n] });
  }
  return { cells, links };
}

/** Draw the links a firing makes on the walk's links, so the next firing is
 * read with them on the board. */
export function drawLinks({ drawn }: TentsWalkContext, taken: Taken): void {
  for (let i = 0; i < taken.facts.length; i += 3)
    if (taken.facts[i] === MARK) drawn[taken.facts[i + 1]] = taken.facts[i + 2];
}

/** Whether the squares the marks hold are an answer to the board. */
export function marksSolved(b: Board, m: CellMarks): boolean {
  return tents.isAnswer(
    Uint8Array.from(m.grid, (v) => (v === 0 ? D_GRASS : v)),
    b.sp,
    b.dl,
  );
}
