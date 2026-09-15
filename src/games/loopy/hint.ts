/**
 * Loopy's explained hint: the plan, walked on a copy of the player's own board.
 *
 * **Threaded through the solver, not written beside it.** Loopy's rungs are the
 * solver's own (`solver.ts`), run with a recorder that names the premise behind
 * each change and returns at the first one, and with the tiers tried easiest
 * first ({@link nextFiring}). The generator never builds a recorder, so no board
 * changes; the frozen differential is the proof.
 *
 * **Sound because the mistake check vouches for every mark.** `findMistakes`
 * compares the board with its unique solution and the hint refuses on any wrong
 * line or ruled-out edge, so the plan may take the player's marks as facts.
 *
 * **Facts the board cannot show are drawn and, past one, numbered.** From Normal
 * the solver reasons about corners and pairs of edges (`record.ts`), which the
 * player has no way to mark. A step resting on one corner that its sentence can
 * explain in words shows that corner unnumbered; any other step draws every fact
 * behind it with its position in the chain, and names the rule that links them
 * (docs/games/hints.md § "Number the chain").
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  CONTRADICTION_UNLOCALIZED,
  commonHintRefusal,
  DEDUCTION_EXHAUSTED,
} from "../../engine/hint-refusal.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import {
  type CornerBound,
  type CornerSubject,
  type CornerThen,
  say,
} from "./hint-text.ts";
import type { LoopyMove, LoopyOp } from "./index.ts";
import { firingRoots, type LoopyFact } from "./record.ts";
import {
  hintBoardSolved,
  hintSolver,
  type LoopyFiring,
  nextFiring,
  type SolverState,
} from "./solver.ts";
import { LINE_UNKNOWN, LINE_YES, type LoopyState } from "./state.ts";

/** A corner fact on display: a wedge at `dot` between `edges`. */
export interface LoopyHintCorner {
  readonly dot: number;
  readonly edges: readonly [number, number];
  /** The loop needs a line here: drawn filled. */
  readonly atLeastOne: boolean;
  /** The loop has room for one line here at most: drawn outlined. */
  readonly atMostOne: boolean;
  /** The chain positions of the facts this mark shows, or none on a step that
   * explains its one corner in words. */
  readonly labels: readonly number[];
}

/** A pair on display: two edges that match, or are opposites. */
export interface LoopyHintRelation {
  readonly edges: readonly [number, number];
  readonly opposite: boolean;
  readonly label: number;
}

export interface LoopyHint {
  /** The edges the step sets. */
  readonly targets: readonly number[];
  /** The clues the sentence names or counts: outlined. */
  readonly faces: readonly number[];
  /** The dot the sentence names: ringed. */
  readonly dots: readonly number[];
  /** Lines the sentence cites: the loop an edge would close, or the edge a pair
   * relates this one to. */
  readonly edges: readonly number[];
  readonly corners: readonly LoopyHintCorner[];
  readonly relations: readonly LoopyHintRelation[];
}

type Marks = Omit<LoopyHint, "targets">;

/** One firing as the plan keeps it: the board just before it, and the facts it
 * rests on, deepest first. */
interface Planned extends LoopyFiring {
  readonly before: Uint8Array;
  /** The recorder's facts. The list only grows, so every id stays valid. */
  readonly facts: readonly LoopyFact[];
  readonly closure: readonly number[];
}

type PlanStatus = "solved" | "incomplete";

/** The whole plan from the player's position. `contradiction` when the solver
 * found the marks inconsistent, which only a board no solution vouches for can
 * reach. */
export function deduceLoopyPlan(state: LoopyState): {
  plan: Planned[];
  contradiction: boolean;
} {
  const ss = hintSolver(state);
  const rec = ss.rec;
  if (rec === null) throw new Error("loopy hint: the hint solver has no recorder");
  const budget = stepBudget("loopy hint plan");
  const { plan } = deduceHintPlan<SolverState, Planned, PlanStatus>({
    board: ss,
    status: (b) => (hintBoardSolved(b) ? "solved" : "incomplete"),
    incomplete: "incomplete",
    next: (b) => {
      const f = nextFiring(b, () => budget.tick());
      if (f === null) return null;
      const before = b.state.lines.slice();
      for (const op of f.ops) before[op.edge] = LINE_UNKNOWN;
      return {
        ...f,
        before,
        facts: rec.facts,
        closure: rec.closure(firingRoots(f.reason)),
      };
    },
  });
  return { plan, contradiction: ss.status === "mistake" };
}

/** A corner fact read straight off a dot's own lines. */
const fromDot = (f: LoopyFact): boolean =>
  f.kind === "corner" && (f.why.kind === "lineElsewhere" || f.why.kind === "onlyWayOn");

/** A corner fact read off a clue's count with no other corner in the count. */
const fromClueAlone = (f: LoopyFact): boolean =>
  f.kind === "corner" && f.why.kind === "clue" && f.why.witness.corners.length === 0;

/**
 * Whether a sentence can carry every fact the step rests on, so nothing needs a
 * number: a count leaning only on corners whose dots show why, or one corner
 * read off one clue. Everything else is a chain.
 */
function explainedInWords(p: Planned): boolean {
  const facts = p.closure.map((id) => p.facts[id]);
  switch (p.reason.kind) {
    case "clueBound":
      return facts.every(fromDot);
    case "corner":
    case "cornerExit":
      return facts.every(fromClueAlone);
    default:
      return facts.length === 0;
  }
}

/** The marks for a step's hidden facts, and each fact's chain position. */
function factMarks(
  p: Planned,
  numbered: boolean,
): {
  corners: LoopyHintCorner[];
  relations: LoopyHintRelation[];
  labelOf: Map<number, number>;
} {
  const labelOf = new Map<number, number>();
  p.closure.forEach((id, i) => {
    labelOf.set(id, i + 1);
  });
  const corners = new Map<string, LoopyHintCorner & { labels: number[] }>();
  const relations: LoopyHintRelation[] = [];
  for (const id of p.closure) {
    const f = p.facts[id];
    const label = labelOf.get(id) ?? 0;
    if (f.kind === "relation") {
      relations.push({ edges: f.edges, opposite: f.opposite, label });
      continue;
    }
    const [a, b] = f.edges;
    const key = `${f.dot}:${Math.min(a, b)}:${Math.max(a, b)}`;
    const mark = corners.get(key) ?? {
      dot: f.dot,
      edges: f.edges,
      atLeastOne: false,
      atMostOne: false,
      labels: [],
    };
    corners.set(key, {
      ...mark,
      atLeastOne: mark.atLeastOne || f.bound === "atLeastOne",
      atMostOne: mark.atMostOne || f.bound === "atMostOne",
      labels: numbered ? [...mark.labels, label] : [],
    });
  }
  return { corners: [...corners.values()], relations, labelOf };
}

/** The lines of the drawn chain an edge's dots already belong to. */
function chainThrough(state: LoopyState, lines: Uint8Array, edge: number): number[] {
  const g = state.grid;
  const seen = new Set<number>([g.edges[edge].dot1.index]);
  const queue = [g.edges[edge].dot1.index];
  const out: number[] = [];
  for (let i = 0; i < queue.length; i++) {
    for (const e of g.dots[queue[i]].edges) {
      if (lines[e.index] !== LINE_YES) continue;
      if (!out.includes(e.index)) out.push(e.index);
      for (const d of [e.dot1.index, e.dot2.index]) {
        if (seen.has(d)) continue;
        seen.add(d);
        queue.push(d);
      }
    }
  }
  return out;
}

const yesAround = (
  edges: readonly ({ index: number } | null)[],
  lines: Uint8Array,
): number => edges.filter((e) => e !== null && lines[e.index] === LINE_YES).length;

/** The clues a loop closed by `edge` would leave unmet. */
function unmetClues(state: LoopyState, lines: Uint8Array, edge: number): number[] {
  const g = state.grid;
  const out: number[] = [];
  for (let i = 0; i < g.numFaces; i++) {
    const clue = state.clues[i];
    if (clue < 0) continue;
    const f = g.faces[i];
    const gains = f.edges.some((e) => e?.index === edge) ? 1 : 0;
    if (yesAround(f.edges, lines) + gains !== clue) out.push(i);
  }
  return out;
}

/** Whether a chain of relations makes its two ends opposites. */
const pathOpposite = (facts: readonly LoopyFact[], path: readonly number[]): boolean =>
  path.reduce((opp, id) => {
    const f = facts[id];
    return f.kind === "relation" && f.opposite ? !opp : opp;
  }, false);

function cornerFact(p: Planned, id: number): LoopyFact & { kind: "corner" } {
  const f = p.facts[id];
  if (f.kind !== "corner")
    throw new Error("loopy hint: a corner premise that is not a corner");
  return f;
}

/** The sentence and the marks for one firing. */
function narrate(state: LoopyState, p: Planned): { explanation: string; marks: Marks } {
  const r = p.reason;
  const count = p.ops.length;
  const line = p.ops[0].state === LINE_YES;
  const numbered = !explainedInWords(p);
  const { corners, relations, labelOf } = factMarks(p, numbered);
  const labels = (ids: readonly number[]): number[] =>
    ids.map((id) => labelOf.get(id) ?? 0);
  const clue = (face: number): number => state.clues[face];
  const base: Marks = { faces: [], dots: [], edges: [], corners, relations };
  const done = (explanation: string, marks: Partial<Marks> = {}) => ({
    explanation,
    marks: { ...base, ...marks },
  });

  switch (r.kind) {
    case "clueFull":
      return done(say.clueFull(clue(r.face), count), { faces: [r.face] });
    case "clueStarved":
      return done(say.clueStarved(clue(r.face), count), { faces: [r.face] });
    case "clueOneShort":
      return done(say.clueOneShort(clue(r.face)), { faces: [r.face], dots: [r.dot] });
    case "deadEnd":
      return done(say.deadEnd, { dots: [r.dot] });
    case "lineContinues":
      return done(say.lineContinues, { dots: [r.dot] });
    case "dotFull":
      return done(say.dotFull(count), { dots: [r.dot] });

    case "earlyLoop": {
      const edge = p.ops[0].edge;
      const loop = chainThrough(state, p.before, edge);
      const unmet = r.because === "unmetClues" ? unmetClues(state, p.before, edge) : [];
      return done(say.earlyLoop(r.because, unmet.length), {
        edges: loop,
        faces: unmet,
      });
    }
    case "closesLoop":
      return done(say.closesLoop, {
        edges: chainThrough(state, p.before, p.ops[0].edge),
      });

    case "clueBound": {
      const c = clue(r.face);
      const w = r.witness;
      const faces = [r.face];
      if (line) {
        return done(
          numbered
            ? say.boundLineChain(c, labels(w.corners))
            : say.boundLine(c, w.corners.length),
          { faces },
        );
      }
      return done(
        numbered
          ? say.boundEmptyChain(c, labels(w.corners))
          : say.boundEmpty(c, w.corners.length),
        { faces },
      );
    }

    case "corner":
    case "cornerExit": {
      const ids = r.kind === "corner" ? [r.fact] : [...r.facts];
      const first = cornerFact(p, ids[0]);
      const bound: CornerBound = ids.length === 2 ? "exactlyOne" : first.bound;
      const [a, b] = first.edges;
      const bothOpen = p.before[a] === LINE_UNKNOWN && p.before[b] === LINE_UNKNOWN;
      let then: CornerThen;
      if (r.kind === "cornerExit") then = "exit";
      else if (bound === "atLeastOne") then = bothOpen ? "bothLines" : "otherLine";
      else then = bothOpen ? "neither" : "otherEmpty";

      let subject: CornerSubject;
      let faces: number[] = [];
      if (numbered || first.why.kind !== "clue") {
        subject = { kind: "numbered", labels: labels(ids), bound };
      } else {
        const face = first.why.face;
        faces = [face];
        subject = {
          kind: "clue",
          clue: clue(face),
          total: first.why.witness.total,
          bound,
        };
      }
      const ringed = then === "bothLines" || then === "neither" || then === "exit";
      return done(say.corner(subject, then), {
        faces,
        dots: ringed ? [r.kind === "cornerExit" ? r.dot : first.dot] : [],
      });
    }

    case "matchingPair":
      return done(say.matchingPair(clue(r.face), r.path.length, line), {
        faces: [r.face],
      });

    case "parity": {
      const opposite = pathOpposite(p.facts, r.path);
      const pairs = r.path.length;
      if (r.face !== null) {
        const face = state.grid.faces[r.face];
        const needed = clue(r.face) - yesAround(face.edges, p.before);
        return done(say.parityFace(clue(r.face), needed, pairs, opposite, line), {
          faces: [r.face],
        });
      }
      const dot = r.dot ?? 0;
      const dotLines = yesAround(state.grid.dots[dot].edges, p.before);
      return done(say.parityDot(dotLines, pairs, opposite, line), { dots: [dot] });
    }

    case "related": {
      const opposite = pathOpposite(p.facts, r.path);
      const fromLine = p.before[r.from] === LINE_YES;
      return done(say.related(r.path.length, opposite, fromLine, line), {
        edges: [r.from],
      });
    }
  }
}

function stepOf(state: LoopyState, p: Planned): HintStep<LoopyMove, LoopyHint> {
  const ops: LoopyOp[] = p.ops.map(({ edge, state: to }) => ({ edge, state: to }));
  const { explanation, marks } = narrate(state, p);
  return {
    move: { kind: "set", ops },
    explanation,
    highlights: { targets: ops.map((o) => o.edge), ...marks },
  };
}

export function hint(
  state: LoopyState,
  mistakes: number,
): HintResult<LoopyMove, LoopyHint> {
  const refusal = commonHintRefusal(state.completed, mistakes);
  if (refusal) return refusal;
  const { plan, contradiction } = deduceLoopyPlan(state);
  if (plan.length === 0) {
    return {
      ok: false,
      error: contradiction ? CONTRADICTION_UNLOCALIZED : DEDUCTION_EXHAUSTED,
    };
  }
  return { ok: true, steps: plan.map((p) => stepOf(state, p)) };
}

/** A move follows the step when every edge it sets is one of the step's, set the
 * way the step sets it; it completes the step once all of them are. Handed the
 * board before the move. */
export function hintKeepTrack(
  m: LoopyMove,
  step: HintStep<LoopyMove>,
  state: LoopyState,
): HintTrackVerdict {
  if (m.kind !== "set") return "off";
  const want = new Map(step.move.ops.map((o) => [o.edge, o.state]));
  for (const op of m.ops) if (want.get(op.edge) !== op.state) return "off";
  const moved = new Map(m.ops.map((o) => [o.edge, o.state]));
  for (const [edge, to] of want) {
    if ((moved.get(edge) ?? state.lines[edge]) !== to) return "onTrack";
  }
  return "completed";
}

/** Drop the edges the board already has as the step wants them. */
export function refreshHintStep(
  step: HintStep<LoopyMove>,
  state: LoopyState,
): HintStep<LoopyMove> | null {
  const ops = step.move.ops.filter((o) => state.lines[o.edge] !== o.state);
  if (ops.length === step.move.ops.length) return step;
  if (ops.length === 0) return null;
  const highlights = step.highlights as LoopyHint;
  return {
    ...step,
    move: { ...step.move, ops },
    highlights: { ...highlights, targets: ops.map((o) => o.edge) },
  };
}
