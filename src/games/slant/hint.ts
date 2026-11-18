/**
 * Slant's hint: the solver's firings, each narrated, with every same-slant
 * fact a firing uses placed as a mark first.
 *
 * The solver's equivalence classes are facts the board did not show, so a
 * firing that uses one cites the marks joining its two squares, and every
 * merge on that path the player has not marked becomes a step placing the
 * mark, narrated by why the merge holds. Where each mark goes is the walk's
 * fact graph's (`placeNotes`).
 */

import { PLACE } from "../../engine/describe-runtime.ts";
import { Dsf } from "../../engine/dsf.ts";
import { placeNotes } from "../../engine/fact-graph.ts";
import type {
  HintResult,
  HintStep,
  HintTrackVerdict,
  MoveVerdict,
} from "../../engine/game.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { CELL, type MarkKind, type Sentence } from "../../engine/hint-words.ts";
import { judgeWalked } from "../../engine/move-judge.ts";
import type { Point } from "../../engine/types.ts";
import * as slant from "../../generated/games/slant/slant.compiled.ts";
import { ALIKE, CLUE } from "./hint-marks.ts";
import {
  deduceHintPlan,
  type SlantFiring,
  type SlantMerge,
  shownMarks,
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
 * with no slash preview (they share its fate); `mark` is the same-slant mark
 * a step places, ringed with its bars inside. `area` is the
 * deduction's evidence to outline (a clue's decided neighbors, a loop chain,
 * the trapped dead-end components, the pairs a v-shape argument reads);
 * `marks` are the marks it cites; `ref` is a cited already-filled square,
 * drawn as a doubled ring in the evidence color; `clues` recolors the clues it
 * reads. All but the target, its siblings and `mark` are evidence, outlined in
 * the words (`hint-marks.ts`). */
export interface SlantHint {
  target?: Point;
  siblings?: Point[];
  mark?: SlantMark;
  marks?: SlantMark[];
  area?: Point[];
  ref?: Point;
  clues?: Point[];
}

/** The hint's rungs: a square step is its firing's technique, and a step
 * placing a same-slant mark is why the merge holds, a clue or a v-shape. */
export const SLANT_RUNGS = [
  "clue-fill",
  "clue-empty",
  "loop",
  "deadend",
  "equiv",
  "mark-clue",
  "mark-v",
] as const;
export type SlantRung = (typeof SLANT_RUNGS)[number];

type Step = HintStep<SlantMove, SlantHint, SlantRung>;

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

// --- the words ---------------------------------------------------------------

/** What a step marks: a square or a clue's point, or a same-slant mark. */
type Marked = Point | SlantMark;

/** The steps of `slant.description.yaml`, spoken: a mark is drawn on a
 * square unless its sort is a clue or a same-slant mark. */
const speak = slant.voice<Marked>({
  kind: CELL as MarkKind<Marked>,
  kinds: {
    clue: CLUE as MarkKind<Marked>,
    two: CLUE as MarkKind<Marked>,
    twos: CLUE as MarkKind<Marked>,
    cap: CLUE as MarkKind<Marked>,
    caps: CLUE as MarkKind<Marked>,
    marks: ALIKE as MarkKind<Marked>,
    alike: ALIKE as MarkKind<Marked>,
  },
  value: String,
});

type Steps = slant.StepsById<Marked>;
/** Where a point sits beside a pair, in the words a clause places it with. */
type Where = Steps["vOne"]["terms"]["where"];
/** What a clue already has, said in place. */
type Got = Steps["clueFillHas"]["terms"]["got"];
/** Why a pair can't meet in a v at one end, said in place. */
type VClause = Steps["markV"]["terms"]["first"];

/**
 * What a clue already has from what the step reads: the same-slant pair it
 * counts as one line (`pair`, the marks joining it), and the decided squares
 * around it (`area`, of which `touching` touch it).
 */
interface ClueSources {
  pair: readonly SlantMark[] | null;
  area: readonly Point[];
  touching: number;
}

/** The lines a clue has, by source, or null when it reads neither; `both`
 * when it names two, which leaves the sentence room for little else. */
function has(src: ClueSources): { got: Got; both: boolean } | null {
  const pair = src.pair?.length ? src.pair : null;
  const { area, touching } = src;
  if (!area.length)
    return (
      pair && {
        got: { step: "hasPair", said: { marks: { outline: { marks: pair } } } },
        both: false,
      }
    );
  if (!pair)
    return {
      got: {
        step: "hasSquares",
        said: { terms: { touching }, marks: { outline: { area } } },
      },
      both: false,
    };
  return {
    got: {
      step: "hasBoth",
      said: { terms: { touching }, marks: { outline: { marks: pair, area } } },
    },
    both: true,
  };
}

/** What lies beyond a 2 along a line of them: the 2s after it, the pairs
 * across those, and the clue capping the line, when one does. */
interface Beyond {
  twos: readonly Point[];
  pairs: readonly Point[];
  cap: Point | null;
}

/** What ends the line beyond a 2. */
type End = "one" | "three" | "touches" | "misses";

/** Every sentence Slant's hint speaks, from what its planner found. */
const say = {
  /** A later square forced by the same clue; `away` when it slants away. */
  continuation: (
    clue: Point,
    area: readonly Point[],
    cells: readonly Point[],
    away: boolean,
  ): Sentence =>
    speak.sentence("continuation", {
      ring: cells,
      terms: { away },
      marks: { outline: { clue: [clue], area } },
      later: true,
    }),

  /** A clue `c` still short of diagonals, needing one from each of `cells`. */
  clueFill: (
    clue: Point,
    c: number,
    src: ClueSources,
    cells: readonly Point[],
  ): Sentence => {
    const held = has(src);
    return held === null
      ? speak.sentence("clueFill", {
          ring: cells,
          terms: { c },
          marks: { outline: { clue: [clue] } },
        })
      : speak.sentence("clueFillHas", {
          ring: cells,
          terms: { c, both: held.both, more: cells.length, got: held.got },
          marks: { outline: { clue: [clue] } },
        });
  },

  /** A clue `c` already touched by all its diagonals. */
  clueEmpty: (
    clue: Point,
    c: number,
    src: ClueSources,
    cells: readonly Point[],
  ): Sentence => {
    if (c === 0)
      return speak.sentence("clueEmpty", {
        ring: cells,
        marks: { outline: { clue: [clue], area: src.area } },
      });
    const held = has(src);
    if (held === null) throw new Error("slant hint: a full clue with no lines");
    return speak.sentence("clueEmptyHas", {
      ring: cells,
      terms: { c, both: held.both, got: held.got },
      marks: { outline: { clue: [clue] } },
    });
  },

  loop: (cell: Point, area: readonly Point[]): Sentence =>
    speak.sentence("loop", { ring: [cell], marks: { outline: { area } } }),

  deadend: (cell: Point, area: readonly Point[]): Sentence =>
    speak.sentence("deadend", { ring: [cell], marks: { outline: { area } } }),

  /** A square whose same-slant partner `anchor`, holding `v`, is already
   * placed, joined to it by `marks`. */
  equiv: (
    cell: Point,
    anchor: Point,
    v: number,
    marks: readonly SlantMark[],
  ): Sentence =>
    speak.sentence("equiv", {
      ring: [cell],
      terms: { v: v < 0 ? "a backslash" : "a forward slash" },
      marks: { outline: { marks, anchor: [anchor] } },
    }),

  /** Two squares around a clue `c` that must share its one remaining line. */
  markClue: (clue: Point, c: number, src: ClueSources, m: SlantMark): Sentence => {
    const held = has(src);
    return held === null
      ? speak.sentence("markClue", {
          ring: [m],
          terms: { c },
          marks: { outline: { clue: [clue] } },
        })
      : speak.sentence("markClueHas", {
          ring: [m],
          terms: { c, got: held.got },
          marks: { outline: { clue: [clue] } },
        });
  },

  /** Two side-by-side squares with both v-shapes ruled out, one clause
   * each. */
  markV: (m: SlantMark, first: VClause, second: VClause): Sentence =>
    speak.sentence("markV", { ring: [m], terms: { first, second } }),

  /** Both v-shapes ruled out by the same kind of clue, one at each end. */
  markVBoth: (m: SlantMark, digit: number, pts: readonly Point[]): Sentence =>
    speak.sentence("markVBoth", {
      ring: [m],
      terms: { one: digit === 1 },
      marks: { outline: { caps: pts } },
    }),

  // A v-shape clause says what the pair can't both do at one end of its
  // shared side: touch it, or (which rules out the other v-shape) slant away
  // from it. `where` places that end.
  vClause: {
    one: (pt: Point, where: Where): VClause => ({
      step: "vOne",
      said: { terms: { where }, marks: { outline: { clue: [pt] } } },
    }),
    three: (pt: Point, where: Where): VClause => ({
      step: "vThree",
      said: { terms: { where }, marks: { outline: { clue: [pt] } } },
    }),
    /** One of the pair, `sq`, is placed and misses the corner `where`. */
    placed: (sq: Point, where: Where): VClause => ({
      step: "vPlaced",
      said: { terms: { where }, marks: { outline: { placed: [sq] } } },
    }),
    /**
     * Across a 2 `where`: the pair across it gives it at least one line
     * (`touch`: so these two can't both touch it) or at most one (so they
     * can't both slant away from it), because of `end` at the far side,
     * `beyond`: the pairs across the 2s after this one, the 2s themselves,
     * and the 1 or 3 that caps them, if a clue does.
     */
    across: (
      touch: boolean,
      two: Point,
      where: Where,
      end: End,
      beyond: Beyond,
    ): VClause => {
      const line = beyond.twos.length > 0;
      const read = { twos: beyond.twos, pairs: beyond.pairs };
      const capped = { line, capped: beyond.cap !== null };
      const cap = beyond.cap === null ? [] : [beyond.cap];
      const why: Steps["vAcross"]["terms"]["why"] =
        end === "one" || end === "three"
          ? {
              step: end === "one" ? "beyondOne" : "beyondThree",
              said: { terms: capped, marks: { outline: { ...read, cap } } },
            }
          : {
              step: end === "touches" ? "beyondTouches" : "beyondMisses",
              said: { terms: { line }, marks: { outline: read } },
            };
      return {
        step: "vAcross",
        said: { terms: { touch, where, why }, marks: { outline: { two: [two] } } },
      };
    },
  },

  /**
   * A pair on a straight line of 2s (`twos`) capped at each end by the same
   * kind of limit (the help's "Lines of 2s"): a 1, or a placed diagonal meeting
   * the 2 at that end, for `one`; a 3, or a diagonal missing it, otherwise.
   * `caps` are the clues that cap it, and `pairs` the pairs across its 2s.
   */
  vLine: (
    m: SlantMark,
    twos: readonly Point[],
    pairs: readonly Point[],
    one: boolean,
    caps: readonly Point[],
  ): Sentence =>
    speak.sentence("vLine", {
      ring: [m],
      terms: { one, single: twos.length === 1 },
      marks: { outline: { twos, pairs, caps } },
    }),

  /**
   * Both v-shapes carried across one 2, from the pair across it (`pair`): a
   * diagonal of that pair already `touches` the 2 (so it gives one line) or
   * misses it (so at most one), and what lies beyond the pair supplies the
   * other bound, either `end` directly or along more 2s.
   */
  vAcross: (
    m: SlantMark,
    two: Point,
    pair: readonly Point[],
    touches: boolean,
    end: End,
    beyond: Beyond,
  ): Sentence =>
    speak.sentence("vAcrossBoth", {
      ring: [m],
      terms: {
        touches,
        line: beyond.twos.length > 0,
        cap:
          end === "one" || end === "three"
            ? {
                step: "capClue",
                said: {
                  terms: { d: end === "one" ? 1 : 3, capped: beyond.cap !== null },
                  marks: { outline: { cap: beyond.cap === null ? [] : [beyond.cap] } },
                },
              }
            : { step: "capDiagonal", said: { terms: { meets: end === "touches" } } },
      },
      marks: { outline: { pair, two: [two], twos: beyond.twos, pairs: beyond.pairs } },
    }),
};

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
function whereOf(sq: number, horizontal: boolean, pt: number, w: number): Where {
  const W = w + 1;
  if (horizontal) return Math.floor(pt / W) === Math.floor(sq / w) ? "above" : "below";
  return pt % W === sq % w ? "on the left" : "on the right";
}

/** Why a v-shape (`sq * 4 + bit`) is ruled out, as the step being narrated
 * finds it. */
type WhyOf = (key: number) => VWhy | null;

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
  vWhy: WhyOf,
  key: number,
  two: number,
  touch: boolean,
  w: number,
  soln: Int8Array,
  ev: VEvidence,
): { end: "one" | "three" | "touches" | "misses"; hops: number; capAt: number } {
  let hops = 1;
  let last = two;
  for (;;) {
    const why = vWhy(key);
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
      return { end: touch ? "one" : "three", hops, capAt: why.pt };
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
    // The diagonal's pair ends the line; its far end is where a clue would be.
    const capAt = g.meet === last ? g.far : g.meet;
    return { end: touch ? "touches" : "misses", hops, capAt };
  }
}

/** Grid point index `p` of a `(w+1)`-wide grid, as a point. */
const gridPoint = (p: number, w: number): Point => ({
  x: p % (w + 1),
  y: Math.floor(p / (w + 1)),
});

/** What `ev` read beyond a 2, sorted for the words that name it: the 2s other
 * than `skip`, the squares other than `except`, and the 1 or 3 capping them. */
function beyondOf(
  ev: VEvidence,
  clues: Int8Array,
  w: number,
  skip: readonly number[],
  except: readonly number[],
): Beyond {
  const pts = [...new Set(ev.clues)].filter((p) => !skip.includes(p));
  const cap = pts.find((p) => clues[p] !== 2);
  return {
    twos: pts.filter((p) => clues[p] === 2).map((p) => gridPoint(p, w)),
    pairs: [...new Set(ev.squares)]
      .filter((s) => !except.includes(s))
      .map((s) => pointOf(s, w)),
    cap: cap === undefined ? null : gridPoint(cap, w),
  };
}

/** The clause saying why the pair can't form v-shape `key`. */
function vClause(
  vWhy: WhyOf,
  key: number,
  w: number,
  soln: Int8Array,
  clues: Int8Array,
  ev: VEvidence,
): VClause {
  const why: VWhy | null = vWhy(key);
  const sq = key >> 2;
  const g = vGeometry(sq, key & 3, w);
  if (why === null) throw new Error("slant hint: a v-shape with no reason");
  switch (why.kind) {
    case "clue": {
      ev.clues.push(why.pt);
      const where = whereOf(sq, g.horizontal, why.pt, w);
      const pt = gridPoint(why.pt, w);
      return why.c === 1 ? say.vClause.one(pt, where) : say.vClause.three(pt, where);
    }
    case "slash":
      ev.squares.push(why.sq);
      return say.vClause.placed(
        pointOf(why.sq, w),
        whereOf(sq, g.horizontal, g.meet, w),
      );
    case "two": {
      ev.clues.push(why.pt);
      const where = whereOf(sq, g.horizontal, why.pt, w);
      const touch = why.pt === g.meet;
      const sub: VEvidence = { clues: [], squares: [] };
      const { end } = lineReason(vWhy, why.from, why.pt, touch, w, soln, sub);
      ev.clues.push(...sub.clues);
      ev.squares.push(...sub.squares);
      const beyond = beyondOf(sub, clues, w, [why.pt], []);
      return say.vClause.across(touch, gridPoint(why.pt, w), where, end, beyond);
    }
  }
}

/** The sentence for a pair's two ruled-out v-shapes, `keys`: a clause each,
 * or one for both when a 1 (or a 3) sits at each end. */
function vClauses(
  vWhy: WhyOf,
  keys: number[],
  mark: SlantMark,
  w: number,
  soln: Int8Array,
  clues: Int8Array,
  ev: VEvidence,
): Sentence {
  const whys = keys.map((k) => vWhy(k));
  const [a, b] = whys;
  if (a?.kind === "clue" && b?.kind === "clue" && a.c === b.c) {
    ev.clues.push(a.pt, b.pt);
    return say.markVBoth(mark, a.c, [gridPoint(a.pt, w), gridPoint(b.pt, w)]);
  }
  // A clause carried across a 2 has its own "as", so it goes last, where the
  // sentence's closing "so" cannot be read as part of the other clause.
  const across = (k: number) => (vWhy(k)?.kind === "two" ? 1 : 0);
  const [first, second] = [...keys]
    .sort((x, y) => across(x) - across(y))
    .map((k) => vClause(vWhy, k, w, soln, clues, ev));
  return say.markV(mark, first, second);
}

/** One end of a line of 2s: how many 2s lie between the pair and the cap,
 * and the cap itself (a 1 or 3 clue, or a placed diagonal), by the kind of
 * limit it sets: `one` makes the pair next to it give the 2 beside it a line,
 * `three` lets it give at most one. */
interface LineEnd {
  at: number;
  twos: number;
  kind: "one" | "three";
  clue: boolean;
  /** What the cap is, for a line through a 2: its clue, or whether the
   * placed diagonal meets or misses the 2 beside it. */
  end?: "one" | "three" | "touches" | "misses";
  /** The point beyond the end pair, where a clue would cap the line. */
  capAt: number;
}

/** The end of the pair's line that ruled-out v-shape `key` reaches. */
function lineEnd(
  vWhy: WhyOf,
  key: number,
  w: number,
  soln: Int8Array,
  ev: VEvidence,
): LineEnd {
  const why = vWhy(key);
  if (why === null) throw new Error("slant hint: a v-shape with no reason");
  const g = vGeometry(key >> 2, key & 3, w);
  switch (why.kind) {
    case "clue":
      ev.clues.push(why.pt);
      return {
        at: why.pt,
        twos: 0,
        kind: why.c === 1 ? "one" : "three",
        clue: true,
        capAt: why.pt,
      };
    case "slash":
      // The placed square misses the meeting corner, so it touches the other
      // end: a line through that end gets a line from it; one through the
      // meeting corner gets at most one.
      ev.squares.push(why.sq);
      return { at: g.meet, twos: 0, kind: "three", clue: false, capAt: -1 };
    case "two": {
      ev.clues.push(why.pt);
      const touch = why.pt === g.meet;
      const r = lineReason(vWhy, why.from, why.pt, touch, w, soln, ev);
      return {
        at: why.pt,
        twos: r.hops,
        kind: touch ? "one" : "three",
        clue: r.end === "one" || r.end === "three",
        end: r.end,
        capAt: r.capAt,
      };
    }
  }
}

/**
 * The sentence for a pair on a straight line of 2s capped at both ends by the
 * same kind of limit, which makes every pair along the line slant alike; or
 * null when the pair's two v-shapes are not ruled out from opposite ends of
 * one such line.
 */
function vLine(
  vWhy: WhyOf,
  keys: number[],
  mark: SlantMark,
  pair: readonly number[],
  w: number,
  soln: Int8Array,
  clues: Int8Array,
  ev: VEvidence,
): Sentence | null {
  // One scratch per end, so the words can tell the pair across a 2 from the
  // pairs beyond it.
  const scratches: VEvidence[] = keys.map(() => ({ clues: [], squares: [] }));
  const [a, b] = keys.map((k, i) => lineEnd(vWhy, k, w, soln, scratches[i]));
  // A placed diagonal caps the line at the end it does not miss, and its kind
  // is the other end's: the pair gives that end exactly what the far side
  // lets it.
  for (const [cap, other] of [
    [a, b],
    [b, a],
  ]) {
    if (!cap.clue && cap.twos === 0) {
      cap.kind = other.kind;
      cap.at = -1;
      const g = vGeometry(keys[0] >> 2, keys[0] & 3, w);
      cap.capAt = other.at === g.meet ? g.far : g.meet;
    }
  }
  if (a.twos + b.twos === 0) return null;
  if (a.at === b.at) {
    // Both v-shapes are carried across the same 2, so the pair across it is
    // held from both sides: by a diagonal of its own, and from beyond.
    const own = [a, b].find((e) => e.twos === 1 && !e.clue);
    const beyond = own === a ? b : a;
    if (own === undefined || own.end === undefined || beyond.end === undefined)
      return null;
    const ownEv = scratches[own === a ? 0 : 1];
    const beyondEv = scratches[own === a ? 1 : 0];
    for (const s of scratches) {
      ev.clues.push(...s.clues);
      ev.squares.push(...s.squares);
    }
    const across = [...new Set(ownEv.squares)].filter((s) => !pair.includes(s));
    return say.vAcross(
      mark,
      gridPoint(own.at, w),
      across.map((s) => pointOf(s, w)),
      own.end === "touches",
      beyond.end,
      beyondOf(beyondEv, clues, w, [own.at], [...across, ...pair]),
    );
  }
  if (a.kind !== b.kind) throw new Error("slant hint: a line of 2s capped two ways");
  // A diagonal capping the line may have the clue that caps it just as well
  // beyond it; the clue reads more plainly.
  const digit = a.kind === "one" ? 1 : 3;
  [a, b].forEach((cap, i) => {
    if (!cap.clue && cap.capAt >= 0 && clues[cap.capAt] === digit) {
      cap.clue = true;
      scratches[i].clues.push(cap.capAt);
    }
  });
  const all: VEvidence = { clues: [], squares: [] };
  for (const s of scratches) {
    all.clues.push(...s.clues);
    all.squares.push(...s.squares);
  }
  ev.clues.push(...all.clues);
  ev.squares.push(...all.squares);
  const line = beyondOf(all, clues, w, [], pair);
  const caps = [...new Set(all.clues)]
    .filter((p) => clues[p] !== 2)
    .map((p) => gridPoint(p, w));
  if (line.twos.length !== a.twos + b.twos || caps.length !== +a.clue + +b.clue)
    throw new Error("slant hint: a line of 2s read two ways");
  return say.vLine(mark, line.twos, line.pairs, a.kind === "one", caps);
}

// --- the plan ---------------------------------------------------------------

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
  vWhy: WhyOf,
  grid: Int8Array,
  clues: Int8Array,
  cites: SlantMark[],
  w: number,
  h: number,
): Step {
  const mark = markOf(m.a, m.b, w);
  const W = w + 1;
  let words: Sentence;
  const hl: SlantHint = { mark };
  if (m.why.kind === "clue") {
    const { pt, c, pair } = m.why;
    const px = pt % W;
    const py = Math.floor(pt / W);
    hl.clues = [{ x: px, y: py }];
    const area = incidentSquares(px, py, w, h).filter((s) => grid[s.y * w + s.x] !== 0);
    if (area.length) hl.area = area;
    words = say.markClue(
      { x: px, y: py },
      c,
      sourcesOf({ x: px, y: py }, pair !== null ? cites : null, area, grid, w),
      mark,
    );
  } else {
    const lo = Math.min(m.a, m.b);
    const bits = Math.max(m.a, m.b) === lo + 1 ? [1, 0] : [3, 2];
    const ev: VEvidence = { clues: [], squares: [] };
    const keys = bits.map((bit) => lo * 4 + bit);
    words =
      vLine(vWhy, keys, mark, [m.a, m.b], w, grid, clues, ev) ??
      vClauses(vWhy, keys, mark, w, grid, clues, ev);
    const read = [...new Set(ev.clues)].map((p) => ({
      x: p % W,
      y: Math.floor(p / W),
    }));
    if (read.length) hl.clues = read;
    const area = [...new Set(ev.squares)]
      .filter((s) => s !== m.a && s !== m.b)
      .map((s) => pointOf(s, w));
    if (area.length) hl.area = area;
  }
  if (cites.length) hl.marks = cites;
  return {
    move: { type: "alike", ...mark, on: true },
    rung: m.why.kind === "clue" ? "mark-clue" : "mark-v",
    explanation: words.text,
    words,
    highlights: hl,
  };
}

/** What clue `clue` already has: the marks joining the pair it counts as one
 * line, if it counts one, and its decided squares on `grid`. */
function sourcesOf(
  clue: Point,
  pair: readonly SlantMark[] | null,
  area: readonly Point[],
  grid: Int8Array,
  w: number,
): ClueSources {
  const touching = area.filter((s) =>
    touches(s.x, s.y, grid[s.y * w + s.x], clue.x, clue.y),
  ).length;
  return { pair, area, touching };
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

/** Narrate why this leg's move is forced. */
function narrate(firing: SlantFiring, leg: number, hl: SlantHint, w: number): Sentence {
  const target = hl.target;
  if (!target) throw new Error("slant hint: a firing leg with no target");
  const cells = [target, ...(hl.siblings ?? [])];
  const area = hl.area ?? [];
  const clue = firing.clue;
  if (leg > 0) {
    if (!clue) throw new Error("slant hint: a continued firing with no clue");
    return say.continuation(clue, area, cells, firing.technique === "clue-empty");
  }
  switch (firing.technique) {
    case "clue-fill":
    case "clue-empty": {
      if (!clue) throw new Error("slant hint: a clue firing with no clue");
      // The board before this firing: its squares, which the evidence skips,
      // are empty on it.
      const src = sourcesOf(
        clue,
        firing.pair ? (hl.marks ?? []) : null,
        area,
        firing.grid,
        w,
      );
      return firing.technique === "clue-fill"
        ? say.clueFill(clue, clue.c, src, cells)
        : say.clueEmpty(clue, clue.c, src, cells);
    }
    case "loop":
      return say.loop(target, area);
    case "deadend":
      return say.deadend(target, area);
    case "equiv":
      if (!hl.ref) throw new Error("slant hint: an equivalence with no anchor");
      return say.equiv(target, hl.ref, firing.moves[0].v, hl.marks ?? []);
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
): HintResult<SlantMove, SlantHint, SlantRung> {
  const steps = stepsFrom(state);
  return steps.length === 0
    ? { ok: false, error: DEDUCTION_EXHAUSTED }
    : { ok: true, steps };
}

/** What Check & save says of the last move: a diagonal the player drew, or a
 * pair they marked alike. */
export function slantJudgeMove(
  before: SlantState,
  after: SlantState,
): MoveVerdict | null {
  const { w, h, clues } = before;
  return judgeWalked(
    before,
    after,
    (s) => shownMarks(w, h, clues, s.soln, s.alike),
    (judging) => {
      deduceHintPlan(w, h, clues, before.soln, before.alike, judging);
    },
  );
}

/** The hint's steps from `state`. */
function stepsFrom(state: SlantState): Step[] {
  const { w, h } = state;
  const plan = deduceHintPlan(w, h, state.clues, state.soln, state.alike);
  const { firings, cites } = plan;
  if (firings.length === 0) return [];
  const boardBefore = (i: number): Int8Array =>
    i === 0 ? state.soln : firings[i - 1].grid;
  const stepOf = new Map(firings.map((f, i) => [f.id, i]));

  const mergeOf = (fact: number): SlantMerge => {
    const merge = plan.merges.get(fact);
    if (merge === undefined) throw new Error(`slant hint: fact ${fact} is no merge`);
    return merge;
  };
  // Where each mark goes: before the first step that rests on it, and on the
  // marks it rests on, unless its sentence has expired by then.
  const { steps: stepFirings, before } = placeNotes(plan.graph, {
    isNote: (f) => plan.merges.has(f.id),
    isStep: (f) => f.kind === PLACE,
    expired: (note, step) =>
      !cluePremiseHolds(mergeOf(note), boardBefore(stepOf.get(step) ?? 0), w, h),
  });
  if (stepFirings.some((f, i) => f !== firings[i].id))
    throw new Error("slant hint: the graph's steps are not the firings");

  const marksOf = (path: readonly number[]) =>
    path.map((e) => {
      const [a, b] = plan.ends(e);
      return markOf(a, b, w);
    });
  const steps: Step[] = [];
  firings.forEach((firing, i) => {
    let first = true;
    const push = (step: Step) => {
      steps.push(first ? step : { ...step, continuesPrevious: true });
      first = false;
    };
    for (const fact of before[i])
      push(
        markStep(
          mergeOf(fact),
          (key) => plan.vWhy(key, fact),
          boardBefore(i),
          state.clues,
          marksOf(cites.get(plan.graph.facts[fact].firing)?.path ?? []),
          w,
          h,
        ),
      );
    const cited = cites.get(firing.id);
    for (let leg = 0; leg < firing.moves.length; leg++) {
      const highlights = firingHighlights(firing, leg, w, h);
      if (leg === 0 && cited && cited.path.length)
        highlights.marks = marksOf(cited.path);
      const anchor = cited?.anchor ?? null;
      if (anchor !== null) highlights.ref = pointOf(anchor, w);
      const words = narrate(firing, leg, highlights, w);
      push({
        move: { type: "set", ...firing.moves[leg] },
        rung: firing.technique,
        explanation: words.text,
        words,
        highlights,
      });
    }
  });
  return steps;
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
