## ADDED Requirements

### Requirement: An Ascent description parts two numbers with _ and counts a run from a

Between two numbers with no run between them a description SHALL hold `_`,
and without it their digits read as one number. A run letter SHALL count from
`a` or `A` for one square to `z` or `Z` for twenty-six. A number SHALL be from
1 to the count of squares in the physical grid, and `newState` SHALL refuse
one outside that.

#### Scenario: The first row of a dealt board

- **WHEN** `a30_31b42a1j26a22c19j9_17e` is opened as a 6×7 Orthogonal board
- **THEN** its top row reads an empty square, 30, 31, two empty squares and 42
- **AND** with its first `_` taken out it is refused, 3031 being more than the
  board's forty-two squares

### Requirement: Ascent's full encoding adds hidden ends, the tier and symmetry after the mode letter

After `WxH` and `m` with the mode letter, the full encoding SHALL add `E` when
the start and end are not always shown, then `d` with `e`, `n`, `t` or `h`,
then `S` for symmetrical clues, which Edges never writes. The shared encoding
SHALL stop at the mode letter. A string with no `d` SHALL decode as Easy, and
as Normal in Edges, which has no Easy.

#### Scenario: An Edges preset

- **WHEN** `5x5mEEdn` is decoded
- **THEN** it is a 5×5 Edges board at Normal whose ends are hidden: the first
  `E` is the mode and the second the hidden ends
- **AND** its shared encoding is `5x5mE`, which decodes as Normal with the
  ends shown

#### Scenario: Symmetry is written last

- **WHEN** `6x7mOdeS` is decoded
- **THEN** it is a 6×7 Orthogonal Easy board with symmetrical clues, and its
  shared encoding is `6x7mO`

### Requirement: Ascent refuses a tier that no board of a small size has

When a board is to be dealt above Easy, `validateParams` SHALL refuse, as a
size with no such puzzle: an Orthogonal 2×2 or 2×3, and at Hard 2×4 or 2×5; a
Classic 2×2, at Hard any board two wide, and at Normal 2×3 or 3×3; a Honeycomb
2×2, 2×3 except at Tricky, 3×2 except at Normal, and 4×2 at Hard; a Hexagon
2×3, and at Normal 3×3. Orthogonal and Classic sizes SHALL count either way
round. Such a board that arrives with its description SHALL load.

#### Scenario: A 3×3 that has Tricky boards and no Normal one

- **WHEN** a 3×3 Classic board is asked for at Normal, and a 3×3 Hexagon at
  Tricky
- **THEN** the first is refused with "No 3x3 Classic puzzle is Normal." and
  the second is dealt

#### Scenario: A Honeycomb is not the same grid turned round

- **WHEN** a Honeycomb two wide and three high, and one three wide and two
  high, are each asked for at Normal
- **THEN** the first is refused and the second is dealt

### Requirement: A right-click on an Ascent square with two candidate numbers cycles through them

A right-click on a square that is no given and could take either of two
numbers SHALL place the lower, then the higher, then empty the square. A
square has two such numbers when it is beside the selected number and both
that number's neighbors in the sequence are unplaced, when it is empty and
shows two offered numbers, or when it holds a number that sits beside exactly
one placed number next to it in the sequence, the number on that one's other
side being unplaced.

#### Scenario: Trying a square both ways

- **WHEN** 10 is selected, 9 and 11 are unplaced, and the player right-clicks
  an empty square beside it three times
- **THEN** the square holds 9, then 11, then nothing

### Requirement: A tap on the square a tap just filled offers the number before, then empties it

When a tap or a drag from a selected number places the number after it while
the number before it is unplaced too, a further tap on that square SHALL
replace it with the number before, and one more SHALL empty the square and
select the first number again. A press on another square, or of the other
button, SHALL end the cycle, so that a later tap on the placed number selects
it.

#### Scenario: Three taps on one square

- **WHEN** 10 is selected with 9 and 11 unplaced, and the player taps an empty
  square beside it three times
- **THEN** the square holds 11, then 9, then nothing, and 10 is selected

### Requirement: Ascent's keys click at the cursor, and the number pad types or moves

Enter SHALL be a left click at the keyboard cursor, and Space, or Backspace
while no number is being typed, a right click there. The `numpad` preference
SHALL choose what the number pad's digits do: under "Enter numbers", the
default, they type as the top row's do; under "Move cursor" 8, 2, 4 and 6
move the cursor as the arrows do and 7, 9, 1 and 3 up-left, up-right,
down-left and down-right. On a hexagonal board Up and Down SHALL zigzag,
keeping the cursor in its column.

#### Scenario: The number pad moves the cursor

- **WHEN** "Numpad inputs" is "Move cursor", the cursor is away from the edges
  of a Classic board, and the number pad's 8 is pressed
- **THEN** the cursor moves one square up, and no digit is typed
- **AND** under "Enter numbers" the same key on an empty square begins the
  number 8 there

### Requirement: Ascent's auto-advance preference moves the selection past numbers already placed

The `auto-advance-runs` preference ("Skip past already-placed numbers when
advancing"), on by default, SHALL decide where the selection goes when a
number is placed beside the selected one. When it is on and the numbers that
follow in the direction of play are already on the board, the selection SHALL
move to the last of them, so the next missing number is offered at once. When
it is off the selection SHALL stay on the number just placed.

#### Scenario: Placing the number that joins a run

- **WHEN** 15 and 16 are on the board, 13 is selected, and the player places
  14 beside it
- **THEN** 16 is selected and 17 is offered
- **AND** with the preference off, 14 is selected

### Requirement: Ascent's hint asks its techniques in the order of their tiers

The hint SHALL ask its techniques in this order, the first that places a
number giving the step: next to its neighbors (Easy); within reach, the dead
end (Normal); the square only one number reaches, where that number has a
placed neighbor in the sequence (Tricky); that reading without one, reach
along routes, and the two only-one-number readings along routes (Hard). In
Edges reach along routes is Normal and the route reading with a placed
neighbor Tricky, each last in its tier.

#### Scenario: An easier technique is spoken first

- **WHEN** one missing number has a single empty square in reach of the placed
  numbers either side of it, and another has a single empty square touching
  both its placed neighbors in the sequence
- **THEN** the step places the second, as next to its neighbors

### Requirement: On an Edges board Ascent's hint asks the arrows before the runs of their tier

On an Edges board the hint SHALL ask where the lines cross after the dead
end and before reach along routes. It SHALL ask which arrow still fits first
of the Tricky techniques where the number that arrow leaves has a placed
neighbor in the sequence, and first of the Hard ones where it has none.

#### Scenario: The lines are read before a route

- **WHEN** on an Edges board one missing number's own line and its neighbors'
  lines leave it a single square, and another has a single square on any
  route between the placed numbers either side of it
- **THEN** the step places the first, as where the lines cross

### Requirement: An Ascent label names a Hexagon by its size and says only the departures

A Hexagon board's label SHALL give its size as "Size N", N being its width,
where every other board's gives `WxH`. A label SHALL say "hidden ends" or
"shown ends" only for a board that departs from its ruleset's habit, which is
hidden in Edges and shown elsewhere, and "symmetric" for symmetrical clues.

#### Scenario: The Hexagon preset and an Edges board with its ends shown

- **WHEN** `7x7mHdn` and `5x5mE` are labeled
- **THEN** the labels are "Hex: Size 7 Hexagon Normal" and "Edges: 5x5 Normal,
  shown ends"
