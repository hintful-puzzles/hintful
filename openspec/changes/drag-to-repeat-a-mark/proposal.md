# drag-to-repeat-a-mark

Owner, 2026-10-08: *"Wherever it makes any sense to apply the same mark action
multiple times, and where drag isn't already taken, please consistently allow
a drag click to mark across multiple squares. Two examples are: marking tracks
on bed tiles in Tracks (currently we can only drag-lay the beds, but not the
tracks) and marking boundaries in Galaxies, but I'm sure that there are more
examples across the catalog."*

## Why

A survey of every game's `interpretMove` (2026-10-08) found eight games where
a drag already repeats a mark (Pattern, Mosaic, Bricks, Clusters, Boats,
Sticks, Ascent, and Tracks for its squares) and about twenty marks where it
does not:

- cell marks: Light Up, Range, Singles, Unruly, Slant, Magnets, Subsets,
  Black Box (balls and locks), Mines (flags);
- edge marks: Palisade, Separate, Loopy, Dominosa, Pearl (crosses), Tracks
  (segments and crosses), Galaxies (lines);
- smaller ones: Mosaic's drag lays and cannot clear, the clue-done marks of
  Towers, Undead, Magnets and Unequal, and the notes-mode marks of Net, Slant
  and Loopy.

Eleven of those games declare their clicks as `targetVerbs` and have no drag
of their own, so one drag in the model serves them.

## What Changes

The owner's answers, 2026-10-08, to the design put to them:

- **One shared drag, in the target-verb model** (`target-verb.ts`, the sweep).
  A game declares what a target holds; the model repeats the press.
- **A drag paints and does not toggle.** The press does what a click does, and
  each further target that held what the pressed one held gets the same.
- **One drag is one step of Undo.** The midend joins a drag's later moves to
  its first. The join is kept in memory and not in a save, so the save format
  does not change, and a reloaded game undoes such a drag a move at a time.
- **Tracks: where the press lands decides.** A press in the middle of a square
  drags the square marks along its row or column, as before. A press on an
  edge drags segments (or crosses) over every edge the pointer crosses.
  A drag that starts on an edge no longer lays square marks.
- **Galaxies: the same split.** A left press on an edge's line drags lines; a
  press on a dot, an arrow or the inside of a tile is the association drag.
  An association drag started within a fifth of a tile of a line is now a
  line drag.
- **Left alone**: Rect, Bridges, Spokes, Map and Rome, where the drag is the
  game's own gesture, and Light Up's bulbs, since a row of bulbs is never
  right.
- **The smaller ones are included.**

Built in two parts: the model, the midend, Tracks and Galaxies first, pushed
for the owner to try; then the rest of the catalog.

Nothing a player has saved or shared changes. A click does what it did.

## Capabilities

### Modified Capabilities

- `engine-input`: a drag on from a press repeats the press.
- `tracks`: a drag from an edge.
- `galaxies`: a drag from a line.

## Acceptance

The owner's, who asked for it by name and said to carry on without waiting.
