/**
 * Cube's hint: a line of rolls that gathers every painted square, shown one
 * roll at a time.
 *
 * No roll is forced, so the hint narrates what each roll does and what it is
 * for (docs/hints-search.md § "Narrate a measurement or a proof"). The line
 * comes from `planRolls`, whose potential every hinted roll lowers, so a hint
 * asked again after any roll cannot lead the solid round in circles.
 *
 * The line falls into legs, each ending with the roll that picks a square up.
 * That square is the leg's goal, outlined on every roll that works toward it
 * (§ "Hold a stable subgoal"), and the legs are journeys, so the step counter
 * says how far through one a roll is.
 *
 * What beginners get wrong is that the face which lands on a square is the
 * one that swaps paint with it, so a solid rolled straight onto a painted
 * square can arrive painted side down and pick nothing up, and one rolled
 * across plain squares puts its paint down. The sentences say both where the
 * line meets them, each checked on the board the roll is made from (`narrate`).
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { searchRefusal } from "../../engine/search-outcome.ts";
import { say } from "./hint-text.ts";
import { DIR_CHARS, executeMove, findMoveDest } from "./roll.ts";
import { lowestFace, SOLIDS } from "./solids.ts";
import { canCollectWithoutDropping, planRolls, type Roll } from "./solver.ts";
import type { CubeMove, CubeState } from "./state.ts";

/** What a step rests on, by the branch of {@link narrate} that chose its words. */
export const CUBE_RUNGS = [
  "collect",
  "travel",
  "come-round",
  "forced-drop",
  "drop",
] as const;
export type CubeRung = (typeof CUBE_RUNGS)[number];

type Step = HintStep<CubeMove, unknown, CubeRung>;

const ROLLS: readonly Roll[] = [0, 1, 2, 3];

/** The squares still painted. */
const paintedCount = (s: CubeState): number => s.blue.reduce((n, b) => n + b, 0);

/** Whether some roll from `s` lands on `goal`, and every such roll lands a
 * painted face on it, which picks nothing up. */
function landsPainted(s: CubeState, goal: number): boolean {
  let lands = false;
  for (const r of ROLLS) {
    if (findMoveDest(s, r)?.dest !== goal) continue;
    if (!executeMove(s, { dir: DIR_CHARS[r] }).blue[goal]) return false;
    lands = true;
  }
  return lands;
}

/**
 * One roll, narrated against the square its leg picks up. Every branch states
 * only what it has checked:
 *
 * - **collect**: the square the roll lands on was painted and is plain after;
 * - **come-round**: a roll from here reaches the goal, and every one that
 *   does lands a painted face on it (`landsPainted`);
 * - **forced-drop**: the roll puts paint down, and no square can be picked
 *   up from here without doing so (`canCollectWithoutDropping`, exhaustive);
 * - **drop**: the roll puts paint down where the line need not have, and
 *   `then` says whether the line picks that square up again, and with
 *   which face;
 * - **travel**: the roll changes no paint, and serves the goal.
 */
function narrate(
  before: CubeState,
  after: CubeState,
  goal: number,
  then: "another" | "later" | null,
): { rung: CubeRung; words: Sentence } {
  const dest = after.current;
  // A leg that puts paint on the square it then picks up works toward a
  // square still plain, which no outline can call the painted one; and a roll
  // onto the goal itself would ring and outline one square.
  const aim = before.blue[goal] && dest !== goal ? goal : null;
  if (before.blue[dest] && !after.blue[dest]) {
    return { rung: "collect", words: say.collect(dest, paintedCount(after)) };
  }
  if (!before.blue[dest] && after.blue[dest]) {
    return canCollectWithoutDropping(before)
      ? { rung: "drop", words: say.drop(dest, aim, then) }
      : { rung: "forced-drop", words: say.forcedDrop(dest, aim) };
  }
  if (aim !== null && landsPainted(before, aim)) {
    return { rung: "come-round", words: say.comeRound(dest, aim) };
  }
  return { rung: "travel", words: say.travel(dest, aim) };
}

export function hint(state: CubeState): HintResult<CubeMove, unknown, CubeRung> {
  const planned = planRolls(state);
  if (planned.kind !== "found") return searchRefusal(planned);

  // The board each roll is made from, and the one it leaves; and beside them
  // the solid with its faces numbered, which tells one face from another (a
  // numbered face is never plain, so it swaps no paint).
  const boards = [state];
  const faces: CubeState[] = [
    { ...state, faceColors: state.faceColors.map((_, i) => i + 1) },
  ];
  for (const r of planned.line) {
    const move = { dir: DIR_CHARS[r] };
    boards.push(executeMove(boards[boards.length - 1], move));
    faces.push(executeMove(faces[faces.length - 1], move));
  }
  const bottom = lowestFace(SOLIDS[state.solidIndex]);
  const faceDown = (i: number): number => faces[i].faceColors[bottom];
  const collects = (i: number): boolean =>
    boards[i].blue[boards[i + 1].current] === 1 &&
    boards[i + 1].blue[boards[i + 1].current] === 0;
  /** What the line does with paint roll `i` puts down: picks it up with
   * another face, or the same one, or not at all. */
  const thenOf = (i: number): "another" | "later" | null => {
    const dest = boards[i + 1].current;
    for (let j = i + 1; j < planned.line.length; j++) {
      if (boards[j + 1].current !== dest) continue;
      if (collects(j)) return faceDown(j + 1) === faceDown(i + 1) ? "later" : "another";
    }
    return null;
  };

  const steps: Step[] = [];
  let legStart = 0;
  for (let i = 0; i < planned.line.length; i++) {
    // The leg's goal is the square its last roll picks up, carried across
    // every roll of the leg rather than re-derived from where the solid is.
    let end = i;
    while (end < planned.line.length - 1 && !collects(end)) end++;
    const goal = boards[end + 1].current;
    const { rung, words } = narrate(boards[i], boards[i + 1], goal, thenOf(i));
    steps.push({
      move: { dir: DIR_CHARS[planned.line[i]] },
      rung,
      explanation: words.text,
      words,
      continuesPrevious: i > legStart,
    });
    if (collects(i)) legStart = i + 1;
  }
  return { ok: true, steps };
}

/** A roll is settled by its direction alone, so a roll the step's way lands
 * exactly the board the plan expects; any other drops the plan. */
export function hintKeepTrack(
  m: CubeMove,
  step: HintStep<CubeMove>,
  _state: CubeState,
): HintTrackVerdict {
  return m.dir === step.move.dir ? "completed" : "off";
}
