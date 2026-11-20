/**
 * **The walk every midend hint guard takes**: each board of the gate slice
 * dealt into a fresh midend, and Hint pressed, read and applied step by step,
 * as a player pressing Hint over and over meets the steps. A guard is the
 * visitor it hands the walk, and the step limit it needs.
 *
 * One walk, so a guard is not a population of its own: the boards are
 * `gatePresets`', the midend is the one the app drives, and a board the slice
 * offers that will not deal fails every guard rather than being skipped by
 * some.
 *
 * Dev/test-only; never imported by production code.
 */
import type { HintStep } from "../game.ts";
import { Midend } from "../midend.ts";
import type { Size } from "../types.ts";
import { beginDealt } from "./dealt.ts";
import { type ObservedMidend, observeMidend } from "./drive-midend.ts";
import { type AnyGame, gatePresets } from "./hint-games.ts";

/** The size every walked midend is given, so a frame has a tile size and a
 * pointer a place to land. */
const WALK_SIZE = { w: 700, h: 700 };

/** Long enough for any move's animation and win flash to land, so one tick
 * settles the board as a player's next press finds it: a game may draw a mark
 * only on a settled board (Inertia's arrow). */
export const LAND_S = 60;

type AnyObserved = ObservedMidend<unknown, unknown, unknown, unknown, unknown>;

/** One board of a walk, dealt into a fresh, sized, observed midend. */
export interface WalkBoard {
  readonly title: string;
  readonly params: unknown;
  readonly midend: Midend<unknown, unknown, unknown, unknown, unknown>;
  /** What the midend has told the app since it was built. */
  readonly observed: AnyObserved;
  /** The size the midend drew the board at. */
  readonly size: Size;
}

/**
 * Each board a midend walk takes for `game`: every board of the gate slice, or
 * with `first` its first only, for a guard whose subject is a code path every
 * board reaches. Throws where the midend refuses a board the slice offers,
 * since a refused board walks nothing and a guard skipping it would not say.
 */
export function* walkBoards(game: AnyGame, first = false): Generator<WalkBoard> {
  const presets = gatePresets(game);
  if (presets.length === 0) throw new Error("the gate slice holds no board");
  for (const { title, params } of first ? presets.slice(0, 1) : presets) {
    const midend = new Midend(game) as WalkBoard["midend"];
    const observed = observeMidend(midend);
    const refused = beginDealt(midend, game, params);
    if (refused !== null)
      throw new Error(`${title}: the midend refused it: ${refused}`);
    const size = midend.size(WALK_SIZE);
    yield { title, params, midend, observed, size };
  }
}

export interface WalkVisitor {
  /** Called once a board is dealt, before its first press of Hint. */
  board?(board: WalkBoard): void;
  /** Called with each step on display, before it is applied. */
  shown?(step: HintStep<unknown>, index: number, board: WalkBoard): void;
  /** Called after each step is applied and its move has landed. */
  played?(step: HintStep<unknown>, index: number, board: WalkBoard): void;
}

export interface WalkOptions {
  /** How many steps a board is walked, at most. */
  readonly steps: number;
  /** Only each board's first. */
  readonly first?: boolean;
  /** Press Hint for where to look first (`Midend.hint(true)`). */
  readonly look?: boolean;
}

/**
 * Walk `game`'s hints on each board: press Hint, show the step to `shown`,
 * apply it, let it land, show it to `played`, until the hint refuses (a solved
 * board included) or `steps` are walked. How many boards and steps it walked,
 * for the guard's floor.
 */
export function walkHints(
  game: AnyGame,
  options: WalkOptions,
  visit: WalkVisitor,
): { boards: number; steps: number } {
  let boards = 0;
  let steps = 0;
  for (const board of walkBoards(game, options.first)) {
    boards++;
    visit.board?.(board);
    const { midend } = board;
    for (let i = 0; i < options.steps; i++) {
      if (midend.hint(options.look) !== null) break;
      const step = midend.activeHintStep();
      if (step === null) throw new Error(`${board.title}: Hint showed no step`);
      visit.shown?.(step, i, board);
      const err = midend.executeHint();
      if (err !== null) throw new Error(`${board.title}: applying step ${i}: ${err}`);
      midend.timer(LAND_S);
      steps++;
      visit.played?.(step, i, board);
    }
  }
  return { boards, steps };
}
