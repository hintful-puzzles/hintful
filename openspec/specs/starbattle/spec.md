# starbattle Specification

## Purpose
Star Battle, the puzzle of placing stars in a square grid divided into
regions so that every row, column and region holds the same number and no
two stars touch, known with one star as Queens. This capability states what
is the game's own: its rules and what Check & Save reports, what its params
refuse and what its description holds, what its three difficulty tiers mean
and what a dealt board promises, why the cross is the first click, its
explained hint, and how a star and a region's border are drawn.

## Requirements

### Requirement: Rules: The star rules decide when a board is solved

A Star Battle board SHALL be solved exactly when every row, every column and
every region holds the number of stars the board's parameters name, and no
two stars are in cells that share a side or a corner. A cross SHALL be the
player's note that a cell holds no star, and SHALL count toward nothing.

#### Scenario: One star to a unit

- **WHEN** the parameters name one star and each row, column and region
  holds one star, no two of them touching at a corner
- **THEN** the board is solved

#### Scenario: Two stars touch at a corner

- **WHEN** every row, column and region holds its number of stars and two
  of the stars are diagonal neighbors
- **THEN** the board is not solved

### Requirement: Rules: Check & Save compares stars and crosses with the answer

Star Battle's mistake check SHALL report every star on a cell where the
board's one answer has none and every cross on a cell where it has a star,
and SHALL never report a blank cell. On a board its deductions do not finish
it has no answer to compare with and SHALL report nothing.

#### Scenario: A cross on a star's cell

- **WHEN** the player crosses out a cell that holds a star in the answer
- **THEN** that cell is reported, and a blank cell beside it is not

### Requirement: Params: A params string is the size, the stars and the tier, and one with no tier is Easy

A Star Battle params string SHALL be the grid's size as a bare number, `s`
and the stars to a row, and in the full form `d` and the tier's letter (`e`,
`n`, `t`). A string that leaves the tier out SHALL decode as Easy, and one
that leaves the stars out SHALL decode as one star. The stars to a row SHALL
be the game's ruleset, One star, Two stars or Three stars, so a board's title
leads with it and the menu has a section for each.

#### Scenario: A board's own string

- **WHEN** a 10x10 board of two stars at Normal is encoded in full, and
  again in the form a board's ID carries
- **THEN** the strings are `10s2dn` and `10s2`, and its title is "Two
  stars: 10x10 Normal"

### Requirement: Params: A grid too small for its stars is refused

Star Battle SHALL refuse a grid narrower than 4 with one star to a row, 8
with two and 12 with three, because no arrangement of stars exists there:
two rows next to each other hold twice the stars with no two touching. The
refusal SHALL name the least size for the stars asked for. It SHALL refuse
no size for the tier asked of it: a tier a size seldom or never has is left
to the deal's deadline.

#### Scenario: Two stars on a 7x7

- **WHEN** a 7x7 grid is asked for with two stars
- **THEN** it is refused with "Grid size must be at least 8 with 2 stars to a
  row."

### Requirement: Description: A description is the walls between regions, and names a region for every row

A Star Battle description SHALL be the engine's run-length list of the walls
between regions (`engine/wall-runs.ts`) and nothing else: the board has no
clues. Regions SHALL be numbered in the order their first cells are met
reading the grid. A description whose walls make any number of regions other
than the grid's size SHALL be refused.

#### Scenario: A region to every cell

- **WHEN** a 5x5 description gives a wall on every border
- **THEN** it is refused, since it names 25 regions and the board has 5

### Requirement: Generation: A tier is the hardest deduction its boards need

An Easy board SHALL be finished by deductions about one star, one row,
column or region, or one row or column and the regions in it, a trial star
that only touches included. A Normal board SHALL also need several
neighboring rows or columns counted against the regions in them. A Tricky
board SHALL also need a trial star that completes a row, column or region
of its own. Every dealt board SHALL need its tier and no easier one.

#### Scenario: A Normal board

- **WHEN** a board is dealt at Normal
- **THEN** the deductions capped at Normal finish it and capped at Easy do
  not

### Requirement: Generation: A dealt board has one answer and no region too small to think about

The generator SHALL place the stars, take the regions round them from the
engine's division, and move single cells between neighboring regions until
its deductions finish the board, so that a dealt board has exactly one
answer. Every region SHALL be connected and SHALL hold at least twice as
many cells as it holds stars.

#### Scenario: A one-star board

- **WHEN** a one-star board is dealt
- **THEN** no region is a single cell

### Requirement: Solver: Solve gives the answer the deductions reach

Solve SHALL fill the board with the answer the deductions reach from the
regions alone, stars and crosses both, whatever the player has marked. On a
board they do not finish, which only a pasted ID can be, Solve SHALL refuse.

#### Scenario: Solving a dealt board

- **WHEN** Solve is run on a dealt board with wrong marks on it
- **THEN** every cell holds the answer's star or cross and the board is
  solved

### Requirement: Controls: The star is the left button and the cross the right

Star Battle's input is its declared target verbs. The left button SHALL put
a star on a blank cell and cross it out on its second click, and the right
button SHALL cross it out first, as the collection's other games place with
the left button and rule out with the right. A drag SHALL repeat the pressed
cell's change on the cells it passes that held what that cell held.

#### Scenario: Two left clicks

- **WHEN** a blank cell is clicked twice with the left button
- **THEN** it holds a star after the first click and a cross after the
  second

### Requirement: Preferences: A star can bring the crosses it rules out

Star Battle SHALL have one preference, `auto-cross`, off unless the player
turns it on. With it on, a move that puts a star on a cell SHALL also cross
out every blank cell touching it, and the blank cells of the star's row,
column or region where the star is the last that one holds. It SHALL change
no cell the player has marked, and removing the star SHALL leave the crosses.
The crosses are part of the star's move, so one Undo takes both back.

#### Scenario: The last star of a row

- **WHEN** the preference is on and a star is placed that is the last its
  row holds
- **THEN** the blank cells touching the star and the blank cells of the row
  are crossed out in the same move

### Requirement: Hint: The hint reads only regions, stars and crosses

The hint SHALL treat a cell as open until it holds a star or a cross, and
SHALL deduce from nothing else the player has not marked. So the crosses a
star gives, on the cells touching it and on the rest of a row, column or
region that has its stars, SHALL be steps of their own, taken before any
other.

#### Scenario: A star with blank cells round it

- **WHEN** a hint is asked for on a board where a correct star has blank
  cells touching it
- **THEN** the first step crosses those cells out

### Requirement: Hint: The deductions are tried easiest first, whatever the board's tier

After those crosses, the hint SHALL try in this order: a row, column or
region with as many open cells as it needs stars; a row or column counted
against the regions in it; a cell a row, column or region cannot fit its
stars without; a trial star that touches too much of one; several rows or
columns counted against their regions; and a trial star that completes a
row, column or region of its own. It SHALL apply no tier cap, since a board
opened by its ID carries none.

#### Scenario: A board with one open cell in a row

- **WHEN** a row needs one star and has one open cell
- **THEN** the step puts the star there, before any trial star is narrated

### Requirement: Hint: A trial star is one star and what it rules out at once

A step that tries a star in a cell SHALL rule out only the open cells that
star touches and, on a Tricky deduction, the rest of a row, column or region
the star completes, and SHALL conclude only that some row, column or region
is left without room for the stars it needs. It SHALL follow no further
consequence of the trial.

#### Scenario: A star beside a two-cell region

- **WHEN** a region needing one star has two open cells and a cell outside
  it touches both
- **THEN** the step says a star there would touch every open square of the
  region, and crosses the cell out

### Requirement: Hint: A step stripes the unit it is about and outlines what else it reasons from

Every step SHALL ring the cells it decides and stripe the one row, column
or region it is about. A step counting rows or columns against regions
SHALL stripe the rows or columns, as one counted set, and outline the
regions whole. A step about a star SHALL outline the star. A trial star
that only touches SHALL outline the cells it touches where the unit keeps
some, and one that completes one or two units of its own SHALL name them
as the cause.

#### Scenario: Two rows counted against two regions

- **WHEN** a step says two rows need the stars of two regions
- **THEN** both rows are striped, both regions are outlined, and the cells
  to cross out are ringed

### Requirement: Hint: A first click toward a step's mark keeps the step

A step that asks for a cross SHALL stay on show when the player's move puts
a star on one of its blank cells, and a step that asks for a star when the
move puts a cross there, since one more click of that button makes the mark
asked for. The gesture that plays a step SHALL use the button that makes
each mark in one click. With the `auto-cross` preference on, the crosses a
star brings SHALL not count against the step that asked for the star, and a
plan SHALL end with its first star.

#### Scenario: Reaching a hinted star with the right button

- **WHEN** a step asks for a star on a blank cell and the player
  right-clicks it twice
- **THEN** the step is still shown after the first click and is completed by
  the second

### Requirement: Look: A star is drawn as a star, and a region's border by the cells on each side

A star SHALL be drawn as a five-pointed star in the collection's color for a
placed piece, the puzzle's own mark in place of the shared piece shape, and a
cross as the collection's ruled-out cross. A star SHALL be drawn in the
error color while it touches another star or its row, column or region
holds too many. A region's border SHALL be a heavy line of which each cell
paints the half inside its own box, and a hint's ring and outline SHALL sit
inside the cell's surface, never on that line.

#### Scenario: Two stars at a corner

- **WHEN** two stars are placed in cells that share a corner
- **THEN** both are drawn in the error color
