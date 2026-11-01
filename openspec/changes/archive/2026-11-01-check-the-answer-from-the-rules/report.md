# Report: the answer checked from the rules

Measured 2026-11-01 against `384b1bb1`. Three instruments: a scratch
comparison that ran HEAD's hand-written checks and the compiled `isAnswer`
side by side; `research/describe/trace-latin.test.ts` (every preset's deal,
three seeds, and each hint step's rung, move and words); and
`research/describe/speed-latin.test.ts` (the solver over every preset, now
Unruly and Seismic too). A planted defect (the compiled domain loop removed)
fails `src/describe/answer-check.test.ts`, so that guard sees what it claims
to.

## What retired

Towers' `towersValid`, Keen's `keenValid`, Group's `groupValid`, the edge-clue
games' `clueValid`, Mathrax's `valid: null` (its readings checked the clues),
Salad's `latinholesCheck` and `checkBorders`, Solo's `checkValid`, Unruly's
`isComplete` body and its validators' verdicts, Seismic's `validateGame`
verdict, and `LatinSolverConfig`'s `valid`, `ctx` and `ctxNew`. The Latin
solver takes a required `isAnswer`.

**Kept, with the reason**: each game's error overlay (`markErrors`,
`markRows`, `markCounts`, Solo's `checkKillerCageSum`). An overlay judges a
partial board and draws per-cell flags, and a rule's failing binding is not
the cells a player should see marked; it never decides solved
(`docs/descriptions.md` § "The answer check").

## The comparison

All ten described games, every leaf preset, two seeds, 230 boards and 60
mutants each:

- **Every deal and solved board** gets the same verdict from both checks.
- **Mutants that differ**, all out of a player's reach:
  - Unequal (43) and Adjacent (8): the old check accepted the value
    `order + 1`, outside the domain. Entry caps a digit at the order.
  - Seismic (124 value swaps, 188 others): `validateGame` never checked a
    number against its area's size, and accepted one above it. The input
    refuses `n > size`.
  - Salad (12): a blank stored as `nums + 1`, the compiled grid's empty
    square, is now read as empty where the old border scan read it as a
    letter. A player's entries are `1..nums`.

## Fixtures, deals and hint walks

The trace of all ten described games (28,263 lines) is identical on HEAD and
after the change. The suite's fixtures and snapshots are unchanged.

In Chrome, Auto-solve on the first preset of each of the ten games, and on
Unruly's 8x8 Normal with unique rows, ends with the board called solved and
the completion dialog shown.

## Speed

`speed-latin`, twelve seeds, run in both orders: every game within noise.
Seismic's keep-apart rule, quadratic in the grid, costs nothing measurable
(`7x9Tdh` 649.8 against 647.7 ms). Salad first ran 5 to 15% slower, since
`saladSolve` ran the check a second time after the solver had; it now reads
the solver's verdict and is equal or faster (5n4Bdx 213 → 199 ms).
