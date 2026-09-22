# show-why-magnets-rules-squares-out — tasks

## 1. Reproduce

- [x] 1.1 Rebuild the owner's board from the screenshot and run the hint:
      `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB` (5x6, strip
      clues) with (1,4)–(1,5) neutral. Its first step is the reported one.
- [x] 1.2 Census the reasons for ruled-out squares in the two count premises.

## 2. Implement

- [x] 2.1 Reasons as phrases in `hint-text.ts`; the two premises' sentences.
      *One clause per kind of reason, row and column merged ("overfill its row
      or column"): listing each axis apart ran the worst case to 311
      characters.*
- [x] 2.2 Per-leg evidence, targets and sentence in `hint.ts`, reading each leg
      against the board with the earlier legs placed. *The count is read there
      too: in the app, the owner's third leg said "needs 3 more +s" with two
      already on the board.*
- [x] 2.3 Tests: the owner's board pinned by desc (sentence, evidence, targets
      per leg, the per-leg count); the ledger entry, both halves seen to run.
      The later-leg ring test was seen to fail with every later leg ringed. No
      Magnets snapshot covers a count step, so none moved.

## 3. Close out

- [x] 3.1 Spec delta; `docs/games/hints.md` § "Show the evidence as an area".
- [ ] 3.2 Run the app on the owner's board; owner acceptance. *Run in Chrome at
      412×900: steps 1 and 3 draw as the tests say.*
