## MODIFIED Requirements

### Requirement: Bridges solves with a graded multi-stage deductive solver

The solver SHALL run upstream's `solve_sub` stages, gated by difficulty, and
return an impossible / ambiguous / solved verdict. Easy SHALL run stage 1
(force bridges an island must place because its remaining count equals its
available adjacent space, and forbid bridges into a satisfied island). Normal
SHALL additionally run stage 2 (per-direction minimum/maximum reasoning using
each neighbor's own remaining capacity, and, when `allowloops` is false, forbid
a bridge that would complete a premature loop) and **sealing off**: forbid a
first bridge in a direction when that one bridge would finish the island and
its neighbor into a group cut off from the rest, as two neighboring 1s would.
Tricky SHALL additionally run stage 3 (the dsf connected-subgroup deductions
beyond that one: an "at most" limit on a span, a bridge that would leave some
island unable to reach its count, and a direction that must carry a bridge
because filling every other direction would seal a group off). The solver is
purely deductive (no guess-and-verify recursion — upstream `solve_sub`'s
`depth` is unused). The solver SHALL maintain the per-cell possible/maximum-
bridge counts (`map_update_possibles`) as deductions are applied.

Sealing off is upstream's Tricky, taken down to Normal as a deliberate
divergence: it is one bridge and one check, and it is the deduction a player
meets first. Because with one bridge per line no "at most" limit can exist,
Tricky then has almost nothing a Normal board could not need, so generating a
Tricky board with `maxb` 1 SHALL be refused with a reason, while a board already
dealt that way still loads.

#### Scenario: A generated board is uniquely solvable at its difficulty

- **WHEN** a board generated at difficulty `d` is solved from the clue-only state
- **THEN** the solver returns solved at `d`, and a Normal/Tricky board is not fully
  solved at the tier below it

#### Scenario: Two neighboring 1s are kept apart at Normal

- **WHEN** a Normal board's only way to finish an island is a bridge to a
  neighbor that the same bridge would finish, sealing the pair off
- **THEN** the Normal solver blocks that bridge, and the Normal hint narrates it
  as a finished group sealed off

#### Scenario: Tricky with one bridge per line is refused

- **WHEN** a Tricky board with `maxb` 1 is asked to be generated
- **THEN** the params are refused with a reason, and a `params:desc` id with
  those params still loads
