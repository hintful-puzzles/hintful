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
  availableStrikes,
  type CandidateHighlights,
  type CandidateMoveAdapter,
  emitObviousCleanStep,
  lazyPopulate,
  type Mark,
  type NoteEncoding,
  nakedSingles,
  regionDuplicateMarks,
} from "./candidate-hint.ts";
import type { DeductionRecord } from "./deduction-record.ts";
import type { HintStep } from "./game.ts";
import { type FrontierCandidate, HintFrontier } from "./hint-frontier.ts";
import { availablePlacements, type ClassifyRegion } from "./latin-hint.ts";
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

/** What a rung is told each time it is asked. */
export interface RungContext<R> {
  /** Every earlier rung came up empty this time, which is where a rung that may
   * fire only as the plan's last resort (a clue-forced placement,
   * `availablePlacements`' `nothingElse`) is allowed to. */
  nothingEarlier: boolean;
  /** The recording of the working board as it stands. */
  ops: readonly R[];
  /** Whether the notes have been penciled in. */
  populated: boolean;
}

/** One rung of a plan's ladder: the firings of one kind it could take now. */
export type CandidateRung<M, H, R, Reason> = (
  ctx: RungContext<R>,
) => readonly Firing<M, H, Reason>[];

/** What a step says and shades. The walk adds the move, the `targets` (the
 * cells the move acts on) and the `marks`, so none of those can disagree with
 * the move. */
export type StepWords<H> = Omit<H, "targets" | "marks"> & { explanation: string };

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
  Reg extends ClassifyRegion,
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
  /** The regions a single is classified in, in narration preference order. */
  regionsOf: (x: number, y: number) => readonly Reg[];
  /** The regions a placed value is culled from, and the obvious clean reads.
   * Default {@link regionsOf}; they differ where a region forbids repeats
   * without having to hold every value (a Killer cage). */
  cullRegionsOf?: (x: number, y: number) => readonly ClassifyRegion[];
  /** The reason a single the notes show narrates as. */
  singleReason: (
    n: number,
    why: { kind: "naked" } | { kind: "hidden"; region: Reg },
  ) => Reason;
  /** A placement's words; `continues` is true on a journey's later legs. */
  placeWords: (m: Mark, reason: Reason, continues: boolean) => StepWords<H>;
  /** A strike's words, including a placement's cull (a {@link DupReason}). */
  strikeWords: (
    marks: readonly Mark[],
    reason: Reason | DupReason,
    continues: boolean,
  ) => StepWords<H>;
  /** The axis a firing's strikes split into legs on: the ones sharing a key are
   * one leg, in the order their keys first appear. It follows what the
   * narration names singular (docs/games/hints.md § "Solve the way a human
   * does"). Default: the whole firing is one leg. */
  strikeAxis?: (op: R) => unknown;
  /** The words of the default setup: pencil everything in, then clear the
   * obvious. Omit only with {@link setUp}. */
  notes?: { populate: string; cleanObvious: string };
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
  /** The notes a recorded single is classified against, where the working
   * notes do not show the player's candidates (Group places before it
   * populates). */
  shownNotes?: () => ArrayLike<number>;
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
  Reg extends ClassifyRegion,
>(plan: CandidatePlan<M, H, R, Reason, Reg>): void {
  new CandidateWalk(plan).run();
}

class CandidateWalk<
  M,
  H extends CandidateHighlights,
  R extends DeductionRecord,
  Reason,
  Reg extends ClassifyRegion,
> {
  private ops: readonly R[];
  private readonly bit: (n: number) => number;
  private readonly place: (x: number, y: number, n: number, autoElim: boolean) => M;
  private readonly strike: (marks: Mark[]) => M;
  private readonly cull: (x: number, y: number) => readonly ClassifyRegion[];
  private readonly setUp: PlanSetUp;
  private readonly populated: () => boolean;
  /** Each firing's steps, built once whether the frontier or the take asks. */
  private readonly built = new WeakMap<Firing<M, H, Reason>, HintStep<M, H>[]>();

  constructor(private readonly plan: CandidatePlan<M, H, R, Reason, Reg>) {
    const { w, grid, pencil, steps, enc } = plan;
    this.ops = plan.record();
    this.bit = enc?.bit ?? ((n: number): number => 1 << n);
    const dialect = plan.moves;
    this.place = (dialect?.place ?? latinMoves.place) as typeof this.place;
    this.strike = (dialect?.strike ?? latinMoves.strike) as typeof this.strike;
    this.cull = plan.cullRegionsOf ?? plan.regionsOf;
    if (plan.setUp) {
      const setUp = plan.setUp;
      this.setUp = setUp;
      this.populated = () => setUp.done();
    } else {
      const notes = plan.notes;
      if (!notes) throw new Error(`${plan.label}: give either notes or setUp`);
      const pop = lazyPopulate<M, H>(
        { grid, pencil },
        grid,
        pencil,
        w,
        steps,
        notes.populate,
      );
      this.setUp = populateThenClean(pop, () =>
        emitObviousCleanStep(steps, grid, pencil, w, this.cull, notes.cleanObvious, {
          enc,
          adapter: dialect,
        }),
      );
      this.populated = pop.done;
    }
  }

  run(): void {
    const { plan } = this;
    const w = plan.w;
    const frontier = new HintFrontier(w, plan.grid.length / w);
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
      for (const rung of rungs) {
        const firings = rung({
          nothingEarlier,
          ops: this.ops,
          populated: this.populated(),
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

  private singles(): Firing<M, H, Reason>[] {
    const { plan } = this;
    const marks =
      plan.singles?.() ?? nakedSingles(plan.grid, plan.pencil, plan.w, plan.enc);
    return marks.map((m) => this.placing(m, plan.singleReason(m.n, { kind: "naked" })));
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
      plan.pencil,
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
      plan.shownNotes?.() ?? plan.pencil,
      plan.w,
      plan.regionsOf,
      nothingEarlier,
      { enc: plan.enc, placed: plan.placed?.() },
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

  /** What a firing rests on: the evidence and the cells of every step it shows. */
  private premise(f: Firing<M, H, Reason>): Point[] {
    return this.stepsOf(f).flatMap((s) => {
      const h = s.highlights;
      return h ? [...h.area, ...h.targets] : [];
    });
  }

  private stepsOf(f: Firing<M, H, Reason>): HintStep<M, H>[] {
    let steps = this.built.get(f);
    if (!steps) {
      steps = f.map((leg, i) => this.stepOf(leg, i > 0));
      this.built.set(f, steps);
    }
    return steps;
  }

  private stepOf(leg: Leg<M, H, Reason>, continues: boolean): HintStep<M, H> {
    if ("step" in leg) return leg.step;
    if ("strike" in leg) return this.strikeStep(leg.strike, leg.reason, continues);
    const { x, y, n } = leg.place;
    const { explanation, ...evidence } = this.plan.placeWords(
      leg.place,
      leg.reason,
      continues,
    );
    return {
      move: this.place(x, y, n, this.plan.autoClean),
      explanation,
      highlights: { ...evidence, targets: [{ x, y }], marks: [] } as unknown as H,
    };
  }

  private strikeStep(
    struck: readonly Mark[],
    reason: Reason | DupReason,
    continues: boolean,
  ): HintStep<M, H> {
    const marks = [...struck];
    const { explanation, ...evidence } = this.plan.strikeWords(
      marks,
      reason,
      continues,
    );
    return {
      move: this.strike(marks),
      explanation,
      highlights: { ...evidence, targets: cellsOf(marks), marks } as unknown as H,
    };
  }

  /** Push a firing's steps, the later legs continuing the first, and play each
   * on the working board. */
  private take(f: Firing<M, H, Reason>): void {
    const { plan } = this;
    const steps = this.stepsOf(f);
    let decided = false;
    f.forEach((leg, i) => {
      const step = steps[i];
      if (i > 0) step.continuesPrevious = true;
      plan.steps.push(step);
      if ("step" in leg) {
        leg.apply();
        decided = true;
      } else if ("strike" in leg) {
        this.clear(leg.strike);
      } else {
        this.placeOnBoard(leg.place);
        decided = true;
      }
    });
    if (decided) this.ops = plan.record();
  }

  private clear(marks: readonly Mark[]): void {
    const { pencil, w } = this.plan;
    for (const m of marks) pencil[m.y * w + m.x] &= ~this.bit(m.n);
  }

  /** Write a placement to the working board and strike its value from the rest
   * of its regions: silently under auto-pencil, whose move does the same on the
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
      this.cull(x, y),
      plan.enc,
    );
    this.clear(dup);
    if (plan.autoClean || dup.length === 0) return;
    const step = this.strikeStep(dup, { kind: "dup", n, px: x, py: y }, true);
    step.continuesPrevious = true;
    plan.steps.push(step);
  }
}
