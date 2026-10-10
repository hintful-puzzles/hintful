# claim-an-input-that-changed-the-ui

**Status: filed 2026-10-10 by the session that built
`drop-a-move-that-changes-nothing`, whose guard found the defect. What it
says of the code was true that day; re-check before relying on it.**

## Why

Seven games answer "nothing happened" to an input that changed what is
painted. Found by `inputAnswers` in `src/engine/testing/input-probe.ts`, over
the default deal of every registered game through a real `Midend`; the count
is of such inputs among those the sweep sent.

| Game | The input | Count |
| --- | --- | --- |
| Clusters | a drag, after a press that hid a shown cursor | 5 |
| Crossing | a number or erase key that puts the held number down | 6 |
| Group | a drag along the legend, which changes `ui.drag` | 103 |
| Netslide | a press that hides a shown cursor | 56 |
| Samegame | a press that hides a shown cursor; Enter or Space that shows it | 69 |
| Signpost | a press that hides a shown cursor and ends a keyboard drag | 1 |
| Tracks | a press that hides a shown cursor | 46 |

Untangle's first arrow was the eighth and is fixed.

What a player sees is right since `drop-a-move-that-changes-nothing`: the
midend repaints a `Ui` it finds changed under that answer (`ts-engine`, "A
`Ui` changed under "nothing happened" is painted"). What is left is the
answer. `Midend.processInput` reports such an input as not claimed, so:

- a key falls through to the app, which reads "not claimed" as leave to use
  the key for a shortcut (`src/puzzle/shortcuts.ts`): Samegame's Space and
  Crossing's digits are offered to the app after the game acted on them;
- a press is released at once and its drags never reach the game
  (`src/puzzle/components/view-interactive.ts`);
- no transition is announced, so a mistake overlay or a hint that a UI-only
  input would put away stays.

Whether any of the three is wrong on screen in one of the seven was not
checked in the running app.

`src/engine/input-answers.test.ts` names the seven
(`ANSWERS_NOTHING_AND_CHANGES_THE_FRAME`), asserted exact, so an eighth
fails. This change empties that list.

## The question to settle first

Can the midend answer for the game, so that no game has this again?

- **It could claim every input after which the `Ui` differs.** It already
  holds the comparison. But a `Ui` holds more than is painted: a target-verb
  game parks its hidden cursor where a declined press fell
  (`interpretTargetVerbs` in `src/engine/target-verb.ts`), hundreds of
  presses a game in the sweep, in Flood, Light Up, Magnets, Range, Subsets,
  Unruly and others. Claiming those changes which presses the view tracks.
  Measure what that does before choosing it, and consider whether the parked
  cursor belongs in the `Ui` at all.
- **It could claim only where the frame differs.** That costs a frame painted
  twice an input, which the guard does and the app should not.
- **Or the seven are each fixed where they answer**, one arm a game, with the
  guard holding the rule for the next port. Seven fixes of one shape is what
  `docs/work-management.md` § "New work is the engine's" says to refuse while
  the first two are open.

Four of the seven are one sentence: a press that hides the cursor and then
declines. That hide is `pressTarget`'s in a declaring game and the game's own
elsewhere; a shared "a press hides the cursor" that answers for it may be the
whole of those four.

## What Changes

- Decided in `design.md` by the measurement above: the midend's answer, or
  the shared arm, or the seven.
- `ANSWERS_NOTHING_AND_CHANGES_THE_FRAME` is empty and stays asserted.
- `ts-engine`, "A `Ui` changed under "nothing happened" is painted", says
  what the engine then does.

## Capabilities

### Modified Capabilities

`ts-engine`, `engine-input`.

## Impact

- `src/engine/midend.ts` or `src/engine/target-verb.ts`, the guard, and the
  games the decision leaves to fix.
