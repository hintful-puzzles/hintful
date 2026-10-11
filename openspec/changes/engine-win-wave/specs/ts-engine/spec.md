## MODIFIED Requirements

### Requirement: The win flash plays on a forward move that solves the board

The win flash SHALL play on a forward move, other than the Solve command, that
leaves the board solved when it was not. A game SHALL NOT give it a length. A
game's `flashLength` SHALL be only for a flash the status does not show, and a
nonzero answer from it SHALL replace the win flash.

#### Scenario: The Solve command does not celebrate

- **WHEN** the Solve command completes the board
- **THEN** no flash plays, and the status is solved-with-help

#### Scenario: A hand solve after a Solve celebrates

- **WHEN** a player uses Solve, moves off the solution and completes the board
  by hand
- **THEN** the flash plays, and the status is still solved-with-help

#### Scenario: A broken solved board solved again celebrates again

- **WHEN** a player breaks a solved board and solves it again by hand
- **THEN** the flash plays again; undoing the break does not flash

## ADDED Requirements

### Requirement: The win flash is one traveling highlight in every game

The win flash SHALL be a highlight that travels the board's elements in the
order of their positions, lowest first. It SHALL last the same time on every
board of every game, light every element once for one stretch, and leave the
last element dark as it ends. The highlight SHALL cover a fixed share of the
route and never less than one step. It SHALL start when the winning move's own
animation has ended.

#### Scenario: A large board and a small one

- **WHEN** a 3x3 board and a 30x30 board of one game are won
- **THEN** both flashes last the same time, and at no moment between the first
  element lighting and the last going dark is the small board wholly unlit

#### Scenario: A win by a move that slides a tile

- **WHEN** the winning move animates
- **THEN** no element is lit until the tile has come to rest

### Requirement: The highlight leads in one color and follows in another

The highlight SHALL have two tones that travel together: a leading edge, a
fixed and smaller share of it, and a body behind. An element SHALL show the
lead as the highlight reaches it and the body after, on a route of any length.
The lead SHALL be the `FLASH_LEAD` role and the body the `FLASH` role, so that
an element resting in one of the two colors is seen under the other.

#### Scenario: A field of the body's color

- **WHEN** a board whose every element rests in the body's color is won
- **THEN** the leading edge is seen crossing it

#### Scenario: A route one step long

- **WHEN** a board with a single element is won
- **THEN** that element shows the lead's color and then the body's

### Requirement: A game gives each element a position, and the route is which position it gives

A game SHALL ask `Flash.win(position)` for each element it can light and paint
the element in the tone it answers. The position SHALL be its step from the
start where the board holds a path, its step clockwise from the bottom-left
corner where it holds a loop (`loopSteps`), its distance from the source where
it holds a network fed from one, and `sweepStep` of its center otherwise: a
diagonal from the bottom left to the top right.

#### Scenario: A board with no grid

- **WHEN** a game whose elements are points or regions is won
- **THEN** the sweep crosses them by where each is drawn, bottom left first

#### Scenario: A loop that does not touch the bottom row's left end

- **WHEN** a loop is won whose lowest row is reached only on the right
- **THEN** the highlight starts at the element of the loop nearest the board's
  bottom-left corner and leaves it clockwise as the player sees it

### Requirement: A player who asked for reduced motion sees a still win flash

Where the player's system asks for reduced motion, the win flash SHALL light
every element at once for a shorter time and SHALL NOT travel.

#### Scenario: The same win under reduced motion

- **WHEN** a board is won with reduced motion requested
- **THEN** every frame of the flash lights either every element or none, the
  whole board in the lead's color and then in the body's
