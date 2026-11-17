## ADDED Requirements

### Requirement: A technique that follows from one kind of rule is placed on the kind

A described game SHALL place a technique that follows from one kind of rule
alone with `kind:`, giving its nouns and words, and SHALL state only what is
its own. The loader SHALL expand a placement into the technique it stands
for, so the compiler, the soundness check and the hint read it as stated. A
placed technique SHALL be checked sound with the kind's planted defect,
unless the game plants a sharper one.

#### Scenario: A placement compiles as the statement it replaces

- **WHEN** Light Up's `shine` is placed on `peer.placed` with its group, peers
  and move
- **THEN** its compiled module is byte-identical to the one its statement
  compiled to

#### Scenario: A game's plant replaces the kind's

- **WHEN** a game's plants file names a placed technique
- **THEN** the soundness check plants the game's defect, not the kind's
