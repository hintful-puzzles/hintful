## ADDED Requirements

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

- **WHEN** a drag's preview draws a mark across tile edges and the release
  repaints only the tiles whose own content changed
- **THEN** a warm frame keeps the mark's pieces over the tiles that did not
  repaint, and the test fails
