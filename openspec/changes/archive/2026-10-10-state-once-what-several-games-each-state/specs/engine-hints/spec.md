## ADDED Requirements

### Requirement: A hint-executed move plays its animation at one duration

The move that completes a hint step under `executeHint` SHALL play its game's
animation at one duration, the same for every game and equal to the time
auto-play dwells on a step, so that auto-play reads as continuous motion. The
game SHALL be handed animation time scaled back to its own `animLength`, and
so writes nothing for it. A move whose `animLength` is zero SHALL land at
once. The completion flash SHALL keep its own length.

#### Scenario: The same move by the player's hand

- **WHEN** the player makes by hand the move a hint step would have made
- **THEN** it plays at the game's own `animLength`

#### Scenario: A game that animates nothing

- **WHEN** a hint step is executed in a game whose `animLength` is zero for it
- **THEN** the board shows the move at once, and auto-play still dwells on the
  step before the next

#### Scenario: A step that takes two moves

- **WHEN** a hint step is played by two moves, and `hintKeepTrack` calls only
  the second `"completed"`
- **THEN** only the second is stretched to the shared duration, and the first
  lands with no stretch

## MODIFIED Requirements

### Requirement: A highlight on a board element stays legible against its cell

A displayed highlight that acts on a board element, such as a struck candidate,
SHALL be drawn legibly against its cell and never in the color of the cell's
own background fill, so the element it refers to stays visible and does not
look already resolved. A candidate a step strikes, one of the `marks` of its
highlights, SHALL stay drawn among its cell's notes in the note's own ink, with
a line through it as the cue that the hint rules it out.

#### Scenario: A struck candidate stays visible

- **WHEN** a displayed step strikes a candidate
- **THEN** the candidate remains visible, its highlight contrasting with the
  cell background, and is not hidden behind a same-color fill
