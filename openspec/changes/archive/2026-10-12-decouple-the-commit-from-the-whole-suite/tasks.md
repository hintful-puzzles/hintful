# Tasks

The owner leans to the whole suite running only in CI, with the heavy tests
removed or shortened, and wants every option explored (`proposal.md`, "The
owner's answers"). `design.md` holds the measurements and the decisions. The
arrangement built is the lean with a pre-push hook added, and "The options,
and what each lets through" there gives the measured reason.

## 1. The first round

- [x] 1.1 Rank the hook's dearest selection by file and by test
      (`vitest run --reporter=json`).
- [x] 1.2 Find what grew the input guards, and mend it in the harness.
- [x] 1.3 Measure the selection again, and record both runs with their load.

## 2. Measure what the options turn on

- [x] 2.1 Take the selection once more on as quiet a machine as can be had.
      1,005 s of test time, 554 s wall, load 8.3 falling to 6.9: the machine
      was not quiet at any point in the session.
- [x] 2.2 What `hint-resume`, `hint-quality` and `warm-repaint` have caught,
      on which board, and the cheapest input for each (`design.md`, "What was
      measured").
- [x] 2.3 What a commit costs, for one game, the engine, and a comment in the
      registry (`design.md`, and section 4 below for the new arrangement).
- [x] 2.4 CI as it is: 93 of 291 runs canceled, red runs standing 1.5 to 20
      hours, and no cost to letting a run finish on a public repository.

## 3. Decide, in `design.md`

- [x] 3.1 The options, each with its measured cost and what reaches `main`
      unseen under it. D1 and D2.
- [x] 3.2 Each heavy test: kept or shortened, with what the shorter form
      leaves out and where that is caught. D3. Three further cuts are offered
      to the owner there and not made.
- [x] 3.3 A comment-only change to a file no longer gets the plan `ALL`. D4.
- [x] 3.4 `target-verb.test.ts`'s comparison of sets: filed as the engine's,
      `hold-a-key-to-the-square-under-its-cursor`. D5.

## 4. Build what was decided

- [x] 4.1 The hooks, the selector, CI and the push rule, with the
      `build-pipeline` delta and `AGENTS.md`'s push rule.
- [x] 4.2 Plant a cross-game defect in the engine and see where, and how long
      after the commit, the arrangement reports it. Results below.
- [x] 4.3 `docs/games/testing.md` § "What runs when" and
      `docs/work-management.md` § "Pushing and deploying" say the arrangement.
- [x] 4.4 Gate, commit, archive, push.

## What the trials showed (2026-10-12, load 7 to 9 throughout)

**A commit, in the hook from start to finish:**

| Commit | Before | After |
| --- | --- | --- |
| A script (`ceef1ea8`: a path with an unknown blast radius) | every test, 10 to 13 min | 2 min 7 s: 207 files, no game's cases, 116 s of test time |
| The engine (`game.ts`, the planted commit) | every test, 10 to 13 min | 2 min 3 s: 150 files, no game's cases, 108 s of test time |
| Seven staged cross-game test files with the rest of this change (`b86c4019`) | every test | about 5 min: a staged test file runs whole |

**The first trial failed the design, and it was changed.** The rule as first
built ran whole any guard that reads a staged path as text. A commit to
`game.ts` then ran the narration sweep over every game, 153 s, because a
helper the sweep imports reads that file as text. Only a staged test file runs
whole now (`ceef1ea8`), and `select-tests.ts --verify` holds that case.

**A planted defect.** `narratedStep` in `src/engine/game.ts` was made to
append 360 characters to every sentence a hint speaks: a defect in shared code
that shows only in per-game cases.

- **The commit hook passed it**, in 2 min 3 s, as designed: it stages no game,
  so no game's case ran. (A first plant, an em dash appended to the same
  sentences, was refused by the commit hook itself in a scan of the engine's
  own text, which is not split by game.)
- **The push hook refused it**, 8 min 53 s after it started: fourteen cases of
  `hint-quality.test.ts` over seven games, each naming the sentence. The run
  was the push's plan for that one commit, 397 of 454 files, and vitest
  reports when the run ends.
- So a defect in shared code that a commit cannot see is reported before it
  leaves the machine, to the session that wrote it, once. Under CI alone the
  same report would have come 20 to 40 minutes after the push.

The planted commit was made locally and dropped; it was never pushed.

**The push that carried this change** ran the whole selection, since the
change touches the gate's own scripts.
