# Tasks

## 1. See it, and count it

- [x] 1.1 In the running app: find a Flip game ID no presses light (a matrix
  with a dependent row is one), open it, and record what Hint and Show
  solution say. Do the same for Slide and Untangle.
  - Flip `3x3c:000000000000000000000,800` loaded; Hint said "This puzzle's
    solution can't be determined." and Show solution "This puzzle has no
    solution." Slide's board loaded, its Hint said nothing and Show solution
    said the same sentence.
- [x] 1.2 A test that lists every registered game with `solve` and no
  `findMistakes`, and for each whether `solve` can return `NO_SOLUTION` from
  the opening position.
  - `src/engine/no-solution-load.test.ts`, over every game with no
    `findMistakes`, with or without a `solve`: thirteen, not three (design,
    Decision 1).

## 2. The cost, before the fix

- [x] 2.1 Time `solve` at the opening of each such game's largest preset, and
  on a board with no solution, where an exhaustive search runs longest.
- [x] 2.2 Decide which games are asked at load, and record the reason in a
  `design.md`.
  - None is asked through `solve`. A game says what it can prove cheaply
    through `hasNoSolution` (Decision 2), and five do (Decision 3).

## 3. The fix

- [x] 3.1 `answerVerdict` refuses a board `hasNoSolution` holds for, with the
  spec delta. Remove `skip_specs` from `.openspec.yaml`.
- [x] 3.2 Every dealt board still loads (`desc-error-games.test.ts`), and
  every upstream fixture (`upstream-descs.test.ts`).
- [x] 3.3 See the new test fail with the refusal taken out.

## 4. Close

- [x] 4.1 In the running app: each board of 1.1 is refused with a sentence a
  player can read.
  - Cube, Fifteen, Flip, Sixteen and Untangle: "This game ID's puzzle has no
    solution, so it can't be played here." Slide's still loads (design, "What
    is left").
- [x] 4.2 `docs/games/solver-and-generator.md`, § "One answer, even when it is
  hidden", and `docs/games/engine-catalog.md`.
- [ ] 4.3 Commit, push, archive, and then file what is left as
  `prove-no-solution-cheaply-in-the-games-that-search`.
