## ADDED Requirements

### Requirement: Signpost solves by forced-link deduction

The solver SHALL iterate `update_numbers` and
a single forced-link deduction (`solve_single` — if a cell has exactly one
legal next cell it may link to, make that link; symmetrically for a sole
legal predecessor) to a fixpoint, gated by `move_couldfit` (a region may
only bridge a numeric gap it fits into). The solver SHALL report the board
solved, stuck, or impossible.

#### Scenario: Forced links are deduced

- **WHEN** the solver runs on a board where a cell points at exactly one
  legal continuation
- **THEN** it links them, and iterating to a fixpoint solves any generated
  board

#### Scenario: Solve recovers the chain from a dirty state

- **WHEN** `solve()` is invoked on a partially- and wrongly-linked board
- **THEN** it returns a move reconstructing the correct full `1 … n` chain

### Requirement: Signpost generates solver-gated boards reproducibly

For a given random seed and params, `newDesc` SHALL produce the same desc
on every run — the `new_game_fill` head+tail random walk,
the `new_game_strip` shuffle-and-solver-gated clue selection, and the
final `generate_desc` encoding.

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` runs twice with the same params and seed
- **THEN** both runs emit the identical Signpost description

### Requirement: Signpost renders region colors, arrows and a blitter drag sprite

`render.ts` SHALL draw the board with the four 16-entry HSV color ramps for region backgrounds and mid
/ dim arrow colors. The drawstate SHALL key a per-cell packed `Int32Array`
cache (region color group, sequence number, arrow direction, and the
immutable / error / cursor / drag-origin / flash / findMistakes-overlay
bits) diffed against the previous frame, with every overlay rebuilt each
frame so it is in the diff key. The drag sprite SHALL use a blitter
(save-restore under the moving arrow), as the Pegs port does. The win-flash
SHALL spin the arrows, honoring the `flash-type` preference (unidirectional
vs meshing gears). The engine SHALL paint no pixels of its own; the
first-draw branch fills the background.

#### Scenario: Region colors repaint after linking

- **WHEN** a render scenario links a sequence of cells
- **THEN** the recorded draw ops show each region's cells drawn with its
  assigned background-ramp color, and a subsequent link that merges regions
  repaints the affected cells with the surviving color

#### Scenario: A wrong link renders red

- **WHEN** the findMistakes overlay is active for a wrong link
- **THEN** that cell is drawn with the `COL_ERROR` styling on the next paint

## REMOVED Requirements

### Requirement: Signpost ports the deductive solver faithfully

**Reason**: It required the solver's verdict to match the C solver on every intermediate board. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Signpost solves by forced-link deduction", which keeps the deductions and the verdicts without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.

### Requirement: Signpost generates byte-identically to the C build

**Reason**: It required `newDesc` to reproduce the C generator's desc byte-for-byte, by matching C's RNG call order, asserted against C-recorded fixtures. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Signpost generates solver-gated boards reproducibly", which keeps the generation algorithm and seed reproducibility without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.

### Requirement: Signpost renders to full parity with a blitter drag sprite

**Reason**: Its heading required rendering at parity with the C build, and its body palette indices matching the C enum. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Signpost renders region colors, arrows and a blitter drag sprite", which keeps everything it rendered without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.
