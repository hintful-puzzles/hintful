# deploy-without-waiting-on-the-suite

## Why

Every push waited about ten minutes (three runs measured 2026-09-27: 12 min
each) for CI to re-run the whole suite before publishing, and every commit had
already passed the same gate in the pre-commit hook. The owner asked for faster
velocity until there are more players.

The suite cannot simply leave CI: the hook scopes its runs by role (tests a
commit could not have affected, and checks deferred to push), and every such
narrowing rests on CI running everything. So the suite stays in CI, beside the
deploy instead of in front of it.

## What changes

- `scripts/gate.sh` gains `GATE_BUILD_ONLY=1`: the fast checks, then `vite
  build`, and nothing else (15 s locally).
- CI's `build` job runs that and uploads the build; `deploy` needs only it. The
  `gate` job runs the full `npm run gate` alongside, and still fails the run.
- `gate-scope.test.ts` now requires a CI step running the full gate, not just
  any mention of it, since the build-only step would satisfy the old pattern.

Actions minutes are unmetered for this public repository on standard runners, so
the extra job costs nothing.
