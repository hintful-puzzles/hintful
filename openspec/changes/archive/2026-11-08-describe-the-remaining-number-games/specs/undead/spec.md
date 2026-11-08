## MODIFIED Requirements

### Requirement: Generation: Undead grades a board by the rung of the ladder it requires

`newDesc` SHALL grade a board by the techniques `undead.description.yaml`
states, and then by the forcing rung. A board's tier SHALL be the highest
the ladder needed: Easy where `single` and `sightline` solve it within
three sightline passes, the last of them narrowing nothing; Normal where it
needs more passes or a monster's count (`total`); and `Unreasonable` where it
needs forcing. The sightlines SHALL be tried from the one with the fewest
monster cells up, those of a length in clockwise order round the grid from
the top left, since the passes an Easy board takes depend on that order.

#### Scenario: Generated board is on-difficulty

- **WHEN** `newDesc` returns a board for a given size and difficulty
- **THEN** the deductive ladder solves it uniquely with no recursion
- **AND** the board's grade matches the highest rung the ladder needed

## ADDED Requirements

### Requirement: Solver: Undead's solver is a certified deduction ladder

Undead's Easy and Normal rungs SHALL be the ladder `undead.description.yaml`
states, its hint's and its grading's alike. Each technique SHALL be checked
sound, and a planted defect of each found unsound. The boards of its firing
census SHALL be those generated at every tier, and every technique SHALL fire
on them at the caps the generator uses. The forcing rung and the brute-force
uniqueness check SHALL stay the game's own.

#### Scenario: A silenced technique fails

- **WHEN** every solve of the census is capped at Easy
- **THEN** the census reports `total` as never fired
