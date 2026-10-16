/**
 * Twiddle's hint: the planner's segments (`solver.ts`), one step a turn.
 *
 * A stage's tile travels by free turns, which move no finished tile, each its
 * own step, until the plan needs a sequence. From there to the tile's arrival
 * is one run, its later turns flagged `continuesPrevious` so auto-play plays
 * it as one hint. Each turn of a run says what it does: which finished tiles
 * it lifts out of place, which it puts back, and where it takes the tile. A
 * run always ends with the tile in place and every finished tile back, so a
 * lifted tile's "for now" is a promise the run keeps.
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { SEARCH_OUT_OF_REACH } from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { type Goal, type Inner, type Part, say, type Turned } from "./hint-text.ts";
import { planTwiddle, type Role, type Segment, type Turn, turnMove } from "./solver.ts";
import { doRotate, type TwiddleMove, type TwiddleState } from "./state.ts";

/** What a step's turn does for the tile it serves. */
export const TWIDDLE_RUNGS = [
  /** A free turn puts the tile in place. */
  "home",
  /** A free turn carries it nearer. */
  "carry",
  /** A run puts it in place and leaves the finished tiles as they were. */
  "run",
  /** A run that also puts tiles before its goal's place in place: the rest
   * of a run the player broke off, or a run that fills several on its way. */
  "fill",
] as const;
export type TwiddleRung = (typeof TWIDDLE_RUNGS)[number];

type Step = HintStep<TwiddleMove, unknown, TwiddleRung>;

export function hint(
  state: TwiddleState,
): HintResult<TwiddleMove, unknown, TwiddleRung> {
  const plan = planTwiddle(state);
  if (plan.segments.length === 0) return { ok: false, error: SEARCH_OUT_OF_REACH };

  const { w, n, orientable } = state;
  const size = state.numbers.length;
  const goal = Int32Array.from(state.numbers).sort();
  const rowsOnly = goal.some((v, i) => i > 0 && v === goal[i - 1]);
  const numbers = Int32Array.from(state.numbers);
  const orient = Uint8Array.from(state.orient);
  const right = (c: number) =>
    numbers[c] === goal[c] && (!orientable || orient[c] === 0);
  /** The first cell before `stage` that is wrong now, or -1. */
  const firstWrong = (stage: number) => {
    for (let c = 0; c < stage; c++) if (!right(c)) return c;
    return -1;
  };
  /** Whether a turn's block lies clear of the cells before `stage`. */
  const clear = (t: Turn, stage: number) => {
    const m = turnMove(w, n, t);
    const row = Math.floor(stage / w);
    return m.y > row || (m.y === row && m.x >= stage % w);
  };
  const play = (cells: Int32Array, t: Turn) => {
    const m = turnMove(w, n, t);
    doRotate(cells, new Uint8Array(size), w, n, false, m.x, m.y, m.dir);
  };

  const steps: Step[] = [];
  const segs = plan.segments;
  for (let i = 0; i < segs.length; ) {
    const stage = segs[i].stage;
    const fixedFrom = firstWrong(stage);
    // A free turn is its own step; anything else runs to the stage's end.
    const free =
      segs[i].turns.length === 1 && fixedFrom < 0 && clear(segs[i].turns[0], stage);
    const turns: Turn[] = [];
    /** Each turn's part, read off the segment it came from. */
    const parts: ((lands: readonly boolean[]) => Part)[] = [];
    const take = (seg: Segment) => {
      const first = turns.length;
      turns.push(...seg.turns);
      for (const p of partsOf(seg, first)) parts.push(p);
    };
    if (free) take(segs[i++]);
    else for (; i < segs.length && segs[i].stage === stage; i++) take(segs[i]);

    // The tile served: the one the turns end on the stage's cell.
    const track = Int32Array.from({ length: size }, (_, c) => c);
    for (const t of turns) play(track, t);
    let at = track[stage];

    // Which of the cells up to the stage's are right after each turn of the
    // run (row 0 before it), for what a turn says about them: a finished
    // tile when the run first lifts it, and any tile when it goes in for
    // good. What happens to them in between is the run's working, unsaid.
    const settled: boolean[][] = [];
    {
      const nums = Int32Array.from(numbers);
      const ors = Uint8Array.from(orient);
      const rightIn = (c: number) =>
        nums[c] === goal[c] && (!orientable || ors[c] === 0);
      settled.push(Array.from({ length: stage + 1 }, (_, c) => rightIn(c)));
      for (const t of turns) {
        const m = turnMove(w, n, t);
        doRotate(nums, ors, w, n, orientable, m.x, m.y, m.dir);
        settled.push(Array.from({ length: stage + 1 }, (_, c) => rightIn(c)));
      }
    }
    /** The turn (from 1) after which `c` is right to the run's end. */
    const goesIn = (c: number) => {
      let k = turns.length;
      while (k > 0 && settled[k - 1][c]) k--;
      return k;
    };
    /** The turn (from 1) that first takes `c`'s finished tile out, or 0. */
    const firstLift = (c: number) =>
      settled[0][c] ? settled.findIndex((row) => !row[c]) : -1;

    const landsOn = turns.map((_, k) => goesIn(stage) === k + 1);
    const told = linedUp(
      parts.map((p) => p(landsOn)),
      turns,
      at,
      (cells, t) => play(cells, t),
      size,
    );
    turns.forEach((t, k) => {
      const g: Goal = { at, number: goal[stage], rowsOnly };
      const m = turnMove(w, n, t);
      doRotate(numbers, orient, w, n, orientable, m.x, m.y, m.dir);
      const where = Int32Array.from({ length: size }, (_, c) => c);
      play(where, t);
      const from = at;
      at = where.indexOf(at);
      const turned: Turned = { block: { x: m.x, y: m.y }, clockwise: m.dir === -1 };
      let rung: TwiddleRung;
      let words: Sentence;
      if (free) {
        const lands = at === stage && right(stage);
        rung = lands ? "home" : "carry";
        words = lands ? say.home(g, turned) : say.carry(g, turned);
      } else {
        rung = fixedFrom >= 0 ? "fill" : "run";
        const before = Array.from({ length: stage }, (_, c) => c);
        const lands = landsOn[k];
        // Striped where the tiles stand as the step is shown: a lifted tile on
        // its own cell, a returning one on the cell it comes back from.
        words = say.runTurn(g, turned, told[k], {
          lands,
          carries: !lands && at !== from,
          lifts: before.filter((c) => firstLift(c) === k + 1),
          returns: before
            .filter((c) => settled[0][c] && firstLift(c) > 0 && goesIn(c) === k + 1)
            .map((c) => where[c]),
        });
      }
      steps.push({
        move: m,
        rung,
        explanation: words.text,
        words,
        ...(k > 0 ? { continuesPrevious: true } : {}),
      });
    });
  }
  return { ok: true, steps };
}

/**
 * Each turn's part in the technique of its segment, as functions of which of
 * the run's turns land the tile (a tuck's middle turn says it brings the tile
 * in only if the turn back does). `offset` is where the segment starts in the
 * run.
 *
 * The parts are read off the segment's own turns (`bracketParts`), so a part
 * names only turns the player plays: a cut, the canceling of a turn by its
 * inverse, or a remainder's missing start cannot leave a "turn back" with
 * nothing to turn back. The roles the library built the sequence with add
 * what pairing cannot see, where the segment holds them whole: the phases of
 * a cycle of small cycles, a twist's two routes, a swap's first turn, and
 * that a searched sequence was searched.
 */
function partsOf(
  seg: Segment,
  offset: number,
): ((lands: readonly boolean[]) => Part)[] {
  const { turns, roles } = seg;
  const has = (r: Role) => !seg.remainder && roles.includes(r);
  const inner: Inner | null = has("swap")
    ? "swap"
    : has("small1") && has("small2")
      ? "small cycles"
      : has("twist") && has("twistBack")
        ? "twist"
        : null;
  const parts = bracketParts(turns, offset, inner);
  if (seg.remainder) return parts;
  const mate = matesOf(turns);
  roles.forEach((role, i) => {
    if ((role === "small1" || role === "small1Back") && has("small1Back"))
      parts[i] = () => ({ kind: "small", which: 1, back: role === "small1Back" });
    if ((role === "small2" || role === "small2Back") && has("small2Back"))
      parts[i] = () => ({ kind: "small", which: 2, back: role === "small2Back" });
    if (inner === "twist" && (role === "twist" || role === "twistBack"))
      parts[i] = () => ({ kind: "twist", back: role === "twistBack" });
    if (role === "swap" && mate[i] < 0 && parts[i]([]).kind === "plain")
      parts[i] = () => ({ kind: "swapStart" });
    if (role === "learned") parts[i] = () => ({ kind: "plain", searched: true });
  });
  return parts;
}

/**
 * The parts of a remainder, read off its own turns, since the roles it
 * inherits name turns the player never saw. Each turn is paired with the
 * nearest later turn that undoes it, and the pairs say the technique: two
 * pairs that interleave are a cycle (`X Y X⁻¹ Y⁻¹`), a pair around turns left
 * unpaired is a tuck (`X Y X⁻¹`), a pair around only other pairs lines them up.
 * What pairs with nothing says only what it does.
 */
function bracketParts(
  turns: readonly Turn[],
  offset: number,
  /** What a lining up serves, where the library's roles say. */
  named: Inner | null,
): ((lands: readonly boolean[]) => Part)[] {
  const mate = matesOf(turns);
  const parts: ((lands: readonly boolean[]) => Part)[] = turns.map(() => () => ({
    kind: "plain",
    searched: false,
  }));
  const pairs = turns.flatMap((_, i) => (mate[i] > i ? [[i, mate[i]] as const] : []));
  const interleaves = (a: readonly [number, number], b: readonly [number, number]) =>
    a[0] < b[0] && b[0] < a[1] && a[1] < b[1];
  const inCycle = new Set<number>();
  /** Unpaired turns a tuck holds between its turn and its turn back. */
  const paired = new Set<number>();
  for (const a of pairs)
    for (const b of pairs)
      if (interleaves(a, b) && !inCycle.has(a[0]) && !inCycle.has(b[0])) {
        parts[a[0]] = () => ({ kind: "cycleFirst" });
        parts[b[0]] = () => ({ kind: "cycleSecond" });
        parts[a[1]] = () => ({ kind: "firstBack" });
        parts[b[1]] = () => ({ kind: "secondBack" });
        for (const i of [...a, ...b]) inCycle.add(i);
      }
  for (const [i, j] of pairs) {
    if (inCycle.has(i)) continue;
    const between = turns.slice(i + 1, j).map((_, k) => i + 1 + k);
    if (between.length === 0) continue;
    if (between.every((k) => mate[k] > i && mate[k] < j)) {
      const inner: Inner =
        named ?? (between.some((k) => inCycle.has(k)) ? "cycle" : "tuck");
      parts[i] = () => ({ kind: "lineUp", inner, undone: true });
      parts[j] = () => ({ kind: "lineBack" });
    } else if (between.every((k) => mate[k] < 0)) {
      parts[i] = () => ({ kind: "tuckLift" });
      for (const k of between) {
        parts[k] = (lands) => ({ kind: "tuckMiddle", bringsIn: lands[offset + j] });
        paired.add(k);
      }
      parts[j] = () => ({ kind: "tuckBack" });
    }
  }
  // A half turn is a block's turn made twice.
  const again = new Set<number>();
  turns.forEach((t, i) => {
    if (i > 0 && turns[i - 1] === t && mate[i] < 0 && mate[i - 1] < 0) {
      parts[i] = () => ({ kind: "again" });
      again.add(i);
    }
  });
  // A turn paired with nothing, before a technique the segment then plays,
  // lines it up: the turn back that would undo it was cut, the tiles it
  // moves being ones the stage no longer needs.
  const opens = new Map<number, Inner>();
  for (const [i, j] of pairs) {
    if (inCycle.has(i) && mate[i] === j) opens.set(i, named ?? "cycle");
    else if (j - i > 1 && turns.slice(i + 1, j).every((_, k) => mate[i + 1 + k] < 0))
      opens.set(i, named ?? "tuck");
  }
  turns.forEach((_, i) => {
    if (mate[i] >= 0 || again.has(i) || paired.has(i)) return;
    const next = [...opens.keys()].filter((k) => k > i).sort((a, b) => a - b)[0];
    const inner = next === undefined ? undefined : opens.get(next);
    if (inner) parts[i] = () => ({ kind: "lineUp", inner, undone: false });
  });
  return parts;
}

/**
 * A run's parts, with a turn that has no technique and leaves the tile where
 * it is read as lining up the technique the run plays next: it moves the
 * tiles that technique works on into its blocks, and the turn that would undo
 * it was cut, those tiles being ones the stage no longer needs.
 */
function linedUp(
  parts: readonly Part[],
  turns: readonly Turn[],
  at: number,
  play: (cells: Int32Array, t: Turn) => void,
  size: number,
): Part[] {
  // Where the served tile stands before each turn.
  const ats: number[] = [];
  let cell = at;
  for (const t of turns) {
    ats.push(cell);
    const where = Int32Array.from({ length: size }, (_, c) => c);
    play(where, t);
    cell = where.indexOf(cell);
  }
  ats.push(cell);
  const out = [...parts];
  let next: Inner | null = null;
  for (let k = parts.length - 1; k >= 0; k--) {
    const p = parts[k];
    if (p.kind === "cycleFirst") next = "cycle";
    else if (p.kind === "tuckLift") next = "tuck";
    else if (p.kind === "swapStart") next = "swap";
    else if (p.kind === "small") next = "small cycles";
    else if (p.kind === "lineUp") next = p.inner;
    else if (p.kind === "plain" && !p.searched && next && ats[k] === ats[k + 1])
      out[k] = { kind: "lineUp", inner: next, undone: false };
  }
  return out;
}

/** Each turn's mate: the nearest later turn that undoes it, or the turn it
 * undoes, or -1. */
function matesOf(turns: readonly Turn[]): number[] {
  const mate = new Array<number>(turns.length).fill(-1);
  const open: number[] = [];
  turns.forEach((t, j) => {
    for (let k = open.length - 1; k >= 0; k--)
      if (turns[open[k]] === (t ^ 1)) {
        mate[open[k]] = j;
        mate[j] = open[k];
        open.splice(k, 1);
        return;
      }
    open.push(j);
  });
  return mate;
}

/** A turn is named by its block and direction, so only the hinted one keeps
 * the plan. */
export function hintKeepTrack(
  m: TwiddleMove,
  step: HintStep<TwiddleMove>,
): HintTrackVerdict {
  const s = step.move;
  if (m.type !== "rotate" || s.type !== "rotate") return "off";
  return m.x === s.x && m.y === s.y && m.dir === s.dir ? "completed" : "off";
}
