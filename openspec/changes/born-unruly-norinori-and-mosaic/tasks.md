## 1. Design

- [x] 1.1 Read `a-game-from-its-description-alone` in the archive (its
      design.md § 9 and its tasks' as-built notes) and `docs/new-game.md`
      § "A game born from its description".
- [ ] 1.2 Per game, the gap list: what its description already states, what
      `fillGame` lacks (Unruly's optional unique-lines rule and its params,
      Norinori's regions in the desc and the render, Mosaic's clue on a
      cell and its counting marks), its ID grammar, and its saves. Ask the
      owner about breaking these games' saves, with the cost. Write
      `design.md`. Written 2026-11-22 (§ "The gap list", § 4: sixteen
      capabilities named before any is built). Asked the owner the saves
      question and, since the list already shows more engine work than
      Tents needed, whether to go on; their answers go here.

## 2. The games

Each its own commit, the hand-written game playing on until its flip. Each
runs in the app before it is done (deal, input, hints, live errors, dark
mode, a solve to the end).

In design.md § 1's order: Mosaic shares most of Unruly's capabilities, and
Norinori's partition is its own.

- [ ] 2.1 Unruly born; its capabilities added listed here.
- [ ] 2.2 Mosaic born; its capabilities added listed here.
- [ ] 2.3 Norinori born; its capabilities added listed here.

## 3. Finish

- [ ] 3.1 Figures against the change's first commit's parent: lines,
      frame time, hint-walk time, capabilities added per game. The pilot
      holds if they fall from game to game and time is within 10%.
- [ ] 3.2 Spec deltas; lower the `game-lines` ceiling with each flip.
- [ ] 3.3 Commit, push, archive. File the plain-cell family's migration if
      it holds; if not, record why in the doctrine.
