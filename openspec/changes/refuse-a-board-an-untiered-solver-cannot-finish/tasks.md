# Tasks

## 1. See it, and count it

- [ ] 1.1 Reproduce in the running app: Palisade `5x5n5:a`, then Hint. Then
  find and try a board for Signpost, Crossing and Sticks that their solvers
  cannot finish, and record what Hint, Solve and Check & Save each do.
- [ ] 1.2 A test that lists every registered game with no `difficulty` and no
  `finishesByDeduction`, and sorts each into the three kinds of `design.md`,
  Decision 1. Check: the four games above are in the first kind.

## 2. The generator, before any refusal

- [ ] 2.1 For each game of the first kind, write what "its deductions finish
  this board" is, as `finishesByDeduction` or its equal.
- [ ] 2.2 Deal across every preset and Custom value and assert the verdict
  accepts every dealt board (`design.md`, Decision 2). A refusal of a dealt
  board is settled before that game's hook lands.

## 3. The fix

- [ ] 3.1 Decide between the declaration and the derivation (`design.md`,
  Decision 3) and record the reason there.
- [ ] 3.2 Implement it, with the spec delta, and remove `skip_specs` from
  `.openspec.yaml`.
- [ ] 3.3 The cross-game guard. See it fail on a game with the hook taken
  out.
- [ ] 3.4 `loadDesc` timed before and after on each affected game's largest
  preset.

## 4. Close

- [ ] 4.1 In the running app: each board of 1.1 is refused at load with a
  sentence a player can read, and a dealt board of each game still hints to
  the end.
- [ ] 4.2 The guides: `docs/games/solver-and-generator.md` and
  `docs/games/mechanics.md` say what an untiered game owes.
- [ ] 4.3 Commit, push, archive.
