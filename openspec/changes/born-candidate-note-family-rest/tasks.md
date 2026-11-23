## 1. Design

- [x] 1.1 Read the nine again with the query in design.md § "Context",
      against the engine at this change's baseline. Per game, the gap list:
      what its description states, what the fill board lacks to deal, draw
      and play it, each need marked met by what is built or new, and its ID
      grammar, starting from the predecessor's (its design.md § "The gap
      list (1.1)"). Write it and the order in design.md, with the
      Decisions it settles; say whether Map waits for the regions group.
- [x] 1.2 Split again if the order has a natural break: this change keeps
      the first part, and its successor is filed when it is archived.
      Split (design.md § "Decisions" 1): Solo, ABCD, Salad and Group here;
      Undead, Rome, Magnets, Crossing and Map in the successor.

## 2. The games

Each its own commit, with the hand-written game playing on until its flip.
Each flip runs in the app before it is done: a deal, input, hints, live
errors, dark mode, and a solve to the end. It lists the capabilities it
added, each with its concept, and the differences a player sees; lowers
the `game-lines` ceiling; moves the game's tests to its `cases.yaml`;
writes its spec deltas; and runs `npm run test:hint-sweeps` before its
commit. In the order task 1.1 sets; a task a game, written there.
Each capability is built first on a fixture description of its own, as
the predecessor's were, in a commit before the flip.

- [ ] 2.1 Solo born (design.md § "The gap list", Solo):
  - [ ] 2.1a The walk of the notes over any unit: blocks and diagonals,
        and a partition a rule holds distinct beside them
        (`checkWalkSteps`, `engine/fill/candidates.ts`).
  - [ ] 2.1b Grading on a second scale: a board dealt at the asked tier
        on each (`scales:`).
  - [ ] 2.1c A partition divided into equal parts (jigsaw blocks); the
        diagonals drawn; a second partition drawn inset inside the first.
  - [ ] 2.1d The symmetry option of seven, written as upstream's suffixes;
        the `{c}x{r}` and `{n}j` sizes.
  - [ ] 2.1e The flip: its words as `says`, its tests to `cases.yaml`.
- [ ] 2.2 ABCD born: the number size, letters, the walk with no region, a
      clue per value derived, written and drawn in a margin, corner
      crosses, `D` and `R`.
- [ ] 2.3 Salad born: a ruleset that chooses kinds and segments, the
      folded Latin square, the empty value and `O`, the ball weakened
      before it goes, the ID's slot order.
- [ ] 2.4 Group born, after the owner's answer (design.md § "Open
      Questions"): the letters relabeled about the identity, `i` after the
      tier, the hide's keep-set, an answer from shipped data.

## 3. Finish

- [ ] 3.1 The figures of `docs/descriptions.md` § "Judging a family moved
      onto its description", per game, with `npm run compare-cost` against
      a worktree of this change's baseline, recorded in design.md; each
      deal measured bundled, never under vitest.
- [ ] 3.2 Update the guides for what the family added.
- [ ] 3.3 Commit, push, archive; mark the route's task 1.2 done, or file
      the next part beneath it.
