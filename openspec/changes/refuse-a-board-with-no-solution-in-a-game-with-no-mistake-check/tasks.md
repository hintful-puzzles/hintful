# Tasks

## 1. See it, and count it

- [ ] 1.1 In the running app: find a Flip game ID no presses light (a matrix
  with a dependent row is one), open it, and record what Hint and Show
  solution say. Do the same for Slide and Untangle.
- [ ] 1.2 A test that lists every registered game with `solve` and no
  `findMistakes`, and for each whether `solve` can return `NO_SOLUTION` from
  the opening position.

## 2. The cost, before the fix

- [ ] 2.1 Time `solve` at the opening of each such game's largest preset, and
  on a board with no solution, where an exhaustive search runs longest.
- [ ] 2.2 Decide which games are asked at load, and record the reason in a
  `design.md`.

## 3. The fix

- [ ] 3.1 `answerVerdict` refuses `NO_SOLUTION` for the games of 2.2, with the
  spec delta. Remove `skip_specs` from `.openspec.yaml`.
- [ ] 3.2 Every dealt board still loads (`desc-error-games.test.ts`), and
  every upstream fixture (`upstream-descs.test.ts`).
- [ ] 3.3 See the new test fail with the refusal taken out.

## 4. Close

- [ ] 4.1 In the running app: each board of 1.1 is refused with a sentence a
  player can read.
- [ ] 4.2 `docs/games/solver-and-generator.md`, § "One answer, even when it is
  hidden".
- [ ] 4.3 Commit, push, archive.
