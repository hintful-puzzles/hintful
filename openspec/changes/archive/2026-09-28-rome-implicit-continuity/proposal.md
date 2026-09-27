# rome-implicit-continuity

Found by `fold-notes-into-conclusions`, 2026-09-25. Taken on and finished
2026-09-28.

## Why

Rome's plan under the implicit reading is about 0.70 the length of its populate
plan, measured over every leaf preset at six seeds, and by the collection's rule
that makes it a candidate for the default. It was not switched because
`hint-frontier.test.ts` then measured it passing over a continuing firing on
**13.7%** of its jumps (bound: 10%), and **14.1%** with the fold disabled. The
populate plan passes.

A player can pick the implicit reading today, so the jumpier plan already ships
to anyone who chooses "Only as needed" in Rome. The continuity guard never saw
it, because it walks each game's default reading only.

## What it found

**Most of Rome's figure was the instrument's, and the same blind spot hid real
jumps in four games' default plans.** Read out loud, the first counted jump was
"this square must point left", then "every other way this square can point is
already used in its area, so it must point right" for a square in the same area.
The second step continues the first: the arrow just placed is one of the arrows
"already used". But a single in a cell with no notes (`regionsFull`) outlines
nothing, so neither the walk's frontier nor `plan-continuity.ts` could see what
it rests on. A hidden single over note-less cells has the same gap one level
down: it rests on the placed values ruling the digit out of each other cell.

Graded with the premise visible, HEAD's plans (six seeds, every leaf preset):

| Game, implicit | as measured | premise visible | walk reads it too |
|---|---|---|---|
| Rome | 14.5% | 6.3% | 5.7% |
| Solo (default) | 8.8% | 18.1% | 6.5% |
| Group (default) | 3.9% | 21.4% | 3.4% |
| Seismic (default) | 6.6% | 22.4% | 7.3% |
| Mathrax (default) | 5.2% | 14.3% | 3.5% |
| Unequal (default) | 9.6% | 10.8% | 6.6% |
| Towers | 13.6% | 17.0% | 12.9% |

## What changes

- The candidate walk adds a single's premise to its step's `reads`: for a
  `regionsFull` single, every placed cell ruling out one of its other values;
  for a hidden single, the placed cells ruling the value out of each note-less
  cell of its line. Nothing draws them. The frontier then continues into the
  single a placement completes.
- `plan-continuity.ts` reads `reads` as premise, as the frontier does.
- `hint-frontier.test.ts` walks every reading a game offers, derived from the
  `Ui`, and holds Towers' implicit plan, still over the bound, in an
  `OVER_BOUND` ledger it asserts is still over.
- Rome's default reading becomes `implicit`, following the measurement.
- Towers' remaining implicit figure has its own change,
  `towers-implicit-strike-window`.
