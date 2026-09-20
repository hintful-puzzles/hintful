# scope-the-narration-corner-walk-to-push

## Why

`derive-the-narration-ledger-population` added a third rule to the narration
walk — each tiered game's last preset at its hardest teachable tier — because
without it the ledger's rot half reads Group's live listing as dead. It is
right, and it is **47 s**, and the owner asked the obvious question: is that
paid on every commit?

**It is.** Measured: a one-line edit to `src/games/tracks/render.ts` selects 57
test files and `hint-quality.test.ts` is one of them, because
`scripts/checks/select-tests.mjs`' glob channel maps any staged path under
`src/games/` to every guard that reads game source as text. So the rule landed
on essentially every commit that touches a game or the engine, for a check whose
subject is *rot*.

## What changes

- **The third rule and the ledger's rot half are scoped by role**, off in the
  automatic per-commit hook and on everywhere else. `PRECOMMIT_HOOK_RUN`
  (`engine/testing/slow.ts`) reads `.husky/pre-commit`'s existing
  `GATE_PRECOMMIT`, so the hook keeps one name for one idea and CI — which runs
  `npm run gate` with the toggle unset — is the backstop.
- **The two move together**, because the rot half's verdict is decided against
  that walk: with the rule off it would report a live listing as dead. It is
  `skipIf`-ed rather than weakened, so a deferred check is **reported as
  skipped** instead of passing over a sample it never took.
- **The forward half is untouched.** A sentence over the limit with no ledger
  entry still fails on every commit, at every tier and every preset. That is the
  half that catches what the commit being made just wrote; only the half that
  catches decay moved to push.
- **The backstop is asserted, not assumed.** `gate-scope.test.ts` — already the
  home of "is the gate's scoping still safe?" — now fails if the CI workflow
  ever sets `GATE_PRECOMMIT`, or if the hook stops setting it.

## What it costs and saves

`hint-quality.test.ts`, whole file, same box: **57.7 s** hook-scoped against
**114.5 s** full (load 5.2 and 10.7, so the second is the looser upper bound).
The block alone was 36 s before the third rule and 83 s after; the hook path is
back to the 36 s shape. CI pays the 47 s once per push instead of once per
commit.

## Why not "only when those games' code changed"

That was the owner's suggestion and it is the natural one, but it is unsound
here: the shared Latin chain sentence lives in `src/engine/hint-text.ts`, so the
commit most likely to kill a listing touches **no** `src/games/<id>/` path at
all, and per-game-by-staged-path would skip the check on exactly those commits.
The repair ("...or any engine file") runs everything nearly always, since engine
files are staged constantly. Scoping by role has no such hole, needs no list of
game ids to rot, and is the shape the gate already uses twice.

## What this does not do

- **Not a weakening of the gate.** Nothing reaches `main` unchecked: the
  deferred half runs in CI on every push and in any manual `npm run gate`.
- **Not a license to defer anything else.** The `build-pipeline` delta states
  the conditions — a push-time backstop, a check of decay rather than of the
  commit's own code, reported as skipped, and the backstop asserted by a test.
- **Not a change to the ledger, the limit, or any narration.**
