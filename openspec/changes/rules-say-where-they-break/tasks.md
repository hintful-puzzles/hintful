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
- [ ] 2.3c Bound `connected` in the compiler (sure and possible members);
      then batch 2.
- [ ] 2.3d Bound the loop and acyclic forms; then batch 3. Loopy's and
      Pearl's "largest piece" guess goes (`design.md` § "Census").
- [ ] 2.3e Bound region size (`|through(c, O)|` over walls decided so far);
      then batch 4.
- [ ] 2.4 Plant a broken rule and see its mark appear in a game that wrote
      no checker (once batch 1 has moved a game whose checker is deleted:
      edit its description's rule, see the mark move in the app).

## 3. Finish

- [x] 3.1a Guides: `descriptions.md` § "Where a rule breaks",
      `rendering.md` § "Live errors are the rules'", `new-game.md`.
- [ ] 3.1b Spec deltas for the game specs that state error marks, as each
      batch moves them.
- [ ] 3.2 Commit, push, archive.
