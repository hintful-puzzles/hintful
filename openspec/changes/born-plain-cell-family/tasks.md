## 1. Design

- [ ] 1.1 Per game, the gap list: what its description already states,
      what `fillGame` lacks to deal, draw and play it, its ID grammar, and
      how its saves are written. Write it in `design.md`, and set the
      order (§ 1).
- [ ] 1.2 Ask the owner whether the eleven games' saves break, with each
      game's cost from 1.1.

## 2. The games

Each its own commit, with the hand-written game playing on until its flip.
Each flip runs in the app before it is done: a deal, input, hints, live
errors, dark mode, and a solve to the end. It lists the capabilities it
added here, lowers the `game-lines` ceiling, writes its spec deltas, and
runs `npm run test:hint-sweeps` before its commit. The order is 1.1's; this
list is not it.

- [ ] 2.1 Star Battle born.
- [ ] 2.2 Singles born.
- [ ] 2.3 Light Up born.
- [ ] 2.4 Pattern born.
- [ ] 2.5 Range born.
- [ ] 2.6 Boats born.
- [ ] 2.7 Clusters born.
- [ ] 2.8 Bricks born.
- [ ] 2.9 Magnets born.
- [ ] 2.10 Sticks born.
- [ ] 2.11 Undead born.

## 3. Finish

- [ ] 3.1 Per game: lines removed against lines the engine gained, and
      capabilities added; deal and hint-walk CPU time against the
      hand-written game on the same boards (the pilot's method, in its
      archived `design.md` § "The figures (3.1)").
- [ ] 3.2 Update `docs/descriptions.md` and `docs/new-game.md` for what
      the family added.
- [ ] 3.3 Commit, push, archive.
