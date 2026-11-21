## MODIFIED Requirements

### Requirement: A grid too large for a game is refused in one sentence

The engine SHALL hold every board to one area, `MAX_BOARD_AREA`, a 100×100
board: `paramsError` SHALL refuse a larger `area` its width declares, dealt or
loaded, before `validateParams`, as "Width times height must be at most
10000.", and the help SHALL state it. A game whose logic needs less SHALL
declare a smaller `area` (`maxArea`), saying why. Only a board that is no
product of two fields, as Cube's triangles, SHALL be held in `validateParams`.

#### Scenario: The same largest board in two games

- **WHEN** Net and Mines are each asked for a 100×100 and a 101×100 board
- **THEN** both admit the first and refuse the second with "Width times height
  must be at most 10000."

#### Scenario: Two games with different ceilings

- **WHEN** Net is asked for a 101×100 board and Ascent, whose typed numbers
  stop at three digits, for a 40×25 one
- **THEN** Net refuses with "Width times height must be at most 10000." and
  Ascent with "Width times height must be at most 999."

#### Scenario: A ceiling a player meets

- **WHEN** Slide, whose solver exhausts the heap past 48 squares, is asked for
  a 9×6 board
- **THEN** it refuses with "Width times height must be at most 48.", from the
  `area` its width declares

#### Scenario: A board's sides under other names

- **WHEN** a game's two sides are not width and height, as Guess's pegs per
  guess and guesses are
- **THEN** the first field declares `area` naming the second, and the sentence
  names both: "Pegs per guess times guesses must be at most 10000."

#### Scenario: A game sized by one number

- **WHEN** a game's board is sized by one number, as Salad's order and
  Dominosa's highest number are
- **THEN** that field's `bounds` hold a `max` derived from `MAX_BOARD_AREA`,
  so its largest board is no larger than any other game's

### Requirement: A limit on a typed number stays in validateParams

A limit on a typed number that depends on another field (a size a tier needs)
SHALL NOT be declared with `only` and SHALL stay in the game's
`validateParams`: a text field cannot show it before OK is pressed, so there is
no second copy for a declaration to remove.

#### Scenario: A ruleset allows a smaller area

- **WHEN** one ruleset of a game allows a smaller board area than another
- **THEN** the game's `validateParams` refuses the larger area in that ruleset,
  and the Custom dialog disables nothing for it
