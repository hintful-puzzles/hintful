/**
 * Net's hint: the ladder `net.description.yaml` states, walked one firing a
 * step from the player's locks, notes and walls (`ladderWalk`), each idea
 * only where every easier one has nothing left, and its words from why each
 * way of turning the tile is ruled out (`explain.ts`). A note step places a
 * side note; a lock step turns a tile and locks it, as one journey of two
 * legs. Every move is one the declared verbs make (`targetVerbs` in
 * `index.ts`), so a hint teaches the controls it plays.
 */

import { PLACE } from "../../engine/describe-runtime.ts";
import type {
  HintResult,
  HintStep,
  HintTrackVerdict,
  MoveVerdict,
  UiUpdate,
} from "../../engine/game.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { CELL, type MarkKind, type Sentence } from "../../engine/hint-words.ts";
import { type CellMarks, ladderWalk, TIERS } from "../../engine/ladder-runtime.ts";
import { type Judging, judgeWalked } from "../../engine/move-judge.ts";
import {
  anticlockwise,
  clockwise,
  D,
  DIRECTIONS,
  dirCount,
  dirX,
  dirY,
  L,
  opposite,
  R,
  U,
} from "../../engine/square-edges.ts";
import type { TargetVerbs } from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import * as net from "../../generated/games/net/net.compiled.ts";
import { Facts, type Rung, record, type Side, type Step, survey } from "./explain.ts";
import { SIDE, type SideMark } from "./hint-marks.ts";
import type { NetDrawState } from "./render.ts";
import { type Fired, ladderOf, marksOn, NONE, recordedMarks, WIRE } from "./solver.ts";
import {
  LOCKED,
  type NetMove,
  type NetState,
  type NetUi,
  NOTE_NONE,
  NOTE_UNKNOWN,
  NOTE_WIRE,
  type SideNote,
} from "./state.ts";

/** The hint's rungs: the ladder's techniques. A turn and the lock after it
 * are one firing. */
export const NET_RUNGS = net.ladder.map((e) => e.id);
export type NetRung = net.LadderId;

/** The rung of the ladder each technique is, whose reasons `explain.ts`
 * gives: a lock and a note of one idea are one rung. */
const RUNG_OF: Readonly<Record<NetRung, Rung>> = {
  fitLock: "fit",
  fitNote: "fit",
  loopLock: "loop",
  loopNote: "loop",
  sealLock: "seal",
  sealNote: "seal",
  strandLock: "strand",
  strandNote: "strand",
};

/** What keep-track compares a move against. The marks are the step's words'. */
export type NetHint =
  | { readonly kind: "note"; readonly side: SideMark }
  | { readonly kind: "turn" | "lock"; readonly at: Point; readonly wires: number };

type Verbs = TargetVerbs<NetState, NetUi, NetDrawState, Point, NetMove>;

/** The side `dir` of tile `i`, named as a note move names it. */
function sideOf(f: Facts, i: number, dir: number, note: SideNote): SideMark {
  if (dir === R || dir === D) return { x: i % f.w, y: Math.floor(i / f.w), dir, note };
  const j = f.neighbor(i, dir);
  return { x: j % f.w, y: Math.floor(j / f.w), dir: opposite(dir), note };
}

const pointOf = (f: Facts, i: number): Point => ({
  x: i % f.w,
  y: Math.floor(i / f.w),
});

// --- the words ---------------------------------------------------------------

/** What a step marks: a tile, or a side between two. */
type Marked = Point | SideMark;

const DIR_WORD: Readonly<Record<number, string>> = {
  [R]: "right",
  [U]: "up",
  [L]: "left",
  [D]: "down",
};

/** The steps of `net.description.yaml`, spoken: a mark is drawn on a tile
 * unless its sort is a side, and a value is a direction. */
const speak = net.voice<Marked>({
  kind: CELL as MarkKind<Marked>,
  kinds: { side: SIDE as MarkKind<Marked>, note: SIDE as MarkKind<Marked> },
  value: (d) => DIR_WORD[d],
});

type Steps = net.StepsById<Marked>;
/** The known sides a turning must agree with, said in place. */
type Known = Steps["tileFits"]["terms"]["known"];
/** How the turning that fails lies, said in place. */
type Way = Steps["tileTrapped"]["terms"]["way"];
/** What the turnings that fail would do, said in place. */
type Trap = Steps["tileTrapped"]["terms"]["trap"];
/** What a tile is called, by its wires: the pieces the help names. */
type Shape = Steps["tileFits"]["terms"]["shape"];

function shapeOf(wires: number): Shape {
  const n = dirCount(wires);
  if (n === 1) return "dead end";
  if (n === 3) return "T";
  if (n === 4) return "cross";
  return wires === (R | L) || wires === (U | D) ? "straight" : "corner";
}

/** The known sides a tile's turnings are held to. */
interface Fit {
  /** How many wall sides are cited. */
  readonly walls: number;
  readonly notes: readonly SideMark[];
  /** The locked tiles cited. */
  readonly locks: readonly Point[];
}

/** A square beside the step's tile that one turning of the tile would leave
 * no way to turn: what it would still have to fit besides the tile, and the
 * loops, through the striped squares, that its ways that fit would close. */
interface Stranded extends Fit {
  readonly at: Point;
  /** Its wires, which name the piece. */
  readonly wires: number;
  /** How many of its ways would close a loop. */
  readonly loops: number;
  /** Whether it is beside the tile only across the edge of a wrapping grid. */
  readonly acrossEdge: boolean;
}

/** The reasons one step rests on, gathered for its sentence. */
interface Premises extends Fit {
  /** The squares some turning would leave with no way to turn. */
  readonly stranded: readonly Stranded[];
  /** Whether some turning would close a loop, and whether some would seal a
   * group off, through or around the striped tiles. */
  readonly loop: boolean;
  readonly seal: boolean;
  readonly striped: readonly Point[];
  /** Whether every striped square is a dead end, which is what closes a group
   * off: a dead end has no other wire to lead out with. */
  readonly deadEnds: boolean;
  /** Whether a striped square is the tile's neighbor only across the edge of
   * a wrapping grid, which nothing on screen shows. */
  readonly acrossEdge: boolean;
  /** How the turnings that loop or seal point, when there is one of them:
   * its wires, or `null` for several. */
  readonly only: number | null;
}

/** The known sides `p` cites, or null where it cites none; `it`, the step's
 * tile, first where a square beside it must fit it too. */
function knownOf(p: Fit, it: boolean): Known | null {
  const outline = { note: p.notes, lock: p.locks };
  const marked = p.notes.length + p.locks.length > 0;
  if (p.walls > 0 && marked)
    return {
      step: "fitBoth",
      said: { terms: { walls: p.walls, it }, marks: { outline } },
    };
  if (p.walls > 0) return { step: "fitWalls", said: { terms: { walls: p.walls, it } } };
  if (marked) return { step: "fitMarks", said: { terms: { it }, marks: { outline } } };
  return null;
}

/** How a tile turned to `wires` lies: a straight lies across or stands
 * upright, and anything else points somewhere. */
function lying(wires: number): Way {
  if (wires === (R | L)) return { step: "lyingAcross", said: {} };
  if (wires === (U | D)) return { step: "standingUpright", said: {} };
  return {
    step: "pointing",
    said: { terms: { dirs: [U, R, D, L].filter((d) => wires & d) } },
  };
}

const verbOf = (p: Premises) =>
  p.loop && p.seal
    ? ("close a loop through or seal off" as const)
    : p.loop
      ? ("close a loop through" as const)
      : ("seal off" as const);

/** What the turnings `p` rules out by a loop, a seal or a stranded square
 * would do. `shape` names the step's own tile where it is outlined too, so
 * that a neighbor of the same piece is "the other". */
function trapOf(p: Premises, shape: Shape | null): Trap {
  const stripes = { cell: p.striped };
  const n = p.striped.length;
  const wrap = p.acrossEdge;
  // Several turnings each close off a group of their own, so the stripes are
  // their union and no one count or "join them" is true of every turning.
  if (p.only === null) {
    if (p.stranded.length === 0)
      return {
        step: "trapSome",
        said: { terms: { verb: verbOf(p), n, wrap }, marks: { stripes } },
      };
    const left = p.stranded.map((s) => s.at);
    const marks = { stripes, outline: { left } };
    return p.loop || p.seal
      ? {
          step: "trapOrLeave",
          said: { terms: { verb: verbOf(p), n, wrap, left: left.length }, marks },
        }
      : { step: "trapLeave", said: { terms: { n, left: left.length }, marks } };
  }
  const [s] = p.stranded;
  if (s) {
    const stranded = shapeOf(s.wires);
    return {
      step: "trapStrands",
      said: {
        terms: {
          stranded,
          other: stranded === shape,
          edge: s.acrossEdge,
          several: s.loops > 1,
          n,
          known: knownOf(s, true) ?? { step: "fitIt", said: {} },
        },
        marks: { stripes, outline: { square: [s.at] } },
      },
    };
  }
  if (p.seal && !p.loop && p.deadEnds)
    return n === 1
      ? { step: "trapFace", said: { terms: { wrap }, marks: { stripes } } }
      : { step: "trapJoin", said: { terms: { wrap, all: n + 1 }, marks: { stripes } } };
  return {
    step: "trapThrough",
    said: { terms: { verb: verbOf(p), n, wrap }, marks: { stripes } },
  };
}

/**
 * How a step's sentence is shaped by what rules its other ways out. With no
 * loop, seal or stranded square, the tile must fit its known sides. Where one
 * turning is trapped, how it lies comes first ("Lying across, this straight
 * would …"), so it cannot be read as describing the striped squares after
 * it, and the fit rules out the other ways where the conclusion does its
 * work. Several trapped turnings are named by what sets them apart (`others`)
 * or, beside a fit, only among the ways that fit, since the rest fall to the
 * fit and need not loop or seal at all.
 */
type Form =
  | { readonly kind: "fits"; readonly known: Known }
  | {
      readonly kind: "trapped";
      readonly way: Way;
      readonly trap: Trap;
      readonly known: Known | null;
    }
  | { readonly kind: "fitting"; readonly trap: Trap; readonly known: Known };

function formOf(p: Premises, others: Way, shape: Shape | null): Form {
  const known = knownOf(p, false);
  if (!p.loop && !p.seal && p.stranded.length === 0) {
    if (known === null) throw new Error("net hint: a step that cites nothing");
    return { kind: "fits", known };
  }
  const trap = trapOf(p, shape);
  if (p.only !== null) return { kind: "trapped", way: lying(p.only), trap, known };
  if (known === null) return { kind: "trapped", way: others, trap, known: null };
  return { kind: "fitting", trap, known };
}

/** Every sentence Net's hint speaks, from what its planner found. */
const say = {
  /** A tile left one way to turn, `wires`: turned to it, or locked where it
   * already shows it (`lock`). */
  tile: (at: Point, wires: number, p: Premises, lock: boolean): Sentence => {
    const ring = [at];
    const base = {
      shape: shapeOf(wires),
      lock,
      across: wires === (R | L),
      upright: wires === (U | D),
    };
    const form = formOf(p, { step: "pointingOther", said: {} }, null);
    if (form.kind === "fits")
      return speak.sentence("tileFits", {
        ring,
        terms: { ...base, known: form.known },
      });
    if (form.kind === "fitting")
      return speak.sentence("tileFitting", {
        ring,
        terms: { ...base, trap: form.trap, known: form.known },
      });
    const { way, trap, known } = form;
    return known === null
      ? speak.sentence("tileTrapped", { ring, terms: { ...base, way, trap } })
      : speak.sentence("tileTrappedFit", {
          ring,
          terms: { ...base, way, trap, known },
        });
  },

  /** The lock after the turn, for the turn's reason. */
  thenLock: (at: Point, wires: number): Sentence =>
    speak.sentence("thenLock", {
      ring: [at],
      terms: { shape: shapeOf(wires) },
      later: true,
    }),

  /** A side every surviving turning of the outlined `tile`, showing `wires`,
   * agrees on: `facing` is the direction from the tile to the ringed side. */
  note: (
    tile: Point,
    wires: number,
    side: SideMark,
    facing: number,
    p: Premises,
  ): Sentence => {
    const ring = [side];
    const shape = shapeOf(wires);
    const wire = side.note === NOTE_WIRE;
    const base = { shape, wire, d: facing };
    const marks = { outline: { tile: [tile] } };
    const others: Way = wire
      ? { step: "pointingBut", said: { terms: { d: facing } } }
      : { step: "pointing", said: { terms: { dirs: [facing] } } };
    const form = formOf(p, others, shape);
    if (form.kind === "fits")
      return speak.sentence("noteFits", {
        ring,
        terms: { ...base, known: form.known },
        marks,
      });
    if (form.kind === "fitting")
      return speak.sentence("noteFitting", {
        ring,
        terms: { ...base, trap: form.trap, known: form.known },
        marks,
      });
    const { way, trap, known } = form;
    return known === null
      ? speak.sentence("noteTrapped", { ring, terms: { ...base, way, trap }, marks })
      : speak.sentence("noteTrappedFit", {
          ring,
          terms: { ...base, way, trap, known },
          marks,
        });
  },
};

// --- the reasons -------------------------------------------------------------

/** The known sides some turnings contradict, by where each is known from. */
class Cited {
  private readonly walls = new Set<string>();
  private readonly notes = new Map<string, SideMark>();
  private readonly locks = new Map<number, Point>();

  constructor(private readonly f: Facts) {}

  cite(s: Side): void {
    const f = this.f;
    const src = f.from(s.at, s.dir);
    const side = sideOf(f, s.at, s.dir, f.get(s.at, s.dir) as SideNote);
    const key = `${side.x},${side.y},${side.dir}`;
    if (src.kind === "wall") this.walls.add(key);
    else if (src.kind === "note") this.notes.set(key, side);
    else this.locks.set(src.at, pointOf(f, src.at));
  }

  fit(): Fit {
    return {
      walls: this.walls.size,
      notes: [...this.notes.values()],
      locks: [...this.locks.values()],
    };
  }
}

/** The reasons `step` cites, as its sentence names them. Read before the step
 * is recorded, so each side's source is the one the board shows now. */
function premisesOf(f: Facts, step: Step): Premises {
  const own = new Cited(f);
  const stranded: Stranded[] = [];
  const trapping: number[] = [];
  let loop = false;
  let seal = false;
  const striped = new Map<number, Point>();
  const stripe = (t: number) => {
    if (t !== step.at) striped.set(t, pointOf(f, t));
  };
  // A square across the edge of a wrapping grid from the step's tile.
  const x = step.at % f.w;
  const y = Math.floor(step.at / f.w);
  const overEdge = (t: number) =>
    f.s.wrapping &&
    [R, U, L, D].some((d) => {
      const nx = x + dirX(d);
      const ny = y + dirY(d);
      const off = nx < 0 || ny < 0 || nx >= f.w || ny >= f.h;
      return off && f.neighbor(step.at, d) === t;
    });
  for (const { wires, why } of step.because) {
    if (why.kind === "side") {
      for (const s of why.sides) own.cite(s);
      continue;
    }
    trapping.push(wires);
    if (why.kind === "loop") {
      loop = true;
      for (const t of why.path) stripe(t);
    } else if (why.kind === "neighbor") {
      // The sides it shares with the step's tile are the sentence's "it".
      const fit = new Cited(f);
      let loops = 0;
      for (const way of why.ways) {
        if (way.why.kind === "loop") {
          loops++;
          for (const t of way.why.path) if (t !== why.at) stripe(t);
        } else
          for (const s of way.why.sides)
            if (f.neighbor(s.at, s.dir) !== step.at) fit.cite(s);
      }
      stranded.push({
        at: pointOf(f, why.at),
        wires: f.wires[why.at],
        ...fit.fit(),
        loops,
        acrossEdge: overEdge(why.at),
      });
    } else {
      seal = true;
      for (const t of why.group) stripe(t);
    }
  }
  return {
    ...own.fit(),
    stranded,
    loop,
    seal,
    striped: [...striped.values()],
    deadEnds:
      striped.size > 0 && [...striped.keys()].every((t) => dirCount(f.wires[t]) === 1),
    // A striped neighbor reached by stepping off one edge and on at the other.
    acrossEdge: [...striped.keys()].some(overEdge),
    only: trapping.length === 1 ? trapping[0] : null,
  };
}

/**
 * The step a firing of the ladder is, with why each way of turning its tile
 * is ruled out at the firing's rung, read before the step is recorded. A
 * lock leaves its tile one way to turn, which sets every side it placed; a
 * note leaves ways that all agree about its side. A firing whose ways
 * `explain.ts` does not rule out so is refused: the words would not be why
 * the step holds.
 */
function stepOf(f: Facts, fired: Fired, facts: readonly number[]): Step {
  const { c } = fired;
  const r = survey(f, c, RUNG_OF[fired.kind]);
  const placed = new Map<number, number>();
  for (let i = 0; i < facts.length; i += 3)
    if (facts[i] === PLACE) placed.set(facts[i + 1], facts[i + 2]);
  const sideOfEdge = (e: number): number => {
    const d = [R, U, L, D].find((x) => f.g.sideEdge[c * 16 + x] === e);
    if (d === undefined) throw new Error(`net hint: edge ${e} is no side of tile ${c}`);
    return d;
  };
  const agrees = (wires: number): boolean =>
    [...placed].every(([e, v]) => ((wires & sideOfEdge(e)) !== 0) === (v === WIRE));
  if (fired.e === undefined) {
    const [wires] = r.alive;
    if (r.alive.length !== 1 || !agrees(wires))
      throw new Error(`net hint: ${fired.kind} at ${c} leaves ${r.alive.length} ways`);
    return { kind: "lock", at: c, wires, because: r.ruledOut };
  }
  const dir = sideOfEdge(fired.e);
  const wire = placed.get(fired.e) === WIRE;
  if (placed.get(fired.e) !== WIRE && placed.get(fired.e) !== NONE)
    throw new Error(`net hint: ${fired.kind} at ${c} placed nothing on its side`);
  if (r.alive.length === 0 || !r.alive.every(agrees))
    throw new Error(`net hint: ${fired.kind} at ${c} leaves ways that disagree`);
  return {
    kind: "note",
    at: c,
    dir,
    value: wire ? NOTE_WIRE : NOTE_NONE,
    alive: r.alive,
    // Only the ways that would say otherwise about this side need a reason.
    because: r.ruledOut.filter((b) => ((b.wires & dir) !== 0) !== wire),
  };
}

/** The one rotation (`A`, `C` or `F`) that turns `from` into `to`. */
function rotationOf(from: number, to: number): "A" | "C" | "F" {
  if (anticlockwise(from) === to) return "A";
  if (clockwise(from) === to) return "C";
  return "F";
}

/** The move a verb makes at `at`, which a step's own state must allow. */
function verbMove(
  verbs: Verbs,
  op: "A" | "C" | "F" | "L",
  s: NetState,
  at: Point,
  ui: NetUi,
): NetMove {
  const [halfTurn, lock] = verbs.keyOnly ?? [];
  const verb =
    op === "A"
      ? verbs.primary
      : op === "C"
        ? verbs.secondary
        : op === "L"
          ? lock
          : halfTurn;
  const m: NetMove | UiUpdate | null = verb?.apply(s, at, ui) ?? null;
  if (m === null || typeof m !== "object")
    throw new Error(`net hint: the ${op} verb makes no move at ${at.x},${at.y}`);
  return m;
}

export function netHint(
  state: NetState,
  verbs: Verbs,
  ui: NetUi,
): HintResult<NetMove, NetHint, NetRung> {
  const steps = stepsFrom(state, verbs, ui);
  return steps.length === 0
    ? { ok: false, error: DEDUCTION_EXHAUSTED }
    : { ok: true, steps };
}

/** The marks the hint reads off the player's walls, notes and locks, which
 * a judged move's facts are the difference of. */
const shownMarks = (state: NetState): CellMarks => {
  const { g, dl } = ladderOf(state);
  return marksOn(g, recordedMarks(state, g, dl));
};

/** What Check & save says of the last move: a lock or a note the player
 * made. */
export function netJudgeMove(
  before: NetState,
  after: NetState,
  verbs: Verbs,
  ui: NetUi,
): MoveVerdict | null {
  return judgeWalked(before, after, shownMarks, (judging) =>
    stepsFrom(before, verbs, ui, judging),
  );
}

/** The hint's steps from `state`, aimed at a judged move's facts with
 * `judging`. */
function stepsFrom(
  state: NetState,
  verbs: Verbs,
  ui: NetUi,
  judging?: Judging,
): HintStep<NetMove, NetHint, NetRung>[] {
  const { g, dl, ladder } = ladderOf(state);
  const m = marksOn(g, recordedMarks(state, g, dl));
  // The firings the walk takes, by their place in its graph.
  const firings: Fired[] = [];
  // The tiles a firing reads: its own, and those across its sides.
  const reads = (taken: { reasons: readonly object[] }): number[] => {
    const { c } = taken.reasons[0] as Fired;
    const out = [c];
    for (const e of g.sp.cellEdges[c]) {
      const a = g.sp.edgeEnds[2 * e];
      out.push(a === c ? g.sp.edgeEnds[2 * e + 1] : a);
    }
    return out;
  };
  // Each idea, and a note after a lock, only once every one before it has
  // nothing anywhere: the easiest reason first, as a player would look.
  const ids = ladder.entries.map((e) => e.id);
  const walk = ladderWalk(m, ladder.entries, { [TIERS]: 0 }, reads, {
    fallback: ids.slice(1),
    ...(judging ? { aim: judging.aim } : {}),
  });
  if (judging) judging.graph = walk.graph;
  const f = new Facts(state, g, dl, m, walk.graph, firings);
  let s = state;
  const steps: HintStep<NetMove, NetHint, NetRung>[] = [];
  const say1 = (step: Step, rung: NetRung): void => {
    const p = premisesOf(f, step);
    const at = pointOf(f, step.at);
    if (step.kind === "note") {
      const side = sideOf(f, step.at, step.dir, step.value);
      const words = say.note(at, s.tiles[step.at] & 0xf, side, step.dir, p);
      const move: NetMove = {
        type: "note",
        x: side.x,
        y: side.y,
        dir: side.dir,
        note: side.note,
      };
      steps.push({
        move,
        rung,
        explanation: words.text,
        words,
        highlights: { kind: "note", side },
      });
    } else {
      const shows = s.tiles[step.at] & 0xf;
      if (shows !== step.wires) {
        const turn = verbMove(verbs, rotationOf(shows, step.wires), s, at, ui);
        const words = say.tile(at, step.wires, p, false);
        steps.push({
          move: turn,
          rung,
          explanation: words.text,
          words,
          highlights: { kind: "turn", at, wires: step.wires },
        });
        const tiles = Uint8Array.from(s.tiles);
        tiles[step.at] = step.wires;
        s = { ...s, tiles };
      }
      const lock = verbMove(verbs, "L", s, at, ui);
      const words =
        shows !== step.wires
          ? say.thenLock(at, step.wires)
          : say.tile(at, step.wires, p, true);
      steps.push({
        move: lock,
        rung,
        explanation: words.text,
        words,
        highlights: { kind: "lock", at, wires: step.wires },
        continuesPrevious: shows !== step.wires,
      });
      const tiles = Uint8Array.from(s.tiles);
      tiles[step.at] = step.wires | LOCKED;
      s = { ...s, tiles };
    }
    record(f, step);
  };
  // A tile whose every side its neighbors settled gives the ladder nothing
  // to place, so it is locked here, as the one way its known sides fit.
  const lockIfSettled = (c: number): void => {
    if (f.locked[c] || DIRECTIONS.some((d) => f.get(c, d) === NOTE_UNKNOWN)) return;
    const r = survey(f, c, "fit");
    if (r.alive.length !== 1)
      throw new Error(
        `net hint: tile ${c} has every side known and ${r.alive.length} ways`,
      );
    say1({ kind: "lock", at: c, wires: r.alive[0], because: r.ruledOut }, "fitLock");
  };
  for (let c = 0; c < f.area; c++) lockIfSettled(c);
  while (!judging?.done(m)) {
    const known = walk.graph.facts.length;
    const from = steps.length;
    const taken = walk.next();
    if (taken === null || taken === "contradiction") break;
    const fired = taken.reasons[0] as Fired;
    firings.push(fired);
    const placed = new Set<number>();
    for (let i = 0; i < taken.facts.length; i += 3)
      if (taken.facts[i] === PLACE) placed.add(taken.facts[i + 1]);
    // The walk returns with the firing's sides on the marks; its sentence
    // finds them open.
    f.before(placed, () => say1(stepOf(f, fired, taken.facts), fired.kind));
    // The tiles it settled are locked as its steps: they are what it decided.
    for (const c of reads(taken)) lockIfSettled(c);
    judging?.took(walk.graph, known, taken.entry.name, steps.length > from);
  }
  return steps;
}

/**
 * A note step completes when the move places its note; a turn when the tile
 * ends up showing the step's wiring, and is on track when it is turned some
 * other way (the step then asks for the rest of the turn); a lock when the
 * tile is locked showing it. Anything else drops the plan.
 */
export function netHintKeepTrack(
  m: NetMove,
  step: HintStep<NetMove, NetHint, NetRung>,
  state: NetState,
): HintTrackVerdict {
  const h = step.highlights;
  if (!h) return "off";
  if (h.kind === "note")
    return m.type === "note" &&
      m.x === h.side.x &&
      m.y === h.side.y &&
      m.dir === h.side.dir &&
      m.note === h.side.note
      ? "completed"
      : "off";
  if (m.type === "rotate" && h.kind === "turn" && m.x === h.at.x && m.y === h.at.y) {
    const now = state.tiles[m.y * state.w + m.x] & 0xf;
    const turned =
      m.op === "A" ? anticlockwise(now) : m.op === "C" ? clockwise(now) : opposite(now);
    if (turned === h.wires) return "completed";
    step.move = { type: "rotate", op: rotationOf(turned, h.wires), x: m.x, y: m.y };
    return "onTrack";
  }
  if (m.type === "lock" && h.kind === "lock" && m.x === h.at.x && m.y === h.at.y) {
    const now = state.tiles[m.y * state.w + m.x];
    return (now & 0xf) === h.wires && !(now & LOCKED) ? "completed" : "off";
  }
  return "off";
}
