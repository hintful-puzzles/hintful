## ADDED Requirements

### Requirement: The engine provides a shared, seeded Latin-square generator

The engine SHALL provide, in `src/engine/latin.ts`, the Latin-square
generator promoted from the Singles port: `matching` (randomized
bipartite matching), `latinGenerate(o, rng)`, and `latinGenerateRect(w, h, rng)`.
Given the same random state they SHALL produce the same square, so a seeded game
ID keeps its board. Singles SHALL consume the shared implementation.

#### Scenario: Generated square is Latin and deterministic per seed

- **WHEN** `latinGenerate(o, rng)` is called
- **THEN** the result contains every value `1..o` exactly once in each row and
  column
- **AND** calling it again from an identical random state yields the same square

## MODIFIED Requirements

### Requirement: The Latin cube supports a symbol that may repeat in a line

The shared Latin-square solver SHALL support puzzles in which one declared symbol
may appear a stated number of times in each row and column, rather than exactly
once. This is what a *pseudo*-Latin puzzle needs — Salad's empty square is such a
symbol — and expressing it in the cube is what allows deduction techniques to be
written about it.

The support SHALL be opt-in, and SHALL be inert when not requested: a puzzle that
declares no repeatable symbol SHALL produce exactly the deductions, in exactly the
order, that it produces without the support.

#### Scenario: A pseudo-Latin puzzle is expressed directly

- **WHEN** a puzzle declares a symbol with a per-line multiplicity greater than
  one
- **THEN** the solver reasons about that symbol's placements in the cube, without
  the caller translating it into and out of a single-occurrence encoding

#### Scenario: Existing consumers are unaffected

- **WHEN** a puzzle declaring no repeatable symbol is solved
- **THEN** the solver's deductions and their order are unchanged

## REMOVED Requirements

### Requirement: Shared Latin-square generator

**Reason**: It required the generator's draws to stay bit-identical to upstream `matching.c` / `latin.c` so a game reproduces the C description, and its scenario is named for that fidelity. Matching upstream's C was a porting tool; with the port finished it is not a requirement (owner, 2026-09-13), and a heading or scenario that names it cannot be renamed by a `MODIFIED` block.

**Migration**: Replaced by "The engine provides a shared, seeded Latin-square generator", which keeps the Latin property and determinism per seed.
