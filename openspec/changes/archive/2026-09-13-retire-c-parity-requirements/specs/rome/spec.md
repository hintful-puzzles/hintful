## ADDED Requirements

### Requirement: Rome solves by deduction and generates soluble boards

Rome SHALL provide a solver that fills the grid by pure deduction, or reports
that the board is invalid or incomplete. Validity SHALL be judged by merging
each arrow with the square it points at into a disjoint-set forest and flagging
any arrow that points off the grid, any duplicate arrow within an outlined
region, and any arrow that forms a loop. The solver SHALL apply its
deduction rules gated by difficulty — Easy, then the
additional Normal rules, then the additional Tricky rule — and SHALL NOT
backtrack or guess at any difficulty.

The generator SHALL use the solver to keep every board soluble: it SHALL fill
the grid with arrows in single-cell regions, merge outlined regions randomly
while keeping arrows within a region distinct, and remove redundant clues,
accepting a board only when it is soluble at the target difficulty and not
soluble at the difficulty below. Generation from a given seed SHALL be
reproducible.

#### Scenario: The solver completes a soluble board without guessing

- **WHEN** a soluble board is solved at its difficulty
- **THEN** every square is filled by deduction and the result reaches a goal from
  every square with no loops and no duplicate arrows in any region

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same size, difficulty and seed are used twice
- **THEN** both runs produce the identical board description

## REMOVED Requirements

### Requirement: Rome ports the deductive solver and generator faithfully

**Reason**: It required upstream's deduction rules in upstream's order over the bit-identical RNG, and its heading asserts faithfulness — parity with upstream's C, a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement; a `MODIFIED` block cannot rename a requirement.

**Migration**: Replaced by "Rome solves by deduction and generates soluble boards", which keeps the validity rules, the difficulty-gated deductions, the generation procedure and both scenarios without the parity obligation. The frozen differential fixtures may remain as regression tests; they are no longer a requirement.
