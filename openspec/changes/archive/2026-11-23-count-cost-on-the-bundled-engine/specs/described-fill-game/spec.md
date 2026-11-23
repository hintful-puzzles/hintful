## MODIFIED Requirements

### Requirement: A born game may build its answer and hide its clues

Where `deal.sample` is `build`, the answer SHALL be built a random value on a
random undecided cell at a time, each followed by what the ladder then
decides, from its lowest tier and a tier higher after each build that meets
a dead end or breaks a rule. Where `deal.hide` names a clue kind, its clues
SHALL be taken away at the lowest tier, then at the asked tier, while the
board finishes at each. A draw the lowest tier does not finish with every
clue SHALL be thrown away, until a long run of such draws in a row, after
which one SHALL be hidden from at the lowest tier up to the asked that
finishes it; a draw no tier up to the asked finishes SHALL be thrown away.

#### Scenario: An Unruly board keeps only the givens it needs

- **WHEN** an Unruly board is dealt and any one of its givens is taken away
- **THEN** the board no longer finishes at its tier

#### Scenario: A Mosaic board the lowest tier does not finish is drawn again

- **WHEN** a Mosaic 12x15 board is drawn at Normal whose every number Easy
  does not finish and Normal does, after draws Easy finished
- **THEN** it is thrown away and another drawn, since hiding its numbers at
  Normal costs more than drawing again

#### Scenario: A narrow Mosaic board still deals

- **WHEN** a Mosaic 3x50 board is asked at Normal, whose draws Easy seldom
  finishes with every number
- **THEN** a board is dealt at Normal, hidden from at Normal once a run of
  draws Easy did not finish has passed
