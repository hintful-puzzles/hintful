# Tasks

Written 2026-10-15 by the session that took the change up. Each item is
numbered as in `proposal.md`.

## 1. The mend of a division is the engine's

- [x] 1.1 Argue whether one game is enough (below, § "Why the mend moves
      with one game").
- [x] 1.2 `src/engine/mend-division.ts`: the walk, taking the game's judge
      (what its deductions leave open, a second answer where the search
      meets one, and whether the easier tier finishes the board too), the
      cells that never move, and the least size of a region.
- [x] 1.3 The regions as a `Dsf` for the desc is `divide.ts`'s
      (`regionForest`), beside `regionNumbers`.
- [x] 1.4 Star Battle onto both, with every seed dealing the board it dealt
      before. Checked 2026-10-15: four seeds of each of the 18 presets dealt
      the same 72 descs before and after, and a planted change to the
      walk's stall limit moved 62 of them.
- [x] 1.5 Its tests (`mend-division.test.ts`, which fails with the least
      size dropped), the catalog row and section, the requirement in
      `engine-helpers`, and `docs/solver-and-generator.md` § "A division
      into regions is the engine's".

### Why the mend moves with one game

`docs/doctrine.md` weighs a shared layer at dozens of games, and asks that a
framework pivot have a real downstream game. This is neither a pivot nor a
guess at a shape: the walk was already written, measured and made fast in
one game, and what moved is the part that never read a star. What stayed in
Star Battle is its judge, the search for a second answer that the judge
calls, and the answer the board is dealt for. The genres whose only
clue is a division into regions, and which would deal the same way (place
the answer, grow regions round it, mend), are common in the published
collections: Norinori (two shaded squares a region, in dominoes) and LITS
(one tetromino a region) are the plainest, and each would otherwise copy
the walk whole, with its three measured limits. The cost of moving it is one
module whose interface is three functions, and Star Battle reads more
plainly for it.

## 2. `OverlaySidecar.pack` for a game with no notes

- [ ] 2.1 `pack` asks for ringed notes only of a game that says how a note
      is struck.
- [ ] 2.2 Star Battle's renderer packs its marks through it and loses its
      own key bits for them.
- [ ] 2.3 `docs/hints-marks.md` § "Where the band goes, and who rubs it out"
      loses its note about the gap.

## 3. `verbClicks` prefers the click that makes the step

- [ ] 3.1 Of the buttons the keep-track keeps, the one whose click completes
      the step, then one that shrinks it, then the first.
- [ ] 3.2 Star Battle's second judge goes; the note in
      `docs/hints-marks.md` § "A journey completes leg by leg" goes.
- [ ] 3.3 Every game's hint gesture is what it was, or the change is read.

## 4. A square board from the stamp

## 5. The right button is the cross

- [ ] 5.1 Moved to `own-the-secondary-button-in-the-engine`, which owns the
      right button and waits on the owner.

## 6. A placement that brings what it rules out

## 7. The skeleton's hint stripes a line

## 8. A game's spec before its change archives

## 9. `npm run game` runs the gate checks that read one game

## 10. A census for a generator being written

## 11. `presetGrid` and rulesets

## 12. The upstream params table is required of every game not `own`

## 13. Close

- [ ] 13.1 Run Star Battle in the app: a deal, the hint's gesture, its marks.
- [ ] 13.2 Specs synced, archive, push.
