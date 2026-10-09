# canvas-sizing Specification

## Purpose
The puzzle board's canvas fitting the space it is given as soon as a game loads,
so that a player never has to resize the window before the board is drawn at its
proper size.

## Requirements

### Requirement: The puzzle board sizes to fit on load without a manual resize

The puzzle view SHALL size its canvas to fill the available space as soon as a game is loaded,
without requiring a subsequent window or element resize to correct it.

#### Scenario: A freshly-loaded board fills its space with no synthetic resize

- **WHEN** a game is loaded into the puzzle view at a viewport large enough for the board to
  exceed its first, pre-settle measurement
- **THEN** the board reaches its correct fitted size on its own, without any window or element
  resize event being dispatched

#### Scenario: A full page reload leaves the board full-size

- **WHEN** the page reloads (for example on a dev-time component edit, which reloads the
  page in full and does not hot-swap) and the game re-renders
- **THEN** the board is at its correct fitted size, not stuck small awaiting a manual resize

### Requirement: The available size is never measured from chrome sized from the board

The available-size measurement SHALL NOT be derived from any chrome whose own size is a
function of the board size: that is a loop, and it settles on whatever value it started at.
The rule is about that shape and not about one element: anything later added to the board's
container that sizes itself from the board would re-open the loop, and the measurement SHALL
NOT read it either.

#### Scenario: The board's own size does not move the measurement

- **WHEN** the board changes size and nothing else in the layout does
- **THEN** the measured available size is what it was before

### Requirement: The available width is measured from the board's padded wrapper

The available board width SHALL be measured from the board's own padded wrapper, and SHALL
NOT be measured from a container that may also hold something sized from the board. A
mis-measurement would stay stuck until an incidental resize, because the host element flexes
to fill its parent, its box does not change after first layout, and so the `ResizeObserver`
does not fire again once the canvas attaches.

#### Scenario: Something wider than the board in the container does not shrink the board

- **WHEN** the container that holds the board's wrapper is wider than the wrapper, because
  of something else it holds
- **THEN** the available width is the host's width less only the wrapper's padding

### Requirement: A size recompute with no layout change reports no change

The recompute SHALL be idempotent: once the board is correctly sized, a further size
recompute with no layout change SHALL report no change and SHALL NOT trigger a resize loop.

#### Scenario: Correcting the size does not loop

- **WHEN** the board has been sized correctly and a size recompute runs again with no layout
  change
- **THEN** the recompute reports no change and no further resize or redraw is triggered

### Requirement: A real resize still resizes the board, within the maxScale clamp

A real window or element resize SHALL still resize the board, and the `maxScale` clamp SHALL
still bound it.

#### Scenario: The space grows under a clamp

- **WHEN** the puzzle view's box grows while `maxScale` is `1`
- **THEN** the board is sized again for the new space, and is given no more than its preferred
  size in either dimension
