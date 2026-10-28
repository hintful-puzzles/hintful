## MODIFIED Requirements

### Requirement: Hint: At Hard the Boats hint tries the one square a line is short of

At Hard the hint SHALL take a line that needs exactly one more boat square,
try each free square as that one with the rest of the line water, and make it
water where that breaks a rule at once; and for a line with room for exactly
one more water square, the same with boat and water exchanged. It SHALL also
try a given middle segment's boat each way, and where one way breaks a rule
make water of the square below it, or to its right, that way.

#### Scenario: The square that cannot be the last boat square

- **WHEN** a row needs one more boat square, and with that segment on one of
  its free squares and water on the rest a column could no longer reach its
  number
- **THEN** the step makes that square water, and says that if it held its
  row's last boat segment the striped column could no longer reach its number

## ADDED Requirements

### Requirement: Hint: A Boats refutation says the square was its line's last

A square's refutation at Hard SHALL say it was tried as its line's last boat segment or water, and the crossing line's where that was filled too, as a sentence's length allows. The fill of the line is the value tried and nothing follows from it, so the trial is a Check.

#### Scenario: The line a trial fills is named

- **WHEN** a square is refuted as its column's last water, and the sentence fits
- **THEN** it begins "If this square were its column's last water,"
