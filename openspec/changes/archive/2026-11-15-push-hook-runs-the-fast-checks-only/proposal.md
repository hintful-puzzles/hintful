# push-hook-runs-the-fast-checks-only

Filed and done 2026-11-15, on the owner's word after a session waited on a
push for minutes and then met a red CI run.

## What the work found

The last 100 runs of CI's gate on `main`: 71 green, 19 red, 10 canceled. Sixteen
of the nineteen were a cross-game hint sweep, three a cost budget that only
CI's runners can judge. The push hook's tests are narrowed to the games the push
reaches and cut to its cost ceiling, so they found none of these before CI did,
and a session pushing once at its end waited minutes for them.

## What changes

- The pre-push hook runs the gate's fast checks and no test. `GATE_PUSH_TESTS=1
  git push` runs the tests the commits left out, as before.
- `npm run test:hint-sweeps` runs the six cross-game hint sweeps whole.
- The brief, `docs/testing.md` and `docs/work-management.md` say so.

The cost-budget check for a game's own files was already CI's only.
