# Ledger: latin-solver

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Shared generic Latin-square solver

| Rule | Where it went |
| --- | --- |
| The engine provides a generic Latin-square solver in `src/engine/latin.ts`, for reuse by every Latin-square game | spec: Shared generic Latin-square solver |
| It is the idiomatic-TS port of upstream `latin.c`'s solver framework | history |
| Towers first, with Solo, Unequal, Keen and Group later | history |
| The entry point takes an `o × o` grid, 0 for blank, seeded with the game's fixed cells | spec: Shared generic Latin-square solver |
| The entry point is `latinSolver(grid, o, maxdiff, diffSimple, diffSet0, diffSet1, diffForcing, diffRecursive, usersolvers, valid, ctx)`, eleven positional arguments | untrue: the exported function is `latinSolver(grid, o, cfg)` and those nine values are fields of its `LatinSolverConfig` (`src/engine/latin.ts`), so the requirement now gives that signature and names the fields |
| Up to `maxdiff` it applies positional and numeric elimination, row and column set elimination, single-number set elimination, forcing chains and guess-and-verify recursion | spec: The solver applies the generic deductions up to the difficulty ceiling |
| The generic deductions are interleaved with the game's `usersolvers` at their declared difficulty levels, and validated by the game's `valid` callback | spec: The solver applies the generic deductions up to the difficulty ceiling |
| The solved grid is written back in place, and the return is the difficulty level it solved at or one of the three sentinels with their numeric values | spec: The solver writes the grid back and returns a difficulty or a sentinel |
| The candidate cube is indexed `(x·o + y)·symbols + (n−1)`, with `symbols` being `o` for a Latin square and `o − times + 1` with a repeated symbol | spec: The candidate cube is indexed by cell and then by symbol |
| With `symbols` equal to `o` the index is upstream's `cubepos` exactly | history |
| Scenario: solves a uniquely-determined board | spec: Shared generic Latin-square solver |
| Scenario: reports ambiguity | spec: The solver writes the grid back and returns a difficulty or a sentinel |
| Scenario: respects the difficulty ceiling | spec: The solver applies the generic deductions up to the difficulty ceiling |

## The Latin cube supports a symbol that may repeat in a line

| Rule | Where it went |
| --- | --- |
| The solver supports one declared symbol appearing a stated number of times in each row and column, rather than exactly once | spec: The Latin cube supports a symbol that may repeat in a line |
| Expressing it in the cube is what allows deduction techniques to be written about it | spec: The Latin cube supports a symbol that may repeat in a line |
| This is what a pseudo-Latin puzzle needs, and Salad's empty square is such a symbol | reason |
| The support is opt-in and inert when not requested, with the same deductions in the same order | spec: The Latin cube supports a symbol that may repeat in a line |
| Scenario: a pseudo-Latin puzzle is expressed directly | spec: The Latin cube supports a symbol that may repeat in a line |
| Scenario: existing consumers are unaffected | spec: The Latin cube supports a symbol that may repeat in a line |

## The engine provides a shared, seeded Latin-square generator

| Rule | Where it went |
| --- | --- |
| The engine provides `matching`, `latinGenerate(o, rng)` and `latinGenerateRect(w, h, rng)` in `src/engine/latin.ts` | spec: The engine provides a shared, seeded Latin-square generator |
| The generator was promoted from the Singles port | history |
| The same random state gives the same square, so a seeded game ID keeps its board | spec: The engine provides a shared, seeded Latin-square generator |
| Singles consumes the shared implementation | spec: The engine provides a shared, seeded Latin-square generator |
| Scenario: generated square is Latin and deterministic per seed | spec: The engine provides a shared, seeded Latin-square generator |
