## ADDED Requirements

### Requirement: Slide solves for a shortest path and keeps every board soluble

Slide SHALL provide a solver that finds the minimum number of moves to bring the
main block to the target, or reports that no solution exists. The solver SHALL be
a breadth-first search over canonical board layouts, deduplicating already-seen
layouts by exact board equality and expanding them in first-in-first-out order,
so that the first path found to the target is a shortest one. The solver SHALL
respect a move limit by abandoning the search once every remaining candidate
exceeds it.

The solver SHALL NOT depend on the ordered-collection semantics of upstream's
`tree234`; its result SHALL depend only on the breadth-first order and on exact
layout deduplication.

The generator SHALL use the solver to keep every board soluble: it SHALL remove
singleton blocks until the board becomes soluble, then attempt to merge adjacent
blocks in a randomized order, keeping a merge only while the board stays soluble.
Generation from a given seed SHALL be reproducible.

The generator SHALL test solubility **after** its final singleton removal as well
as before each one. Upstream tests only before, so a board that becomes soluble
only once its last singleton goes falls through its loop into an abort — which is
every board at the smallest legal size. The added check draws no randomness.

#### Scenario: The solver returns the shortest solution

- **WHEN** a soluble board is solved
- **THEN** the reported move count equals the length of a shortest sequence that
  brings the main block to the target, and the returned moves realize it

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description and minimum move
  count

## REMOVED Requirements

### Requirement: Slide ports the shortest-path solver faithfully

**Reason**: Its heading required a faithful port, and its body that the added solubility check change no description upstream produces. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Slide solves for a shortest path and keeps every board soluble", which keeps the solver, the generator and the added solubility check without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.
