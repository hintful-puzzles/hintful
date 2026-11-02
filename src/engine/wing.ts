/**
 * The wing, as a help page teaches it: every value one open unit can take,
 * each read off a unit that sees it and is down to that value and one other,
 * `x`. Whichever value the middle unit takes, the unit it sees there is left
 * `x` alone, so a unit that sees every such end cannot be `x`, provided it
 * sees the middle unit too where the middle could be `x` itself.
 *
 * Its two shapes are Sudoku's XY-wing (a two-value middle, two ends) and
 * XYZ-wing (a three-value middle that could be `x`, which the target must
 * see). Each way is one value placed and the dots it touches read, nothing
 * propagated further, so every step of it is a mark the player can make. The
 * technique itself is stated in a description: the Latin library's `wing`,
 * and Map's `weigh` over the regions a region borders.
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
