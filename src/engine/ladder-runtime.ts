/**
 * The runtime a compiled ladder runs on, whatever the board: the marks a
 * compiled technique reads, owned here, and the runner that takes a compiled
 * module's ladder to a fixpoint at a cap per scale (`docs/descriptions.md`
 * § "The runtime a ladder runs on").
 *
 * A game's solver extends {@link CellMarks} only where it keeps what no
 * description states, a Search (the Latin and Sudoku forcing chains and
 * recursion); a game whose whole solve is its ladder uses it as it is.
 */

import type { DeductionTechnique, FiringTally } from "./deduction-fixpoint.ts";
import { runDeductionFixpoint } from "./deduction-fixpoint.ts";
import type { DeductionRecorder } from "./deduction-record.ts";
import {
  type Facts,
  type Fire,
  type GridSpace,
  type Marks,
  STRIKE,
} from "./describe-runtime.ts";
import { HintFrontier } from "./hint-frontier.ts";
import type { StepBudget } from "./step-budget.ts";

/** Why a placement struck a value from a cell: the value just placed at
 * `(px, py)`. */
export interface DupReason {
  kind: "dup";
  n: number;
  px: number;
  py: number;
}

/**
 * The cull of a value that may repeat (Salad's empty square): it has been
 * placed all `times` times in this line, so the count forces it, not the one
 * placement. Recorded only where a description declares a repeated value, and
 * kept apart from {@link DupReason} so a game that declares none is not asked
 * to narrate it.
 */
export interface RepeatFullReason {
  kind: "repeatFull";
  n: number;
  line: "row" | "col";
  index: number;
  times: number;
}

/** A technique run as each value is placed, on the cell placed. */
export type PlaceRung = (m: CellMarks, c: number) => void;

/**
 * The marks a compiled technique reads, over a {@link GridSpace}: a value per
 * cell (0 where there is none, as every game's grid holds it, since no value
 * of a domain is 0) and the values each may still hold, as a bitmask.
 */
export class CellMarks implements Marks {
  readonly sp: GridSpace;
  /** The values placed, 0 where none is: the caller's own array, written in
   * place. */
  grid: Uint8Array | Int8Array;
  /** The values each cell may still hold, as a bitmask (bit `d`). */
  readonly cands: Int32Array;
  readonly domain: number;
  readonly repeat: number;
  readonly times: number;
  /** The techniques run as each value is placed, in the description's
   * order. */
  placing: readonly PlaceRung[] = [];

  /** The hint path's: every fact a firing makes, with its reason. Unset on
   * the solve path, which then records nothing. */
  recorder?: DeductionRecorder;
  /** The hint path's fixpoint budget, set with {@link recorder}. */
  budget?: StepBudget;
  /** The firing being made: bumped before each technique is tried, so every
   * record of one firing shares it. */
  group = 0;

  constructor(
    sp: GridSpace,
    domain: number,
    grid: Uint8Array | Int8Array,
    repeat: { value: number; times: number } | null = null,
  ) {
    this.sp = sp;
    this.domain = domain;
    this.grid = grid;
    this.cands = new Int32Array(sp.cells.length);
    this.repeat = repeat?.value ?? 0;
    this.times = repeat?.times ?? 1;
  }

  known(c: number): boolean {
    return this.grid[c] !== 0;
  }
  value(c: number): number {
    return this.grid[c] || -1;
  }
  cand(c: number): number {
    return this.cands[c];
  }
  has(c: number, d: number): boolean {
    return ((this.cands[c] >> d) & 1) !== 0;
  }
  strikeAt(c: number, d: number): void {
    this.cands[c] &= ~(1 << d);
  }
  placeAt(c: number, d: number): void {
    this.place(c, d);
  }

  /**
   * Every cell may hold what `domainOf` gives it (the description's domain
   * where it gives none), and each value `grid` holds is placed. False where
   * a value is placed in a cell that can no longer hold it, as two givens
   * that clash leave one. Records nothing: a given is not a deduction.
   */
  seed(grid: Uint8Array | Int8Array, domainOf?: (c: number) => number): boolean {
    this.grid = grid;
    const { cands } = this;
    for (let c = 0; c < cands.length; c++)
      cands[c] = domainOf ? domainOf(c) & this.domain : this.domain;
    const recorder = this.recorder;
    this.recorder = undefined;
    try {
      for (let c = 0; c < cands.length; c++) {
        const d = grid[c];
        if (d === 0) continue;
        if (!this.has(c, d)) return false;
        this.place(c, d);
      }
    } finally {
      this.recorder = recorder;
    }
    return true;
  }

  /**
   * Place `d` in `c`, recorded with `reason` where one is given, and run
   * the techniques that run on placing. The cell keeps no other value, and
   * `d` only if it had it, so a placement of a struck value leaves the marks
   * inconsistent for a technique to read.
   */
  place(c: number, d: number, reason: object | null = null): void {
    const rec = this.recorder;
    if (rec && reason !== null) {
      const w = this.sp.w;
      rec({ kind: "place", x: c % w, y: (c / w) | 0, n: d, reason, group: this.group });
    }
    this.cands[c] &= 1 << d;
    this.grid[c] = d;
    for (const run of this.placing) run(this, c);
  }

  /**
   * Make a compiled firing's facts, recording each with the reason `reasonOf`
   * gives it. Every reason is taken before any fact is made, from the marks
   * the firing read.
   */
  applyFacts(facts: Facts, reasonOf: ((i: number) => object) | null): void {
    const w = this.sp.w;
    const rec = this.recorder;
    const reasons: object[] | null = rec ? [] : null;
    if (reasons && reasonOf)
      for (let i = 0; i < facts.length; i += 3) reasons.push(reasonOf(i));
    for (let i = 0; i < facts.length; i += 3) {
      const c = facts[i + 1];
      const n = facts[i + 2];
      const reason = reasons ? (reasons[i / 3] ?? null) : null;
      if (facts[i] !== STRIKE) {
        // Two facts of one firing can place one cell (Towers' facing pairs
        // of a row and a column); the cell was open when both were made.
        if (this.grid[c] === 0) this.place(c, n, reason);
        continue;
      }
      if (rec && this.has(c, n))
        rec({ kind: "elim", x: c % w, y: (c / w) | 0, n, reason, group: this.group });
      this.strikeAt(c, n);
    }
  }

  /** Why the value placed in `placed` was struck from `struck`. */
  cullReason(placed: number, struck: number): DupReason | RepeatFullReason {
    const { sp } = this;
    const n = this.grid[placed];
    const px = placed % sp.w;
    const py = (placed / sp.w) | 0;
    if (n !== this.repeat) return { kind: "dup", n, px, py };
    const inRow = sp.rowOf[struck] === sp.rowOf[placed];
    return {
      kind: "repeatFull",
      n,
      line: inRow ? "row" : "col",
      index: inRow ? py : px,
      times: this.times,
    };
  }

  /** The values each cell may hold, by cell. */
  snapshot(): Int32Array {
    return this.cands.slice();
  }
}

/** A firing a compiled technique could make: its facts, three numbers each,
 * and each fact's reason, taken on the marks it read. */
export interface Firing {
  facts: readonly number[];
  reasons: readonly object[];
}

/**
 * One technique of a ladder, run on the marks: `-1`, `0` or `1`, as a rung.
 * A compiled technique also lists every firing it could make from the marks
 * as they stand, making none (`"contradiction"` where the run would return
 * `-1`), for a hint that chooses among them ({@link ladderWalk}).
 */
export interface Rung<S extends CellMarks = CellMarks> {
  (m: S): number;
  firings?: (m: S) => readonly Firing[] | "contradiction";
}

/** How a firing's reason is built: from its binding and one of its facts,
 * on the marks before any of the firing's facts is made. */
export type ReasonOf<B, S extends CellMarks = CellMarks> = (
  binding: B,
  cell: number,
  n: number,
  m: S,
) => object;

/**
 * A compiled technique as a rung: on the solve path it makes its facts as it
 * concludes them, and on the hint path each firing's facts are recorded with
 * the reason `reason` builds, one firing a call being one step.
 */
export function compiledRung<B, C, S extends CellMarks = CellMarks>(
  run: (b: Marks, sp: GridSpace, cl: C, fire: Fire<B> | null) => number,
  cl: C,
  reason: ReasonOf<B, S>,
): Rung<S> {
  const rung = (m: S): number =>
    run(
      m,
      m.sp,
      cl,
      m.recorder
        ? (binding, facts) => {
            m.applyFacts(facts, (i) => reason(binding, facts[i + 1], facts[i + 2], m));
            return false;
          }
        : null,
    );
  // Given a `fire`, a technique makes no fact itself, so telling it to go on
  // reads every later binding on the same marks.
  rung.firings = (m: S): readonly Firing[] | "contradiction" => {
    const out: Firing[] = [];
    const ret = run(m, m.sp, cl, (binding, facts) => {
      const reasons: object[] = [];
      for (let i = 0; i < facts.length; i += 3)
        reasons.push(reason(binding, facts[i + 1], facts[i + 2], m));
      out.push({ facts: facts.slice(), reasons });
      return true;
    });
    return ret < 0 ? "contradiction" : out;
  };
  return rung;
}

/** {@link compiledRung} of a technique that reads nothing the board deals. */
export function uncluedRung<B, S extends CellMarks = CellMarks>(
  run: (b: Marks, sp: GridSpace, fire: Fire<B> | null) => number,
  reason: ReasonOf<B, S>,
): Rung<S> {
  return compiledRung(
    (b, sp, _: null, fire: Fire<B> | null) => run(b, sp, fire),
    null,
    reason,
  );
}

/**
 * A compiled technique that runs as each value is placed, its strikes
 * recorded as the placement's cull ({@link CellMarks.cullReason}).
 */
export function placingRung<B, C>(
  run: (b: Marks, sp: GridSpace, cl: C, c: number, fire: Fire<B> | null) => number,
  cl: C,
): PlaceRung {
  return (m, c) => {
    run(
      m,
      m.sp,
      cl,
      c,
      m.recorder
        ? (_, facts) => {
            m.applyFacts(facts, (i) => m.cullReason(c, facts[i + 1]));
            return true;
          }
        : null,
    );
  };
}

/** {@link placingRung} of a technique that reads nothing the board deals. */
export function uncluedPlacingRung<B>(
  run: (b: Marks, sp: GridSpace, c: number, fire: Fire<B> | null) => number,
): PlaceRung {
  return placingRung(
    (b, sp, _: null, c, fire: Fire<B> | null) => run(b, sp, c, fire),
    null,
  );
}

/** The scale a ladder entry grades on where it names none: the
 * description's own tiers. */
export const TIERS = "tiers";

/** A ladder entry as the compiled module lists it. */
export interface CompiledEntry<Id extends string = string> {
  id: Id;
  tier: number;
  scale?: string;
  from?: number;
  until?: number;
  /** The variation that adds it, where one does. */
  variation?: string;
}

/** A ladder entry with the rung that runs it. */
export interface LadderEntry<S extends CellMarks = CellMarks> extends CompiledEntry {
  run: Rung<S>;
}

/** A described game's ladder: its rungs, and what runs on placing. */
export interface Ladder<S extends CellMarks = CellMarks> {
  entries: readonly LadderEntry<S>[];
  placing: readonly PlaceRung[];
}

/** A game's own ids among a compiled module's: a library's are written
 * `<library>.<technique>`. */
export type OwnId<Id extends string> = Exclude<Id, `${string}.${string}`>;

/** What a compiled module says about its ladder. */
export interface CompiledLadder<Id extends string, P extends string> {
  ladder: readonly CompiledEntry<Id>[];
  placing: readonly P[];
}

/** A game's pairing of its own techniques: each rung, and each technique
 * run on placing, by its id. A library technique may be paired too, where
 * the game's reason for it is not the library's. */
export type OwnRungs<Id extends string, P extends string, S extends CellMarks> = Record<
  OwnId<Id>,
  Rung<S>
> &
  Record<OwnId<P>, PlaceRung> &
  Partial<Record<Exclude<Id, OwnId<Id>>, Rung<S>>>;

/** A library's techniques, paired by the engine: by id, a rung or what runs
 * on placing. */
export interface Library {
  rungs: Readonly<Record<string, Rung>>;
  placing: Readonly<Record<string, PlaceRung>>;
}

const NO_LIBRARY: Library = { rungs: {}, placing: {} };

/**
 * A compiled module's ladder with its rungs: the game's own from `own`, and
 * each library technique from `library`, where `own` does not pair it. A
 * technique a variation adds is left out unless `variations` has it on.
 */
export function describedLadder<
  Id extends string,
  P extends string,
  S extends CellMarks,
>(
  module: CompiledLadder<Id, P>,
  own: OwnRungs<Id, P, S>,
  library: Library = NO_LIBRARY,
  variations: readonly string[] = [],
): Ladder<S> {
  const pairs = own as Readonly<Record<string, Rung<S> | PlaceRung | undefined>>;
  const pick = <T>(id: string, lib: Readonly<Record<string, T>>): T => {
    const run = (pairs[id] as T | undefined) ?? lib[id];
    if (run === undefined) throw new Error(`no rung pairs ${id}`);
    return run;
  };
  return {
    entries: module.ladder
      .filter((e) => e.variation === undefined || variations.includes(e.variation))
      .map((e) => ({ ...e, run: pick<Rung<S>>(e.id, library.rungs) })),
    placing: module.placing.map((id) => pick<PlaceRung>(id, library.placing)),
  };
}

/** Each scale's cap, by scale ({@link TIERS} for the description's own). A
 * scale with no cap does not run: Solo's killer scale on a board with no
 * cages. */
export type Caps = Readonly<Record<string, number>>;

/** Whether an entry runs at `caps`: its scale's cap reaches its tier and its
 * `from`, and has not reached its `until`. */
function admits(entry: CompiledEntry, caps: Caps): boolean {
  const cap = caps[entry.scale ?? TIERS];
  if (cap === undefined || entry.tier > cap) return false;
  if (entry.from !== undefined && cap < entry.from) return false;
  return entry.until === undefined || cap < entry.until;
}

/**
 * The ladder at `caps`, as techniques for `runDeductionFixpoint`, in the
 * description's order: an entry runs where its scale's cap reaches its tier
 * and its `from`, and has not reached its `until`, and a firing raises its
 * scale's grade in `grades`. `before` runs before each entry, and a negative
 * answer is the entry's (Solo brings its working cages up to date there).
 */
export function ladderTechniques<S extends CellMarks>(
  m: S,
  entries: readonly LadderEntry<S>[],
  caps: Caps,
  grades: Record<string, number>,
  before?: (entry: LadderEntry<S>) => number,
): DeductionTechnique[] {
  const out: DeductionTechnique[] = [];
  for (const entry of entries) {
    const { id, tier, run } = entry;
    const scale = entry.scale ?? TIERS;
    if (!admits(entry, caps)) continue;
    out.push({
      id,
      tier,
      run: () => {
        if (before && before(entry) < 0) return -1;
        const ret = run(m);
        if (ret > 0 && tier > (grades[scale] ?? Number.NEGATIVE_INFINITY))
          grades[scale] = tier;
        return ret;
      },
    });
  }
  return out;
}

/**
 * Run `techniques` on `m` to a fixpoint, each firing its own group, and say
 * whether one proved the marks inconsistent. `onTechnique` is told each
 * technique as it is tried, after the group moves on (the premise audit's
 * replay).
 */
export function runLadder(
  m: CellMarks,
  techniques: readonly DeductionTechnique[],
  opts: { firings?: FiringTally; onTechnique?: (id: string) => void } = {},
): boolean {
  const { impossible } = runDeductionFixpoint({
    techniques,
    budget: m.budget,
    firings: opts.firings,
    beforeTechnique: (t) => {
      m.group++;
      opts.onTechnique?.(t.id);
    },
  });
  return impossible;
}

/** A firing a walk took, with the ladder entry that made it. */
export interface Taken<S extends CellMarks = CellMarks> extends Firing {
  entry: LadderEntry<S>;
}

/** A hint's walk over a ladder, one firing a call ({@link ladderWalk}). */
export interface LadderWalk<S extends CellMarks = CellMarks> {
  /** The firing taken and made, `null` once none is left, or
   * `"contradiction"` where a technique finds the marks inconsistent. */
  next(): Taken<S> | null | "contradiction";
}

/**
 * A hint's walk over a compiled ladder at `caps`, one firing a call: of every
 * firing the ladder could make, the one that continues from what the walk's
 * latest firings wrote (`hint-frontier.ts`, the owner's rule), the ladder's
 * order breaking ties, and never one of a higher tier than the first firing
 * the ladder's order would take, so a hint never teaches harder reasoning
 * than the board needs where it stands. `reads` says which cells a firing's
 * premise reads. Each firing is made on `m` as a group of its own, recorded
 * where `m` has a recorder; `m.budget` is ticked once a call.
 */
export function ladderWalk<S extends CellMarks>(
  m: S,
  entries: readonly LadderEntry<S>[],
  caps: Caps,
  reads: (firing: Taken<S>) => readonly number[],
): LadderWalk<S> {
  const admitted = entries.filter((e) => admits(e, caps));
  const frontier = new HintFrontier<number>((c) => c);
  const cellsOf = (facts: readonly number[]): number[] => {
    const out: number[] = [];
    for (let i = 0; i < facts.length; i += 3) out.push(facts[i + 1]);
    return out;
  };
  return {
    next() {
      m.budget?.tick();
      let contradiction = false;
      const lists = new Map<number, readonly Taken<S>[]>();
      const ask = (k: number): readonly Taken<S>[] => {
        const seen = lists.get(k);
        if (seen) return seen;
        const entry = admitted[k];
        const firings = entry.run.firings;
        if (!firings) throw new Error(`${entry.id}: its rung lists no firings`);
        const got = firings(m);
        if (got === "contradiction") contradiction = true;
        const list = got === "contradiction" ? [] : got.map((f) => ({ ...f, entry }));
        lists.set(k, list);
        return list;
      };
      let ceiling: number | null = null;
      const tierNow = (): number => {
        if (ceiling === null) {
          const k = admitted.findIndex((_, j) => contradiction || ask(j).length > 0);
          ceiling = k < 0 ? Number.NEGATIVE_INFINITY : admitted[k].tier;
        }
        return ceiling;
      };
      const rungs = admitted.map(
        (entry, k) => () =>
          entry.tier > tierNow()
            ? []
            : ask(k).map((f) => ({
                f,
                reads: () => reads(f),
                writes: () => cellsOf(f.facts),
                take: () => {
                  m.group++;
                  m.applyFacts(f.facts, (i) => f.reasons[i / 3]);
                },
              })),
      );
      const taken = frontier.takeContinuing(rungs, () => contradiction);
      if (contradiction) return "contradiction";
      return taken?.f ?? null;
    },
  };
}
