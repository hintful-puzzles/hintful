## 1. Reproduce

- [x] 1.1 In the app, on `6x7mOde:a42_5_6_11e10c1g22d30_21d31h`: two hints applied, 12 placed by hand, and "Step 2 of 9" appears unasked
- [x] 1.2 Through the midend, over three boards a preset: how often, and how long a run of unasked sentences

## 2. The engine

- [x] 2.1 `Midend`: a `"completed"` move hides the display whatever the next step is flagged as; an `"onTrack"` move keeps a step displayed only where it was
- [x] 2.2 `HintStep.continuesPrevious`: its comment says what reads it now
- [x] 2.3 Midend tests: a leg completed by hand, a hint applied and then a move by hand, an on-track move on a hidden plan; each seen to fail on the midend as it was
- [x] 2.4 Sixteen's midend test of the owner's 2026-06-10 board asks for each leg

## 3. Specs and docs

- [x] 3.1 Deltas for `engine-hints` and `fifteen`
- [x] 3.2 `docs/games/hints.md` § "Engine mechanics", and Spokes' comment on its legs

## 4. In the app

- [x] 4.1 Ascent, the board of 1.1: no sentence after a move by hand, from a hint applied (three moves, then Hint shows "Step 4 of 9") and from a hint only shown (two moves, then Hint shows "Step 3 of 9")

## 5. Acceptance

- [x] 5.1 The owner asked for this by name, and it is theirs to accept in the deployed app: accepted, 2026-10-12. Sixteen and Netslide are where it shows most: a tile's second leg ("then the other") now waits for a press of Hint, which the Sixteen midend test holds and which was not driven in the app
