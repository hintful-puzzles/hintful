## ADDED Requirements

### Requirement: Sokoban descriptions spell each cell with a letter

A description SHALL write a cell as `s` (floor), `w` (wall), `t` (target),
`b` (barrel), `f` (a barrel on a target), `p` (pit), `d` (deep pit), `u` (the
player) or `v` (the player on a target), or as a capital `A` to `Z` for a
labeled barrel off a target. A run of one letter MAY be written as the letter
and a count of at least 2. `newState` SHALL refuse a count of 0 or 1.

#### Scenario: A dealt 10 by 12 level

- **WHEN** `w13s3w7tbsw2tw2sbs4tbw2s2ts2wbuw4swt2sbw4swb2stw2s2tbs3w3bw2tbsw4tw4bw9tw13`
  is loaded on a `10x12` board
- **THEN** its `w13s3w7` is the top row of walls and three more, three floor
  squares, and walls to three squares into the third row, where `tbs` puts a
  target, a barrel and a floor square
- **AND** its one `u` is the player's start, on floor in the ninth column of
  the fifth row

#### Scenario: A count of one

- **WHEN** the same description is loaded with its opening `w13` written `w1`
- **THEN** it is refused as holding a number out of range for its board

### Requirement: A Sokoban hint step with nothing to say names only its push

Where no trap leads, the judging settled nothing, the push says nothing of
the order the barrels go home in, puts no barrel on a target and does not let
the player out, the step SHALL say only the push, "Push this barrel" and the
way it goes, unless the push is the plan's first and the plan goes on with a
run of the same barrel onto a target.

#### Scenario: A push across open floor

- **WHEN** the offered push moves a barrel one square to the left over open
  floor, and none of the things a step says holds of it
- **THEN** the step reads "Push this barrel left."
