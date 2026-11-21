## 1. Census

- [x] 1.1 List the hand walks: population, limit, stop rule, per-step check.
      (2026-11-21. Population: every game test file that asks a plan inside
      a loop, 83 files; the review's query missed games whose plan is a
      local `hint`/`plan`. About 75 walks moved, every one keeping its limit,
      stop rule and check. Left, and why: walks through the midend
      (`executeHint`, keyboard presses: bridges, keen, loopy, sixteen-midend,
      towers-stale-hint), walks with the player's own moves between asks
      (boats, cube, samegame's brute check), and loops that play one plan
      and never ask again (rome, map, abcd, fifteen, lightup). A walk that had
      no limit now fails at a bound from the board's size.)

## 2. The walker

- [x] 2.1 Write it with a visitor; plant a wrong step in one game and see a
      moved test fail. (`plan-walk.ts`: `walkPlan` and `walkHint`. A wrong
      mark planted in the grid skeleton's hint failed all three of its moved
      walks. `plan-walk.test.ts` holds the walker's own rules: with the step
      visitor never called, the grid skeleton and Wordtrail stayed green,
      since their checks are all in the visitor, and only the walker's test
      and Tents failed.)
- [x] 2.2 Move the walks one game at a time, each keeping what it pinned.
      Check `scripts/feedback-probe-cases.mjs` for cases that rely on a
      moved test. (No case can: `ownTests` leaves out a game's test files.)
- [x] 2.3 The skeletons' hint tests use it.

Declined: `engine/solve/hint-finishes.ts` walks a hint in production code.
Sharing the walker would move it out of `testing/` to replace an eight-line
loop with the same eight lines of options; not cleaner.

## 3. Finish

- [x] 3.1 `docs/testing.md` names the walker. Commit, push, archive.
