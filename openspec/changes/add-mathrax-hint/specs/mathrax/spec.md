# mathrax

## ADDED Requirements

### Requirement: Mathrax explains the next deduction

`hint(state, aux, ui)` SHALL refuse through `commonHintRefusal` when the board is
solved or `findMistakes` reports a mistake, and otherwise return the forced steps
from the player's own board as an ordered plan, each step narrating why its move
is forced from premises the sentence itself states. The plan SHALL be built by
the shared candidate-elimination walk over Mathrax's row and column regions, so
it fills notes with the additive `pencilAll` before a deduction first needs them,
clears in one setup step what the digits already placed rule out, and offers
naked singles, the recorded strikes and the recorded placements in that order.

The recording solve SHALL be seeded from the placed digits alone, never from the
player's notes, and SHALL be capped below the guess-and-verify tier, because a
guess is not a teachable note strike.

A recorded clue elimination SHALL name exactly one clue acting on exactly one
cell. Mathrax's deduction intersects a cell's candidates across the up to four
clues at its corners at once, so the recording path SHALL attribute each
elimination to a clue whose options exclude it and commit one clue's
eliminations per firing. It SHALL NOT change what the deduction commits: the
difficulty gate still waits on the intersection across every incident clue, so
the solver reaches the same verdict and the same grid with and without a
recorder, and the solver-gated generator produces the same boards.

A clue step's sentence SHALL name the clue as the board draws it and state the
operation in words. Whether it names a digit across the clue SHALL be decided by
the working board rather than by the recorded deduction: it SHALL say so only
when a digit is written there, and otherwise SHALL speak of what is still open
across the clue.

A clue step SHALL shade as its evidence the cells that identify the clue — the
diagonal pair for an arithmetic or equality clue, all four cells around the
intersection for an even or odd clue — because the clue sits on an intersection
the board has no mark for, and each of those sets meets at exactly one
intersection.

Mathrax SHALL offer the collection's auto-pencil preference, and when it is on a
placement SHALL remove its digit from the pencil marks of the rest of its row and
column, both on the board and in the hint's plan.

#### Scenario: A clue read against a digit across it names that digit

- **WHEN** a hint is requested on a board where a clue's deduction acts on a cell
  whose diagonal partner across that clue holds a digit
- **THEN** the step names the clue as the board draws it, states what the two
  cells on that diagonal must do, names the partner's digit, and strikes only
  candidates of the one cell it acts on

#### Scenario: A clue read against an open cell speaks of what is still open

- **WHEN** the same deduction acts on a cell whose diagonal partner across the
  clue is still empty
- **THEN** the step says that nothing open across that clue pairs with the values
  it strikes, and names no digit across the clue

#### Scenario: An even or odd clue shades all four cells around it

- **WHEN** an `E` or `O` clue's deduction is hinted
- **THEN** the step says all four numbers around the clue are even or odd, and
  shades the block of four cells around that intersection

#### Scenario: The recorder does not change the solver's verdict

- **WHEN** the same board is solved at the same difficulty cap with and without a
  deduction recorder
- **THEN** both solves return the same verdict and write back the same grid

#### Scenario: Refusing a solved or mistaken board

- **WHEN** a hint is requested on a completed board, or on one where
  `findMistakes` reports a wrong digit or a note that crosses out the answer
- **THEN** the hint refuses with the collection's shared wording rather than
  returning a plan
