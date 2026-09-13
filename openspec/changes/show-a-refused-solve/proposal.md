# show-a-refused-solve

**Readiness: scaffolded 2026-09-13, not started.** Found while reading every
`EngineCore` result consumer for `spell-absence-one-way` (its `design.md` D5).
The facts below were verified by reading the code on that date; re-read them
before building on them.

## Why

A Solve the engine refuses says nothing to the player.

- `Midend.solve()` returns the refusal's text: "This game does not support
  solving", or whatever the game's own `solve` refuses with.
- `Puzzle.solve()` relays it, and **both app callers discard it**: the command
  table in `src/screens/puzzle-screen.ts` (`solve: () => this.puzzle?.solve()`)
  and the end notification's `showSolution` in
  `src/puzzle/components/end-notification.ts`.
- **It is reachable in play.** The rail offers Solve whenever `canSolve` is set
  (`src/puzzle/components/rail.ts`). Mines sets it, and its `solve` refuses with
  "Game has not been started yet" until the first click, so pressing Solve on a
  fresh Mines board does nothing at all. A solver that cannot finish a board
  entered by game ID (Abcd: "Solver could not find a unique solution.") is the
  same path.

Hint refusals already reach the player: `Puzzle.hintOnce` shows them in the
transient banner with `setAutoHintMessage(err, true)`.

## What changes

- A refused Solve is shown to the player, through the same transient banner a
  refused Hint uses, so the two controls answer a refusal the same way.
- A test at the `Puzzle` level (the pattern of `puzzle-hint-stepper.test.ts`)
  asserts the banner carries the refusal, and that a successful Solve shows none.

## What this does not do

- It does not change which games can solve or what any solver refuses.
- It does not reword a refusal. The wording is each game's, and a player reads
  it — so the change is run in the app, and a refusal that reads badly in the
  banner is raised with the owner rather than rewritten in passing.
