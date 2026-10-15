## MODIFIED Requirements

### Requirement: A per-cell overlay reaches the render cache through the shared sidecar

A per-cell overlay a game hands its cell painter beside the tile value, the
hint overlay and the mistake overlay alike, SHALL reach the render cache
through the shared overlay sidecar (`engine/overlay-sidecar.ts`) and not
through a per-game re-derivation of the repack, stale and commit steps. An
overlay folded into the tile value is in the cache key already and needs no
sidecar.

#### Scenario: A mistake overlay reaches the cache the same way the hint overlay does

- **WHEN** a game paints a per-cell mistake overlay (the `findMistakes`
  highlight) handed to the painter beside tiles whose values are otherwise
  unchanged
- **THEN** the overlay is carried by the shared overlay sidecar (packed per
  frame, stale-compared in the cache-miss test, committed after draw), so a
  Check & Save on an already-drawn board repaints the flagged cells

#### Scenario: A mistake flag folded into the tile value

- **WHEN** a game sets a bit of the tile value for a flagged cell, as the
  skeleton does
- **THEN** the cell's key changes with the flag and the cell repaints, and the
  game keeps no sidecar for that overlay

### Requirement: The warm-frame comparison answers for what it reached

The warm-frame run SHALL paint the frames a player sees between two settled
ones: an animation's frames, in clock steps shorter than any animation or
flash in the collection; a drag's preview before its release; and the check
Check & save makes. The test SHALL require that an armed animation was painted
part-way, and that a game which finds mistakes painted a mistake overlay on a
warm frame.

#### Scenario: The clock ticks in whole seconds

- **WHEN** the run advances the clock by one second or more after an event that
  armed an animation
- **THEN** the animation ends inside the tick with none of its frames painted,
  and the test fails for that game

#### Scenario: A hinted game is never shown its hint

- **WHEN** the run shows a game that has a hint no hint frame
- **THEN** the test fails for that game, rather than passing over a hint overlay
  it never painted

#### Scenario: A mistake overlay left out of the cache key

- **WHEN** a game's painter draws the mistake overlay from input its cache key
  does not carry, and the run checks a wrong board it has already painted
- **THEN** the warm frame lacks the overlay its fresh twin draws, and the test
  fails for that game

#### Scenario: A game that finds mistakes is never shown one

- **WHEN** neither the seeded run nor a pinned wrong board paints a frame with
  a mistake overlay, for a game that finds mistakes
- **THEN** the test fails for that game, rather than passing over an overlay it
  never painted

### Requirement: A mark the seeded run does not paint is reached from a pinned board

The comparison SHALL accept a game id to start from in place of a seeded deal,
and moves to play on it. A hint mark the seeded run does not paint SHALL be
reached from a board in the test's ledger of pinned boards, never a deal seed,
and each SHALL paint a mark the seeded run does not. A game whose seeded run
checks no wrong board SHALL pin one as a board and the moves making it wrong.
A cross-tile mark that is not a hint mark SHALL be pinned in the game's tests.

#### Scenario: A pin the seeded run has caught up with

- **WHEN** a pinned board paints no mark the seeded run does not
- **THEN** the test fails for that game and names the board

#### Scenario: A wrong-board pin the seeded run has caught up with

- **WHEN** a game's seeded run paints a mistake overlay, and the game also
  pins a wrong board
- **THEN** the test fails for that game, so the pin is removed

#### Scenario: A mark drawn across tiles outlives its flag

- **WHEN** a frame the comparison paints draws a mark across tile edges, and a
  later frame clears the mark while repainting only some of the tiles it
  crossed
- **THEN** a warm frame keeps the mark's pieces over the tiles that did not
  repaint, and the comparison fails

#### Scenario: A cross-tile mark the seeded deal never shows

- **WHEN** a game's cross-tile mark leaves its tile key, and the seeded run
  never paints that mark
- **THEN** the game's comparison from a pinned board that shows the mark fails,
  where the seeded run alone would pass
