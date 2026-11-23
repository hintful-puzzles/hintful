/**
 * The steps of the walk of a board's notes (`candidates.ts`) that a
 * description words where a placed value rules itself out of more than its
 * row and column (`zoning`'s areas and neighbors): each by its id in the
 * description's `steps`, with the terms the walk supplies it and their kinds.
 * Each may also read any size the board's params give beyond the grid's, as a
 * number (a ruleset's `mode`), and each modifier, as a flag by its name, on
 * where the board has it on (`boxing`'s X, whose diagonals a placed value
 * reaches). The compiler holds a description to them.
 */
export const WALK_STEPS = {
  /** The opening clean, after "cross out": what a placed value rules out. */
  clean: {},
  /** A note-less cell's candidates, written because a step rests on them;
   * `unruled` where nothing rules any out yet. */
  note: { vs: "values", unruled: "flag" },
  /** Where `n` just placed rules itself out, after "can't repeat in its". */
  cull: { n: "number" },
  /** A note-less cell every number but `n` is ruled out of. */
  regionsFull: { n: "number" },
} as const satisfies Readonly<Record<string, Readonly<Record<string, string>>>>;

/** A step of the walk's that a description words. */
export type WalkStep = keyof typeof WALK_STEPS;
