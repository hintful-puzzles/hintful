/**
 * The deal of a search tier, the board with one answer that the search
 * proves and the tier below does not reach: every clue shown where the deal
 * hides none, or else stripped clue by clue.
 */

import { drawRejected } from "../../contract/deal-census.ts";
import { retryLimit } from "../../contract/retry-limit.ts";
import { dealUnreasonable } from "../../solve/answer-search.ts";
import { encodeAnswer } from "../answer.ts";
import type { Clues } from "../board.ts";
import { encodeDesc } from "../desc.ts";
import { searchAgainst } from "../search.ts";
import type { DealContext } from "./context.ts";
import type { Hide } from "./hide.ts";

/** A draw for tier `tier`: its answer and every clue it shows. */
export type Draw<C> = (tier: number) => { g: Uint8Array; clues: C } | null;

/**
 * Which try of a search tier's deal starts from every clue and not from a
 * board of the lowest tier. A board stripped from every clue is left with
 * more undecided (Mosaic's 10x10: a median of 62 squares of 100, against 41),
 * but no board of the lowest tier strips to some of the smallest boards
 * (none of Mosaic's 3x3 in five million tries), so one try in this many
 * gives them a deal and leaves the larger boards as they were. A deal of
 * `stripFrom: everyClue` starts every try so: Sticks' 8x10 took up to 3.7 s
 * from boards of the lowest tier and 1.7 s from every clue, against 2.6 s
 * for its hand-written generator, which did the same (2026-11-22).
 */
const EVERY_CLUE_DRAW = 8;

/**
 * Where the deal is not thorough, the clues a search tier's strip hides at
 * once before it asks the ladder, going through a run a clue at a time only
 * where the ladder stops without it: a long run pays only while most pass.
 * Mosaic's, measured 2026-10-11 at 100x100: a board took 10 s a clue at a
 * time, 5 s in runs of 16 and 1 to 3 s in runs of 6.
 */
const HIDING_RUN = 6;

/** Every clue is shown, so a board is drawn again until the tier below
 * stops short of it and the search proves one answer (upstream pattern.c's
 * Unreasonable: most such pictures have several). */
export function dealEveryClue<C extends Clues<C>>(
  cx: DealContext<C>,
  draw: Draw<C>,
): { desc: string; aux: string } {
  const { module, p, finishes, board } = cx;
  const top = p.diff - 1;
  const got = dealUnreasonable<{ g: Uint8Array; clues: C }>({
    label: `fill: ${module.tiers[p.diff]} deal (${p.w}x${p.h})`,
    draw: () => draw(p.diff),
    deduced: (b) => finishes(b.clues, top),
    answer: (b, budget) => searchAgainst(module, board(b.clues), b.g, budget),
  });
  return {
    desc: encodeDesc(module, cx.deal, cx.sp, got.clues),
    aux: encodeAnswer(got.g),
  };
}

/** A board of the hidden kinds' clues, stripped while the search proves it
 * has one answer. */
export function dealStripped<C extends Clues<C>>(
  cx: DealContext<C>,
  hide: Hide<C>,
  draw: Draw<C>,
): { desc: string; aux: string } {
  const { module, deal, p, thorough, finishes, board } = cx;
  const { keeping, allShown, unitsOf, hideOrder, holds, hideUpTo } = hide;
  if (cx.hide.kind === null) throw new Error("deal: a search tier hides no clue");
  const top = p.diff - 1;
  let draws = 0;
  let answer: Uint8Array = new Uint8Array(0);
  type Held = { all: C; shown: number[] };
  const held = (b: Held): C => keeping(b.all, b.shown);
  const got = dealUnreasonable<Held>({
    label: `fill: ${module.tiers[p.diff]} deal (${p.w}x${p.h})`,
    draw() {
      // A board the lowest tier finishes is drawn until there is one, and
      // hidden from at that tier, so the every-clue try is one in its count
      // of boards and not of pictures, most of which the ladder does not
      // finish (the miscount took Mosaic's 10x10 median left undecided from
      // 43 to 65).
      const every = deal.stripFrom === "everyClue" || ++draws % EVERY_CLUE_DRAW === 0;
      const attempt = retryLimit("fill: a board to strip");
      for (;;) {
        attempt();
        const drawn = draw(0);
        if (drawn === null) continue;
        const clues = every ? drawn.clues : hideUpTo(drawn.clues, top, true);
        if (clues === null) {
          drawRejected("fill: the lowest tier stops short of every clue");
          continue;
        }
        answer = drawn.g;
        return { all: clues, shown: allShown(clues) };
      }
    },
    strip(b, one) {
      const order = hideOrder(b.all, unitsOf(b.all, b.shown));
      const hide = (run: readonly number[]) => {
        b.shown = b.shown.filter((j) => !run.includes(j));
      };
      const show = (run: readonly number[]) => {
        b.shown = [...b.shown, ...run].sort((x, y) => x - y);
      };
      const may = () => holds(b.all, b.shown);
      if (thorough) {
        for (const unit of order) {
          hide(unit);
          if (!may() || !one()) show(unit);
        }
        return;
      }
      // The search is asked only of the unit whose loss stops the ladder,
      // and hiding stops at the first it keeps hidden, so the board keeps
      // the rest of its clues.
      const ladderFinishes = () => finishes(held(b), top);
      for (let from = 0; from < order.length; from += HIDING_RUN) {
        const run = order.slice(from, from + HIDING_RUN);
        hide(run.flat());
        if (may() && ladderFinishes()) continue;
        show(run.flat());
        for (const unit of run) {
          hide(unit);
          if (may()) {
            if (ladderFinishes()) continue;
            if (one()) return;
          }
          show(unit);
        }
      }
    },
    deduced: (b) => finishes(held(b), top),
    answer: (b, budget) => searchAgainst(module, board(held(b)), answer, budget),
  });
  const clues = held(got);
  return {
    desc: encodeDesc(cx.module, deal, cx.sp, clues),
    aux: encodeAnswer(answer),
  };
}
