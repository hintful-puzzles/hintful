## 1. Measure

- [x] 1.1 Re-take the census from `paramConfig` and `leafPresets`, and keep it
      as a test so it is a query and not this file's list.
      (`hint-enrollment.test.ts`, "every choice the Custom dialog offers is
      dealt".)
- [x] 1.2 Widen the probe on the tiers and modes: enough boards a value to
      have met a fault at Salad's lowest rate (one board in fifty), at more
      than the first preset's size. (The table in `proposal.md`.)

## 2. Decide, per value

- [x] 2.1 The tiers: a walk without a preset. Whether a menu should offer the
      tier is `review-preset-counts-across-the-catalog`'s.
- [x] 2.2 The rules and modes: a walk without a preset, except ABCD's rule
      against diagonal touching, which no preset accepts and which got one.
- [x] 2.3 The generator's-taste values: walked. No ledger of excuses.

## 3. Build

- [x] 3.1 `unofferedValues` and `dealtBoards` in `engine/testing/presets.ts`;
      `gatePresets` calls it, and so do `desc-error-games`, `candidate-reading`,
      `mistake-invariant` and `firing-replay`. The `NO_BOARD` ledger is
      asserted exact, and is empty.
- [x] 3.2 Plant a throw behind an unoffered tier and watch a guard go red.
      (Group's Hard: ten cases in five files.)
- [x] 3.3 The two guards whose setup the new boards did not fit:
      `candidate-reading` and `mark-all`.

## 4. Close

- [x] 4.1 `docs/games/testing.md` § "Slicing a preset sweep for the gate" says
      what a guard deals and what has no board.
- [x] 4.2 `engine/testing/presets.ts`'s "is not an axis" paragraph says what
      is true afterwards.
- [x] 4.3 `review-preset-counts-across-the-catalog` no longer names the walk
      as a reason a menu needs a tier.
