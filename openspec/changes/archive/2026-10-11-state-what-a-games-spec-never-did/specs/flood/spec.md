## ADDED Requirements

### Requirement: Flood descriptions are a digit a square and the move limit

A Flood description SHALL be one decimal digit for each square in reading
order, the square's color counted from 0, then a comma and the move limit in
decimal. `newState` SHALL refuse a digit that is not below the params' color
count, too few or too many squares, a missing limit and anything after it.
The colors a fill may use SHALL be counted from the board, one more than the
highest digit it holds, and not from the params.

#### Scenario: A dealt 12×12 board

- **WHEN**
  `112134144412112311041120154311140123340134132014315015100513422150022300251115244430040030540540412042102523025541112531014244505101425240325120,23`
  is opened under `12x12c6m5`
- **THEN** the top row begins with colors 1, 1, 2, 1, 3 and 4, the board has
  six colors, and the status bar reads `0 / 23 moves`

#### Scenario: A board with more colors than the params allow

- **WHEN** that description is opened under `12x12c3m0`
- **THEN** it is refused, since it holds digits of 3 and above

#### Scenario: A digit outside the colors

- **WHEN** the first digit of that description is changed from `1` to `6` and
  it is opened under `12x12c6m5`
- **THEN** it is refused as holding a number out of range

### Requirement: Flood's Easy, Medium and Hard name the extra moves

The preset titles Easy, Medium and Hard SHALL name how many moves the limit
allows beyond the solver's own count, and no difficulty tier: Easy is 5 extra
moves, Medium 2 and Hard none. A preset with another number of colors SHALL
be titled by its size and its colors, and gives no extra moves.

#### Scenario: Two presets of one size

- **WHEN** the presets `12x12c6m2` and `12x12c6m0` are listed
- **THEN** the first is titled `12x12 Medium` and the second `12x12 Hard`

#### Scenario: A three-color board

- **WHEN** the preset `12x12c3m0` is listed
- **THEN** its title is `12x12, 3 colors`, with no word for its lack of extra
  moves

### Requirement: Flood's hint refuses a grid flooded after the limit

A grid that became one color only after the move limit is lost and has no
fill left to make. The hint SHALL refuse it, saying the game is over and to
undo or start a new one. On a lost board whose grid is not yet one color the
hint SHALL still give the solver's remaining fills.

#### Scenario: The grid is finished one move late

- **WHEN** the fill that makes the grid one color is the first past the limit,
  and a hint is asked
- **THEN** the hint refuses, saying `This game is over. Undo to play on, or
  start a new one.`
