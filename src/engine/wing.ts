/**
 * The wing: every value one open unit can take, each read off a unit that
 * sees it and is down to that value and one other, `x`. Whichever value the
 * middle unit takes, the unit it sees there is left `x` alone, so a unit that
 * sees every such end cannot be `x`, provided it sees the middle unit too
 * where the middle could be `x` itself.
 *
 * Its two shapes are Sudoku's XY-wing (a two-value middle, two ends) and
 * XYZ-wing (a three-value middle that could be `x`, which the target must
 * see). Each way is one value placed and the dots it touches read, nothing
 * propagated further, so every step of it is a mark the player can make.
 *
 * What a unit is and what "sees" means is the game's: a Map region and the
 * regions it borders, a Latin cell and the cells in its row or column.
 */

/** Where the help page of a game whose hint can be a wing (`"wing"` among
 * its `hintRungs`) writes {@link wingHelp}, among the ideas its hint teaches:
 * `{{wing}}`, or `{{wing:square}}` where the game calls a cell a square. */
export const WING_PLACEHOLDER = /\{\{wing(?::([a-z]+))?\}\}/g;

/** What a help page says of the wing, in words every game's cells and values
 * fit: "can't repeat a value with" is a row and column in one game and a
 * block too in another. `cell` is what the game calls one. */
export function wingHelp(cell = "cell"): string {
  return (
    "On the hardest boards that need no guessing, a step may be a **wing**. " +
    `Take a ${cell} whose pencil marks are down to two values, say *a* or ` +
    `*b*, and two ${cell}s it can't repeat a value with, both outlined: one ` +
    "marked *a* and *c*, the other *b* and *c*. Whatever goes in the middle " +
    `${cell}, one of the outlined ${cell}s must have *c*, so a ${cell} that ` +
    "can't repeat a value with either of them can't be *c*. If the middle " +
    `${cell} could be *c* as well, the same holds for a ${cell} that can't ` +
    `repeat a value with the middle ${cell} either.`
  );
}

/** What the wing reads. Units are numbered `0..size−1`; a value is a bit of
 * `mask`. "Sees" is symmetric and irreflexive, and says two units cannot hold
 * the same value. */
export interface WingBoard {
  readonly size: number;
  /** How many values the wing weighs, bits `0..values−1`. A mask may carry
   * higher bits for a value that does not exclude what sees it, Salad's empty
   * square; a unit that could still be one is never a middle. */
  readonly values: number;
  /** Whether the unit is still to be filled; a filled unit is never a middle,
   * an end or a target. */
  open(unit: number): boolean;
  /** The values the unit may still take, as a bitmask. */
  mask(unit: number): number;
  /** Every unit that sees `unit`, each once. */
  seers(unit: number): Iterable<number>;
  sees(a: number, b: number): boolean;
}

/**
 * Every wing on the board, reported as `fire(middle, x, ends, target)`, with
 * `ends` holding one unit per value of `middle` other than `x`, each seeing
 * both `middle` and `target`. A target is reported once per `(middle, x)`,
 * with the first ends found, in unit order.
 */
export function weighWing(
  b: WingBoard,
  fire: (middle: number, x: number, ends: readonly number[], target: number) => void,
): void {
  for (let m = 0; m < b.size; m++) {
    if (!b.open(m)) continue;
    const mm = b.mask(m);
    if (mm >> b.values) continue;
    // An end is down to two values, so only those units are candidates, and
    // only a value one of them holds can be `x`.
    const around: number[] = [];
    let held = 0;
    for (const k of b.seers(m)) {
      const km = b.mask(k);
      if (!b.open(k) || popcount(km) !== 2) continue;
      around.push(k);
      held |= km;
    }
    for (let x = 0; x < b.values; x++) {
      if (!(held & (1 << x))) continue;
      // Per value of `middle` but `x`, the units that value leaves only `x`.
      const leftX: number[][] = [];
      for (let c = 0; c < b.values; c++)
        if (c !== x && mm & (1 << c)) {
          const pair = (1 << c) | (1 << x);
          leftX.push(around.filter((k) => b.mask(k) === pair));
        }
      if (leftX.length === 0 || leftX.some((ks) => ks.length === 0)) continue;
      const self = (mm & (1 << x)) !== 0;

      const seen = new Set<number>();
      for (const k0 of leftX[0])
        for (const t of b.seers(k0)) {
          if (t === m || seen.has(t)) continue;
          seen.add(t);
          if (!b.open(t) || !(b.mask(t) & (1 << x))) continue;
          if (self && !b.sees(t, m)) continue;
          const ends: number[] = [];
          for (const ks of leftX) {
            const k = ks.find((k) => k !== t && b.sees(k, t));
            if (k === undefined) break;
            ends.push(k);
          }
          if (ends.length === leftX.length) fire(m, x, ends, t);
        }
    }
  }
}

function popcount(v: number): number {
  let c = 0;
  for (let w = v; w; w &= w - 1) c++;
  return c;
}
