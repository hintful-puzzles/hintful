/**
 * The hint of a board of numbers that keeps notes (`play.notes`): the shared
 * candidate walk (`engine/hint/candidate-plan.ts`), built from the compiled
 * module, so a born game writes none of what a hand-written one's
 * `buildSteps` does (`docs/hints-candidates.md` § "What every game does").
 * The walk reads the player's notes where the mistake check vouches for them,
 * its rungs are the ladder's techniques run on those notes, and its steps
 * set and strike notes as the player does.
 *
 * Its regions are the space's rows and columns, each holding every value
 * once, as on every Latin board; the library's strikes are worded by the
 * library (`hint-text.ts`'s Latin words), a firing a leg a cell.
 */

import type { Game, HintStep } from "../contract/game.ts";
import { CELL, type Narration } from "../contract/hint-words.ts";
import type { Point } from "../contract/types.ts";
import {
  type CandidateHighlights,
  type CandidateMoveAdapter,
  type CandidatePlanPrefs,
  type CandidatePrefsUi,
  candidateHint,
  keepCandidateHintTrack,
  refreshCandidateHintStep,
  valuesOf,
} from "../hint/candidate-hint.ts";
import { candidateJudge, type RungNames } from "../hint/candidate-judge.ts";
import {
  type Firing,
  LATIN_RUNGS,
  type NotesLadder,
  type PlanRung,
  runLatinCandidatePlan,
  strikesOf,
  techniqueRung,
} from "../hint/candidate-plan.ts";
import {
  type LatinVocab,
  latinPremise,
  narrateLatinReason,
} from "../hint/hint-text.ts";
import type { GenericLatinReason } from "../hint/latin-hint.ts";
import { byCell, latinStrikeRungs } from "../hint/latin-notes.ts";
import { type Clauses, statedParts } from "../hint/stated.ts";
import { CellMarks } from "../solve/cell-marks.ts";
import {
  type Firing as LadderFiring,
  type Said,
  TIERS,
} from "../solve/ladder-runtime.ts";
import { type FillBoard, type LadderedFillModule, ladderOf, spaceOf } from "./board.ts";
import { type FillMove, isCandidateMove, reachOf } from "./notes.ts";
import { numeral } from "./numbers.ts";

/** What a step of the candidate walk marks: the shared highlights. */
export type CandidateFillHint = CandidateHighlights;

/** Every rung a step of the walk can be: the Latin family's. */
const CANDIDATE_FILL_RUNGS: readonly string[] = LATIN_RUNGS;

/** A fill board's moves as the walk reads and makes them: its note-taking
 * cell's are the canonical shapes, and an edit (Solve, Clear, Reveal) is
 * none of them. */
const FILL_CANDIDATE_MOVES: CandidateMoveAdapter<FillMove> = {
  read: (m) => (isCandidateMove(m) ? m : null),
  strike: (marks) => ({ type: "pencilStrike", marks }),
};

/** What the walk reads of a compiled module beside its ladder. */
export interface CandidateFillModule<C> extends LadderedFillModule<C> {
  /** What a player calls each rung, which Check & save names a move by. */
  readonly NAMES?: Readonly<Record<string, string>>;
  readonly WORDS?: { readonly cell?: string };
  /** The words each of the description's own techniques states. */
  readonly STATED?: Readonly<
    Record<
      string,
      { readonly step?: readonly Clauses[]; readonly fact?: readonly Clauses[] }
    >
  >;
}

/** Why a technique of the description's own struck: its id, and the look
 * of what it states. */
interface OwnReason {
  readonly kind: string;
  readonly premise: Narration;
}

/** Why a step of the walk is forced: the library's reasons, or the
 * description's own. */
type Reason = GenericLatinReason | OwnReason;

/** What a firing of a technique that states its words says: its terms and
 * marks, which wording held where it has several, and what each fact has of
 * its own where it words each. */
interface StatedSays {
  readonly terms: Readonly<Record<string, unknown>>;
  readonly marks?: Readonly<Record<string, readonly number[]>>;
  readonly wording?: number;
  readonly facts?: readonly {
    readonly wording: number;
    readonly terms: Readonly<Record<string, unknown>>;
  }[];
}

/** The candidate walk's hint hooks, which `fillGame` takes for a board that
 * keeps notes. */
export type CandidateFillHooks<C, Ui> = Pick<
  NonNullable<
    Game<
      unknown,
      FillBoard<C>,
      FillMove,
      Ui,
      unknown,
      unknown,
      CandidateFillHint
    >["hint"]
  >,
  "plan" | "judgeMove" | "keepTrack" | "refreshStep" | "rungs"
>;

/**
 * The candidate walk of `module`'s boards. `tierOf` is a board's tier, past
 * which the hint teaches nothing, as the ladder that graded it ran nothing
 * past it; `uiOf` is the `Ui` a fresh game starts with, whose reading a hint
 * asked for with none is walked under.
 */
export function candidateFill<C, Ui extends CandidatePrefsUi>(
  module: CandidateFillModule<C>,
  tierOf: (board: FillBoard<C>) => number,
  uiOf: (board: FillBoard<C>) => Ui,
): CandidateFillHooks<C, Ui> {
  if (module.units.join() !== "rows,cols")
    throw new Error(
      `a board's notes are walked on rows and columns, not ${module.units.join(", ")}`,
    );
  // The description's own techniques, beside the library's: each strikes,
  // worded by what it states (`ownLegs`).
  const own = module.ladder.filter((e) => !e.id.startsWith("latin.")).map((e) => e.id);
  const ownSet = new Set(own);
  const isOwn = (r: Reason): r is OwnReason => ownSet.has(r.kind);
  const vocab: LatinVocab = {
    noun: "number",
    value: numeral,
    cell: module.WORDS?.cell ?? "square",
  };

  /**
   * A firing of the description's own technique `id` as legs, a cell each,
   * as the walk strikes notes a cell at a time: each worded by the look of
   * what the technique states, of the fact its first note is where it words
   * each fact, else of its step. The walk says what the leg strikes; a look
   * may name the leg's cell (`{ring}`) and the values it strikes
   * (`{struck}`).
   */
  function ownLegs(
    id: string,
    f: LadderFiring,
    w: number,
  ): Firing<FillMove, CandidateFillHint, Reason> {
    const { says } = f.reasons[0] as Said<unknown, StatedSays>;
    const stated = module.STATED?.[id];
    const at = (c: number): Point => ({ x: c % w, y: Math.floor(c / w) });
    const marks = Object.fromEntries(
      Object.entries(says.marks ?? {}).map(([role, els]) => [role, els.map(at)]),
    );
    const strikes = strikesOf(f, w);
    return byCell(strikes).map((strike) => {
      const fact = says.facts?.[strikes.indexOf(strike[0])];
      const clauses =
        fact === undefined
          ? stated?.step?.[says.wording ?? 0]
          : stated?.fact?.[fact.wording];
      const look =
        clauses === undefined
          ? undefined
          : statedParts(clauses, {
              kind: CELL,
              at,
              ring: [{ x: strike[0].x, y: strike[0].y }],
              marks,
              terms: { ...says.terms, ...fact?.terms },
              value: numeral,
              noun: vocab.cell,
              struck: valuesOf(strike),
            }).look;
      if (look === undefined) throw new Error(`${id} states no look to strike by`);
      return { strike, reason: { kind: id, premise: look } };
    });
  }

  function buildSteps(
    board: FillBoard<C>,
    { autoClean, reading, judging }: CandidatePlanPrefs,
  ): HintStep<FillMove, CandidateFillHint, string>[] {
    const sp = spaceOf(module, board);
    const w = board.w;
    const grid = Uint8Array.from(board.values);
    // A placed cell's notes are nothing the walk reads.
    const pencil = Int32Array.from(board.pencil ?? grid, (p, c) => (grid[c] ? 0 : p));
    let domain = 0;
    for (const c of sp.cells) domain |= module.domainOf(sp, board.dealt, c);
    const ladder = ladderOf(module, board);
    const on: NotesLadder = {
      ladder,
      caps: { [TIERS]: tierOf(board) },
      marks: () => {
        const m = new CellMarks(sp, domain, grid.slice());
        m.placing = ladder.placing;
        m.striking = ladder.striking;
        return m;
      },
      enc: { values: 31 - Math.clz32(domain) },
    };
    const steps: HintStep<FillMove, CandidateFillHint, PlanRung<Reason>>[] = [];
    runLatinCandidatePlan<FillMove, CandidateFillHint, Reason>({
      w,
      steps,
      grid,
      pencil,
      moves: FILL_CANDIDATE_MOVES,
      reach: reachOf(module, board),
      autoClean,
      reading,
      ...(judging === undefined ? {} : { judging }),
      label: "fill candidate plan",
      placeWords: (m, reason) => {
        if (isOwn(reason))
          throw new Error(`${reason.kind} strikes, and places nothing`);
        return { words: narrateLatinReason(reason, m, w, vocab) };
      },
      strikeWords: (marks, reason) =>
        isOwn(reason)
          ? { premise: reason.premise }
          : latinPremise(reason, marks, vocab),
      // The description's own strikes first: it states them for its clues,
      // which a player reads before a set or a wing.
      rungs: [
        ...own.map((id) =>
          techniqueRung<FillMove, CandidateFillHint, Reason>(on, id, (f) =>
            ownLegs(id, f, w),
          ),
        ),
        ...latinStrikeRungs<FillMove, CandidateFillHint, Reason, CellMarks>(
          on,
          w,
          byCell,
        ),
      ],
      notes: {
        noun: vocab.noun,
        placedVerb: "standing",
        value: numeral,
        cell: vocab.cell,
      },
    });
    return steps;
  }

  const names = (module.NAMES ?? {}) as RungNames<string>;
  return {
    plan: (board, _aux, ui) => candidateHint(board, ui ?? uiOf(board), buildSteps),
    judgeMove: (before, after, ui) =>
      candidateJudge(before, after, ui ?? uiOf(before), buildSteps, names),
    keepTrack: (m, step, board) =>
      keepCandidateHintTrack(
        m,
        step,
        board.pencil ?? [],
        board.w,
        FILL_CANDIDATE_MOVES,
      ),
    refreshStep: (step, board) =>
      refreshCandidateHintStep(
        step,
        board.values,
        board.pencil ?? [],
        board.w,
        FILL_CANDIDATE_MOVES,
      ),
    rungs: [...CANDIDATE_FILL_RUNGS, ...own],
  };
}
