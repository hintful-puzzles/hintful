## 1. The instrument, checked before anything is built on it

- [ ] 1.1 Find whether a forked vitest worker's instructions reach the
      count `/usr/bin/time -l` reports for the `npx vitest` it wraps: a
      scratch vitest file that runs a fixed loop, then the same file with
      the loop doubled. The count must rise by the loop's own count (taken
      alone under `node`) within 1%. If it does not, try vitest's `threads`
      pool with one worker, then a run without vitest, and record in
      design.md § 1 which one the command uses and the two counts that
      showed it.
- [ ] 1.2 The spread: one game's walk (Tents) in one tree, eight rounds,
      quiet and beside ten busy processes started by the session and
      killed by PID, under V8's default, `--predictable` and
      `--single-threaded`. Keep the setting with the narrowest spread whose
      loaded figure is within that spread of its quiet one; record the six
      spreads in design.md § 3. CPU time beside it, to restate the
      proposal's +27% on real work.

## 2. The command

- [ ] 2.1 `npm run compare-cost -- --baseline <dir> [game…]`: refuses off
      macOS and on a baseline whose `package-lock.json` differs, saying
      which; deals the board list at the baseline (design.md § 6); per game
      and tree, interleaved rounds of the boards' run and the empty run;
      prints per game the net instructions, cycles, the spread, the
      difference and the boards refused. A header comment says how to make
      the baseline worktree. Verified by running it against a worktree of
      HEAD: every game's difference within its spread.
- [ ] 2.2 The engine's counts: steps, and firings tried. Find whether the
      described firing hint already counts the firings it tries
      (`src/engine/hint/`); if not, add a counter there, read by a test
      that walks one pinned board and asserts the count. Both appear on
      each game's line. Verified by the test, and by the line for Boats.
- [ ] 2.3 See the command catch a regression: plant a repeated call to a
      cheap engine function in one game's hint path in the working tree,
      run the command for that game against HEAD, and check the line shows
      the extra instructions outside the spread while its steps do not
      move; then remove the plant and check the diff is empty.
- [ ] 2.4 `docs/method.md`, a section "Compare a cost in instructions, not
      in time": why CPU time moves with load on this machine, the command,
      reading the spread, cycles moving without instructions, and that a
      figure in milliseconds is the least of several CPU-time runs. Verified
      by the README's documentation table still naming the guide, and the
      section cited from `docs/testing.md`'s cost paragraphs only if they
      are about A/B figures (they are about the gate's budget, which keeps
      CPU time).

## 3. The plain-cell family, re-measured

- [ ] 3.1 Run the command for the nine games of
      `archive/2026-11-23-born-plain-cell-family` against a worktree of
      `75691d811`, that change's baseline, and for Unruly, Mosaic and
      Norinori against `1057f5dc4`. Record the tables in this change's
      design.md, beside the CPU-time figures they replace, and say which
      of the archive's percentages they confirm.
- [ ] 3.2 Boats' step count: walk the same boards in both trees and find
      where the born walk takes more steps. If a born hint does less than
      the hand-written one where it could do as much in one sentence, fix
      it in the engine (`src/engine/fill/hint.ts` or the firing hint), as
      it would be for every game, and run `npm run test:hint-sweeps`;
      check the hints in the app on a 10x10 Boats board. If the archive's
      figures were swapped, say so here. Either way the archived design's
      sentence stays as written, and this change's design.md holds the
      correction.

## Workflow follow-up

- Commit each group; push at the session's end.
- Archive with the last commit.
