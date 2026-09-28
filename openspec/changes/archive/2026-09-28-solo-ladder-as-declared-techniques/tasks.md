## 1. The ladder

- [x] 1.1 Each technique a method returning `> 0 / 0 / < 0`; `ladder` declares them with ids and tiers, filtered by both caps, each raising its own scale.
- [x] 1.2 Killer rungs read only the board: cages reduced in every killer rung, partial cages cached by filled-cell count.
- [x] 1.3 `run` drives the ladder through `runDeductionFixpoint`; the hand-written loop over the same rungs stays as `runLegacy`.
- [x] 1.4 Compared against HEAD's solver on 494 boards at all 24 cap pairs, verdicts and recordings (design D3).

## 2. Certify it

- [x] 2.1 `solo-ladder.test.ts` on the ladder-equivalence harness, every rung fired by pinned descs.
- [x] 2.2 Seen red on a mis-tiered rung and a reordered rung.

## 3. The replay

- [x] 3.1 The premise audit replays the firing's own rung alone.
- [x] 3.2 Measured tested against put back, and planted a cut premise found now and not on HEAD (design D4).
- [x] 3.3 hints.md and `solo-hint.test.ts` say what the audit now holds and what the recording test still does.

## 4. The region quirk

- [x] 4.1 A region with nothing left for its open cells is a contradiction at every cap; pinned in `solver.test.ts`, red on HEAD.
