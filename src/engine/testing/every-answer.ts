/**
 * A tier's absence from a small size shown over every answer of that size,
 * not sampled from the generator: for a fill game whose clues are all its
 * answer's, every grid of its values that is an answer to the clues it
 * derives is a board, and none may need the tier.
 *
 * Dev/test-only; never imported by production code.
 */

import {
  cappedSolveFor,
  difficultyTiers,
  lowestSolvingCap,
  tierOf,
} from "../contract/difficulty.ts";
import { type Clues, perValuesOf, spaceOf, topValue } from "../fill/board.ts";
import type { DealtFillModule } from "../fill/deal/context.ts";
import { hiddenKinds } from "../fill/deal/hide-settings.ts";
import { encodeDesc } from "../fill/desc.ts";
import { type FillDeal, type FillParams, givenOf } from "../fill/game-id.ts";
import { variationsOf } from "../fill/params/flag.ts";
import type { AnyGame } from "./enrollment.ts";

/** The most grids one cell is enumerated over: two values on sixteen
 * squares, seconds of solving. */
const MOST_GRIDS = 1 << 16;

/** The deal's fields under which a board is not the clues its answer
 * derives: a partition grown round it, numbers drawn apart from it, or a
 * setting only the deal reads. A hide is one where the board hides any. */
const NOT_THE_ANSWERS = ["grow", "partitions", "latin", "unpair"] as const;

/** Whether the deal reads a number or a choice of its own, so a board is
 * one of many an answer has; one that gives a size is the board's. */
const choosesOwn = (deal: FillDeal): boolean =>
  deal.settings.some(
    (s) => (s.kind === "number" || s.kind === "choice") && s.gives !== "size",
  );

export interface EveryAnswer {
  /** The answers tried. */
  readonly answers: number;
  /** Those no tier below the cell's finishes. */
  readonly unfinished: number;
  /** The game IDs of those that need the cell's tier: none, where it is
   * absent. */
  readonly needing: readonly string[];
}

/** Every answer of the size `cell` asks for, and those whose board needs
 * its tier. Throws where the game's boards are not one per answer, or the
 * size has too many grids to try. */
export function everyAnswer(
  game: AnyGame,
  compiled: Readonly<Record<string, unknown>>,
  cell: string,
): EveryAnswer {
  const deal = compiled["deal"] as FillDeal | undefined;
  if (deal === undefined || typeof compiled["deriveClues"] !== "function")
    throw new Error(`${cell}: ${game.id} deals no fill board`);
  const p = game.decodeParams(cell) as FillParams;
  const beyond: string[] = NOT_THE_ANSWERS.filter((k) => deal[k] !== undefined);
  if (hiddenKinds(deal, p).length > 0) beyond.push("hide");
  if (choosesOwn(deal)) beyond.push("settings the deal reads");
  if (beyond.length > 0)
    throw new Error(
      `${cell}: ${game.id}'s deal has ${beyond.join(", ")}, so its boards are not one per answer`,
    );
  const module = compiled as unknown as DealtFillModule<Clues<object>>;
  const { difficulty } = game;
  if (difficulty === undefined) throw new Error(`${game.id} has no tiers`);
  const tier = tierOf(game, p);
  const tierCount = difficultyTiers(game)?.length ?? 0;

  const given = givenOf(deal, p);
  const variations = variationsOf(p);
  // Every grid of the params' own size: a board of buttons, never a store.
  const sp = spaceOf(module, { w: p.w, h: p.h, dealt: given, variations });
  // A board of buttons' values, else a board of numbers' answer domain.
  const buttons = Object.keys(module.play?.values ?? {}).map(Number);
  const values =
    buttons.length > 0
      ? buttons
      : Array.from({ length: topValue(module, sp, given) }, (_, k) => k + 1);
  const grids = values.length ** (p.w * p.h);
  if (values.length === 0 || grids > MOST_GRIDS)
    throw new Error(`${cell}: ${grids} grids of [${values}] are too many to try`);
  const g = new Uint8Array(p.w * p.h);
  let answers = 0;
  let unfinished = 0;
  const needing: string[] = [];
  for (let n = 0; n < grids; n++) {
    for (let c = 0, k = n; c < g.length; c++, k = Math.floor(k / values.length))
      g[c] = values[k % values.length];
    const clues = module.deriveClues(g, sp, {}, given);
    if (!module.isAnswer(g, sp, clues, variations)) continue;
    answers++;
    const desc = encodeDesc(deal, sp, clues, perValuesOf(module, sp, clues));
    const lowest = lowestSolvingCap(cappedSolveFor(difficulty, p, desc), tierCount);
    if (lowest !== null && lowest < tier) continue;
    unfinished++;
    if (lowest === tier) needing.push(`${cell}:${desc}`);
  }
  return { answers, unfinished, needing };
}
