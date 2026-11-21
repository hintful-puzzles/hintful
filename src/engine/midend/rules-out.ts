/**
 * The words and key of the preference the engine offers every game that
 * declares what a placement rules out (`Game.rulesOut`): the key the app
 * stores the choice under, and the one sentence each such game's help page
 * says of it, so no page words it for itself.
 */

/** The preference's key. Star Battle's from before the engine owned it, so a
 * player's saved choice still reads. */
export const RULES_OUT_PREF = "auto-cross";

/** Where the help page of a game that declares `rulesOut` writes
 * {@link rulesOutHelp}, in its Controls section. */
export const RULES_OUT_PLACEHOLDER = "{{rules-out}}";

/** What a help page says of the preference, given the game's words for it. */
export function rulesOutHelp(name: string): string {
  return (
    `With **${name}** turned on in the preferences, those marks are made for ` +
    "you as you place: one Undo takes back the placement and the marks " +
    "together, and taking the placement away later leaves the marks for you " +
    "to clear."
  );
}
