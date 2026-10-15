# Tasks

## 1. Re-take the figures (2026-10-15)

- [x] 1.1 Time 100 seeds of 10x10 two stars at Easy and Normal, under
  vitest and as bundled JavaScript in node (what the browser's V8 runs).
  Under vitest: p95 3.6 s and 5.2 s. In node: p95 1.8 s and 2.1 s; vitest
  costs about twice node on this code.
- [x] 1.2 Count where a deal goes (node, 100 seeds): the search for a second
  answer is three quarters of it, and 8,600 of 13,000 searches spend their
  whole budget meeting none; half the draws fail, each after its whole
  allowance of 200 moves; at Normal a quarter of the boards mended are
  Easy and thrown away.

## 2. The mend

- [x] 2.1 Keep every second answer the search meets, and drop only those a
  move breaks (a star in the cell moved); search only when none is left.
- [x] 2.2 After a search that met none, let the cheap move go on alone while
  it gains, and search again when it stops gaining (`QUIET` moves) or has
  no cell to move.
- [x] 2.3 Give up a draw that has gone `STALL` moves without leaving fewer
  cells open than it ever has.
- [x] 2.4 Aim at the tier: a board the easier ladder finishes too walks on,
  keeping the tier's ladder finishing it, for as many moves as the deal has
  spent. A fixed cap and no cap were each worse on one shape (three stars
  are quick to mend and cheap to redraw; two stars are dear).
- [x] 2.5 Each of 2.1 to 2.3 taken out alone raises the p95 (pool: 0.53 to
  0.79 s at Easy; stall: to 0.89 s).

## 3. The ladder

- [x] 3.1 The count of lines against regions takes each region's span of
  rows and columns once a call, and every run length in one pass, in place
  of a filter of every region's cells for every run.
- [x] 3.2 A trial star looks only at the units it touches; a unit needing
  one star with two open cells is not tried for `needed`.
- [x] 3.3 Every firing as before: the hint snapshots pass unchanged and the
  mend's counts of searches, solves and moves are identical before and
  after.

## 4. The menu

- [x] 4.1 Measure every shape the menu could carry: 100 deals each, bundled
  in node, 2026-10-15, the 95th deal.

  | Board | Easy | Normal | Tricky |
  | --- | --- | --- | --- |
  | 5x5, one star | 6 ms | 44 ms | 63 ms |
  | 6x6, one star | 13 ms | 50 ms | 148 ms |
  | 8x8, one star | 81 ms | 221 ms | 648 ms |
  | 8x8, two stars | 4 ms | 159 ms | 8.7 s (44 deals) |
  | 9x9, two stars | 102 ms | 155 ms | 482 ms |
  | 10x10, two stars | 696 ms | 698 ms | 1.08 s |
  | 12x12, two stars | 89 s (7 deals) | 15 s (25) | not taken |
  | 12x12, three stars | 43 ms | 1.9 s | 13 s (33 deals) |

  In Chrome, the same bundle: 10x10 two stars p95 536 ms at Easy, 437 ms
  at Normal and 829 ms at Tricky; 9x9 Tricky 318 ms.
- [x] 4.2 The menu offers Tricky for two stars at 9x9 and 10x10. 8x8 stays
  at Normal (a Tricky board is rare there), three stars stay at Easy, and
  12x12 of two stars stays off the menu.

## 5. Close

- [x] 5.1 The guide: `docs/solver-and-generator.md` § "A draw that fails
  often is mended, not retried" takes what this taught.
- [x] 5.2 The archived design's figures stand as history; the new table is
  4.1.
- [x] 4.3 The 10x10 Tricky preset brought the hint-length guard a trial
  that completes a column and leaves its own region short, at 121
  characters; it now reads "leaving this region nowhere for 1 more star"
  (114).
- [x] 5.3 Run the app: the Type menu lists 9x9 and 10x10 Tricky under two
  stars; a 10x10 Tricky board deals and the hint plays it to the end.
