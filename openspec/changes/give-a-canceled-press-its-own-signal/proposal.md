# give-a-canceled-press-its-own-signal

**Status: filed 2026-10-09 by the session that archived
`2026-10-09-triage-what-the-spec-rewrite-found-in-the-code`**, as the same
defect that change fixed in two games, found again in the shared layer
(`docs/work-management.md` § "The backlog is being drained").

## Why

When the browser cancels a pointer (a touch taken over by a scroll or a
system gesture, a long press interrupted, Escape during a press),
`cancelPointerTracking` in `src/puzzle/components/view-interactive.ts` tells
the game about it as a drag to (-100, -100) followed by a release there. A
game cannot tell that from a player dragging off the top left of the board.

The triage reproduced two results of this in the running app (2026-10-09) and
fixed them in the games:

- Galaxies: a canceled press on an arrowed tile removed the arrow and its
  partner.
- Bridges: a canceled press on an island drew a bridge to its neighbor above
  or to its left.

Both fixes cover only a press that has not yet moved. A cancel that arrives
after the drag has moved still commits in both, because by then the game has
no way to know.

A survey written during that work (a press, then the synthesized drag and
release, compared with a plain click on the same board, over every game)
flagged ten more games where a cancel changes the board in a way no click
would: Bridges, Inertia, Pattern, Rome, Signpost, Sixteen, Spokes, Sticks,
Tracks and Untangle. Two were confirmed by reading the code, and none but
Bridges was seen in the app:

- Untangle moves the pressed point to the top left corner and commits it.
- Pattern paints from the pressed cell to the top or left edge.

The survey is weak on cases that depend on the board's state (it found the
Galaxies defect once in 432 presses) and cannot see state left in a `Ui`, so
a game it did not flag is not cleared.

## What Changes

- A cancel reaches a game as a cancel, not as a drag and a release: the
  gesture ends, nothing is committed, and whatever the press put in the `Ui`
  (a held piece, a drag preview, an armed mode) is put back as it was.
- The engine owns that where it can, so that a game makes no decision about
  it: a game whose press only writes drag state gets the reset for free, and
  a game that must undo something of its own says what.
- A cross-game guard presses, cancels, and requires the board and the `Ui` to
  be what they were before the press, for every game, at a press that has
  moved as well as one that has not.
- The two game-side fixes of the triage are removed where the shared signal
  makes them dead.

Dropping only the synthesized drag is not the fix: a game that commits its
last previewed target on release would then commit that.

## Capabilities

### Modified Capabilities

- `engine-input`: what a canceled press is, and what a game may do with it.
- The games whose cancel behavior changes carry a delta where their
  requirement speaks of it (`galaxies` "A press that ends far from where it
  began commits nothing", `bridges` "A canceled press on an island draws no
  bridge").

## Impact

- `src/puzzle/components/view-interactive.ts`, the midend's input path, and
  the `Game` contract if the signal is a new hook or button code.
- No save or game-ID format: a canceled gesture commits no move.
- A player sees a canceled touch do nothing, in every game.
