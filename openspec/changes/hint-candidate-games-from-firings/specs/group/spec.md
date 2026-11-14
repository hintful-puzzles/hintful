## MODIFIED Requirements

### Requirement: Solver: Group's ladder is its description

Group's solver SHALL run the ladder of `group.description.yaml`: the
associativity, identity and not-the-identity techniques it states and the
Latin library's it places, each at the tier the description gives it, checked
sound against the description's rules, a Latin square whose product is
associative. The search above them stays the engine's.

#### Scenario: Associativity fires as its description states it

- **WHEN** `a·b`, `b·c` and `(a·b)·c` are placed, `a·(b·c)` is open and can
  still hold `(a·b)·c`, at a cap of Normal or above
- **THEN** the solver places `a·(b·c)` equal to `(a·b)·c`, saying the triple
  and the cells of the products it read

#### Scenario: A product that changes a letter rules its partner out

- **WHEN** `j·a` is placed and is not `j`, at a cap of Tricky or above
- **THEN** the solver strikes, for every `k`, the letter `k` from the cells
  `k·a` and `a·k`, in one firing, saying `a` and the least such `j` as its
  witness

### Requirement: Hint: Group's own placements lead the eliminations

Group's hint SHALL be the collection's candidate plan through its row/column
preset, run on the player's notes (`engine-candidate-hints`, "A described
technique is a rung read off the notes" and "A game's placing technique may
lead"). Its associativity and identity techniques SHALL lead: each SHALL be offered wherever the board supports it,
from the note-free opening on, waiting neither for the notes to be set up nor
for an earlier rung, and until the notes are set up any single the board
shows SHALL be offered beside them. Group SHALL start on the implicit
reading, which has no populate step.

#### Scenario: Associativity is taught before any note is needed

- **WHEN** a hint is requested on a board with no notes where `a·b`, `b·c` and
  `(a·b)·c` are filled but `a·(b·c)` is not
- **THEN** the plan's first step is a placement, and no note is written
  before it
