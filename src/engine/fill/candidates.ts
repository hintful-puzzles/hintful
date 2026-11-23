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
import {
  type CandidateHighlights,
  type CandidateMoveAdapter,
  type CandidatePlanPrefs,
  type CandidatePrefsUi,
  candidateHint,
  keepCandidateHintTrack,
  refreshCandidateHintStep,
} from "../hint/candidate-hint.ts";
import { candidateJudge, type RungNames } from "../hint/candidate-judge.ts";
import {
  LATIN_RUNGS,
  type NotesLadder,
  type PlanRung,
  runLatinCandidatePlan,
} from "../hint/candidate-plan.ts";
import {
  type LatinVocab,
  latinPremise,
  narrateLatinReason,
} from "../hint/hint-text.ts";
import type { GenericLatinReason } from "../hint/latin-hint.ts";
import { byCell, latinStrikeRungs } from "../hint/latin-notes.ts";
import { CellMarks } from "../solve/cell-marks.ts";
import { TIERS } from "../solve/ladder-runtime.ts";
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
  // A technique of the description's own is no rung of the walk's, which
  // would then stall where the board needs it.
  const own = module.ladder.find((e) => !e.id.startsWith("latin."));
  if (own !== undefined)
    throw new Error(`the candidate walk runs the Latin library alone, not ${own.id}`);
  const vocab: LatinVocab = {
    noun: "number",
    value: numeral,
    cell: module.WORDS?.cell ?? "square",
  };

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
    const steps: HintStep<FillMove, CandidateFillHint, PlanRung<GenericLatinReason>>[] =
      [];
    runLatinCandidatePlan<FillMove, CandidateFillHint, GenericLatinReason>({
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
      placeWords: (m, reason) => ({ words: narrateLatinReason(reason, m, w, vocab) }),
      strikeWords: (marks, reason) => latinPremise(reason, marks, vocab),
      rungs: latinStrikeRungs<
        FillMove,
        CandidateFillHint,
        GenericLatinReason,
        CellMarks
      >(on, w, byCell),
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
    rungs: CANDIDATE_FILL_RUNGS,
  };
}
