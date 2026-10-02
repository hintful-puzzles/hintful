## MODIFIED Requirements

### Requirement: The warm-frame comparison answers for what it reached

The run behind "A warm frame matches a fresh paint of the same state" SHALL paint
the frames a player sees between two settled ones, and SHALL report what it
showed each game, because a pass says nothing about a frame the run never
painted.

- **Animation frames.** After every event it SHALL advance the midend's clock
  in steps shorter than any animation or flash in the collection, painting each
  frame until one is still. `Midend.timer` takes seconds.
- **Drag previews.** It SHALL paint a drag's preview before the drag is released.
- **Hint frames.** It SHALL show a game that has a hint its hint, and play some
  of that hint's steps.
- **Counts.** It SHALL count the frames painted mid-animation, with a hint
  displayed, and with a mistake overlay, and the events after which an
  animation was armed.
- **What the test requires.** `src/engine/warm-repaint.test.ts` SHALL require
  that an armed animation was painted part-way, and that a game with a hint
  painted a hint frame.
- **Mistake frames** are counted and not required, because reaching a mistaken
  board takes a move specific to the game.
- **Pinned boards.** The comparison SHALL accept a game id to start from in
  place of a seeded deal. A game that draws a mark across tiles which the seeded
  deal does not show SHALL run the comparison from a board that shows it,
  pinned as the board and the event stream rather than as a deal seed.

#### Scenario: The clock ticks in whole seconds

- **WHEN** the run advances the clock by one second or more after an event that
  armed an animation
- **THEN** the animation ends inside the tick with none of its frames painted,
  and the test fails for that game

#### Scenario: A hinted game is never shown its hint

- **WHEN** the run shows a game that has a hint no hint frame
- **THEN** the test fails for that game, rather than passing over a hint overlay
  it never painted

#### Scenario: A mark drawn across tiles outlives its flag

- **WHEN** a frame the comparison paints draws a mark across tile edges, and a
  later frame clears the mark while repainting only some of the tiles it
  crossed
- **THEN** a warm frame keeps the mark's pieces over the tiles that did not
  repaint, and the comparison fails

#### Scenario: A cross-tile mark the seeded deal never shows

- **WHEN** a game's cross-tile mark leaves its tile key, and the seeded run
  never paints that mark
- **THEN** the game's comparison from a pinned board that shows the mark fails,
  where the seeded run alone would pass
