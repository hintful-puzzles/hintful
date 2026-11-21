/**
 * A hint's walk over a compiled ladder, one firing a call: which firing it
 * takes, the graph of the facts it made, and the walk as a check replays it
 * (`docs/hints.md` § "Recording the deduction").
 */

import type { Traced } from "../hint/move-judge.ts";
import type { CellMarks } from "./cell-marks.ts";
import type { DeductionTechnique } from "./deduction-fixpoint.ts";
import { singleFirings } from "./deduction-fixpoint.ts";
import {
  MARK,
  PLACE,
  RELATE,
  type Reads,
  STRIKE,
  STRIKE_EDGE,
} from "./describe-runtime.ts";
import { FactGraph, readsOf } from "./fact-graph.ts";
import {
  admits,
  type Caps,
  compiledTechniques,
  type Firing,
  type LadderEntry,
} from "./ladder-runtime.ts";
import { stepBudget } from "./step-budget.ts";

/** A firing a walk took, with the ladder entry that made it. */
export interface Taken<S extends CellMarks = CellMarks> extends Firing {
  entry: LadderEntry<S>;
}

/** A hint's walk over a ladder, one firing a call ({@link ladderWalk}). */
export interface LadderWalk<S extends CellMarks = CellMarks> {
  /** The firing taken and made, `null` once none is left, or
   * `"contradiction"` where a technique finds the marks inconsistent. */
  next(): Taken<S> | null | "contradiction";
  /** The facts the firings taken so far made, each with its firing and
   * parents, and what any of them rests on. */
  readonly graph: FactGraph;
  /** Each firing taken, in order, with the graph's facts it made. */
  readonly taken: readonly Walked<S>[];
  /**
   * The walk as a check replays it (`move-judge.ts`), on marks `fresh`
   * makes as the walk began. From then on the walk keeps what its builder
   * writes to the marks beside the firings, as the firing before's: Pearl's
   * step draws the line a pearl carries on, Map's settle colors what the
   * steps' legs colored.
   */
  trace(fresh: () => S): Traced;
}

/** A firing a walk took, and the graph's facts it made: its own, in order
 * from `from`, then those its placements made (`ladder-runtime.ts`'s `placingRung`), then
 * what its builder wrote beside it ({@link LadderWalk.trace}), up to `to`. */
export interface Walked<S extends CellMarks = CellMarks> {
  readonly firing: Taken<S>;
  readonly from: number;
  readonly to: number;
}

/**
 * A hint's walk over a compiled ladder at `caps`, one firing a call: of every
 * firing the ladder could make, the one that continues from what the walk's
 * latest firings wrote (`hint-frontier.ts`, the owner's rule), the ladder's
 * order breaking ties, and never one of a higher tier than the first firing
 * the ladder's order would take, so a hint never teaches harder reasoning
 * than the board needs where it stands. `reads` says which cells a firing's
 * premise reads. Each firing is made on `m` as a group of its own, recorded
 * where `m` has a recorder. The walk is `singleFirings`' continuing driver
 * over the compiled firings, so it is the one every ladder hint is. `roles`
 * names the techniques it takes as `DeductionTechnique`'s `prerequisite`
 * and `fallback` (Galaxies: a dot's own squares come first, and a mirrored
 * line only where nothing else follows). What the walk keys continuity on is
 * the game's: a cell by default, each fact's, or whatever `writes` names,
 * in the elements `reads` names too (Path's numbers, whose line a player
 * follows).
 */
export function ladderWalk<S extends CellMarks>(
  m: S,
  entries: readonly LadderEntry<S>[],
  caps: Caps,
  reads: (firing: Taken<S>) => readonly number[],
  roles: {
    readonly prerequisite?: readonly string[];
    readonly fallback?: readonly string[];
    readonly writes?: (firing: Taken<S>) => readonly number[];
    /**
     * What a firing rests on where the game knows a narrower answer than the
     * formula's reads: a firing that reads a whole set of marks (every edge a
     * path may cross) but cites one path through it (Slant's `same`). Asked
     * on the marks as they stand before the firing's facts are made;
     * `null` keeps what the formula read. One `Reads` for each fact of the
     * firing, in order, where the facts rest on different things.
     */
    readonly citing?: (firing: Taken<S>) => Reads | null | readonly (Reads | null)[];
    /**
     * The firings to take before any other, on whichever rung and at
     * whichever tier they are offered, ranked (0 for none, the highest
     * first): a check walks to the facts of the move it judges, and takes
     * the firing that makes the most of them the moment one is on offer.
     */
    readonly aim?: (firing: Taken<S>) => number;
  } = {},
): LadderWalk<S> {
  // An edge's mark, or value, is written as its two cells are.
  const cellsOf = (facts: readonly number[]): number[] => {
    const out: number[] = [];
    const ends = m.sp.edgeEnds;
    for (let i = 0; i < facts.length; i += 3) {
      const at = facts[i + 1];
      if (facts[i] === MARK) out.push(at);
      else if (facts[i] === STRIKE_EDGE && m.markOn === "cell") out.push(at);
      else if (facts[i] === STRIKE_EDGE && m.markOn === "angle")
        out.push(m.sp.angleCell[at]);
      else if (facts[i] === RELATE) {
        const f = facts[i + 2] >> 2;
        out.push(ends[2 * at], ends[2 * at + 1], ends[2 * f], ends[2 * f + 1]);
      } else if (facts[i] === STRIKE_EDGE || m.onEdges)
        out.push(ends[2 * at], ends[2 * at + 1]);
      else out.push(at);
    }
    return out;
  };
  let taken: Taken<S> | null = null;
  // A graph the caller set keeps what it recorded before the walk: the
  // strikes a given diagonal made as the marks were seeded.
  const graph = m.graph ?? new FactGraph();
  m.graph = graph;
  const walked: Walked<S>[] = [];
  // The marks as the last firing left them, kept once a check traces the
  // walk.
  let shot: Shot | null = null;
  // What the builder wrote to the marks since the last firing, recorded as
  // that firing's: facts the graph has not got already (a placement's cull),
  // which say nothing of what they read.
  const adopt = (): void => {
    const last = walked.at(-1);
    if (shot === null || last === undefined) return;
    const kept = new Set(
      graph.facts.slice(last.from).map((g) => `${g.kind},${g.about.at},${g.value}`),
    );
    const facts = writtenSince(shot, m);
    const left: number[] = [];
    for (let i = 0; i < facts.length; i += 3)
      if (!kept.has(`${facts[i]},${facts[i + 1]},${facts[i + 2]}`))
        left.push(facts[i], facts[i + 1], facts[i + 2]);
    if (left.length > 0) graph.record(left, null);
    if (graph.facts.length !== last.to)
      walked[walked.length - 1] = { ...last, to: graph.facts.length };
    shot = shotOf(m);
  };
  const techniques = entries
    .filter((e) => admits(e, caps))
    .map((entry): DeductionTechnique => {
      const { firings } = entry.run;
      return {
        id: entry.id,
        tier: entry.tier,
        prerequisite: roles.prerequisite?.includes(entry.id),
        fallback: roles.fallback?.includes(entry.id),
        run: () => entry.run(m),
        available: () => {
          const got = firings(m);
          if (got === "contradiction") return got;
          return got.map((firing) => {
            const f: Taken<S> = { ...firing, entry };
            return {
              aimed: roles.aim?.(f) ?? 0,
              reads: () => reads(f),
              writes: () => (roles.writes ? roles.writes(f) : cellsOf(f.facts)),
              take: () => {
                // What the builder wrote since the last firing is that one's.
                adopt();
                const from = graph.facts.length;
                if (shot !== null) shot = shotOf(m);
                graph.record(f.facts, roles.citing?.(f) ?? readsOf(f));
                m.group++;
                m.applyFacts(f.facts, (i) => f.reasons[i / 3]);
                walked.push({ firing: f, from, to: graph.facts.length });
                // And what the firing's strikes set off beside its facts
                // (`CellMarks.striking`), which records none, is this one's.
                adopt();
                taken = f;
              },
            };
          });
        },
      };
    });
  const driver = singleFirings({
    techniques: compiledTechniques(techniques),
    budget: m.budget ?? stepBudget("ladder walk"),
    continuing: true,
    aimed: roles.aim !== undefined,
  });
  return {
    graph,
    taken: walked,
    next() {
      taken = null;
      if (driver.next() === null) return driver.impossible() ? "contradiction" : null;
      return taken;
    },
    trace(fresh) {
      shot = shotOf(m);
      return { graph, walked, fresh, adopt };
    },
  };
}

/** The marks a walk's builder may write beside its firings. */
interface Shot {
  readonly grid: Uint8Array | Int8Array | Int16Array;
  readonly cands: Int32Array;
  readonly edgeCands: Int32Array;
  readonly marked: Int32Array;
}

const shotOf = (m: CellMarks): Shot => ({
  grid: m.grid.slice(),
  cands: m.cands.slice(),
  edgeCands: m.edgeCands.slice(),
  marked: m.marked.slice(),
});

/** The facts marks `m` hold that they did not at `shot`: a value placed (and
 * not the strikes its cell's other values took with it), a candidate or an
 * edge's mark struck, a cell marked. */
function writtenSince(shot: Shot, m: CellMarks): number[] {
  const out: number[] = [];
  for (let c = 0; c < m.grid.length; c++) {
    if (m.grid[c] !== 0) {
      if (shot.grid[c] === 0) out.push(PLACE, c, m.grid[c]);
      continue;
    }
    for (let gone = shot.cands[c] & ~m.cands[c]; gone !== 0; gone &= gone - 1)
      out.push(STRIKE, c, 31 - Math.clz32(gone & -gone));
  }
  for (let e = 0; e < m.edgeCands.length; e++)
    for (let gone = shot.edgeCands[e] & ~m.edgeCands[e]; gone !== 0; gone &= gone - 1)
      out.push(STRIKE_EDGE, e, 31 - Math.clz32(gone & -gone));
  for (let c = 0; c < m.marked.length; c++)
    if (shot.marked[c] === -1 && m.marked[c] !== -1) out.push(MARK, c, m.marked[c]);
  return out;
}
