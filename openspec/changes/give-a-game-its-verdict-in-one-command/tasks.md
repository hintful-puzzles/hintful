# Tasks

## 1. Measure and decide

- [ ] 1.1 List every test file outside `src/games/<id>/` whose verdict
      depends on one game: those that iterate the registry, `HINT_GAMES`, or
      glob game source. For each, how it takes its population and whether it
      pins a count. The pass of 2026-10-12 counted 62 of 130 under
      `src/engine` and 20 of 33 under `src/` and `src/puzzle`; re-take it.
- [ ] 1.2 Time `select-tests.ts | xargs vitest -t <id>` for one small and
      one large game, and write `design.md`: how a guard is handed one game,
      the command's name, and what it leaves to the gate. Read `testing` and
      `build-pipeline` for a requirement this touches.

## 2. Build

- [ ] 2.1 The one way a guard reads its population, with a single game
      settable from the command.
- [ ] 2.2 The command, with its report of what ran, what refused and what
      was left to the gate.
- [ ] 2.3 Plant three defects in one game that three different guards catch
      (an unpinned rung, an unnamed mark, a dead keypad key) and see the
      command report all three; then see it stay green for a clean game in
      well under a minute.

## 3. Close

- [ ] 3.1 `docs/testing.md` and `docs/new-game.md` name the
      command as what a session runs while writing a game.
- [ ] 3.2 Gate, commit, archive, push.
