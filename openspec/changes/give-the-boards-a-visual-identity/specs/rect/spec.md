## ADDED Requirements

### Requirement: Rectangles draws its squares on the collection's quiet surface

`redraw` SHALL draw every square on the collection's cell surface, with the
surface's thin grid line between squares. A square that holds a number SHALL
sit on the lifted surface of a given, so the numbers the puzzle fixed are told
by the cell under them, and the number itself stays in ink. The edges of the
player's rectangles, and the board's outer edge, which bounds every rectangle
that reaches it, are content and SHALL stay in ink at their full width.

A rectangle the game counts as correct SHALL shade whole in the shared
completed-region color, derived from the cell surface so it reads against an
unfinished square in both schemes; the shade SHALL cover the number's square
too. The keyboard cursor SHALL be brackets in the cursor color at the corners
of its square, beside the number, and SHALL take no fill.

#### Scenario: A number is told by the cell under it

- **WHEN** an untouched board is drawn
- **THEN** every square holding a number is the lifted surface
- **AND** every other square is the plain cell surface

#### Scenario: A finished rectangle shades whole

- **WHEN** the player's edges enclose a rectangle holding exactly one number,
  equal to its area
- **THEN** every square of it, the number's included, is drawn in the
  completed-region color

#### Scenario: The cursor leaves the square's surface alone

- **WHEN** the keyboard cursor rests on a square
- **THEN** the square keeps the surface it had
- **AND** the cursor is drawn at its corners in the cursor color

## MODIFIED Requirements

### Requirement: Rectangles input and rendering

`interpretMove` SHALL support: a left-drag drawing a rectangle outline, a
right-drag erasing interior edges, a click near an edge toggling that single
edge, and a half-grid keyboard cursor with press-to-drag — with the
corner/center/edge click allocation of `coord_round`. A drag or
click that changes no edge SHALL produce no move. `redraw` SHALL render the grid,
number text, the three edge colors (ink solid line, red drag-draw preview,
blue drag-erase preview), the computed corner pixels, the correct-rectangle
fill, the cursor's corner brackets, the flagged-mistake edge color, and the
completion flash, with a `BORDER` of 1 (NARROW_BORDERS).

#### Scenario: A drag draws a rectangle outline

- **WHEN** the player left-drags from one grid vertex to another spanning a
  rectangle
- **THEN** `interpretMove` yields a rectangle move whose execution sets the four
  boundary edges of that rectangle and clears its interior edges

#### Scenario: A no-op click yields no move

- **WHEN** the player clicks in a way that would change no edge
- **THEN** `interpretMove` yields no move (returns null or a UI update only)
