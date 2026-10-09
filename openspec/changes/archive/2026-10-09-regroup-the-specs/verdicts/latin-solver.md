# Verdicts: latin-solver

## reword `latin-solver`: The engine provides a shared, seeded Latin-square generator

Two doubts, one requirement. The clause "so a seeded game ID keeps its board"
goes: docs/doctrine.md ("The app hands out boards, never seeds") and AGENTS.md
§ "What the project is for" say changing which board a seed deals is not a
compatibility break, so the clause promised a player something the owner has
released. What is still live is that the generator is a function of the random
state it is handed, which the per-game description differentials and every
seeded test rest on (`testing`, "A C-recorded fixture is kept for what cannot
be derived, not as a quality bar"), so that sentence stays, word for word, and
only the clause goes. The generalization "a game that deals from a Latin square SHALL use it
and hold no copy" stays as written: no shared capability states a general
no-copy rule for an engine helper (searched the regrouped specs), and all six
games that deal from a Latin square import it today (Keen, Mathrax, Salad,
Singles, Towers, Unequal).

### Requirement: The engine provides a shared, seeded Latin-square generator

The engine SHALL provide the Latin-square generator, square and rectangular,
and a game that deals from a Latin square SHALL use it and hold no copy. Given
the same random state it SHALL produce the same square.

#### Scenario: Generated square is Latin and deterministic per seed

- **WHEN** `latinGenerate(o, rng)` is called
- **THEN** the result contains every value `1..o` exactly once in each row and
  column
- **AND** calling it again from an identical random state yields the same square

## keep `latin-solver`: The candidate cube is indexed by cell and then by symbol

The `o − times + 1` fact now sits here, in the requirement and its scenario,
not in the repeat requirement. It is not only the type's: `LatinSolver.symbols`
gives the number, but the spec is where a game's deduction learns that the cube
strides by it and that one cell's candidates are adjacent, which
`src/games/salad/solver.ts` relies on when it walks `1..solver.symbols`
through `cubepos`. The layout a game's deductions read is the contract the
Purpose names.

## keep `latin-solver`: The Latin cube supports a symbol that may repeat in a line

The doubt named this requirement as the holder of the symbol-count clause. It
no longer carries it, and nothing else about it was in question.
