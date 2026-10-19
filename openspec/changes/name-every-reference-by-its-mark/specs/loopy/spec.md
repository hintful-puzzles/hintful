## MODIFIED Requirements

### Requirement: Hint: The hint notes a pair from a count that leaves two edges, or four with a pair among them

At Hard the hint SHALL note the only two open edges of a clue or of a dot as
matching where the lines it still takes are even in number and as opposites
where odd. Where a clue or a dot has four open edges and two are a pair, the
other two SHALL be noted the same way from what the pair leaves. Two pairs
sharing an edge SHALL give the pair of their other edges: a match where the
two are alike, opposites where they differ.

#### Scenario: Two edges of a 3

- **WHEN** a 3 has two lines and two open edges
- **THEN** the step reads "Only these two edges of this 3 are still open, and
  it needs 1 more, so they must be opposites."

#### Scenario: A match and an opposite chained

- **WHEN** one edge matches a shared edge and another is that edge's opposite,
  both pairs being on the board
- **THEN** the step reads "One of these edges matches the marked edge the
  marked pairs share and the other its opposite, so they must be opposites."

### Requirement: Hint: A noted corner settles its edges against its dot's lines

From Normal the hint SHALL settle a noted corner's edges: where it needs a
line and one edge is ruled out, the other is drawn; where it takes one at most
and one edge is a line, the other is ruled out; and where its two edges are
the only open ones at a dot with no line, both are drawn or both ruled out.
From Tricky, at a dot with no line and three open edges, a corner taking
exactly one line SHALL draw the third edge.

#### Scenario: Both or neither

- **WHEN** a corner noted as needing a line has the only two open edges of a
  dot with no line
- **THEN** the step reads "The marked corner needs a line; the outlined dot
  takes both or neither, so both ringed edges must be lines."

#### Scenario: The loop leaves by the third edge

- **WHEN** a dot with no line has three open edges and the corner of two of
  them is noted as exactly one line
- **THEN** the step reads "The marked corner takes exactly one line; the
  outlined dot has no line yet, so this edge must be its second."

### Requirement: Hint: A dot's count settles its open edges

The hint SHALL rule out the one open edge of a dot that has no line, since "a
line here would dead-end", SHALL draw the one open edge of a dot that has one
line, and SHALL rule out every open edge of a dot that has two lines. Each
step marks the dot its sentence calls "the outlined dot".

#### Scenario: A line with one way on

- **WHEN** a dot has one line and one open edge
- **THEN** the step reads "The line at the outlined dot has no other way to go
  on, so this edge must be a line."

#### Scenario: A full dot with one edge left

- **WHEN** a dot has two lines and one open edge
- **THEN** the step reads "The outlined dot already has its two lines, so the
  ringed edge can't be a line."

### Requirement: Hint: A clue's count settles its open edges

The hint SHALL rule out every open edge of a clue that already has its lines,
and SHALL draw every open edge of a clue with only as many edges not ruled out
as it needs. Where a clue needs all but one of its open edges, of which there
are more than two, and two adjacent ones meet at a dot that has a line, it
SHALL draw the rest. Each step outlines the clue, and the last marks that dot.

#### Scenario: A 0 is said in its own words

- **WHEN** a 0 has open edges
- **THEN** the step reads "This 0 takes no lines, so each ringed edge can't be
  a line." and rules them all out

#### Scenario: A 1 with one edge left

- **WHEN** all but one of a 1's edges are ruled out
- **THEN** the step reads "Only one of this 1's edges isn't ruled out, so the
  ringed edge must be a line."

#### Scenario: A clue that must spare its edge at a dot

- **WHEN** a 3 in a square has four open edges and one of its dots has a line
- **THEN** the step draws the two edges that do not meet at that dot, saying
  the 3 "can spare one edge and must spare it at the outlined dot, which has a
  line"
