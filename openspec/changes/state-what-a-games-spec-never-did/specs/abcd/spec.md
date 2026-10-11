## ADDED Requirements

### Requirement: ABCD params are written as the size, n with the letter count, and D for no diagonal touching

`encodeParams` SHALL write the width and height as `WxH`, then `n` and the
letter count, then `D` when diagonal touching is disallowed; the full
encoding SHALL go on with `R` when clues are removed, and the difficulty. A
string with no `D` SHALL decode as a board that allows diagonal touching.

#### Scenario: The preset that disallows diagonal touching

- **WHEN** `6x6n5Dde` is decoded
- **THEN** it is a 6×6 Easy board of five letters with diagonal touching
  disallowed and every clue showing
- **AND** its shared encoding is `6x6n5D`

### Requirement: ABCD's keypad offers the board's letters and Clear

`requestKeys` SHALL offer one key for each of the board's letters, labeled
with the letter and in order from `A`, and then the Clear key. A letter key
SHALL do what typing that letter does at the selected cell, an entry or a
pencil mark by the mode, and Clear what Backspace does.

#### Scenario: A board of five letters

- **WHEN** the keypad of a board of five letters is read
- **THEN** its keys are `A`, `B`, `C`, `D`, `E` and Clear, in that order

### Requirement: ABCD's hint reads a line only once the notes are set up

The hint's satisfied-clue and runs rungs SHALL fire only once the notes are
set up: after the fill-all and its clean where the `hint-notes` preference
is "Every candidate first", and after the clean where it is "Only as needed".
Until then the hint SHALL offer only the walk's own singles.

#### Scenario: A row that may hold no A, on a board just dealt

- **WHEN** a hint is asked on `0,2,1,1,1,0,1,2,1,1,1,1,0,2,1,1,1,1,0,2,0,1,1,2,1,1,2,0,0,2,1,1,`,
  a 4×4 board of four letters whose top and bottom rows' numbers for A are
  0, under "Every candidate first"
- **THEN** the first step pencils every letter into each empty cell, and
  only the step after it crosses A out of a row that may hold none
