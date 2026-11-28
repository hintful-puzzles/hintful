/**
 * A Latin game's hint plan deduced from the player's notes
 * (docs/hints-candidates.md § "Deduce from the notes when the mistake check
 * vouches for them"): the library's strikes as the plan's rungs, and how a
 * firing's strikes are cut into steps. Apart from `latin-hint.ts` because it
 * builds on `candidate-plan.ts`, which builds on that.
 */

import type { CellMarks } from "../solve/cell-marks.ts";
import type { LatinReason } from "../solve/latin.ts";
import type { Mark } from "./candidate-hint.ts";
import {
  type CandidateRung,
  type NotesLadder,
  strikesOf,
  techniqueRung,
} from "./candidate-plan.ts";

/** A firing's strikes, a leg a cell, in the order the cells first appear: for
 * a game whose sentence names one cell's notes. */
export function byCell(marks: readonly Mark[]): Mark[][] {
  const out = new Map<string, Mark[]>();
  for (const m of marks) {
    const k = `${m.x},${m.y}`;
    out.set(k, [...(out.get(k) ?? []), m]);
  }
  return [...out.values()];
}

/**
 * A firing's strikes on a board `w` cells wide: those from cells whose notes
 * are `written` as one leg, then each cell with none its own, in the order
 * the cells first appear. Under the implicit reading a strike from one
 * note-less cell is a step that writes the values left, so a cell at a time
 * folds that writing into the strike; a cell with notes gains nothing from a
 * step of its own. Towers' sets took 44 steps a cell at a time, 13 as one
 * (2026-11-23).
 */
export function byWrittenCell(
  marks: readonly Mark[],
  written: ArrayLike<number>,
  w: number,
): Mark[][] {
  const noted = marks.filter((m) => written[m.y * w + m.x] !== 0);
  const bare = byCell(marks.filter((m) => written[m.y * w + m.x] === 0));
  return noted.length === 0 ? bare : [noted, ...bare];
}

/** The reasons the library's strikes give: a set (a fish is one confined
 * across lines) and a wing. */
export type LatinStrikeReason = Exclude<LatinReason, { kind: "single" | "dup" }>;

/** The library's techniques that strike, each with the kind of reason it
 * gives, which is the rung its step is walked as. Its singles and the cull
 * around a placement are the walk's own. */
export const LIBRARY_STRIKES: Readonly<Record<string, LatinStrikeReason["kind"]>> = {
  "latin.set": "set",
  "latin.fish": "set",
  "latin.wing": "wing",
};

/**
 * A rung for each of the library's strikes in `on`'s ladder, in the ladder's
 * order: each firing as the strikes it makes, with the reason the technique
 * gives it. `split` cuts a firing's strikes into legs, told the notes
 * written on the walk's board; one leg by default. `Reason` is the game's
 * reason union, which holds these.
 */
export function latinStrikeRungs<
  M,
  H,
  Reason = LatinStrikeReason,
  S extends CellMarks = CellMarks,
>(
  on: NotesLadder<S>,
  o: number,
  split: (marks: Mark[], written: ArrayLike<number>) => Mark[][] = (marks) => [marks],
): CandidateRung<M, H, Reason | LatinStrikeReason>[] {
  return on.ladder.entries
    .filter((e) => Object.hasOwn(LIBRARY_STRIKES, e.id))
    .map((e) =>
      techniqueRung<M, H, Reason | LatinStrikeReason, S>(
        on,
        e.id,
        (f, _shown, written) => {
          const reason = f.reasons[0] as LatinStrikeReason;
          return split(strikesOf(f, o), written).map((strike) => ({ strike, reason }));
        },
      ),
    );
}
