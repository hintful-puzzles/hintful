/**
 * Slant's hint: the solver's firings, each narrated, with every same-slant
 * fact a firing uses placed as a mark first.
 *
 * The solver's equivalence classes are facts the board did not show, so a
 * firing that uses one cites the marks joining its two squares, and every
 * merge on that path the player has not marked becomes a step placing the
 * mark, narrated by why the merge holds (`SlantTrace`).
 */

import { Dsf } from "../../engine/dsf.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { commonHintRefusal, DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import {
  deduceHintPlan,
  type SlantFiring,
  type SlantMerge,
  type SlantTrace,
  type VWhy,
} from "./solver.ts";
import type { AlikeDir, SlantMove, SlantState } from "./state.ts";

/** A same-slant mark: between (x, y) and its neighbor to the `dir`. */
export interface SlantMark {
  x: number;
  y: number;
  dir: AlikeDir;
}

/** Highlight data for a Slant hint step. `target` is the square this leg
 * forces and `siblings` the same firing's still-to-do squares, all ringed
 * `COL_HINT` with no slash preview (they share its fate); `mark` is the
 * same-slant mark a step places, drawn in the hint color. `area` is the
 * deduction's evidence to outline (a clue's decided neighbors, a loop chain,
 * the trapped dead-end components, the pairs a v-shape argument reads);
 * `marks` are the marks it cites; `ref` rings a cited already-filled square;
 * `clues` recolors the clues it reads. */
export interface SlantHint {
  target?: Point;
  siblings?: Point[];
  mark?: SlantMark;
  marks?: SlantMark[];
  area?: Point[];
  ref?: Point;
  clues?: Point[];
}

type Step = HintStep<SlantMove, SlantHint>;

/** The mark joining two edge-adjacent squares. */
function markOf(a: number, b: number, w: number): SlantMark {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return { x: lo % w, y: Math.floor(lo / w), dir: hi === lo + 1 ? "right" : "down" };
}

const pointOf = (i: number, w: number): Point => ({ x: i % w, y: Math.floor(i / w) });

/** The up-to-four squares touching a grid point. */
function incidentSquares(px: number, py: number, w: number, h: number): Point[] {
  const out: Point[] = [];
  if (px > 0 && py > 0) out.push({ x: px - 1, y: py - 1 });
  if (px > 0 && py < h) out.push({ x: px - 1, y: py });
  if (px < w && py > 0) out.push({ x: px, y: py - 1 });
  if (px < w && py < h) out.push({ x: px, y: py });
  return out;
}

/** Whether square (sx, sy) holding slash `v` touches grid point (px, py). */
function touches(sx: number, sy: number, v: number, px: number, py: number): boolean {
  const dx = px - sx;
  const dy = py - sy;
  return v < 0 ? dx === dy : dx !== dy;
}

/** Squares whose diagonal lies in the connectivity component of any of the
 * given grid points, computed from a `soln` snapshot (the loop chain / the
 * trapped dead-end components a firing reasons over). */
function componentSquares(
  grid: Int8Array,
  w: number,
  h: number,
  points: number[],
): Point[] {
  const W = w + 1;
  const dsf = new Dsf(W * (h + 1));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = grid[y * w + x];
      if (s === -1) dsf.merge(y * W + x, (y + 1) * W + (x + 1));
      else if (s === 1) dsf.merge((y + 1) * W + x, y * W + (x + 1));
    }
  }
  const roots = new Set(points.map((p) => dsf.canonify(p)));
  const out: Point[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = grid[y * w + x];
      if (s === 0) continue;
      const endpoint = s === -1 ? y * W + x : (y + 1) * W + x;
      if (roots.has(dsf.canonify(endpoint))) out.push({ x, y });
    }
  }
  return out;
}

// --- v-shapes -------------------------------------------------------------

/** Bit `bit` of square `sq`: the pair it belongs to, the grid point where the
 * ruled-out v-shape would meet (`meet`), and the other end of the pair's
 * shared side (`far`), as `(w+1)`-wide point indices. */
function vGeometry(sq: number, bit: number, w: number) {
  const x = sq % w;
  const y = Math.floor(sq / w);
  const W = w + 1;
  const horizontal = bit < 2;
  const partner = horizontal ? sq + 1 : sq + w;
  const bottomRight = (y + 1) * W + (x + 1);
  const other = horizontal ? y * W + (x + 1) : (y + 1) * W + x;
  const meet = bit === 0 || bit === 2 ? bottomRight : other;
  const far = meet === bottomRight ? other : bottomRight;
  return { partner, meet, far, horizontal };
}

/** Where grid point `pt` sits beside the pair `sq` heads, in the words a
 * clause places it with. */
function whereOf(sq: number, horizontal: boolean, pt: number, w: number): string {
  const W = w + 1;
  if (horizontal) return Math.floor(pt / W) === Math.floor(sq / w) ? "above" : "below";
  return pt % W === sq % w ? "on the left" : "on the right";
}

/** What a v-shape argument reads, gathered while narrating it. */
interface VEvidence {
  clues: number[];
  squares: number[];
}

/**
 * Why the pairs across a line of 2s are limited: follow bit `key`'s sources to
 * the one that is not itself carried across a 2. Every hop carries the same
 * kind of limit (`touch`: the pair must give the 2 before it a line, or
 * otherwise can give it only one), and the line ends in a 1 or a placed
 * diagonal for the first kind and a 3 or a placed diagonal for the second.
 */
function lineReason(
  trace: SlantTrace,
  key: number,
  two: number,
  touch: boolean,
  w: number,
  soln: Int8Array,
  ev: VEvidence,
): { end: "one" | "three" | "touches" | "misses"; hops: number } {
  let hops = 1;
  let last = two;
  for (;;) {
    const why = trace.vWhy[key];
    if (why === null) throw new Error("slant hint: a v-shape with no reason");
    const g = vGeometry(key >> 2, key & 3, w);
    ev.squares.push(key >> 2, g.partner);
    if (why.kind === "two") {
      if ((why.pt === g.meet) !== touch)
        throw new Error("slant hint: a bent line of 2s");
      ev.clues.push(why.pt);
      hops++;
      last = why.pt;
      key = why.from;
      continue;
    }
    if (why.kind === "clue") {
      if ((why.c === 1) !== touch)
        throw new Error("slant hint: a line ends in the wrong clue");
      ev.clues.push(why.pt);
      return { end: touch ? "one" : "three", hops };
    }
    const W = w + 1;
    const hit = touches(
      why.sq % w,
      Math.floor(why.sq / w),
      soln[why.sq],
      last % W,
      Math.floor(last / W),
    );
    if (hit !== touch) throw new Error("slant hint: a line ends in the wrong diagonal");
    return { end: touch ? "touches" : "misses", hops };
  }
}

/** The clause saying why the pair can't form v-shape `key`. */
function vClause(
  trace: SlantTrace,
  key: number,
  w: number,
  soln: Int8Array,
  ev: VEvidence,
): string {
  const why: VWhy | null = trace.vWhy[key];
  const sq = key >> 2;
  const g = vGeometry(sq, key & 3, w);
  if (why === null) throw new Error("slant hint: a v-shape with no reason");
  switch (why.kind) {
    case "clue": {
      ev.clues.push(why.pt);
      const where = whereOf(sq, g.horizontal, why.pt, w);
      return why.c === 1 ? say.vClause.one(where) : say.vClause.three(where);
    }
    case "slash":
      ev.squares.push(why.sq);
      return say.vClause.placed(whereOf(sq, g.horizontal, g.meet, w));
    case "two": {
      ev.clues.push(why.pt);
      const where = whereOf(sq, g.horizontal, why.pt, w);
      const touch = why.pt === g.meet;
      const { end, hops } = lineReason(trace, why.from, why.pt, touch, w, soln, ev);
      return say.vClause.across(touch, where, end, hops > 1);
    }
  }
}

/** The clauses for a pair's two ruled-out v-shapes, `keys`: one each, or one
 * for both when a 1 (or a 3) sits at each end. */
function vClauses(
  trace: SlantTrace,
  keys: number[],
  w: number,
  soln: Int8Array,
  ev: VEvidence,
): string[] {
  const whys = keys.map((k) => trace.vWhy[k]);
  const [a, b] = whys;
  if (a?.kind === "clue" && b?.kind === "clue" && a.c === b.c) {
    ev.clues.push(a.pt, b.pt);
    return [say.vBoth(a.c)];
  }
  // A clause carried across a 2 has its own "as", so it goes last, where the
  // sentence's closing "so" cannot be read as part of the other clause.
  const across = (k: number) => (trace.vWhy[k]?.kind === "two" ? 1 : 0);
  const ordered = [...keys].sort((x, y) => across(x) - across(y));
  return ordered.map((k) => vClause(trace, k, w, soln, ev));
}

// --- the plan ---------------------------------------------------------------

/** The merges joining `from` to the nearest square `goal` accepts, through the
 * first `bound` merges; shortest first, ties by merge order. */
function linkPath(
  merges: readonly SlantMerge[],
  bound: number,
  from: number,
  goal: (sq: number) => boolean,
): { path: number[]; end: number } {
  const adj = new Map<number, { to: number; m: number }[]>();
  for (let i = 0; i < bound; i++) {
    const { a, b } = merges[i];
    for (const [u, v] of [
      [a, b],
      [b, a],
    ]) {
      const list = adj.get(u) ?? [];
      list.push({ to: v, m: i });
      adj.set(u, list);
    }
  }
  const prev = new Map<number, { from: number; m: number } | null>([[from, null]]);
  const queue = [from];
  for (let qi = 0; qi < queue.length; qi++) {
    const u = queue[qi];
    if (u !== from && goal(u)) {
      const path: number[] = [];
      for (let p = prev.get(u); p; p = prev.get(p.from)) path.push(p.m);
      return { path, end: u };
    }
    for (const e of adj.get(u) ?? []) {
      if (prev.has(e.to)) continue;
      prev.set(e.to, { from: u, m: e.m });
      queue.push(e.to);
    }
  }
  throw new Error("slant hint: an equivalence with no recorded path");
}

/** Whether a clue-pair merge's sentence still holds on `grid`: the clue's
 * only open squares, beside the pair it counts, are the merge's two, and it
 * needs exactly one more line. */
function cluePremiseHolds(
  m: SlantMerge,
  grid: Int8Array,
  w: number,
  h: number,
): boolean {
  if (m.why.kind !== "clue") return true;
  const { pt, c, pair } = m.why;
  const W = w + 1;
  const px = pt % W;
  const py = Math.floor(pt / W);
  const counted = new Set(pair ?? []);
  if (pair && (grid[pair[0]] !== 0 || grid[pair[1]] !== 0)) return false;
  let lines = 0;
  const open: number[] = [];
  for (const s of incidentSquares(px, py, w, h)) {
    const i = s.y * w + s.x;
    if (grid[i] === 0) {
      if (!counted.has(i)) open.push(i);
    } else if (touches(s.x, s.y, grid[i], px, py)) lines++;
  }
  const left = c - lines - (pair ? 1 : 0);
  return left === 1 && open.length === 2 && open.includes(m.a) && open.includes(m.b);
}

/** Narrate the step placing merge `m`'s mark, with its evidence. */
function markStep(
  m: SlantMerge,
  trace: SlantTrace,
  grid: Int8Array,
  cites: SlantMark[],
  w: number,
  h: number,
): Step {
  const mark = markOf(m.a, m.b, w);
  const W = w + 1;
  let explanation: string;
  const hl: SlantHint = { mark };
  if (m.why.kind === "clue") {
    const { pt, c, pair } = m.why;
    explanation = say.markClue(c, pair !== null);
    const px = pt % W;
    const py = Math.floor(pt / W);
    hl.clues = [{ x: px, y: py }];
    const area = incidentSquares(px, py, w, h).filter((s) => grid[s.y * w + s.x] !== 0);
    if (area.length) hl.area = area;
  } else {
    const lo = Math.min(m.a, m.b);
    const bits = Math.max(m.a, m.b) === lo + 1 ? [1, 0] : [3, 2];
    const ev: VEvidence = { clues: [], squares: [] };
    const keys = bits.map((bit) => lo * 4 + bit);
    explanation = say.markV(vClauses(trace, keys, w, grid, ev));
    const clues = [...new Set(ev.clues)].map((p) => ({
      x: p % W,
      y: Math.floor(p / W),
    }));
    if (clues.length) hl.clues = clues;
    const area = [...new Set(ev.squares)]
      .filter((s) => s !== m.a && s !== m.b)
      .map((s) => pointOf(s, w));
    if (area.length) hl.area = area;
  }
  if (cites.length) hl.marks = cites;
  return {
    move: { type: "alike", ...mark, on: true },
    explanation,
    highlights: hl,
  };
}

/** Build the highlight payload for one leg of a firing. */
function firingHighlights(
  firing: SlantFiring,
  leg: number,
  w: number,
  h: number,
): SlantHint {
  const m = firing.moves[leg];
  const hint: SlantHint = { target: { x: m.x, y: m.y } };
  const siblings = firing.moves.slice(leg + 1).map((s) => ({ x: s.x, y: s.y }));
  if (siblings.length) hint.siblings = siblings;

  switch (firing.technique) {
    case "clue-fill":
    case "clue-empty": {
      if (firing.clue) {
        hint.clues = [{ x: firing.clue.x, y: firing.clue.y }];
        // Evidence: the clue's already-decided neighbors, not the squares
        // this firing places.
        const inFiring = new Set(firing.moves.map((s) => s.y * w + s.x));
        const area = incidentSquares(firing.clue.x, firing.clue.y, w, h).filter(
          (s) => !inFiring.has(s.y * w + s.x) && firing.grid[s.y * w + s.x] !== 0,
        );
        if (area.length) hint.area = area;
      }
      break;
    }
    case "loop":
    case "deadend": {
      // The ruled-out diagonal is −v; its two corners are the points at
      // issue. Outline the chain / components they belong to (from the board
      // with this square removed) plus their incident squares, so a dead-end
      // point that carries no diagonal yet is still located.
      const grid = firing.grid.slice();
      grid[m.y * w + m.x] = 0;
      // A ruled-out `\` runs from (x, y), a ruled-out `/` from (x+1, y).
      const dx = m.v === 1 ? 0 : 1;
      const corners: Point[] = [
        { x: m.x + dx, y: m.y },
        { x: m.x + 1 - dx, y: m.y + 1 },
      ];
      const byKey = new Map<number, Point>();
      for (const s of [
        ...componentSquares(
          grid,
          w,
          h,
          corners.map((p) => p.y * (w + 1) + p.x),
        ),
        ...corners.flatMap((p) => incidentSquares(p.x, p.y, w, h)),
      ]) {
        if (s.x === m.x && s.y === m.y) continue; // the target carries its own ring
        byKey.set(s.y * w + s.x, s);
      }
      hint.area = [...byKey.values()];
      break;
    }
    case "equiv":
      break;
  }
  return hint;
}

/** Narrate why this leg's move is forced. The words are
 * [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(firing: SlantFiring, leg: number, chain: boolean): string {
  if (leg > 0) return say.continuation(firing.technique === "clue-empty");
  const c = firing.clue?.c ?? 0;
  switch (firing.technique) {
    case "clue-fill":
      return firing.pair ? say.clueFillPair(c, chain) : say.clueFill(c);
    case "clue-empty":
      return firing.pair ? say.clueEmptyPair(c, chain) : say.clueEmpty(c);
    case "loop":
      return say.loop;
    case "deadend":
      return say.deadend;
    case "equiv":
      return say.equiv(firing.moves[0].v, chain);
  }
}

/**
 * The plan: every firing, each preceded by the marks it cites that the board
 * does not show yet. A mark goes just before the firing (or mark) that first
 * cites it, unless its sentence has expired by then, in which case it goes
 * where the solver found it; either way it and the firing it is placed
 * beside make one journey.
 */
export function slantHint(
  state: SlantState,
  mistakes: number,
): HintResult<SlantMove, SlantHint> {
  const refusal = commonHintRefusal(state.completed, mistakes);
  if (refusal) return refusal;
  const { w, h } = state;
  const { firings, trace } = deduceHintPlan(w, h, state.clues, state.soln, state.alike);
  if (firings.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  const merges = trace.merges;
  const boardBefore = (i: number): Int8Array =>
    i === 0 ? state.soln : firings[i - 1].grid;
  const boundAt = (tick: number): number => {
    let n = 0;
    while (n < merges.length && merges[n].tick <= tick) n++;
    return n;
  };

  // What each firing and each clue-pair merge cites.
  const firingCites: number[][] = [];
  const anchors: (number | null)[] = [];
  firings.forEach((f, i) => {
    const bound = boundAt(i);
    if (f.technique === "equiv") {
      const t = f.moves[0].y * w + f.moves[0].x;
      const board = boardBefore(i);
      const { path, end } = linkPath(merges, bound, t, (sq) => board[sq] !== 0);
      firingCites.push(path);
      anchors.push(end);
    } else if (f.pair) {
      const [a, b] = f.pair;
      firingCites.push(linkPath(merges, bound, a, (sq) => sq === b).path);
      anchors.push(null);
    } else {
      firingCites.push([]);
      anchors.push(null);
    }
  });
  const mergeCites = merges.map((m, i) => {
    if (m.why.kind !== "clue" || m.why.pair === null) return [];
    const [a, b] = m.why.pair;
    return linkPath(merges, i, a, (sq) => sq === b).path;
  });

  // Where each needed mark goes: before the first firing citing it, or the
  // first mark citing it, whichever comes first.
  const pos = new Array<number>(merges.length).fill(Number.POSITIVE_INFINITY);
  firingCites.forEach((cites, i) => {
    for (const m of cites) pos[m] = Math.min(pos[m], i);
  });
  for (let m = merges.length - 1; m >= 0; m--) {
    if (pos[m] === Number.POSITIVE_INFINITY || merges[m].why.kind === "note") continue;
    if (!cluePremiseHolds(merges[m], boardBefore(pos[m]), w, h))
      pos[m] = merges[m].tick;
    for (const d of mergeCites[m]) pos[d] = Math.min(pos[d], pos[m]);
  }

  const marksOf = (path: number[]) =>
    path.map((m) => markOf(merges[m].a, merges[m].b, w));
  const steps: Step[] = [];
  firings.forEach((firing, i) => {
    let first = true;
    const push = (step: Step) => {
      steps.push(first ? step : { ...step, continuesPrevious: true });
      first = false;
    };
    for (let m = 0; m < merges.length; m++) {
      if (pos[m] !== i || merges[m].why.kind === "note") continue;
      push(markStep(merges[m], trace, boardBefore(i), marksOf(mergeCites[m]), w, h));
    }
    const cites = firingCites[i];
    for (let leg = 0; leg < firing.moves.length; leg++) {
      const highlights = firingHighlights(firing, leg, w, h);
      if (leg === 0 && cites.length) highlights.marks = marksOf(cites);
      const anchor = anchors[i];
      if (anchor !== null) highlights.ref = pointOf(anchor, w);
      push({
        move: { type: "set", ...firing.moves[leg] },
        explanation: narrate(firing, leg, cites.length > 1),
        highlights,
      });
    }
  });
  return { ok: true, steps };
}

/** The player's move completes the step iff it makes exactly the hinted
 * change; anything else drops the plan to recompute. */
export function slantHintKeepTrack(
  m: SlantMove,
  step: Step,
  _state: SlantState,
): HintTrackVerdict {
  const s = step.move;
  if (m.type === "set" && s.type === "set") {
    return m.x === s.x && m.y === s.y && m.v === s.v ? "completed" : "off";
  }
  if (m.type === "alike" && s.type === "alike") {
    return m.x === s.x && m.y === s.y && m.dir === s.dir && m.on === s.on
      ? "completed"
      : "off";
  }
  return "off";
}
