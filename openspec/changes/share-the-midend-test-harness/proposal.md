# share-the-midend-test-harness

**Status: scaffolded, not started.** Found while writing the timer's tests
(`make-the-timer-an-engine-feature`, 2026-09-26), which added a third copy of
the thing this would share.

## Why

A test that drives a real `Midend` and asks what it reported writes the same
harness every time: a `ChangeNotification[]` that `setCallbacks` pushes into,
no-op tick and redraw callbacks, and one hand-cast accessor per notification
type, of the form

```ts
[...notes].reverse().find((n) => n.type === "game-state-change") as
  | Extract<ChangeNotification, { type: "game-state-change" }>
  | undefined
```

Measured 2026-09-26: `git grep -l "reverse().find((n) => n.type ==="` over
the test files finds **28 files** that each carry their own copy (engine
tests and game tests alike), and `new Midend(` appears 205 times across 74
test files. The copies differ only in which accessors they bother to write and
what they call them (`harness`, `driven`, `fresh`, `status`, `statusBar`,
`state`, `gameId`).

The cost is not only lines. **The cast is a claim nothing checks**: each copy
restates the notification shape by hand, so a renamed field
(`statusBarText`, `currentGameId`) is fixed in 28 places or missed in some.
And a guard that needs "the last `timer-change`" today starts by writing a
twenty-ninth copy.

## What Changes

- A shared driver in `src/engine/testing/` (beside `render-scenario.ts`),
  roughly `driveMidend(game)` returning the midend, the notes, a typed
  `last(type)` whose return type is derived from the `type` argument (no
  cast at the call site), and the tick/redraw observations the animation
  tests read (`timerActive()`, `redraws()`).
- Move the 28 files onto it, keeping each test's own local names only where a
  test reads better with them (a thin `status = () => h.last(...)?.status`
  is fine; a re-implementation is not).
- Catalog it in `docs/games/engine-catalog.md` (the gate's
  `engine-catalog.mjs` requires it) and point `docs/games/testing.md` at it
  as the way to observe a midend.

## Things to check first

- Take the population from the shape, as the measurement above does, rather
  than from a helper's name: some files will record notifications with a
  different loop.
- `render-scenario.ts` already drives a `Midend` for tier 2.5; decide whether
  the new driver sits under it or beside it, rather than making a second way
  to reach a frame.
- Verify the migration by shape: a test's assertions must not change, only
  how it reaches the midend. Count the tests per file before and after.

## Player-visible

No.
