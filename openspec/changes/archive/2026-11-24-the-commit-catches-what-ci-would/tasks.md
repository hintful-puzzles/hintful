## 1. Every cheap refusal at once

- [x] 1.1 The gate's fast prefix runs to its end and names each refusal
      before it stops (the `GATE_KEEP_GOING` path), and stops before the
      heavy checks if any refused. Measure first: the prefix's cost when
      all pass must not grow.
      Each step streams as before and only records a refusal, so a passing
      prefix runs the same commands; `prefix_verdict` stops the run inside
      each exit (build-only, documentation-only) and after the walk
      verifies. Moving those two verifies ahead of the documentation-only
      exit was measured at 9 s a docs commit (6 s + 3 s) and not done.
- [x] 1.2 `npm run fix`: biome's `check --write` on the changed files, and
      any other refusal a tool can mend mechanically; the gate's refusal
      names it. `scripts/fix.sh`, which `fast-checks` now runs first; the
      only other mechanical fixer is `spec-subjects --fix`.
- [x] 1.3 Plant one refusal of each kind the review counted (format, unused
      export, `| undefined`, spelling, guide citation, spec length) in one
      commit and see the gate name all of them in one run.
      2026-11-24: one commit-hook run named 8 refusals (the six, plus
      engine-catalog for the new module and the validator), started no test
      or build; `npm run fix` then reformatted the planted file and named it.

## 2. An engine change tests what it reaches

- [x] 2.1 Read which guards went red on CI after green hooks
      (`git log --grep "CI"` from 2026-11-22; the review's list is in the
      proposal) and why the selection missed each.
      13 red Gate runs 2026-11-22..24. capability-surface in 8; note-taking
      frames 4; mistake-overlay-coverage 3; palette-source 3; modifier-arrow
      2; params-stability, drag-cancel, catalog-families, hint-enrollment,
      capability-fixtures, asset-integrity 1 each. Causes, each checked:
      (a) `commitPlan` walked only `src/games/<id>/`, so no engine path put
      a born game in any scope, a push's included (a fill path reached 0 of
      21 born games); (b) a compiler path (`src/describe/`) reached no
      guard, since a compiled module imports none of the compiler
      (capability-surface did not select `compile-fill.ts`); (c) the
      commit's 90 s ceiling keeps the cheapest files of a ~490 s engine
      plan, so the dear guards (palette-source 7 s, modifier-arrow 5 s,
      mistake-overlay 5 s, hint-enrollment 19 s) are CI's, and the push ran
      none; (d) on replay in a worktree, eccfb608f and ce67048ed select and
      fit capability-surface and params-stability, which fail there, yet
      their hooks passed: consistent with a rebaselined snapshot left
      unstaged, which the hook only named.
- [x] 2.2 Make the commit's selection include them when the staged paths
      reach every born game, derived from the import graph or from what a
      born game is, never from a list of guard names.
      (a) a game's walk starts from its compiled modules too; (b) a walk
      through a compiled module reaches what `scripts/describe.ts` reads;
      a commit's scope adds every born game (`bornGames()`: its generated
      `<id>.game.ts`) its paths reach. (d) the commit hook refuses an
      unstaged or untracked snapshot.
- [x] 2.3 The push's fast set runs the snapshot guards that only CI ran
      (`capability-surface`, `params-stability`), unless measured too slow;
      record the cost either way.
      The plan's guards outside the games that own a `.snap`
      (`select-tests.ts --snapshots`), no build: 2026-11-24 over HEAD~2,
      10 files, 15 s of CPU, 54 s for the whole push. Residual: (c)'s dear
      guards stay CI's unless `GATE_PUSH_TESTS=1`; of the 13 red runs about
      five failed on snapshot guards alone. Whether the push should run its
      fitted plan unasked is for the refactor's debrief, with this figure.
- [x] 2.4 Plant a `capability-surface` drift in an engine-only commit and
      see the commit refuse it.
      A `Ui` field planted in `fill/game.ts`'s `newUi`, staged alone: the
      plan scoped the 21 born games and the hook failed on the snapshot.
      `select-tests.ts --verify` fails with the compiler hop removed, and
      with born games left out of the commit's scope.

## 3. Deltas written from the spec

- [x] 3.1 `npm run spec-delta -- <change> <capability> "<requirement>"`
      writes the MODIFIED block with every scenario of the current
      requirement, and says how far under spec-form's bound it is.
      Written as `.mjs` beside `spec-parse.mjs`, whose `LONGEST` it shares
      with spec-form; this change's four MODIFIED blocks were written by it.
- [x] 3.2 `docs/work-management.md` names it where a delta is written.

## 4. Close

- [x] 4.1 `docs/testing.md` § "What runs when" says what each hook now runs.
- [x] 4.2 Archive, and take the next change from
      `describe-the-whole-catalog` § "0. The refactor first".
