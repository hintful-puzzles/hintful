# Design: Magnets described

## Sections

| Section | What it holds |
| --- | --- |
| What Magnets needed of the language | P as a technique run on a strike; tile marks as nothing new |
| The ladder | upstream's rungs, stated as ten techniques |
| What retired | the hand-written solver and its census entry |
| Against HEAD | the boards, the tiers, the walks, the deals |

## What Magnets needed of the language

Measured at the start (2026-11-02, HEAD `53e8ecc5`): `magnets/solver.ts` 597
lines and `magnets/hint.ts` 894, as the proposal had them.

- **The board**: + is 1, neutral 2 and − 3, so a tile's other end holds 4
  less the value. The tiles are a dealt partition (`tile`), and a square no
  tile covers is neutral by its domain. A line's counts are one clue per
  value (`count`, as ABCD's), the neutral count dealt where a line has both
  pole counts, as upstream derives it.
- **P is `on: strike`**: a technique the engine runs as a fact strikes a
  value from a cell, bound to that cell, which only strikes. Magnets' `tile`
  strikes from a tile's other end the opposite of each value its first end
  has lost, as upstream's `solve_unflag` did. It is needed because a
  strike's consequence must be part of the firing that made it: as a rung of
  its own, the other end would lose its value in a firing the hint shows
  with no reason, and a `?` would appear from nowhere. A placement does not
  run it, since what a placed value rules out is the placing techniques' to
  follow (`pair`, `repel`). The compiler refuses one that places, so a
  strike never changes a value a rung read.
- **Tile marks are nothing new**: a tile marked `?` is neutral struck from
  both ends, a state of the candidates every technique and the checker
  already read. The proposal's "tile marks in the language" was false at
  birth.
- **The checker deals a clue per value at every value some cell's domain
  holds**: it evaluated the domain with no cell bound, which a domain that
  reads its cell cannot be. ABCD, the other game with a clue per value, was
  checked again with `CHECK_AGAIN=1`, every verdict as recorded.

## The ladder

| Technique | Tier | Upstream |
| --- | --- | --- |
| `pair`, `repel` (on placing) | Easy | `solve_set`'s partner and `solve_unflag_surrounds` |
| `tile` (on striking) | Easy | `solve_unflag`'s partner |
| `single` | Easy | `solve_force` |
| `count` | Easy | `solve_checkfull` |
| `oddGap` | Easy | `solve_oddlength` |
| `marked` | Normal | `solve_advancedfull` |
| `oneNeutral` | Normal | `solve_nonneutral` |
| `everyTile` | Normal | `solve_countdominoes_neutral` |
| `onlyEnd` | Normal | `solve_countdominoes_nonneutral` |

All ten are sound at orders 3 and 4, and each plant unsound
(`research/technique-check/results-describe-magnets.txt`).

- **`count` is one technique, not two**: upstream reads each of a line's
  counts in turn, as met or as just reachable. Stated first as two rungs,
  every line's met counts were read before any reachable one, and in the
  walks 287 squares HEAD placed by a reachable count were placed as forced
  singles instead; stated as one, bound by the line and the value
  (`docs/descriptions.md` § "A statement's order is behavior"), the walks
  match HEAD's but for order.
- **`oneNeutral` reads only open tiles**: as first stated, it struck neutral
  from an open square whose other end on the line was placed neutral, and the
  checker found it unsound. Upstream never met that marking, since it places
  both ends at once.
- **`marked` compares `2 * (v - holds)` with `|M|`**: the checker cannot
  divide a count it does not fix.
- **`neither` is retired**: both ends of a tile unable to take + leaves each
  unable to take −, by `tile`, so `single` places neutral first. Its census
  entry said so.
- **Upstream's un-reset counter** in `solve_countdominoes_nonneutral`, which
  counted the + tiles again when reading −, is not stated: `onlyEnd` counts
  each pole's tiles alone, so it reads − where upstream mostly did not.
- **The generator lays its tiles on the same ladder** over a board dealt no
  numbers, where only `single` can fire: upstream's `solve_unnumbered`
  (`force` and `neither`) was that ladder's Easy part.

## What retired

`MagnetsSolver` and its eight rungs, its recorder and `SweepOffers` wiring,
`solveUnnumbered`, the state's completion check (the error overlay keeps
only its like-poles marking; `status` is the compiled answer check), the
frozen differential's byte-match (now each frozen board validates,
round-trips, and grades at its tier to upstream's answer), and the census's
second block and its `unreached` entry.

## Against HEAD

Measured on every preset at each tier, with and without stripped clues, 10
seeds each (120 boards, 2026-11-02, HEAD `53e8ecc5` against this change,
back to back):

- **118 of 120 descs are HEAD's**; the two others, both 9×10 Normal with
  stripped clues, are other boards altogether: the generator accepted
  another laid board, as the Normal ladder's reach moved (they hide 19
  numbers each, HEAD's 16 and 17).
- **Every walk ends solved.** Of the 3,430 tiles both walks decide on the
  118 shared boards, none gets another final mark; 274 are decided by the
  other of `force` and `lineExact` (159 one way, 115 the other), as the two
  walks take their steps in another order. 37 walks are HEAD's step for
  step. HEAD's sentence for a tile placed at the far end of a line
  ("A + at its far end would touch a +") still occurs, 5 times against
  HEAD's 4.
- **Every board HEAD dealt grades at its tier now** (120 of 120, and the 9
  frozen upstream boards), so no save or link stops loading and none changes
  tier. That holds beyond the sample: the Easy closure is HEAD's, and the
  Normal one only grew.
- **Deals cost what HEAD's did**: median and worst, in ms,

| Preset | HEAD | now |
| --- | --- | --- |
| 5×6 Easy | 0.3 / 1.7 | 1.0 / 6.2 |
| 5×6 Easy, strip | 1.2 / 3.3 | 2.3 / 4.5 |
| 5×6 Normal | 1.8 / 3.4 | 2.8 / 12.3 |
| 5×6 Normal, strip | 2.9 / 4.7 | 2.3 / 4.9 |
| 7×8 Easy | 0.8 / 3.4 | 0.8 / 3.6 |
| 7×8 Easy, strip | 2.9 / 4.2 | 2.4 / 3.7 |
| 7×8 Normal | 2.1 / 7.6 | 2.0 / 7.2 |
| 7×8 Normal, strip | 6.6 / 11.2 | 4.7 / 9.8 |
| 9×10 Easy | 12.1 / 41.0 | 11.3 / 37.8 |
| 9×10 Easy, strip | 9.9 / 25.1 | 8.4 / 22.0 |
| 9×10 Normal | 14.1 / 33.0 | 12.6 / 25.1 |
| 9×10 Normal, strip | 19.2 / 38.9 | 11.7 / 25.9 |

The smallest boards' first deals carry the module's warm-up.

**In the running app** (Chrome): the owner's playtest board from 2026-09-22
walks by its hints to the finish, its fifth step the owner's second
playtest sentence word for word; a freshly dealt 5×6 Normal board with
stripped clues marks magnets `?` and explains a line with one neutral square
left.
