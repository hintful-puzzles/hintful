/**
 * What `scripts/checks/deal-walk.test.ts` writes for one game and
 * `scripts/deal-walk.ts` reads back: the file the two processes share.
 */

/** One params set, dealt up to a few times. */
export interface DealWalkCell {
  /** The params in their full encoding. */
  label: string;
  /** The sentence the Custom dialog shows instead of dealing, or `null`. */
  refusal: string | null;
  /** Each deal's time in milliseconds, a deal that gave up included. */
  ms: number[];
  /** Each deal's tries at its outermost retry loop, 0 where it has none. */
  tries: number[];
  /** Each board's easiest tier that finishes it, for a cell asked for by
   * name (`DEAL_WALK_CELLS`). */
  tiers: string[];
  /** Whether the cell was asked for by name (`DEAL_WALK_CELLS`), which is
   * dealt as the app deals and says how its deals went. */
  named: boolean;
  /** The draws thrown away over the cell's deals, by stage, for a cell
   * asked for by name (`deal-census.ts`). */
  rejected: Record<string, number>;
  /** The mends over the cell's deals, by how each ended: the fewest squares
   * each left open, for a cell asked for by name. */
  mends: Record<string, number[]>;
  /** The board's squares, as its mends count them; `null` with no mend. */
  squares: number | null;
  /** How many deals ran their retry bound out. */
  gaveUp: number;
  /** The error of a deal that threw anything else, which a player gets as a
   * deal that never arrives. */
  threw: string | null;
  /** How the run last ended during one of this cell's deals, or `null`. */
  died: string | null;
  /** How many deals the run ended during: they have no time in `ms`. */
  lost: number;
  /** Whether the cell has had every deal it is going to. */
  done: boolean;
}

export interface DealWalkState {
  cells: DealWalkCell[];
  /** The cells' labels in the order dealt, a list for each ladder. */
  ladders: string[][];
  /** The label of the cell whose deal is running. */
  inFlight: string | null;
  done: boolean;
}

export const EMPTY_STATE: DealWalkState = {
  cells: [],
  ladders: [],
  inFlight: null,
  done: false,
};
