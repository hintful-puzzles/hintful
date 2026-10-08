## MODIFIED Requirements

### Requirement: The preset menu is a grid

A game's preset menu SHALL list its boards in the game's order, each at the tiers it is offered at, and after them one board for each thing that is neither a size nor a tier. The engine SHALL provide `presetGrid(paramConfig, boards, opts)` to build that menu from the boards a game names, and `preset-menu-shape.test.ts` SHALL hold every registered game's menu to the shape below, read off the menu itself.

- A whole menu SHALL hold at most `MENU_LINES` (eighteen) lines, whatever its sections, unless the test's ledger names the game and what fills its menu; the ledger SHALL be exact.
- A section SHALL hold at most `MENU_SECTION_LINES` (twelve) lines, except a section with one line for each choice of a kind of board.
- The lines of one board SHALL be consecutive and run from its first tier to its last with none left out.
- Every tier of a tiered game SHALL be on the menu in each of its rulesets, unless every board of that ruleset's menu refuses the tier, or the test's ledger gives the game's reason for leaving it off.
- A checkbox rule modifier SHALL apply on exactly one line of the menu, unless the test's ledger says the game offers it as a level of every size, in which case it SHALL apply on one line a size.
- A game whose params have a size SHALL offer at least three boards.

#### Scenario: A menu past twelve lines

- **WHEN** a game lists thirteen boards under one heading, and they are not one line for each kind of board
- **THEN** `preset-menu-shape.test.ts` fails, naming the game and the count

#### Scenario: A menu of many short sections

- **WHEN** a game's menu holds four sections of five lines each, and the ledger does not name the game
- **THEN** the test fails, as it does for a ledger entry whose game is back under the cap

#### Scenario: A board with a tier missing from its run

- **WHEN** a board is offered at Easy, Normal and Hard and not at Tricky, or its Hard line stands apart from its other lines
- **THEN** the test fails, naming the board and the tiers it is offered at

#### Scenario: A tier no line offers

- **WHEN** a tiered game's menu holds no board at one of its tiers, and some board of the menu would accept that tier
- **THEN** the test fails unless its ledger names the game and the tier, and it fails for a ledger entry the menu does offer

#### Scenario: A modifier on several lines

- **WHEN** a game's menu holds two boards with one checkbox modifier applied, or none
- **THEN** the test fails, naming the modifier by its words

#### Scenario: A game builds its menu from its boards

- **WHEN** a tiered game calls `presetGrid` with three boards and no options
- **THEN** its menu is those three boards, each at every tier of its difficulty item, easiest first
