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
  drags the square marks along its row or column, as before. A left press on
  an edge drags segments over every edge the pointer crosses, and a left drag
  that starts on an edge no longer lays square marks.
- **Tracks' two left drags are told apart by the pressed square, not by where
  in it the press lands** (owner, 2026-10-09: a drag from an empty square
  "sometimes" laid track across boundaries, which was a press landing off
  center; "a drag draw should always only repeat the same action"). From a
  square that carries no track a left drag lays square marks; from one that
  carries track it lays segments across the edges it crosses, or takes them
  away when the first edge has one. This replaces the press-position split
  above. Dragging from a marked square no longer clears a run of square
  marks; the owner accepted that, since Undo does it.
- **Tracks' win flash runs from A to B** (owner, 2026-10-09). It already
  traveled the track, in half a second with a band half the track long, so
  the whole track lit at once. It is a highlight three squares long at one
  pace on every board, in the theme's yellow.
- **Tracks' right button is the square's** (owner, 2026-10-09, playing the
  first part: a run of crosses on edges "actually isn't useful at all", and a
  cross on an edge is "significantly less useful" than one on a square). A
  right-drag crosses squares wherever it starts. A right-click crosses an
  edge only on the strip along it, an eighth of a tile either side and never
  under four pixels; anywhere else in the square it crosses the square.
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
