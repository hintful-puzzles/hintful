/**
 * The code-breaking mechanic: a hidden answer of `n` slots, guessed a row at a
 * time, with an answer row where the player rules values out of each slot.
 * Guess (colors) and Wordguess (letters) are its members.
 *
 * Two things are shared, and each member keeps its own score, keys, picture,
 * hint and the routing of taps and keys onto these operations:
 *
 * - **The answer row**: one bitmask a slot, bit `v` set when the player has
 *   ruled value `v` out of it. Rule-outs, not candidates: an unmarked slot is
 *   one where every value is still possible. It lives in the state, so a mark
 *   is a move, which undoes and which a hint can place. Values are `1..31`.
 * - **The working row**: the half-composed guess, in the `Ui`. A value lands
 *   in the slot the player selected, else the first open one, and the cursor
 *   then rests where the next will go; Backspace rubs out the selected slot,
 *   or the last one typed.
 */

import type { GridCursor } from "./pointer.ts";

// --- the answer row -----------------------------------------------------

/** One answer-row mark: value `value` in slot `pos`. */
export interface RuleOut {
  readonly pos: number;
  readonly value: number;
}

export function isRuledOut(masks: Int32Array, pos: number, value: number): boolean {
  return (masks[pos] & (1 << value)) !== 0;
}

/** The values ruled out of slot `pos`, in increasing order. */
export function ruledOutAt(masks: Int32Array, pos: number, nvalues: number): number[] {
  const out: number[] = [];
  for (let v = 1; v <= nvalues; v++) if (isRuledOut(masks, pos, v)) out.push(v);
  return out;
}

/**
 * `masks` with every mark in `marks` set to `ruledOut`, as a copy. A mark is
 * *set*, never toggled, so a hint's step is idempotent; a player's toggle is
 * decided where the current mark is known. A mark outside the board is a
 * corrupt move and throws.
 */
export function withRuleOuts(
  masks: Int32Array,
  marks: readonly RuleOut[],
  ruledOut: boolean,
  nvalues: number,
): Int32Array {
  const next = masks.slice();
  for (const { pos, value } of marks) {
    if (pos < 0 || pos >= masks.length || value < 1 || value > nvalues) {
      throw new Error(`Illegal answer-row mark ${value} at ${pos}`);
    }
    if (ruledOut) next[pos] |= 1 << value;
    else next[pos] &= ~(1 << value);
  }
  return next;
}

/** An answer slot whose rule-outs include the answer's value there. */
export interface RuleOutMistake {
  readonly pos: number;
}

/**
 * The answer slots whose rule-outs include the answer's value there: the one
 * mark a player can get wrong, since a guess is a probe rather than a claim.
 * The slot is reported, never the value, so the check says that a rule-out
 * here is wrong without saying which. Rule-outs are the complement of the
 * candidate masks `entryMistakes` reads, and a slot with every value ruled out
 * would read there as unmarked, so the test is written out here.
 */
export function ruleOutMistakes(
  masks: Int32Array,
  answer: readonly number[],
): readonly RuleOutMistake[] {
  const out: RuleOutMistake[] = [];
  answer.forEach((value, pos) => {
    if (isRuledOut(masks, pos, value)) out.push({ pos });
  });
  return out;
}

// --- the working row ----------------------------------------------------

/**
 * The fields of a member's `Ui` the working row is edited through.
 */
export interface WorkingRow {
  /** The row being composed, a value a slot, `0` empty. */
  readonly entries: number[];
  /**
   * `x` is the slot the next value goes in, `0..n`, where `n` is the submit
   * position. One-dimensional (`y` stays `0`), because a value is named by its
   * own key rather than picked out of a list.
   */
  cursor: GridCursor;
  /** Notes mode: a value key rules the value out of the cursor's answer slot
   * instead of entering it in the working row. */
  pencilMode: boolean;
  /** Whether the row as it stands may be submitted. */
  ready: boolean;
}

/** Whether a row's entries may be submitted: each member's own rule. */
export type IsReady = (entries: readonly number[]) => boolean;

/** The first slot of the working row with nothing in it, or `-1`. */
function firstOpen(row: WorkingRow): number {
  return row.entries.indexOf(0);
}

/** The slot the player has selected, when the cursor is shown on one, or `-1`. */
export function selectedSlot(row: WorkingRow): number {
  return row.cursor.visible && row.cursor.x < row.entries.length ? row.cursor.x : -1;
}

/**
 * Park the cursor where the next value will go: the first open slot, else the
 * submit position.
 *
 * Filling the first *open* slot, rather than advancing by one index, is what
 * keeps a row pre-filled out of order (Guess's holds) from having a slot the
 * player asked to keep overwritten by the next key.
 *
 * `fallback` is where to rest when the row is full but cannot be submitted:
 * the submit position would draw the submit box around a row that will not go.
 * In notes mode the cursor names an answer slot, and the submit position is not
 * one, so a full row rests on its last slot.
 */
export function restCursor(row: WorkingRow, fallback = 0): void {
  const n = row.entries.length;
  const open = firstOpen(row);
  const full = row.pencilMode ? n - 1 : row.ready ? n : fallback;
  row.cursor.x = open >= 0 ? open : full;
}

/** Write `value` (or `0`, empty) into `slot` and re-judge the row. */
function setEntry(
  row: WorkingRow,
  slot: number,
  value: number,
  isReady: IsReady,
): void {
  row.entries[slot] = value;
  row.ready = isReady(row.entries);
}

/**
 * Enter `value` where the player is pointing: the slot they selected, else the
 * first open one. Declines, returning `false`, when the row is full and nothing
 * is selected: there is nowhere for the value to go, and overwriting a slot the
 * player did not name would be a guess about which.
 */
export function enterValue(row: WorkingRow, value: number, isReady: IsReady): boolean {
  const chosen = selectedSlot(row);
  const slot = chosen >= 0 ? chosen : firstOpen(row);
  if (slot < 0) return false;
  setEntry(row, slot, value, isReady);
  // The ring is the "where does the next one land" marker, so it is shown
  // whether or not the player has ever moved a cursor.
  row.cursor.visible = true;
  restCursor(row, slot);
  return true;
}

/**
 * Rub out the selected slot, or, with nothing selected or the selection on an
 * empty slot, the last value the player typed: the rightmost filled slot
 * `typed` accepts (a member that carries slots over from the last row says
 * those were not typed). Backspacing is what makes the key work on a *full*
 * row, where the cursor rests on the submit position: the moment a typo is
 * most likely. Declines, returning `false`, when there is nothing to rub out.
 */
export function rubOut(
  row: WorkingRow,
  isReady: IsReady,
  typed: (slot: number) => boolean = () => true,
): boolean {
  const at = selectedSlot(row);
  let slot = at >= 0 && row.entries[at] !== 0 ? at : -1;
  for (let i = row.entries.length - 1; slot < 0 && i >= 0; i--) {
    if (row.entries[i] !== 0 && typed(i)) slot = i;
  }
  if (slot < 0) return false;
  setEntry(row, slot, 0, isReady);
  row.cursor.x = slot;
  row.cursor.visible = true;
  return true;
}
