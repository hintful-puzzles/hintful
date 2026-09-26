# make-the-timer-an-engine-feature — design

## D1. Who turns it on: a per-game preference the engine adds

`show-timer` ("Show timer") is appended by the midend to every game's preference
form, so it lands in the existing "<Game> preferences" section and is stored
per puzzle by the existing `setPuzzlePreferences` path, with no new settings
plumbing. Per game rather than global, because a player who times Mines need not
want a clock over a Loopy they play to relax. The default is the game's
`isTimed`, which Mines already declares, so it keeps its clock and every other
game starts without one. `isTimed` is now an input a mechanism consumes (the
default), not a clock policy. It left `PuzzleStaticAttributes`, since the app no
longer reads it.

## D2. When it runs: one engine rule, plus one fact a game may state

`Midend.timerRunning()`: shown, not paused, not stopped, at least one move in the
log, status `ongoing`, and not `timerHolds(state)`.

- **From the first move**, not the deal. It is fairer on a big board that takes
  a while to read, and it is exactly Mines' rule, whose first click is its first
  move.
- **A solve is final** (`timerStopped`, set in `syncTimer` whenever the status
  is solved or solved-with-help). It is saved as an optional envelope field,
  because a solve that was undone and then played differently leaves no solved
  state in the history. This replaced Mines' `ui.everCompleted` and its `C` in
  `encodeUi`; `decodeUi` still reads an older save's `C` and ignores it.
- **A loss holds it only while lost** (Flood, Guess), since an undo plays on.
- **`timerHolds(state)`** replaces `timingState(state, ui)`. Mines' death is not
  a loss by status (upstream reports it `ongoing` so the player undoes), yet
  nobody plays a dead board. That is a fact about the board which the status
  vocabulary cannot carry, so the game states it. The hook owns no clock policy:
  Mines' other three conditions (no layout yet, won, ever won) all became the
  engine's rule. Reporting a death as `lost` was the alternative, and it was
  declined here because it would add a popup to every Mines death, a UX change
  nobody asked for.
- **Mines' Solve now completes the board.** Upstream's Solve never set `won`, so
  the game stayed `ongoing` and its clock ran on over a revealed grid. That is
  missing bookkeeping (mechanics guide, "Solve"), and the engine rule needs it.
  The status bar's existing "Auto-solved." branch is now reachable.

## D3. Paused while hidden, and nowhere else

`puzzle-context` sets `setTimerPaused(document.hidden)` on `visibilitychange`
and once at load. The reference panel and the More sheet do **not** pause it:
consulting the reference is part of solving, and the sheet is a few seconds. The
worker adapter resets its frame clock on resume, because a loop kept alive by an
animation would otherwise hand the whole hidden interval to the first frame.

## D4. Where it shows

A `<puzzle-timer>` readout: after the move count in the phone's top bar, and
under it in the rail's "Your position" group (which also renders in the phone's
More sheet, beside the counter it follows). It is absent, not blank, when off.
It no longer rides in the status line: most games have none, and the `[M:SS]`
prefix and its `ts-engine` requirement are removed. The solved message adds
"Solved in M:SS", or "Finished in M:SS, with help" when a hint was shown or the
solver used. A time is still the player's, but presenting it bare would claim
something it is not.

## D5. Notification and autosave

`timer-change { timer: { seconds, assisted } | null }`, deduplicated in the
midend by the readout, so at most one message a second crosses the worker
boundary instead of one per animation frame (the old status-bar prefix posted
every frame). `puzzle-context` watches `timer.seconds` for the autosave as it
used to watch Mines' status text, so a running clock is saved about once a
second. That is the cost Mines already paid, and now it is paid only by a player
who switched the timer on.

## Not in this change

Best times per game and params, which the proposal called the obvious next
step, are not wanted: the owner declined them on 2026-09-26, since the current
vision deliberately has no progression features (AGENTS.md § "Goal").

## What replaces the old checks

`midend.test.ts` "Midend timer" covers the rule: off by default, offered in every
game, counts from the first move, pauses, final after a solve across a save,
`timerHolds`, assisted, and switched off mid-game. `mines.test.ts` drives the
real Mines through a `Midend`: on by default, first click, final after Solve.
