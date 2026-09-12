## ADDED Requirements

### Requirement: Light Up grades boards with a tiered deductive solver

Light Up's solver SHALL apply, at each difficulty: at Easy, forced-light ("this unlit square has exactly one
remaining way to be lit") and clue deductions (a satisfied clue marks its
remaining neighbors impossible; a clue whose remaining lights equal its
remaining spaces fills them); at Normal, additionally the overlapping-set
discount (every MAKESLIGHT set — from an unlit square or a `C(n, n−m+1)`
combination of a clue's free neighbors enumerated via the ported `Combi`
module — is tested against candidate MAKESDARK squares chosen by the upstream
minimum-rule-out heuristic, marking squares impossible), restarting the cheap
deduction sweep after the first successful discount; at Unreasonable, additionally
recursion on the most-illuminating candidate square, depth-capped at 5, with
unique-solution bookkeeping (recursion-limit hits propagate
"unknown" under force-unique; solution counts sum across branches). The solver
SHALL track which clue numbers it used, for generator stripping. The solver
SHALL be reused by `solve()` and `findMistakes`.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at difficulty `d > 0` is solved
- **THEN** the solver succeeds with the difficulty-`d` technique set and fails
  (or needs recursion it is denied) with the difficulty-`d−1` set

#### Scenario: Solve recovers a solution from a dirty board

- **WHEN** `solve()` is invoked on a mid-game state containing wrong bulbs
- **THEN** it returns a move that leaves the board correctly and completely
  lit (solving from the current position when possible, else from the clean
  clues)

### Requirement: Light Up generates solver-gated boards

The generator SHALL build a board by symmetric
black-square placement per the symmetry mode (including the center-square
random draw for odd 4-way-rotational grids), a correct random light placement
seeded by filling all open squares then removing lights via the marked-sweep,
numbering all black squares, solver-gating at the target difficulty, stripping
unused numbers, removing surviving numbers one-by-one in the one-shot shuffled
order while the puzzle stays good, rejecting boards that are still solvable
one difficulty lower, and ramping `blackpc` by 5 (to at most 90) after 20
failed grids. Generation from a given seed SHALL be reproducible.

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` is run twice for the same preset and seed
- **THEN** both runs produce the identical description

### Requirement: Light Up renders with live error feedback

`redraw` SHALL draw: black squares (numbered ones showing their clue,
in the error color when the clue is provably wrong — too many adjacent
bulbs, or too few even if all plausible neighbors were filled); open squares
with lit squares filled yellow; bulbs as circles (error-colored when lit by
another bulb); impossible-marks as small black blobs — suppressed on lit
squares when the `show-lit-blobs` preference (default on, via the `Game.prefs`
hook) is off; the keyboard cursor; and the 3-phase completion flash. The
per-tile packed flags SHALL be the render cache key (`Int32Array`), and every
overlay not in the packed value (the `findMistakes` highlight) SHALL be in a
sidecar included in the diff key. The palette SHALL keep its indices fixed
(0 background, 1 grid, 2 black, 3 light, 4 lit,
5 error, 6 cursor) because the app's dark-mode overrides target indices 2
and 3.

#### Scenario: Overlapping bulbs render as errors

- **WHEN** two bulbs light each other
- **THEN** both are drawn in the error color

#### Scenario: A provably-wrong clue turns red

- **WHEN** a numbered black square has more adjacent bulbs than its clue
- **THEN** its number is drawn in the error color

#### Scenario: Lit blobs honor the preference

- **WHEN** a marked square becomes lit and `show-lit-blobs` is off
- **THEN** the blob is not drawn (and reappears when the preference is
  re-enabled)

## REMOVED Requirements

### Requirement: Light Up ports the graded solver faithfully

**Reason**: Its heading asserted parity with upstream's C ("faithfully", "exact deductive power"), a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement; a `MODIFIED` block cannot rename a requirement.

**Migration**: Replaced by "Light Up grades boards with a tiered deductive solver", which keeps every tier's deductions and both scenarios without the parity obligation. The frozen differential fixtures may remain as regression tests; they are no longer a requirement.

### Requirement: Light Up generation byte-matches the C reference

**Reason**: It required the published desc to match the C reference byte-for-byte against a committed gated differential, a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement.

**Migration**: Replaced by "Light Up generates solver-gated boards", which keeps the generation procedure, with a seed-reproducibility scenario in place of the byte-match without the parity obligation. The frozen differential fixtures may remain as regression tests; they are no longer a requirement.

### Requirement: Light Up renders to C parity with live error feedback

**Reason**: Its heading asserted parity with upstream's C ("to C parity", a palette index-for-index with the upstream color enum), a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement; a `MODIFIED` block cannot rename a requirement.

**Migration**: Replaced by "Light Up renders with live error feedback", which keeps everything drawn, the cache key and the fixed palette indices the dark-mode overrides rely on without the parity obligation. The frozen differential fixtures may remain as regression tests; they are no longer a requirement.
