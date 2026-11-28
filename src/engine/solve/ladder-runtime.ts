/**
 * The runtime a compiled ladder runs on, whatever the board: a compiled
 * technique as a rung, a compiled module's techniques as a ladder, and the
 * runner that takes the ladder to a fixpoint at a cap per scale
 * (`docs/descriptions.md` § "The runtime a ladder runs on").
 */

import type { CellMarks, PlaceRung, StrikeRung } from "./cell-marks.ts";
import type {
  CompiledTechniques,
  DeductionTechnique,
  FiringTally,
} from "./deduction-fixpoint.ts";
import { runDeductionFixpoint } from "./deduction-fixpoint.ts";
import type { Facts, Fire, GridSpace, Marks, Reads } from "./describe-runtime.ts";

/** A firing a compiled technique could make: its facts, three numbers each,
 * and each fact's reason, taken on the marks it read. */
export interface Firing {
  facts: readonly number[];
  reasons: readonly object[];
}

declare const compiled: unique symbol;

/**
 * One technique of a ladder, run on the marks: `-1`, `0` or `1`, as a rung.
 * It also lists every firing it could make from the marks as they stand,
 * making none (`"contradiction"` where the run would return `-1`), for a hint
 * that chooses among them (`ladder-walk.ts`). Only {@link compiledRung} and
 * {@link uncluedRung} make one, from a compiled technique: the brand is a type
 * alone, so a rung a game writes by hand does not pair.
 */
export interface Rung<S extends CellMarks = CellMarks> {
  (m: S): number;
  firings: (m: S) => readonly Firing[] | "contradiction";
  readonly [compiled]: true;
}

/** How a firing's reason is built: from its binding and one of its facts,
 * on the marks before any of the firing's facts is made. */
export type ReasonOf<B, S extends CellMarks = CellMarks, Y = undefined> = (
  binding: B,
  cell: number,
  n: number,
  m: S,
  says: Y,
  /** Which of the firing's facts this is, from 0. */
  fact: number,
) => object;

/** What a firing of a technique that `says` records for each of its facts,
 * where the game builds no reason of its own: the binding, and what the step
 * speaks of, read on the marks before the firing's facts were made. */
export interface Said<B, Y> {
  readonly binding: B;
  readonly says: Y;
  /** What the fact has of its own (`says.fact`), where the technique reads
   * one: the entry of `says.facts` at the fact. */
  readonly fact?: object;
  /** The technique whose firing it is, where the rung it came from runs
   * others ({@link keptRung}); absent where the rung's own entry is it. */
  readonly technique?: string;
}

/**
 * A compiled technique as a rung: on the solve path it makes its facts as it
 * concludes them, and on the hint path each firing's facts are recorded with
 * the reason `reason` builds, one firing a call being one step. Where it
 * builds none, a technique that `says` records {@link Said}.
 */
export function compiledRung<B, C, S extends CellMarks = CellMarks, Y = undefined>(
  run: (b: Marks, sp: GridSpace, cl: C, fire: Fire<B, Y> | null) => number,
  cl: C,
  reason?: ReasonOf<B, S, Y>,
): Rung<S> {
  const reasonOf: ReasonOf<B, S, Y> =
    reason ??
    ((binding, _c, _n, _m, says, fact) =>
      ({
        binding,
        says,
        fact: (says as { facts?: readonly object[] } | undefined)?.facts?.[fact],
      }) satisfies Said<B, Y>);
  // The compiled technique passes what it says only where it says anything.
  const hear = (f: (binding: B, facts: Facts, says: Y) => boolean): Fire<B, Y> =>
    f as Fire<B, Y>;
  const rung = (m: S): number =>
    run(
      m,
      m.sp,
      cl,
      m.recorder
        ? hear((binding, facts, says) => {
            m.applyFacts(facts, (i) =>
              reasonOf(binding, facts[i + 1], facts[i + 2], m, says, i / 3),
            );
            return m.wholePasses;
          })
        : null,
    );
  // Given a `fire`, a technique makes no fact itself, so telling it to go on
  // reads every later binding on the same marks.
  rung.firings = (m: S): readonly Firing[] | "contradiction" => {
    const out: Firing[] = [];
    const ret = run(
      m,
      m.sp,
      cl,
      hear((binding, facts, says) => {
        const reasons: object[] = [];
        for (let i = 0; i < facts.length; i += 3)
          reasons.push(reasonOf(binding, facts[i + 1], facts[i + 2], m, says, i / 3));
        out.push({ facts: facts.slice(), reasons });
        return true;
      }),
    );
    return ret < 0 ? "contradiction" : out;
  };
  return rung as Rung<S>;
}

/** {@link compiledRung} of a technique that reads nothing the board deals. */
export function uncluedRung<B, S extends CellMarks = CellMarks, Y = undefined>(
  run: (b: Marks, sp: GridSpace, fire: Fire<B, Y> | null) => number,
  reason?: ReasonOf<B, S, Y>,
): Rung<S> {
  return compiledRung(
    (b, sp, _: null, fire: Fire<B, Y> | null) => run(b, sp, fire),
    null,
    reason,
  );
}

/**
 * A rung offering the firings of compiled `rungs` that `keep` keeps, each with
 * the reasons `keep` gives it (one a fact), and run as its first: how a hint
 * takes a technique's firing only where it serves another (Tents' links).
 * Where `keep` keeps none and `anyway` is set, the first firing offered is
 * kept as it came. Its facts are the compiled rungs' own, so it is one. Each
 * reason is stamped with the id of the technique that offered the firing
 * ({@link Said.technique}), since the entry this rung runs under is not it.
 */
export function keptRung<S extends CellMarks = CellMarks>(
  rungs: Readonly<Record<string, Rung<S>>>,
  keep: (m: S, firing: Firing) => readonly object[] | null,
  anyway = false,
): Rung<S> {
  const firings = (m: S): readonly Firing[] | "contradiction" => {
    const offered: { id: string; firing: Firing }[] = [];
    for (const [id, r] of Object.entries(rungs)) {
      const found = r.firings(m);
      if (found === "contradiction") return found;
      for (const firing of found) offered.push({ id, firing });
    }
    const stamped = (id: string, facts: Facts, reasons: readonly object[]): Firing => ({
      facts,
      reasons: reasons.map((r) => ({ ...r, technique: id })),
    });
    const out: Firing[] = [];
    for (const { id, firing } of offered) {
      const reasons = keep(m, firing);
      if (reasons !== null) out.push(stamped(id, firing.facts, reasons));
    }
    if (out.length > 0 || !anyway || offered.length === 0) return out;
    const [{ id, firing }] = offered;
    return [stamped(id, firing.facts, firing.reasons)];
  };
  const rung = (m: S): number => {
    const found = firings(m);
    if (found === "contradiction") return -1;
    if (found.length === 0) return 0;
    const [{ facts, reasons }] = found;
    m.applyFacts(facts, (i) => reasons[i / 3]);
    return 1;
  };
  rung.firings = firings;
  return rung as Rung<S>;
}

/**
 * A compiled technique that runs as each value is placed, its strikes
 * recorded as the placement's cull ({@link CellMarks.cullReason}).
 */
function placingRung<B, C>(
  run: (b: Marks, sp: GridSpace, cl: C, c: number, fire: Fire<B> | null) => number,
  cl: C,
): PlaceRung {
  return (m, c) => {
    run(
      m,
      m.sp,
      cl,
      c,
      m.recorder || m.graph
        ? (_, facts, says?: { reads?: Reads }) => {
            // The strikes follow the placed cell, which the technique reads
            // whether or not it says what else it does.
            m.graph?.record(facts, {
              cells: [c, ...(says?.reads?.cells ?? [])],
              edges: says?.reads?.edges ?? [],
            });
            m.applyFacts(facts, (i) => m.cullReason(c, facts[i + 1]));
            return true;
          }
        : null,
    );
  };
}

/** Why a technique run on striking struck a value: one was struck from
 * `(x, y)`. */
interface StruckReason {
  kind: "struck";
  x: number;
  y: number;
}

/**
 * A compiled technique that runs as a value is struck from a cell, its
 * strikes recorded as following that one ({@link StruckReason}).
 */
function strikingRung<B, C>(
  run: (b: Marks, sp: GridSpace, cl: C, c: number, fire: Fire<B> | null) => number,
  cl: C,
): StrikeRung {
  return (m, c) => {
    const w = m.sp.w;
    const reason: StruckReason = { kind: "struck", x: c % w, y: (c / w) | 0 };
    run(
      m,
      m.sp,
      cl,
      c,
      m.recorder
        ? (_, facts) => {
            // Each strike runs the technique again, on the cell struck, which
            // empties the buffer these facts are in.
            m.applyFacts(facts.slice(), () => reason);
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
  /** What a player calls the technique (the description's `names`): what
   * Check & save names a move it made by. */
  name: string;
  tier: number;
  scale?: string;
  from?: number;
  until?: number;
  /** How many times a board of its own tier fires it at most: one finished
   * at that tier only by more is graded above it ({@link overFired}). */
  most?: number;
  /** The variation that adds it, where one does. */
  variation?: string;
}

/** Whether a board the ladder at `caps` finished, firing as `firings`
 * counts, fired an entry of the tier its scale is capped at more often than
 * that entry's `most`: a board of the tier above, though no technique above
 * decided it (upstream undead.c's Easy, which grades by its passes). */
export function overFired(
  entries: readonly CompiledEntry[],
  caps: Caps,
  firings: FiringTally,
): boolean {
  return entries.some(
    (e) =>
      e.most !== undefined &&
      caps[e.scale ?? TIERS] === e.tier &&
      (firings.get(e.id) ?? 0) > e.most,
  );
}

/** A ladder entry with the rung that runs it. */
export interface LadderEntry<S extends CellMarks = CellMarks> extends CompiledEntry {
  run: Rung<S>;
}

/** A described game's ladder: its rungs, and what runs on placing and on
 * striking. */
export interface Ladder<S extends CellMarks = CellMarks> {
  entries: readonly LadderEntry<S>[];
  placing: readonly PlaceRung[];
  striking: readonly StrikeRung[];
}

/** Every firing the technique `id` of `ladder` could make on `m`, none where it
 * finds the marks inconsistent, which the mistake check rules out wherever a
 * hint runs. An id the ladder lacks is a bug in the caller. */
export function techniqueFirings<S extends CellMarks>(
  ladder: Ladder<S>,
  id: string,
  m: S,
): readonly Firing[] {
  const entry = ladder.entries.find((e) => e.id === id);
  if (entry === undefined) throw new Error(`no technique ${id} in the ladder`);
  const got = entry.run.firings(m);
  return got === "contradiction" ? [] : got;
}

/** A game's own ids among a compiled module's: a library's are written
 * `<library>.<technique>`. */
export type OwnId<Id extends string> = Exclude<Id, `${string}.${string}`>;

/** A `fire` any compiled technique takes: its binding and facts are read
 * only by the reason the rung builds. */
type AnyFire = Fire<unknown, never>;

/** A compiled rung's technique, as the module lists it: run on the board's
 * clues where it reads them. */
type CompiledRun<C> =
  | {
      readonly dealt: true;
      readonly run: (b: Marks, sp: GridSpace, cl: C, fire: AnyFire | null) => number;
    }
  | {
      readonly dealt: false;
      readonly run: (b: Marks, sp: GridSpace, fire: AnyFire | null) => number;
    };

/** A compiled technique run on placing or on striking, as the module lists
 * it. */
type CompiledOnCell<C> =
  | {
      readonly dealt: true;
      readonly run: (
        b: Marks,
        sp: GridSpace,
        cl: C,
        c: number,
        fire: AnyFire | null,
      ) => number;
    }
  | {
      readonly dealt: false;
      readonly run: (
        b: Marks,
        sp: GridSpace,
        c: number,
        fire: AnyFire | null,
      ) => number;
    };

/** A compiled module's own techniques by id, each with whether it reads
 * what the board deals: a rung's, and one run on placing or on striking. */
export type CompiledTechniquesOf<
  Id extends string,
  P extends string,
  K extends string,
> = Readonly<Record<OwnId<Id>, CompiledRun<never>>> &
  Readonly<Record<OwnId<P> | OwnId<K>, CompiledOnCell<never>>>;

/** The clues the techniques `T` read: the module's `Dealt`, or `null` where
 * none reads any. */
export type DealtOf<T> = [ReadDealt<T>] extends [never] ? null : ReadDealt<T>;
type ReadDealt<T> = {
  [Id in keyof T]: T[Id] extends {
    readonly dealt: true;
    readonly run: (b: Marks, sp: GridSpace, cl: infer C, ...rest: never[]) => number;
  }
    ? C
    : never;
}[keyof T];

/** What a compiled module says about its ladder, and its own techniques. */
export interface CompiledLadder<
  Id extends string,
  P extends string,
  K extends string = never,
  T extends CompiledTechniquesOf<Id, P, K> = CompiledTechniquesOf<Id, P, K>,
> {
  ladder: readonly CompiledEntry<Id>[];
  placing: readonly { id: P; variation?: string }[];
  striking: readonly { id: K; variation?: string }[];
  techniques: T;
}

/** The rungs a game supplies itself, by id: where it builds a technique's
 * reason, runs it otherwise than as compiled ({@link keptRung}), or gives a
 * library technique a reason that is not the library's. Every technique it
 * does not name the engine runs as compiled. */
export type OwnRungs<
  Id extends string,
  P extends string,
  S extends CellMarks,
  K extends string = never,
> = Partial<
  Record<Id, Rung<S>> & Record<OwnId<P>, PlaceRung> & Record<OwnId<K>, StrikeRung>
>;

/** A compiled module's own technique as a rung on the clues `dealt`. */
function compiledOf<C, S extends CellMarks>(t: CompiledRun<C>, dealt: C): Rung<S> {
  return t.dealt ? compiledRung(t.run, dealt) : uncluedRung(t.run);
}

/** A compiled module's own technique run on placing, on the clues `dealt`. */
function placingOf<C>(t: CompiledOnCell<C>, dealt: C): PlaceRung {
  return t.dealt ? placingRung(t.run, dealt) : uncluedPlacingRung(t.run);
}

/** A compiled module's own technique run on striking, on the clues `dealt`. */
function strikingOf<C>(t: CompiledOnCell<C>, dealt: C): StrikeRung {
  if (t.dealt) return strikingRung(t.run, dealt);
  const { run } = t;
  return strikingRung(
    (b, sp, _: null, c, fire: AnyFire | null) => run(b, sp, c, fire),
    null,
  );
}

/** A library's techniques, paired by the engine: by id, a rung or what runs
 * on placing. */
export interface Library {
  rungs: Readonly<Record<string, Rung>>;
  placing: Readonly<Record<string, PlaceRung>>;
}

const NO_LIBRARY: Library = { rungs: {}, placing: {} };

/**
 * A compiled module's ladder with its rungs: those the game supplies from
 * `own`, each library technique from `library`, and every other technique as
 * compiled, run on the clues `dealt` where it reads them. A technique a
 * variation adds is left out unless `variations` has it on.
 */
export function describedLadder<
  Id extends string,
  P extends string,
  S extends CellMarks,
  K extends string = never,
  T extends CompiledTechniquesOf<Id, P, K> = CompiledTechniquesOf<Id, P, K>,
>(
  module: CompiledLadder<Id, P, K, T>,
  dealt: DealtOf<T>,
  own: OwnRungs<Id, P, S, K> = {},
  library: Library = NO_LIBRARY,
  variations: readonly string[] = [],
): Ladder<S> {
  type C = DealtOf<T>;
  const pairs = own as Readonly<
    Record<string, Rung<S> | PlaceRung | StrikeRung | undefined>
  >;
  const compiled = module.techniques as unknown as Readonly<
    Record<string, CompiledRun<C> | CompiledOnCell<C> | undefined>
  >;
  const on = (e: { variation?: string }): boolean =>
    e.variation === undefined || variations.includes(e.variation);
  // The module lists a rung's technique as a `CompiledRun` and one run on a
  // cell as a `CompiledOnCell`, by the list its id is in.
  const pick = <T, U>(
    id: string,
    lib: Readonly<Record<string, T>>,
    ofCompiled: (t: U) => T,
  ): T => {
    const supplied = (pairs[id] as T | undefined) ?? lib[id];
    if (supplied !== undefined) return supplied;
    const t = compiled[id];
    if (t === undefined) throw new Error(`no rung pairs ${id}`);
    return ofCompiled(t as U);
  };
  return {
    entries: module.ladder.filter(on).map((e) => ({
      ...e,
      run: pick(
        e.id,
        library.rungs as Readonly<Record<string, Rung<S>>>,
        (t: CompiledRun<C>) => compiledOf<C, S>(t, dealt),
      ),
    })),
    placing: module.placing
      .filter(on)
      .map((e) =>
        pick(e.id, library.placing, (t: CompiledOnCell<C>) => placingOf(t, dealt)),
      ),
    striking: module.striking
      .filter(on)
      .map((e) => pick(e.id, {}, (t: CompiledOnCell<C>) => strikingOf(t, dealt))),
  };
}

/** Each scale's cap, by scale ({@link TIERS} for the description's own). A
 * scale with no cap does not run: Solo's killer scale on a board with no
 * cages. */
export type Caps = Readonly<Record<string, number>>;

/** Whether an entry runs at `caps`: its scale's cap reaches its tier and its
 * `from`, and has not reached its `until`. */
export function admits(entry: CompiledEntry, caps: Caps): boolean {
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
): CompiledTechniques {
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
  return compiledTechniques(out);
}

/** The one place a ladder is branded as compiled: every caller hands it
 * techniques made from a compiled module's entries. */
export function compiledTechniques(
  techniques: readonly DeductionTechnique[],
): CompiledTechniques {
  return techniques as CompiledTechniques;
}

/**
 * Run `techniques` on `m` to a fixpoint, each firing its own group, and say
 * whether one proved the marks inconsistent.
 */
export function runLadder(
  m: CellMarks,
  techniques: CompiledTechniques,
  opts: { firings?: FiringTally } = {},
): boolean {
  const { impossible } = runDeductionFixpoint({
    techniques,
    budget: m.budget,
    firings: opts.firings,
    beforeTechnique: () => {
      m.group++;
    },
  });
  return impossible;
}
