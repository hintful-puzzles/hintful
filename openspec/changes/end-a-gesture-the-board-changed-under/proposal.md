# end-a-gesture-the-board-changed-under

**Status: filed 2026-10-10 by the session that archived
`state-once-what-several-games-each-state`, whose review of `engine-input`
suspected the defect and then ran it. What it says of the code was true that
day; re-check before relying on it.**

## Why

A drag that is under way when the board changes carries on against a board
it did not start on. In the running app, in Chrome, 2026-10-10, in each of
Sixteen, Spokes, Map and Galaxies: make a move, press and drag, press Cmd+Z
with the pointer still down, release. Every time the drag's preview stayed
painted over the undone board, the release made its move, and Redo was lost.

- **Sixteen**: the row stays drawn slid, and the release slides it.
- **Spokes**: the hubs stay highlighted, and the release draws the undone
  line again.
- **Map**: the color stays under the pointer, and the release paints a color
  picked up from a region that is now blank, a move that board cannot reach
  by play.
- **Galaxies**: the arrow stays, and the release places an arrow lifted from
  a tile that no longer has one.

A player reaches it with the keyboard's Undo while the mouse is down, or a
second finger on the Undo button, or a hint or Solve asked for mid-drag.
Nothing crashes.

`engine-input`, "The engine cancels a drag the board changed under", is true
as written and covers less than its title: `Midend.stateReplaced` ends every
`GridDrag` in the `Ui` (`cancelDrags`) and then calls the game's
`changedState`. A drag a game holds in fields of its own is ended only if
that game wrote a `changedState` that clears it. Driven through a real
`Midend` over all 57 games (press, drag, a board change under it, release):

- **A drag in the game's own fields, no `changedState`, and the release
  commits**: Sixteen, Galaxies, Spokes, Map, Bricks, Clusters, Pearl, Rome,
  Sticks.
- **A `changedState` that does not clear the drag**: Signpost (it clears only
  on becoming solved), Group, Inertia.
- **The engine's own sweep is not ended either**: `stateReplaced` calls only
  `cancelDrags`, and a declared sweep continued after an undo made moves in
  Tracks and in Galaxies' wall drag.
- Clean, as controls: Tents, Boats, Bridges, Rect, Pattern, Pegs.
- Not measured: a gesture whose press already makes a move (Loopy, Slant,
  Mines and the like), which the sweep skipped.

So the rule holds for a game that happens to use `GridDrag` or happened to
write the clearing, and a dozen games did neither. It is the same finding in
twelve games and in the engine's sweep: one engine change, and no game's.

## What Changes

- The midend ends the pointer gesture in flight whenever the board is
  replaced under it, for every game, whatever the game holds the gesture in:
  the rest of that gesture's drags and its release reach no game, and the
  `Ui` is left as it would be had the press been canceled. The midend already
  knows a press is open and already has a cancel that takes a press back
  (`cancelPress`; `engine-input`, "A canceled press leaves the game as it was
  before the press"). `design.md` settles how the two meet.
- A declared sweep is ended the same way.
- A cross-game guard: over every registered game, a gesture continued after
  the board changed under it makes no move and leaves no preview in the
  frame.
- `engine-input`, "The engine cancels a drag the board changed under", states
  the rule for every gesture.
- A game's own clearing of a drag in `changedState` is no longer needed for
  this. Removing those is not this change.
- What a player sees: Undo, Redo, a hint or Solve during a drag ends the
  drag. Nothing else.

## Capabilities

### Modified Capabilities

`engine-input`.

## Impact

- `src/engine/midend.ts`, `src/engine/testing/input-probe.ts`, a guard beside
  the collection's other input guards, `docs/games/input.md`.
