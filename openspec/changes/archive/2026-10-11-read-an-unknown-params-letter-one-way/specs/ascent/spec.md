## ADDED Requirements

### Requirement: Ascent refuses a mode letter it does not have, and opens the save one left

An `m` followed by a letter that is none of `O`, `R`, `H`, `C` and `E`, or by
nothing, SHALL be refused. The word `mundefined` in place of the mode SHALL be
read as Classic: it is what a save holds for a board entered, before the
refusal, from an ID with such a letter, and that board was played as Classic.
Nothing SHALL write the word.

#### Scenario: A lowercase mode letter

- **WHEN** `6x7modh` is decoded
- **THEN** it is refused:
  `The parameters 6x7modh have a "o" where this puzzle reads none.`

#### Scenario: A save made from such an ID

- **WHEN** a save whose params are `6x7mundefinedde` is opened
- **THEN** it opens as the 6×7 Classic board it was played as, and its params
  are written back as `6x7mRde`
