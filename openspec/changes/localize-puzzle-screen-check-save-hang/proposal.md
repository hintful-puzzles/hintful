# localize-puzzle-screen-check-save-hang

Found while gating `afford-every-hint-action`, which changes nothing the
failing tests reach. What was found and done is `design.md`; the proposal below
is as scaffolded.

## Why

A pre-commit gate stalled for over twenty minutes with one vitest fork worker
at 0% CPU, which the one-hour `testTimeout` turns from a failure into a hang.
Re-running the app-layer tests
(`src/puzzle src/components src/screens src/dialogs src/store`) with
`--testTimeout=30000` then failed eight tests in `src/screens/puzzle-screen.test.ts`,
all in its Check-&-Save block: the first ("saves a clean board (0 mistakes) and
confirms on the button, not in a popup") failed in 4 ms, and "refuses to save
when mistakes are present" timed out at 30 s. A fast assertion failure followed
by a wait that never ends reads as the file's `vi.mock`s of
`dialogs/alert-dialog.ts`, `dialogs/toast.ts` and `store/saved-games.ts` not
taking, so the real `showAlert` waits for a player.

Measured 2026-09-30 on the development machine (load average 5 to 7):

- the same five-directory run failed once in five on the change's tree, and
  passed once at HEAD;
- `puzzle-screen.test.ts` alone passed, and with `VITEST_MAX_WORKERS=1` it
  passed paired with each file that imports one of the mocked modules
  (`puzzle-command-homes`, `keys`, `saved-games`, `dialog-dismissal`) and with
  the whole group.

`no-duplicate-module-mocks.test.ts` rules out two files mocking one module, so
this is a different path into the shared module graph under `isolate: false`:
most likely a file that imports `screens/puzzle-screen.ts` (or a module it
imports) unmocked, landing earlier in the same worker.

## What changes

Find the file that leaves the real module in the worker's graph (vitest's
`--reporter=verbose` with `--sequence.seed` recorded on a failing run gives
the order to replay), then make the mocked modules unreachable from any other
file's imports in that worker, or make `puzzle-screen.test.ts` import what it
tests after its mocks in a way that cannot be served from the cache. Whatever
the fix, the test file should fail fast rather than wait when a mock is not in
place: a real dialog opened in a test is the thing to assert against.

## Falsifier

If a recorded failing seed does not reproduce under `VITEST_MAX_WORKERS=1`,
the cause is not the shared graph, and the load average at the time is the next
suspect.
