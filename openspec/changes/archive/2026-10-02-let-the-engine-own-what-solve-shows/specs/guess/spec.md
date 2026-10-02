## MODIFIED Requirements

### Requirement: Guess scores submitted rows with Knuth feedback

A `GuessMove` SHALL be a guess submission carrying the working row's pegs and
holds (`{ type: "guess", pegs, holds }`), or a set of answer-row marks. Solve
SHALL submit the answer as the next guess, which wins.
`executeMove` SHALL be pure. A guess submission SHALL validate each peg against
`[allowBlank ? 0 : 1, ncolors]`, then mark the row with Knuth's feedback —
`nc_place` exact-position matches (black) and `nc_colour = Σ_color min(#guess,
#solution) − nc_place` color-only matches (white) — and store that feedback on
the row, then advance to the next row unless every peg is in the correct place.
The game SHALL be won when the last submitted row has every peg in the correct
place, and lost, with the solution revealed, when the rows are exhausted
without a win. Won and lost SHALL be judged from the rows on the board, never
from a separate record of the outcome.

#### Scenario: A correct guess wins

- **WHEN** the submitted row equals the solution
- **THEN** the row's feedback is all correct-place, and `status()` returns
  `"solved"`

#### Scenario: Feedback counts black then white pegs

- **WHEN** a row with two pegs in the correct place and one further peg of a
  color present elsewhere in the solution is submitted
- **THEN** the feedback contains exactly two correct-place markers followed by
  one correct-color marker, and the source state is unmutated

#### Scenario: Exhausting the rows loses and reveals

- **WHEN** the final available row is submitted without matching the solution
- **THEN** `status()` returns `"lost"` and the solution becomes visible
