## ADDED Requirements

### Requirement: Solver: Cube's Solve rolls a line that finishes the board

Cube SHALL have Show solution. It SHALL plan rolls with the hint's planner
from the position on display until every face is painted, and play them as
one move whose animation rolls the solid along the line one roll after
another. The line need not be the shortest. Where the planner cannot reach
the finish, Solve SHALL refuse and change nothing.

#### Scenario: A long line plays quicker

- **WHEN** the line is too long to play in five seconds at a roll's own pace
- **THEN** each roll is quickened so the whole line takes five seconds

#### Scenario: One undo takes the line back

- **WHEN** the player undoes after Show solution
- **THEN** the board returns to where Show solution was pressed

#### Scenario: Solve finishes a dealt board

- **WHEN** Show solution is pressed on a freshly dealt board of any preset
- **THEN** the solid rolls along a line of rolls and the board is solved

#### Scenario: Solve carries on from where the player is

- **WHEN** the player has rolled some way, putting paint down, and presses
  Show solution
- **THEN** the line starts from where the solid stands and the board is
  solved

#### Scenario: The line plays one roll after another

- **WHEN** the board is drawn partway through Solve's move, or partway
  through undoing it
- **THEN** the frame is the one a single roll of the line draws at that point
  of it

#### Scenario: A planner that stops short refuses

- **WHEN** the planner's allowance runs out before the finish
- **THEN** Solve plays no move

### Requirement: Params: Cube's square grid turns and its triangle grids do not

`transposeParams` SHALL exchange `d1` and `d2` for the cube, whose grid is
`d1` squares wide and `d2` high, and SHALL return `null` for the
tetrahedron, octahedron and icosahedron, because a triangle grid with its
numbers exchanged is the same patch upside down, drawn the same size, and no
grid of the game is one turned on its side.

#### Scenario: A cube grid turns

- **WHEN** `transposeParams` is asked to turn a cube grid four wide and six
  high
- **THEN** it returns a grid six wide and four high

#### Scenario: A triangle grid is never turned

- **WHEN** `transposeParams` is asked to turn a tetrahedron, octahedron or
  icosahedron grid
- **THEN** it returns `null`

## MODIFIED Requirements

### Requirement: Controls: A Cube move is one of four orthogonal rolls

A move the player makes SHALL be a roll in one of the four orthogonal
directions, and Show solution's move a line of such rolls. Input SHALL produce
only those four on a square grid. On a triangular grid input SHALL also accept
the four diagonal directions, each resolving to the orthogonal roll over the
same edge of the current square, so a stored roll is always one of the four.

#### Scenario: Direction set depends on grid topology

- **WHEN** input is interpreted on a square-grid board
- **THEN** only the four orthogonal roll directions are produced
- **AND** on a triangular board the diagonal directions are also available
