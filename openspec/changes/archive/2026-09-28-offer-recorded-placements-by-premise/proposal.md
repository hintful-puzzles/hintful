# offer-recorded-placements-by-premise

Follows `towers-implicit-strike-window`, 2026-09-28: owner asked, once that was
done, for any engine refactoring that would make future game hints easier.

## Why

`towers-implicit-strike-window` replaced the strike window with a rule: a
recorded strike is available when nothing the board has yet to show comes
before it, or when its premise reads none of it. Recorded **placements** kept
the older, positional rule. A placement with a reason of its own (a clue, a
cage, Group's associativity) was offered only as the first unmade placement,
and only once every other rung came up empty. That was the one way to know
nothing before it was unmade.

So a game whose signature deductions are placements had to decide availability
itself. Group's `leads` rung did: `firstUnreflectedPlaceIndex(ops) === 0` for
the lead, "all three products placed" for associativity, a comment on why
`ops.length > 0` was load-bearing, and a nine-line comment on why a single
must never lead. That is "how this codebase does things" in a game's
directory, and the next placement-first game would have written its own.

## What changes

- `availableStrikes` becomes `availableFirings`, which walks the recording once
  and returns both the strikes and the recorded placements it vouches for, by
  the one rule. A placement's premise is its steps' evidence without the cells
  it places, since it overwrites them.
- `availablePlacements` takes the vouched set; `nothingElse` is left doing the
  one thing that needs it, classifying a skipped single at the last resort.
- The walk hands every rung `RungContext.placements()`, the placements its own
  placement rung would offer, marked `recorded` or single.
- Group's `leads` rung is a three-line filter over it.
- `firstUnreflectedPlaceIndex`, which no production code calls any more, is
  deleted with its tests.

## Effect

Player-visible: recorded placements come where their premise holds rather
than as a last resort, so a plan can continue into one. Six seeds, every leaf
preset, jumps passing over a continuing firing (implicit / populate):

| game | before | after |
|---|---|---|
| group | 1.2% / 6.7% | 0.6% / 0.7% |
| towers | 5.3% / 0.5% | 4.8% / 0.2% |
| solo | 3.7% / 3.0% | 3.0% / 3.1% |

Group's populate plans jump 551 times against 961. Every other game is
unchanged to the jump.
