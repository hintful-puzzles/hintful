## ADDED Requirements

### Requirement: Rectangles ports the solver and solver-gated generator

The port SHALL implement `rect_solver` with its full deductive power:
per-rectangle candidate-placement enumeration, the overlaps and `rectbyplace`
bookkeeping, and the deduction loop (sole-remaining-number-position marking,
placement-intersection marking, rectangle-focused and square-focused placement
elimination), plus the RNG-driven number-placement winnowing used during
generation. The generator (`new_game_desc`) SHALL tile the base grid at random,
remove singletons, stretch it with the two-pass expand-and-transpose, call the
solver when `unique` is set, and encode the run-length desc. `solve` SHALL run the solver from the fixed
numbers and return the unique solution's edges (or the generator's `aux` when
present).

#### Scenario: Generated boards are uniquely solvable

- **WHEN** a board is generated with `unique = true` and solved from its numbers
- **THEN** the solver reaches a single consistent rectangle placement for every
  number

## MODIFIED Requirements

### Requirement: Rectangles reports completion and mistakes

The game SHALL compute per-cell correctness as `get_correct` does: a cell
is correct iff it belongs to a valid rectangle — all boundary edges present,
none interior, and exactly one contained number equal to the rectangle's area.
The board is completed when every cell is correct. Because boards are uniquely
solvable, the game SHALL implement `findMistakes`: re-solve from the numbers to
the unique solution's edges and return every edge the player has drawn that the
unique solution does not contain (a definite mistake); a *missing* edge is not a
mistake, and a non-uniquely-solvable board yields no mistakes. Check & Save
depends on this hook and SHALL refuse to save while any mistake is present.

#### Scenario: A wall the solution does not contain is flagged

- **WHEN** the player has drawn an edge that the unique solution does not
  contain, and `findMistakes` is invoked
- **THEN** that edge is returned as a mistake

#### Scenario: A correct partial board has no mistakes

- **WHEN** the player has drawn only edges that the unique solution contains
- **THEN** `findMistakes` returns an empty result

### Requirement: Rectangles input and rendering

`interpretMove` SHALL support: a left-drag drawing a rectangle outline, a
right-drag erasing interior edges, a click near an edge toggling that single
edge, and a half-grid keyboard cursor with press-to-drag — with the
corner/center/edge click allocation of `coord_round`. A drag or
click that changes no edge SHALL produce no move. `redraw` SHALL render the grid,
number text, the three edge colors (black solid line, red drag-draw preview,
blue drag-erase preview), the computed corner pixels, the gray correct-rectangle
fill, the cursor tile, the flagged-mistake edge color, and the completion
flash, with a `BORDER` of 1 (NARROW_BORDERS).

#### Scenario: A drag draws a rectangle outline

- **WHEN** the player left-drags from one grid vertex to another spanning a
  rectangle
- **THEN** `interpretMove` yields a rectangle move whose execution sets the four
  boundary edges of that rectangle and clears its interior edges

#### Scenario: A no-op click yields no move

- **WHEN** the player clicks in a way that would change no edge
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

## REMOVED Requirements

### Requirement: Rectangles ports the solver and solver-gated generator faithfully

**Reason**: It required the generator's desc and `aux`, by reproducing the C RNG draw order, to match upstream's C byte-for-byte, a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement, and that obligation is a scenario of its own, which a `MODIFIED` block cannot drop.

**Migration**: Replaced by "Rectangles ports the solver and solver-gated generator", which keeps the solver, the generation procedure, `solve` and the uniqueness scenario without the parity obligation. The frozen differential fixtures may remain as regression tests; they are no longer a requirement.
