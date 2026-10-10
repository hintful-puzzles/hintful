# drop-a-move-that-changes-nothing

**Status: filed 2026-10-10 by the session that archived
`state-once-what-several-games-each-state`, whose work found the defect, and
on the owner's word the same day for how to fix it. What it says of the code
was true that day; re-check before relying on it.**

## Why

Seven games record a move that leaves the board exactly as it was. The player
sees nothing happen, the move counter goes up by one, and Undo then offers a
step that shows no change. Each was reproduced on 2026-10-10 through a real
`Midend`, from the default deal with a fresh `Ui`; the last input named adds
one move and leaves both the state and the painted frame as they were:

| Game | Inputs | The move recorded |
| --- | --- | --- |
| ABCD | the Marks key, Down, Backspace | `enter` at (0,1) with `letter: null` |
| Mathrax | the Marks key, a left click on an empty square that is not a given, Backspace | `set` with `n: 0, pencil: true` |
| Loopy | Right, Backspace | `set` of that edge to undecided |
| Pearl | a left press in a square, a drag into the square below, a drag back, release | four `flip` ops, each segment flipped twice |
| Galaxies | a right click on an undecided tile, a right click at the same point | `assoc` of the tile to the dot it has |
| Untangle | Enter, Enter, Enter | `place` of the vertex where it is |
| Group | a left click on an empty cell, Backspace; or a click, `a`, a click, `a` | `set` with `n: 0`; a second `set` of the element held |

The archived change's `rules/no-op-input.md`, § "seven games make a move that
leaves the board as it was", has the site in each game. ABCD and Pearl
contradict a requirement of their own spec.

The seven are what one sweep reached, not a census: it drove a few thousand
inputs a game and hardly exercised Pegs and Slide. Nothing in the engine and
no guard holds the rule. The midend records every move it is handed
(`Midend.commitMove` calls `record` with no test of the state), so the rule
is each game's own code, about twenty-five games' specs each state it for
themselves, and `docs/games/mechanics.md` § on `interpretMove` tells a porter
to suppress such a move locally and never by comparing states.

## The mirror of it, in one game

The same sweep can ask the opposite question, and one game is known to fail
it: an input answered "nothing happened" that did change the `Ui`. In
Untangle, on any fresh deal, the first Up arrow sets the cursor on vertex 0
and returns `null` (`src/games/untangle/index.ts`, the arrow arm: it sets
`ui.cursorPoint` before it knows a vertex lies that way), so no frame is
painted and the cursor does not appear, even after a second Up. The next
Enter then picks the vertex up where on a fresh board it would only show the
cursor, and Down moves the vertex. Seen in Chrome, 2026-10-10. The guard
behind `engine-input`, "One arrow press reveals the cursor and moves it",
walks only cursors of the shared grid shape, so it never asked Untangle.

This is fixed here because the guard is the same sweep: the one line in
Untangle, and the question asked of every game.

**As built:** the sweep found seven more games of this kind, so the midend
repaints a `Ui` changed under that answer, for every game (`design.md`, § "The
mirror").

## The decision

The owner, 2026-10-10, offered a guard with a fix in each of the seven games,
or the midend dropping the move: **the midend drops it.** No game is edited
for it but Untangle, whose put-down moved a vertex by less than a pixel
(`design.md`, decision 2), and no game, ported or yet to be, can have the defect again
(`docs/work-management.md` § "New work is the engine's"). This reverses the
guide's "never by comparing states", whose reason was that upstream never
compared; that reason does not outweigh seven defects and a rule nothing
holds.

## What Changes

- The midend does not record a move whose resulting board equals the board
  before it. The input is answered as a change of `Ui` alone: a redraw, no
  history entry, no step of Undo.
- How the midend tells that two boards are equal is settled in `design.md`
  before anything is built, with what each choice costs measured.
- A cross-game guard in the shared input probe asks, of every registered
  game, whether any input made a move that left the board as it was, and
  finds none.
- The same guard asks whether any input answered "nothing happened" changed
  the `Ui` or the frame, and Untangle's arrow arm answers `UI_UPDATE` where
  it shows the cursor.
- The rule is stated once, in `ts-engine`, and the games' own sentences of it
  are cut or shortened to what is theirs
  (`state-once-what-several-games-each-state` recorded it as not shared, with
  the list of who states it).
- `docs/games/mechanics.md` says what a porter now does: return a move when
  the input asks for one, and leave "did it change anything" to the engine.
- A game's own test for a move that changes nothing may stay where it is. It
  is no longer needed for the player's sake, and removing it from every game
  is not this change.
- What a player sees: an input that changed nothing no longer costs a step of
  Undo. Nothing else.

## Capabilities

### Modified Capabilities

`ts-engine`, `engine-input`, and each game whose copy of the rule goes.

## Impact

- `src/engine/midend.ts`, `src/engine/testing/input-probe.ts` and a guard
  beside the collection's other input guards.
- `openspec/specs/**`, `docs/games/mechanics.md`.
- A save written before this change may hold such a move. It still loads
  (`design.md`).
