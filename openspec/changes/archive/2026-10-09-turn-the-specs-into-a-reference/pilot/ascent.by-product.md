# ascent Specification

## Purpose
Ascent, the puzzle of placing numbers so that each stands next to its successor
and together they form one path from 1 to the highest. This spec holds only
the rules of the game that no test, type, declaration or guide holds; the rest
is the game's code and its tests under `src/games/ascent/`, and its help page.

## Requirements

### Requirement: Ascent's size limits

Validation SHALL require an area under 1000, an odd height and a width greater
than half the height on a Hexagon, and a grid bigger than 2×2 in Edges.

#### Scenario: A Hexagon of even height

- **WHEN** a Hexagon board of even height is asked for
- **THEN** it is refused with the reason

### Requirement: A long run in a description repeats the maximal letter

A run of empty cells or of wall cells longer than 26 SHALL be encoded by
repeating the maximal letter.

#### Scenario: Thirty empty cells

- **WHEN** a description is written for a board with a run of 30 empty cells
- **THEN** the run is `z` followed by the letter for four

### Requirement: A given is fixed, and every arrow must be satisfied

Placing a number on a given cell SHALL be rejected. A board whose numbers form
one path through every cell SHALL NOT be complete while an arrow clue is not
satisfied.

#### Scenario: A full path against an arrow

- **WHEN** an Edges board is filled with a single path and one number is off its
  arrow's line
- **THEN** the game is not solved

### Requirement: Ascent's pointer gestures beyond a click

In Edges mode a drag from an arrow clue to an empty cell on its row, column or
diagonal SHALL place the arrow's number there. A left-drag across cells SHALL
draw a path, and a right-click or a right-drag SHALL erase one. A selected
number whose successor is placed SHALL offer the one before it, and a
single-number path SHALL show its endpoint candidates.

#### Scenario: A number is dragged in from its arrow

- **WHEN** the player drags from an arrow to an empty square on the arrow's line
- **THEN** the arrow's number is placed in that square

### Requirement: How Ascent's generator builds a board

The generator SHALL build a Hamiltonian path by the backbite algorithm. Outside
Edges it SHALL remove clue numbers honoring the symmetry and keep-endpoints
options; in Edges it SHALL move numbers out to arrow clues by a maximal
bipartite matching, retrying until soluble.

#### Scenario: Symmetrical clues are asked for

- **WHEN** a board is generated with symmetrical clues
- **THEN** its clues keep the symmetry

### Requirement: What Ascent's hint reads and says that no test pins

The hint SHALL NOT read lines the player drew. The Edges techniques SHALL be
tried ahead of the run techniques of their tier. A `pointers` sentence SHALL
give each rival's reason when that fits in 120 characters. A whole-run step
SHALL stripe the squares no other run reaches when those are what make its
route unique.

#### Scenario: A board with drawn lines

- **WHEN** a hint is asked on a board where the player has drawn path lines
- **THEN** its steps are those of the same board with no lines

### Requirement: The colors of Ascent that no frame under test shows

A wall SHALL be a solid fill in ink. The path the player draws SHALL keep the
entry color. The cell the player holds, types into or has selected SHALL take
the collection's selection wash. A number offered and not yet placed SHALL be
drawn in the collection's pencil-mark color, and in ink on the row or column an
edge number is dragged along.

#### Scenario: A number is held

- **WHEN** a placed number is selected
- **THEN** its cell takes the selection wash and the numbers offered beside it
  are drawn in the pencil-mark color
