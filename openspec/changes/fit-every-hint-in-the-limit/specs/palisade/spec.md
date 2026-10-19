## MODIFIED Requirements

### Requirement: Hint: A multi-edge firing says why its edges are forced together

For a multi-edge firing the first leg SHALL state why the moves are forced
together. For `equivalentEdges`: the two highlighted edges border the same
region and therefore share a fate, which together with the clue's count forces
the result. For `numberExhausted`: the clue's count leaves its remaining edges
a single possible state. The first leg SHALL phrase the conclusion across the
set ("draw them all", "both must be walls").

#### Scenario: The coupled pair's first leg states the shared fate

- **WHEN** the next deduction is an `equivalentEdges` firing of two edges
- **THEN** the first leg's explanation states that the two edges share a fate
  and names the clue that decides them

### Requirement: Hint: Two edges of a Palisade clue that border one region share a fate

Where two undecided edges of a clue of 1, 2 or 3 lead into the same region,
both SHALL be open where walls on both would exceed the clue, as they always
would a 1, and both SHALL be walls where leaving both open would leave it
short, as it always would a 3. A 2 SHALL go by the edges it has already
decided: open with a wall placed, walls with an edge open. The step SHALL
stripe the region the edges border, and SHALL NOT mark the clue's cell.

#### Scenario: A 2 that cannot afford two more walls

- **WHEN** the plan on `23d2e2c2e232` reaches a 2 with two undecided edges
  into one region, where walls on both would exceed it
- **THEN** the step says "Both edges border the same region, so they share a
  fate; walling both would exceed clue 2, so neither can be a wall."

#### Scenario: The clue that decides the edges is not marked

- **WHEN** an `equivalentEdges` step is displayed
- **THEN** every cell of the region it names is hatched, and the clue cell is
  neither hatched nor outlined
