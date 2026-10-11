## MODIFIED Requirements

### Requirement: Palisade regions are all one size, in the hint as on the board

An undecided edge between two regions too big to join SHALL be a wall; the
step SHALL outline both and say the size they would make. A region short of
its size whose undecided edges all lead into one other region SHALL grow
through each; the step SHALL ring them as open, stripe the region and say how
many squares it has. A region is the squares the board's no-wall marks join,
one square included, and a size a step says SHALL be one the board shows.

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
