# find-why-bridges-grades-a-grown-board-differently

**Status: scaffolded, not started (2026-10-05).** Found by
`settle-the-cells-the-tier-walk-still-lists`, which worked around it.

## Why

Bridges' solver gives one board two verdicts, depending on how the state it
is handed was built. Measured 2026-10-05: with the generator grading the state
it grew, 4 of 1,200 boards dealt at Tricky (`5x5i30e10m4d2`, `11x11i5e10m3d2`
and `11x11i5e10m4d2`, 400 each) solved at **Easy** once read back from their
descs, and at every cap above it. In memory, the same board had not solved at
Normal, which is how it passed the tier gate. Four of them:

- `5x5i30e10m4d2:5aAa3i2b3b4c5`
- `11x11i5e10m3d2:4b7f2zzf2zn3b2g`
- `11x11i5e10m3d2:2i1zg4d7d2zzh2e`
- `11x11i5e10m4d2:5dAd3v4zzx3d3e`

The generator now grades `newStateFromDesc(p, encodeGame(st))`, so what it
deals is graded as the player gets it, and `bridges.test.ts` holds that over
80 deals of `11x11i5e10m4d2`, the 78th of which was such a board. None was
seen at two bridges a line.

## What is known and what is not

- **The cause is not known.** A grown state lists its islands in the order
  they were placed and a loaded one in reading order, so the likely cause is
  a deduction whose result depends on the order islands are visited in: a
  solver pass that is not run to a fixpoint. That is a guess; nothing here
  tested it.
- If it is so, the hint walks the same rungs (`bridgesRecordingPass`) over a
  loaded state, and the question is whether a loaded board can also come out
  harder than it is under another island order. Every board a player has is
  loaded in reading order, so no player sees two verdicts today.
- The frozen C fixtures still match byte for byte with the gate reading the
  desc back, so none of them was such a board.

## What Changes

Read `Solver.solveSub` and the three techniques for where the visiting order
can change the result, and make the verdict a function of the board. Then the
generator's read-back is redundant and may go, with the 80-deal test kept.

## Hints to pull in

None.

## What would show it worked

One of the four boards above, built both ways, solves at the same lowest cap,
and a test shuffles the island order of a few hundred dealt boards without
changing any verdict.
