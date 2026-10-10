# Design

Decided and built 2026-10-11. Every figure here was measured that day, on the
default deal of each of the 57 registered games through a real `Midend`, by
`inputAnswers` in `src/engine/testing/input-probe.ts` with a tally added for
the measurement and taken out again. Re-measure before relying on one.

## The decision

**The midend answers for the game.** Where `interpretMove` answers "nothing
happened" and what the `Ui` shows has changed, the input is a UI-only change
whatever the game said: claimed, announced and painted, as for `UI_UPDATE`.
No game was changed to get there, and none can have the defect again.

"What the `Ui` shows" is `sameShown` in `src/engine/same-value.ts`: the
comparison the midend already made, except that a part hidden before and
after (`visible: false` in both) is the same wherever it sits.

## What was measured

Every input the game answered `null` to and left its `Ui` changed, by the
field that changed and by whether the frame did:

| What changed | Games | Inputs | Frame |
| --- | --- | --- | --- |
| A shown cursor hidden, or a hidden one shown | Clusters, Netslide, Samegame, Signpost, Tracks | 177 | changed |
| A held number put down | Crossing | 6 | changed |
| A legend drag moved | Group | 103 | changed |
| A hidden cursor parked on a declined press | Black Box, Dominosa, Flood, Light Up, Magnets, Mines, Range, Subsets, Unruly | 3,825 | same |
| A hidden cursor carried by a declined drag | Clusters | 1,561 | same |
| A press in flight noted or dropped | Galaxies, Sticks, Tracks | 2,658 | same |
| The cursor marked as the keyboard's by an arrow at the wall | Keen, Solo, Towers, Unequal | 44 | same |
| A drag's fill reset by a press off the grid | Clusters | 35 | same |

The first three rows are the proposal's seven. The rest is what a claim on
any `Ui` change would have swept in.

## Why not the other two

- **Claim every input after which the `Ui` differs.** 5,386 of the inputs it
  would newly claim are a hidden cursor moving. A press on a square that
  takes nothing would be tracked, would put a mistake overlay away and would
  stop an auto-played hint the first time, and do none of that the second
  time, when the cursor is already parked there. The claim would turn on
  something the player cannot see.
- **Claim where the frame differs.** Exact, and it paints two frames for
  every input a game declines. The guard does that; the app should not.
- **Fix the seven where they answer.** Seven edits of one shape and a guard
  to hold the eighth port to it, which
  `docs/work-management.md` § "New work is the engine's" refuses while the
  engine can do it.
- **Take the parked cursor out of the `Ui`**, as the proposal asked to be
  considered. It is where the keyboard carries on from, so it is where the
  player is, and a canceled press has to put it back: it belongs there. What
  it is not is shown, and the comparison now says that.

## What the claim leaves that the frame does not

`sameShown` reads "hidden" off one shape, so 2,737 inputs are claimed with
the frame as it was. None is a press or a key the app wanted:

- Galaxies, Sticks and Tracks: a drag or a release after a press the game
  had already claimed. The view sends those regardless and reads no answer.
- Keen, Solo, Towers, Unequal: an arrow at the wall. Every other arrow is
  claimed, and no arrow is a shortcut.
- Clusters: a press off the grid, the first after a drag. Fixed where it
  was: the release ends the drag's fill, so that press has nothing to reset.

## `UI_UPDATE` stays

It is no longer needed to report a change the `Ui` shows, and is still the
only way to claim an input that changed nothing shown: a drag over squares
that take nothing, a key the game owns on a square it does nothing to. The
games that return it for a shown change are right and were left alone.

## A hint's gesture

`playHintGesture` plays a step as the view would, and tracked a press only
when the game answered it. It asks the same question now
(`changedWhatShows`), so a drag from a press the midend claimed is played.

## The guard

`src/engine/input-answers.test.ts`, over every registered game:

- no input that changed the frame is left unclaimed. This is what holds
  `sameShown` to what each game paints: a game that drew from a hidden
  part's position would fail it by name;
- no `Ui` changed under an unclaimed input is left unpainted, seen or not;
- the seven still answer "nothing happened" to an input that changes the
  frame, pinned as positives, so the sweep cannot pass by reaching none.

Each was seen to fail. With the claim switched off the first names exactly
the seven and the third finds none of them. With a comparison that calls a
part the same when it is hidden on either side, the first names Clusters,
Netslide, Samegame and Tracks.

## In the running app

Chrome, 2026-10-11, a new game of each.

- Netslide, Tracks, Samegame, Signpost: an arrow shows the cursor; a press
  on a square or a margin that takes nothing hides it, and the canvas holds
  the pointer's capture, which is the view tracking the press.
- Samegame: Space and Enter raise no `puzzle-key-unhandled`.
- Crossing: with the cursor on a wall and a number held, `3` puts the number
  down and raises no `puzzle-key-unhandled`; `3` again, with nothing to put
  down, raises it.
- Group: a drag along the legend moves the highlighted column with the
  pointer, and the release leaves the columns swapped.
- Clusters' row cannot be reached in the app: its drag follows a press off
  the grid, which changes nothing shown and is not tracked.

What the unclaimed answer cost before, in the app: nothing a player would
have seen in the keys, since neither Space nor a digit is a shortcut
(`src/puzzle/shortcuts.ts`: the bare letters are `u`, `r`, `n`, `h`, `p`).
A press was released where it fell, which loses nothing in these four games
because none of them drags from such a press. A mistake overlay stayed up
through a press that hid the cursor. This was read from the code and from
the guard run with the claim off; the build before this change was not
driven in the browser.

## Risks

- A game holds a part with `visible: false` that it paints from all the
  same → the first half of the guard, which is why the repaint still uses
  the whole comparison.
- A game names its flag something else (`shown`, `cursorVisible`) and moves
  the part while it is off → the input is claimed, the first time, as under
  "claim every difference". The engine-input guard that fails a cursor held
  under another field's name keeps the cursor to the one shape.
