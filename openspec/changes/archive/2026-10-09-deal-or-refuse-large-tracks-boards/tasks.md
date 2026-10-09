# Tasks

Read `docs/games/solver-and-generator.md` (§ "A size that cannot carry a
tier") and `docs/method.md` first.

## 1. See it and measure it

- [x] 1.1 In the running app, ask for 24x24 Easy in the Custom dialog and
      write down what the player is shown and after how long. It dealt, in
      about a second. A 60x8 Easy got "No puzzle dealt" after a few seconds.
- [x] 1.2 A survey over sizes from the largest preset upward, square and
      long, at each tier: of how many seeds, how many deal, how many tries
      the ones that deal take and how long. It is the size and the shape and
      never the tier: with the bound lifted, twelve of twelve dealt at every
      tier at 15x15, 20x20, 20x30, 30x20, 24x24, 30x30 and 12x40, at 73 to
      14,000 tries a board against a bound of 10,000.
- [x] 1.3 Why it fails: the 10,000 attempts are walks, thrown away for a bare
      row or column and then for their 1 clues. Upstream's generator is the
      same walk with no bound.

## 2. Decide and do

- [x] 2.1 The generator is made to deal those sizes: the walk covers every
      line by construction, and `singleOnes` is met by bending the track.
      `tracks.test.ts` deals a 60x8, an 8x60, a 40x12 and a 24x24, and was
      seen red on three of them with the walk allowed to leave early.
- [x] 2.2 Seen in the app: a 60x8 Easy deals, and a 15x15 Easy preset deals
      and auto-solves to the end.
- [x] 2.3 The `tracks` delta; the guide's § "Unlucky, impossible, and
      load-bearing validation" gains the case. `metrics/deal-walk.md` is
      dealt again for Tracks, with no cell giving up.

## 3. Close

- [x] 3.1 Committed, pushed and archived.
