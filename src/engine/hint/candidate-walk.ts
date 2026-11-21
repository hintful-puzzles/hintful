/**
 * The walk a candidate plan is run by ({@link CandidateWalk}): the singles,
 * the setup and the placements' cull, each next firing taken through a
 * `HintFrontier`, and every step built from a firing's legs and applied to
 * the working board. See docs/hints-candidates.md § "What every game does".
 */

import type { HintStep } from "../contract/game.ts";
import {
  CELL,
  mark,
  type Narration,
  NOTE,
  phrase,
  type Sentence,
  so,
} from "../contract/hint-words.ts";
import type { Point } from "../contract/types.ts";
import type { DupReason } from "../solve/cell-marks.ts";
import { CellMarks } from "../solve/cell-marks.ts";
import { describedSpace, PLACE, STRIKE } from "../solve/describe-runtime.ts";
import { FactGraph } from "../solve/fact-graph.ts";
import {
  type FrontierCandidate,
  gridKey,
  HintFrontier,
} from "../solve/hint-frontier.ts";
import type { Firing as LadderFiring } from "../solve/ladder-runtime.ts";
import { stepBudget } from "../solve/step-budget.ts";
import {
  addMove,
  type CandidateHighlights,
  emitObviousCleanStep,
  evidenceOf,
  fillAllNotes,
  impliedNotes,
  lazyPopulate,
  type Mark,
  nakedSingles,
  obviousCandidateMarks,
  type PlanJudging,
  type PlanSetUp,
  populateThenClean,
  type Reach,
  regionDuplicateMarks,
  regionReach,
  valuesOf,
} from "./candidate-hint.ts";
import type {
  CandidatePlan,
  CandidateRung,
  Firing,
  Leg,
  PlanRung,
  StrikeWords,
} from "./candidate-plan.ts";
import type { CellRegion, SingleWhy, WholeRegion } from "./latin-hint.ts";
import type { Judging, TracedFiring } from "./move-judge.ts";

/** A reason's rung: its `kind`. */
function rungOf<Reason>(reason: Reason | DupReason): PlanRung<Reason> {
  return (reason as { kind: string }).kind as PlanRung<Reason>;
}

/** A step the walk has built, and how to play it on the working board. */
interface Built<M, H, Rung extends string = string> {
  step: HintStep<M, H, Rung>;
  apply(): void;
}

/** A note-less cell a strike was folded into: the notes it now has, or the
 * value placed there. */
interface Folded {
  bits: number;
  placed: number | null;
}

/** A strike's words inside the walk, with the rung of the reason they narrate. */
type RungStrikeWords<H, Reason> = StrikeWords<H> & { rung: PlanRung<Reason> };

/** The default dialect's placement and strike moves (Towers, Unequal, Keen, Solo). */
const latinMoves = {
  place: (x: number, y: number, n: number, autoElim: boolean) => ({
    type: "set",
    x,
    y,
    n,
    pencil: false,
    autoElim,
  }),
  strike: (marks: Mark[]) => ({ type: "pencilStrike", marks }),
};

/** The cells a reason says its deduction reads beyond what its words outline
 * (a Rome reach reads its group's border); none when it says nothing. */
function reasonReads(reason: unknown): readonly Point[] {
  return (reason as { reads?: readonly Point[] }).reads ?? [];
}

/** `premise` with each ring on cells the step strikes notes in drawn as an
 * outline on those cells instead. The step decides the notes, which its
 * strikes mark, and reasons from what can go in the cell; a ring means what a
 * step decides (`point-a-cell-reference-at-its-cell`, D1). The cell keeps a
 * mark of its own, so its reference points at the cell and not at a note. */
function struckCellsOutlined(premise: Narration, struck: readonly Mark[]): Narration {
  const cells = new Set(struck.map((m) => CELL.key(m)));
  return premise.remarked((ref) =>
    ref.role === "ring" &&
    ref.kind.name === CELL.name &&
    ref.elements.every((e) => cells.has(ref.kind.key(e)))
      ? "outline"
      : null,
  );
}

/** The cells `marks` act on, each once, in the order they first appear. */
function cellsOf(marks: readonly Mark[]): Point[] {
  const seen = new Set<string>();
  const out: Point[] = [];
  for (const m of marks) {
    const key = `${m.x},${m.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ x: m.x, y: m.y });
  }
  return out;
}

/** Whether marks `now` hold a fact `was` does not: a value placed, or a
 * candidate gone. */
function madeFact(was: CellMarks, now: CellMarks): boolean {
  for (let i = 0; i < was.grid.length; i++)
    if (
      (was.grid[i] === 0 && now.grid[i] !== 0) ||
      (was.cands[i] & ~now.cands[i]) !== 0
    )
      return true;
  return false;
}

/** A reason for each of `facts`: a replay's marks keep no record of them. */
function reasonsFor(facts: readonly number[]): object[] {
  return Array.from({ length: facts.length / 3 }, () => ({}));
}

/** Whether facts `facts` place a value in cell `c`. */
function placesAt(facts: readonly number[], c: number): boolean {
  for (let i = 0; i < facts.length; i += 3)
    if (facts[i] === PLACE && facts[i + 1] === c) return true;
  return false;
}

export class CandidateWalk<
  M,
  H extends CandidateHighlights,
  Reason,
  Reg extends CellRegion,
> {
  private readonly bit: (n: number) => number;
  private readonly place: (x: number, y: number, n: number, autoElim: boolean) => M;
  private readonly strike: (marks: Mark[]) => M;
  private readonly setUp: PlanSetUp;
  private readonly implicit: boolean;
  /** Whether the walk judges a move: its steps are quoted one at a time,
   * never shown as a journey, so each leg's words stand alone. */
  private readonly judging: boolean;
  private readonly reach: Reach;
  /** The candidates as the player reads them (`impliedNotes`), taken afresh on
   * every turn of the walk. */
  private shown: Int32Array;
  /** The singles, then the game's rungs. */
  private readonly ladder: CandidateRung<M, H, Reason>[];
  /** The rung of the ladder each firing offered came from. */
  private readonly fromRung = new WeakMap<Firing<M, H, Reason>, number>();
  /** The firing the walk took last, `null` while a setup step is taken. */
  private lastTaken: Firing<M, H, Reason> | null = null;
  /** Whether a rung is asked on a replay's marks, the notes set up. */
  private replaying = false;
  /** Each firing's steps, built once whether the frontier or the take asks. */
  private readonly built = new WeakMap<
    Firing<M, H, Reason>,
    Built<M, H, PlanRung<Reason>>[]
  >();

  constructor(private readonly plan: CandidatePlan<M, H, Reason, Reg>) {
    const { w, grid, pencil, steps, enc } = plan;
    this.bit = enc?.bit ?? ((n: number): number => 1 << n);
    const dialect = plan.moves;
    this.place = (dialect?.place ?? latinMoves.place) as typeof this.place;
    this.strike = (dialect?.strike ?? latinMoves.strike) as typeof this.strike;
    this.implicit = plan.reading === "implicit";
    this.judging = plan.judging !== undefined;
    const reach = plan.reach ?? regionReach(w, plan.regionsOf);
    this.reach = reach;
    if (plan.setUp) {
      // A setup of the game's own is a populate the walk cannot leave out.
      if (this.implicit)
        throw new Error(`${plan.label}: the implicit reading takes the default setup`);
      this.setUp = plan.setUp;
    } else {
      const notes = plan.notes;
      if (!notes) throw new Error(`${plan.label}: give either notes or setUp`);
      const clean = (): boolean =>
        emitObviousCleanStep(steps, grid, pencil, w, reach, notes.cleanObvious, {
          enc,
          adapter: dialect,
        });
      if (this.implicit) {
        // Nothing to pencil in, but a note the player left stale is still on
        // the board, and every strike and hidden single after the opening
        // reads the notes as written. With none stale there is nothing to set
        // up, so there is no opening: holding the strikes back behind one
        // would pass over the strike that continues a placement.
        let cleaned = false;
        this.setUp = {
          done: () =>
            (cleaned ||=
              obviousCandidateMarks(grid, pencil, w, reach, enc).length === 0),
          step: () => {
            cleaned = true;
            return clean();
          },
        };
      } else {
        const pop = lazyPopulate<M, H>(
          { grid, pencil },
          grid,
          pencil,
          w,
          steps,
          notes.populate,
          { enc, adapter: dialect },
        );
        this.setUp = populateThenClean(pop, clean);
      }
    }
    this.shown = this.view();
    const singles: CandidateRung<M, H, Reason> = () => this.singles();
    this.ladder = [singles, ...(plan.rungs ?? [])];
  }

  private fillAll(i: number): number {
    return fillAllNotes(i, this.plan.w, this.plan.enc);
  }

  /** The candidates as the player reads them. Under the populate reading,
   * once the notes are penciled in they are the whole candidate set, so a
   * blank cell without one is not read at all (Salad's settled empty squares
   * keep no note). */
  private view(): Int32Array {
    const { grid, pencil, w, enc } = this.plan;
    if (!this.implicit && this.setUp.done()) return pencil;
    return impliedNotes(grid, pencil, w, this.reach, enc);
  }

  run(): void {
    const { plan } = this;
    const w = plan.w;
    let judging: Judging | null = null;
    if (plan.judging) {
      judging = plan.judging.begin(this.marksShown());
      if (judging === null) return;
    }
    const frontier = new HintFrontier(gridKey(w, plan.grid.length / w));
    const budget = stepBudget(plan.label);
    const finished = plan.finished ?? (() => !plan.grid.includes(0));
    // Aiming at a move, a rung that waits its turn offers its firings all the
    // same: the wait is the order a hint takes them in, not what makes them
    // sound.
    const firings = (aiming = false): (readonly Firing<M, H, Reason>[])[] => {
      const lists: (readonly Firing<M, H, Reason>[])[] = [];
      let nothingEarlier = true;
      this.shown = this.view();
      for (const [r, rung] of this.ladder.entries()) {
        const offered = rung({
          nothingEarlier: aiming || nothingEarlier,
          populated: this.setUp.done(),
          shown: this.shown,
          continues: (f) => aiming || frontier.continues(this.premise(f)),
        });
        if (offered.length > 0) nothingEarlier = false;
        for (const f of offered) this.fromRung.set(f, r);
        lists.push(offered);
      }
      return lists;
    };
    const listed = (): FrontierCandidate[][] =>
      firings().map((list) => list.map((f) => this.candidate(f)));
    // Judging a move, a firing that makes one of its facts is taken before
    // the frontier's choice, the earliest rung's on a tie.
    const nameOf = (rung: string | null): string | null =>
      rung === null ? null : (plan.judging?.name(rung) ?? null);
    const aimed = (aim: Judging): FrontierCandidate | null => {
      let best: Firing<M, H, Reason> | null = null;
      let most = 0;
      for (const list of firings(true))
        for (const f of list) {
          // A firing's deduction is its first leg's.
          const leg = f[0];
          const rung =
            leg === undefined
              ? null
              : "step" in leg
                ? leg.step.rung
                : rungOf(leg.reason);
          const name = nameOf(rung);
          const facts = this.factsOf(f);
          const n = aim.aim(name === null ? { facts } : { facts, entry: { name } });
          if (n > most) [best, most] = [f, n];
        }
      return best && this.candidate(best);
    };
    const next = (): boolean => {
      if (judging) {
        const chosen = aimed(judging);
        if (chosen) return frontier.take([[chosen]], plan.steps);
        // The setup lets the rungs that read the notes offer theirs, which
        // the aim may want, so it goes before any firing the aim did not.
        if (!this.setUp.done()) {
          this.setUp.step();
          return true;
        }
      } else if (!this.setUp.done()) {
        if (frontier.take(listed(), plan.steps)) return true;
        if (this.setUp.step()) return true;
      }
      return frontier.take(listed(), plan.steps);
    };
    // Judging, the marks now, and as of the last firing that made a fact.
    let now = judging && this.marksShown();
    let counted = now;
    const trace = judging && this.traceInto(judging);
    const cap = plan.cap ?? w * w * w * 4 + 4;
    for (let guard = 0; guard < cap; guard++) {
      budget.tick();
      if (judging && now && judging.done(now)) return;
      if (finished()) return;
      const from = plan.steps.length;
      const was = plan.grid.slice();
      this.lastTaken = null;
      if (!next()) return;
      if (!judging || !counted || !trace) continue;
      now = this.marksShown();
      // A step that strikes nothing the player could read (penciling the
      // notes in, or cleaning out what the implied notes never held) is
      // bookkeeping: it opens no firing, and the next is quoted instead.
      if (!madeFact(counted, now)) continue;
      const known = trace.take(this.lastTaken, was, counted, now);
      counted = now;
      // Named by its first step that is no setup's.
      const own = plan.steps.slice(from).find((s) => nameOf(s.rung) !== null);
      judging.took(trace.graph, known, nameOf(own?.rung ?? null), true);
    }
  }

  /**
   * Hand `judging` the walk's trace (`Judging.traced`), and return what
   * records each step that made a fact, answering where its facts begin in
   * the graph. They are made on marks of the trace's own, read as the judge
   * reads the board, so a placement's cull follows them.
   *
   * A firing's facts are its legs', and the placement a strike folds into
   * under the implicit reading; they rest on its premise (`premise`), the
   * cells its steps read. A setup step's are the stale notes its clean
   * struck, and say nothing of what they read. The replay makes that clean
   * before every firing (`between`): it strikes only what a placement on the
   * board rules out.
   */
  private traceInto(judging: Judging): {
    graph: FactGraph;
    take(
      f: Firing<M, H, Reason> | null,
      was: ArrayLike<number>,
      counted: CellMarks,
      now: CellMarks,
    ): number;
  } {
    const { w } = this.plan;
    const grid = this.plan.grid.slice();
    const pencil = this.plan.pencil.slice();
    const graph = new FactGraph();
    const asBegun = this.plan.ownState?.save() ?? null;
    const marks = this.marksShown(grid, pencil);
    marks.graph = graph;
    const walked: TracedFiring[] = [];
    judging.traced = {
      graph,
      walked,
      fresh: () => this.marksShown(grid, pencil),
      between: (m) => this.cleanObvious(m),
    };
    const offersNone = (): LadderFiring[] => [];
    return {
      graph,
      take: (f, was, counted, now) => {
        const facts: number[] = [];
        const folded: number[] = [];
        if (f === null) {
          for (let c = 0; c < now.cands.length; c++) {
            if (now.grid[c] !== 0) continue;
            for (let gone = counted.cands[c] & ~now.cands[c]; gone; gone &= gone - 1)
              facts.push(STRIKE, c, 31 - Math.clz32(gone & -gone));
          }
        } else {
          facts.push(...this.factsOf(f));
          const { grid: placed } = this.plan;
          for (let c = 0; c < was.length; c++)
            if (was[c] === 0 && placed[c] !== 0 && !placesAt(facts, c)) {
              facts.push(PLACE, c, placed[c]);
              folded.push(c);
            }
        }
        const from = graph.facts.length;
        graph.record(
          facts,
          f === null
            ? null
            : { cells: this.premise(f).map((p) => p.y * w + p.x), edges: [] },
        );
        marks.group++;
        marks.applyFacts(facts, null);
        const r = f === null ? undefined : this.fromRung.get(f);
        const first = f?.[0];
        const id =
          first === undefined
            ? "setup"
            : "step" in first
              ? first.step.rung
              : rungOf<Reason>(first.reason);
        walked.push({
          firing: {
            facts,
            reasons: reasonsFor(facts),
            entry: {
              id,
              run: {
                firings:
                  r === undefined ? offersNone : this.offerOf(r, folded, asBegun),
              },
            },
          },
          from,
          to: graph.facts.length,
        });
        return from;
      },
    };
  }

  /**
   * What rung `r` of the ladder offers on a replay's marks `m`, each firing
   * as its facts. The walk's board and notes are set to `m` while the rung is
   * asked, and the game's own state to `asBegun`'s; all are put back after. A
   * strike that leaves one of `folded` a single value places it, as the
   * walked firing's fold did.
   */
  private offerOf(
    r: number,
    folded: readonly number[],
    asBegun: (() => void) | null,
  ): (m: CellMarks) => LadderFiring[] {
    return (m) => {
      const { grid, pencil } = this.plan;
      const was = { grid: grid.slice(), pencil: pencil.slice(), shown: this.shown };
      const own = this.plan.ownState?.save() ?? null;
      const values = this.valuesIn(~0);
      try {
        asBegun?.();
        for (let i = 0; i < grid.length; i++) {
          grid[i] = m.grid[i];
          let notes = 0;
          if (m.grid[i] === 0)
            for (const n of values) if (m.cands[i] & (1 << n)) notes |= this.bit(n);
          pencil[i] = notes;
        }
        this.shown = pencil.slice();
        this.replaying = true;
        const offered = this.ladder[r]({
          nothingEarlier: true,
          populated: true,
          shown: this.shown,
          continues: () => true,
        });
        return offered.map((g) => {
          const facts = this.factsOf(g);
          for (const c of folded) {
            let left = m.cands[c];
            for (let i = 0; i < facts.length; i += 3)
              if (facts[i] === STRIKE && facts[i + 1] === c)
                left &= ~(1 << facts[i + 2]);
            if (m.grid[c] === 0 && left !== 0 && (left & (left - 1)) === 0)
              facts.push(PLACE, c, 31 - Math.clz32(left));
          }
          return { facts, reasons: reasonsFor(facts) };
        });
      } finally {
        grid.set(was.grid);
        pencil.set(was.pencil);
        own?.();
        this.shown = was.shown;
        this.replaying = false;
      }
    };
  }

  /** Strike from marks `m` every value a placement on them rules out: the
   * obvious clean, made on a judge's marks. */
  private cleanObvious(m: CellMarks): void {
    for (let c = 0; c < m.grid.length; c++) {
      const n = m.grid[c];
      if (n === 0) continue;
      const cells = this.reach(c, n);
      for (let k = 0; k < cells.length; k++)
        if (m.grid[cells[k]] === 0 && m.has(cells[k], n)) m.strikeAt(cells[k], n);
    }
  }

  /** The board as the player reads it, as a judge reads marks
   * ({@link PlanJudging}): the walk's, or `grid` and `pencil`. A placement's
   * cull goes into the marks' graph where they keep one. */
  private marksShown(
    grid: Uint8Array | Int8Array = this.plan.grid,
    pencil: Int32Array = this.plan.pencil,
  ): CellMarks {
    const { w, enc } = this.plan;
    const m = new CellMarks(describedSpace([], w, grid.length / w), ~0, grid.slice());
    const implied = impliedNotes(grid, pencil, w, this.reach, enc);
    for (let i = 0; i < grid.length; i++)
      for (const n of this.valuesIn(implied[i])) m.cands[i] |= 1 << n;
    const reach = this.reach;
    m.placing = [
      (marks, c) => {
        const n = marks.grid[c];
        const cells = reach(c, n);
        const facts: number[] = [];
        for (let k = 0; k < cells.length; k++)
          if (cells[k] !== c && marks.grid[cells[k]] === 0 && marks.has(cells[k], n))
            facts.push(STRIKE, cells[k], n);
        marks.graph?.record(facts, { cells: [c], edges: [] });
        for (let k = 0; k < facts.length; k += 3) marks.strikeAt(facts[k + 1], n);
      },
    ];
    return m;
  }

  /** A firing's facts, as a judge reads them: each leg's placement or
   * strikes. A game's own step makes no fact a judge reads. */
  private factsOf(f: Firing<M, H, Reason>): number[] {
    const w = this.plan.w;
    const facts: number[] = [];
    for (const leg of f) {
      if ("place" in leg) facts.push(PLACE, leg.place.y * w + leg.place.x, leg.place.n);
      else if ("strike" in leg)
        for (const m of leg.strike) facts.push(STRIKE, m.y * w + m.x, m.n);
    }
    return facts;
  }

  // --- the standard rungs ---------------------------------------------------

  /** The singles the board shows. Under the populate reading that is the notes
   * alone, so the note-free opening places none of the cells a populate would
   * go on to pencil in. */
  private singles(): Firing<M, H, Reason>[] {
    const { plan } = this;
    const notes = this.implicit ? this.shown : plan.pencil;
    const marks = plan.singles?.() ?? nakedSingles(plan.grid, notes, plan.w, plan.enc);
    const out = marks.map((m) =>
      this.single(m, {
        kind: plan.pencil[m.y * plan.w + m.x] === 0 ? "regionsFull" : "naked",
      }),
    );
    // A hidden single is the notes' to show, once a note-less cell reads as
    // something.
    if (this.implicit || this.replaying || this.setUp.done())
      for (const { m, region } of this.hiddenSingles())
        out.push(this.single(m, { kind: "hidden", region }));
    return out;
  }

  /** Each value the shown notes leave one blank cell of a region that holds
   * every value, where that cell is not down to it already. A cell is named
   * once, in its first such region. */
  private hiddenSingles(): { m: Mark; region: WholeRegion<Reg> }[] {
    const { grid, w, regionsOf } = this.plan;
    const shown = this.shown;
    const out: { m: Mark; region: WholeRegion<Reg> }[] = [];
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== 0) continue;
      const x = i % w;
      const y = (i / w) | 0;
      for (const n of this.valuesIn(shown[i])) {
        if (shown[i] === this.bit(n)) break;
        if (this.plan.placeable && !this.plan.placeable({ x, y, n })) continue;
        const region = regionsOf(x, y).find(
          (r): r is WholeRegion<Reg> =>
            r.holdsEvery &&
            Array.prototype.every.call(
              r.cells,
              (j: number) =>
                j === i ||
                (grid[j] !== n && (grid[j] !== 0 || !(shown[j] & this.bit(n)))),
            ),
        );
        if (region) {
          out.push({ m: { x, y, n }, region });
          break;
        }
      }
    }
    return out;
  }

  /**
   * A single's firing, with the reason the game gives it, and the placed cells
   * it rests on although the game's words mark none of them. A cell with no
   * notes reads as what its regions leave it, so its candidates are the values
   * placed around it: a single in one rests on every value its regions hold,
   * and a hidden single on the value's holders beside each note-less cell of
   * its line. Without them the frontier cannot see that a placement continues
   * into the single it completes, and `plan-continuity.ts` counts the single
   * available before it was.
   */
  private single(m: Mark, why: SingleWhy<WholeRegion<Reg>>): Firing<M, H, Reason> {
    // A plan with a setup of its own types its steps without this rung
    // (`OwnSetUp`). Under the populate reading the walk reads no single in a
    // cell with no notes, so only a game's own `singles` can name one.
    if (why.kind === "regionsFull" && this.plan.setUp)
      throw new Error(
        `${this.plan.label}: a single in a cell with no notes, on a plan that sets its own notes up`,
      );
    const f = this.placing(m, this.plan.singleReason(m.n, why));
    const { grid, pencil, w } = this.plan;
    const i = m.y * w + m.x;
    const reads: Point[] = [];
    if (why.kind === "regionsFull") {
      for (const v of this.valuesIn(this.fillAll(i)))
        if (v !== m.n) this.holders(i, v, reads);
    } else if (why.kind === "hidden") {
      const { cells } = why.region;
      for (let k = 0; k < cells.length; k++) {
        const j = cells[k];
        if (j !== i && grid[j] === 0 && pencil[j] === 0) this.holders(j, m.n, reads);
      }
    }
    if (reads.length === 0) return f;
    return f.map((leg) =>
      "place" in leg && leg.place.x === m.x && leg.place.y === m.y
        ? { ...leg, reads: [...(leg.reads ?? []), ...reads] }
        : leg,
    );
  }

  /** Push onto `out` the placed cells ruling `n` out of cell `i`. */
  private holders(i: number, n: number, out: Point[]): void {
    const { grid, w } = this.plan;
    const cells = this.reach(i, n);
    for (let k = 0; k < cells.length; k++) {
      const j = cells[k];
      if (j !== i && grid[j] === n) out.push({ x: j % w, y: (j / w) | 0 });
    }
  }

  private placing(m: Mark, reason: Reason): Firing<M, H, Reason> {
    return [{ place: m, reason }];
  }

  // --- building and taking a firing ----------------------------------------

  private candidate(f: Firing<M, H, Reason>): FrontierCandidate {
    let reads: Point[] | null = null;
    return { reads: () => (reads ??= this.premise(f)), take: () => this.take(f) };
  }

  /** What a firing rests on: every step's outlined evidence, the line it names
   * (hatched, but reasoned over all the same), the cells whose candidates it
   * reads and the cells it acts on. */
  private premise(f: Firing<M, H, Reason>): Point[] {
    return this.stepsOf(f).flatMap(({ step }) => {
      const h = step.highlights;
      return h ? [...h.area, ...(h.hatch ?? []), ...(h.reads ?? []), ...h.targets] : [];
    });
  }

  /** A firing's steps: a step per leg, and under the implicit reading the note
   * legs its premise needs, with a strike from a note-less cell folded into its
   * conclusion ({@link implicitSteps}). */
  private stepsOf(f: Firing<M, H, Reason>): Built<M, H, PlanRung<Reason>>[] {
    let built = this.built.get(f);
    if (!built) {
      built = this.implicit
        ? this.implicitSteps(f)
        : f.map((leg, i) => this.builtLeg(leg, i > 0));
      this.built.set(f, built);
    }
    return built;
  }

  /** A strike's words, with the cells its reason reads beyond them. */
  private strikeWords(
    marks: readonly Mark[],
    reason: Reason | DupReason,
    continues: boolean,
  ): RungStrikeWords<H, Reason> {
    const words = this.plan.strikeWords(marks, reason, continues && !this.judging);
    const more = reasonReads(reason);
    const reads = more.length > 0 ? [...(words.reads ?? []), ...more] : words.reads;
    return { ...words, ...(reads ? { reads } : {}), rung: rungOf<Reason>(reason) };
  }

  private builtLeg(
    leg: Leg<M, H, Reason>,
    continues: boolean,
  ): Built<M, H, PlanRung<Reason>> {
    if ("step" in leg)
      return {
        step: leg.step,
        apply: () => leg.apply(),
      };
    if ("strike" in leg)
      return this.struck(
        leg.strike,
        this.strikeWords(leg.strike, leg.reason, continues),
      );
    const { x, y, n } = leg.place;
    const { words, rung, ...rest } = this.plan.placeWords(
      leg.place,
      leg.reason,
      continues && !this.judging,
    );
    const reads = [
      ...(rest.reads ?? []),
      ...(leg.reads ?? []),
      ...reasonReads(leg.reason),
    ];
    return {
      step: {
        move: this.place(x, y, n, this.plan.autoClean),
        rung: rung ?? rungOf<Reason>(leg.reason),
        explanation: words.text,
        words,
        highlights: {
          ...rest,
          ...evidenceOf(words),
          ...(reads.length > 0 ? { reads } : {}),
          targets: [{ x, y }],
          marks: [],
        } as unknown as H,
      },
      apply: () => this.placeOnBoard(leg.place),
    };
  }

  /**
   * Under the implicit reading, a firing's steps with the candidates it reads
   * written down first. An outlined blank cell is evidence only through what it
   * can still be, and a player following a deduction over several cells cannot
   * hold each one's candidates in their head (Map's owner playtests,
   * docs/hints-candidates.md § "A graph, not a grid (Map)"). So each blank, note-less
   * cell a step outlines as evidence or `reads`, or strikes from, gets a note leg
   * before the firing, and a cell gets none from the step that places in it or
   * any step after. A cell a *later* leg places is still premise to the steps
   * before it: ABCD's runs journey outlines a whole line and places in several
   * of its cells, and its first step rests on every one of them. A hatched line is not
   * read this way: a hidden single says no other cell of the line can take the
   * value, which each cell shows by its own regions.
   *
   * **A strike from a note-less cell is not a strike, though: it is folded.** A
   * note leg then a strike says one thing in two steps, the first writing
   * candidates only for the second to cross them out. So a strike whose marks lie
   * in one such cell, and whose words speak of that cell alone (no `where`),
   * concludes with what it leaves instead: a placement when one value is left, a
   * note of the survivors when several are. A cell an earlier leg reads, or a
   * strike over several cells reaches, still gets its note leg, since it is read
   * before the fold could write it.
   */
  private implicitSteps(f: Firing<M, H, Reason>): Built<M, H, PlanRung<Reason>>[] {
    const { grid, pencil, w } = this.plan;
    const h = grid.length / w;
    /** Each cell a leg places in, and the first leg to. */
    const placedAt = new Map<number, number>();
    f.forEach((leg, k) => {
      if (!("place" in leg)) return;
      const i = leg.place.y * w + leg.place.x;
      if (!placedAt.has(i)) placedAt.set(i, k);
    });
    /** The index of `p` when it is a blank cell with no notes, whose candidates
     * are what leg `k`'s premise would have to show: not yet placed in by then. */
    const bare = (p: Point, k: number): number | null => {
      if (p.x < 0 || p.y < 0 || p.x >= w || p.y >= h) return null;
      const i = p.y * w + p.x;
      if (grid[i] !== 0 || pencil[i] !== 0 || this.shown[i] === 0) return null;
      const at = placedAt.get(i);
      return at !== undefined && at <= k ? null : i;
    };
    const folded = new Map<number, Folded>();
    const read: number[] = [];
    const struck: number[] = [];
    const note = (into: number[], p: Point, k: number): void => {
      const i = bare(p, k);
      if (i !== null && !folded.has(i) && !into.includes(i)) into.push(i);
    };
    const own: Built<M, H, PlanRung<Reason>>[] = [];
    f.forEach((leg, k) => {
      let built: Built<M, H, PlanRung<Reason>>;
      if ("strike" in leg) {
        // A fold earlier in this firing may already have settled a cell this
        // leg strikes from.
        const marks = leg.strike.filter((m) => !this.settled(m, folded));
        if (marks.length === 0) return;
        const words = this.strikeWords(marks, leg.reason, k > 0);
        const cells = cellsOf(marks);
        const alone = cells.length === 1 && words.where === undefined;
        const i = alone ? bare(cells[0], k) : null;
        if (i !== null && !folded.has(i) && !read.includes(i) && !struck.includes(i)) {
          built = this.fold(i, marks, words, folded);
        } else {
          built = this.struck(marks, words);
          for (const m of marks) note(struck, m, k);
        }
      } else built = this.builtLeg(leg, k > 0);
      for (const p of built.step.highlights?.area ?? []) note(read, p, k);
      for (const p of built.step.highlights?.reads ?? []) note(read, p, k);
      own.push(built);
    });
    const cells = [...read, ...struck.filter((i) => !read.includes(i))];
    return [...cells.map((i) => this.noteLeg(i)), ...own];
  }

  /** Whether a fold earlier in the firing has already dealt with `m`: its cell
   * was placed, or kept only values `m` is not, or the value placed beside it
   * in a region is `m`'s, which the placement's cull takes. */
  private settled({ x, y, n }: Mark, folded: ReadonlyMap<number, Folded>): boolean {
    const i = y * this.plan.w + x;
    const own = folded.get(i);
    if (own) return own.placed !== null || (own.bits & this.bit(n)) === 0;
    for (const [j, fold] of folded)
      if (fold.placed === n && this.rulesOut(j, n, i)) return true;
    return false;
  }

  /** Whether an `n` at cell `j` rules `n` out of cell `i`. */
  private rulesOut(j: number, n: number, i: number): boolean {
    const cells = this.reach(j, n);
    for (let k = 0; k < cells.length; k++) if (cells[k] === i) return true;
    return false;
  }

  /** A strike from note-less cell `i`, concluded with what it leaves there: the
   * one value placed, or the several written as its notes. */
  private fold(
    i: number,
    marks: readonly Mark[],
    words: RungStrikeWords<H, Reason>,
    folded: Map<number, Folded>,
  ): Built<M, H, PlanRung<Reason>> {
    const { plan } = this;
    const x = i % plan.w;
    const y = (i / plan.w) | 0;
    const { premise, where: _where, struck: _struck, rung, ...rest } = words;
    let bits = this.shown[i];
    for (const m of marks) bits &= ~this.bit(m.n);
    // The view was taken before the firing, so a value an earlier fold placed
    // in one of this cell's regions is still in it.
    for (const [j, fold] of folded)
      if (fold.placed !== null && this.rulesOut(j, fold.placed, i))
        bits &= ~this.bit(fold.placed);
    const left = this.valuesIn(bits);
    // What the fold concludes is said of the ringed cell, so its conclusion
    // names it: "so this cell must be 3".
    const here = mark.this("ring", CELL, [{ x, y }], plan.conclude.cell);
    const concluded = (move: Narration): Sentence => so({ look: premise, move });
    const highlightsOf = (said: Sentence): H =>
      ({
        ...rest,
        ...evidenceOf(said),
        targets: [{ x, y }],
        marks: [],
      }) as unknown as H;
    // Unreachable while the techniques are sound: a strike never takes the
    // solution's value, and a cell's implied notes always hold it.
    if (left.length === 0)
      throw new Error(`${plan.label}: a strike empties (${x}, ${y})`);
    if (left.length === 1) {
      const n = left[0];
      folded.set(i, { bits: 0, placed: n });
      const said = concluded(phrase`${here} ${plan.conclude.place(n)}`);
      return {
        step: {
          move: this.place(x, y, n, plan.autoClean),
          rung,
          explanation: said.text,
          words: said,
          highlights: highlightsOf(said),
        },
        apply: () => this.placeOnBoard({ x, y, n }),
      };
    }
    folded.set(i, { bits, placed: null });
    const said = concluded(phrase`${here} ${plan.conclude.keep(left)}`);
    return {
      step: {
        move: addMove(
          left.map((n) => ({ x, y, n })),
          plan.moves,
        ),
        rung,
        explanation: said.text,
        words: said,
        highlights: highlightsOf(said),
      },
      apply: () => {
        plan.pencil[i] = bits;
      },
    };
  }

  /** The values a note mask holds, smallest first. */
  private valuesIn(bits: number): number[] {
    const values: number[] = [];
    for (let n = 1; n <= (this.plan.enc?.values ?? this.plan.w); n++)
      if (bits & this.bit(n)) values.push(n);
    return values;
  }

  private noteLeg(i: number): Built<M, H, PlanRung<Reason>> {
    const { plan } = this;
    const x = i % plan.w;
    const y = (i / plan.w) | 0;
    const values = this.valuesIn(this.shown[i]);
    const marks = values.map((n) => ({ x, y, n }));
    const bits = this.shown[i];
    // Unreachable: the implicit reading refuses a game's own setup, and the
    // default setup refuses a plan without `notes`.
    if (!plan.notes) throw new Error(`${plan.label}: a note leg needs notes`);
    const words = plan.notes.note({ x, y }, values, bits === this.fillAll(i));
    return {
      step: {
        move: addMove(marks, plan.moves),
        rung: "note",
        explanation: words.text,
        words,
        highlights: { area: [], targets: [{ x, y }], marks: [] } as unknown as H,
      },
      apply: () => {
        plan.pencil[i] = bits;
      },
    };
  }

  /** A strike's step, played by clearing its marks. */
  private struck(
    marks: readonly Mark[],
    words: RungStrikeWords<H, Reason>,
  ): Built<M, H, PlanRung<Reason>> {
    return {
      step: this.strikeStep(marks, words),
      apply: () => this.clear(marks),
    };
  }

  /** A strike concluded as one: its premise, then the plan's words for the
   * values it crosses out. */
  private strikeStep(
    struck: readonly Mark[],
    words: RungStrikeWords<H, Reason>,
  ): HintStep<M, H, PlanRung<Reason>> {
    const marks = [...struck];
    const { premise, where, struck: noun, rung, ...rest } = words;
    // The ending names the notes it strikes, and re-renders from them when a
    // refresh finds some already gone.
    const { what, after } = this.plan.conclude.strike({ where, struck: noun });
    const struckNotes = mark.as("strike", NOTE, marks, (live) => what(valuesOf(live)));
    const said = so({
      look: struckCellsOutlined(premise, marks),
      move: phrase`${struckNotes} ${after}`,
    });
    return {
      move: this.strike(marks),
      rung,
      explanation: said.text,
      words: said,
      highlights: {
        ...rest,
        ...evidenceOf(said),
        targets: cellsOf(marks),
        marks,
      } as unknown as H,
    };
  }

  /** Push a firing's steps, the later legs continuing the first, and play each
   * on the working board. */
  private take(f: Firing<M, H, Reason>): void {
    this.lastTaken = f;
    this.stepsOf(f).forEach(({ step, apply }, i) => {
      if (i > 0) step.continuesPrevious = true;
      this.plan.steps.push(step);
      apply();
    });
  }

  private clear(marks: readonly Mark[]): void {
    const { pencil, w } = this.plan;
    for (const m of marks) pencil[m.y * w + m.x] &= ~this.bit(m.n);
  }

  /** Write a placement to the working board and strike its value from the cells
   * it reaches: silently under auto-pencil, whose move does the same on the
   * real board, and otherwise as a leg continuing the placement's journey, so
   * the player is taught the cull they must make by hand. */
  private placeOnBoard({ x, y, n }: Mark): void {
    const { plan } = this;
    const { grid, pencil, w } = plan;
    grid[y * w + x] = n;
    pencil[y * w + x] = 0;
    plan.onPlace?.(x, y, n);
    const dup = regionDuplicateMarks(
      grid,
      pencil,
      x,
      y,
      n,
      w,
      this.reach(y * w + x, n),
      plan.enc,
    );
    this.clear(dup);
    if (plan.autoClean || dup.length === 0) return;
    const step = this.strikeStep(
      dup,
      this.strikeWords(dup, { kind: "dup", n, px: x, py: y }, true),
    );
    step.continuesPrevious = true;
    plan.steps.push(step);
  }
}
