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

- [x] 2.1 `pack` asks for ringed notes only of a game that passes
      `markBits`, how a note is struck. The proposal's "reads the kinds a
      game's legend has" became this: the legend lists roles and not kinds,
      and the one kind a game may lack is the note, which `markBits` already
      declares.
- [x] 2.2 Star Battle's renderer packs its marks through it and loses its
      own key bits for them. Its render snapshot is unchanged, and
      `warm-repaint.test.ts` refuses it with the sidecar left out of the
      diff key.
- [x] 2.3 The skeleton packs through it too, in place of adding bits by
      hand, which had no lane for an outline's sides.
- [x] 2.4 `docs/hints-marks.md` § "Where the band goes, and who rubs it
      out" and the overlay table in `docs/rendering.md`.

## 3. `verbClicks` prefers the click that makes the step

- [x] 3.1 Of the buttons the keep-track keeps, the one whose click completes
      the step, then one that shrinks it, then the first.
- [x] 3.2 Star Battle's second judge goes; the note in
      `docs/hints-marks.md` § "A journey completes leg by leg" goes. The
      requirement in `engine-hints` is modified.
- [x] 3.3 Every game's hint gesture is what it was: all 18,505 gestures of
      the 54 hinted games' gate presets, recorded 2026-10-15 before and
      after, are identical. With the preference taken out again, Star
      Battle's first Normal board throws in the midend, as `findings.md`
      describes.

## 4. A square board from the stamp

- [x] 4.1 Declined. `docs/mechanics.md` § "What every game does" names the
      three places a board sized by one number differs, which is what the
      session that wrote Star Battle had to find by grepping. What a flag
      would add is renaming `w` and `h` to one field through every file of
      the copy, and the typecheck already walks the author to each. A flag
      would rewrite source the gate does not hold, and the copy's own tests
      deal a 7x4 board on purpose, to catch a swapped width and height, so
      they would need rewriting too. Not worth one session's minutes.

## 5. The right button is the cross

- [x] 5.1 Moved to `own-the-secondary-button-in-the-engine` § "Also: the
      right button is the cross", which owns the right button and waits on
      the owner, with the count the item asked for first: the right button
      rules a square out in 12 of the 28 games that declare target verbs.

## 6. A placement that brings what it rules out

- [x] 6.1 Filed as `bring-what-a-placement-rules-out`. It is a feature a
      player sees in Tents and Light Up, which wants the owner's look before
      it ships. It is also wider than Star Battle: `auto-pencil` in the
      candidate games is the same aid over notes, wired per game.

## 7. The skeleton's hint stripes a line

- [x] 7.1 The second rung's "where they meet" is a stripes reference to
      the squares the two numbers share (`meet`, recorded in the firing), so
      the words did not change and the copy starts with all three roles
      drawn. Seen in the app on a stamped and registered copy, 2026-10-15.
- [x] 7.2 The skeleton's default board is Normal, so the board the
      cross-game guards deal needs the second rung. On Easy, a stamped copy
      was refused by `warm-repaint.test.ts` for never painting its stripes.
- [x] 7.3 The stamp's checklist loses the stripes line and says to drop a
      role the puzzle's hint never names. A stamped copy, registered, met
      only the four records the checklist names.

## 8. A game's spec before its change archives

- [x] 8.1 `spec-subjects.mjs` holds a game with no spec through the delta
      of the open change that adds it, so a game is committed before its
      acceptance and its archive merges the spec as any change does. Seen
      2026-10-15 with Star Battle's spec moved into a probe change: the same
      1823 requirements read, a title stripped of its subject refused, and
      the spec removed from both places refused.
- [x] 8.2 `docs/new-game.md` § "What a game's spec holds", and the
      requirement in `repo-layout`.

## 9. `npm run game` runs the gate checks that read one game

- [x] 9.1 It runs `absence-spelling`, `unused-exports`, `spec-subjects` and
      `openspec validate --all --strict`, about six seconds together
      (measured 2026-10-15), each shown only where it refuses. A planted
      `| null | undefined` in an unused export was refused by two of them.
- [x] 9.2 `docs/testing.md` § "A game's verdict in one command".

## 10. A census for a generator being written

- [x] 10.1 `npm run deal-walk` with `DEAL_WALK_CELLS` already dealt named
      params a number of times and timed them. A named cell's line now also
      has the tries at the deal's outermost retry loop (`countingTries` in
      `retry-limit.ts`, which tallies every guard by label) and the boards
      by the easiest tier that finishes each. Seen 2026-10-15 on Star
      Battle: `8s2dn` took a median of 19 tries and every board was Normal;
      `8s2de` came out Easy.
- [x] 10.2 `docs/solver-and-generator.md` § "Bound a generator by its tail,
      not its median", and the script's header.

## 11. `presetGrid` and rulesets

- [x] 11.1 `TIERS_NOT_OFFERED` in `preset-menu-shape.test.ts` is keyed by
      ruleset, and the check compares each ruleset's missing tiers with its
      own entry. Star Battle's entry was stale: since
      `deal-star-battle-in-under-a-second` two stars offer every tier, and
      only three stars leave out Normal and Tricky, now with the figures
      measured there. The same entry under "Two stars" is refused.
- [x] 11.2 `docs/mechanics.md` § "The preset menu is a grid".

## 12. The upstream params table is required of every game not `own`

- [x] 12.1 The table and its check move to
      `src/puzzle/upstream-params.test.ts`, beside the catalog, and the
      check requires an entry of exactly the games whose `collection` is not
      `own`. `engine/params-read-whole.test.ts` keeps the strings no game
      reads.
- [x] 12.2 The requirement in `engine-params` said every registered game
      owes upstream strings, untrue since Star Battle: modified.
      `docs/mechanics.md` and `docs/new-game.md` point at the new file.

## 13. Close

- [x] 13.1 Run Star Battle in the app: a deal of 8x8 Normal, its hint
      applied step by step through the gesture `verbClicks` now chooses,
      and a step whose sentence names a region, striped and ringed through
      the sidecar (2026-10-15, Chrome).
- [x] 13.2 Specs synced, archive, push.
