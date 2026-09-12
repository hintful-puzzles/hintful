## ADDED Requirements

### Requirement: Magnets grades boards with a tiered deductive solver

The solver SHALL return the impossible / ambiguous / solved (−1 / 0 / 1)
verdict at each difficulty. The Easy tier
SHALL perform: set-and-hold of initial givens, force-by-flags, the
neither-can-be-a-magnet neutral deduction, the row/column count-full pass
(color complete ⇒ exclude the rest; remaining unset all needed ⇒ set them),
and the odd-length-section deduction. The Normal tier SHALL additionally
perform: the advanced-full in-row domino-polarization pass, the
single-neutral-left exclusion, and the two count-dominoes passes
(all-remaining-dominoes-magnet ⇒ no neutral; one placeable end ⇒ set it). The
solver SHALL propagate a deduction across a domino to its partner (an
excluded color on one end excludes the opposite color on the other).

#### Scenario: A generated board is uniquely solvable at its difficulty

- **WHEN** a board generated at difficulty `d` is solved from empty
- **THEN** the solver returns solved (1) at `d`, and — for a Normal board —
  fails to fully solve (0) at Easy

### Requirement: Magnets renders under the web geometry

The renderer SHALL draw the rounded-corner dominoes (per upstream
`draw_tile_col`), the `+`/`−` magnet symbols, the neutral cross, the blue
not-neutral `?`, singleton black squares, and the `+`/`−` clue counts on all
four borders (top = column `+`, bottom = column `−`, left = row `+`, right =
row `−`) with the corner `+`/`−` symbols, using the web build's
`NARROW_BORDERS` geometry (`BORDER = 0`, an `(w+2) × (h+2)`-tile canvas). The
mistake-overlay color SHALL be appended past the base palette. Every per-cell and per-clue overlay
(set / error / cursor / not-neutral / flash / mistake / clue-done) SHALL be
part of the render diff key so it repaints and clears correctly.

#### Scenario: A mistake overlay repaints on a later frame

- **WHEN** a cell is drawn, then `findMistakes` flags it on a subsequent frame
  without the cell's own value changing
- **THEN** the mistake overlay is painted on that later frame

## REMOVED Requirements

### Requirement: Magnets ports the graded solver faithfully

**Reason**: It required the solver's verdict to be identical to the C solver on every board, a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement; its heading also asserts faithfulness, which a `MODIFIED` block cannot rename.

**Migration**: Replaced by "Magnets grades boards with a tiered deductive solver", which keeps every tier's deductions, the three-valued verdict and the scenario without the parity obligation. The frozen differential fixtures may remain as regression tests; they are no longer a requirement.

### Requirement: Magnets renders to upstream parity under the web geometry

**Reason**: Its heading asserted parity with upstream's C ("to upstream parity", a palette mirroring the upstream color enum index-for-index), a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement; a `MODIFIED` block cannot rename a requirement.

**Migration**: Replaced by "Magnets renders under the web geometry", which keeps everything drawn, the geometry and the render diff key without the parity obligation. The frozen differential fixtures may remain as regression tests; they are no longer a requirement.
