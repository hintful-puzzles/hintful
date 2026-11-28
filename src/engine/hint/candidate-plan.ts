/**
 * The candidate-elimination hint *plan*: what every pencil-notes game's
 * `buildSteps` hands the walk, and the call that walks it.
 *
 * A game hands {@link runCandidatePlan} what is its own — its regions, its
 * words for a placement and a strike, and its rungs, which run its ladder's
 * techniques on the notes ({@link techniqueRung}) — and the walk does the
 * rest: the naked and hidden singles, populate and the obvious clean, the
 * row/column cull after each placement, the journey flags, and each next
 * firing taken through a `HintFrontier`. See docs/hints-candidates.md
 * § "What every game does".
 *
 * **A firing is data.** A rung returns firings as lists of legs (a placement,
 * a strike, or a step of the game's own), and the walk turns each leg into
 * the step the player is shown. The frontier reads a firing's premise off
 * those same steps (`area ∪ hatch ∪ reads ∪ targets`), so what the plan
 * continues from can never differ from what the steps carry.
 */

import type { HintStep } from "../contract/game.ts";
import type { Sentence } from "../contract/hint-words.ts";
import type { Point } from "../contract/types.ts";
import type { CellMarks, DupReason } from "../solve/cell-marks.ts";
import { STRIKE } from "../solve/describe-runtime.ts";
import {
  admits,
  type Caps,
  type Ladder,
  type Firing as LadderFiring,
  techniqueFirings,
} from "../solve/ladder-runtime.ts";
import {
  type CandidateHighlights,
  type CandidateMoveAdapter,
  type CandidateReading,
  type Mark,
  NOTES_RUNGS,
  type NoteEncoding,
  type NotesRung,
  type PlanJudging,
  type Reach,
} from "./candidate-hint.ts";
import { CandidateWalk } from "./candidate-walk.ts";
import type { Conclusions, Premise } from "./hint-text.ts";
import type { CellRegion, SingleWhy, WholeRegion } from "./latin-hint.ts";

/** The rungs the walk speaks in every game: the setup's, and a placement's
 * cull ({@link DupReason}). */
export const CANDIDATE_RUNGS = [...NOTES_RUNGS, "dup"] as const;

/** The rungs a plan's steps carry: the walk's own, and the `kind` of each of
 * the game's reasons, which is the rung of the step a reason narrates. */
export type PlanRung<Reason> =
  | NotesRung
  | DupReason["kind"]
  | (Reason extends { kind: infer K extends string } ? K : never);

/** One leg of a firing: one step the player is shown. A `step` leg is a move the
 * canonical shapes have no room for (Salad's markers), built by the game and
 * applied to the working board by its own `apply`. A `place` leg's `reads` is
 * premise the walk knows and the game's words do not ({@link StepWords}'s). */
export type Leg<M, H, Reason> =
  | { place: Mark; reason: Reason; reads?: readonly Point[] }
  | { strike: readonly Mark[]; reason: Reason }
  | { step: HintStep<M, H, PlanRung<Reason>>; apply(): void };

/** One firing: its legs in order, read and played as one journey. */
export type Firing<M, H, Reason> = readonly Leg<M, H, Reason>[];

/** What a rung is told each time it is asked. `F` is the plan's firing. */
export interface RungContext<F = unknown> {
  /** Every earlier rung came up empty this time: where a technique the solver
   * reaches only once those before it are spent may fire
   * ({@link techniqueRung}). */
  nothingEarlier: boolean;
  /** Whether the notes have been set up: penciled in and cleaned under the
   * `populate` reading, cleaned under the `implicit` one. */
  populated: boolean;
  /** Every blank cell's candidates as the player reads them: its notes, and
   * under the implicit reading (or before a populate) what its regions leave a
   * cell with none (`impliedNotes`). */
  shown: ArrayLike<number>;
  /** Every blank cell's notes as written on the walk's board: 0 where none
   * are, whatever `shown` reads there. */
  written: ArrayLike<number>;
  /** Whether a firing continues the plan's latest steps, as the frontier
   * judges it: what a rung that waits its turn may still offer early. */
  continues: (f: F) => boolean;
}

/** One rung of a plan's ladder: the firings of one kind it could take now. */
export type CandidateRung<M, H, Reason> = (
  ctx: RungContext<Firing<M, H, Reason>>,
) => readonly Firing<M, H, Reason>[];

/** A game's ladder, as a plan that deduces from the notes runs its
 * techniques: on fresh marks over the working grid, each blank cell's
 * candidates the notes the walk shows, read through `enc`. */
export interface NotesLadder<S extends CellMarks = CellMarks> {
  ladder: Ladder<S>;
  /** Marks over the walk's working grid; their candidates are set here. */
  marks: () => S;
  enc: NoteEncoding & { values: number };
  /** The board's caps: a technique the solver would not run at them offers
   * nothing, so a board's hint teaches no technique past its tier (Keen's
   * `cageEasy` runs only at Easy), however well it would continue the work in
   * hand ({@link techniqueRung}). */
  caps: Caps;
}

/**
 * A rung offering every firing technique `id` of the game's ladder makes on
 * the notes the walk shows, each as the legs `legs` makes of it (none where
 * it returns `null`). The mistake check vouches for the notes
 * (docs/hints-candidates.md § "Deduce from the notes when the mistake check
 * vouches for them"), so a step is the solver's technique by construction.
 *
 * It reads the notes, so it waits for the setup (`populated`). Any technique
 * but the ladder's first waits for every earlier rung to come up empty, as
 * the solver reaches it only once those before it are spent: by tier alone,
 * Abcd's `runs`, as easy as its single, would crowd the singles out.
 *
 * While it waits it still offers a firing that continues the plan's latest
 * steps (`continues`), beside the singles, whatever its tier: the frontier
 * still takes a continuing single first, so all it gives up is a single
 * elsewhere. Waiting outright, a plan leaves the work in hand for a single
 * elsewhere and comes back: a seventh of Adjacent's jumps passed over a bar
 * step that continued, and an eighth of Towers' over a clue's strike, at
 * its singles' tier.
 * A technique past the board's `caps` offers nothing.
 *
 * A technique that `leads` places, and is the game's signature step, so it
 * waits for neither: it is offered from the note-free opening on, beside the
 * singles, wherever the board supports it (docs/hints-candidates.md
 * § "Placements lead when the deductions are placements"; Group's
 * associativity and identity).
 */
export function techniqueRung<M, H, Reason, S extends CellMarks = CellMarks>(
  on: NotesLadder<S>,
  id: string,
  legs: (
    f: LadderFiring,
    shown: ArrayLike<number>,
    written: ArrayLike<number>,
  ) => Firing<M, H, Reason> | null,
  { leads = false }: { leads?: boolean } = {},
): CandidateRung<M, H, Reason> {
  const entries = on.ladder.entries;
  const at = entries.findIndex((e) => e.id === id);
  if (at < 0) throw new Error(`no technique ${id} in the ladder`);
  if (!admits(entries[at], on.caps)) return () => [];
  const last = at > 0 && !leads;
  const bit = on.enc.bit ?? ((n: number): number => 1 << n);
  return ({ populated, nothingEarlier, shown, written, continues }) => {
    if (!populated && !leads) return [];
    const waits = last && !nothingEarlier;
    const m = on.marks();
    for (let i = 0; i < m.cands.length; i++) {
      let cands = 0;
      // A note the cell's full set lacks (Rome's arrow off the board) is no
      // candidate: the player may write it, and no technique may read it.
      const notes = shown[i] & (on.enc.all?.(i) ?? ~0);
      if (m.grid[i]) cands = 1 << m.grid[i];
      else for (let n = 1; n <= on.enc.values; n++) if (notes & bit(n)) cands |= 1 << n;
      m.cands[i] = cands;
    }
    const out: Firing<M, H, Reason>[] = [];
    for (const f of techniqueFirings(on.ladder, id, m)) {
      const legged = legs(f, shown, written);
      if (legged && (!waits || continues(legged))) out.push(legged);
    }
    return out;
  };
}

/** A firing's facts as the marks it strikes, on a board `w` cells wide, for a
 * technique that only strikes. */
export function strikesOf(f: LadderFiring, w: number): Mark[] {
  const out: Mark[] = [];
  for (let k = 0; k < f.facts.length; k += 3) {
    if (f.facts[k] !== STRIKE) throw new Error("a firing that does more than strike");
    const c = f.facts[k + 1];
    out.push({ x: c % w, y: (c / w) | 0, n: f.facts[k + 2] });
  }
  return out;
}

/** What a step says. The walk adds the move, the `targets` (the cells the move
 * acts on) and the `marks`, so none of those can disagree with the move, and it
 * reads the `area` and `hatch` off the words: the cells they outline, and the
 * line or region they stripe (`hint-words.ts`). A step cannot draw evidence its
 * sentence does not name.
 *
 * `reads` names the cells whose candidates the step rests on beyond the ones it
 * outlines: a cage deduction stripes its cage, since the sentence names the
 * cage, yet what it concludes depends on what every cell of it can still be.
 * The walk treats them as premise: the frontier continues from them, and under
 * the implicit reading their notes go on the board first. They ride on the
 * step's highlights (`CandidateHighlights.reads`) as data; nothing draws them. */
export type StepWords<H> = Omit<H, "targets" | "marks" | "area" | "hatch"> & {
  words: Sentence;
  reads?: readonly Point[];
};

/** What a strike says and shades: its {@link Premise}, which the walk finishes
 * with the move the step makes (the plan's `conclude`), so a strike's ending is
 * never the game's to write. */
export type StrikeWords<H> = Omit<StepWords<H>, "words"> & Premise;

/** A candidate-elimination game's plan, as {@link runCandidatePlan} walks it.
 * The hooks are properties rather than methods so a game's handler is checked
 * against them strictly: a reason union without {@link DupReason} fails to
 * type-check rather than narrating a strike it cannot name. */
export interface CandidatePlan<
  M,
  H extends CandidateHighlights,
  Reason,
  Reg extends CellRegion,
> {
  /** The board's row stride; its height is read off `grid`. */
  w: number;
  /** The steps the plan pushes to. */
  steps: HintStep<M, H, PlanRung<Reason>>[];
  /** The working board, advanced as the plan is built: 0 = empty. */
  grid: Uint8Array | Int8Array;
  /** The working notes, in `enc`'s encoding. */
  pencil: Int32Array;
  enc?: NoteEncoding;
  /** The game's move dialect, when it is not the Latin family's. */
  moves?: CandidateMoveAdapter<M>;
  /** The auto-pencil preference: a placement's cull is silent rather than taught. */
  autoClean: boolean;
  /** Where the walk judges a move rather than writes a hint
   * (`candidate-hint.ts`'s `CandidatePlanPrefs`). */
  judging?: PlanJudging;
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
  /** Whether the working board is finished. Default: no cell is empty. A game
   * whose finished board leaves cells empty says so here (Salad's holes). */
  finished?: () => boolean;
  /** A cell's regions, in narration preference order. A hidden single is
   * read in the ones that hold every value, and unless {@link reach} says otherwise, a
   * placed value rules itself out of all of them. */
  regionsOf: (x: number, y: number) => readonly Reg[];
  /** The cells a value rules itself out of, where that depends on the value (a
   * Seismic 3 reaches three cells along its row and column). The placement cull,
   * the obvious clean and a note-less cell's implied candidates all read it.
   * Default: every cell of the placed cell's `regionsOf`. */
  reach?: Reach;
  /** The reason a single the board shows narrates as. */
  singleReason: (n: number, why: SingleWhy<WholeRegion<Reg>>) => Reason;
  /** A placement's words; `continues` is true on a journey's later legs. The
   * step's rung is the reason's kind, unless the words narrate another of the
   * game's reasons than the one handed in, and then they say which: `rung`. */
  placeWords: (
    m: Mark,
    reason: Reason,
    continues: boolean,
  ) => StepWords<H> & { rung?: PlanRung<Reason> };
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
  /** The words of the setup: pencil everything in, then clear the obvious;
   * and of a note leg under the implicit reading, which writes `values` into
   * the note-less `cell` (`every` when its regions rule nothing out yet). */
  notes: {
    populate: string;
    /** Words over the notes the clean strikes, which it rings. */
    cleanObvious: (marks: readonly Mark[]) => Sentence;
    note: (cell: Point, values: number[], every: boolean) => Sentence;
  };
  /** The game's rungs, tried after the singles, in the note-free opening too. */
  rungs?: readonly CandidateRung<M, H, Reason>[];
  /** Whether a single the notes show, naked or hidden, is one the plan places:
   * the empty square of a board whose lines hold it more than once is the
   * game's own techniques' to place. Default: all of them. */
  placeable?: (m: Mark) => boolean;
}

/**
 * Walk a candidate plan: from the working board, take the note-free firings
 * while the notes are being set up, then every rung, until the board is
 * finished or nothing fires. The ladder is the singles, then the game's
 * rungs; which firing is taken is the `HintFrontier`'s choice, so a plan continues from its latest
 * steps where it can and otherwise follows the ladder.
 */
export function runCandidatePlan<
  M,
  H extends CandidateHighlights,
  Reason,
  Reg extends CellRegion,
>(plan: CandidatePlan<M, H, Reason, Reg>): void {
  new CandidateWalk(plan).run();
}
