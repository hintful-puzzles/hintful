/**
 * Tents' explained hint: the narration half of the recording projection in
 * [`solver.ts`](./solver.ts).
 *
 * The deduction end is the solver's own rungs, run one firing at a time by
 * `tentsRecordingPass` with a recorder standing (docs/games/hints.md
 * § "Recording the deduction", the *threaded* shape). This file turns each
 * firing into its steps, sentences and picture.
 *
 * **Every fact a step rests on is a tent, grass, a tree, a clue or a link.**
 * The solver ties tents to trees as it goes, and the player sees a pairing
 * only where they have drawn it or can read it off the board at a glance. So
 * the recording pass reads the links afresh before every firing, and a
 * pairing the solver needs beyond that is drawn by a step of its own
 * (docs/games/hints.md § "Give the facts a notation (Loopy)", and
 * `add-tents-hint`'s design).
 */

import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { trackTargets } from "../../engine/hint-track.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { type Dir, type LineKind, say } from "./hint-text.ts";
import { TentsBoard, type TentsFiring, tentsRecordingPass } from "./solver.ts";
import {
  BLANK,
  checkCompletion,
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

/**
 * How far ahead the plan is computed: a UX bound, not a correctness one. A
 * player rarely follows more than a handful of steps before going their own
 * way, and the plan is recomputed then anyway; it also keeps `hint()` cheap
 * enough for the cross-game resume walk, which asks after every move.
 */
const PLAN_CAP = 24;

/** What one step marks. */
export interface TentsHighlights {
  /** Squares the step decides, ringed: a link's tent and tree as one shape. */
  targets: number[];
  /** The link the step asks for, from square `sq` toward `d`. */
  link: { sq: number; d: number } | null;
  /** Squares the deduction reasons from, outlined. */
  area: number[];
  /** The row or column the sentence names, by clue index (columns first),
   * hatched, its clue in the action color. */
  line: number | null;
}

type TentsStep = HintStep<TentsMove, TentsHighlights>;

/** The player's board as the solver's: their squares, and their links as the
 * links drawn. */
export function boardOf(state: TentsState): TentsBoard {
  const b = new TentsBoard(state.w, state.h, state.grid, state.numbers);
  b.drawn = Int8Array.from(state.links);
  return b;
}

/**
 * Deduce the plan from the player's tents, grass and links.
 *
 * No tier cap: a shared game ID carries no difficulty, and the ladder tries
 * the easy rungs before the Tricky ones, which is the order a hint wants anyway.
 */
export function tentsHint(
  state: TentsState,
): { ok: true; steps: TentsStep[] } | { ok: false; error: string } {
  const { impossible, plan } = tentsPlan(state);
  // `findMistakes` vouches for every tent, grass square and link, so a
  // contradiction here would mean the deduction is unsound: say so honestly.
  if (impossible) return { ok: false, error: PUZZLE_NOT_REASONABLE };
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps: plan.flatMap((p) => p.steps) };
}

/** The plan as firings, each with the steps it makes: what `tentsHint` shows,
 * and what a test reads to hold each premise to the board it was shown on. */
export function tentsPlan(state: TentsState): {
  impossible: boolean;
  plan: { firing: TentsFiring; steps: TentsStep[] }[];
} {
  const { w, h, numbers } = state;
  const board = boardOf(state);
  const pass = tentsRecordingPass(board, stepBudget("tents hint"));
  const { plan } = deduceHintPlan<TentsBoard, TentsFiring, "open" | "done">({
    board,
    status: (b) => (checkCompletion(w, h, b.soln, numbers) ? "done" : "open"),
    incomplete: "open",
    next: () => pass.next(),
    planCap: PLAN_CAP,
  });
  return {
    impossible: pass.impossible(),
    plan: plan.map((firing) => ({ firing, steps: stepsOf(state, firing) })),
  };
}

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
  const squares: number[] = [];
  if (line < w) for (let y = 0; y < h; y++) squares.push(y * w + line);
  else for (let x = 0; x < w; x++) squares.push((line - w) * w + x);
  const open = squares.filter((i) => f.before.soln[i] === BLANK);
  const placed = squares.filter((i) => f.before.soln[i] === TENT).length;
  const kind: LineKind = line < w ? "column" : "row";
  return { squares, open, need: state.numbers[line] - placed, kind };
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

/** One leg: set `cells` to `v`, saying `explanation`, marking `area`. */
function cellsLeg(
  state: TentsState,
  cells: number[],
  v: number,
  explanation: string,
  area: number[],
  line: number | null,
): TentsStep {
  const { w } = state;
  return {
    move: {
      type: "cells",
      cells: cells.map((i) => ({ x: i % w, y: Math.floor(i / w), v })),
    },
    explanation,
    highlights: { targets: cells, link: null, area, line },
  };
}

/** The steps one firing makes: one, or two legs of one journey when a count
 * decides tents and grass together. */
function stepsOf(state: TentsState, f: TentsFiring): TentsStep[] {
  const { w } = state;
  const { reason } = f;
  const tents = f.cells.filter((c) => c.v === TENT).map((c) => c.i);
  const grass = f.cells.filter((c) => c.v === NONTENT).map((c) => c.i);
  const leg = (
    cells: number[],
    v: number,
    text: string,
    area: number[] = [],
    line: number | null = null,
  ) => cellsLeg(state, cells, v, text, area, line);

  switch (reason.kind) {
    case "tentLink":
    case "treeLink": {
      const { tent, tree } = reason;
      const d = dirBetween(w, tent, tree);
      const others =
        reason.kind === "tentLink"
          ? neighbors(w, state.h, tent).filter(
              (j) => j !== tree && f.before.soln[j] === TREE,
            )
          : takenTents(state, f, tree);
      const explanation =
        reason.kind === "tentLink"
          ? say.tentLink(DIR_NAME[d])
          : say.treeLink(DIR_NAME[dirBetween(w, tree, tent)], others.length > 0);
      return [
        {
          move: { type: "link", x: tent % w, y: Math.floor(tent / w), d, on: true },
          explanation,
          highlights: {
            targets: [tent, tree],
            link: { sq: tent, d },
            area: withPartners(state, f, others),
            line: null,
          },
        },
      ];
    }
    case "noTree":
      return [leg(grass, NONTENT, say.noTree(grass.length))];
    case "treesDone": {
      const trees = new Set<number>();
      for (const i of grass)
        for (const j of neighbors(w, state.h, i))
          if (f.before.soln[j] === TREE) trees.add(j);
      return [
        leg(
          grass,
          NONTENT,
          say.treesDone(grass.length),
          withPartners(state, f, [...trees]),
        ),
      ];
    }
    case "nextToTent":
      return [leg(grass, NONTENT, say.nextToTent(grass.length), [reason.tent])];
    case "treeSingle": {
      // One move places the tent and joins it: the link gesture's.
      const { tree, square } = reason;
      const taken = takenTents(state, f, tree);
      const d = dirBetween(w, square, tree);
      return [
        {
          move: { type: "link", x: square % w, y: Math.floor(square / w), d, on: true },
          explanation: say.treeSingle(taken.length > 0),
          highlights: {
            targets: [square],
            link: { sq: square, d },
            area: [tree, ...taken],
            line: null,
          },
        },
      ];
    }
    case "treeDiagonal":
      return [leg(grass, NONTENT, say.treeDiagonal, [reason.tree, ...reason.pair])];
    case "lineCount":
      return lineSteps(state, f, reason.line, tents, grass);
    case "lineNeighbors": {
      const { kind, need } = lineOf(state, f, reason.line);
      return [
        leg(
          grass,
          NONTENT,
          say.touchesBeside(kind, need, grass.length),
          [],
          reason.line,
        ),
      ];
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
): TentsStep[] {
  const { squares, open, need, kind } = lineOf(state, f, line);
  const leg = (cells: number[], v: number, text: string) =>
    cellsLeg(state, cells, v, text, [], line);

  if (need === 0) return [leg(grass, NONTENT, say.countMet(kind, state.numbers[line]))];
  if (room(squares, open) !== need || tents.length === 0)
    throw new Error("tents hint: a line count with room to spare decided a square");
  if (need === open.length) return [leg(tents, TENT, say.allOpen(kind, need))];
  const first = leg(tents, TENT, say.noSpareRoom(kind, need, tents.length));
  if (grass.length === 0) return [first];
  return [
    first,
    { ...leg(grass, NONTENT, say.betweenThem(grass.length)), continuesPrevious: true },
  ];
}

// --- following the plan ------------------------------------------------------

/** What a step asks of one element: a square's value (`key` its index), or a
 * tent's tree (`key` is `-1 - tent`, `want` the tree, or -1 for none). */
interface Target {
  key: number;
  want: number;
}

function targetsOf(step: TentsStep, state: TentsState): Target[] {
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
  hintStep: TentsStep,
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
    if (hintStep.highlights)
      hintStep.highlights = { ...hintStep.highlights, targets: left.map((t) => t.key) };
  }
  return verdict;
}
