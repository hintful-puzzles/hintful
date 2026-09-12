## ADDED Requirements

### Requirement: Pearl ports the deductive solver and solver-gated generator

The port SHALL implement `pearl_solve` as pure iterative constraint propagation
(no guessing or recursion) over the edge/square workspace: edge↔square
elimination, the black-pearl and white-pearl clue deductions, and shortcut-loop
detection over a union-find, with the Normal tier additionally applying the
premature-short-loop rules. It SHALL return the three-valued verdict
(inconsistent / unique / ambiguous), and a grading routine SHALL return the
easiest difficulty that yields a unique solution. The generator SHALL build a
random loop via the shared `generateLoop` (biased toward black-pearl corners),
derive a maximal clue set, gate on the solver finding a unique solution at the
requested difficulty (and failing one tier easier), then greedily minimize the
clues, generating a 5×5 Normal request at Easy. `solve` SHALL return
the generator's aux when present, else re-solve from the clues.

#### Scenario: Generated boards are uniquely solvable at their difficulty

- **WHEN** a board is generated with `nosolve = false` and graded by the TS solver
- **THEN** the grading is a unique solution at exactly the requested difficulty

## MODIFIED Requirements

### Requirement: Pearl reports completion and mistakes

The game SHALL compute completion and always-on error marks by
`check_completion`'s rules — a union-find loop classification flagging squares of degree
greater than two, non-reciprocal links, and clue contradictions, and setting the
completed flag only when the lines form one closed loop satisfying every clue.
Because boards are uniquely solvable by default, the game SHALL implement
`findMistakes`: re-solve from the clues to the unique solution's line grid and
return every line segment the player has drawn that the solution does not contain
(a definite mistake); a *missing* solution segment is not a mistake, and a board
that is not uniquely solvable (a `nosolve` board) yields no mistakes. Check & Save
depends on this hook and SHALL refuse to save while any mistake is present. The
always-on error marks and the `findMistakes` overlay are distinct signals.

#### Scenario: A line the solution does not contain is flagged

- **WHEN** the player has drawn a loop segment that the unique solution does not
  contain, and `findMistakes` is invoked
- **THEN** that segment is returned as a mistake

#### Scenario: A correct partial board has no mistakes

- **WHEN** the player has drawn only loop segments that the unique solution
  contains
- **THEN** `findMistakes` returns an empty result

### Requirement: Pearl input and rendering

`interpretMove` SHALL support drawing the loop by dragging along grid edges
(committing the traced path as a sequence of line-segment flips, respecting
existing no-line marks as barriers and the loop-closure degree rule), marking
"no-line" crosses with the secondary (right) drag, and a keyboard cursor that
draws lines or marks with modifiers; an in-place autosolve hint on the `H` key; a
drag or click that changes nothing SHALL produce no move; laying a line over a
mark SHALL be rejected. `redraw` SHALL render the grid in the selected appearance
style (traditional square outlines, or loopy center-dots plus inter-cell grid),
the black and white pearls, the no-line crosses, the loop segments (with the drag
preview and error recoloring), the flagged-mistake segment color, and the
completion flash.

#### Scenario: A drag draws a loop path

- **WHEN** the player left-drags along a sequence of grid edges
- **THEN** `interpretMove` yields a move whose execution sets those loop segments

#### Scenario: A no-op drag yields no move

- **WHEN** the player drags or clicks in a way that would change no segment or
  mark
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

## REMOVED Requirements

### Requirement: Pearl ports the deductive solver and solver-gated generator faithfully

**Reason**: It required the generator's desc and aux, by reproducing the upstream RNG draw order and its `corners`-array quirk, to match upstream's C byte-for-byte, a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement, and that obligation is a scenario of its own, which a `MODIFIED` block cannot drop.

**Migration**: Replaced by "Pearl ports the deductive solver and solver-gated generator", which keeps the solver, the grading routine, the generation procedure (including the 5×5 downgrade) and the uniqueness scenario without the parity obligation. The frozen differential fixtures may remain as regression tests; they are no longer a requirement.
