## ADDED Requirements

### Requirement: Boats solves with a four-tier deductive solver

Boats SHALL provide a solver that finds the fleet placement by deduction, or
reports that no deduction completes it. The solver SHALL apply progressively
harder named technique tiers — Easy, Normal, Tricky, Hard — and SHALL report the
highest tier a board actually requires. The solver SHALL NOT guess or backtrack at
any tier, so that every generated board is solvable by pure deduction and Boats
satisfies the guess-free-generation policy at every named difficulty.

Boat connectivity SHALL be computed over the shared disjoint-set structure, whose
canonical root identity the solver reads (the canonical square of a boat run), so
the port SHALL NOT substitute a union-find with a different root rule.

The solver's deductive power is **not monotone in its difficulty cap**: the
unfinished-boat disjoint-set check, which runs only from the second tier upward,
can report a contradiction on a board that has none and abandon the solve. It
never places a wrong square, so every generated board remains correct and
uniquely solvable, but a board generated at the easiest tier may fail to solve
under a higher cap. Any consumer that solves a board of unknown difficulty —
Solve, and the mistake check — SHALL therefore try each difficulty tier and use
the first that succeeds, rather than solving once at the maximum.

The generator SHALL use the solver to guarantee a unique solution at exactly the
requested difficulty: it SHALL place a random fleet, derive the border clues,
optionally hide border numbers while the board stays soluble, and reject any board
not solvable at exactly the target difficulty. Generation from a given seed SHALL
be reproducible.

#### Scenario: The solver reports the required difficulty

- **WHEN** a soluble board is solved
- **THEN** the returned tier equals the hardest technique tier the deduction
  needed, and the completed grid is the unique solution

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

## REMOVED Requirements

### Requirement: Boats ports the four-tier deductive solver faithfully

**Reason**: Matching upstream's C output was a porting-era aid, retired by the owner on 2026-09-13 as no longer a concern. Its heading promised a faithful port of upstream's solver. The requirement is restated under a name that does not assert fidelity to upstream, which a `MODIFIED` block cannot rename.

**Migration**: Replaced by "Boats solves with a four-tier deductive solver", whose body is unchanged.
