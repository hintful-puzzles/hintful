# blackbox Specification

## Purpose
Black Box, the puzzle of locating balls hidden in a rectangular arena by firing
lasers in from its edge and reading whether each one hits a ball, is reflected
back, or emerges, and where. Every reveal and every verdict on the player's
guess rests on its deterministic laser tracing.

## Requirements

### Requirement: Black Box game implements the Game interface

The engine SHALL provide a registered `blackbox` game implementing the `Game`
interface with `BlackboxParams`, `BlackboxState`, `BlackboxMove`, `BlackboxUi`,
`BlackboxDrawState` and `Point`: a deduction puzzle in which the player locates
hidden balls in a `w`×`h` arena by firing lasers from the surrounding range and
observing how they hit, reflect, or exit. The game SHALL provide
`statusbarText`, `solve`, `hint` and `findMistakes`, and SHALL NOT provide
`textFormat`.

#### Scenario: The game is registered

- **WHEN** the registry is asked for `blackbox`
- **THEN** it returns the game, with a `hint`, a `solve`, a `findMistakes` and a
  `statusbarText`
- **AND** the game has no `textFormat`

### Requirement: Black Box params are a size and a ball range

Params SHALL be `w`, `h`, `minballs` and `maxballs`, encoded
`w{w}h{h}m{minballs}M{maxballs}`. The decode SHALL be lenient: a letter it does
not know is ignored.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 8, h: 8, minballs: 3, maxballs: 6 }` are encoded
- **THEN** the result is `w8h8m3M6`
- **AND** decoding `w8h8m3M6` round-trips those params

### Requirement: Black Box offers its presets

The presets offered SHALL be `5×5, 3 balls`, `8×8, 5 balls`, `8×8, 3-6 balls`,
`10×10, 5 balls` and `10×10, 4-10 balls`.

#### Scenario: A preset with a range of balls

- **WHEN** the preset menu is read
- **THEN** it holds an 8×8 box with `minballs` 3 and `maxballs` 6
- **AND** an 8×8 box with `minballs` and `maxballs` both 5

### Requirement: The type summary names the size and the ball count

The preset and custom type summary SHALL read `{w}x{h}, {n} balls` for a fixed
count, `{w}x{h}, {min}-{max} balls` for a range, and `ball` in the singular for
a count of exactly one. Its ball count SHALL be the label of the params field
whose keyword is `no-of-balls`, so the summary and the Custom dialog read one
declaration.

#### Scenario: The ball-count type summary reflects a range

- **WHEN** params `w8h8m3M6` are described for the type summary
- **THEN** the `no-of-balls` field reads `3-6` and the summary is
  `8x8, 3-6 balls`
- **AND** for `w8h8m5M5` the field reads `5` and the summary is `8x8, 5 balls`

### Requirement: Black Box refuses params that cannot be played

A `w` or an `h` below 2 or above 255 SHALL be refused, by the bounds the size
fields declare. `validateParams` SHALL reject `minballs < 1`,
`minballs > maxballs`, and `minballs >= w*h`.

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `minballs: 0`, or with
  `minballs > maxballs`, or with `minballs >= w*h`
- **THEN** it returns a non-null error string

#### Scenario: A box too narrow

- **WHEN** params with `w: 1` are checked
- **THEN** they are refused

### Requirement: Only a deal is bound by the ball limit

`validateParams` SHALL reject `maxballs` above `ballLimit(w, h)`, and SHALL do
so only when the params are about to deal a board. Params that arrive with
their board SHALL NOT be held to the limit.

#### Scenario: One ball past the limit

- **WHEN** `validateParams` is given an 8×8 box whose `maxballs` is one more
  than `ballLimit(8, 8)`, about to deal a board
- **THEN** it returns a non-null error string
- **AND** given the same params arriving with a board, it returns null

### Requirement: Black Box descriptions are obfuscated ball-layout bitmaps

A desc SHALL encode `[w, h, ball1x, ball1y, …]` as a byte-per-value bitmap,
apply the shared `obfuscateBitmap` SHA-1 masking, and hex-encode the result
(`encodeBalls`). `newState` SHALL recover the ball layout by hex-decoding and
de-obfuscating the desc. The shared codec SHALL live at
`src/engine/obfuscate.ts`.

#### Scenario: A description round-trips through obfuscation

- **WHEN** a generated desc is decoded by `newState`
- **THEN** the recovered ball cells are the balls the generator placed, as many
  as the params allow

### Requirement: A damaged Black Box description is refused

The verdict on a desc SHALL reject one of wrong length, one whose de-obfuscated
header mismatches `w` or `h`, and one whose ball coordinates fall outside the
arena.

#### Scenario: A corrupted description is rejected

- **WHEN** a desc of the wrong length is validated, or one that de-obfuscates
  to a ball outside the arena
- **THEN** the verdict is a non-null error

### Requirement: A laser's entry is judged before it moves

For a beam entering at a range cell in a given direction, the laser engine
SHALL return an **instant hit** when a ball sits directly ahead of the entry
cell, and an **instant reflection** when a ball sits diagonally ahead-left or
ahead-right of the entry cell. A hit SHALL be prioritized over a reflection.

#### Scenario: A head-on ball produces a hit

- **WHEN** a laser is fired directly at a ball with no earlier deflection
- **THEN** the result is a hit (the entry cell shows `H`)

#### Scenario: An adjacent ball reflects the beam at entry

- **WHEN** a laser enters a cell with a ball diagonally ahead of the entry point
- **THEN** the result is an instant reflection (the entry cell shows `R`)

### Requirement: Black Box traces lasers through the arena deterministically

A beam that is neither an instant hit nor an instant reflection SHALL step
forward, turning clockwise when a ball is ahead-left and anticlockwise when a
ball is ahead-right. The laser engine SHALL return **hit** when a ball is
directly ahead, **reflect** when the beam exits its own entry cell, and
otherwise the exit range index.

#### Scenario: A clear beam exits the far side

- **WHEN** a laser is fired across an arena with no ball in its path
- **THEN** it exits at the opposite range cell

### Requirement: A laser that exits numbers both its ends

A fired laser that neither hits nor reflects SHALL number its entry and exit
cells with a shared incrementing laser number.

#### Scenario: A clear beam pairs its endpoints

- **WHEN** a laser is fired across an arena with no ball in its path
- **THEN** both the entry and exit cells carry the same laser number

### Requirement: Black Box marks, fires, locks, and reveals via moves

A `BlackboxMove` SHALL be one of: toggle a guessed ball at an arena cell, toggle
a per-cell lock, lock or unlock a whole column or row, fire a laser at a range
cell, reveal (verify) the current guesses, or solve (guess the real balls and
reveal). `executeMove` SHALL be pure, returning a new state, and SHALL reject
an illegal move by throwing.

#### Scenario: A move leaves its state alone

- **WHEN** `executeMove` applies a toggle-ball to a state
- **THEN** the state it was given is unchanged and the new one holds the ball

### Requirement: A ball toggle updates the guess count, and a locked cell takes none

Toggling a ball SHALL update the guess count. A locked cell SHALL offer no ball
toggle: the primary action on it makes no move.

#### Scenario: Toggling a ball updates the guess count

- **WHEN** `executeMove` applies a toggle-ball on an empty unlocked arena cell
- **THEN** the new state has a guessed ball there and `nguesses` incremented
- **AND** applying the same toggle again removes it and decrements `nguesses`

#### Scenario: A click on a locked cell

- **WHEN** the player clicks an arena cell that is locked
- **THEN** no move is made

### Requirement: A laser is fired once

`executeMove` SHALL reject firing a laser that is already fired.

#### Scenario: Firing a laser records its result

- **WHEN** `executeMove` applies a fire on an un-fired range cell
- **THEN** the new state's `exits` for that range index is no longer empty
- **AND** a second fire on that range cell throws

### Requirement: A reveal is gated on the ball count

Revealing SHALL be allowed only when the guess count is within
`[minballs, maxballs]`.

#### Scenario: Reveal is gated on the ball count

- **WHEN** the guess count is below `minballs`
- **THEN** a reveal move is rejected (throws)

### Requirement: A line lock follows the majority of its cells

A whole-column or whole-row lock SHALL unlock every cell of the line when more
than half of them are locked, and otherwise lock every cell.

#### Scenario: A row half locked

- **WHEN** a row lock is applied to a row with exactly half its cells locked
- **THEN** every cell of the row is locked

### Requirement: A verify shows one laser that tells the guess from the answer

The verify (reveal) move SHALL run `checkGuesses`, which compares the player's
guessed layout with the real one by the lasers. When the player's already-fired
lasers contradict their guess, or an un-fired laser would have distinguished
the layouts, it SHALL flag one such laser, deterministically chosen from the
current grid, and set `justwrong` without revealing.

#### Scenario: An inconsistent verify shows one error and does not reveal

- **WHEN** the player verifies a guess that a fired laser contradicts
- **THEN** `justwrong` is set, exactly one laser is flagged wrong, and the full
  layout is not revealed

### Requirement: A guess no laser tells from the answer is accepted

When no fired laser contradicts the guess and no un-fired laser would have
distinguished the layouts, every laser goes where the real layout sends it, so
the guess is the answer: the verify SHALL accept the guesses as the real balls
and reveal.

#### Scenario: A correct reveal is solved

- **WHEN** the guessed balls exactly match the real layout and the player
  verifies
- **THEN** the arena is revealed and `status` returns `"solved"`

### Requirement: Solve guesses the real balls and reveals

Solve SHALL guess exactly the real balls and reveal.

#### Scenario: Solve replaces the guesses with the answer

- **WHEN** the player invokes Solve with some balls guessed wrongly
- **THEN** the guesses become exactly the real balls, the arena is revealed, and
  `status` returns `"solved"`

### Requirement: Black Box verifies guesses, and a reveal is a win

`status` SHALL return `"solved"` when revealed and `"ongoing"` before. A reveal
SHALL only ever be of a guess proven to be the answer, or Solve's, so a Black
Box board is never lost. On a reveal the game's own status text SHALL NOT
announce the win, which is the engine's to announce: it holds only the session
error count, when there is one.

#### Scenario: The status text after a win

- **WHEN** the player verifies the right balls, with no wrong verify before
- **THEN** `status` returns `"solved"` and `statusbarText` is empty

### Requirement: A wrong verify is counted for the session

A wrong verify SHALL increment a session error counter shown in the status
bar.

#### Scenario: A wrong verify is counted

- **WHEN** the player verifies a guess that a fired laser contradicts
- **THEN** the session error counter increments and the status bar shows it

### Requirement: Black Box's hint SHALL reason only from the lasers fired

Black Box SHALL provide a `hint` that reads only what the player can see: the
lasers fired, where they went and the marks on the box. It SHALL NOT read the
hidden balls, so two boards whose balls send every fired laser the same way get
the same plan.

#### Scenario: The hint gives nothing away

- **WHEN** a hidden ball is moved to another square and every fired laser still goes where it
  went
- **THEN** the hint's plan is unchanged

### Requirement: The hint's steps only add marks

The hint's steps SHALL only ever add marks. The midend asks it only about a
board whose marks the check passes, so no mark it meets is wrong.

#### Scenario: A board with marks on it

- **WHEN** the hint is asked about a board with guessed balls and known squares
  that the check passes
- **THEN** no step takes a ball off or unmarks a known square

### Requirement: A fired laser settles the first unsettled square on its path

The hint SHALL settle a square by following a fired laser through the squares
already settled to the first one nothing has settled, and concluding that the
square holds what does not send the laser somewhere it did not go. A laser that
came out at a numbered square SHALL be followed from either end.

#### Scenario: A square a laser settles

- **WHEN** a fired laser came out at its other numbered end, and a ball on the first unsettled
  square along its path would keep any ray from running between those ends
- **THEN** the step rings that square, outlines both ends, says the square must be empty, and
  marks it known

### Requirement: A settled square is shown by a mark, in one step

A settled empty square SHALL be shown by marking it known and a settled ball by
guessing it, in one step that rings the square and outlines the laser's ends.

#### Scenario: A settled ball

- **WHEN** a fired laser settles that a square holds a ball
- **THEN** one step guesses a ball there, ringing the square and outlining the
  ends of that laser

### Requirement: When nothing more settles, the hint asks for a laser

When no fired laser settles another square, the hint SHALL ask for a laser
whose path still depends on unsettled squares.

#### Scenario: Nothing settles

- **WHEN** no fired laser settles a square and some laser's path still runs through unsettled
  squares
- **THEN** the step rings one such laser and asks the player to fire it

### Requirement: With every laser fired, the hint offers a layout it searched for

When every laser is fired and none settles a square on its own, the hint SHALL
offer balls that send every laser where it went, found by a bounded search that
keeps the player's marks. Past the search's budget it SHALL refuse with
`SEARCH_OUT_OF_REACH`.

#### Scenario: A search past its budget

- **WHEN** every laser is fired, none settles a square on its own, and the
  search runs past its budget
- **THEN** the hint refuses with `SEARCH_OUT_OF_REACH`

### Requirement: The hint ends by placing unreached balls and asking for a check

Once every laser's path is settled by the balls on the board, the hint SHALL
put any balls the count still requires on squares no laser reaches, and then
ask the player to check the answer.

#### Scenario: Following the hint wins

- **WHEN** the player follows every step from a dealt board of any preset
- **THEN** the answer is checked and accepted

### Requirement: Black Box plays only boards with one answer

A Black Box board's answers SHALL be the layouts, within the params' ball count,
that send every laser, fired or not, where its real balls do. They SHALL be
counted by the hint's own layout search with every laser fired, and the count
SHALL agree with trying every layout on boards small enough to try.

#### Scenario: A count against every layout

- **WHEN** a board small enough to try every layout is counted
- **THEN** the count says one answer exactly when trying every layout finds one

### Requirement: A board is dealt a ball at a time

`newDesc` SHALL deal only a board with one answer, built a ball at a time: each
ball goes on a random free square where the board so far has one answer at its
count, and the last is judged against the params' whole range. When no square
of a bounded number of tries keeps one answer, the build SHALL start again.

#### Scenario: A dealt board

- **WHEN** a board is dealt for any preset
- **THEN** its answer count is one

### Requirement: A board with several answers does not load

`solve` SHALL say `MULTIPLE_SOLUTIONS` for a board the count proves has several
answers, so that such a board does not load.

#### Scenario: Four corners hide the middle

- **WHEN** a 3×3 game ID with balls on its four corners is opened under a count
  of 4 to 5 balls
- **THEN** it is refused as having more than one solution, and under a count of
  exactly 4 it loads

### Requirement: A count past its budget settles nothing

A count of answers that runs past its budget SHALL settle nothing: the
generator builds again, and a loaded board loads.

#### Scenario: A loaded board the count cannot finish

- **WHEN** a game ID is opened whose answer count runs past its budget
- **THEN** `solve` does not say `MULTIPLE_SOLUTIONS` and the board loads

### Requirement: Black Box checks marks against its answer

Black Box SHALL implement `findMistakes`, reporting every guessed ball on a
square with no ball and every square marked known that holds a ball, and
nothing once the answer is revealed.

#### Scenario: Right marks pass

- **WHEN** every guess is on a ball and every known mark on an empty square
- **THEN** `findMistakes` reports nothing

### Requirement: A mistake is framed in the error color

A mistake SHALL be drawn as a frame in the error color inside the square, held
in the tile's cache key so it repaints when it comes and goes.

#### Scenario: Check & Save with a wrong guess

- **WHEN** the player runs Check & Save with a ball guessed on an empty square
- **THEN** that square is framed as a mistake and the board is not saved

### Requirement: Black Box draws its balls as pieces and lifts what is settled

`redraw` SHALL draw the board as pieces on a quiet surface, with no bevel. A
square of the box SHALL be the plain cell surface, and the line between two
squares SHALL be the surface's grid line, which each square carries on all four
sides so the board needs no frame.

#### Scenario: A covered box is the cell surface

- **WHEN** a new board is drawn, before any move
- **THEN** every square of the box is the plain cell surface
- **AND** no square is the lifted surface

### Requirement: A guessed ball is the disc piece

A guessed ball SHALL be the collection's disc piece, inset on its square, in a
color that none of the marks drawn on the board uses.

#### Scenario: A ball is a piece

- **WHEN** the player puts a ball on a square
- **THEN** the square holds a disc in the ball's color, inset on its surface

### Requirement: What is settled sits on the lifted surface

What is settled SHALL sit on the lifted surface: a square marked as known, a
laser square once it has been fired, and every square of the box after a
reveal. A laser square not yet fired SHALL be the board's own color inside its
grid line.

#### Scenario: A fired laser square is lifted

- **WHEN** a laser is fired
- **THEN** the square it entered, and the square it left by if any, are the
  lifted surface under their letter or number
- **AND** the laser squares not fired are not

### Requirement: A known square with no ball holds the ruled-out cross

Until the reveal, a square marked as known that holds no ball SHALL also hold
the collection's ruled-out cross, so that being marked is never told by a step
of gray alone.

#### Scenario: A known square is lifted and marked

- **WHEN** the player marks an empty square as known
- **THEN** the square is the lifted surface and holds the ruled-out cross
- **AND** a ball on a square marked as known sits on the lifted surface with
  no cross

### Requirement: The cursor and the marks keep clear of a ball

The keyboard cursor SHALL be drawn at the corners of its square, beside a ball,
and SHALL NOT recolor it. A hint's ring and outline and a mistake's frame SHALL
sit at the edge of the square's surface.

#### Scenario: The cursor on a ball

- **WHEN** the keyboard cursor is on a square that holds a guessed ball
- **THEN** the cursor is drawn at the square's corners and the disc keeps the
  ball's color

### Requirement: Black Box swaps no palette for the dark scheme and names no hue for a ball

The game SHALL declare no palette swap for the dark scheme, and its hint
sentences and help page SHALL name no hue for a ball.

#### Scenario: A hint about a ball

- **WHEN** a hint step puts a ball on a square
- **THEN** its sentence says "a ball" and names no color
