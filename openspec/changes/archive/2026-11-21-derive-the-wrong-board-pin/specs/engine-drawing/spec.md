## MODIFIED Requirements

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

- **WHEN** neither the seeded run nor the run that seeks a mistake paints a
  frame with a mistake overlay, for a game that finds mistakes
- **THEN** the test fails for that game, rather than passing over an overlay it
  never painted

## REMOVED Requirements

### Requirement: A mark the seeded run does not paint is found by a bounded search

**Reason**: It required a game whose seeded run checks no wrong board to pin
one, and its scenario failed a pin the seeded run had caught up with. The run
now finds its own wrong board.

**Migration**: "A hint mark the seeded run does not paint is found by a
bounded search" holds the rest unchanged; the seeking run is in "The
warm-frame comparison answers for what it reached".

## ADDED Requirements

### Requirement: A wrong board the seeded run never checks is sought on its deal

Where a game finds mistakes and its seeded run checks no wrong board, a second
run SHALL play input on the same deal, up to a bound, until the check finds a
mistake. No game SHALL pin a wrong board by hand.

#### Scenario: A change moves the seeded deal off its mistake

- **WHEN** a change to shared data moves which board a game's seed deals, and
  the seeded run no longer checks a wrong board
- **THEN** the run that seeks a mistake finds one on the new deal, and no
  board or move is pinned by hand

### Requirement: A hint mark the seeded run does not paint is found by a bounded search

The comparison SHALL accept a game id to start from in place of a seeded deal.
A hint mark no earlier run painted SHALL be sought over the boards every sweep
deals, in a fixed order and up to a bound, and the test SHALL print which
board painted it. A cross-tile mark that is not a hint mark SHALL be pinned in
the game's tests.

#### Scenario: A change moves the seeded deal

- **WHEN** a change to shared data moves which board a game's seed deals, and
  that board no longer paints a mark the old one did
- **THEN** the search finds a board that paints it, and the test passes

#### Scenario: A mark no board within the bound paints

- **WHEN** no board the search tries within its bound paints a mark the
  renderer asks for
- **THEN** the test fails for that game, naming the mark and how many boards
  were searched

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
