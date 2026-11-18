/**
 * Tents' explained hint: the narration of the ladder's firings, which
 * `describedEdgeHint` walks one at a time (the engine's walk, plan and tiers).
 * This file turns each firing into its steps, sentences and picture.
 *
 * **Every fact a step rests on is a tent, grass, a tree, a clue or a link.**
 * The ladder ties tents to trees as it goes, and the player sees a pairing
 * only where they have drawn it or can read it off the board at a glance. So
 * the walk reads the links afresh before every firing
 * ({@link settleLinks}), and a pairing the ladder needs beyond that is drawn by
 * a step of its own (docs/hints-marks.md § "Give the facts a notation", and
 * `add-tents-hint`'s design).
 */

import { describedEdgeHint, type Fired } from "../../engine/described-edge-hint.ts";
import { spokenOf, techniqueOf } from "../../engine/described-hint.ts";
import type { HintStep } from "../../engine/game.ts";
import { keepTrackBy } from "../../engine/hint-track.ts";
import {
  CELL,
  type MarkKind,
  type Sentence,
  so,
  whole,
} from "../../engine/hint-words.ts";
import { statedParts } from "../../engine/stated.ts";
import type { Point } from "../../engine/types.ts";
import * as tents from "../../generated/games/tents/tents.compiled.ts";
import { type HintLink, LINK, lineSquares, NUMBER, pointOf } from "./hint-marks.ts";
import {
  boardBefore,
  decidedBy,
  drawLinks,
  marksSolved,
  readsOf,
  reasonOf,
  settleLinks,
  type TentsReason,
  type TentsRung,
  type TentsWalkContext,
  tentsWalk,
  writesOf,
} from "./solver.ts";
import {
  BLANK,
  D,
  DX,
  DY,
  executeMove,
  L,
  NONTENT,
  partnerOf,
  R,
  TENT,
  type TentsMove,
  type TentsState,
  TREE,
  U,
} from "./state.ts";

export type { TentsRung } from "./solver.ts";

// --- the words ---------------------------------------------------------------

/** Which kind of line a count is read along. */
type LineKind = "row" | "column";

/** A direction from a tent to its tree, as the steps' `to` says it. */
type Dir = "above it" | "below it" | "to its left" | "to its right";

/** The line a count is read along, and the number it is read against. */
interface Counted {
  kind: LineKind;
  squares: readonly Point[];
  line: number;
}

/** What a step marks: a square, a link, or a line's number. */
type Marked = Point | HintLink | number;

/** The steps of `tents.description.yaml`, spoken: a mark is drawn on a square
 * unless its sort says otherwise, and a line is striped whole. */
const speak = tents.voice<Marked>({
  kind: CELL as MarkKind<Marked>,
  kinds: {
    link: LINK as MarkKind<Marked>,
    number: NUMBER as MarkKind<Marked>,
    line: whole(CELL) as MarkKind<Marked>,
  },
  value: String,
});

/** A line's marks: the line striped, its number outlined. */
const lineMarks = (c: Counted) => ({
  stripes: { line: c.squares },
  outline: { number: [c.line] },
});

/** Every sentence Tents' hint speaks, from what its firing's reading found. */
export const say = {
  noTree: (cells: readonly Point[]): Sentence =>
    speak.sentence("noTree", { ring: cells }),

  /** Squares every tree beside which already has its tent, shown in `area`. */
  treesDone: (cells: readonly Point[], area: readonly Point[]): Sentence =>
    speak.sentence("treesDone", { ring: cells, marks: { outline: { tents: area } } }),

  /** The open squares round one tent, in `peer.touch`'s sentence. */
  nextToTent: (cells: readonly Point[], tent: Point): Sentence => {
    const { look, move } = statedParts(tents.STATED.nextToTent.step[0], {
      kind: CELL,
      at: (): Point => {
        throw new Error("a tent's touch names no element term");
      },
      ring: cells,
      marks: { outline: [tent] },
      terms: {},
      value: String,
    });
    if (look === undefined || move === undefined)
      throw new Error("peer.touch states a look and a move");
    return so({ look, move });
  },

  treeDiagonal: (cell: Point, tree: Point, pair: readonly Point[]): Sentence =>
    speak.sentence("treeDiagonal", {
      ring: [cell],
      marks: { outline: { tree: [tree], pair } },
    }),

  /** A tree with one open square left; `taken` the tents beside it that
   * already belong to other trees. */
  treeSingle: (
    square: Point,
    tree: Point,
    taken: readonly Point[],
    link: HintLink,
  ): Sentence =>
    speak.sentence("treeSingle", {
      ring: { square: [square], link: [link] },
      marks: { outline: { tree: [tree], taken } },
    }),

  /** A tent every other tree beside which already has its tent (shown in
   * `area`). */
  tentLink: (
    tent: Point,
    tree: Point,
    to: Dir,
    area: readonly Point[],
    link: HintLink,
  ): Sentence =>
    speak.sentence("tentLink", {
      ring: { tent: [tent], tree: [tree], link: [link] },
      terms: { to },
      marks: { outline: { area } },
    }),

  /** A tree with no open square, and one tent beside it not already another
   * tree's; `area` the tents beside it that are, with their trees, of which
   * `others` are tents. */
  treeLink: (
    tree: Point,
    tent: Point,
    to: Dir,
    area: readonly Point[],
    others: number,
    link: HintLink,
  ): Sentence =>
    speak.sentence("treeLink", {
      ring: { tree: [tree], tent: [tent], link: [link] },
      terms: { to, many: others > 1 },
      marks: { outline: { area } },
    }),

  /** A line whose count of `clue` is already met. */
  countMet: (c: Counted, clue: number, cells: readonly Point[]): Sentence =>
    speak.sentence("countMet", {
      ring: cells,
      terms: { axis: c.kind, clue },
      marks: lineMarks(c),
    }),

  /** A line needing `need` tents with exactly `need` open squares. */
  allOpen: (c: Counted, need: number, cells: readonly Point[]): Sentence =>
    speak.sentence("allOpen", {
      ring: cells,
      terms: { axis: c.kind, need },
      marks: lineMarks(c),
    }),

  /** A line whose open squares have room for exactly `need` tents that do not
   * touch, so the ringed squares must hold one each. */
  noSpareRoom: (c: Counted, need: number, cells: readonly Point[]): Sentence =>
    speak.sentence("noSpareRoom", {
      ring: cells,
      terms: { axis: c.kind, need },
      marks: lineMarks(c),
    }),

  /** The same firing's other leg: squares between those tents. */
  betweenThem: (c: Counted, cells: readonly Point[]): Sentence =>
    speak.sentence("betweenThem", {
      ring: cells,
      terms: { axis: c.kind },
      marks: lineMarks(c),
      later: true,
    }),

  /** Every placement touches the ringed squares in the lines alongside. */
  touchesBeside: (c: Counted, need: number, cells: readonly Point[]): Sentence =>
    speak.sentence("touchesBeside", {
      ring: cells,
      terms: { axis: c.kind, need },
      marks: lineMarks(c),
    }),
};

/** One firing as its sentences read it. */
interface TentsFiring {
  reason: TentsReason;
  /** The board just before it fired: the squares, and the links as the
   * player sees them. */
  before: { soln: Int8Array; links: Int8Array };
  /** The squares it decided, and their values. */
  cells: { i: number; v: number }[];
}

/** A leg of a firing: the move it asks for, and its words. */
interface TentsLeg {
  move: TentsMove;
  words: Sentence;
}

/** What a sentence is told of its step: the words the firing's reading made. */
interface TentsMarked {
  words: Sentence;
}

/** A firing's legs, from the board the walk made it on. */
function stepOf(
  fired: Fired<tents.SaysById[keyof tents.SaysById], TentsWalkContext>,
  state: TentsState,
): { move: TentsMove; highlights: null; marked: TentsMarked }[] {
  const { taken, ctx, marks: m } = fired;
  const reason = reasonOf(ctx.b, techniqueOf(taken) as TentsRung, spokenOf(taken));
  const legs = stepsOf(state, {
    reason,
    before: boardBefore(ctx.b, m, taken),
    cells: decidedBy(ctx.b, taken).cells,
  });
  drawLinks(ctx, taken);
  return legs.map(({ move, words }) => ({
    move,
    highlights: null,
    marked: { words },
  }));
}

/**
 * The plan from the player's tents, grass and links to the end, a step a
 * firing (two legs where a count decides tents and grass together).
 *
 * No tier cap: a shared game ID carries no difficulty, and the ladder tries
 * the Easy techniques before the Normal ones, which is the order a hint wants
 * anyway.
 */
export const { hint: tentsHint, judgeMove: tentsJudgeMove } = describedEdgeHint<
  TentsState,
  TentsMove,
  null,
  TentsMarked,
  TentsWalkContext,
  tents.SaysById,
  TentsRung
>({
  name: "tents hint",
  walk: tentsWalk,
  settle: settleLinks,
  tiers: { lowest: () => tents.tiers.length - 1, count: tents.tiers.length },
  roles: { fallback: ["linkForNear", "linkForAny"] },
  done: (m, ctx) => marksSolved(ctx.b, m),
  writes: (taken, ctx) => writesOf(ctx.b, taken),
  reads: (taken, ctx) => readsOf(ctx.b, taken),
  step: stepOf,
  // Every technique's sentence is read from the firing's reason, on the board
  // the firing found, in `stepsOf`.
  say: (_spoken, { words }) => words,
});

// --- reading a firing --------------------------------------------------------

const DIRS = [U, L, R, D];

const DIR_NAME: Record<number, Dir> = {
  [U]: "above it",
  [L]: "to its left",
  [R]: "to its right",
  [D]: "below it",
};

function neighbors(w: number, h: number, i: number): number[] {
  const x = i % w;
  const y = Math.floor(i / w);
  const out: number[] = [];
  for (const d of DIRS) {
    const x2 = x + DX(d);
    const y2 = y + DY(d);
    if (x2 >= 0 && x2 < w && y2 >= 0 && y2 < h) out.push(y2 * w + x2);
  }
  return out;
}

/** The direction from square `a` to its neighbor `b`. */
function dirBetween(w: number, a: number, b: number): number {
  for (const d of DIRS) if (a + DY(d) * w + DX(d) === b) return d;
  throw new Error("tents hint: squares not side by side");
}

/** The tents beside `tree` that the board before the firing already gave to
 * another tree. */
function takenTents(state: TentsState, f: TentsFiring, tree: number): number[] {
  const { w, h } = state;
  const { soln, links } = f.before;
  return neighbors(w, h, tree).filter((j) => {
    const partner = partnerOf(w, links, j);
    return soln[j] === TENT && partner >= 0 && partner !== tree;
  });
}

/** Each square with the tent or tree it was joined to before the firing. */
function withPartners(state: TentsState, f: TentsFiring, squares: number[]): number[] {
  const out = new Set(squares);
  for (const i of squares) {
    const p = partnerOf(state.w, f.before.links, i);
    if (p >= 0) out.add(p);
  }
  return [...out].sort((a, b) => a - b);
}

/** A line's squares, its placed tents and its open squares, before the firing. */
function lineOf(state: TentsState, f: TentsFiring, line: number) {
  const { w, h } = state;
  const squares = lineSquares(line, w, h);
  const open = squares.filter((i) => f.before.soln[i] === BLANK);
  const placed = squares.filter((i) => f.before.soln[i] === TENT).length;
  const kind: LineKind = line < w ? "column" : "row";
  const counted: Counted = { kind, line, squares: squares.map((i) => pointOf(i, w)) };
  return { squares, open, need: state.numbers[line] - placed, kind, counted };
}

/** How many tents the line's open squares hold at most, none side by side:
 * each run of `n` consecutive open squares holds `ceil(n / 2)`. */
function room(squares: number[], open: number[]): number {
  const isOpen = new Set(open);
  let total = 0;
  let run = 0;
  for (const i of [...squares, -1]) {
    if (isOpen.has(i)) run++;
    else {
      total += Math.ceil(run / 2);
      run = 0;
    }
  }
  return total;
}

// --- the steps ---------------------------------------------------------------

/** One leg: set `cells` to `v`, saying `words`. */
function cellsLeg(
  state: TentsState,
  cells: number[],
  v: number,
  words: Sentence,
): TentsLeg {
  const { w } = state;
  return {
    move: {
      type: "cells",
      cells: cells.map((i) => ({ x: i % w, y: Math.floor(i / w), v })),
    },
    words,
  };
}

/** A leg that asks for a link, which may also place its tent. */
function linkLeg(state: TentsState, sq: number, d: number, words: Sentence): TentsLeg {
  const { w } = state;
  return {
    move: { type: "link", x: sq % w, y: Math.floor(sq / w), d, on: true },
    words,
  };
}

/** The legs one firing makes: one, or two when a count decides tents and
 * grass together. */
function stepsOf(state: TentsState, f: TentsFiring): TentsLeg[] {
  const { w } = state;
  const { reason } = f;
  const tents = f.cells.filter((c) => c.v === TENT).map((c) => c.i);
  const grass = f.cells.filter((c) => c.v === NONTENT).map((c) => c.i);
  const at = (i: number) => pointOf(i, w);
  const pts = (is: readonly number[]) => is.map(at);
  const leg = (cells: number[], v: number, words: Sentence) =>
    cellsLeg(state, cells, v, words);
  const link = (sq: number, d: number, words: Sentence) => linkLeg(state, sq, d, words);

  switch (reason.kind) {
    case "tentLink": {
      const { tent, tree } = reason;
      const d = dirBetween(w, tent, tree);
      const others = neighbors(w, state.h, tent).filter(
        (j) => j !== tree && f.before.soln[j] === TREE,
      );
      const area = withPartners(state, f, others);
      const words = say.tentLink(at(tent), at(tree), DIR_NAME[d], pts(area), {
        sq: tent,
        d,
      });
      return [link(tent, d, words)];
    }
    case "treeLink": {
      const { tent, tree } = reason;
      const d = dirBetween(w, tent, tree);
      const taken = takenTents(state, f, tree);
      const area = withPartners(state, f, taken);
      const words = say.treeLink(
        at(tree),
        at(tent),
        DIR_NAME[dirBetween(w, tree, tent)],
        pts(area),
        taken.length,
        { sq: tent, d },
      );
      return [link(tent, d, words)];
    }
    case "noTree":
      return [leg(grass, NONTENT, say.noTree(pts(grass)))];
    case "treesDone": {
      const trees = new Set<number>();
      for (const i of grass)
        for (const j of neighbors(w, state.h, i))
          if (f.before.soln[j] === TREE) trees.add(j);
      const area = withPartners(state, f, [...trees]);
      return [leg(grass, NONTENT, say.treesDone(pts(grass), pts(area)))];
    }
    case "nextToTent":
      return [leg(grass, NONTENT, say.nextToTent(pts(grass), at(reason.tent)))];
    case "treeSingle": {
      // One move places the tent and joins it: the link gesture's.
      const { tree, square } = reason;
      const taken = takenTents(state, f, tree);
      const d = dirBetween(w, square, tree);
      const words = say.treeSingle(at(square), at(tree), pts(taken), { sq: square, d });
      return [link(square, d, words)];
    }
    case "treeDiagonal": {
      if (grass.length !== 1)
        throw new Error("tents hint: a corner rules out one square");
      const words = say.treeDiagonal(at(grass[0]), at(reason.tree), pts(reason.pair));
      return [leg(grass, NONTENT, words)];
    }
    case "lineCount":
      return lineSteps(state, f, reason.line, tents, grass);
    case "lineNeighbors": {
      const { counted, need } = lineOf(state, f, reason.line);
      return [leg(grass, NONTENT, say.touchesBeside(counted, need, pts(grass)))];
    }
  }
}

/**
 * A count over its own line. It has only two cases, and the enumeration the
 * rung runs can reach no third: a run of `n` open squares holds at most
 * `ceil(n / 2)` tents that don't touch, and while the line needs fewer than
 * its runs hold, any run can go one short, so no square is a tent in every
 * placement and none is empty in every one. So the line either has its count
 * (`need` 0) or has no spare room, where each odd run is filled alternately
 * and the squares between those tents are grass. A tent already in the line
 * has grass round it by then, since that rung comes first.
 */
function lineSteps(
  state: TentsState,
  f: TentsFiring,
  line: number,
  tents: number[],
  grass: number[],
): TentsLeg[] {
  const { squares, open, need, counted } = lineOf(state, f, line);
  const pts = (is: readonly number[]) => is.map((i) => pointOf(i, state.w));
  const leg = (cells: number[], v: number, words: Sentence) =>
    cellsLeg(state, cells, v, words);

  if (need === 0)
    return [
      leg(grass, NONTENT, say.countMet(counted, state.numbers[line], pts(grass))),
    ];
  if (room(squares, open) !== need || tents.length === 0)
    throw new Error("tents hint: a line count with room to spare decided a square");
  if (need === open.length)
    return [leg(tents, TENT, say.allOpen(counted, need, pts(tents)))];
  const first = leg(tents, TENT, say.noSpareRoom(counted, need, pts(tents)));
  if (grass.length === 0) return [first];
  return [first, leg(grass, NONTENT, say.betweenThem(counted, pts(grass)))];
}

// --- following the plan ------------------------------------------------------

/** What a step asks of one element: a square's value (`key` its index), or a
 * tent's tree (`key` is `-1 - tent`, `want` the tree, or -1 for none). */
interface Target {
  key: number;
  want: number;
}

function targetsOf(step: HintStep<TentsMove>, state: TentsState): Target[] {
  const { move } = step;
  const { w, grid } = state;
  if (move.type === "cells")
    return move.cells.map((c) => ({ key: c.y * w + c.x, want: c.v }));
  if (move.type === "link") {
    const a = move.y * w + move.x;
    const b = a + DY(move.d) * w + DX(move.d);
    // Either end may name the move; a tent it places is a target of its own,
    // so a click that places only the tent is progress, not a departure.
    const [tent, tree] = grid[a] === TREE ? [b, a] : [a, b];
    const out = [{ key: -1 - tent, want: tree }];
    if (grid[tent] !== TENT) out.push({ key: tent, want: TENT });
    return out;
  }
  return [];
}

/** Every square and every tent's tree that differ between two boards. */
function changesBetween(before: TentsState, after: TentsState): Map<number, number> {
  const { w } = before;
  const out = new Map<number, number>();
  for (let i = 0; i < before.grid.length; i++) {
    if (before.grid[i] !== after.grid[i]) out.set(i, after.grid[i]);
    const now = partnerOf(w, after.links, i);
    if (after.grid[i] === TENT && partnerOf(w, before.links, i) !== now)
      out.set(-1 - i, now);
  }
  return out;
}

/**
 * Classify a player move against the displayed step: by what it did to the
 * board, so a click, a drag and a key press that make the same change are the
 * same (`engine/hint-track.ts`). A step that decides several squares shrinks
 * in place to what is left.
 */
export const tentsKeepTrack = keepTrackBy<
  TentsState,
  TentsMove,
  unknown,
  Target,
  number,
  number
>({
  foreign: (m) => m.type === "solve",
  execute: (state, m) => {
    try {
      return executeMove(state, m);
    } catch {
      return null;
    }
  },
  targets: targetsOf,
  changesOf: changesBetween,
  key: (t) => t.key,
  want: (t) => t.want,
  valueOf: (state, t) =>
    t.key >= 0 ? state.grid[t.key] : partnerOf(state.w, state.links, -1 - t.key),
  // A cells step shrinks to the squares left, and its words with the rings
  // they are read from: a sentence that counted the squares left counts the
  // ones left now. Only a cells step rings squares.
  narrowed: (step, left, state) =>
    step.move.type === "cells"
      ? {
          move: {
            type: "cells",
            cells: left.map((t) => ({
              x: t.key % state.w,
              y: Math.floor(t.key / state.w),
              v: t.want,
            })),
          },
          highlights: step.highlights,
        }
      : null,
  ring: (t, state) => `${t.key % state.w},${Math.floor(t.key / state.w)}`,
});
