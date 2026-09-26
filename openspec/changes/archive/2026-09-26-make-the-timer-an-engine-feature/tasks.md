# make-the-timer-an-engine-feature — tasks

## 1. Engine

- [x] 1.1 `show-timer` preference offered by the midend in every game, default
      `isTimed`; `isTimed` removed from `PuzzleStaticAttributes`.
- [x] 1.2 `timerRunning()` as the engine's rule; `timingState` replaced by the
      fact-only `timerHolds`; `setTimerPaused`; solve-is-final (`timerStopped`)
      and `hinted` saved as optional envelope fields.
- [x] 1.3 `timer-change` notification, deduplicated; `[M:SS]` status prefix removed.
- [x] 1.4 Mines: `everCompleted`, `changedState` and `timingState` removed; an
      older save's `C` still decodes; Solve on a live board completes it.

## 2. App

- [x] 2.1 `Puzzle.timer` signal and `setTimerPaused`; worker adapter resets its
      frame clock on resume.
- [x] 2.2 `puzzle-context` pauses on `visibilitychange` and autosaves on the
      timer's seconds.
- [x] 2.3 `<puzzle-timer>` in the phone top bar and the rail; solved message
      states the time and any help.

## 3. Tests, docs, specs

- [x] 3.1 Midend timer tests rewritten to the engine rule; Mines timer test
      drives a real `Midend`; prefs tests read the game's own prefs.
- [x] 3.2 `help/features.md` § "Timing your solve", with its `::timer::` icon rule.
- [x] 3.3 `docs/games/mechanics.md` capability table and "Timed games".
- [x] 3.4 Spec deltas: `ts-engine`, `mines`, `app-shell`.

## 4. Acceptance

- [x] 4.1 Run the app: the timer on and off, in the rail and at phone width.
- [x] 4.2 Owner tries it on a phone (deployed). Accepted 2026-09-26, with the
      request to have the timer on by default everywhere (a follow-up change).
