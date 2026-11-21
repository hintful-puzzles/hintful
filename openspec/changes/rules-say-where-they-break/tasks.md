## 1. Census and design

- [x] 1.1 List every live-error checker in the games, what each highlights,
      and the description statement it restates (`design.md` § "Census").
- [x] 1.2 Design the violation: what a statement form reports on a partial
      board, how it reaches the renderer, and the soundness check for it.
      Pilot on Tents, which breaks a shape, a clue and a pairing rule.

## 2. Build and move

- [x] 2.1 Compile violations (`compile-violations.ts`); check them sound
      (`src/guards/rule-violations.test.ts`, planted and seen to fail).
- [x] 2.2 One engine path from violations to the live error marks
      (`Game.rules`, `engine/render/live-errors.ts`).
- [x] 2.3a Tents moved, checked in the app (diamonds, red number, unpaired
      tent, boxed-in tree); its render scenarios did not move.
- [ ] 2.3b Batch 1 of `design.md` § "Batches": the exclusion, count, run and
      latin games. Look at each in the app; explain each moved snapshot.
      Moved: unruly (rules drawn their own way through `byRule` and the
      module's `RuleName`), starbattle, norinori (a cross red where its
      unit can no longer hold its count; Norinori's boxed-in lone square).
      Towers waits: its clue's "the tallest is still to come" (a prefix
      showing its count with the tallest unplaced) needs a bound the
      compiler lacks; ordering comparisons of an undecided `value` against
      its domain's interval come first, in the compiler.
      Moved: lightup (its `rules.grid` reads a lit or crossed square as
      holding no bulb; it gains a red cross where nothing can light the
      square). A count written through a definition (`bulbs(k)`) is
      bounded now, as a count written out is. Moved: mosaic (its state
      cells hold only the mark; "done" is the renderer's), map (its
      diamonds unchanged). A game builds `rules` with `describedRules`,
      which gives `isAnswer` too, and the guard checks a changed answer
      breaks a rule exactly where it is no answer (Map's four-coloring leaves
      some changes answers). Moved: abcd (its "no diagonal" variation is a
      module argument `deals` passes), magnets (its + and − counts are
      read as an interval, so a count with too few open squares left
      turns red before the line is full), keen (an undecided value in a
      sum or product is bounded by its domain, so a cage a digit
      overshoots is red with squares still open), group (each failed
      product's triple is read back from the four squares its violation
      names, checked against the grid). Run `src/guards` before a
      push: `capability-surface` records each game that declares `rules`,
      and only CI runs it.
- [ ] 2.3c Bound `connected` in the compiler (sure and possible members);
      then batch 2.
- [ ] 2.3d Bound the loop and acyclic forms; then batch 3. Loopy's and
      Pearl's "largest piece" guess goes (`design.md` § "Census").
- [ ] 2.3e Bound region size (`|through(c, O)|` over walls decided so far);
      then batch 4.
- [ ] 2.4 Plant a broken rule and see its mark appear in a game that wrote
      no checker (once batch 1 has moved a game whose checker is deleted:
      edit its description's rule, see the mark move in the app).
- [x] 2.5 Magnets drew a clash as the pole's symbol in `ERROR`, the + pole's
      own fill, so touching + poles showed nothing. A clashing pole is a
      badge with an `INK` rim (the owner's choice, 2026-11-21).

## 3. Finish

- [x] 3.1a Guides: `descriptions.md` § "Where a rule breaks",
      `rendering.md` § "Live errors are the rules'", `new-game.md`.
- [ ] 3.1b Spec deltas for the game specs that state error marks, as each
      batch moves them.
- [ ] 3.2 Commit, push, archive.
