/**
 * Numgame's solver: every value the numbers on the board can make, and a
 * shortest line of combinations to any one of them.
 *
 * Upstream's `numgame.c` searches breadth-first over sets of numbers. This
 * organizes the same search by subset: a combination of `k` numbers always
 * takes `k - 1` operations, so the values made by using *all* of each subset,
 * smallest subsets first, give the fewest operations to every value at once.
 * That is the measure the tiers and the hint read (`add-numgame-ts-port`
 * design D3 and D4).
 */

import type { SearchOutcome } from "../../engine/search-outcome.ts";

/** An operator, as a move and a save write it. */
export type Op = "+" | "-" | "*" | "/";

/** Every operator, in the order the board draws their buttons. */
export const OPS: readonly Op[] = ["+", "-", "*", "/"];

/**
 * The number that combining `x` and `y` with `op` makes, or `null` where that
 * is not a move. `−` and `÷` take the smaller from or into the larger, since
 * the other order is never a move (design D2). Every result is a positive
 * whole number: a difference of zero and a division with a remainder are not
 * moves.
 */
export function combine(x: number, op: Op, y: number): number | null {
  const hi = Math.max(x, y);
  const lo = Math.min(x, y);
  if (op === "+") return x + y;
  if (op === "*") return x * y;
  if (op === "-") return hi > lo ? hi - lo : null;
  return hi % lo === 0 ? hi / lo : null;
}

/** How one value of a subset is made: `a op b`, with `a` made from the
 * subset `left` and `b` from `right`, and `a` the larger. A single number is
 * made by being there, and has no `Made`. */
interface Made {
  readonly left: number;
  readonly a: number;
  readonly op: Op;
  readonly right: number;
  readonly b: number;
}

/** A calculation, as a tree over the places on the board. */
export type Expr =
  | { readonly kind: "number"; readonly value: number; readonly place: number }
  | {
      readonly kind: "combine";
      readonly value: number;
      /** The larger operand. */
      readonly a: Expr;
      readonly op: Op;
      readonly b: Expr;
    };

/** One combination: the number in place `from` and the one in place `into`,
 * whose place the result takes. */
export interface Step {
  readonly from: number;
  readonly into: number;
  readonly op: Op;
}

function bitCount(mask: number): number {
  let n = 0;
  for (let m = mask; m !== 0; m &= m - 1) n++;
  return n;
}

/**
 * Everything the numbers in `places` can make. `values[i]` is the number in
 * place `places[i]`; a subset is a bit mask over that list.
 */
export class Reach {
  /** For each subset, the values made by using all of it. */
  private readonly made: Map<number, Made | null>[];

  constructor(
    readonly values: readonly number[],
    readonly places: readonly number[],
  ) {
    const n = values.length;
    const made: Map<number, Made | null>[] = [];
    // Subsets in order of size, so each split's halves are already done.
    const masks = Array.from({ length: (1 << n) - 1 }, (_, i) => i + 1).sort(
      (x, y) => bitCount(x) - bitCount(y) || x - y,
    );
    for (const mask of masks) {
      const out = new Map<number, Made | null>();
      made[mask] = out;
      if (bitCount(mask) === 1) {
        out.set(values[31 - Math.clz32(mask)], null);
        continue;
      }
      // Each split once: the half holding the lowest member is `first`.
      const low = mask & -mask;
      for (let first = (mask - 1) & mask; first > 0; first = (first - 1) & mask) {
        if ((first & low) === 0) continue;
        const second = mask ^ first;
        for (const x of made[first].keys()) {
          for (const y of made[second].keys()) {
            const [left, a, right, b] =
              x >= y ? [first, x, second, y] : [second, y, first, x];
            for (const op of OPS) {
              const r = combine(a, op, b);
              if (r !== null && !out.has(r)) out.set(r, { left, a, op, right, b });
            }
          }
        }
      }
    }
    this.made = made;
  }

  /** The smallest subset that makes `target`, the lowest mask among equals,
   * or `null` where nothing does. */
  private subsetFor(target: number): number | null {
    let best: number | null = null;
    for (let mask = 1; mask < this.made.length; mask++) {
      if (!this.made[mask].has(target)) continue;
      if (best === null || bitCount(mask) < bitCount(best)) best = mask;
    }
    return best;
  }

  /** The fewest operations that make `target`, or `null` where none do. */
  fewestOps(target: number): number | null {
    const mask = this.subsetFor(target);
    return mask === null ? null : bitCount(mask) - 1;
  }

  /** Every value that can be made, with the fewest operations each needs. */
  allValues(): Map<number, number> {
    const out = new Map<number, number>();
    for (let mask = 1; mask < this.made.length; mask++) {
      const ops = bitCount(mask) - 1;
      for (const v of this.made[mask].keys()) {
        const known = out.get(v);
        if (known === undefined || ops < known) out.set(v, ops);
      }
    }
    return out;
  }

  /** A calculation of `target` with the fewest operations, or `null`. */
  expression(target: number): Expr | null {
    const mask = this.subsetFor(target);
    return mask === null ? null : this.build(mask, target);
  }

  private build(mask: number, value: number): Expr {
    const how = this.made[mask].get(value);
    if (how === undefined) throw new Error(`numgame: ${value} is not made by ${mask}`);
    if (how === null)
      return { kind: "number", value, place: this.places[31 - Math.clz32(mask)] };
    return {
      kind: "combine",
      value,
      a: this.build(how.left, how.a),
      op: how.op,
      b: this.build(how.right, how.b),
    };
  }
}

/** The place an expression's value ends up in when {@link stepsOf} plays it:
 * a combination's result lands in its larger operand's place, the lower place
 * between equals, as `normalized` in `state.ts` plays every move. */
function placeOf(e: Expr): number {
  return e.kind === "number" ? e.place : landing(e).into;
}

/** A combination's two places, its result's landing place as `into`. `a` is
 * never the smaller operand. */
function landing(e: Expr & { kind: "combine" }): { from: number; into: number } {
  const pa = placeOf(e.a);
  const pb = placeOf(e.b);
  const intoA = e.a.value > e.b.value || pa < pb;
  return intoA ? { from: pb, into: pa } : { from: pa, into: pb };
}

/** The combinations that play `e`, the larger operand's side first. */
export function stepsOf(e: Expr): Step[] {
  if (e.kind === "number") return [];
  return [...stepsOf(e.a), ...stepsOf(e.b), { ...landing(e), op: e.op }];
}

/** The numbers on a board, with their places: what {@link Reach} searches. */
export function reachOf(slots: readonly ({ value: number } | null)[]): Reach {
  const values: number[] = [];
  const places: number[] = [];
  slots.forEach((t, place) => {
    if (t === null) return;
    values.push(t.value);
    places.push(place);
  });
  return new Reach(values, places);
}

/** A shortest calculation of the target from the board, as the search
 * outcome Solve and the hint read. Exhaustive, so it never runs out of reach. */
export function findLine(
  slots: readonly ({ value: number } | null)[],
  target: number,
): SearchOutcome<Step> & { readonly expr?: Expr } {
  const expr = reachOf(slots).expression(target);
  if (expr === null) return { kind: "lost" };
  return { kind: "found", line: stepsOf(expr), expr };
}
