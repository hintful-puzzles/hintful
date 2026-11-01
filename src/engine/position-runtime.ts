/**
 * What a planning game's compiled rules give the engine
 * (`docs/descriptions.md` § "A planning game's position and moves"): the
 * moves a position allows, what each does, and whether the position is
 * finished, lost or a proved dead end. The module `npm run describe` writes
 * from the game's description builds one for a board, and anything that does
 * not know the game reads that.
 */

import type { Effect } from "./permutation-planner.ts";

/** A position: one value a cell in each of its layers, by name. */
export type Layers = Readonly<Record<string, Int32Array>>;

export interface PositionRules<P extends Layers, M, D extends string = string> {
  /** Every legal move from `p`, in the order the description binds them. */
  moves(p: P): M[];
  legal(p: P, m: M): boolean;
  /** The position after `m`, a new one: `p` is left as it was. `m` must be
   * legal. */
  play(p: P, m: M): P;
  finished(p: P): boolean;
  lost(p: P): boolean;
  /** The first of the description's dead-end claims that holds of `p`, or
   * null: a claim holds only where no line of moves finishes. */
  deadEnd(p: P): D | null;
  /** The cells claim `id` holds of in `p`, which a banner outlines: empty
   * where it does not hold, or its statement names no cell. */
  witnesses(id: D, p: P): number[];
}

/**
 * What a move that moves pieces the same way on every position does, as
 * `permutation-planner` takes it: played on a position whose pieces are
 * their own cells (layer `piece`) and face no turn (layer `spin`, read
 * modulo `spins`), each cell then holds the cell its piece came from and how
 * far it turned. Every other layer starts at zero.
 */
export function moveEffect<P extends Layers, M>(
  rules: PositionRules<P, M>,
  layers: readonly (keyof P & string)[],
  size: number,
  m: M,
  piece: keyof P & string,
  spin: (keyof P & string) | null = null,
  spins = 1,
): Effect {
  const start: Record<string, Int32Array> = {};
  for (const layer of layers) start[layer] = new Int32Array(size);
  for (let c = 0; c < size; c++) start[piece][c] = c;
  const after = rules.play(start as P, m);
  return {
    src: Int32Array.from(after[piece]),
    spin:
      spin === null
        ? new Uint8Array(size)
        : Uint8Array.from(after[spin], (t) => ((t % spins) + spins) % spins),
  };
}
