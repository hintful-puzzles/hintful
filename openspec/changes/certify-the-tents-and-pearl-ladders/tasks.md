# certify-the-tents-and-pearl-ladders — tasks

Read `docs/games/solver-and-generator.md` § "Proving an adoption: the fixtures
are not enough" first; its note on monotone ladders applies (the census, not
the board comparison, is what catches a silenced rung).

## 1. Tents

- [ ] 1.1 Adopt `runDeductionFixpoint`; keep upstream's loop as the oracle.
- [ ] 1.2 `tents-ladder.test.ts` over every preset and tier cap.
- [ ] 1.3 Plant each rung (silence it, and mis-tier the upper ones); watch the
      census or the differential go red; restore.

## 2. Pearl

- [ ] 2.1 Run the harness against the Tricky pass that does not restart after
      its middle stage fires. Decide adoption or no-go on what it shows.
- [ ] 2.2 Either the ladder test as for Tents, or the no-go row with its reason
      and a census through the bespoke loop's `firings` sink.

## 3. Close out

- [ ] 3.1 Spec deltas for `tents` and `pearl`, stating their certified ladders.
- [ ] 3.2 Update the guides with anything they did not say.
