## MODIFIED Requirements

### Requirement: Params: Unequal refuses the parameters it cannot deal

`validateParams` SHALL refuse an Adjacent puzzle of Tricky difficulty or
harder below order 5, and SHALL refuse, when a board is to be dealt, an order
of 3 at Tricky or Hard, which no 3×3 board needs.

#### Scenario: A small Adjacent puzzle has no upper tiers

- **WHEN** `validateParams` is called with an Adjacent puzzle below order 5 at
  Tricky or harder
- **THEN** it returns a non-null error string

#### Scenario: A 3×3 at Unreasonable deals

- **WHEN** a board is to be dealt from the params `3dr`
- **THEN** it is not refused, and the board dealt needs Unreasonable

### Requirement: Hint: Unequal's hint reasons no harder than the board's tier

The hint's recording solver SHALL try a lower tier's technique before a
higher one's and, on a board below Unreasonable, SHALL be capped at the
board's own tier. So a sign's bound and a bar beside a placed number SHALL be
offered from Normal up, a bar read against an undecided neighbor and a set
within one row or column from Tricky up, and one number's places across
several rows and columns at Hard.

#### Scenario: A Normal board in Adjacent mode

- **WHEN** a hint is asked on a board dealt from the params `5ade`, Adjacent
  5×5 at Normal
- **THEN** no step reads a bar against an undecided neighbor, and none is a
  set

#### Scenario: An Easy board has no clue strikes

- **WHEN** a hint is asked on a board dealt from the params `4dt`, 4×4 at Easy
- **THEN** no step reasons from a sign: each one places a number, as the last
  its row and column leave the cell or in the last cell of a row or column
  left for it
