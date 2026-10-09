## MODIFIED Requirements

### Requirement: A Towers hint is ordered the way a person solves

The hint's rung order SHALL put a naked single first: an empty cell whose live
notes have collapsed to a single candidate, which is sound on a mistake-free
board. After it SHALL come the clue lines that need no notes: a clue equal to
the grid size, whose line climbs from 1 beside the clue, and a clue of 1,
which has the tallest tower beside it. Then SHALL come the next clue
elimination, and after that a forced placement. A freshly built plan SHALL
open in that order.

#### Scenario: A naked single is offered ahead of further elimination

- **WHEN** a hint is requested on a mistake-free board where some empty cell's
  pencil notes have collapsed to a single candidate
- **THEN** the next step places that height in that cell

#### Scenario: A full-height clue opens an empty board

- **WHEN** a hint is requested on an empty board with no notes, one of whose
  clues equals the grid size
- **THEN** the plan opens by placing that clue's line in order from the clue,
  one cell a leg, before any step that fills in notes
