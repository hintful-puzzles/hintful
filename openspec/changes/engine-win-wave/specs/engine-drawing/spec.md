## MODIFIED Requirements

### Requirement: The midend drives the animation and flash timer

For games that animate, the midend SHALL obtain the animation's duration, and
that of a flash of the game's own, from the game, run the timer while an
animation or flash is in progress or a timed-clock game is running, paint each
animation frame, and settle to a final clean paint when the animation
completes. A non-animated transition SHALL paint once. Animation frames,
including the first, SHALL be driven by the timer rather than by an extra
synchronous paint that would race the timer.

#### Scenario: An animated move is driven by the timer to completion

- **WHEN** a move on an animating game is processed
- **THEN** the midend arms the animation/flash timer and the canvas is
  repainted on each timer tick through the animation
- **AND** when the animation and flash complete the midend settles
  with a final paint of the resting state and releases the timer

## ADDED Requirements

### Requirement: `redraw` is handed one `Flash`, for the game's own flash and for the win

`Game.redraw` SHALL take a `Flash`. Its `time` SHALL be the seconds into a
flash the game's `flashLength` asked for, and 0 otherwise, a win included. Its
`win(position)` SHALL answer with a tone, the highlight's leading edge or its
body, only during a win flash, and with none otherwise. Within one frame the
same position SHALL get the same answer however often it is asked, so a frame
painted through a warm draw state equals the frame painted through a fresh one.

#### Scenario: A death in a game that also has a win

- **WHEN** a move that loses the game is drawn
- **THEN** `time` advances through the game's own flash and `win` answers no
  tone for every position

#### Scenario: A game that lights nothing

- **WHEN** a win flash's first frame asks about no position
- **THEN** the flash ends, and nothing waits on it
