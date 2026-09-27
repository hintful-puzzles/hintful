# measure-the-suites-per-commit-cost — tasks

Measured 2026-09-27 on the development machine, which was **not idle**: load
average 6–16 across the session, swap 19.4–20.3 GB used of 20–21.5 GB, and
between 0.4 and 1.4 GB free. Every absolute figure below is an upper bound. The
before/after pairs were taken minutes apart under comparable load, and their
ratios are the part to trust. Two workers throughout (`maxWorkers`' local
share).

## 1. Measure what a game commit pays

- [x] 1.1 The selection for a one-line change to `src/games/pearl/hint.ts`:
      **68 files**, 54 from the import graph and 20 from globs, 6 in both.
      Taken from `vitest list --changed` against an unstaged edit, then
      restored; the glob half from `globSelected`.
- [x] 1.2 Its cost: **310 s wall, 593 s of test time**. `hint-resume` 156 s and
      `hint-quality` 152 s were half of it, then `hint-ordinal` 55 s,
      `input-parity` 45 s, `hint-mark` 43 s, `mark-all` 40 s.
- [x] 1.3 Attributed per game by case title (`<id>: …`): **518 s** of the 593 s
      was per-game cases inside cross-game guards, and **105 s** of it was
      Pearl's. Loopy 83 s and Solo 56 s were the dearest of the games the commit
      could not have changed. A first pass keyed only on describe titles found
      14 s, because most guards put the id in the *test* title. That was the
      instrument, not the tree.

## 2. Narrow the sweeps to the touched games (lead 1)

- [x] 2.1 Established that vitest matches `-t` against the describe titles and
      the test's own, joined by single spaces with no file prefix
      (`vitest list -t`, vitest 4.1.11), and that a negative lookahead works
      through the CLI.
- [x] 2.2 Audited every test name in the suite (10,517 from `vitest list
      --json`) against the `<id>: ` shape: 1,602 caught, 1,601 at the start of
      a title segment. The one mid-sentence catch ("…as a group: four turns…"
      in `wires.test.ts`) is an engine test that depends on no game, so
      skipping it is sound. No test in a game's directory is titled for
      another game.
- [x] 2.3 Read every distinct per-game case template outside `src/games/` (41
      of them). Each reads its own game's object, source, palette or ledger
      entry, and none compares one game against another. Games cannot import
      each other (`module-layering.test.ts`), which is the other half of the
      soundness condition.
- [x] 2.4 `src/engine/testing/game-scope.ts`: `gameScope`, `scopeFromEnv` and
      `otherGamesFilter`. `select-tests.mjs --game-scope` prints the scope, the
      hook exports it as `GATE_GAME_SCOPE`, and `vitest.config.ts` derives
      `testNamePattern` from it. It is honored only beside `GATE_PRECOMMIT=1`.
- [x] 2.5 First narrowed run: 103 s wall, 179 s of test time, and **13
      assertions red in 8 files**. All were counters, floors or ledgers summed
      over the cases the filter skipped, which is the "defer together" clause
      in the build-pipeline spec. Plus one of mine: `module-layering` cannot
      resolve a `src/` test that imports from `scripts/`, which is why the
      module lives under `src/engine/testing/`.
- [x] 2.6 `inSweep` and `itOverWholeSweep` in `slow.ts`, read from the same
      variable. Ledgers (`NO_KEYBOARD`, `CLAIMS_UNACTIONABLE`,
      `BINDS_A_SHORTCUT_LETTER`, `ORDERING_GAMES`, the swept-game counts)
      filter to the games that ran. Floors no subset can meet move to
      `itOverWholeSweep`. `input-parity`'s keypad floor is now read from the
      games without a board (`offered`), because a touched game that loses its
      keypad has no case left to fail.
- [x] 2.7 Whole suite, narrowed: to Pearl **280 s wall, all green**; to Guess
      (hintless, with literal-titled cases) **193 s wall, all green**.
- [x] 2.8 Planted, under a narrowed run, and watched fail: Solo declaring
      `canMarkAll: false` (red in Solo's case and in the narrowed ledger); a
      stale `NO_KEYBOARD` entry for Pearl, scoped to Pearl (red in the ledger).
      Planted a filter without its `: ` anchor, and `game-scope.test.ts` went
      red on the `net`/`netslide` case. All restored.

## 3. What the narrowed run still paid for other games

- [x] 3.1 `mark-all`'s one test over every game (31.5 s) was the heaviest file
      left in a narrowed run. Split into one `<id>: ` case per game, with the
      declared set read from the registry and the floors in
      `itOverWholeSweep`: 46 s → 14 s of test time under a Solo scope.
- [x] 3.2 `candidate-reading` (16 s) titled its per-game describe with the bare
      id, and `difficulty-contract` (11 s) used `describe.each`'s `$id`, which
      vitest renders **quoted** (`'keen': …`). Both are retitled; the second
      became a plain loop. Their sweep floors moved to `itOverWholeSweep`.
- [x] 3.3 Re-measured the Pearl selection with all of the above; see 5.1.

## 4. The other leads

- [x] 4.1 **`builtGames()` is memoized per worker (lead 2).** Answered from the
      code rather than timed: under `isolate: false` it is built once per
      worker that touches it, so at most `maxWorkers` times a pass — twice
      locally, and the source-scan pass reaches no game at all. The nine guards
      that use it cost 8.8 s together (measured 2026-09-25). Not worth a
      cross-worker cache.
- [x] 4.2 **A cheaper enrollment path (lead 3)** is declined for the same
      reason. `builtGames` still builds every game on a narrowed run, because
      the enrollment guards derive their populations from all of them, and it
      is seconds.
- [x] 4.3 **A fast pass for the board-building guards (lead 4)** stays
      declined. Nothing here supplied the property that would separate them
      from the heavy guards without a roster.
- [x] 4.4 **A cheaper per-commit hint-resume walk (lead 5)** is superseded for
      game commits: narrowed to Pearl, `hint-resume` fell from 156 s to 19 s.
      An engine commit still walks every game, which is correct, since an
      engine change can move every game's verdict.
- [x] 4.5 **Say what the instrument measured (lead 6).** Load and swap are
      recorded beside every figure above.

## 5. Close

- [x] 5.1 Final Pearl selection, everything in: recorded in the commit message.
- [x] 5.2 `docs/games/testing.md`: the stale "don't reach for affected tests"
      paragraph rewritten (the hook has selected by union since
      `select-tests-in-the-precommit-hook`), plus the title rule, the
      whole-sweep rule and the `describe.each` trap. `AGENTS.md` § "Git" names
      the new scoping.
- [x] 5.3 Spec delta: build-pipeline, ADDED "The pre-commit hook narrows the
      cross-game sweeps to the games a commit touched".
