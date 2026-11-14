/**
 * A Latin game's hint plan deduced from the player's notes
 * (docs/hints-candidates.md § "Deduce from the notes when the mistake check
 * vouches for them"): its ladder run on {@link LatinSolver} marks, and the
 * library's strikes as the plan's rungs. Apart from `latin-hint.ts` because
 * it builds on `candidate-plan.ts`, which builds on that.
 */

import type { Mark, NoteEncoding } from "./candidate-hint.ts";
import {
  type CandidateRung,
  type NotesLadder,
  strikesOf,
  techniqueRung,
} from "./candidate-plan.ts";
import type { Ladder } from "./ladder-runtime.ts";
import { type LatinReason, type LatinRepeats, LatinSolver } from "./latin.ts";

/**
 * A Latin game's ladder as a plan that deduces from the notes runs it
 * (`techniqueRung`): fresh {@link LatinSolver} marks each time, holding the
 * values on the walk's working `grid` as it stands, so a technique of the
 * game's own reads the solver it reads on the solve path. A note is the
 * solver's value of the same number, up to `enc.values`, which defaults to
 * every symbol.
 */
export function latinNotesLadder(
  ladder: Ladder<LatinSolver>,
  o: number,
  grid: ArrayLike<number>,
  opts: { repeats?: LatinRepeats | null; enc?: NoteEncoding } = {},
): NotesLadder<LatinSolver> {
  const repeats = opts.repeats ?? null;
  const symbols = repeats ? o - repeats.times + 1 : o;
  return {
    ladder,
    marks: () => {
      const m = new LatinSolver(o, repeats, ladder.placing);
      m.grid.set(grid);
      return m;
    },
    enc: { ...opts.enc, values: opts.enc?.values ?? symbols },
  };
}

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

/** The reasons the library's strikes give: a set (a fish is one confined
 * across lines) and a wing. */
export type LatinStrikeReason = Exclude<LatinReason, { kind: "single" | "dup" }>;

/** The library's techniques that strike. Its singles and the cull around a
 * placement are the walk's own. */
const LIBRARY_STRIKES: readonly string[] = ["latin.set", "latin.fish", "latin.wing"];

/**
 * A rung for each of the library's strikes in `on`'s ladder, in the ladder's
 * order: each firing as the strikes it makes, with the reason the technique
 * gives it. `split` cuts a firing's strikes into legs; one leg by default.
 * `Reason` is the game's reason union, which holds these.
 */
export function latinStrikeRungs<M, H, R, Reason = LatinStrikeReason>(
  on: NotesLadder<LatinSolver>,
  o: number,
  split: (marks: Mark[]) => Mark[][] = (marks) => [marks],
): CandidateRung<M, H, R, Reason | LatinStrikeReason>[] {
  return on.ladder.entries
    .filter((e) => LIBRARY_STRIKES.includes(e.id))
    .map((e) =>
      techniqueRung<M, H, R, Reason | LatinStrikeReason, LatinSolver>(on, e.id, (f) => {
        const reason = f.reasons[0] as LatinStrikeReason;
        return split(strikesOf(f, o)).map((strike) => ({ strike, reason }));
      }),
    );
}
