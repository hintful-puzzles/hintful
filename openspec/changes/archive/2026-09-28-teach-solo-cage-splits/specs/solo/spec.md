## ADDED Requirements

### Requirement: Every killer sum Solo cites is worked out from the board in one step

The killer region rule (`DIFF_KINTERSECT`) SHALL derive the sums it leaves afresh on every pass from the cages on the board, and SHALL NOT keep a derived part of a cage as a working cage of its own. Every sum a killer deduction rests on SHALL therefore be one of three, each worked out from the board as it stands: a cage's open cells make its clue less its placed digits; the open cells a row, column or block leaves, once its placed digits and the cages inside it are taken out, make the rest of its total; or, where those cells all lie in one cage, that cage's other open cells make its clue less that and its placed digits. A recorded killer reason SHALL say which, and its `reads` SHALL name every filled cell the sum rests on. The hint SHALL narrate each sum by what it came from, so that no sentence calls something a killer cage that the board does not show as one, and no sentence says a cage's other cells are filled while any is open.

#### Scenario: A killer single's cage is filled wherever the hint says so

- **WHEN** the hint places the last open cell of a killer cage because its other cells already make the rest of the clue
- **THEN** every other cell of that cage is filled on the board the step is shown on
- **AND** the sum the sentence gives is the sum of their digits

#### Scenario: A sum the region rule leaves is narrated from its region

- **WHEN** a killer deduction rests on what a row, column or block leaves its open cells, or on the rest of the cage those cells lie in
- **THEN** the sentence names the region and the sum it leaves, the step hatches the region, and it outlines the cells the sum is left to

#### Scenario: A recorded killer sum follows from the board and its reads

- **WHEN** a recording's killer reason is checked against the board at the point it was recorded
- **THEN** its cells are open, its sum is theirs in the solution, and the sum follows from its origin using only filled cells its `reads` name
