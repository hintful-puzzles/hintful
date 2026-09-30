# audit-input-affordances

Owner-requested; the second of three parts split out of
`afford-every-hint-action`.

## Why

The owner's rule (2026-09-30) is that every action is reachable by the keyboard
alone and by a pointer alone, with no key held. `one-pointer-for-mouse-and-touch`
made a finger and a mouse the same input, so "touch alone" follows from "mouse
alone". What nobody had was the table: for each game, each action, and how
each input reaches it. Without it a gap is found the way Net's lock was, in
play.

The first plan was a behavioral walk kept as a standing cross-game guard. The
walk was built and run once (`audit.md`), and the owner then asked for more
than a guard (2026-09-30): *"make it so that it just becomes impossible for a
game to use an unaccounted-for action, so that our regular type checking and
tests catch it."* A sweep finds a gap after it is written, and this one costs
hours; so the measurement became the inventory, and the rule moved into the
contract where it can be.

## What changes

- **A key-only verb declares its pointer route.** `KeyOnlyVerb` gains a
  required `pointer: PointerRoute` (`repeat` a button, `cycle` a button through
  the result, or press a button in `notes` mode), so a verb no button applies
  cannot be declared without saying how the pointer reaches it. The Controls
  paragraph states the route, and `target-verb.test.ts` holds it to the key's
  effect, comparing boards as painted. Net, Slant, Unruly, Loopy and Subsets
  declare theirs.
- **The gaps the inventory found are closed**, each in the arm of the game's
  own where it hid:
  - **Net**: a Source keypad key that arms a tap to move where the network is
    lit from, a Jumble keypad key, and a drag in the margin of a wrapping grid
    to scroll it (the owner chose each).
  - **Ascent**: a number keypad, so a touch player can write any number in any
    square, which its hint asks for.
  - **Group**: Shift+arrow reorders the table and `|` and `-` toggle its
    subgroup lines, the keyboard's routes to dragging and clicking headings.
- **Help**: Net, Ascent and Group describe the new routes; Loopy loses a
  sentence about a touch cycle that no longer exists.
- **`docs/games/input.md`** states both directions of the rule, the structural
  guarantee inside the model, and that an arm of a game's own is where it does
  not reach.

## Not in this change

A structural guarantee for arms outside the target-verb model. The drag games
join the model through `declare-drag-games-click-half`, and hint steps get
their structural guarantee in `afford-every-hint-action`; both are open.

## Impact

Player-visible: Net's keypad gains Source and Jumble and a wrapping grid
scrolls by dragging its margin; Ascent shows a number keypad; Group gains four
keys; the Controls paragraphs of the five `keyOnly` games name the pointer
route. No save or ID format changes: Net's new `Ui` fields are not encoded.

## Hints to pull in

None.
