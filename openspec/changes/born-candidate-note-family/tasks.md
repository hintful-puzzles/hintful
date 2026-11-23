## 1. Design

- [ ] 1.1 Read the family again with the query in design.md § "Context".
      Per game, the gap list: what its description already states, what
      the fill board lacks to deal, draw and play it (notes, mark-all, the
      keypad, its clues), each need marked met by what is built or new,
      and its ID grammar. Place ABCD, Ascent, Crossing, Seismic and Rome
      here or in a later group, and record the placement in the route's
      design.md. Write the gap list and the order in design.md, and the
      Decisions it settles; restate the filing's spec delta (notes on
      the fill board) by what they decide.
- [ ] 1.2 Split the family if the order has a natural break: this change
      keeps the first part, and its successor is filed when it is archived.

## 2. The games

Each its own commit, with the hand-written game playing on until its flip.
Each flip runs in the app before it is done: a deal, input, hints, live
errors, dark mode, and a solve to the end. It lists the capabilities it
added, each with its concept, and the differences a player sees; lowers
the `game-lines` ceiling; moves the game's tests to its `cases.yaml`;
writes its spec deltas; and runs `npm run test:hint-sweeps` before its
commit. Tasks are written by 1.1, in its order.

## 3. Finish

- [ ] 3.1 The figures of `docs/descriptions.md` § "Judging a family moved
      onto its description", per game, with `npm run compare-cost` against
      a worktree of this change's baseline, recorded in design.md.
- [ ] 3.2 Update `docs/descriptions.md`, `docs/hints-candidates.md` and
      `docs/new-game.md` for what the family added.
- [ ] 3.3 Commit, push, archive; mark the route's task 1.2 with the
      figures' place.
