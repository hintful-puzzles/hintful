## 1. Where the work goes

- [x] 1.1 Profile Light Up's and Boats' born deals on the boards of the
      proposal's table (`deal-profile`, and `DEAL_WALK_CELLS=<params>
      npm run deal-walk -- <game>` for the stage census). Record in a
      design.md which stage holds the work: draws thrown away, mends, the
      tier climb, or the uniqueness solve; and against the hand-written
      generator at `75691d811`, which it did not do.

## 2. The cut

- [x] 2.1 Make that stage cheaper in the engine, for every born game.
      Each step counted by `npm run compare-cost -- --baseline <worktree
      of the commit before> lightup boats clusters sticks unruly`, its
      table recorded in design.md. (Each step was counted by the engine's
      own solve and draw counts as it went, design.md § "Decisions"; the
      instructions table is of all of them together.)
- [x] 2.2 The deals' milliseconds on the proposal's boards, the least of
      five CPU-time runs, in design.md. Done when none is slower than the
      hand-written deal by more than its spread, or one over 100 ms has a
      reason the hand-written one did not need, recorded. (None is over
      100 ms; two are slower and under it, with where their cost lies, as
      the requirement now reads.)
- [x] 2.3 The tier walk (`scripts/checks/tier-walk.test.ts`, its header
      says how) for the games the cut touched: a cheaper deal still deals
      the tier it asks.

## Workflow follow-up

- Commit each step; push at the session's end; archive with the last
  commit.
