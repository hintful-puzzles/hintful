# Tasks — spread-the-long-hint-walks

## 0. Before starting

- [x] 0.1 Read the verdict of Gate run 39882187035 (`b9ddee23`, the first
      with the 45-minute limit and the Crossing ledger entry): `gh run view
      39882187035`. Green confirms both fixes; red is fixed first; canceled
      again means 45 is not enough room either, which makes this change
      urgent. Record its duration beside the 23.5 minutes in the proposal.
      Green, 39 minutes.

## 1. Measure

- [x] 1.1 Per-file and per-game time of the two walks on CI (the proposal's
      "Measure first"). In `design.md`: hint-quality spread over games,
      hint-resume held by Loopy, and Loopy by one board.

## 2. Spread

- [x] 2.1 The walks split by a share of `HINT_GAMES`: vitest projects, one
      per share, over the files in `vitest.config.ts`'s `SPREAD`.
- [x] 2.2 Their coverage checks restated per share: censuses over the share's
      own games, floors at the share's part, the forms check on a game that
      meets each form.
- [x] 2.3 hint-resume's CI walk recomputes up to 512 times a board.
- [ ] 2.4 The Gate limit brought back down, measured on the first CI run of
      the spread suite.
