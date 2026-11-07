# keep-board-definitions-across-boards

**Status: filed by `keep-definitions-across-placements` (2026-11-07)**, from
what Rect's deals measured there (that change's `design.md`).

## Why

A board-kept definition (`docs/descriptions.md` § "What a technique
compiles to") is kept for the board object, its dealt clues. A generator that
tries many boards makes it again for each one, though they differ in one clue.
Rect's mender moves one number a try, its Patches stripping hides one clue
a try, and `ladderFinishes` and `searchAnswers` each build their own board
from the same clues.

Measured 2026-11-07 at HEAD `05ba50d4` over 20 Rect deals (six 11×11, four
12×14 and four 15×15 Unreasonable, six Patches 9×12 Normal): 6,417 boards.
`allowed(q)` was made 183 k times and `near(c)` 1.04 M times, about 24% of the
deals' time between them (14% and 10%). They are the largest share that a
change to the engine, rather than to Rect's rungs, could take. Keeping marks-kept
values across placements could take at most a few percent, and was
declined.

Galaxies pays it too (2026-11-07, `describe-galaxies`, twenty 15×15
Normal deals profiled): `near(c)` and the `room(q)` it reads are 17% of a
deal, made again for each board as the generator moves a dot.

## What Changes

- **A board-kept value is kept across boards that agree on what it read**,
  or made cheaply enough that keeping does not matter. The first question is
  which:
  - Keyed by what it read: `allowed(q)` reads its own clue and whether each
    square of each rectangle round it holds a number. A clue index moves
    when a number moves, so the key would be the clue's square, not its
    index.
  - Made cheaper: `allowed(q)`'s `count(x in cells(r) where clue(number, x) !=
    none) = 1` walks every square of every rectangle. A count over a
    rectangle of what the board deals could be a prefix sum kept for the
    board: a lookup a rectangle.
- **Measured on Rect's Unreasonable and Patches deals** against the
  change's own HEAD, back to back, boards dealt unchanged.

## Open

- Whether the board objects can simply be shared: how many of the 6,417 are
  the same clues built twice (`ladderFinishes` then `searchAnswers`), which a
  cache by the clues' content would serve without any keying in the engine.
