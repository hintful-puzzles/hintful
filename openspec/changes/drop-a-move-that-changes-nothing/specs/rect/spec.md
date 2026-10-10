## MODIFIED Requirements

### Requirement: Rectangles input

`interpretMove` SHALL support a left-drag drawing a rectangle outline, a
right-drag erasing interior edges, a click near an edge toggling it,
and a half-grid keyboard cursor with press-to-drag. Escape, Backspace or
Delete SHALL cancel that drag, or else hide the cursor. A pointer position
SHALL resolve to a grid corner or a square's center when close to one, else
to the nearer edge. The status bar SHALL show a dragged rectangle's size.

#### Scenario: A drag draws a rectangle outline

- **WHEN** the player left-drags from one grid vertex to another spanning a
  rectangle
- **THEN** `interpretMove` yields a rectangle move whose execution sets the four
  boundary edges of that rectangle and clears its interior edges

#### Scenario: A no-op click yields no move

- **WHEN** the player clicks where the pointer resolves to a grid corner or to
  a square's center, which names no edge
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

#### Scenario: The status bar gives the dragged size

- **WHEN** a drag spans a rectangle three squares wide and two tall
- **THEN** the status bar reads `3x2`, and it is empty once the drag ends
