/**
 * Star Battle's explained hint: the solver's rungs run one firing at a time
 * from the player's own marks, and each firing turned into a step
 * (docs/hints.md § "Recording the deduction").
 *
 * Every fact a step rests on is a region's border or a mark the player has
 * made: the ladder reads nothing else. A square is open to it until it holds
 * a star or a cross, so the crosses round a star and in a finished row are
 * steps of their own, and the steps after them can be checked against the
 * board.
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { changedCells, trackTargets } from "../../engine/hint-track.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Point } from "../../engine/types.ts";
import { type Confined, say, type UnitSet, type UnitSquares } from "./hint-text.ts";
import {
  type Confinement,
  isComplete,
  StarbattleBoard,
  type StarbattleFiring,
  type StarbattleRung,
  starbattleRecordingPass,
} from "./solver.ts";
import {
  BLANK,
  executeMove,
  type StarbattleMark,
  type StarbattleMove,
  type StarbattleState,
} from "./state.ts";

/** How far ahead the plan is computed. A player rarely follows more than a
 * few steps before going their own way, and the plan is asked for again
 * then. */
const PLAN_CAP = 24;

type StarbattleStep = HintStep<StarbattleMove, unknown, StarbattleRung>;

/** What a firing says, with its squares ringed. `board` holds the marks the
 * firing was made on. */
function wordsOf(board: StarbattleBoard, firing: StarbattleFiring): Sentence {
  const { size, stars } = board;
  const at = (i: number): Point => ({ x: i % size, y: (i / size) | 0 });
  const cells = firing.cells.map(at);
  const squares = (unit: number): UnitSquares => ({
    kind: board.units[unit].kind,
    cells: board.units[unit].cells.map(at),
  });
  const set = (units: readonly number[]): UnitSet => ({
    count: units.length,
    cells: units.flatMap((unit) => board.units[unit].cells.map(at)),
  });
  const confined = (c: Confinement): Confined => ({
    line: board.units[c.lines[0]].kind === "row" ? "row" : "column",
    lines: set(c.lines),
    regions: set(c.regions),
    need: c.need,
    linesPlaced: c.lines.length * stars - c.need,
    regionsPlaced: c.regions.length * stars - c.need,
    rest: c.rest,
  });

  const { reason } = firing;
  switch (reason.kind) {
    case "around":
      return say.around(at(reason.star), cells);
    case "full":
      return say.full(squares(reason.unit), stars, cells);
    case "exact":
      return say.exact(squares(reason.unit), reason.need, stars - reason.need, cells);
    case "needed":
      return say.needed(
        squares(reason.unit),
        reason.need,
        stars - reason.need,
        reason.room,
        cells[0],
      );
    case "crowded":
    case "starved": {
      const own = board.unitsAt(firing.cells[0]).includes(reason.unit);
      return say.trial({
        cell: cells[0],
        unit: squares(reason.unit),
        own,
        need: reason.need,
        room: reason.room,
        ruled: reason.ruled.map(at),
        all: reason.left === 0,
        touches: reason.kind === "crowded",
        completes: reason.completes.map((unit) => board.units[unit].kind),
      });
    }
    case "confined":
    case "banded":
      return say.confined(confined(reason), cells);
  }
}

function stepOf(board: StarbattleBoard, firing: StarbattleFiring): StarbattleStep {
  const words = wordsOf(board, firing);
  return {
    move: {
      kind: "mark",
      cells: firing.cells.map((index) => ({ index, mark: firing.mark })),
    },
    rung: firing.reason.kind,
    explanation: words.text,
    words,
  };
}

/**
 * The plan from the player's marks. No tier cap: a board that arrives by its
 * ID carries no tier, and the ladder tries its easier rungs first, which is
 * the order a hint wants anyway.
 */
export function starbattleHint(
  state: StarbattleState,
): HintResult<StarbattleMove, unknown, StarbattleRung> {
  const { size, stars, regions } = state;
  const board = new StarbattleBoard(size, stars, regions, state.grid.slice());
  const pass = starbattleRecordingPass(board, stepBudget("starbattle hint"));
  const { plan } = deduceHintPlan<StarbattleBoard, StarbattleFiring, "open" | "done">({
    board,
    status: (b) => (isComplete(b) ? "done" : "open"),
    incomplete: "open",
    next: () => pass.next(),
    planCap: PLAN_CAP,
  });
  // The mistake check vouches for every mark, so a contradiction here means
  // the board itself has no answer.
  if (pass.impossible()) return { ok: false, error: PUZZLE_NOT_REASONABLE };
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps: plan.map((firing) => stepOf(board, firing)) };
}

/**
 * Judge a move against the step on show by what it did to the board, so a
 * click, a drag and a key that make the same change are the same
 * (`engine/hint-track.ts`). A step that decides several squares shrinks to
 * the ones left.
 */
export function starbattleKeepTrack(
  move: StarbattleMove,
  step: HintStep<StarbattleMove>,
  state: StarbattleState,
): HintTrackVerdict {
  if (move.kind !== "mark" || step.move.kind !== "mark") return "off";
  // A button's second click is the other button's first, so the first click
  // of two on a blank square the step asks for is on the way to its mark.
  const [first, ...more] = move.cells;
  if (
    more.length === 0 &&
    first.mark !== BLANK &&
    state.grid[first.index] === BLANK &&
    step.move.cells.some((t) => t.index === first.index && t.mark !== first.mark)
  )
    return "onTrack";
  return starbattleMakesStep(move, step, state);
}

/**
 * The same, for the gesture that plays a step: only a move that makes what
 * the step asks keeps it, so the button chosen for a square is the one that
 * marks it in one click.
 */
export function starbattleMakesStep(
  move: StarbattleMove,
  step: HintStep<StarbattleMove>,
  state: StarbattleState,
): HintTrackVerdict {
  if (move.kind !== "mark" || step.move.kind !== "mark") return "off";
  const after = executeMove(state, move);
  const changes = changedCells<StarbattleMark>(
    state.grid.length,
    (i) => state.grid[i] as StarbattleMark,
    (i) => after.grid[i] as StarbattleMark,
  );
  const { verdict, left } = trackTargets({
    targets: step.move.cells,
    changes,
    key: (t) => t.index,
    want: (t) => t.mark,
    holds: (t) => after.grid[t.index] === t.mark,
  });
  if (verdict === "onTrack") {
    step.move = { kind: "mark", cells: left };
    // The rings are read from the words, so the words shrink with the move.
    const { size } = state;
    const kept = new Set(left.map((t) => `${t.index % size},${(t.index / size) | 0}`));
    if (step.words) {
      step.words = step.words.narrow(
        (role, kind, key) => role !== "ring" || kind !== "cell" || kept.has(key),
      );
      step.explanation = step.words.text;
    }
  }
  return verdict;
}
