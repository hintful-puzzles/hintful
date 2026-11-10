## MODIFIED Requirements

### Requirement: A binding fires only on the marks it read

A compiled technique's solve SHALL NOT fire a binding whose binders' reads of the marks a fact made since in its own run has changed. The engine SHALL read them again, and no description SHALL restate a premise for this. A binding passed over SHALL be tried again on the marks as they then stand: by the ladder's next run, or, for a technique run on placing, by running it again on its cell.

#### Scenario: A square's second binding does not read the edge its first drew

- **WHEN** Path's `pairBreaks` draws a line on one of a square's three open edges, and a later binding of the same square read those three as open before the line was drawn
- **THEN** the later binding does not fire, and the board grades at the tier the hand-written ladder gave it

#### Scenario: A read the fact left standing still fires

- **WHEN** Rome's `loop` strikes one arrow from a square, and the square's next arrow, read before that strike, is still among its candidates
- **THEN** the next arrow's binding fires in the same run, as it did before the reads were made again

#### Scenario: A laser's square read before a placement is read again

- **WHEN** Blackbox's `ray` places at the first unknown square along a laser for one value, and the same laser's next value read that square before the placement
- **THEN** the next value's binding is passed over and the laser is tried again on the marks as they then stand

#### Scenario: Every described game's bindings are read afresh in the suite

- **WHEN** the suite solves each described game's shared boards with the stale-read guard on
- **THEN** every binding about to fire reads all its binders afresh from the marks, with no count and no narrowing, and one whose read no longer holds fails that game's case
