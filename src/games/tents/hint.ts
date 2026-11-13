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
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { trackTargets } from "../../engine/hint-track.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { lineSquares, pointOf } from "./hint-marks.ts";
import { type Counted, type Dir, type LineKind, say } from "./hint-text.ts";
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
import * as tents from "./tents.compiled.ts";

export type { TentsRung } from "./solver.ts";

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

/** Every technique's sentence is read from the firing's reason, on the board
 * the firing found, in {@link stepsOf}. */
const sentence = (_spoken: unknown, { words }: TentsMarked): Sentence => words;

const sentences: {
  [K in keyof tents.SaysById]: (spoken: unknown, marked: TentsMarked) => Sentence;
} = {
  tentLink: sentence,
  noTree: sentence,
  treesDone: sentence,
  nextToTent: sentence,
  treeSingle: sentence,
  treeLink: sentence,
  treeDiagonal: sentence,
  lineCount: sentence,
  lineNeighbors: sentence,
};

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
 * anyway. A plan holds forty steps: a UX bound, not a correctness one. A
 * player rarely follows more than a handful of steps before going their own
 * way, and the plan is recomputed then anyway.
 */
export const tentsHint = describedEdgeHint<
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
  plan: 40,
  done: (m, ctx) => marksSolved(ctx.b, m),
  writes: (taken, ctx) => writesOf(ctx.b, taken),
  reads: (taken, ctx) => readsOf(ctx.b, taken),
  step: stepOf,
  say: sentences,
});

// --- reading a firing --------------------------------------------------------

const DIRS = [U, L, R, D];

const DIR_NAME: Record<number, Dir> = {
  [U]: "up",
  [L]: "left",
  [R]: "right",
  [D]: "down",
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
export function tentsKeepTrack(
  m: TentsMove,
  hintStep: HintStep<TentsMove>,
  state: TentsState,
): HintTrackVerdict {
  if (m.type === "solve") return "off";
  let after: TentsState;
  try {
    after = executeMove(state, m);
  } catch {
    return "off";
  }
  const { w } = state;
  const { verdict, left } = trackTargets({
    targets: targetsOf(hintStep, state),
    changes: changesBetween(state, after),
    key: (t) => t.key,
    want: (t) => t.want,
    holds: (t) =>
      t.key >= 0
        ? after.grid[t.key] === t.want
        : partnerOf(w, after.links, -1 - t.key) === t.want,
  });
  if (verdict === "onTrack" && hintStep.move.type === "cells") {
    hintStep.move = {
      type: "cells",
      cells: left.map((t) => ({ x: t.key % w, y: Math.floor(t.key / w), v: t.want })),
    };
    // The words shrink with the rings, which are read from them: a sentence
    // that counted the squares left counts the ones left now.
    const kept = new Set(left.map((t) => `${t.key % w},${Math.floor(t.key / w)}`));
    if (hintStep.words) {
      hintStep.words = hintStep.words.narrow(
        (role, kind, key) => role !== "ring" || kind !== "cell" || kept.has(key),
      );
      hintStep.explanation = hintStep.words.text;
    }
  }
  return verdict;
}
