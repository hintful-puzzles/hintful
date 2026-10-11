## MODIFIED Requirements

### Requirement: Clusters' parameters are a width, a height and a difficulty

Parameters SHALL be a width, a height and a difficulty. A game ID SHALL encode
the width and height (a bare single number read as a square board) and, in its
full form, the difficulty, and SHALL round-trip through decode. An ID that
carries no difficulty SHALL decode to Easy. A tier letter the game does not
know SHALL be refused when the parameters are decoded, and SHALL NOT be
silently played as some other tier.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height and difficulty are recovered, and a bare single
  number is read as a square board

#### Scenario: An older game ID still resolves

- **WHEN** a game ID that carries no difficulty is opened
- **THEN** it loads and is playable, and its parameters read as the easier tier

#### Scenario: An unknown tier letter

- **WHEN** a game ID whose difficulty letter names no Clusters tier is opened
- **THEN** it is refused with a reason, and no board is dealt at another tier
