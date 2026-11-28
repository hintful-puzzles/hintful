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

/**
 * The step of the walk a description may word where its rules hold the parts
 * of a dealt partition distinct: a part holds every value only where its
 * squares can hold no more between them (Rome's area of four, of four
 * arrows), which the Latin words for a unit ("no other square in this area
 * can be 3") take as read. Unworded, the walk says those.
 */
export const PART_STEPS = {
  /** `n` has one place left, the ring, in the part striped as `cell`, of
   * `size` squares, which holds every value its squares can. */
  hiddenSingle: { n: "number", size: "number" },
} as const satisfies Readonly<Record<string, Readonly<Record<string, string>>>>;

/** A step of the walk's that a description words. */
export type WalkStep = keyof typeof WALK_STEPS;

/**
 * The step of the walk a description words where a unit holds a value more
 * than once (`answer.value.repeat`, Salad's empty square): a placement of it
 * rules it out of the rest of a unit only once that unit holds every copy,
 * so its cull says the unit is full, never that the value cannot repeat.
 */
export const REPEAT_STEPS = {
  /** `n` just placed, outlined, is the last its unit `axis` holds; `both`
   * where its row and its column fill at once. */
  last: { n: "number", axis: "unit", both: "flag" },
} as const satisfies Readonly<Record<string, Readonly<Record<string, string>>>>;
