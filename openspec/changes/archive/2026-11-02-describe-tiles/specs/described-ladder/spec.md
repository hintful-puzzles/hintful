## ADDED Requirements

### Requirement: A technique may run as a value is struck

A description SHALL be able to state a technique run as a fact strikes a value from a cell (`on: strike`), its first binder bound to that cell, which only strikes and is not a rung; the engine SHALL run it whenever a fact removes a value a cell still had, so its strikes belong to the firing that made the first. A mark a player makes that is a state of the candidates SHALL need no construct of its own.

#### Scenario: A strike at one end of a tile

- **WHEN** a Magnets firing strikes `+` from one end of an open tile
- **THEN** the same firing strikes `−` from its other end

#### Scenario: A tile marked `?`

- **WHEN** a Magnets hint reads a tile the player marked `?`
- **THEN** it reads neutral struck from both of its ends

### Requirement: Magnets runs its compiled ladder

Magnets' solver, generator, hint and answer check SHALL run the techniques its description states, compiled, and SHALL keep no hand-written rung; the generator SHALL lay a board's tiles with the same ladder over a board with no numbers.

#### Scenario: A hint step

- **WHEN** Magnets' hint places a pole because a line has just enough squares left for it
- **THEN** the step is a firing of the compiled `count` technique, bound by the line and the pole

## MODIFIED Requirements

### Requirement: A compiled ladder runs on the engine's marks, whatever the board

The engine SHALL own the marks a compiled technique reads, a value and a mask of candidates a cell, and SHALL run a compiled module's ladder on them: one technique an entry, in the module's order, capped and graded per scale, the module's techniques run on placing as each value is placed, and those run on striking as a fact strikes a value. A game's solver SHALL extend the marks only to keep what no description states, a search.

#### Scenario: A board with no units

- **WHEN** Unruly's ladder solves a board
- **THEN** it runs on the engine's marks with no unit, and a placement culls nothing

#### Scenario: A Latin game's solve is unchanged

- **WHEN** a Latin game's board is dealt and hinted on the engine's marks
- **THEN** every deal and every hint step's rung, move and words are what the per-tier runner gave
