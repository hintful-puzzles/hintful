## MODIFIED Requirements

### Requirement: Light Up accepts pointer and cursor input

`interpretMove` SHALL reproduce upstream input: left-click toggles a bulb on
an open, unmarked square (clearing any mark when placing); right-click toggles
the impossible-mark on an open, bulb-less square (placing a mark removes any
bulb); clicks on black squares and out-of-grid are no-ops; a left-click on a
marked square (and a right-click on a bulb) is rejected without a history
entry. Keyboard: arrow cursor movement (revealing the cursor), select/Enter
toggles a bulb, select2/`i` toggles a mark, with the same rejection rules.
Completion SHALL hide the cursor. Bulb and mark are mutually exclusive in
`executeMove`, which SHALL recompute lit counts; the board SHALL be reported
solved exactly while the grid is correct (all lit, no overlap, all clues
exact).

#### Scenario: Left-click places and toggles a bulb

- **WHEN** the player left-clicks an empty open square, then left-clicks it
  again
- **THEN** a bulb appears (lighting its row/column to the nearest black
  squares) and then disappears

#### Scenario: Marks block bulbs

- **WHEN** the player left-clicks a square carrying an impossible-mark
- **THEN** no move is produced and no history entry is created

#### Scenario: Completion is detected

- **WHEN** a move leaves every open square lit, no bulb lit by another, and
  every clue exactly satisfied
- **THEN** `status` reports the board solved and the solve-completion flash
  plays
