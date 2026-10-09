# Cuts: latin-solver

Requirements: 6 before, 5 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| Shared generic Latin-square solver | duplicate | Merged into "The solver applies the generic deductions up to the difficulty ceiling", which now opens with the rule that the engine provides one solver for every Latin-square game. |
| "It SHALL expose a `latinSolver(grid, o, cfg)` entry point that takes an `o × o` grid (0 = blank) … and a configuration carrying `maxdiff`, `diffSimple`, `diffSet0`, `diffSet1`, `diffForcing`, `diffRecursive`, `usersolvers`, `valid` and `ctx`" (same requirement) | type | The signature of `latinSolver` and the `LatinSolverConfig` interface in `src/engine/latin.ts` declare each. |
| "in `src/engine/latin.ts`" (same requirement, and The engine provides a shared, seeded Latin-square generator) | how | Which module holds it; `docs/games/engine-catalog.md` § "`latin.ts` — Latin-square solver *and* generator" names the file. |
| Scenario "Solves a uniquely-determined board" (same requirement) | duplicate | Restates "The solver writes the grid back and returns a difficulty or a sentinel", which keeps its own scenario. |
| "(10)", "(11)", "(12)" (The solver writes the grid back and returns a difficulty or a sentinel) | declared | The exported constants `DIFF_IMPOSSIBLE`, `DIFF_AMBIGUOUS`, `DIFF_UNFINISHED` in `src/engine/latin.ts`; callers compare by name. |
| "numeric" (same requirement: "one of the numeric sentinels") | type | `latinSolver` returns `number`, and the three sentinels are exported numeric constants. |
| "`matching` (randomized bipartite matching), `latinGenerate(o, rng)`, and `latinGenerateRect(w, h, rng)`" (The engine provides a shared, seeded Latin-square generator) | type | The exports of `src/engine/latin.ts`; the requirement keeps that there is a square and a rectangular generator. |
| "Singles SHALL consume the shared implementation." (same requirement) | particular | One game named where six deal from it; restated as the rule for every game: use the shared generator and hold no copy. |
