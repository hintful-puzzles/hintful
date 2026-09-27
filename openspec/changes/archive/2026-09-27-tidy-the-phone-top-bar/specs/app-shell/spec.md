## MODIFIED Requirements

### Requirement: The solve timer has its own place in the chrome

While a game's timer is on, the app SHALL show the elapsed time at the end of the phone's top
bar, and under the move count in the desktop rail's "Your position" group. It SHALL
be absent, not blank, while the timer is off. The solved message SHALL state the time, and
SHALL say beside it when help was taken on the board. The app SHALL pause the timer while the
page is hidden.

#### Scenario: The timer is off

- **WHEN** a game's timer is off
- **THEN** no timer element takes space in the top bar or the rail

#### Scenario: A helped solve

- **WHEN** a player who used a hint solves a board with the timer on
- **THEN** the solved message reads "Finished in M:SS, with help" rather than "Solved in M:SS"

## ADDED Requirements

### Requirement: The phone's top bar is one row of readouts, and the chips give way first

The phone's top bar SHALL hold the back link, the game's name, the type chips and, while it is on, the
timer, on one row that does not overflow at 320 CSS px. The move counter SHALL NOT appear in
it; on a phone it is in the More sheet's "Your position" group. When the row is short of
space, the chips SHALL be clipped before the game's name, and no chip SHALL draw outside its
own box.

#### Scenario: A long preset title on a narrow phone

- **WHEN** a game whose preset title is "Size 9 Hexagon Hard" is open at 320 px with the timer on
- **THEN** the row does not overflow, the name is shown whole, and the chip is clipped with an ellipsis rather than running under the timer

### Requirement: A menu in the More sheet stays open until a choice is made in it

A menu trigger inside the phone's More sheet SHALL NOT also be a command, because a command
chosen from the sheet closes it and takes the menu with it. A choice made in such a menu SHALL
close the sheet, as a command chosen from it does.

#### Scenario: Jumping to a checkpoint from the sheet

- **WHEN** the player opens More, taps the move counter, and picks a checkpoint
- **THEN** the timeline stays open until the pick, and the pick closes the sheet
