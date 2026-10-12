# Tasks

The owner leans to the whole suite running only in CI, with the heavy tests
removed or shortened, and wants every option explored (`proposal.md`, "The
owner's answers"). Design toward that lean unless the work below turns up a
reason against it, and say so if it does.

## 1. The first round

- [x] 1.1 Rank the hook's dearest selection by file and by test
      (`vitest run --reporter=json`).
- [x] 1.2 Find what grew the input guards, and mend it in the harness.
- [x] 1.3 Measure the selection again, and record both runs with their load.

## 2. Measure what the options turn on

- [ ] 2.1 Take the selection once more on as quiet a machine as can be had,
      with the load stated, so the after figure does not rest on a busy run.
- [ ] 2.2 For each of `hint-resume`, `hint-quality` and `warm-repaint`: what
      it has caught (`git log -S` on its assertions, and the archive), on
      which board, and the cheapest input that would have caught the same.
      Loopy first: it is about 110 s of the first two.
- [ ] 2.3 What a commit costs under each option, for three commits: one
      game, the engine, and a comment in a file the selector reads as the
      engine's.
- [ ] 2.4 CI as it is: how often a run is canceled by a newer push, how long
      a red run stands before anyone sees it (`gh run list`), and what
      stopping the cancellation costs in minutes.

## 3. Decide, in `design.md`

- [ ] 3.1 The options in `proposal.md` (A to C, and B as the owner restated
      it: one whole run a session, before a push made at the session's end
      or on the owner's word), each with its measured cost and what reaches
      `main` unseen under it.
- [ ] 3.2 Each heavy test: kept, shortened or removed, with what the shorter
      form no longer catches and where that is caught instead. A cut that
      drops an assurance and names no replacement is put to the owner in
      this file and not made.
- [ ] 3.3 Whether a comment-only change to a file should get the plan `ALL`.
- [ ] 3.4 `target-verb.test.ts` compares sets of boards over all squares, so
      a key acting on the square beside the cursor passes: mend it, or file
      it as the engine's.

## 4. Build what was decided

- [ ] 4.1 The hook, the selector, CI and any push rule, with the
      `build-pipeline` delta and `AGENTS.md`'s push rule if it moves.
- [ ] 4.2 Plant a cross-game defect in the engine and see where, and how
      long after the commit, the chosen arrangement reports it.
- [ ] 4.3 `docs/games/testing.md` § "Right-sizing the gate" and
      `docs/work-management.md` say the arrangement.
- [ ] 4.4 Gate, commit, archive, push.
