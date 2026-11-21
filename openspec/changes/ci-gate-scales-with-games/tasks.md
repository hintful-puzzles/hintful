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

- [ ] 3.1 Profile each of the six; cut a board or round only where another
      already covers what it would catch. Plant the guard's defect again
      after each cut.
      Where to start (2026-11-21): the per-game costs in 1.1 say the cost
      sits in a few games (Loopy, Group, Solo, Mosaic, Sixteen), and
      hint-resume's and candidate-reading's untitled cost and all of
      difficulty-contract's are not charged to a game, so profile those by
      case first. Each walk already holds "one board of every kind"
      (`build-pipeline`, the boards a cross-game sweep walks), so a cut needs
      another guard that walks the same kind for the same defect, named at
      the site. Sharding took the wall-time pressure off, so a guard with no
      such board is recorded as kept, with why. Per-game counts are taken by
      appending from the test to a scratch file
      (`process.getBuiltinModule("node:fs")`): vitest swallows a test's
      console output here.

## 4. Finish

- [ ] 4.1 `docs/testing.md` § "What runs when" and `gate.yml`'s comment say
      how it runs now. Commit, push, watch one CI run to green, archive.
      Done but the archive, which waits on 3.1: the guide and the workflow
      say it, and Gate run 44878403485 is green.
