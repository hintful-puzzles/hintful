## ADDED Requirements

### Requirement: A born game's clue at the board may be derived from its answer

A clue at the board whose deal samples an answer SHALL be dealt as one
record for each value of every field but the last, in their values' order,
the last field read off the answer by the meaning `E = f(k)`. A meaning of
any other shape, or a key field whose values are no range of numbers, SHALL
be refused by the compiler. While the answer is built, the clue SHALL hold
no record.

#### Scenario: The totals of a board

- **WHEN** a `totaling` board is dealt and solved
- **THEN** its clue holds a record for blocks and one for discs, each
  counting the squares of the answer holding it

### Requirement: A born game's ID may write a clue at the board

The ID's `numbers` segment of a clue at the board the deal derives SHALL
write each record's last field, in the records' order, and a desc whose
value is past the field's range SHALL be refused.

#### Scenario: The totals written first

- **WHEN** a `totaling` board is dealt
- **THEN** its ID begins with the count of blocks and of discs, and reads
  back to the same board

### Requirement: A born game's clue at the board may be drawn as a row of counts

`play.counts` SHALL draw a clue at the board the deal derives beneath the
board, each record its value's piece and its count, the count in the error
color where the rules break the record; the canvas SHALL hold the row. A
press on a record SHALL place its value as the value's key does.

#### Scenario: A pressed count places its value

- **WHEN** the cursor is on an open square of a `totaling` board and the
  disc's count is pressed
- **THEN** the square holds a disc
