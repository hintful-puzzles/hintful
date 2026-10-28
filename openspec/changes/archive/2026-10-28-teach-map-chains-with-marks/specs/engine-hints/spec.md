## MODIFIED Requirements

### Requirement: A hypothesis is classified as Check, Tactic or Search

A deduction that reaches its conclusion through a hypothesis SHALL be
classified by whether each link writes a mark the player can make. A Check is
a look at the placement, with no propagation, narratable at any tier. A Tactic is a chain whose every link is a fact the game's ordinary
marks record, taught as ordinary steps that each write their mark. A Search
runs the solver from a hypothesis, backtracks, or follows a chain of
suppositions no mark records, however short.

#### Scenario: A trial that propagates is not thereby a Search

- **WHEN** a technique tries a value and follows its forced consequences
- **THEN** it is classified by whether each consequence is a fact the player
  can mark, not by whether a trial propagates nor by the technique being called
  "forcing"

#### Scenario: A chain of suppositions is a Search

- **WHEN** a rung's links are "if this, then that" between values no mark
  records, as a Latin forcing chain's are
- **THEN** it runs only at Unreasonable, and the hint below it refuses it as a
  Search

#### Scenario: Weighing one element's values is a Check

- **WHEN** a rung takes every value one element can hold, reads each off the
  board as it stands, and concludes what every value agrees on, as Map's
  weighing and Path's weighed square do
- **THEN** it is a Check, and may define a tier below Unreasonable

## REMOVED Requirements

### Requirement: A Tactic's chain is shown on the board

**Reason**: It held the chain of a supposition rung kept on its tier, and the
last, Map's `forcingChain`, is retired (`teach-map-chains-with-marks` D4). A
Tactic is taught as ordinary steps, each writing its mark, and needs no chain
picture.

**Migration**: None.

### Requirement: A Tactic's narration names the ends, the links and the rule

**Reason**: It too was about a chain a tier keeps, and none is left.

**Migration**: None.

### Requirement: A rung is classified by the bound it guarantees

**Reason**: It called a bounded walk a Tactic. A bounded walk of suppositions
is a Search (`retire-hint-ordinals` D4), and a rung is classified by whether
its links are marks, which "A hypothesis is classified as Check, Tactic or
Search" states.

**Migration**: "A hypothesis is classified as Check, Tactic or Search".

### Requirement: A supposition rung that defines its tier keeps it until a markable technique fills it

**Reason**: Every rung it kept has moved or retired: the Latin chains, Path's,
Spokes' and Clusters' look-aheads, Boats' trial, and Map's `forcingChain`,
whose tier the weighing now deals.

**Migration**: A supposition rung runs only at Unreasonable ("A hypothesis is
classified as Check, Tactic or Search").
