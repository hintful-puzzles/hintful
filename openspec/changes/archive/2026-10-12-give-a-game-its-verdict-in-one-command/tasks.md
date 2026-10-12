# Tasks

## 1. Measure and decide

- [x] 1.1 List every test file outside `src/games/<id>/` whose verdict
      depends on one game: those that iterate the registry, `HINT_GAMES`, or
      glob game source. For each, how it takes its population and whether it
      pins a count. The pass of 2026-10-12 counted 62 of 130 under
      `src/engine` and 20 of 33 under `src/` and `src/puzzle`; re-take it.
      Re-taken as a function, `gameTestFiles`: 105 files outside the game
      for Clusters (`design.md` § "The command").
- [x] 1.2 Time `select-tests.ts | xargs vitest -t <id>` for one small and
      one large game, and write `design.md`: how a guard is handed one game,
      the command's name, and what it leaves to the gate. Read `testing` and
      `build-pipeline` for a requirement this touches. Clusters 84 s and
      Solo 107 s before, 47 s and 66 s after (`design.md` § "What it costs").

## 2. Build

- [x] 2.1 The one way a guard reads its population, with a single game
      settable from the command. It is the commit hook's scope, which was
      there; five guards that swept every game inside one test, or in a
      `beforeAll`, now do a game's work in that game's case.
- [x] 2.2 The command, with its report of what ran, what refused and what
      was left to the gate.
- [x] 2.3 Plant three defects in one game that three different guards catch
      (an unpinned rung, an unnamed mark, a dead keypad key) and see the
      command report all three; then see it stay green for a clean game in
      well under a minute. All three reported in one run on Towers. Green in
      47 s for Clusters and 66 s for Solo, which is under a minute for a
      small game and not "well under" for any; `design.md` says where the
      rest goes.
- [x] 2.4 The two records that asked a new game for an edit that says
      nothing about it: `hint-mark`'s pinned count and `params-read-whole`'s
      `UPSTREAM`. Then the command run on a freshly stamped, registered game.

## 3. Close

- [x] 3.1 `docs/testing.md` and `docs/new-game.md` name the
      command as what a session runs while writing a game, and
      `scripts/new-game.sh` prints it.
- [x] 3.2 Gate, commit, archive, push.
