## 1. Design

- [ ] 1.1 Read `archive/2026-11-21-architectural-review-blue-sky/design.md`
      whole, and the prior art it cites (pzprjs's board and checklist,
      cspuz's serializer combinators).
- [ ] 1.2 Pick the new game: a fill game not in the catalog whose rules
      are well understood and that needs at least one capability Tents does
      not. Record why.
- [ ] 1.3 Design the board, `Edit`, `Ui` and the `fillGame` entry point;
      what each consumes from the description; how a game-ID codec and a
      sampler are declared; the render layers. Write `design.md`.

## 2. The engine

- [ ] 2.1 The board, `Edit` and `Ui`, and the hooks built from them.
- [ ] 2.2 Step words from the binding.
- [ ] 2.3 Render layers, and clues derived from `means`.

## 3. The games

- [ ] 3.1 The new game from its description alone; each gap closed in the
      engine.
- [ ] 3.2 Tents moved; checked in the app, including links, drags, hints
      and dark mode.
- [ ] 3.3 Measure lines, frame time, hint-walk time and capabilities added
      per game, against HEAD before the change; record the figures.

## 4. Finish

- [ ] 4.1 The ratchet on TypeScript lines under `src/games/`; see it fail
      on a planted line.
- [ ] 4.2 Spec deltas; `docs/new-game.md` gains the route for a game born
      from its description.
- [ ] 4.3 Commit, push, archive. File the migration batches (review stage
      4) as changes if the pilot holds; if it does not, record why in the
      doctrine.
