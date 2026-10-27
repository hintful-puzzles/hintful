# Tasks

## 1. Where the time goes

- [x] 1.1 Profile a dozen 10x10 and 8x12 deals at each tier: loops tried, gate solves and their time, removal solves; record the shares here with the date
      2026-10-27, a CPU profile of four deals of each of 10x10 and 8x12 at
      both tiers (46 s in all): the loop bias (`makeBias`) 83%, the gate's
      solves 11%, the removal's solves under 1%. Loops tried a deal: median
      144 (10x10 Easy) to 188 (8x12 Easy), most 574. The bias rescanned the
      whole board on each of its calls, two per candidate face per step,
      where upstream's `pearl_loopgen_bias` keeps incremental state.

## 2. The generator

- [x] 2.1 Speed up what the profile names, keeping every board's gate and the removal's one-solution check; Pearl's tests and `difficulty-contract` with the slow tier on pass
      The bias refreshes only what the changed face touches, on flat arrays;
      the solver reads a square's surviving states and its edges' OR and AND
      from tables, and an edge's index from a per-board step. A 10x10 Easy
      deal went from 2,986 ms to 180 ms on average. Nothing a deal decides
      moved: the old rescan and the new bias agreed at all 543,776 calls over
      300 loops (and disagreed at call 8 with the neighbor re-check planted
      out), HEAD and the working copy dealt the same desc and aux on 400
      seeds from 6x6 to 10x10, and the C fixtures still match byte for byte.
- [x] 2.2 Read each moved fixture or snapshot: a seed's board may change, a desc format may not
      No fixture moved. `pearl-4` (10x10 Easy) took 27 s and was on the slow
      tier; it takes 0.5 s and runs on every commit again. The
      `params-stability` lines moved for the menu alone (3.2), and every
      kept size encodes as it did.

## 3. The menu

- [x] 3.1 Time candidate sizes, a dozen deals a tier, with `deal-walk`'s named cells; choose the largest that stay near a second, half or more upright rectangles, 6x6 Easy first
      Slowest of twelve, Easy then Tricky: 10x10 0.3 and 0.4 s, 10x12 1 and
      0.9 s, 12x12 9 and 3 s, 10x14 10 and 2 s, 12x14 44 and 14 s. The
      menu is 6x6, 6x8, 8x8, 8x10, 10x10 and 10x12 at both tiers: twelve
      lines, three rectangles.
- [x] 3.2 Write the menu in `state.ts` with the measurements at the list; keep the default 8x8 Tricky
      Built with `presetGrid`, which Pearl had not used; the other games
      that build theirs by hand are `build-every-menu-from-its-boards`.
- [x] 3.3 Deal the largest new board of each tier in the app on a phone-sized window
      10x12 Easy and Normal at 412x915: both deal at once and fit, and the
      hint runs on them. It showed that a hint's marks outlived the board on
      New game, a preset or a restart, in every game: `Puzzle` dropped the
      words but kept the measured marks, which the colored overlay kept
      painting. Fixed in passing, with a test that failed before it.

## 4. Verification

- [ ] 4.1 The gate, green
