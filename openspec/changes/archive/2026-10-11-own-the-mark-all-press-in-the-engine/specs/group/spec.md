## REMOVED Requirements

### Requirement: A letter key enters its element, and only a capital M marks all

**Reason**: Which letter marks all is the engine's rule for every game, read
off the board's keypad, and Group no longer reads `M` for it.

**Migration**: "A letter key enters its element", and in `engine-notes`, "The
letter M is Mark-all where the board has no M key".

## ADDED Requirements

### Requirement: A letter key enters its element

A letter key, capital or small, SHALL enter the element it letters in the
selected cells, or toggle that element's pencil mark in pencil mode; a letter
no element of the board has SHALL be declined. The keypad SHALL offer a key
for each element, in the order of their numbers, then Clear.

#### Scenario: The keypad of a board that shows its identity

- **WHEN** the keypad is asked for under `6dt`
- **THEN** its keys are `e`, `a`, `b`, `c`, `d`, `f` and Clear

#### Scenario: A letter the board has no element for

- **WHEN** `k` is pressed with a cell selected on a 6×6 board
- **THEN** no move is made
