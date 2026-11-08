## MODIFIED Requirements

### Requirement: Solver: Loopy grades boards with a four-tier deductive solver

Loopy SHALL grade boards with the ladder its description states, compiled, in four tiers (Easy, Normal, Tricky, Hard), run to a fixpoint. The solver SHALL NOT backtrack or guess at any tier.

#### Scenario: The solver grades a board at the intended difficulty

- **WHEN** a board generated at a given difficulty is solved
- **THEN** it is solvable at that difficulty and not at the tier below

### Requirement: Solver: The dline index is the same from the dot and from the face

The dline machinery SHALL index a pair of edges adjacent around a common dot consistently whether that pair is reached from the dot or from the face, and the description's angle of each index SHALL be the same pair. This consistency SHALL be verified for every grid type, because a mismatch weakens the solver silently rather than failing.

#### Scenario: The dline index is consistent from both directions

- **WHEN** a dline is addressed via its dot and via its face, for any face and
  corner of any grid type
- **THEN** both address the same pair of edges

#### Scenario: A corner note is the description's angle

- **WHEN** a dline index is read as the description's angle, on any grid type
- **THEN** the angle has the same dot and the same two edges

### Requirement: Hint: The hint plan is the solver's own rungs, easiest tier first

The plan SHALL walk the solver's own compiled ladder, one firing a step, each firing paired with why it holds. It SHALL take no firing harder than the easiest tier that still has one, whatever tier the board was generated at, since a game ID need not carry one. A firing that only notes a corner or relates two edges SHALL be kept as a fact for a later line to cite, not shown as a step of its own.

#### Scenario: A Hard board's first hints are Easy deductions

- **WHEN** a hint is asked on a board generated at Hard while an Easy technique
  can still decide a line
- **THEN** the step shown is that Easy technique's firing

### Requirement: Hint: An edge that would close a loop is settled by what the loop leaves out

Where an open edge joins two dots the drawn lines already connect and the loop it closes leaves a drawn line out or a clue unmet, the hint SHALL rule it out, saying the loop "leaves other lines out" or, where it takes in every line, outlining the clues it would leave unmet. Either step bands the drawn lines the edge would close. The hint SHALL NOT draw an edge because the loop it closes meets every clue: that is no deduction, since only the answer being unique says that loop is the answer, and a rule settles such an edge instead.

#### Scenario: A loop that takes every line and misses one clue

- **WHEN** an edge would close every drawn line into a loop while one clue
  elsewhere is short of its count
- **THEN** the step reads "This edge would close the marked lines into a loop
  with the outlined clue still unmet, so it can't be a line."

#### Scenario: The last edge

- **WHEN** one open edge would close every drawn line into a loop with every
  clue met, and neither of its dots has run out of other ways on
- **THEN** the step shown is a rule's that settles an open edge there, not the
  closing edge drawn for meeting every clue

### Requirement: Hint: At Hard, a noted pair settles an edge

At Hard the hint SHALL settle edges from pairs. Two matching open edges of a clue are both ruled out where the clue needs one more line, and both drawn where it can spare one more edge. Where a clue or a dot has three open edges and two are a pair, the count it still needs decides the third. An open edge paired with a line or a ruled-out edge takes the state the pair gives it, at any tier: only a Hard deduction or the player's own note relates two edges, so a pair already noted is used before anything harder. Each step cites the pair, which is on the board.

#### Scenario: The opposite of a ruled-out edge

- **WHEN** an open edge is noted as the opposite of an edge that is ruled out
- **THEN** the step reads "The marked pair makes this edge the opposite of the
  marked ruled-out edge, so it must be a line."

#### Scenario: A dot's third edge

- **WHEN** a dot has one line and three open edges, two of them noted as
  matching
- **THEN** the step reads "The outlined dot has one line; the marked pair
  makes two of its open edges give 0 or 2, so this edge must be a line."

### Requirement: Hint: Within a tier the hint counts first and closes loops last

Within a tier the hint SHALL take the firing that continues from its last steps, and where none does, the first firing in this order: the clues (its lines all there, only the edges it needs, the blocked pair, the spared edge at a dot), then the dots, then the loop-closing deductions, and from Normal the corners, at Hard the pairs. Easy holds the counting and loop-closing techniques and the reading of a noted pair; Normal adds a clue's bounds and corners read at a dot; Tricky adds corners read from a clue or across a dot; Hard adds pairs.

#### Scenario: A full dot is shown before an early loop

- **WHEN** a hint is asked on a board where nothing continues the last step,
  a dot with two lines still has an open edge, and another open edge would
  close a loop that leaves lines out
- **THEN** the step shown is the dot's

#### Scenario: A clue is shown before a dot

- **WHEN** a hint is asked on an empty board, where a clue that has its lines
  and a dot that has its two lines each still have an open edge
- **THEN** the step shown is the clue's
