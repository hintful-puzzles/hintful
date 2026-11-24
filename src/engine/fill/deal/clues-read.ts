/**
 * The hidden clues a ladder read on its way to finishing a board, which the
 * hide keeps while it tries the rest (`hide.ts`).
 */

import type { ClueList } from "../../solve/describe-runtime.ts";
import { ladderTechniques, runLadder, type Said } from "../../solve/ladder-runtime.ts";
import { type Clues, capsOf, type FillBoard, marksOf } from "../board.ts";
import type { SearchedFillModule } from "../search.ts";
import { offsetsOf } from "./keeping.ts";

/** What a firing of a technique reads of the clues, by its bindings: the
 * clue of each kind listed at each element named, and each clue named by its
 * index in its kind (`techniques`' `reads`). */
interface Reads {
  readonly at: Readonly<Record<string, readonly string[]>>;
  readonly clues: Readonly<Record<string, string>>;
}

/**
 * The clues of the kinds `kinds`, by their index in one numbering of them
 * all ({@link offsetsOf}), that a firing of the ladder read on its way to
 * finishing `board` at tier `cap`: each one a binding of the firing names,
 * by its element or by its index.
 */
export function cluesRead<C extends Clues<C>>(
  module: SearchedFillModule<C>,
  board: FillBoard<C>,
  cap: number,
  kinds: readonly string[],
): ReadonlySet<number> {
  const offsets = offsetsOf(board.dealt, kinds);
  const lists = kinds.map((k) => board.dealt[k as keyof C] as ClueList);
  const reads = module.techniques as unknown as Readonly<
    Record<string, { readonly reads?: Reads }>
  >;
  const read = new Set<number>();
  /** The clue of each of `of` at element `e` of their place, read. */
  const readAt = (of: readonly string[], e: number) => {
    for (const kind of of) {
      const n = kinds.indexOf(kind);
      if (n >= 0 && lists[n].byAt[e] >= 0) read.add(offsets[n] + lists[n].byAt[e]);
    }
  };
  const atCells = kinds.filter((k) => module.deal?.universes[k] === "cells");
  const { marks, entries } = marksOf(module, board);
  let current: Reads | null = null;
  marks.recorder = (rec) => {
    if (current === null) return;
    const binding = (
      rec.reason as Partial<Said<Readonly<Record<string, number>>, unknown>>
    ).binding;
    // A technique run on placing strikes inside the placement, with no
    // binding of its own: it reads the cell placed, which the firing that
    // placed it named, and each cell it strikes.
    if (binding === undefined) {
      readAt(atCells, rec.y * board.w + rec.x);
      return;
    }
    for (const [name, of] of Object.entries(current.at)) readAt(of, binding[name]);
    for (const [name, of] of Object.entries(current.clues)) {
      const n = kinds.indexOf(of);
      if (n >= 0) read.add(offsets[n] + binding[name]);
    }
  };
  // Every firing of a pass, as the solve makes them: one a pass would read
  // the whole board again for each.
  marks.wholePasses = true;
  runLadder(
    marks,
    ladderTechniques(marks, entries, capsOf(module, cap), {}, (e) => {
      current = reads[e.id]?.reads ?? null;
      return 0;
    }),
  );
  return read;
}
