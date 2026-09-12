## MODIFIED Requirements

### Requirement: Clusters offers difficulty tiers over its two deduction levels

Clusters SHALL offer a difficulty parameter with two tiers, corresponding to the
two deduction levels its solver already implements: the single-cell proof by
contradiction (**Easy**), and the same reasoning applied one hypothetical level
deep (**Normal**).

A board generated at Normal SHALL require that second level — it SHALL NOT be
soluble by the single-cell reasoning alone. A board generated at Easy SHALL be
soluble by it. The acceptance gate MAY run the easier rung first and reject a
Normal candidate it completes, which reaches the same verdict for one solver run
rather than two.

The difficulty SHALL be encoded in the game ID, and an ID that carries no
difficulty SHALL decode to Easy — the majority tier among the boards Clusters
generated before the parameter existed, and the tier whose boards a returning
player is likeliest to recognize. A tier letter the game does not know SHALL be
rejected by parameter validation rather than silently played as some other tier.

Clusters SHALL refuse to *generate* at Normal on a board too small to admit one,
reporting it through parameter validation with `full` set, so that a saved game or
a game ID carrying its own description still loads at any size.

`solve`, `hint` and `findMistakes` SHALL continue to use the deeper rung whatever
tier the board was generated at: they are "try as hard as you can", and the rung
costs nothing on a board that does not need it.

#### Scenario: The harder tier needs the deeper reasoning

- **WHEN** a board generated at the harder tier is solved using only the
  single-cell contradiction rule
- **THEN** the solver does not reach a solution
- **AND** solving the same board with the lookahead completes it

#### Scenario: The easier tier needs only the single-cell rule

- **WHEN** a board generated at the easier tier is solved using only the
  single-cell contradiction rule
- **THEN** the solver completes it

#### Scenario: An older game ID still resolves

- **WHEN** a game ID generated before the difficulty parameter existed is opened
- **THEN** it loads and is playable, and its parameters read as the easier tier

#### Scenario: A board too small for the harder tier refuses it

- **WHEN** a full, generation-capable parameter set requests the harder tier on a
  board admitting no such puzzle
- **THEN** parameter validation rejects it, naming the constraint
- **AND** the same parameters are accepted when a description is supplied instead
