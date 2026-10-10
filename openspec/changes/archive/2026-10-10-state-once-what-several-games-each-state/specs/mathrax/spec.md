## ADDED Requirements

### Requirement: The recording solve stops below the guess-and-verify tier

The recording solve SHALL be capped below the guess-and-verify tier, because a
guess is not a teachable note strike.

#### Scenario: A board at the top tier is hinted by deduction alone

- **WHEN** a hint is requested on a board generated at `Unreasonable`
- **THEN** the recording solve runs no higher than Tricky

## MODIFIED Requirements

### Requirement: Mathrax offers the sticky pencil and auto-pencil preferences

Mathrax SHALL offer the collection's sticky pencil preference and its
auto-pencil preference. When auto-pencil is on a placement SHALL remove its
digit from the pencil marks of the rest of its row and column, both on the
board and in the hint's plan.

#### Scenario: A placement clears its digit from its row and column

- **WHEN** the auto-pencil preference is on and a digit is entered in a cell
  whose row and column hold that digit as a pencil mark
- **THEN** those pencil marks are removed with the entry

### Requirement: Mathrax flags mistakes against the unique solution

Mathrax SHALL provide `findMistakes`. It SHALL re-solve from the given digits
and the clues to the unique solution, and flag every placed digit that
contradicts it and every empty cell whose non-empty pencil notes have crossed
out its solution value. A cell whose notes merely carry extra candidates SHALL
NOT be flagged. When the board is not uniquely deducible, no cell SHALL be
flagged.

#### Scenario: A wrong placed digit is flagged

- **WHEN** a cell holds a digit that differs from the unique solution and mistakes are
  checked
- **THEN** that cell is reported as a mistake

## REMOVED Requirements

### Requirement: The recording solve reads placed digits and stops below the guess-and-verify tier

**Reason**: Restated as "The recording solve stops below the guess-and-verify tier". `engine-candidate-hints`, "A recording solve reads the placed entries and
never the notes", holds the first half (`recordMathraxDeductions(o,
state.clues, wGrid, maxdiff)`), so the title loses it. The cap is Mathrax's
own and stays with its scenario. No source or guide cites the title.
