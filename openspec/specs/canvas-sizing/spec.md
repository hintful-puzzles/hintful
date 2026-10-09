# canvas-sizing Specification

## Purpose
The puzzle board's canvas fitting the space it is given as soon as a game loads,
so that a player never has to resize the window before the board is drawn at its
proper size: what the measurement of that space may read, and when a recompute
changes the board.

## Requirements

### Requirement: The puzzle board sizes to fit on load without a manual resize

The puzzle view SHALL size its canvas to fill the available space as soon as a game is loaded,
without requiring a subsequent window or element resize to correct it.

#### Scenario: A freshly-loaded board fills its space with no synthetic resize

- **WHEN** a game is loaded into the puzzle view at a viewport large enough for the board to
  exceed its first, pre-settle measurement
- **THEN** the board reaches its correct fitted size on its own, without any window or element
  resize event being dispatched

### Requirement: The available size is never measured from chrome sized from the board

The available-size measurement SHALL NOT be derived from any chrome whose own size is a
function of the board size: that is a loop, and it stays at whatever value it started at
until an incidental resize. The available width SHALL be measured from the board's own
padded wrapper, not from a container that may also hold such chrome. The rule is about
that shape and not one element: anything later added to the container that sizes itself
from the board SHALL NOT be read either.

#### Scenario: The board's own size does not move the measurement

- **WHEN** the board changes size and nothing else in the layout does
- **THEN** the measured available size is what it was before

#### Scenario: Something wider than the board in the container does not shrink the board

- **WHEN** the container that holds the board's wrapper is wider than the wrapper, because
  of something else it holds
- **THEN** the available width is the host's width less only the wrapper's padding

### Requirement: A size recompute changes the board only when the layout changed

The recompute SHALL be idempotent: once the board is correctly sized, a further size
recompute with no layout change SHALL report no change and SHALL NOT trigger a resize loop.
A real window or element resize SHALL still resize the board, and the `maxScale` clamp SHALL
still bound it.

#### Scenario: Correcting the size does not loop

- **WHEN** the board has been sized correctly and a size recompute runs again with no layout
  change
- **THEN** the recompute reports no change and no further resize or redraw is triggered

#### Scenario: The space grows under a clamp

- **WHEN** the puzzle view's box grows while `maxScale` is `1`
- **THEN** the board is sized again for the new space, and is given no more than its preferred
  size in either dimension
