## MODIFIED Requirements

### Requirement: Every hint mark a renderer asks for is painted by some run

For a game with a hint, the test SHALL require that every mark the renderer
asked for, in a role the game's `hintMarks` legend lists, was painted by the
seeded run or by a board the search tried. It SHALL also require that every
role the legend lists is one the renderer asks for. A mark that no board
reaches SHALL be named, with the reason, in a ledger the test holds exact.

#### Scenario: A hint mark no run paints

- **WHEN** a game's renderer asks for a mark in a role its legend lists, and
  neither the seeded run nor any board the search tried paints it
- **THEN** the test fails for that game and names the mark, unless the ledger
  of unreached marks names it with the reason

#### Scenario: A legend role the renderer never reads

- **WHEN** a game's legend lists a role its renderer never asks the displayed
  marks for
- **THEN** the test fails for that game, because the help's list of marks
  describes a mark the game cannot paint

## REMOVED Requirements

### Requirement: A mark the seeded run does not paint is reached from a pinned board

**Reason**: A hand-pinned board had to be found again whenever a change to
shared data, a word list or a dealer, moved which board the seed dealt, and
the guard failed for a reason unrelated to the change.

**Migration**: Replaced by "A mark the seeded run does not paint is found by a
bounded search", which keeps the wrong-board pins and the cross-tile pins in a
game's own tests.

## ADDED Requirements

### Requirement: A mark the seeded run does not paint is found by a bounded search

The comparison SHALL accept a game id to start from in place of a seeded deal,
and moves to play on it. A hint mark no earlier run painted SHALL be sought
over the boards every sweep deals, in a fixed order and up to a bound, and the
test SHALL print which board painted it. A game whose seeded run checks no
wrong board SHALL pin one as a board and the moves making it wrong. A
cross-tile mark that is not a hint mark SHALL be pinned in the game's tests.

#### Scenario: A change moves the seeded deal

- **WHEN** a change to shared data moves which board a game's seed deals, and
  that board no longer paints a mark the old one did
- **THEN** the search finds a board that paints it, and the test passes

#### Scenario: A mark no board within the bound paints

- **WHEN** no board the search tries within its bound paints a mark the
  renderer asks for
- **THEN** the test fails for that game, naming the mark and how many boards
  were searched

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
