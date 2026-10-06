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
