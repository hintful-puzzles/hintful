## MODIFIED Requirements

### Requirement: Rules: Boats flags a broken rule as the player plays

The game SHALL flag live, once the board makes each certain, as the fill
engine marks a broken rule: a line whose count is broken, its number in the
error color; two boats touching even diagonally, by the diamond between
them; and a run longer than the fleet's longest, by a bar along it. On a
board the puzzle's solver completes, a board the live flags mark SHALL be a
board on which `findMistakes` reports a cell.

#### Scenario: A row whose count is exceeded is flagged

- **WHEN** more boat segments are placed in a row than its occupancy clue allows
- **THEN** the row's count is shown in the error color, and `findMistakes`
  reports at least one of the row's cells

#### Scenario: A run too long is flagged with its ends open

- **WHEN** the fleet's longest boat has three squares and the player places
  four segments in a row, the squares round them still open
- **THEN** the four are marked as a run the rules forbid

### Requirement: Params: Boats params are written as the size, f with the largest boat, the tier, S and the fleet's counts

`encodeParams` SHALL write `WxH`, `f` and the fleet size, then in the full
encoding `d` with `e`, `n`, `t` or `h` and `S` when numbers are removed, then
in every encoding a comma and the count of boats of each size from one square
up, parted by commas. `decodeParams` SHALL read a missing `f` as 4, a missing
tier as Easy, a missing list as the pyramid (one boat of the largest size,
two of the next, and so on down), and a count the list lacks as none.

#### Scenario: A Hard board with numbers removed

- **WHEN** `6x6f3dhS,3,2,1` is decoded
- **THEN** it is a 6×6 Hard board with numbers removed, whose fleet is three
  one-square boats, two of two squares and one of three
- **AND** its shared encoding is `6x6f3,3,2,1`

### Requirement: Look: A given boat segment sits on the lifted surface of a given

A boat segment the puzzle gave SHALL sit on the collection's lifted surface of
a given, shaped as the answer runs through it, so it is told from a segment
the player placed by the cell under it. The help page SHALL say that a given
segment sits on a lighter square.

#### Scenario: A given segment is told by the cell under it

- **WHEN** a board with a given boat segment is drawn
- **THEN** that segment's square is the lifted surface
- **AND** a segment the player places is drawn on the undecided square's
  surface

## ADDED Requirements

### Requirement: Generation: Boats deals a fleet and gives each square's shape while the tier holds

A deal SHALL lay the fleet, the longest boat first, in random stretches with
room for it, number every row and column, give every square's shape and
hide as many shapes as the board stays at its tier, and with Remove numbers
the numbers too, in one random order. A board SHALL be kept where the ladder
finishes it at its tier and not below, and with Remove numbers only where it
hides a number. No given square SHALL be a segment of unknown shape.

#### Scenario: A dealt board's givens are the answer's shapes

- **WHEN** a Boats board is dealt and solved
- **THEN** each given square is water or the shape its boat gives it

### Requirement: Controls: Boats' click goes round, and a right drag waters a line

A click SHALL take a square round empty, boat segment and water, the right
button the other way round. A right drag SHALL mark water along one row or
column, and Shift or Ctrl with an arrow SHALL mark water as the cursor moves,
as in every fill game whose stroke is a line.

#### Scenario: Two clicks make water

- **WHEN** the player left-clicks an empty square twice
- **THEN** it holds a boat segment after the first click and water after the
  second

### Requirement: Hint: The Boats hint carries on from its last step, then by its rules

The hint SHALL take, of the firings the ladder could make, the one that
carries on from the cells its last step read and decided, and otherwise
the first by its rule.

#### Scenario: A step that opens another

- **WHEN** a hint step decides squares, and a rule can fire on one of them
- **THEN** the next step is that firing, ahead of one elsewhere on the board

## REMOVED Requirements

### Requirement: Generation: The Boats generator deals a unique board at exactly the requested difficulty

**Reason**: The fill engine deals the board.
**Migration**: See "Generation: Boats deals a fleet and gives each square's
shape while the tier holds".

### Requirement: Controls: Boats declares its two verbs and its erase key, and adds a drag and a modifier stroke

**Reason**: The fill engine's input is every fill game's.
**Migration**: See "Controls: Boats' click goes round, and a right drag
waters a line".

### Requirement: Controls: A Boats drag fills its line as its first square changed

**Reason**: A line stroke in the fill engine marks the secondary value.
**Migration**: See "Controls: Boats' click goes round, and a right drag
waters a line".

### Requirement: Controls: Boats' modifier arrows fill as the cursor moves

**Reason**: The modifier arrows are the fill engine's line stroke.
**Migration**: See "Controls: Boats' click goes round, and a right drag
waters a line".

### Requirement: Hint: The Boats hint asks its techniques in a fixed order

**Reason**: The fill engine's hint follows on from the cells each step
decides.
**Migration**: See "Hint: The Boats hint carries on from its last step, then
by its rules".

### Requirement: Hint: A Boats hint marks a boat and water each in its own shape

**Reason**: The fill engine's hint rings the squares a step decides, and
its sentence says which value each takes, as in every fill game.
**Migration**: None.

### Requirement: Look: The win flash lights a boat whole

**Reason**: The fill engine's win flash sweeps every square at its own
place, as in every fill game.
**Migration**: None.
