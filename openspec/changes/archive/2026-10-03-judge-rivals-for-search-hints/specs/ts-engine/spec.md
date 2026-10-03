## ADDED Requirements

### Requirement: A searched move's rivals SHALL be judged through the engine

The engine SHALL provide `judgeRivals` (`src/engine/rival-judging.ts`): given the rivals of the
move a hint offers, an allowance counted in positions, and the game's judge of one rival
(finishes, lost, or unsettled), it SHALL return the verdicts and the claim they allow, with the
relation that claim's sentence uses. The relation that concludes a move with "so" over its
rivals SHALL be made only by `judgeRivals`, and only when every rival was judged lost or there
was none, so that a game cannot write it beside rivals nobody judged. The judge, the rivals a
game chooses to judge, and what a step says when nothing is settled SHALL stay the game's.

#### Scenario: Only a judging that lost every rival says "so"

- **WHEN** every rival is judged lost
- **THEN** the claim is that only the offered move remains, and its relation is the forced one
- **AND** when some rival finishes, the relation offers the move as one of several

#### Scenario: An unsettled rival is not claimed

- **WHEN** some rivals are unsettled and none is lost
- **THEN** the claim says nothing about the rivals, and carries no relation

#### Scenario: One allowance is shared

- **WHEN** the judging of the first rivals uses up the allowance
- **THEN** the rivals after them are judged with what is left, which is nothing
