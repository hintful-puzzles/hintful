## MODIFIED Requirements

### Requirement: The readouts are one row, and the chips give way first

The puzzle screen SHALL hold the back link, the game's name, the type chips and, while it is on, the
timer, on one row above the board at every window size, which does not overflow at 320 CSS px.
The row holds readouts and the ways to another puzzle, and no command on the board. The game's
name SHALL be a button inside the page's heading that opens the quick-switch, the same one the
Menu's `Switch puzzle…` row opens, and SHALL show a mark that says it opens something. The move
counter SHALL NOT appear in the row; it is the timeline's control, in the Menu's Board group.
When the row is short of space, the chips SHALL be clipped before the game's name, and no chip
SHALL draw outside its own box. The back link SHALL show its words where the window is wide, and
its icon alone elsewhere, with the words as its accessible name.

#### Scenario: A long preset title on a narrow phone

- **WHEN** a game whose preset title is "Size 9 Hexagon Hard" is open at 320 px with the timer on
- **THEN** the row does not overflow, the name is shown whole, and the chip is clipped with an ellipsis rather than running under the timer

#### Scenario: The name opens the quick-switch

- **WHEN** the player taps or clicks the game's name above the board
- **THEN** the quick-switch opens, as it does from the Menu's `Switch puzzle…` row
