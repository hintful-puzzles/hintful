## MODIFIED Requirements

### Requirement: Rectangles offers an explained hint that reads only the board

Rectangles SHALL offer a hint whose every step draws one rectangle or one line
and says why it is forced, reasoning only from the clues and the lines drawn.
A clue's fits are the rectangles of its area that contain it, stay on the
board, take in no other clue and cross no drawn line. A step SHALL be one of:
a clue with one fit; a square only one clue's fits reach, with one of those
fits covering it; squares every fit of another clue covers, leaving a clue one
fit that avoids them; a fit that would leave another clue no fit or a square no
fit covers, when one fit remains; or an edge that some fit crosses and that
every fit across it is ruled out for, drawn as a line. A fit across an edge is
ruled out when it takes a square every fit of another clue covers, or leaves
out a square no other clue's fits reach, and the step's words SHALL name the
clues that could cross the edge and why they cannot. An edge no fit crosses
SHALL NOT be a step, since a line there changes no fit. The rectangle a step
draws SHALL be ringed as the contour of its squares, and the hint SHALL refuse
on a board with a wrong line.

#### Scenario: A clue with one fit

- **WHEN** every other rectangle of a clue's area around it runs off the board,
  takes in another clue or crosses a line
- **THEN** the hint rings the one that fits and names what rules out the others,
  outlining any clue it would take in

#### Scenario: The player draws the rectangle a side at a time

- **WHEN** the displayed step draws a rectangle and the player draws one of its
  sides
- **THEN** the step stays displayed, and it completes when the last side is
  drawn

#### Scenario: A line records a fit that is ruled out

- **WHEN** the only fits across an edge are one clue's, and each takes a square
  another clue covers wherever it goes
- **THEN** the hint rings the edge, outlines both clues, stripes the square, and
  draws the edge as a line, after which no fit crosses it

#### Scenario: Upstream's 10x10 board is hinted to the end

- **WHEN** the hint is followed on `10x10e0.5:a3c4b3g2_3f16_12n4i4c5b3g21m8h4a4e4c`
- **THEN** it finishes the board, one of its steps a line, and the generator
  returns that board for upstream's seed

### Requirement: Rectangles game implements the Game interface

The engine SHALL provide a registered `rect` game implementing
`Game<RectParams, RectState, RectMove, RectUi, RectDrawState, RectMistake>`:
divide a `w × h` grid into rectangles so that every rectangle contains exactly
one numbered square and its area equals that number. Params SHALL be `w`, `h`
and `expandfactor` (a non-negative float, default 0), encoded `{w}x{h}` with a
full-form `e{%g}` expansion-factor suffix when non-zero (square shorthand
`{n}`). Decoding SHALL read past upstream's trailing `a`, which asks for a
board with no promised single answer, and encoding SHALL never write it. All 7
upstream presets (7×7, 9×9, 11×11, 13×13, 15×15, 17×17, 19×19)
SHALL be offered. `validateParams` SHALL enforce `w > 0`, `h > 0`, `w*h ≥ 2`,
and a non-negative expansion factor. The game SHALL provide `solve` and `textFormat`, and SHALL drive a completion flash suppressed
after Solve. The game SHALL implement `finishesByDeduction` as its solver
reaching a unique placement from the board's numbers and its hint's steps
finishing the board, so that a board that loads is one its hint finishes.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, expandfactor: 0.5 }` are encoded in full
- **THEN** the result is `10x10e0.5` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a grid whose area is less than 2, or a
  negative expansion factor
- **THEN** it returns a non-null error string

#### Scenario: Upstream's unchecked-board letter

- **WHEN** `9x7a` is decoded
- **THEN** the params are those of `9x7`, and a board dealt from them has one
  solution

#### Scenario: A board past the hint does not load

- **WHEN** `9x9:c4c5b9c12b2h2k12e2f2_3c12a8l3d5d` is loaded, a board the solver
  settles by ruling placements out that no line can record
- **THEN** loading refuses it as not deducible
