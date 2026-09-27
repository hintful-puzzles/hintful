# scope-engine-commits-by-reach — tasks

Measured 2026-09-27 on the development machine, **not idle**: load average
~7, swap 19.3 GB used of 20 GB, about 1 GB free. Every absolute time below is
an upper bound; the before/after pair was taken back to back and its ratio is
the part to trust. Two workers throughout.

The commit census replays each of the last 300 commits' paths against
**today's** tree (closures as they are now, not as they were), which is the
question that matters for commits still to come.

## 1. Measure before building

- [x] 1.1 A first pass keyed on "a staged path is reached by a game-reaching
      test file" found narrowing on 23 commits of 172 with code, and named the
      blockers: `midend.ts` and `game.ts` (true harness), and a long tail of
      engine modules reached by the guards only through *globs in helpers*.
- [x] 1.2 That pass also found the refinement: a changed test or module blocks
      only the files that read it, not the whole run, if those files run
      unscoped in a vitest invocation of their own. So a plan is `scope` +
      `whole` files + `narrow` files, not a single yes/no.
- [x] 1.3 Replayed with the plan, before section 3's split: of 139 commits
      whose paths the selector models, 23 were game-only; the heavy hint
      guards (`hint-resume`, `hint-quality`, `hint-ordinal`, `hint-mark`,
      `mark-all`, `candidate-reading`) narrowed on only 47 each, while
      `input-parity` and `difficulty-contract`, which import no hint helper,
      narrowed on 97 and 98.

## 2. The walk: one, shared

- [x] 2.1 `scripts/checks/reach.ts`: imports (static and dynamic, by
      `ts.preProcessFile`), `import.meta.glob` calls read from the syntax tree
      in **every module visited**, and `new URL(…, import.meta.url)`. Globs by
      literal base, plus the literal last segment or `*<literal>` suffix, so
      `/src/**/*.test.ts` does not reach a `.snap`.
- [x] 2.2 Found while building it: `select-tests.ts`'s glob channel read only
      test files' own globs, and resolved a root-anchored pattern (`/src/…`) to
      a path outside the repo. Every root-anchored glob in the tree sat in a
      helper (`enrollment.ts`'s engine and test sources), so the selector could
      not see them at all. The reach channel replaces it.
- [x] 2.3 `source-scans.ts` now uses the walk. Its classification before and
      after: identical, 14 of 14 files.
- [x] 2.4 `commitPlan`: a staged game path scopes its game only; any other
      staged path scopes every game whose own files reach it, and puts in
      `whole` every test file outside the game directories whose walk, cut at
      game directories, reaches it. No game in scope means no narrowing.
- [x] 2.5 `select-tests.ts` prints the plan (`ALL`, or `scope`/`whole`/`narrow`
      lines); `gate.sh` runs `whole` files unscoped and `narrow` files with
      `GATE_GAME_SCOPE`, as two vitest invocations per pass. `gameScope` in
      `game-scope.ts` is superseded and deleted.
- [x] 2.6 `select-tests.ts --verify` in the gate: eight plans on the real tree
      (a Pearl commit, the midend, the registry barrel, `latin-hint.ts`
      through a helper glob, a
      staged test, a staged snapshot, a help page). Planted "read globs only in
      the start file" and watched two of them go red; restored.

## 3. What the walk showed was structural

- [x] 3.1 `engine/testing/enrollment.ts` held the engine-source and
      test-source scanners beside `builtGames`, and every hint guard imports it
      through `hint-games.ts`, so every hint guard "read" every engine module
      and every test file. Split into `engine-source.ts` and `test-source.ts`,
      with `code-lines.ts` holding the shared comment-stripping.
- [x] 3.2 `hint-quality.test.ts` held the em-dash source scan, the only thing in
      it reading engine source. Moved to `hint-em-dash.test.ts`, unchanged.
- [x] 3.3 Replayed again: the heavy guards now narrow on 85–99 of the 139
      commits each (hint-mark 85, hint-quality 86, the rest 91–99), against 23
      for all of them before. What still runs them whole is what should:
      `midend.ts`, `game.ts`, `types.ts`, `key-labels.ts`, `pointer.ts` and the
      testing harness, which the guards read themselves.

## 4. Cost

- [x] 4.1 A commit staging `src/engine/candidate-hint.ts` (the second most
      touched engine module): 133 files selected, 16 whole, 117 narrow, 18 of 57
      games in scope. Main pass, back to back, both green: unscoped **358 s
      wall, 677 s of test time** (load 7.1); planned **171 s wall** (17 s
      whole + 154 s narrow), **279 s of test time**, 986 cases skipped as
      other games' (load 10.9, so the second run had the worse box).

## 5. The 22 "game plus a test outside it" commits

- [x] 5.1 Answered by 1.2 rather than separately: a staged test runs whole with
      its readers (the test-source scanners), and every other file still
      narrows to the staged games. `ac5b82cb` (Pearl plus `hint-quality.test.ts`)
      replays as 14 whole, 65 narrow, scope Pearl.

## 6. Close

- [x] 6.1 `docs/games/testing.md`: the walk, the reach scope, and "a helper's
      glob is paid for by every file that imports it". `AGENTS.md` § "Git"
      names the scope and the verify step.
- [x] 6.2 Spec delta: build-pipeline, MODIFIED the selection requirement (the
      walk reads helpers' globs; the gate holds it to known couplings), and
      REMOVED + ADDED the narrowing requirement, whose "touches the engine as
      well" scenario no longer holds.
