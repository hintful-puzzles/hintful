# rect Specification

## Purpose
Rectangles (Shikaku), the puzzle of dividing a grid into rectangles that each
contain exactly one number, equal to its area. This capability specifies its
port to the TS engine: its encoding, the solver and the generator gated on it
unless uniqueness is turned off, completion and mistake reporting, and its input
and rendering.

## Requirements

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
reaching a unique placement from the board's numbers.

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

### Requirement: Rectangles descriptions use the upstream encoding

The desc SHALL encode the `w × h` grid row-major as a run-length string: a
lowercase-run character `a`–`z` compressing 1–26 consecutive empty (non-numbered)
squares, an optional `_` separator, and a decimal number for each numbered
square. `validateDesc` SHALL reject unknown characters and a description whose
decoded square count does not exactly fill the grid. `newState` SHALL parse the
desc into the immutable grid of numbers, with all edges initially clear and the
correctness overlay computed.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with too much or too little data to
  fill the grid
- **THEN** it returns a non-null error string

### Requirement: Rectangles reports completion and mistakes

The game SHALL compute per-cell correctness as `get_correct` does: a cell
is correct iff it belongs to a valid rectangle — all boundary edges present,
none interior, and exactly one contained number equal to the rectangle's area.
The board is completed when every cell is correct. Because boards are uniquely
solvable, the game SHALL implement `findMistakes`: re-solve from the numbers to
the unique solution's edges and return every edge the player has drawn that the
unique solution does not contain (a definite mistake); a *missing* edge is not a
mistake, and a non-uniquely-solvable board yields no mistakes. Check & Save
depends on this hook and SHALL refuse to save while any mistake is present.

#### Scenario: A wall the solution does not contain is flagged

- **WHEN** the player has drawn an edge that the unique solution does not
  contain, and `findMistakes` is invoked
- **THEN** that edge is returned as a mistake

#### Scenario: A correct partial board has no mistakes

- **WHEN** the player has drawn only edges that the unique solution contains
- **THEN** `findMistakes` returns an empty result

### Requirement: Rectangles input and rendering

`interpretMove` SHALL support: a left-drag drawing a rectangle outline, a
right-drag erasing interior edges, a click near an edge toggling that single
edge, and a half-grid keyboard cursor with press-to-drag — with the
corner/center/edge click allocation of `coord_round`. A drag or
click that changes no edge SHALL produce no move. `redraw` SHALL render the grid,
number text, the three edge colors (black solid line, red drag-draw preview,
blue drag-erase preview), the computed corner pixels, the gray correct-rectangle
fill, the cursor tile, the flagged-mistake edge color, and the completion
flash, with a `BORDER` of 1 (NARROW_BORDERS).

#### Scenario: A drag draws a rectangle outline

- **WHEN** the player left-drags from one grid vertex to another spanning a
  rectangle
- **THEN** `interpretMove` yields a rectangle move whose execution sets the four
  boundary edges of that rectangle and clears its interior edges

#### Scenario: A no-op click yields no move

- **WHEN** the player clicks in a way that would change no edge
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

### Requirement: Rectangles ports the solver and solver-gated generator

The port SHALL implement `rect_solver` with its full deductive power:
per-rectangle candidate-placement enumeration, the overlaps and `rectbyplace`
bookkeeping, and the deduction loop (sole-remaining-number-position marking,
placement-intersection marking, rectangle-focused and square-focused placement
elimination), plus the RNG-driven number-placement winnowing used during
generation. The generator (`new_game_desc`) SHALL tile the base grid at random,
remove singletons, stretch it with the two-pass expand-and-transpose, call the
solver on every layout, and encode the run-length desc. `solve` SHALL run the solver from the fixed
numbers and return the unique solution's edges (or the generator's `aux` when
present).

#### Scenario: Generated boards are uniquely solvable

- **WHEN** a board is generated and solved from its numbers
- **THEN** the solver reaches a single consistent rectangle placement for every
  number

### Requirement: Rectangles offers an explained hint that reads only the board

Rectangles SHALL offer a hint whose every step draws one rectangle or one line
and says why it is forced, reasoning only from the clues and the lines drawn.
A clue's fits are the rectangles of its area that contain it, stay on the
board, take in no other clue and cross no drawn line. A step SHALL be one of:
a clue with one fit; a square only one clue's fits reach, with one of those
fits covering it; squares every fit of another clue covers, leaving a clue one
fit that avoids them; a fit that would leave another clue no fit or a square no
fit covers, when one fit remains; or an edge no fit straddles, drawn as a line.
The rectangle a step draws SHALL be ringed as the contour of its squares, and
the hint SHALL refuse on a board with a wrong line.

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

### Requirement: Rectangles deals only boards its hint can finish

The generator SHALL deal only boards the hint's steps finish from an empty
board, dealing again where a board it laid out would leave them short. Such a
seed's desc SHALL differ from upstream's.

#### Scenario: A board past the hint is dealt again

- **WHEN** the generator lays out a uniquely solvable board the hint's steps
  cannot finish
- **THEN** it draws another board instead of returning that one
