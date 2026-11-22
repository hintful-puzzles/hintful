## MODIFIED Requirements

### Requirement: Rules: A letter repeated in a completed region is drawn as an error

A letter that two cells of one region hold SHALL be drawn in the error color
in both, as soon as the region is certain: the player's no-wall marks join
the two cells, or a wall-bounded region of at most `k` cells holds them. It
is a breach of the rule that a region holds each letter once, which
Separate's rules report (`Game.rules`).

#### Scenario: A repeated letter in a completed region is Separate's error

- **WHEN** a wall-bounded region of exactly `k` cells holds one letter twice
- **THEN** Separate's own tile callback draws both of those letters in the
  error color

#### Scenario: A repeated letter is red before its region is walled off

- **WHEN** the player's no-wall marks join two cells holding one letter, and
  the walls round them are still undecided
- **THEN** both letters are drawn in the error color
