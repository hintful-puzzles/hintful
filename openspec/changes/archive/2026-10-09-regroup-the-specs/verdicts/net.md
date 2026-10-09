# Verdicts: net

## note The cut of "Net gives no hint while a lock or note is wrong" stands

The requirement is gone from `net` and stays gone. `engine-hints`, "The midend
SHALL refuse a hint on a finished or wrong board before asking the game",
covers Net with no departure: Net implements `findMistakes` ("Net flags wrong
locks and notes"), so the midend refuses before `netHint` is asked, and
"The midend's two refusals are not a game's to give" stops the game writing
the refusal at all. Searched `src/games/net/` for `FIX_MISTAKES`: nothing. The
brief's "when a hint refuses stays" is met by the rule staying where the code
that keeps it lives.

## keep `net`: No-op inputs are suppressed locally

It says what a control does, which stays: a rotating click on the gutter
between tiles makes no move (`src/games/net/index.ts`, the hit test's gutter
case), and a turn that undoes the one before it is still its own undo entry,
which is a choice a session merging "redundant" moves would get wrong. The
locked-tile case repeats "Tiles rotate and lock" in one clause and costs
nothing.

## cut `net`: Net offers one wrapping preset

collection: `engine-params`, "A checkbox rule modifier has one line of the menu", gives the single wrapping board (Net declares wrapping with `modifierItem`, a checkbox, in `src/games/net/index.ts`, and is in no per-size ledger), and `engine-params`, "Every default and preset draws no wider than tall", gives the 13×11 stood upright. Both rules were decided for every game with the owner (`openspec/changes/archive/2026-10-05-review-preset-counts-across-the-catalog/proposal.md`, "A rule modifier has one line"; its `menus.md` row for Net gives that rule as the reason). What is left, which sizes, is the `PRESETS` table.

## reword `net`: A hint's lock is one journey of the turn and the lock

The sentence "Every step's moves SHALL be ones the declared verbs make" goes.
It is false of a note step, whose move is built in `hint.ts` and made by the
notes-mode tap, which is not one of `targetVerbs`; and what it means to
promise, that the pointer can make every step, is `engine-hints`, "A hint step
is played by the pointer gesture that makes it", held for Net by the gesture
walk. The journey rule is Net's own and stays.

### Requirement: A hint's lock is one journey of the turn and the lock

A lock step of Net's hint whose tile must turn first SHALL be one journey of
the turn and the lock.

#### Scenario: A lock that needs a turn

- **WHEN** the hint locks a tile that is not yet turned the one way that fits
- **THEN** the plan holds a rotation of that tile and then its lock, the lock
  continuing the rotation's step

## edit `net`: Tiles rotate and lock

The requirement lists the controls and leaves out two that exist: `A` turns
the tile under the cursor anticlockwise and `D` clockwise (`targetVerbs` in
`src/games/net/index.ts`, `letterKey("A")` and `letterKey("D")`, either case).
What a key does stays in the spec, so the list is completed.

from: Left-click SHALL rotate a tile anticlockwise, right-click clockwise, and `f`
to: Left-click or `a` SHALL rotate a tile anticlockwise, right-click or `d` clockwise, and `f`

## note `net` has no requirement for its description format

The prune found none to keep and this pass may not add one. The format is in
`parseWireDesc` (shared with Netslide, whose spec does state it in "Netslide
descriptions encode wires and barriers"): row-major, one hexadecimal digit a
tile giving its wire mask, each optionally followed by `v` for a barrier to
its right and `h` for one below; a board that does not wrap is walled round
its border, which the description does not write. A description format is a
promise to saved games and shared links, so a follow-up should add the
requirement to `net`.
