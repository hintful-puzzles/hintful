# Design: localize-puzzle-screen-check-save-hang

## The culprit, and why the earlier pairings missed it

An import-graph walk of every test file (relative imports, transitively) for
the modules that sit between `puzzle-screen.test.ts` and the three it mocked
named two files that import `screens/puzzle-screen.ts` itself, unmocked:
`help-command-links.test.ts` and `puzzle-command-homes.test.ts`. Under one
worker, with the order forced by `--sequence.shuffle.files --sequence.seed`:

| first file | then `puzzle-screen.test.ts` |
| --- | --- |
| `help-command-links.test.ts` (seeds 1, 2, 4) | 8 failed |
| `puzzle-screen.test.ts` first (seed 3) | all passed |
| `puzzle-command-homes.test.ts` (seed 1) | 8 failed |
| `puzzle-screen.test.ts` first (seed 3) | all passed |

The proposal's pairing of `puzzle-command-homes` "passed" because a single run
lets the sequencer pick the order, and it put the victim first. The falsifier
did not fire: the failure reproduces deterministically under
`VITEST_MAX_WORKERS=1`, so the cause is the shared graph, not load.

The mechanism: `vi.mock` changes what the worker's module registry hands to
imports evaluated *after* it. With `isolate: false`, an earlier file had already
evaluated `puzzle-screen.ts` and `quick-save-actions.ts` against the real
`alert-dialog.ts`, `toast.ts` and `saved-games.ts`, and those cached modules
kept their bindings. The real `showAlert` then waited for a player, which the
hour-long `testTimeout` turned into the observed stall.

`utils/errors.test.ts`, the only other `vi.mock` user, has the same exposure: it
mocked `dialogs/crash-dialog.ts` beneath `utils/errors.ts`, which
`puzzle/puzzle.ts` imports. With `puzzle-worker-start.test.ts` first, three of
its six tests failed (seeds 1, 2); with itself first, none.

## Decision: no module mocks at all; spy on the real export

Vitest compiles `import { showAlert } from "…"` into a property read on the
exporting module's namespace at call time. `vi.spyOn(namespace, "showAlert")`
therefore reaches every importer, however early it was evaluated, and
`vi.restoreAllMocks()` in `afterEach` hands the real function to the next file
in the worker, which a `vi.mock` never did. `savedGames` is a shared instance,
so its methods are spied on directly.

Rejected:

- **`vi.resetModules()` and a dynamic import.** It re-evaluates `puzzle-screen.ts`,
  whose `@customElement` would define `puzzle-screen` a second time in the
  worker's shared `customElements` registry and throw.
- **Isolating mocking files in a separate vitest project.** It keeps a tool whose
  correctness depends on scheduling, and splits the config the gate's pass
  partition and test selection both read, to protect two files that did not
  need the mocks.
- **Keeping one-mocking-file-per-module and adding an "importer" rule.** The
  set of modules between a test and its mock is a transitive-closure question
  about every other test file's imports. A guard for it would be a graph walk
  that is harder to trust than removing the mechanism.

So `no-duplicate-module-mocks.test.ts` becomes `no-module-mocks.test.ts`: no
test file calls `vi.mock`, `vi.doMock` or `vi.hoisted`. The rule is stricter
than the hazard (a mock of a module nothing else imports would be safe), because
"nothing else imports it" is a fact about other files that changes without the
mocking file changing, which is exactly how this failure arrived.

The proposal also asked that a missing mock fail fast rather than wait. A spy
installed in `beforeEach` cannot be missing in the way a mock could, so there is
no remaining path to a real modal.

## A vacuous test found on the way

"writes no autosave for it, so the home-screen badge stays honest" asserted
that a `Set` in the mock factory stayed empty. Nothing could write to that set,
and the test never ran the state-change handler that autosaves, so it could not
fail. Its claim now sits in "records the board it will re-deal from", the one
test that drives the real handler: `autoSaveGame` is not called for a board
with `totalMoves: 0`. Setting `totalMoves: 1` fails it.

## Verification

- Both orders of `help-command-links`, `puzzle-command-homes` and
  `puzzle-screen` under one worker: 47 passed (seeds 1 and 3).
- Both orders of `puzzle-worker-start` and `errors`: 9 passed (seeds 1 and 3).
- `no-module-mocks.test.ts` fails naming `./utils/errors.test.ts` when a
  `vi.mock` is planted there.
