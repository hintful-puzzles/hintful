# scope-the-narration-corner-walk-to-push — tasks

- [x] 1.1 Measure the premise before designing against it: does the per-commit
      hook actually run this guard? It does. A one-line edit to
      `src/games/tracks/render.ts`, staged, makes
      `scripts/checks/select-tests.mjs` return 57 files including
      `src/engine/hint-quality.test.ts` — the glob channel maps any staged path
      under `src/games/` to every guard that reads game source as text. So the
      47 s landed on nearly every commit.
- [x] 1.2 Add `PRECOMMIT_HOOK_RUN` to `engine/testing/slow.ts`, reading the
      hook's existing `GATE_PRECOMMIT` rather than a second toggle. Document
      the polarity: unlike `SLOW_TESTS_ENABLED` it defaults to **more**, so
      forgetting it costs time and never coverage.
- [x] 1.3 Gate `lintCases`' third rule on it, and `skipIf` the ledger's rot half
      on the same flag so the two cannot diverge. Skip rather than weaken, so
      the runner reports it.
- [x] 1.4 Keep the forward half on every commit — a sentence over the limit with
      no entry still fails in the hook, at every tier and every preset. Proved
      rather than assumed: breaking the Palisade exemplar's ledger entry so it
      matches nothing turned the **hook-scoped** run red on Palisade's first
      preset, naming the 141-character sentence. Restored.
- [x] 1.5 Assert the backstop rather than trusting it: `gate-scope.test.ts` fails
      if CI ever sets `GATE_PRECOMMIT` or the hook stops setting it. Proved it
      fails: editing the CI step to `GATE_PRECOMMIT=1 npm run gate` turned it
      red with "CI sets GATE_PRECOMMIT, so every check deferred to push now
      runs nowhere"; restored.
- [x] 1.6 Update the prose that describes the gate's scopings: `.husky/pre-commit`
      and `scripts/gate.sh`'s headers, `AGENTS.md` § "Git" (it said "Two
      scopings by role" and there are now three, with the four conditions
      written out), and `docs/games/hints.md` § "Keep the narration terse" —
      both where the walk is described and where a reader meets a red from the
      rot half.
- [x] 1.7 Re-measure and record: hook-scoped against full, same box.

## Measured

`hint-quality.test.ts` + `gate-scope.test.ts`, at near-identical load (4.54 and
4.37, a minute apart): **56.3 s** hook-scoped, 1 test reported skipped, against
**108.0 s** full. The narration-length block alone was 36 s before the corner
rule and 83 s after, so the hook path is back to the 36 s shape and CI pays the
47 s once per push instead of once per commit.

## Watch out for

**A deferral is only as good as its backstop, and the failure is silent in the
worst direction.** If `GATE_PRECOMMIT` were ever set in CI as well as in the
hook, every deferred assertion would run **nowhere** while both runs reported
green. That is why 1.5 is a test and not a comment, and why the toggle is read
from one place.

**Do not extend this to the forward half.** The license in the `build-pipeline`
delta is deliberately four conditions long, and the first is that the deferred
thing checks decay rather than the code the commit is changing. A guard that
catches what the author just wrote belongs on the per-commit path whatever it
costs; the honest answer for one of those is a cheaper walk, not a later one.
