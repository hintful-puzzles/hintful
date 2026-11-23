## Context

Read from the code on 2026-11-23 (re-check before relying on it). The card is
`src/components/first-open-card.ts`, opened by `showFirstOpenCard` in
`src/screens/puzzle-screen.ts` once the first board is on screen. The screen's
`<puzzle-context>` owns one `Puzzle` (one worker, one midend); everything the
screen remembers (last board, autosave, played date, params) is done in
handlers on that element's events (`puzzle-loaded`, `puzzle-game-state-change`,
`puzzle-params-change`), which bubble and are composed.

## Decisions

### The example is a second puzzle, not the live one with the board set aside (1.1)

The example view is a component of its own that renders, in the board area's
place, its own `<puzzle-context>` with a non-interactive `<puzzle-view>`: a
second `Puzzle`, on a second worker. It stops the three puzzle events at its
root, so none of the screen's handlers runs for it.

Why: "counted for nothing" is then structural. No flag has to reach the
autosave, the last-board record, the timer, the status line, the end
notification or the hint words, each of which reads the screen's own
`Puzzle`. The player's board is never touched, so a shared link's board, a
remembered board and a board dealt for this visit all come back as they
were, with no save-and-restore. Setting the live board aside would need a
save, a flag in each of those places, and a restore that can fail. The cost
is a second worker's start, once, on a first open.

**Play from the example** removes the view, and the screen's board is shown
again. The owner's first lean was to deal another where the board behind the
card was dealt for this visit. With a separate example that board was never
solved, so it is kept: the player plays the board they would have had.

### The example is played to its end by the game's own hint (1.1)

The example is dealt at the params the screen's puzzle has (the size being
opened), then finished in its worker without animation: hint steps are
applied one after another until the board is solved, and Solve finishes any
part the hint refuses. A new midend method does this, with a step budget,
and arms no flash: the example is shown at rest.

Why the hint and not Solve alone: a query game's finish is its questions.
Mines' board has no mines until the first square is opened, so Solve alone
has nothing to show; its hint opens the middle and deduces the rest. Guess's
hint makes the guesses that find the code, so the rows are there to point
at. A fill game's hint ends at the same board Solve gives. A moving-pieces
game's hint ends at its goal. So one rule serves every kind, and no game
names a fixed board. A fixed board stays the fallback for a game whose
callout target is not guaranteed on a played board; none is known yet.

### A callout is a narrated step with no move (1.2)

The midend gains an active callout, narrated and drawn as a Check's verdict
is (`activeCheck`, read by `narratedStep` and `drawnHintStep`): a `Sentence`
whose references mark the part. The game's renderer paints it from
`stepMarks`, the app measures and colors its marks through
`HintPresentation`, and picking the reference's pill flashes it. A callout
therefore reads exactly as a hint does, and no renderer changes.

The form in the description, under `help:`:

```yaml
help:
  callouts:
    - part: count            # a clue kind, a value name, or a mark kind of the hint
      says: "{outline: A number} counts the mines in the eight squares around it."
```

`says` uses the stated steps' reference syntax, with the part's role. The
part resolves on the example board to one instance through what the game
already gives the engine: for a game with `Game.rules`
(`describedRules`), its `deals` (a clue kind's first clue) and `grid` (a
value's first element); for the rest, the game's compiled voice's mark
kind. Mines and Guess have neither `rules` nor a part reading, so the build
starts there: what each lacks is the first thing 2.3 adds, as an engine
capability another game could adopt, never a per-game locator.

Which capability owns the form: `help-pages` (the help shows the callouts'
words, from the same source), with the compiler's refusal of an unknown
part in `build-pipeline`'s description checks. Settled when 2.3 writes the
delta.

## Open

- 1.3, the layout, is not designed yet: where the callout list sits at a
  phone width and a wide one, and what a screen reader hears. The words area
  under the board (`renderWords`) is the likely place, since it already
  shows a hint's pills.
- Whether a part with no instance on a played board (a Guess color never
  guessed) needs the fixed-board fallback.
