## ADDED Requirements

### Requirement: Tents solves with a graded deductive solver

The solver SHALL return the impossible / unique / non-converged (0 / 1 / 2)
verdict at each difficulty. It SHALL perform: tent↔tree link deduction (a tent with one unattached adjacent tree,
and a tree with one candidate square, are linked); non-tent marking (a blank
with no adjacent unmatched tree, or diagonally adjacent to any tent); the
Normal-tier (`DIFF_TRICKY`) tree diagonal-pair elimination; and the row/column
combination-enumeration pass that places a tent or non-tent in any square
given the same state by every valid placement of the row's remaining tents
(with the Normal-tier adjacent-row influence). The solver SHALL be reused by
`solve()`, the generator's difficulty gate, and `findMistakes`.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Normal is solved
- **THEN** the Normal solver reaches the unique solution
- **AND** the Easy solver fails to converge on it

#### Scenario: Solve recovers from a wrong mid-game state

- **WHEN** `solve()` runs against a state containing wrong tents
- **THEN** the returned move yields the unique solution

### Requirement: Tents generates solver-gated boards reproducibly

`newDesc` SHALL generate the same board for the same seed: place `w*h/5` tents at random mutually-non-adjacent squares (an order
permutation driven by `random_upto`), place trees via the bipartite
`matching`, reject any layout with an empty row or column,
derive the edge numbers, and accept only when the solver succeeds at the
target difficulty and fails one level below.

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` runs twice with the same params and seed
- **THEN** both runs emit the identical Tents description

### Requirement: Tents renders trees, tents, clues, errors and the completion flash

`redraw` SHALL render: grass-filled non-blank tiles, trees (trunk rectangle
plus leaf circles), tents (triangle), grid lines, the edge numbers on the
bottom (columns) and right (rows) borders, red error coloring (error trunk,
error leaf/tent, adjacency diamonds with exclamation marks, red numbers), the
keyboard cursor outline, and the upstream 3-phase completion flash (trees and
tents blanked on the flashed thirds). The web build's `NARROW_BORDERS`
geometry SHALL be used (thin top-left border, number room on the
bottom/right). The drawstate SHALL diff a packed `Int32Array` per tile
(square value plus every error, cursor, flash, and mistake overlay bit) and a
separate per-number diff array, so every overlay is in the diff key.

#### Scenario: A mistake overlay repaints an unchanged tile

- **WHEN** a tile is painted, `findMistakes` flags it, and `redraw` runs
  again with no square-value change
- **THEN** the second paint renders the mistake overlay

#### Scenario: Edge numbers render red on error

- **WHEN** a row's tent count exceeds its edge clue
- **THEN** that row's number is drawn in the error color

## REMOVED Requirements

### Requirement: Tents ports the graded solver faithfully

**Reason**: It required the verdict to be identical to the C solver on every board. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Tents solves with a graded deductive solver", which keeps the deductions, the verdicts and their scenarios without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.

### Requirement: Tents generation is byte-identical to upstream

**Reason**: It required `newDesc` to reproduce upstream `new_game_desc` byte-for-byte, asserted against C-recorded fixtures. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Tents generates solver-gated boards reproducibly", which keeps the generation algorithm and seed reproducibility without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.

### Requirement: Tents renders to full parity with the C build

**Reason**: Its heading required rendering at parity with the C build, and its body a palette index-for-index with the C color enum. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Tents renders trees, tents, clues, errors and the completion flash", which keeps everything it rendered without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.
