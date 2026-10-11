## ADDED Requirements

### Requirement: Two Palisade clues side by side are walled apart where their region would be the wrong size

The edge between two neighboring clues SHALL be a wall where 8 less the two
clues is more than the region size, or where both are 3 and the region size
is not 2. With that edge open each clue's walls go on its other three sides,
so their region holds at least that many squares, and two 3s' exactly two.
The step SHALL outline both clues, ring the edge, and say the size the shared
region would need, or of two 3s that it would be exactly 2 cells.

#### Scenario: Two 3s in regions of five

- **WHEN** the hint is asked on the 5×5 board `a2a1a2b2e1e33`, in regions of
  5, whose bottom row begins with two 3s
- **THEN** its first step says "Two 3s each keep just one side open, and it
  has to be the one they share, so their region would be exactly 2 cells.
  Regions here hold 5, so the edge between them must be a wall."

### Requirement: A Palisade clue that is full, or needs every edge left, settles its edges

A clue with as many walls as its number SHALL make each of its undecided
edges open. A clue whose number is 4 less its open edges SHALL make each of
its undecided edges a wall. Either SHALL be one firing over all those edges.
The step SHALL outline the clue and ring the edges, and SHALL say of a 0 that
it allows no walls.

#### Scenario: A clue with all its walls

- **WHEN** the hint is asked on the 5×5 board `23d2e2c2e232`
- **THEN** its first step says "Clue 2 already has all its walls, so its
  remaining edges can't be walls.", and its next leg clears the clue's other
  edge

### Requirement: Palisade regions are all one size, in the hint as on the board

An undecided edge between two regions that together hold more squares than
the region size SHALL be a wall; the step SHALL outline both regions and say
the size they would make. A region short of that size with one undecided
edge left SHALL grow through it; the step SHALL ring the edge as open, stripe
the region and say how many of its squares it has. A region here is the
squares the board's no-wall marks join, one square included, and a size a
step says SHALL be one the board shows.

#### Scenario: Two regions too big to join

- **WHEN** the plan on `23d2e2c2e232` reaches an edge between regions of
  squares that would together number 6
- **THEN** the step says "Joining these two regions would make 6 cells, but a
  region here holds 5, so this edge must be a wall."

#### Scenario: A region with one way to grow

- **WHEN** the plan on `23d2e2c2e232` reaches three squares joined by no-wall
  marks, with one undecided edge between them and the rest of the board
- **THEN** the step says "This region has 3 of its 5 cells and just one way
  left to grow, so this edge can't be a wall."

### Requirement: A Palisade wall does not stop at a corner

At a point where four squares meet, where exactly two of the four edges are
not known to be open and one of the two is a wall, the other SHALL be a wall.
The step SHALL outline the four squares and ring the edge.

#### Scenario: A wall arriving at a corner

- **WHEN** the plan on `23d2e2c2e232` reaches a corner with one wall, one
  undecided edge and two open edges
- **THEN** the step says "A wall can't stop in mid-air at this corner, so
  this edge must be a wall."

### Requirement: Two edges of a Palisade clue that border one region share a fate

Where two undecided edges of a clue of 1, 2 or 3 lead into the same region,
both SHALL be open where walls on both would exceed the clue, as they always
would a 1, and both SHALL be walls where leaving both open would leave it
short, as it always would a 3. A 2 SHALL go by the edges it has already
decided: open with a wall placed, walls with an edge open.

#### Scenario: A 2 that cannot afford two more walls

- **WHEN** the plan on `23d2e2c2e232` reaches a 2 with two undecided edges
  into one region, where walls on both would exceed it
- **THEN** the step says "Both edges border the same region, so they share a
  fate: both walls or both open. Walling both would exceed clue 2, so neither
  can be a wall."

### Requirement: Palisade's hint runs its deductions in a fixed round

The plan SHALL first take every wall between two clues side by side, once,
and then repeat a round until a round forces nothing: the clues that are full
or need every edge left, then regions too big to join, then regions with one
way to grow, then walls at a corner, then edges that share a fate. Each SHALL
sweep the grid in reading order and record every edge it forces before the
next begins, so the plan's steps are in that order.

#### Scenario: The round on a dealt board

- **WHEN** the hint's plan is read on `23d2e2c2e232`
- **THEN** its first six steps are three clues' edges, each clue two legs,
  and its seventh is a wall at a corner, neither rule about a region's size
  having forced an edge in the first round

### Requirement: The Palisade status bar gives the region size

The status bar SHALL read `Region size: {k}` from the first move to the last:
it is the one place the board shows the size every region must have, and the
help sends the player to it.

#### Scenario: A board in fives

- **WHEN** the 5×5 board `23d2e2c2e232`, in regions of 5, is opened
- **THEN** the status bar reads "Region size: 5"
