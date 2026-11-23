/**
 * What Check & save says of the last move in a pencil-notes game: the judge
 * (`move-judge.ts`) driven by the game's candidate plan (`candidate-plan.ts`),
 * walked from the position before the move under the player's preferences,
 * as its hint would be, and aimed at the move's facts.
 *
 * A move's facts are read off the board as the player reads it: a blank
 * cell's notes, or where it has none what its regions leave it. So notes
 * written into a cell with none strike what they leave out, as the plan's
 * own note step concludes, and penciling everything in makes no fact. The
 * plan hands the judge its trace, so a chain's start is named where the
 * replay confirms it.
 */

import type { HintStep, MoveVerdict } from "../contract/game.ts";
import type { CellMarks } from "../solve/cell-marks.ts";
import {
  type CandidatePlanPrefs,
  type CandidatePrefsUi,
  NOTES_RUNGS,
  type NotesRung,
  planPrefs,
} from "./candidate-hint.ts";
import { judgeByWalk, movedFacts, verdictOf } from "./move-judge.ts";

/** What a player calls each of a plan's deductions, by rung: the game's
 * compiled `NAMES`, which must name every rung but the setup's. */
export type RungNames<Rung extends string> = Readonly<
  Record<Exclude<Rung, NotesRung>, string>
>;

const SETUP: ReadonlySet<string> = new Set(NOTES_RUNGS);

/** `Game.hint.judgeMove` for a game whose hint is `candidateHint` over
 * `buildSteps`, which hands its plan the `judging` it is given, its
 * deductions named by `names`. */
export function candidateJudge<State, Move, H, Rung extends string>(
  before: State,
  after: State,
  ui: CandidatePrefsUi | null,
  buildSteps: (state: State, prefs: CandidatePlanPrefs) => HintStep<Move, H, Rung>[],
  names: RungNames<Rung>,
): MoveVerdict | null {
  const prefs = planPrefs(ui);
  const byRung = names as Readonly<Record<string, string>>;
  // The clean step strikes, across the board at once, what a placed value
  // rules out: `dup`'s deduction, so a strike it makes is called by `dup`'s
  // name, where a fresh walk from the player's notes takes it first.
  const name = (rung: string): string | null => {
    const as = rung === "clean" ? "dup" : rung;
    return SETUP.has(as) || !Object.hasOwn(byRung, as) ? null : byRung[as];
  };
  const shown = (state: State): CellMarks => {
    let read: CellMarks | null = null;
    buildSteps(state, {
      ...prefs,
      judging: {
        begin: (m) => {
          read = m;
          return null;
        },
        name,
      },
    });
    if (read === null) throw new Error("a candidate plan that takes no judging");
    return read;
  };
  const moved = movedFacts(shown(before), shown(before), shown(after));
  if (moved.length === 0) return null;
  const judged = judgeByWalk(moved, (judging) => {
    buildSteps(before, { ...prefs, judging: { begin: () => judging, name } });
  });
  return judged === null ? null : verdictOf(judged);
}
