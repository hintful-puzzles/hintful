## ADDED Requirements

### Requirement: Look: Two shaded squares that touch only each other are one domino

`redraw` SHALL draw two shaded squares that are beside each other and beside
no other shaded square as one domino, the engine's piece over two cells, with
a divider in the board's color. The domino SHALL cover the line or region wall
between its halves. A shaded square beside two or more others SHALL be drawn
as a piece of its own.

#### Scenario: A domino across a region wall

- **WHEN** two shaded squares in different regions touch only each other
- **THEN** they are drawn as one tile over the wall between them

#### Scenario: A run of three is no domino

- **WHEN** three shaded squares are in a row
- **THEN** each is drawn as a piece of its own

### Requirement: Preferences: A shaded square brings the crosses it rules out

Norinori SHALL declare what a placement rules out: the open squares beside a
domino the move completes, and the rest of a region the move gives its second
shaded square.

#### Scenario: Completing a domino with the preference on

- **WHEN** the auto-cross preference is on and the player shades the second
  square of a domino
- **THEN** every open square beside the domino is crossed out, in the same
  step of Undo
