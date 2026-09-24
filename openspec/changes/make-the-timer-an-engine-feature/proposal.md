# make-the-timer-an-engine-feature

**Status: scaffolded, not started.** Owner request from the device pass
(`test-touch-on-a-real-device`, 2026-09-24): *"why does only Mines have a timer?
I think we should make the timer an engine feature that could be enabled in any
game."*

## Why

Only Mines has a timer because only Mines sets `Game.isTimed`, the flag it
inherited from upstream, where `mines.c` was the one timed game. Nothing about
timing a solve is specific to Mines. Whether a player wants to see their time
is a preference about how they play, not a property of the puzzle. So by
AGENTS.md's test ("can we say what a game would legitimately want to do
differently?") it belongs to the engine and the player, not to a per-game
flag.

Most of the machinery already exists and is game-agnostic. Checked 2026-09-24
against `src/engine/midend.ts`:

- `Midend` keeps `timerElapsed`, advances it in `timer()` while
  `timedClockActive()`, and resets it on a new game.
- The elapsed time survives save/load (the save envelope carries
  `timerElapsed`).
- `emitStatusBar` prefixes `[M:SS]`, but only when the game is both `isTimed`
  **and** `wantsStatusbar`, which is why the clock lives inside Mines' status
  line.

## What would change (to decide in design)

- **Who turns it on.** A player preference (off by default, or on?), global or
  per game. Mines keeps its clock on by default, since a Mines player expects
  one. That override derives from the `isTimed` Mines already declares.
- **Where it shows.** Its own element in the puzzle chrome (the phone's top
  bar, the desktop rail), not text prefixed onto a game's status line, so
  games without a status bar can show it.
- **When it runs and stops.** From the first move or from the deal; paused
  while the page is hidden (`visibilitychange`) and while the reference or
  More sheet is open; stopped at completion. Once hints exist, does a hinted
  solve say so beside the time?
- **Where the time goes.** Shown on the completion notification. Best times
  per game and params are an obvious next step, but a separate change.
- `timedClockActive()`'s conditions are read and restated as the engine's rule,
  not Mines' rule.

## Player-visible

Entirely, so the owner accepts the chrome placement and the default.
