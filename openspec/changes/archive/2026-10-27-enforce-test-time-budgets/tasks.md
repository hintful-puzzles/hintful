# Tasks — enforce-test-time-budgets

## 1. Measure

- [x] 1.1 Record per-file CPU time (D1) in one CI run and two local runs, and
      the calibration workload's ratio between them (D2); choose units or raw
      seconds by that ratio. (Gate run 40553996591: 68 CPU-minutes of own
      time. CI over local ran 1.5 to 2.3 by file and 1.3 for the calibration,
      so raw seconds, CI's table, the local one divided by the least ratio.)
- [x] 1.2 List every file over D3's budgets, with its cost, and the hooks'
      plans for three typical commits (one game, the engine, a config file).
      (CI, Gate run 40553996591: the eight hint-walk shares at 159 to 352 s,
      warm-repaint 199, difficulty-contract 147, hint-ink 145, hint-mark
      132, twiddle-hint 128, hint-gesture 122. The hooks' plans are priced
      by `test-cost.ts fit`, below.)

## 2. Cut the suite under the budgets

- [x] 2.1 The hint walks' blocks: for each, what it catches that the games'
      own hint tests do not, with a planted defect; trim or retire by that.
- [x] 2.2 Each other file over budget, heaviest first, by D5's treatments;
      each cut states at its site what still covers the configuration. A
      test kept for dev work moves out of every default suite (D5).
- [x] 2.3 Re-measure: every file and the suite within budget on CI, and the
      three typical commits' plans within the commit ceiling. (Gate run
      40572795933: 36.0 reference minutes, the dearest file 103 s, 9.7
      minutes of wall from 20.7; on a slower runner, 40574611255, 43.3,
      within the error the gate allows. Commits staging a config file and
      the engine ran 58 to 90 s of their 90; a push 297 of its 300.)

## 3. Enforce

- [x] 3.1 The setup hook and reporter that record each file's CPU time, and
      the gate step that judges them against one budget table (D1, D3).
      (A setup file and `test-cost.ts report`; no reporter, see D1.)
- [x] 3.2 The plan prediction and ceiling in both hooks (D4). (`fit`, which
      defers past the ceiling rather than refusing, see D4.)
- [x] 3.3 See each check fail: a planted heavy loop in a test file fails the
      budget; a plan over the ceiling is refused before a test runs. (An
      85-second loop failed at 82 s against the local 80; an `ALL` plan was
      cut to 59 s of the commit's 60, which first showed `fit` keeping every
      file of an `ALL` plan as if staged.)

## 4. Document

- [x] 4.1 `docs/testing.md` § "Right-sizing the gate" and § "What runs
      when": the budgets, where they live, and what to do when one fails.
- [x] 4.2 The Gate workflow's limit, from the measured run (it was 45 for a
      21-minute run). (30, for a 9.7-minute run on a reference-speed runner.)
