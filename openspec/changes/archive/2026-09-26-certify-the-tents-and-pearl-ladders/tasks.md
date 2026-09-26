# certify-the-tents-and-pearl-ladders — tasks

Read `docs/games/solver-and-generator.md` § "Proving an adoption: the fixtures
are not enough" first; its note on monotone ladders applies (the census, not
the board comparison, is what catches a silenced rung).

## 1. Tents

- [x] 1.1 Adopt `runDeductionFixpoint`; keep upstream's loop as the oracle
      (`tentsSolveLegacy`). The two Tricky branches are rungs of their own
      (design.md § "The rung boundaries").
- [x] 1.2 `tents-ladder.test.ts` over the preset sizes at both tiers and a
      12x5 board, at the links-only, Easy and Tricky caps. `unreached` is
      empty.
- [x] 1.3 Plant each rung (silence it, and mis-tier the upper ones); watch the
      census or the differential go red; restore. All nine went red.
      `tree-diagonal-pair` silenced was caught only by the census
      (design.md § "What the plants showed").

## 2. Pearl

- [x] 2.1 Run the harness against the Tricky pass that does not restart after
      its middle stage fires. That pass does not exist: the `continue` in
      question is dead code, and the harness agrees on every board at both
      caps. Adopted.
- [x] 2.2 The ladder test as for Tents (`pearl-ladder.test.ts`, `unreached`
      empty); all six plants red.

## 3. Close out

- [x] 3.1 Spec deltas for `tents` and `pearl`, stating their certified ladders.
- [x] 3.2 Update the guides: `solver-and-generator.md` corrects class B, adds
      the "fires often, needed rarely" census lesson and the rule for
      splitting a folded Tricky deduction, and lists both ladders as
      exemplars.
- [x] 3.3 Fold what the census found into `add-tents-hint` and
      `add-pearl-hint`.
