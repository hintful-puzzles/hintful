## ADDED Requirements

### Requirement: Net's hint reasons from notes, locks and walls

Net SHALL provide an explained `hint` that reasons only from the facts a player records — side notes and locked tiles — and the walls the board shows, treating an unlocked tile as unknown however it is turned. Each step SHALL add one fact: a note on a side every surviving way of turning a tile agrees on, or a lock on a tile only one way of turning survives for. A way of turning SHALL be ruled out only by a known side it contradicts, a loop it would close through wires already known, or a group of tiles it would seal off from the rest of the grid, and the step's words SHALL name each reason it rests on. A lock step whose tile must turn first SHALL be one journey of the turn and the lock, and every step's moves SHALL be ones the declared verbs make. The hint SHALL refuse while `findMistakes` reports a wrong lock or note.

#### Scenario: A tile against the wall

- **WHEN** a straight on the edge of a bounded grid is turned into the wall, and the player asks for a hint
- **THEN** the step rings the straight, says it must fit the wall so only one way fits, turns it, and then locks it

#### Scenario: A wrong note stops the hint

- **WHEN** a note the solution contradicts is on the board
- **THEN** the hint refuses and asks for the mistakes to be fixed first

## MODIFIED Requirements

### Requirement: Generated boards are uniquely solvable without guessing

When `unique` is set, the generator SHALL gate every board through its own solver, perturbing
the wiring until the board has exactly one solution reachable by pure deduction, and SHALL then
keep the board only if the hint's engine finishes it from the opening position, dealing another
otherwise. A board that requires guessing, or that the hint cannot finish, SHALL be reachable
only by explicitly opting out of uniqueness.

#### Scenario: A generated board has one deducible solution

- **WHEN** a board is generated with `unique` set
- **THEN** the solver reports it uniquely solvable, and no guess is required to reach the
  solution

#### Scenario: A generated board is hinted to the end

- **WHEN** a board is generated with `unique` set and the player follows the hint from the opening position
- **THEN** every step agrees with the solution and the board ends solved
