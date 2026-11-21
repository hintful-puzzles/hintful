## 1. Measure

- [x] 1.1 Re-take the suite's CPU and the guards' share from the latest
      green Gate run's log, and each guard's cost per game. Record with the
      query and the run id.
      Gate run 44851276935 (`04494aa27`, 2026-11-21): 33.8 reference minutes
      over 575 files (`gh run view 44851276935 --log | grep "Test CPU time"`);
      vitest's main pass 763 s of wall, the job 14.7 minutes. The files of
      10 s or more under `src/guards/` were charged 1985 s, boards dealt
      elsewhere included; the games' own files 9.5 minutes over 65 games.
      Per game, from the local record (`node_modules/.cache/test-cost/costs.json`,
      summing each file's `games`): the cost sits in a few games, not spread
      thin. hint-resume 273 s (114 untitled; Loopy 62, Mosaic 24, Solo 24,
      median 0.4); warm-repaint 188 (Sixteen 25, Group 19, Loopy 13);
      hint-quality 114 (Loopy 30, Group 20, Solo 12); wrong-entry-check 58
      (Group 18, Loopy 10); candidate-reading 45 (18 untitled, Solo 15);
      difficulty-contract 60, all of it untitled.

## 2. Shard

- [x] 2.1 A matrix of `vitest --shard=i/n` jobs in `gate.yml`; the fast
      checks, build and research guards run once. Keep one verdict a run
      (`ci-status.mjs` reads it).
      Not vitest's `--shard`: vitest 5.0.5 places a file by the hash of its
      path alone (`BaseSequencer.shard`), so all four shares of a spread file
      would land in one shard. `GATE_CI_PART` names a job's part (`gate.sh`
      section 0-); `vitest.config.ts` keeps a shard's files by
      `src/engine/testing/gate-shard.ts`, and each shard walks four shares of
      its own of each spread file (16 with four shards). Checked with
      `vitest list --filesOnly` under each of four shards, for both passes:
      every spec in exactly one shard, each spread file in 16 shares.
      The six spread files run under each of the four shards here: two
      census floors summed over a share's games failed at 16 shares by
      luck of the draw (desc-error-games' accepted near misses, 4 against
      25; hint-resume's frames judged, 79 against 80). Measured by game,
      both are skewed (15 of 65 games accept no near miss; Loopy judges
      6,689 of 12,860 frames), so each floor is now held on named games
      in the share that walks them (`ACCEPTS`, `JUDGES`), and each failed on
      its planted collapse (a loader refusing all, one board a game).
- [x] 2.2 The cost report sums the shards; the budgets say what they bound
      on a sharded run. Record the figures chosen and why, and update the
      spec if it states them.
      `BUDGET.suite` (2400 s) is gone: the suite grows a shard at a time.
      `BUDGET.shard` is 900 s, judged on the shards' mean, since the
      placement is blind to cost; the reasons are at `BUDGET`.
      The first sharded run (Gate run 44877134962, `97e525038`): every shard
      green, in 3.8 to 7.8 minutes with setup, the checks job 2. The suite
      cost 40.2 reference minutes against 33.8 unsharded: each of 16 workers
      imports the module graph, and each shard deals its own boards. It drew
      252, 136, 154 and 106 files, since a residue of FNV-1a follows the low
      bits of a path's characters; files are now dealt in turn in hash order,
      134 a shard. The suite job failed one game's budget, Bridges at 33 s
      (30 s unsharded, the runner's noise on a game at 1.2 times its budget):
      its hint corpus walks one seed in CI and five in its deep tier, since on
      the first seed the shapes fire every arm and the shipped presets every
      arm but `mustReachOut`, which a pinned board holds (unpinned, the
      ledger check failed).
      Then green (Gate run 44878403485, `f68af5f65`): 5 minutes from the
      first job to the verdict, against 14.7 before; shards 11.4, 9.6, 7.1
      and 8.2 reference minutes, a mean of 545 s (61% of a shard's budget);
      the games' own files 8.3 minutes, Path the dearest at 24 s. Each shard
      scales its costs on its own runner and the `suite` job sums them, and
      judges the games' own files there, where a game's files split between
      shards are summed again. Four shards: the suite's 2030 s is a mean of
      about 510, 42% of the budget.
- [x] 2.3 See the budget fail on a planted dear file before trusting it.
      Synthetic shard logs: a 900 s file failed its shard; 8000 s planted in
      one shard failed the suite on the mean; a game's file planted in a
      second shard failed the games' budget on the sum; a missing shard was
      refused as not one whole set. A planted share offset in `sharesOf` failed
      `gate-shard.test.ts`.

## 3. The dearest guards

- [x] 3.1 Profile each of the six; cut a board or round only where another
      already covers what it would catch. Plant the guard's defect again
      after each cut.
      **The "untitled" cost in 1.1 was mostly the instrument's.**
      `test-cost-setup.ts` named a case by walking up `task.suite` and
      dropping the outermost name as the file's, but in vitest 5 a file's top
      `describe` has no parent, so a case titled for a game by its describe
      (`group: difficulty contract > …`, `solo: every preset > …`) was charged
      to no game. It reads `task.fullTestName` now: difficulty-contract run
      alone charged Group nothing before, 15.4 s of its 23.5 after.
      **Every one of the six paid for one board it never used**: Group's
      6x6 at its unoffered tier, which deals nothing in the house count of
      tries and costs about 5.5 s to give up on, before the 8x8 deals in 4.7.
      `unofferedValues` (behind `gatePresets` and `dealtBoards`) tried the
      presets in menu order; it now tries a tier first on the presets of a
      harder tier. Across every game two tiers have no preset, and only
      Group's search changed, to the same board (a census through the
      real `dealsPromptly`, 2026-11-21). difficulty-contract's own
      `paramsForTier` made the same search, Group's 6x6 Hard refused too;
      it now takes the menu's preset at the tier, else `unofferedValues`'
      board. Each guard run alone, local CPU before and after:
      difficulty-contract 23.5 → 11.8, hint-resume (four shares) 164.7 →
      143.2, warm-repaint 123.4 → 107.9, hint-quality 81.3 → 66.9,
      wrong-entry-check 34.1 → 27.8, candidate-reading 30.0 → 22.8.
      Planted again: cap 1 calling every board unsolved failed the same 95
      cases at HEAD and after; Group's generator throwing at Extreme failed
      "either generates every declared tier" and "is monotone in its cap".
      **Kept, with why** (cases over a second, run alone): no other guard
      walks the same board for the same defect, and each is the only board
      of its kind. hint-resume's walk to solved: Loopy 29 s over its tilings,
      one board each; Mosaic 13.8 s; Solo 9 s, its Killer board the one that
      catches a hint weaker than its grader (the file's header). warm-repaint:
      Sixteen 12.9 s, the seeded run, where each random Hint or Check on a
      scrambled board runs the search to its budget; Ballsort and Sokoban
      search eight boards each for a pour's stripes and a target's outline,
      under a second a board. hint-quality's bound-words walk: Loopy 7.3,
      Mosaic 5.5, Solo 5.5. Each share of hint-resume still pays about
      11.5 s at load (it was 17), the module graph and the boards
      `gatePresets` deals for `SOLVE_CASES`.

## 4. Finish

- [x] 4.1 `docs/testing.md` § "What runs when" and `gate.yml`'s comment say
      how it runs now. Commit, push, watch one CI run to green, archive.
      The guide and the workflow say it, and Gate run 44878403485 is green;
      archived with 3.1, whose push the next session checks on CI.
