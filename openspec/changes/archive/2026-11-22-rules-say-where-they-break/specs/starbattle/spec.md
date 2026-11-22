## ADDED Requirements

### Requirement: Look: A star or cross is red where the board breaks a rule

`redraw` SHALL draw in the error color each star or cross where the board
breaks a rule (`Game.rules`): each of two stars that touch, every star of a
row, column or region holding too many, and every cross of a row, column or
region its crosses leave no room for its stars.

#### Scenario: Two stars touch

- **WHEN** two stars touch at a corner
- **THEN** both are drawn in the error color

#### Scenario: A row crossed out

- **WHEN** every square of a row holds a cross
- **THEN** each cross is drawn in the error color
