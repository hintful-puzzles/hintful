# Tasks

Read `docs/games/solver-and-generator.md` (§ "A size that cannot carry a
tier") and `docs/method.md` first.

## 1. See it and measure it

- [ ] 1.1 In the running app, ask for 24x24 Easy in the Custom dialog and
      write down what the player is shown and after how long.
- [ ] 1.2 A survey over sizes from the largest preset upward, square and
      long, at each tier: of how many seeds, how many deal, how many tries
      the ones that deal take and how long. It says where a deal starts to
      fail and whether it is the size, the shape or the tier.
- [ ] 1.3 Why it fails: read what the 10,000 attempts are attempts at, and
      what upstream's generator (`../puzzles/tracks.c`, read only) does at
      the same sizes.

## 2. Decide and do

- [ ] 2.1 If the generator can be made to deal those sizes at a cost a player
      would accept, fix it, with a test that deals one. Otherwise state the
      bound, and put the refusal to the owner with the measurement before
      writing it.
- [ ] 2.2 Whichever it is, seen in the app: the size deals, or is refused in
      the dialog with a sentence that says why.
- [ ] 2.3 The `tracks` delta; the guide's section where a refusal states its
      measurement.

## 3. Close

- [ ] 3.1 Committed, pushed and archived.
