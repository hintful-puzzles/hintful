/**
 * Check & Save's per-cell verdict for a game whose player writes one value per
 * cell or pencils a set of candidates there: a placed value that differs from
 * the solution is wrong, and so is a blank cell whose marks have crossed out
 * the solution's value (docs/games/mechanics.md § "Pencil marks: the full
 * note-taking UX"). Marks carrying extra candidates beside the answer are
 * ordinary mid-solve state, and a cell with no marks says nothing.
 *
 * The note half is what a candidate hint's soundness rests on: the hint reasons
 * from the marks, so a mark set without its cell's answer is a false premise
 * the hint must refuse on rather than narrate from.
 */

import { type NoteEncoding, noteBitOf } from "./candidate-hint.ts";

export type EntryMistakeKind = "cell" | "note";

/** One board, cell-indexed, as the check reads it. */
export interface EntryBoard {
  /** The unique solution's value per cell. */
  answer: ArrayLike<number>;
  /** The player's placed value per cell, `empty` where there is none. */
  entry: ArrayLike<number>;
  /** The player's pencil mask per cell, in `enc`'s bits. */
  notes: ArrayLike<number>;
  /** How `entry` spells a blank cell. Default `0`; Map's colors start at 0. */
  empty?: number;
  /** How a value maps to its note bit. Default `1 << value`. */
  enc?: NoteEncoding;
  /** A cell the player cannot change, which is never a mistake. */
  fixed?(i: number): boolean;
}

/** Cell `i`'s verdict, ignoring `fixed`. */
export function entryMistake(board: EntryBoard, i: number): EntryMistakeKind | null {
  const answer = board.answer[i];
  const entry = board.entry[i];
  if (entry !== (board.empty ?? 0)) return entry === answer ? null : "cell";
  const notes = board.notes[i];
  return notes !== 0 && !(notes & noteBitOf(board.enc)(answer)) ? "note" : null;
}

/** Every mistaken cell the player can change, in index order, each placed by
 * `at` in the game's own mistake shape. */
export function entryMistakes<P extends object>(
  board: EntryBoard,
  at: (i: number) => P,
): (P & { kind: EntryMistakeKind })[] {
  const out: (P & { kind: EntryMistakeKind })[] = [];
  for (let i = 0; i < board.answer.length; i++) {
    if (board.fixed?.(i)) continue;
    const kind = entryMistake(board, i);
    if (kind) out.push({ ...at(i), kind });
  }
  return out;
}

/** `at` for a row-major grid of stride `w`. */
export function gridCell(w: number): (i: number) => { x: number; y: number } {
  return (i) => ({ x: i % w, y: (i / w) | 0 });
}
