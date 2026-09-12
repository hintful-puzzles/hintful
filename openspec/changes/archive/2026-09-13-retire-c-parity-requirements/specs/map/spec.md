## ADDED Requirements

### Requirement: Map ports the graded solver and solver-gated generator

The port SHALL implement `map_solver` with its full graded deductive power over
the region-adjacency graph: at Easy, place a region that has exactly one possible
color left; at Normal, additionally exclude a shared color pair from the common
neighbors of an adjacent same-two-possibilities pair; at Tricky, additionally run
the forcing-chain BFS; at Unreasonable, additionally recurse (guess and verify).
The solver SHALL return the three-valued verdict (impossible / unique / stuck-or-
ambiguous), and a grading routine SHALL return the easiest difficulty that yields
a unique solution. The generator (`new_game_desc`) SHALL grow voronoi regions over
the cumulative-frequency table, four-color them recursively, reduce clues under the
solver's gate without ever removing the last region of a color, and retry below a
difficulty floor.
`solve` SHALL return the generator's aux when present, else re-solve from the
clues at maximum difficulty.

#### Scenario: Generated boards are uniquely solvable at their difficulty

- **WHEN** a board is generated for a given difficulty and graded by the TS
  solver
- **THEN** the grading is a unique solution at exactly the requested difficulty
  (or the generator's documented fallback for pathologically dense/sparse maps)

## MODIFIED Requirements

### Requirement: Map input, preferences and rendering

`interpretMove` SHALL support: a press that picks up the color of the region
under the pointer (or, on a blank region, its pencil marks) into a floating drag
blob; a release that drops the held color onto the region under the pointer; a
right-drag from a color to a blank region that toggles a single pencil-mark bit;
and a keyboard cursor that picks and drops via the select keys — with the
diagonally-split-cell quadrant hit-test of `region_from_coords`. A
drop that changes nothing SHALL produce no move. Penciling a colored region
SHALL be rejected. The three upstream preferences (victory-flash effect,
number-regions, stipple display style) SHALL be exposed through the `prefs` hook
with the upstream keyword slugs, stored on the `Ui` with `newUi` defaults, and
the `l`/`L` key SHALL toggle region numbers in play. `redraw` SHALL render region
fills, the diagonal second-region triangle of a split cell, pencil-mark stipples,
grid lines on region boundaries, the red adjacency error diamonds, optional
region numbers, the flagged-mistake region outline, the floating drag/cursor
blob (a blitter sprite), and the selected completion-flash style — with a `BORDER` of 0
(NARROW_BORDERS).

#### Scenario: A drag colors a region

- **WHEN** the player presses on a colored region and releases on an adjacent
  blank region
- **THEN** `interpretMove` yields a move whose execution sets the blank region to
  the held color

#### Scenario: A no-op drop yields no move

- **WHEN** the player drops a color onto a region that already holds it (or onto
  the border, or onto an immutable clue region)
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

## REMOVED Requirements

### Requirement: Map ports the graded solver and solver-gated generator faithfully

**Reason**: It required the generator's desc and aux, by reproducing the C RNG draw order, to match upstream's C byte-for-byte, a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement, and that obligation is a scenario of its own, which a `MODIFIED` block cannot drop.

**Migration**: Replaced by "Map ports the graded solver and solver-gated generator", which keeps the solver's tiers, the grading routine, the generation procedure and the uniqueness scenario without the parity obligation. The frozen differential fixtures may remain as regression tests; they are no longer a requirement.
