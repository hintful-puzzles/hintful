## MODIFIED Requirements

### Requirement: Rectangles flags a drawn edge the solution lacks

Because boards are uniquely solvable, the game SHALL implement `findMistakes`:
re-solve from the numbers to the unique solution's edges and return every edge
the player has drawn that the unique solution does not contain. A missing edge
SHALL NOT be a mistake, and a board that is not uniquely solvable SHALL yield
no mistakes.

#### Scenario: A wall the solution does not contain is flagged

- **WHEN** the player has drawn an edge that the unique solution does not
  contain, and `findMistakes` is invoked
- **THEN** that edge is returned as a mistake

### Requirement: Rectangles input

`interpretMove` SHALL support a left-drag drawing a rectangle outline, a
right-drag erasing interior edges, a click near an edge toggling it,
and a half-grid keyboard cursor with press-to-drag. Escape, Backspace or
Delete SHALL cancel that drag, or else hide the cursor. A pointer position
SHALL resolve to a grid corner or a square's center when close to one, else
to the nearer edge. A drag or click that changes no edge SHALL produce no
move. The status bar SHALL show a dragged rectangle's size.

#### Scenario: A drag draws a rectangle outline

- **WHEN** the player left-drags from one grid vertex to another spanning a
  rectangle
- **THEN** `interpretMove` yields a rectangle move whose execution sets the four
  boundary edges of that rectangle and clears its interior edges

#### Scenario: A no-op click yields no move

- **WHEN** the player clicks in a way that would change no edge
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

#### Scenario: The status bar gives the dragged size

- **WHEN** a drag spans a rectangle three squares wide and two tall
- **THEN** the status bar reads `3x2`, and it is empty once the drag ends

### Requirement: Rectangles generates by tiling, stretching and solving

The generator SHALL tile the base grid at random, leave no rectangle of one square, stretch
it to full size by the expansion factor, and call the solver on every layout,
returning only one the solver reaches a unique placement for.

#### Scenario: A layout the solver cannot make unique is discarded

- **WHEN** the solver does not reach a unique placement on a layout
- **THEN** the generator lays out another grid
