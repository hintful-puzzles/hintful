# Tasks — spread-the-long-hint-walks

## 0. Before starting

- [ ] 0.1 Read the verdict of Gate run 39882187035 (`b9ddee23`, the first
      with the 45-minute limit and the Crossing ledger entry): `gh run view
      39882187035`. Green confirms both fixes; red is fixed first; canceled
      again means 45 is not enough room either, which makes this change
      urgent. Record its duration beside the 23.5 minutes in the proposal.

## 1. Measure

- [ ] 1.1 Per-file and per-game time of the two walks on CI (the proposal's
      "Measure first").

## 2. Spread

- [ ] 2.1 The walks split over files by a share of `HINT_GAMES`.
- [ ] 2.2 Their coverage checks restated per share or kept across shares.
- [ ] 2.3 The Gate limit brought back down, measured.
