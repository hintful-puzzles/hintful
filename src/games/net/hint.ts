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
  UiUpdate,
} from "../../engine/game.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { ladderWalk, TIERS } from "../../engine/ladder-runtime.ts";
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
import { Facts, type Rung, record, type Side, type Step, survey } from "./explain.ts";
import {
  type Fit,
  type Premises,
  type SideMark,
  type Stranded,
  say,
} from "./hint-text.ts";
import * as net from "./net.compiled.ts";
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
  });
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
        const words = say.turn(at, step.wires, p);
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
          : say.lock(at, step.wires, p);
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
  for (
    let taken = walk.next();
    taken !== null && taken !== "contradiction";
    taken = walk.next()
  ) {
    const fired = taken.reasons[0] as Fired;
    firings.push(fired);
    const placed = new Set<number>();
    for (let i = 0; i < taken.facts.length; i += 3)
      if (taken.facts[i] === PLACE) placed.add(taken.facts[i + 1]);
    // The walk returns with the firing's sides on the marks; its sentence
    // finds them open.
    f.before(placed, () => say1(stepOf(f, fired, taken.facts), fired.kind));
    for (const c of reads(taken)) lockIfSettled(c);
  }
  if (steps.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps };
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
