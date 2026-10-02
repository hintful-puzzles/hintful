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
  of that hint's steps. It SHALL then, on a draw state of its own, follow the
  hint's plan from the same board to its end, and check the board where the
  plan stopped. That walk MAY paint only the frame each event leaves and the
  frame it settles to.
- **Checks.** Its events SHALL include the check Check & save makes, so that a
  marked dead end is painted.
- **Counts.** It SHALL count the frames painted mid-animation, with a hint
  displayed, and with a mistake overlay, and the events after which an
  animation was armed. It SHALL record, as `role|kind`, the marks the painted
  frames carried, and every mark the renderer asked the displayed marks for
  (`StepMarks.of`).
- **What the test requires.** `src/engine/warm-repaint.test.ts` SHALL require
  that an armed animation was painted part-way. For a game with a hint, it
  SHALL require that every mark the renderer asked for, in a role the game's
  `hintMarks` legend lists, was painted by the seeded run or by a pinned
  board. It SHALL also require that every role the legend lists is one the
  renderer asks for.
- **Mistake frames** are counted and not required, because reaching a mistaken
  board takes a move specific to the game.
- **Pinned boards.** The comparison SHALL accept a game id to start from in
  place of a seeded deal. A hint mark the seeded run does not paint SHALL be
  reached from a board named in `warm-repaint.test.ts`'s ledger of pinned
  boards, as the board itself and never as a deal seed. Each pinned board
  SHALL paint a mark the seeded run does not. A mark that no board reaches
  SHALL be named, with the reason, in a ledger the test holds exact. A mark
  drawn across tiles that is not a hint mark SHALL run the comparison from a
  board that shows it, pinned in the game's own tests as the board and the
  event stream.

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

#### Scenario: A hint mark no run paints

- **WHEN** a game's renderer asks for a mark in a role its legend lists, and
  neither the seeded run nor a pinned board paints it
- **THEN** the test fails for that game and names the mark, unless the ledger
  of unreached marks names it with the reason

#### Scenario: A pin the seeded run has caught up with

- **WHEN** a pinned board paints no mark the seeded run does not
- **THEN** the test fails for that game and names the board

#### Scenario: A legend role the renderer never reads

- **WHEN** a game's legend lists a role its renderer never asks the displayed
  marks for
- **THEN** the test fails for that game, because the help's list of marks
  describes a mark the game cannot paint

#### Scenario: A frame a plan wins on

- **WHEN** a hint's plan ends on a step that solves the board, and the win
  frame leaves a cue the fresh paint does not draw
- **THEN** the walk paints that frame and the comparison fails
