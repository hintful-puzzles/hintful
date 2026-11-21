## 1. Split

- [x] 1.1 Re-measure the large files; read the two for seams (the call
      graph's components; `module-layering.test.ts` refuses a cycle).
      (2026-11-21: both unchanged since `22ba4e45f`. `ladder-runtime.ts` is
      three things with one-way edges: the marks, which reference no rung;
      the rungs and ladders built over them; and a hint's walk, which uses
      the ladder's `admits` and `compiledTechniques` and nothing uses back.
      `candidate-plan.ts` is the plan a game hands over and the walk class
      that runs it; the walk needed three of the plan file's helpers at run
      time while the plan's `runCandidatePlan` needs the walk, so the helpers
      go below both, into `candidate-hint.ts`, beside the `Mark`,
      `lazyPopulate` and `emitObviousCleanStep` they are written over.)
- [x] 1.2 Split each along a seam with ownership, one file a commit, a move
      verified by the diff's shape; or record why not.
  - [x] `ladder-runtime.ts` (1,381) → `cell-marks.ts` (the marks),
        `ladder-runtime.ts` (the rungs and ladders), `ladder-walk.ts` (a
        hint's walk). `candidate-plan.ts` (1,540) → `candidate-plan.ts` (the
        plan and its runners), `candidate-walk.ts` (the walk), and
        `valuesOf`, `evidenceOf`, `populateThenClean` with `PlanSetUp` into
        `candidate-hint.ts`. Every statement moved whole. The edits are
        `compiledTechniques` and `CandidateWalk` exported, and the importers
        repointed: a scratch script rewrote only import statements
        (the owner agreed to the sweep), checked as an imports-only diff
        outside the six files, and as the same multiset of lines inside
        them. The games' solver headers name both new homes of "the
        engine's marks and runner". One commit, not two: the candidate
        files import the marks, so each split rewrites the other's lines.
  - [x] Declined, 2026-11-21: `candidate-walk.ts` (1,037) stays one class.
        Its step building (~330 lines) reads the walk's turn state
        (`shown`, `lastTaken`, and the `built` cache the frontier shares),
        so a collaborator would need a back-reference to the walk.
- [x] 1.3 `npm run probe -- --verify` after each move. (No case anchors in
      the moved code; all 170 apply.)
- [x] 1.4 Re-check the declines of `compile-expr.ts` and the midend's hint
      section; record the answer. (2026-11-21, both hold.
      `compile-expr.ts` has not changed since the decline: 43 of its 46
      value declarations, 3,411 of its 3,640 lines, are one strongly
      connected component, and the three outside are 128 lines. The
      midend's hint section (lines 1364–1960) still reads and writes the
      state, `Ui`, history, position, overlays and transitions
      (`commitMove`, `afterTransition`, `emitStatusBar`, `requestRedraw`),
      so the reason recorded in `split-the-large-files` stands.)

## 2. Finish

- [ ] 2.1 The catalog cites the new files. Commit, push, archive.
