## 1. Measure

- [x] 1.1 Time the six files per test, with load, free memory and swap
      recorded. The box was not idle, so the figures are upper bounds and each
      table is one run (design D1).
- [x] 1.2 For each test over a second: what it asserts, and whether
      `hint-resume.test.ts` or a cheaper test in the file walks the same
      boards (design D3 to D7).
- [x] 1.3 Plant a defect in each planner and record which boards and which
      tests see it (design D3 to D7).

## 2. Act

- [x] 2.1 Spokes: the top-tier boards and the look-ahead's boards are written
      down; both tests say what they alone catch.
- [x] 2.2 Untangle: n=25 at one seed on the gate, with the reason at the site.
- [x] 2.3 Netslide: the every-preset walk left with its reason; the duplicate
      no-answer convergence arm removed; the no-undo test and the reachability
      pick given boards on which the rule decides; the narration corpus takes
      two 5x5 boards.
- [x] 2.4 Solo: the two walks that asked again after every move follow the
      plan.
- [x] 2.5 Sixteen: left, with the reason at its costliest test.
- [x] 2.6 `hint-quality.test.ts`'s whole-sweep floor narrows with the sweep.

## 3. Close

- [x] 3.1 The measurement is in `design.md`.
- [x] 3.2 `docs/games/testing.md` § "Narrowing a game's own sweep" holds the
      four shapes.
