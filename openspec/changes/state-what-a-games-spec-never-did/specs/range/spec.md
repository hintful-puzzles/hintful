## ADDED Requirements

### Requirement: Range's hint takes the clue rule first in each pass

The hint's plan SHALL list the forced cells in the order the rules force them.
Each pass SHALL take every clue in turn (a clue that sees its count, else a
cell that would overrun it, then a cell it cannot reach its count without),
then the adjacency rule, then the connectedness rule, and passes SHALL repeat
until none forces a cell. Each rule SHALL read the cells the rules before it
set in the same pass.

#### Scenario: A clue's cell comes before a shaded square's neighbor

- **WHEN** a hint is asked on a one-row board of seven squares with a 1 at
  each end, whose middle square the player has shaded
- **THEN** the plan shades the square beside each 1, as a clue that sees its
  count, and only then clears the two squares beside the middle one, as
  neighbors of a shaded square, though those were forced from the start
