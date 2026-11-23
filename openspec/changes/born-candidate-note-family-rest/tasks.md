## 1. Design

- [ ] 1.1 Read the nine again with the query in design.md § "Context",
      against the engine at this change's baseline. Per game, the gap list:
      what its description states, what the fill board lacks to deal, draw
      and play it, each need marked met by what is built or new, and its ID
      grammar, starting from the predecessor's (its design.md § "The gap
      list (1.1)"). Write it and the order in design.md, with the
      Decisions it settles; say whether Map waits for the regions group.
- [ ] 1.2 Split again if the order has a natural break: this change keeps
      the first part, and its successor is filed when it is archived.

## 2. The games

Each its own commit, with the hand-written game playing on until its flip.
Each flip runs in the app before it is done: a deal, input, hints, live
errors, dark mode, and a solve to the end. It lists the capabilities it
added, each with its concept, and the differences a player sees; lowers
the `game-lines` ceiling; moves the game's tests to its `cases.yaml`;
writes its spec deltas; and runs `npm run test:hint-sweeps` before its
commit. In the order task 1.1 sets; a task a game, written there.

## 3. Finish

- [ ] 3.1 The figures of `docs/descriptions.md` § "Judging a family moved
      onto its description", per game, with `npm run compare-cost` against
      a worktree of this change's baseline, recorded in design.md; each
      deal measured bundled, never under vitest.
- [ ] 3.2 Update the guides for what the family added.
- [ ] 3.3 Commit, push, archive; mark the route's task 1.2 done, or file
      the next part beneath it.
