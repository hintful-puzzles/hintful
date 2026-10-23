# path Specification

## Purpose
Path, Nikoli's Numberlink: join each pair of like numbers with lines that
never cross or branch and fill every square. This capability specifies what is
the game's own: its rules and description format, a ladder whose Easy rung
and bounded look-ahead prove every dealt board has one answer, the
generator over upstream's `path.c` that it gates, the drag that draws lines,
and a hint that walks its look-ahead on the board. Upstream's `path.c` was a
generator with no solver and no game; what every game shares is in the engine
capabilities.

## Requirements

### Requirement: Rules: Path's board and what solves it

The board SHALL be a grid of squares, some holding a number, each number on exactly two squares, and a mark on every edge between two squares that share a side: nothing, a line or a cross. The puzzle SHALL be solved when every square has its lines, one on a numbered square and two on any other, and every line runs between two like numbers. Crosses SHALL count for nothing in the verdict.

#### Scenario: Joining every pair through every square wins

- **WHEN** on `4x3de:1_2_1c2e` the lines on edges 2, 4, 6, 7, 8, 9, 10, 12, 13 and 16 are drawn
- **THEN** the game's status is solved

#### Scenario: A board one line short does not win

- **WHEN** on the same board every one of those lines but edge 2 is drawn
- **THEN** the game's status is ongoing

### Requirement: Rules: A mistake is a line the answer lacks or a cross on one it has

Check & Save SHALL flag a line on an edge where the answer has none, and a cross on an edge where the answer has a line. An edge with nothing on it SHALL never be flagged.

#### Scenario: A wrong line is flagged

- **WHEN** on `4x3de:1_2_1c2e` a line is drawn on edge 5, from the lower 2 rightward
- **THEN** Check & Save flags edge 5 and nothing else

### Requirement: Params: Path's params are its declared codec's

The params SHALL be the width, the height and the tier, written `<w>x<h>d<tier letter>` with the tier letters `e`, `n` and `t`. The tier SHALL be written only in the full form; a string without it SHALL decode to Normal. Width and height SHALL each be at least 3, and their product at most 400.

#### Scenario: A params string round-trips

- **WHEN** `6x4de` is decoded and encoded in full
- **THEN** the result is `6x4de`

#### Scenario: Tricky round-trips

- **WHEN** `10x10dt` is decoded and encoded in full
- **THEN** the result is `10x10dt`

### Requirement: Description: The numbers in reading order

A description SHALL be the squares in reading order: each number in decimal, with `_` between two numbers on squares side by side in that order, and each run of squares without a number a letter, `a` for one up to `z` for 26. The numbers SHALL run from 1 with no gap, each on exactly two squares; a description that breaks either SHALL be refused.

#### Scenario: A board loads from its description

- **WHEN** `1_2_1c2e` is loaded at 4x3
- **THEN** the top row holds 1, 2, 1 and a blank square, and the 2s' second square is the third of the second row

#### Scenario: A number on one square is refused

- **WHEN** `1_2_1c3e` is loaded at 4x3
- **THEN** it is refused

### Requirement: Generation: A tier is the rung a board needs

A board SHALL be dealt only where the ladder finishes it, which proves it has exactly one answer. An Easy board SHALL be finished by the Easy rung alone; a Normal board SHALL need the lookahead at least once; a Tricky board SHALL need the long lookahead at least once. No path of a dealt board's answer SHALL be a straight line of four squares or more, and none SHALL touch itself except along its own line.

#### Scenario: A Normal board needs the lookahead

- **WHEN** a board is dealt at Normal
- **THEN** the Easy rungs alone do not finish it, and with the lookahead they do

#### Scenario: A Tricky board needs the long lookahead

- **WHEN** a board is dealt at Tricky
- **THEN** the ladder capped at Normal does not finish it, and uncapped it does

### Requirement: Solver: An edge a player sees is closed counts as closed

The ladder SHALL count an edge as closed when it is crossed, when a square beside it has all its lines, or when a line on it would join two different numbers, on its squares or at the ends of the lines through them, and no rung SHALL decide such an edge.

#### Scenario: An edge between two numbers' lines is never a step

- **WHEN** the line from a 2 and the line from a 3 end on squares side by side
- **THEN** no hint step asks for a cross on the edge between them

### Requirement: Solver: The ladder and its lookahead

The Easy rung SHALL be: a square whose open edges are as many as the lines it still needs takes a line on each. Normal's rung SHALL suppose a line or a cross on an open edge, run the Easy rung from there until the board breaks, and give the edge the other mark where the firings the break needs number at most six; Tricky's, the long lookahead, where they number at most twelve.

#### Scenario: The lookahead settles an edge

- **WHEN** supposing a cross on an edge leads, by the Easy rungs, to a square with no way left for its line
- **THEN** the edge takes a line

#### Scenario: A walk is counted by what its break needs

- **WHEN** a supposition's walk fires squares its break never reads
- **THEN** those firings count toward neither rung's limit, and the hint numbers none of them

### Requirement: Solver: Solve plays the answer the ladder finds

Solve SHALL draw the answer's lines over the whole board, from the numbers as dealt, and take every other mark off. A board the ladder does not finish SHALL have no Solve and no mistake check.

#### Scenario: Solve finishes a board

- **WHEN** Solve is pressed on any dealt board
- **THEN** the game's status is solved

### Requirement: Controls: A drag draws a line through the squares it passes

A press and drag with the left button SHALL draw a line along each edge between the squares it passes, a rook move at a time, keeping the lines already there; back over a square it has passed it SHALL be cut back to there. A drag that passes only edges holding lines SHALL take them up. A drag SHALL stop where an edge is crossed or where its line would give a square more lines than it takes. A left click near an edge SHALL draw or remove its line.

#### Scenario: A drag draws a line

- **WHEN** on `4x3de:1_2_1c2e` the left button is pressed on the top 2, dragged down one square and right one square, and released
- **THEN** lines are drawn on edges 10 and 4, and the move is one step of Undo

#### Scenario: A drag along a line and past its end carries it on

- **WHEN** a drag starts along a line the player has drawn and goes on past its end
- **THEN** the line is kept and carried on along the drag, not taken up

### Requirement: Controls: The right button crosses edges out

A right click near an edge SHALL cross it out, or clear its cross, and SHALL do nothing to an edge with a line. A right drag SHALL make every edge it passes near the middle of hold what the first one came to hold.

#### Scenario: A right click crosses an edge

- **WHEN** an open edge is right-clicked
- **THEN** it is crossed out

### Requirement: Controls: The keyboard draws, crosses and walks

The arrows SHALL move a cursor over the squares. Enter SHALL start a line at the cursor, the arrows SHALL carry it as a drag carries one, and Enter again SHALL draw it; Space, Escape, Backspace and Delete SHALL abandon it. Ctrl with an arrow SHALL draw or remove the line in that direction and move the cursor along it, and with Shift as well the cursor SHALL stay; Shift alone with an arrow SHALL cross out or clear that edge. A modified arrow on a hidden cursor SHALL only show it.

#### Scenario: Enter, two arrows and Enter draw a line

- **WHEN** on `4x3de:1_2_1c2e` Enter shows the cursor on the top-left 1, Enter starts a line, Down twice carries it, and Enter draws it
- **THEN** lines are drawn on edges 9 and 13

### Requirement: Hint: A step rings the edges it decides and outlines what it reads

A step SHALL ring the edges it decides, drawn as the line or cross it asks for, and outline what it reads: the square of a forced step. A lookahead step SHALL draw thin, and number once a firing in order, only the forced edges its break needs, outline where it breaks, and name a loop before a square short of edges. No step SHALL ask for a cross on an edge the ladder counts as closed.

#### Scenario: A forced step names its square

- **WHEN** a square with one line has one open edge left
- **THEN** the step says "The outlined square has only one edge left for its second line, so this edge must be a line." and outlines that square

### Requirement: Look: Each pair and the lines reaching it share a color

A number SHALL sit in a ring of its pair's color, from the colors that mean nothing, spread so that pairs given near each other differ where the set allows, and repeating past it. A pair's ring, disc and lines SHALL be edged in black. The ring SHALL fill with the color once a line joins the pair. A line SHALL take the color of the number its piece reaches, and a piece reaching no number SHALL be ink. A line SHALL be drawn red where its piece joins two different numbers or closes into a loop.

#### Scenario: A line from a number takes its color

- **WHEN** on `4x3de:1_2_1c2e` a line is drawn between the two squares below the top-left 1
- **THEN** it is ink, and once a line joins it to the 1, both lines are drawn in the 1's color

#### Scenario: A line between two numbers is red

- **WHEN** on `4x3de:1_2_1c2e` a line is drawn between the top-left 1 and the 2 beside it
- **THEN** that line is drawn red
