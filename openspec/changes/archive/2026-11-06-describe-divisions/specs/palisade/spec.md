## MODIFIED Requirements

### Requirement: Hint: The plan is every edge the deductions force from the player's walls and marks

`hint(state)` SHALL start the solver from the player's current state: the
player's walls as walls already drawn, and every edge the player has marked
"no wall" as an open edge. Its plan SHALL be the full chain of edges the
ladder then forces, one firing a journey, each firing the one that carries on
from the squares the plan's latest steps decided, so a single request shows
the next deduction with all its legs and auto-hint can play the whole chain.

#### Scenario: A player no-wall mark is not re-hinted

- **WHEN** the player has marked an edge "no wall" that the solver would also
  deduce as no-wall
- **THEN** that edge does not appear as a step in the returned plan, since its
  fact is part of what the solver starts from

#### Scenario: The hint goes on from an edge decided rightly

- **WHEN** the hint is followed on an Unreasonable board, and an edge is
  decided as the solution has it wherever the hint stops
- **THEN** the hint finishes the board

### Requirement: Hint: Palisade regions are all one size, in the hint as on the board

An undecided edge between two regions too big to join SHALL be a wall; the
step SHALL outline both and say the size they would make. A region short of
its size whose undecided edges all lead into one other region SHALL grow
through each; the step SHALL ring them as open, stripe the region and say how
many squares it has. A region is the squares the board's no-wall marks join,
one square included, and a size a step says SHALL be one the board shows.

#### Scenario: Two regions too big to join

- **WHEN** a plan reaches an edge between two regions of 5 squares in all
  that would together number 6
- **THEN** the step says "Joining these two regions would make 6 cells, but
  every region holds 5, so this edge must be a wall."

#### Scenario: A region with one way to grow

- **WHEN** a plan reaches three squares joined by no-wall marks, in regions
  of 5, with one undecided edge between them and the rest of the board
- **THEN** the step says "This region has 3 of its 5 cells and just one way
  left to grow, so this edge can't be a wall."

#### Scenario: A region with several edges into one other

- **WHEN** a region short of its size has several undecided edges and all of
  them lead into the same other region
- **THEN** one step rings them all and says the region has "only one region
  left to grow into, so these edges can't be walls", and a leg follows for
  each further edge

#### Scenario: A region a later step speaks of

- **WHEN** a plan is followed on a dealt board and a step stripes a region or
  outlines two
- **THEN** each is a whole region of the board's no-wall marks as they stand
  when the step is reached

### Requirement: Hint: Two edges of a Palisade clue that border one region share a fate

Where two undecided edges of a clue of 1, 2 or 3 lead into the same region,
both SHALL be open where walls on both would exceed the clue, as they always
would a 1, and both SHALL be walls where leaving both open would leave it
short, as it always would a 3. A 2 SHALL go by the edges it has already
decided: open with a wall placed, walls with an edge open. The step SHALL
stripe the region the edges border, and SHALL NOT mark the clue's cell.

#### Scenario: A 2 that cannot afford two more walls

- **WHEN** a plan reaches a 2 with two undecided edges into one region, where
  walls on both would exceed it
- **THEN** the step says "Both ringed edges border the same region and share
  a fate; walling both would exceed clue 2, so neither can be a wall."

#### Scenario: The clue that decides the edges is not marked

- **WHEN** an `equivalentEdges` step is displayed
- **THEN** every cell of the region it names is hatched, and the clue cell is
  neither hatched nor outlined

## ADDED Requirements

### Requirement: Hint: Palisade's solver is the ladder its description states, which its hint shares

Palisade's solver SHALL run the ladder `palisade.description.yaml` states,
compiled, in its order, to a fixpoint: seven Easy techniques,
`cluesVersusRegionSize`, `numberExhausted`, `notTooBig`, `notTooSmall`,
`noDanglingEdges`, `equivalentEdges` and `inside`, with Unreasonable the
engine's search over them. A board SHALL be solved where its walls, every
other edge read as open, pass the answer check its rules compile to.

#### Scenario: The hint and the generator run one ladder

- **WHEN** the hint asks for the next firing on a player's board
- **THEN** it comes from the same seven techniques that the generator's solve
  runs

### Requirement: Hint: Two Palisade squares a region already joins have no wall between them

An undecided edge between two squares that the board's no-wall marks already
join some other way round SHALL be open. The step SHALL stripe the region and
ring the edge.

#### Scenario: A ring of no-wall marks closed but for one edge

- **WHEN** three edges round a point where four squares meet are marked "no
  wall" and the fourth is undecided
- **THEN** the step says "This region already holds the squares either side
  of this edge, so it can't be a wall."

## REMOVED Requirements

### Requirement: Hint: Palisade's hint runs its deductions in a fixed round

**Reason**: The hint walks the compiled ladder, each firing the one that
carries on from the plan's latest steps, as every described game's does.

**Migration**: None: the plan's steps are the same deductions in another
order.
