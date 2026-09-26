/**
 * The candidate-elimination hint *plan*: the walk every pencil-notes game's
 * `buildSteps` takes, and the one place its steps are built and applied.
 *
 * A game hands {@link runCandidatePlan} what is its own — the recording solver,
 * its regions, its words for a placement and a strike, the axis its strikes
 * split on, and any rungs of its own — and the walk does the rest: the naked
 * singles, the recorded strikes and placements as rungs, populate and the
 * obvious clean, the row/column cull after each placement, the journey flags,
 * and each next firing taken through a `HintFrontier`. See docs/games/hints.md
 * § "Candidate-elimination games".
 *
 * **A firing is data, and its steps are built here.** A rung returns firings as
 * lists of legs (a placement, a strike, or a step of the game's own), and the
 * walk turns each leg into the step the player is shown. The frontier reads a
 * firing's premise off those same steps (`area ∪ targets`), so what the plan
 * continues from can never differ from what the player sees.
 */

import {
  addMove,
  availableStrikes,
  type CandidateHighlights,
  type CandidateMoveAdapter,
  type CandidateReading,
  emitObviousCleanStep,
  fillAllNotes,
  impliedNotes,
  lazyPopulate,
  type Mark,
  type NoteEncoding,
  nakedSingles,
  type Reach,
  regionDuplicateMarks,
  regionReach,
} from "./candidate-hint.ts";
import type { DeductionRecord } from "./deduction-record.ts";
import type { HintStep } from "./game.ts";
import { type FrontierCandidate, gridKey, HintFrontier } from "./hint-frontier.ts";
import {
  type Conclusions,
  candidateConclusions,
  cleanObviousText,
  noteText,
  type Premise,
  populateText,
} from "./hint-text.ts";
import {
  availablePlacements,
  type CellRegion,
  hiddenSingleLine,
  hiddenSingleOf,
  type RowColRegion,
  rowColRegions,
  type SingleReason,
  type SingleWhy,
  singleReasonOf,
  type WholeRegion,
} from "./latin-hint.ts";
import { stepBudget } from "./step-budget.ts";
import type { Point } from "./types.ts";

/** Why a placement's row/column cull strikes what it strikes: the value just
 * placed at `(px, py)`. Every candidate game's reason union carries it. */
export interface DupReason {
  kind: "dup";
  n: number;
  px: number;
  py: number;
}

/** One leg of a firing: one step the player is shown. A `step` leg is a move the
 * canonical shapes have no room for (Salad's markers), built by the game and
 * applied to the working board by its own `apply`. */
export type Leg<M, H, Reason> =
  | { place: Mark; reason: Reason }
  | { strike: readonly Mark[]; reason: Reason }
  | { step: HintStep<M, H>; apply(): void };

/** One firing: its legs in order, read and played as one journey. */
export type Firing<M, H, Reason> = readonly Leg<M, H, Reason>[];

/** A step the walk has built, and how to play it on the working board:
 * `apply` says whether it decided a cell, which is when the solver reruns. */
interface Built<M, H> {
  step: HintStep<M, H>;
  apply(): boolean;
}

/** A note-less cell a strike was folded into: the notes it now has, or the
 * value placed there. */
interface Folded {
  bits: number;
  placed: number | null;
}

/** What a rung is told each time it is asked. */
export interface RungContext<R> {
  /** Every earlier rung came up empty this time, which is where a rung that may
   * fire only as the plan's last resort (a clue-forced placement,
   * `availablePlacements`' `nothingElse`) is allowed to. */
  nothingEarlier: boolean;
  /** The recording of the working board as it stands. */
  ops: readonly R[];
  /** Whether the notes have been set up: penciled in and cleaned under the
   * `populate` reading, cleaned under the `implicit` one. */
  populated: boolean;
  /** Every blank cell's candidates as the player reads them: its notes, and
   * under the implicit reading (or before a populate) what its regions leave a
   * cell with none (`impliedNotes`). */
  shown: ArrayLike<number>;
}

/** One rung of a plan's ladder: the firings of one kind it could take now. */
export type CandidateRung<M, H, R, Reason> = (
  ctx: RungContext<R>,
) => readonly Firing<M, H, Reason>[];

/** What a step says and shades. The walk adds the move, the `targets` (the
 * cells the move acts on) and the `marks`, so none of those can disagree with
 * the move.
 *
 * `reads` names the cells whose candidates the step rests on beyond the ones it
 * outlines: a cage deduction hatches its cage, since the sentence names the
 * cage, yet what it concludes depends on what every cell of it can still be.
 * The walk treats them as premise: the frontier continues from them, and under
 * the implicit reading their notes go on the board first. They ride on the
 * step's highlights (`CandidateHighlights.reads`) as data; nothing draws them. */
export type StepWords<H> = Omit<H, "targets" | "marks"> & {
  explanation: string;
  reads?: readonly Point[];
};

/** What a strike says and shades: its {@link Premise}, which the walk finishes
 * with the move the step makes (the plan's `conclude`), so a strike's ending is
 * never the game's to write. */
export type StrikeWords<H> = Omit<StepWords<H>, "explanation"> & Premise;

/** The setup a candidate plan does before its every rung competes. */
export interface PlanSetUp {
  /** Whether the setup is finished. */
  done(): boolean;
  /** Take the next setup step, and say whether it pushed a step; one that
   * pushed nothing (a clean with nothing to clean) still counts as taken. */
  step(): boolean;
}

/**
 * The {@link PlanSetUp} most games take: pencil the notes in once (`pop`,
 * usually {@link lazyPopulate}), then clean the obvious candidates once
 * (`clean`, usually {@link emitObviousCleanStep}, reporting whether it pushed
 * a step).
 */
export function populateThenClean(
  pop: { done(): boolean; ensure(): void },
  clean: () => boolean,
): PlanSetUp {
  let cleaned = false;
  return {
    done: () => pop.done() && cleaned,
    step: () => {
      if (!pop.done()) {
        pop.ensure();
        return true;
      }
      cleaned = true;
      return clean();
    },
  };
}

/** A candidate-elimination game's plan, as {@link runCandidatePlan} walks it.
 * The hooks are properties rather than methods so a game's handler is checked
 * against them strictly: a reason union without {@link DupReason} fails to
 * type-check rather than narrating a strike it cannot name. */
export interface CandidatePlan<
  M,
  H extends CandidateHighlights,
  R extends DeductionRecord,
  Reason,
  Reg extends CellRegion,
> {
  /** The board's row stride; its height is read off `grid`. */
  w: number;
  /** The steps the plan pushes to. */
  steps: HintStep<M, H>[];
  /** The working board, advanced as the plan is built: 0 = empty. */
  grid: Uint8Array | Int8Array;
  /** The working notes, in `enc`'s encoding. */
  pencil: Int32Array;
  enc?: NoteEncoding;
  /** The game's move dialect, when it is not the Latin family's. */
  moves?: CandidateMoveAdapter<M>;
  /** The auto-pencil preference: a placement's cull is silent rather than taught. */
  autoClean: boolean;
  /** How a blank cell with no notes reads ({@link CandidateReading}). Under
   * `implicit` there is no populate: a firing first writes the notes of every
   * blank, note-less cell it strikes or outlines as evidence, one leg each, and
   * a single needs no notes at all. Default `populate`. */
  reading?: CandidateReading;
  /** Names the plan if its step budget trips. */
  label: string;
  /** Iteration cap, a backstop for a rung that fires without progress. Default
   * `4w³ + 4`. */
  cap?: number;
  /** Whether the working board is finished. Default: no cell is empty. */
  finished?: () => boolean;
  /** Run the recording solver on the working board. Called at the start and
   * after every firing that decides a cell. */
  record: () => readonly R[];
  /** A cell's regions, in narration preference order. A single is classified in
   * the ones that hold every value, and unless {@link reach} says otherwise, a
   * placed value rules itself out of all of them. */
  regionsOf: (x: number, y: number) => readonly Reg[];
  /** The cells a value rules itself out of, where that depends on the value (a
   * Seismic 3 reaches three cells along its row and column). The placement cull,
   * the obvious clean and a note-less cell's implied candidates all read it.
   * Default: every cell of the placed cell's `regionsOf`. */
  reach?: Reach;
  /** The reason a single the board shows narrates as. */
  singleReason: (n: number, why: SingleWhy<WholeRegion<Reg>>) => Reason;
  /** A placement's words; `continues` is true on a journey's later legs. */
  placeWords: (m: Mark, reason: Reason, continues: boolean) => StepWords<H>;
  /** A strike's words, including a placement's cull (a {@link DupReason}). */
  strikeWords: (
    marks: readonly Mark[],
    reason: Reason | DupReason,
    continues: boolean,
  ) => StrikeWords<H>;
  /** How a strike's sentence ends, by the move its step makes. Under the
   * implicit reading a strike from one cell with no notes is not a strike at
   * all: its step writes the values left, or places the one left. */
  conclude: Conclusions;
  /** The axis a firing's strikes split into legs on: the ones sharing a key are
   * one leg, in the order their keys first appear. It follows what the
   * narration names singular (docs/games/hints.md § "Solve the way a human
   * does"). Default: the whole firing is one leg. */
  strikeAxis?: (op: R) => unknown;
  /** The words of the default setup: pencil everything in, then clear the
   * obvious; and of a note leg under the implicit reading, which writes
   * `values` into the note-less `cell` (`every` when its regions rule nothing
   * out yet). Omit only with {@link setUp}. */
  notes?: {
    populate: string;
    cleanObvious: string;
    note: (cell: Point, values: number[], every: boolean) => string;
  };
  /** A setup of the game's own, replacing the default. */
  setUp?: PlanSetUp;
  /** The game's own rungs, tried after the naked singles and before the
   * recorded strikes and placements, in the note-free opening too. */
  rungs?: readonly CandidateRung<M, H, R, Reason>[];
  /** The naked singles, where the game's differ from `nakedSingles` (Salad's
   * lone "might be empty" note is a marker, not a value). */
  singles?: () => readonly Mark[];
  /** Whether a recorded placement is one the plan places (Salad's hole symbols
   * are settled by markers instead). Default: all of them. */
  placeable?: (op: R) => boolean;
  /** Which cells are already decided, where that differs from `grid`
   * (`firstUnreflectedPlaceIndex`). */
  placed?: () => ArrayLike<number>;
  /** The firing a placement belongs to, where one placement forces others
   * (Group's identity row and column). Default: the placement alone. */
  placement?: (m: Mark, reason: Reason, ops: readonly R[]) => Firing<M, H, Reason>;
  /** Called after a placement is written to the working board. */
  onPlace?: (x: number, y: number, n: number) => void;
  /** Called when nothing fires, before the plan ends: the place for a check
   * that the solver forces nothing the plan could not explain. */
  stuck?: () => void;
}

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

/** The values `marks` strike, smallest first: the list a strike's narration
 * names. A value struck in two cells appears twice; the sentence decides
 * whether to name it once. */
export function valuesOf(marks: readonly Mark[]): number[] {
  return marks.map((m) => m.n).sort((a, b) => a - b);
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

/**
 * Walk a candidate plan: from the working board, take the note-free firings
 * while the notes are being set up, then every rung, until the board is
 * finished or nothing fires. The ladder is the naked singles, the game's own
 * rungs, the recorded strikes, then the recorded placements; which firing is
 * taken is the `HintFrontier`'s choice, so a plan continues from its latest
 * steps where it can and otherwise follows the ladder.
 */
export function runCandidatePlan<
  M,
  H extends CandidateHighlights,
  R extends DeductionRecord,
  Reason,
  Reg extends CellRegion,
>(plan: CandidatePlan<M, H, R, Reason, Reg>): void {
  new CandidateWalk(plan).run();
}

/** Whether a reason union can hold the {@link SingleReason} the row/column
 * preset synthesizes. `unknown` when it can (and so intersects away), `never`
 * when it cannot, which makes the plan unassignable — a game whose singles
 * narrate differently (Solo names a block or a diagonal) is turned back to
 * {@link runCandidatePlan} by the checker rather than by a convention. The
 * tuples stop the union distributing, so `Reason` is tested whole. */
type NarratesSingles<Reason> = [SingleReason] extends [Reason] ? unknown : never;

/** A {@link CandidatePlan} with the row/column family's answers taken out: see
 * {@link runLatinCandidatePlan} for why each one is not a parameter. */
export type LatinCandidatePlan<
  M,
  H extends CandidateHighlights,
  R extends DeductionRecord,
  Reason,
> = Omit<
  CandidatePlan<M, H, R, Reason, RowColRegion>,
  "regionsOf" | "singleReason" | "notes" | "conclude"
> & {
  /** The words the shared setup sentences and conclusions are built from: the
   * game's singular noun for a cell's value ("number", "height", "element"), its
   * verb for one already on the board ("standing", "placed"), how a value prints
   * where it is not a plain number (Group's letters), and what it calls a cell
   * where that is not "cell" (Salad's squares). The region phrase is not among
   * them — a game whose regions are a row and a column has no other answer. */
  notes: {
    noun: string;
    placedVerb: string;
    value?: (n: number) => string;
    cell?: string;
  };
};

/**
 * The plain row/column Latin square's {@link runCandidatePlan}: a preset over
 * it, not a second entry point, so a game supplies its recording solver, its
 * rungs and its own words and nothing else.
 *
 * **What it fills in is what a row and a column *force*** — the test being
 * AGENTS.md § "Convention over configuration"'s, *can we say what a game would
 * legitimately want to do differently?*, asked per field:
 *
 * - `regionsOf` is {@link rowColRegions}. That is the one genuine choice, and
 *   taking it is what this preset *is*;
 * - `singleReason` is {@link singleReasonOf}. Once `Reg` is a
 *   {@link RowColRegion} it is the only inhabitant of that signature, so the
 *   question has one answer rather than six games agreeing;
 * - a hidden single's line ({@link hiddenSingleLine}) is hatched, for the same
 *   reason. The game's `placeWords` still says *why*; the preset marks
 *   *where*, and the game's other placement arms are untouched;
 * - the setup sentences and the conclusions, from the game's `notes`
 *   vocabulary.
 *
 * A game whose regions, singles or setup genuinely differ stays on
 * {@link runCandidatePlan}, which every game may call and which the checker
 * sends it back to anyway ({@link NarratesSingles}).
 */
export function runLatinCandidatePlan<
  M,
  H extends CandidateHighlights,
  R extends DeductionRecord,
  Reason,
>(plan: LatinCandidatePlan<M, H, R, Reason> & NarratesSingles<Reason>): void {
  const { w, notes, placeWords, ...rest } = plan;
  const value = notes.value ?? String;
  const cell = notes.cell ?? "cell";
  const vocab = {
    noun: notes.noun,
    placedVerb: notes.placedVerb,
    regions: "row or column",
    cell,
  };
  const full: CandidatePlan<M, H, R, Reason, RowColRegion> = {
    ...rest,
    w,
    notes: {
      populate: populateText(notes.noun, cell),
      cleanObvious: cleanObviousText(notes.noun, notes.placedVerb, vocab.regions, cell),
      note: (_cell, values, every) => noteText(values.map(value), every, vocab),
    },
    conclude: candidateConclusions({ value, cell }),
    regionsOf: (x, y) => rowColRegions(x, y, w),
    // Sound because `NarratesSingles` has already rejected a plan whose reason
    // union cannot hold what `singleReasonOf` returns; the checker cannot
    // narrow `Reason` from that constraint, which is all the cast says.
    singleReason: singleReasonOf as CandidatePlan<
      M,
      H,
      R,
      Reason,
      RowColRegion
    >["singleReason"],
    placeWords: (m, reason, continues) => {
      const words = placeWords(m, reason, continues);
      const hidden = hiddenSingleOf(reason);
      if (!hidden) return words;
      // The line the sentence names ("in this row") is hatched, not outlined:
      // an outline marks particular cells. Asserted like the walk's other
      // highlight constructions: `H` extends `CandidateHighlights`.
      return {
        ...words,
        area: [],
        hatch: hiddenSingleLine(hidden.line, hidden.index, w),
      } as StepWords<H>;
    },
  };
  runCandidatePlan(full);
}

class CandidateWalk<
  M,
  H extends CandidateHighlights,
  R extends DeductionRecord,
  Reason,
  Reg extends CellRegion,
> {
  private ops: readonly R[];
  private readonly bit: (n: number) => number;
  private readonly place: (x: number, y: number, n: number, autoElim: boolean) => M;
  private readonly strike: (marks: Mark[]) => M;
  private readonly setUp: PlanSetUp;
  private readonly implicit: boolean;
  private readonly reach: Reach;
  /** The candidates as the player reads them (`impliedNotes`), taken afresh on
   * every turn of the walk. */
  private shown: Int32Array;
  /** Each firing's steps, built once whether the frontier or the take asks. */
  private readonly built = new WeakMap<Firing<M, H, Reason>, Built<M, H>[]>();

  constructor(private readonly plan: CandidatePlan<M, H, R, Reason, Reg>) {
    const { w, grid, pencil, steps, enc } = plan;
    this.ops = plan.record();
    this.bit = enc?.bit ?? ((n: number): number => 1 << n);
    const dialect = plan.moves;
    this.place = (dialect?.place ?? latinMoves.place) as typeof this.place;
    this.strike = (dialect?.strike ?? latinMoves.strike) as typeof this.strike;
    this.implicit = plan.reading === "implicit";
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
        // reads the notes as written.
        let cleaned = false;
        this.setUp = {
          done: () => cleaned,
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
    const frontier = new HintFrontier(gridKey(w, plan.grid.length / w));
    const budget = stepBudget(plan.label);
    const finished = plan.finished ?? (() => !plan.grid.includes(0));
    const own = plan.rungs ?? [];
    const singles: CandidateRung<M, H, R, Reason> = () => this.singles();
    const strikes: CandidateRung<M, H, R, Reason> = () => this.strikes();
    const places: CandidateRung<M, H, R, Reason> = (ctx) =>
      this.places(ctx.nothingEarlier);
    const opening = [singles, ...own];
    const ladder = [singles, ...own, strikes, places];
    const listed = (
      rungs: readonly CandidateRung<M, H, R, Reason>[],
    ): FrontierCandidate[][] => {
      const lists: FrontierCandidate[][] = [];
      let nothingEarlier = true;
      this.shown = this.view();
      for (const rung of rungs) {
        const firings = rung({
          nothingEarlier,
          ops: this.ops,
          populated: this.setUp.done(),
          shown: this.shown,
        });
        if (firings.length > 0) nothingEarlier = false;
        lists.push(firings.map((f) => this.candidate(f)));
      }
      return lists;
    };
    const cap = plan.cap ?? w * w * w * 4 + 4;
    for (let guard = 0; guard < cap; guard++) {
      budget.tick();
      if (finished()) return;
      if (!this.setUp.done()) {
        if (frontier.take(listed(opening), plan.steps)) continue;
        if (this.setUp.step()) continue;
      }
      if (!frontier.take(listed(ladder), plan.steps)) {
        plan.stuck?.();
        return;
      }
    }
  }

  // --- the standard rungs ---------------------------------------------------

  /** The singles the board shows. Under the populate reading that is the notes
   * alone, so the note-free opening places none of the cells a populate would
   * go on to pencil in. */
  private singles(): Firing<M, H, Reason>[] {
    const { plan } = this;
    const notes = this.implicit ? this.shown : plan.pencil;
    const marks = plan.singles?.() ?? nakedSingles(plan.grid, notes, plan.w, plan.enc);
    return marks.map((m) =>
      this.placing(
        m,
        plan.singleReason(m.n, {
          kind: plan.pencil[m.y * plan.w + m.x] === 0 ? "regionsFull" : "naked",
        }),
      ),
    );
  }

  private strikes(): Firing<M, H, Reason>[] {
    const { plan } = this;
    const firings = new Map<readonly R[], Firing<M, H, Reason>>();
    const firingOf = (live: readonly R[]): Firing<M, H, Reason> => {
      let f = firings.get(live);
      if (!f) {
        f = this.split(live);
        firings.set(live, f);
      }
      return f;
    };
    return availableStrikes(
      this.ops,
      plan.grid,
      this.shown,
      plan.w,
      (live) => this.premise(firingOf(live)),
      { enc: plan.enc, placed: plan.placed?.() },
    ).map(firingOf);
  }

  /** One firing's live strikes as legs, split on the game's axis. */
  private split(live: readonly R[]): Firing<M, H, Reason> {
    const axis = this.plan.strikeAxis ?? (() => null);
    const buckets = new Map<unknown, R[]>();
    for (const op of live) {
      const key = axis(op);
      const bucket = buckets.get(key);
      if (bucket) bucket.push(op);
      else buckets.set(key, [op]);
    }
    return [...buckets.values()].map((ops) => ({
      strike: ops.map((op) => ({ x: op.x, y: op.y, n: op.n })),
      reason: ops[0].reason as Reason,
    }));
  }

  private places(nothingEarlier: boolean): Firing<M, H, Reason>[] {
    const { plan } = this;
    const placeable = plan.placeable;
    const ops = placeable
      ? this.ops.filter((op) => op.kind !== "place" || placeable(op))
      : this.ops;
    return availablePlacements(
      ops,
      plan.grid,
      this.shown,
      plan.w,
      plan.regionsOf,
      nothingEarlier,
      { enc: plan.enc, placed: plan.placed?.(), written: plan.pencil },
    ).map(({ op, why }) =>
      this.placing(
        op,
        why.kind === "recorded" ? (op.reason as Reason) : plan.singleReason(op.n, why),
      ),
    );
  }

  private placing(m: Mark, reason: Reason): Firing<M, H, Reason> {
    return this.plan.placement?.(m, reason, this.ops) ?? [{ place: m, reason }];
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
  private stepsOf(f: Firing<M, H, Reason>): Built<M, H>[] {
    let built = this.built.get(f);
    if (!built) {
      built = this.implicit
        ? this.implicitSteps(f)
        : f.map((leg, i) => this.builtLeg(leg, i > 0));
      this.built.set(f, built);
    }
    return built;
  }

  private builtLeg(leg: Leg<M, H, Reason>, continues: boolean): Built<M, H> {
    if ("step" in leg)
      return {
        step: leg.step,
        apply: () => {
          leg.apply();
          return true;
        },
      };
    if ("strike" in leg)
      return this.struck(
        leg.strike,
        this.plan.strikeWords(leg.strike, leg.reason, continues),
      );
    const { x, y, n } = leg.place;
    const { explanation, ...evidence } = this.plan.placeWords(
      leg.place,
      leg.reason,
      continues,
    );
    return {
      step: {
        move: this.place(x, y, n, this.plan.autoClean),
        explanation,
        highlights: { ...evidence, targets: [{ x, y }], marks: [] } as unknown as H,
      },
      apply: () => {
        this.placeOnBoard(leg.place);
        return true;
      },
    };
  }

  /**
   * Under the implicit reading, a firing's steps with the candidates it reads
   * written down first. An outlined blank cell is evidence only through what it
   * can still be, and a player following a deduction over several cells cannot
   * hold each one's candidates in their head (Map's owner playtests,
   * docs/games/hints.md § "A graph, not a grid (Map)"). So each blank, note-less
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
  private implicitSteps(f: Firing<M, H, Reason>): Built<M, H>[] {
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
    const own: Built<M, H>[] = [];
    f.forEach((leg, k) => {
      let built: Built<M, H>;
      if ("strike" in leg) {
        // A fold earlier in this firing may already have settled a cell this
        // leg strikes from.
        const marks = leg.strike.filter((m) => !this.settled(m, folded));
        if (marks.length === 0) return;
        const words = this.plan.strikeWords(marks, leg.reason, k > 0);
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
    words: StrikeWords<H>,
    folded: Map<number, Folded>,
  ): Built<M, H> {
    const { plan } = this;
    const x = i % plan.w;
    const y = (i / plan.w) | 0;
    const {
      premise,
      where: _where,
      struck: _struck,
      named: _named,
      ...evidence
    } = words;
    let bits = this.shown[i];
    for (const m of marks) bits &= ~this.bit(m.n);
    // The view was taken before the firing, so a value an earlier fold placed
    // in one of this cell's regions is still in it.
    for (const [j, fold] of folded)
      if (fold.placed !== null && this.rulesOut(j, fold.placed, i))
        bits &= ~this.bit(fold.placed);
    const left = this.valuesIn(bits);
    const highlights = { ...evidence, targets: [{ x, y }], marks: [] } as unknown as H;
    // Unreachable while the recording is sound: a strike never takes the
    // solution's value, and a cell's implied notes always hold it.
    if (left.length === 0)
      throw new Error(`${plan.label}: a strike empties (${x}, ${y})`);
    if (left.length === 1) {
      const n = left[0];
      folded.set(i, { bits: 0, placed: n });
      return {
        step: {
          move: this.place(x, y, n, plan.autoClean),
          explanation: `${premise}, so ${plan.conclude.place(n)}.`,
          highlights,
        },
        apply: () => {
          this.placeOnBoard({ x, y, n });
          return true;
        },
      };
    }
    folded.set(i, { bits, placed: null });
    return {
      step: {
        move: addMove(
          left.map((n) => ({ x, y, n })),
          plan.moves,
        ),
        explanation: `${premise}, so ${plan.conclude.keep(left)}.`,
        highlights,
      },
      apply: () => {
        plan.pencil[i] = bits;
        return false;
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

  private noteLeg(i: number): Built<M, H> {
    const { plan } = this;
    const x = i % plan.w;
    const y = (i / plan.w) | 0;
    const values = this.valuesIn(this.shown[i]);
    const marks = values.map((n) => ({ x, y, n }));
    const bits = this.shown[i];
    // Unreachable: the implicit reading refuses a game's own setup, and the
    // default setup refuses a plan without `notes`.
    if (!plan.notes) throw new Error(`${plan.label}: a note leg needs notes`);
    return {
      step: {
        move: addMove(marks, plan.moves),
        explanation: plan.notes.note({ x, y }, values, bits === this.fillAll(i)),
        highlights: { area: [], targets: [{ x, y }], marks: [] } as unknown as H,
      },
      apply: () => {
        plan.pencil[i] = bits;
        return false;
      },
    };
  }

  /** A strike's step, played by clearing its marks. */
  private struck(marks: readonly Mark[], words: StrikeWords<H>): Built<M, H> {
    return {
      step: this.strikeStep(marks, words),
      apply: () => {
        this.clear(marks);
        return false;
      },
    };
  }

  /** A strike concluded as one: its premise, then the plan's words for the
   * values it crosses out. */
  private strikeStep(struck: readonly Mark[], words: StrikeWords<H>): HintStep<M, H> {
    const marks = [...struck];
    const { premise, where, struck: noun, named, ...evidence } = words;
    const ending = this.plan.conclude.strike(valuesOf(marks), {
      where,
      struck: noun,
      named,
    });
    return {
      move: this.strike(marks),
      explanation: `${premise}, so ${ending}.`,
      highlights: { ...evidence, targets: cellsOf(marks), marks } as unknown as H,
    };
  }

  /** Push a firing's steps, the later legs continuing the first, and play each
   * on the working board. */
  private take(f: Firing<M, H, Reason>): void {
    const { plan } = this;
    let decided = false;
    this.stepsOf(f).forEach(({ step, apply }, i) => {
      if (i > 0) step.continuesPrevious = true;
      plan.steps.push(step);
      if (apply()) decided = true;
    });
    if (decided) this.ops = plan.record();
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
      plan.strikeWords(dup, { kind: "dup", n, px: x, py: y }, true),
    );
    step.continuesPrevious = true;
    plan.steps.push(step);
  }
}
