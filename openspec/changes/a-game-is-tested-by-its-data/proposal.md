## Why

The owner's decision of 2026-11-23 (`docs/doctrine.md` § "Where the engine
is heading: a game is its description"): a game's tests are data too. Every
assertion is the engine's, and a game's directory holds only what the
engine's tests read.

The games born from their descriptions are already partly there: hint pins
(`describeHintPins`) and planted defects (`*.plants.yaml`) are data, and
the cross-game guards read their games from what each declares. What is
left in their `*.test.ts`, read 2026-11-23 across thirteen of them, falls
into a few kinds that recur from game to game:

- **The mistake check's outline**: "outlines a square Check & Save finds
  wrong, which breaks no rule yet", nearly the same test in ten of the
  thirteen.
- **IDs and params**: upstream's IDs read and written back, a malformed
  desc refused, params read as upstream wrote them, sizes refused.
- **Deals**: each tier dealt, and a deal holding what its options declare
  (symmetry, a fleet whole).
- **Hint scenarios**: a position, moves, and the step expected.
- **Text format**: an ID and the text it writes.
- **Drawing**: a painter's look on a position, such as two shaded squares
  side by side drawn as one domino.

None needs anything only the game can say beyond its data. Doing this
before `describe-the-whole-catalog`'s groups means each group's flips move
a game's tests to data instead of each inventing part of the format.

## What Changes

- **A format for a game's test data**, read by engine tests: examples of
  IDs and params (loaded, written back, or refused with the message
  expected), positions with the outcome expected (the hint's step kind and
  marks, the mistakes found, the live errors, the text, the status), and
  the pins and plants already kept.
- **Engine-side assertions**: the recurring kinds above become cross-game
  guards over the born games, each reading its population from the
  games' declarations; a deal is checked against the options its
  description declares.
- **Each capability tested on a description of its own**, a small fixture
  that is not its first game's, which checks that it is adoptable.
- **The fourteen born games' `*.test.ts` go**, their cases kept as data or
  covered by a guard, none dropped without saying which guard holds it.
- `docs/testing.md` says how a born game is tested; `describe-the-whole-
  catalog`'s rules already require it of every flip.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `testing`: a born game's tests are data the engine reads.
- `described-fill-game`: `deal.leaves` is retired. A fixture could not see
  it, and neither could Light Up, its one game: the answer deals the bare
  wall on every wall, and the game ID writes a numbered wall as its number,
  so all 45 deals tried came out the same with it or without it
  (2026-11-23).

## Impact

`src/engine/testing/` (the readers), `src/guards/` (the new guards),
`src/describe/` (the format's schema, if it lives beside the
description), the born games' directories, `docs/testing.md`
§ "What a new game ships", and `docs/new-game.md` where it names a test
file.
