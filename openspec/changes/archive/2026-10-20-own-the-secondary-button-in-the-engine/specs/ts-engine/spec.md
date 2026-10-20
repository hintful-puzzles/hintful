## MODIFIED Requirements

### Requirement: A boolean capability flag is held to the behavior it claims

The `Game` interface SHALL carry a boolean capability flag only where a
production consumer needs the answer synchronously and cannot observe it. Every
such flag SHALL be asserted equal to a derivation of the fact it declares, so a
flag that is forgotten, left behind by a changed game, or wrong fails a test. A
flag whose effect is to disable a guard or a frontend behavior SHALL carry such
a check, because nothing else observes it when it lies.

#### Scenario: A flag declared against the behavior fails

- **WHEN** a game sets `ignoresSecondaryButton` but a right-button gesture
  somewhere does what the left button's would not
- **THEN** the cross-game guard fails, naming the game

### Requirement: Each flag of the contract is held to its derivation

`ignoresSecondaryButton` SHALL be set if and only if no secondary gesture on
the game's board changes anything the player can perceive that the primary
gesture would not. `canMarkAll` SHALL be set if and only if the game's
`interpretMove` returns a move for an `M` press. A source scan standing in for
a derivation SHALL read the game's code with comments removed: a mention in
prose is not a use.

#### Scenario: A flag the behavior calls for but the game omits fails

- **WHEN** a game's `interpretMove` answers an `M` press with a move but the
  game does not set `canMarkAll`
- **THEN** the cross-game guard fails, naming the game
