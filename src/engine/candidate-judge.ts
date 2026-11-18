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
 * plan keeps no fact graph, so a move a chain reached rings its square
 * rather than quoting where the chain began.
 */
import {
  type CandidateHighlights,
  type CandidatePlanPrefs,
  type CandidatePrefsUi,
  planPrefs,
} from "./candidate-hint.ts";
import { evidenceOf } from "./candidate-plan.ts";
import type { HintStep, MoveVerdict } from "./game.ts";
import type { Sentence } from "./hint-words.ts";
import type { CellMarks } from "./ladder-runtime.ts";
import {
  followedWords,
  judgeByWalk,
  movedFacts,
  unforcedWords,
  unquotedWords,
} from "./move-judge.ts";
import type { Point } from "./types.ts";

/** `Game.judgeMove` for a game whose hint is `candidateHint` over
 * `buildSteps`, which hands its plan the `judging` it is given. */
export function candidateJudge<State, Move, H extends CandidateHighlights>(
  before: State,
  after: State,
  ui: CandidatePrefsUi | null,
  buildSteps: (state: State, prefs: CandidatePlanPrefs) => HintStep<Move, H, string>[],
): MoveVerdict<H> | null {
  const prefs = planPrefs(ui);
  // What the game calls a cell, which a verdict that rings one names it by.
  let noun = "cell";
  const shown = (state: State): CellMarks => {
    let read: CellMarks | null = null;
    buildSteps(state, {
      ...prefs,
      judging: {
        begin: (m, cell) => {
          read = m;
          noun = cell;
          return null;
        },
      },
    });
    if (read === null) throw new Error("a candidate plan that takes no judging");
    return read;
  };
  const was = shown(before);
  const moved = movedFacts(was, shown(before), shown(after));
  if (moved.length === 0) return null;
  let steps: HintStep<Move, H, string>[] = [];
  let firstStep: readonly number[] = [];
  const judged = judgeByWalk(moved, (judging) => {
    steps = buildSteps(before, { ...prefs, judging: { begin: () => judging } });
    firstStep = judging.firstStep;
  });
  if (judged === null) return null;
  const w = was.sp.w;
  const pointOf = (c: number): Point => ({ x: c % w, y: Math.floor(c / w) });
  const ringed = (at: Point, words: Sentence, followed: boolean): MoveVerdict<H> => ({
    followed,
    words,
    highlights: { ...evidenceOf(words), targets: [at], marks: [] } as unknown as H,
  });
  if (judged.kind === "unforced") {
    const at = pointOf(moved[judged.fact].at);
    return ringed(at, unforcedWords(at, noun), false);
  }
  if (judged.firing === null) {
    const at = pointOf(moved[0].at);
    return ringed(at, unquotedWords(at, noun, judged.chained), true);
  }
  // The firing's step that acts on a cell the move did, past the notes it
  // writes down first to read them.
  const own = steps
    .slice(firstStep[judged.firing], firstStep[judged.firing + 1] ?? steps.length)
    .filter((s) => s.rung !== "note");
  const cells = new Set(moved.map((f) => f.at));
  const quoted =
    own.find((s) => s.highlights?.targets.some((p) => cells.has(p.y * w + p.x))) ??
    own[0] ??
    null;
  if (quoted?.words === undefined) return null;
  return {
    followed: true,
    words: followedWords(quoted.words, judged.chained),
    ...(quoted.highlights === undefined ? {} : { highlights: quoted.highlights }),
  };
}
