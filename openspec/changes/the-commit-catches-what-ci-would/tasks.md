## 1. Every cheap refusal at once

- [ ] 1.1 The gate's fast prefix runs to its end and names each refusal
      before it stops (the `GATE_KEEP_GOING` path), and stops before the
      heavy checks if any refused. Measure first: the prefix's cost when
      all pass must not grow.
- [ ] 1.2 `npm run fix`: biome's `check --write` on the changed files, and
      any other refusal a tool can mend mechanically; the gate's refusal
      names it.
- [ ] 1.3 Plant one refusal of each kind the review counted (format, unused
      export, `| undefined`, spelling, guide citation, spec length) in one
      commit and see the gate name all of them in one run.

## 2. An engine change tests what it reaches

- [ ] 2.1 Read which guards went red on CI after green hooks
      (`git log --grep "CI"` from 2026-11-22; the review's list is in the
      proposal) and why the selection missed each.
- [ ] 2.2 Make the commit's selection include them when the staged paths
      reach every born game, derived from the import graph or from what a
      born game is, never from a list of guard names.
- [ ] 2.3 The push's fast set runs the snapshot guards that only CI ran
      (`capability-surface`, `params-stability`), unless measured too slow;
      record the cost either way.
- [ ] 2.4 Plant a `capability-surface` drift in an engine-only commit and
      see the commit refuse it.

## 3. Deltas written from the spec

- [ ] 3.1 `npm run spec-delta -- <change> <capability> "<requirement>"`
      writes the MODIFIED block with every scenario of the current
      requirement, and says how far under spec-form's bound it is.
- [ ] 3.2 `docs/work-management.md` names it where a delta is written.

## 4. Close

- [ ] 4.1 `docs/testing.md` § "What runs when" says what each hook now runs.
- [ ] 4.2 Archive, and take the next change from
      `describe-the-whole-catalog` § "0. The refactor first".
