# Design: keep-definitions-across-placements

**Concluded: neither way of keeping a value across placements is taken.**
Both were built and timed against HEAD, back to back. Rebuilding after a
placement is not what Rect's deals spend their time on, and the bookkeeping
that keeps values across placements cost more than it saved.

## What a deal spends (2026-11-07, HEAD `05ba50d4`)

The sample is six 11×11, four 12×14 and four 15×15 Unreasonable deals and six
Patches 9×12 Normal: 20 deals, about 6.5 s. For the kept definitions:

| Definition | Read | Made | Made after a placement |
| --- | --- | --- | --- |
| `fits(q)` | 58 M | 2.5 M | 2.4 M |
| `reachers(x)` | 36 M | 7.5 M | 5.2 M |
| `core(q)` | | 0.5 M | 0.2 M |
| `sole(q)` | | 26 k | 9 k |

A CPU profile attributes each sample to the outermost kept definition on its
stack:

- **Board-kept `allowed` and `near`**: about 24% of a deal (14% under `fits`,
  10% under `reachers`). They are kept for the board object. The generator
  makes a new one for each board it tries: a mended number, a stripped
  clue, or a second solve of the same clues.
- **Marks-kept `fits`, `reachers`, `core` and `sole`, made and read**: about
  20%. Most of `fits`' share is its 58 M reads, not its makes.
- **The rungs' own loops** (`fit`, `uncovered`, `starve`, `reach`, `overlap`,
  `line`) **and the answer check**: about half.

So the proposal's diagnosis, "`fits(q)` and `reachers(x)` rebuilt for every
clue and square after every firing", names the wrong cost.

## The two ways tried

**Dropping a value by what it read.** The marks logged each placement's
element. One tracker for each marks object held, for each element, the values
that read it, and for each value, the values that read that value. A
definition's body read the marks through a recording `Marks`, and a placement
dropped only the values that read its element. It cut `fits`' makes from
2.56 M to 0.97 M and `reachers`' from 7.45 M to 4.56 M, and every board dealt
was the same. Deals were slower:

| Class (mean ms) | HEAD | Recording |
| --- | --- | --- |
| 11×11 Unreasonable | 246 | 280 |
| 12×14 Unreasonable | 297 | 327 |
| 15×15 Unreasonable | 710 | 771 |
| Patches 9×12 Normal | 331 | 323 |
| Star Battle 10/2 Tricky (two runs) | 1,078, 1,101 | 1,182, 1,167 |
| Star Battle 10/2 Normal (two runs) | 536, 533 | 546, 531 |

Drops are coarse because a Rect firing draws a whole rectangle, and a value
records the open edges it read before its first excluding one. Star Battle's
`ruled(x)` reads every cell, so every placement drops all of it, and it pays
the recording for nothing.

**Refiltering a set that can only narrow.** Hand-made in Rect's compiled
module: `fits(q)` and `reachers(x)` made again after a placement from their
last value, not from `allowed(q)` and `near(x)`. Two A/B runs each,
narrowing off then on, gave a 3 to 6% gain: 15×15 746 and 737 off, 702 and 696
on; 11×11 259 and 255 off, 247 and 256 on. The compiler would have to prove a
definition narrowing by the polarity of each read: `value(e) = k` only ever
turns true, `!=` only false, and a `forall` over a narrowing set can turn
true. A mistake there makes the solver conclude from a set that is too
small. That is not worth 5%.

## What is filed instead

`keep-board-definitions-across-boards`: the 24% that board definitions
spend, made again for every board a generator tries.
