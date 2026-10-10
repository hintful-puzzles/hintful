# Tasks

## 1. Count it, and ask

- [x] 1.1 List the untiered games that deduce, from
  `src/engine/untiered-load.test.ts`, and say for each whether it joins. The
  nine of the proposal do unless task 2 finds its Unreasonable boards are not
  worth dealing. Say why Mines, Net, Range and Rectangles do or do not.
  **Decided 2026-10-10** (the reasons are in the proposal, "Which games
  join"): Net, Range and Rectangles join, each after its own task-2
  measurement. Mines does not.
- [ ] 1.2 For each game, show that adding the difficulty item leaves every
  existing params string decoding to the lower tier. The owner's answer
  (proposal, "What to settle first") is that the tier is always written, so
  the full encoding gains `de` and the snapshot's diff shows only that.
  **Pattern: done.** Every recorded line gained `de`, its old string is now
  the shared form, and the only new lines are the Unreasonable presets.

## 2. One game to the end: Pattern

- [x] 2.1 Pick the game whose deduction engine is easiest to search over.
  Write the search that proves exactly one answer, and time it on the largest
  preset. Pattern: its params were a bare `WxH` and its generator has no clues
  to strip. On a 30x30 a dealt board's search tries a median of 17 positions
  at about 0.06 ms each, and the hardest of 225 tried 1,105.
- [x] 2.2 The generator deals Unreasonable boards. Measure how many attempts a
  board takes on each preset, and look at twenty of them in the running app.
  A picture with one answer the lines do not reach is 1 draw in 250 at 10x10,
  1 in 87 at 15x15, 1 in 31 at 20x20, 1 in 18 at 25x25 and 1 in 12 at 30x30,
  and a deal takes about 10 ms at each (worst of 60: 153 ms). **Not twenty in
  the app**: three were dealt and looked at there (two 10x10, one 30x30), and
  forty a preset were walked by the hint outside it, counting the squares it
  leaves undecided: a median of 21 of 100 at 10x10, 40 of 225, 56 of 400, 179
  of 625, and 651 of 900 at 30x30.
- [x] 2.3 The tier, the `difficulty` contract, the hint's refusal on an
  Unreasonable board, the help page, and the spec delta. Remove `skip_specs`
  from `.openspec.yaml`.
- [x] 2.4 A pasted board with one answer that needs search loads as
  Unreasonable; one with several answers, and one with none, is refused.
- [x] 2.5 In the running app: deal an Unreasonable board, play it with hints
  to where deduction runs out, and read the sentence.

## 3. The rest

- [ ] 3.1 Say what transferred from the first game and what the engine should
  own, and move it there before the second game. What Pattern wrote that is
  not about nonograms, read 2026-10-10:
  - the four verdicts of an answer search (`PatternAnswer`), which every
    game's search will return;
  - Solve from those verdicts (`solve` in `pattern/index.ts`): the move for
    one answer, `MULTIPLE_SOLUTIONS`, `NO_SOLUTION`, `PUZZLE_NOT_REASONABLE`;
  - the contract from "deduction and the hint finish it" and "the search says
    one" (`difficulty` in `pattern/index.ts`);
  - the per-board cache of the answer (`answerOf`);
  - the two tier constants, their names and the `eu` letters.
  The depth-first loop itself (`searchAnswers`) is twenty lines around the
  game's own deduction and its own choice of what to assume. Whether it is
  one shape is a question for the second game, whose cells take more than two
  values (ABCD) or whose assumption is an edge (Palisade).
- [ ] 3.2 Each remaining game, as task 2, one commit a game: ABCD, Crossing,
  Filling, Mosaic, Palisade, Separate, Signpost, Sticks, then Net, Range and
  Rectangles. As each joins, `untiered-load.test.ts` loses its ledger line;
  its two floors of ten games (`declared.length`, and the games answering
  `nothingToDeduce`) fall with them and are to be re-stated when the first
  goes red, from what is left.

## 4. Close

- [ ] 4.1 `docs/games/solver-and-generator.md` and `docs/games/mechanics.md`
  on what an untiered game is once these have tiers. The recipe and what
  Pattern taught are in the first already, under "Giving a deductive game an
  Unreasonable tier".
- [ ] 4.2 Commit, push, archive.
