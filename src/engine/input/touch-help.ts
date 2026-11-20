/**
 * The sentence that opens every game page's Controls, saying what a click and
 * a typed key are on a touch screen. The page's own words are written for a
 * mouse and keyboard, and a player on a phone reads them first.
 */

/** Where the renderer puts the sentence, as the first paragraph of every
 * page's Controls section. */
export const TOUCH_PLACEHOLDER = "{{touch}}";

/** What of a game the sentence says. */
interface TouchFacts {
  readonly ignoresSecondaryButton?: boolean;
  readonly requestKeys?: unknown;
}

/** The sentence for `game`: a long press only where a right-click means
 * something, and the keypad only where the game has one. */
export function touchHelp(game: TouchFacts): string {
  const press = game.ignoresSecondaryButton
    ? "On a touch screen, a tap does what a click does."
    : "On a touch screen, a tap does what a click does, and a long press what " +
      "a right-click does ([more ways to right-click](features#right-mouse)).";
  const keys =
    game.requestKeys === undefined
      ? ""
      : " A key the puzzle's controls show as a button can be pressed there " +
        "instead of on a keyboard.";
  return `*${press}${keys}*`;
}
